"use server";

import { ID, Models, Query } from "node-appwrite";
import {
  databases,
  DATABASE_ID,
  ASSISTANT_COLLECTION_ID,
  storage,
  BUCKET_ID,
  ENDPOINT,
  PROJECT_ID,
  APPOINTMENT_COLLECTION_ID,
} from "@/lib/appwrite.config";
import { InputFile } from "node-appwrite/file";
import { generatePasskey } from "../utils/generatePasskey";
import { generatePasskeyPDF } from "../utils/generatePasskeyPDF";
import { sendEmailWithPDF } from "./sendEmailwithPDF";
import { getDoctorById } from "./doctor.action";

type AssistantParams = {
  name: string;
  email: string;
  phone: string;
  address: string;
  logoUrl: string;
  logoId: string;
  logo?:string;
};

export const registerAssistant = async (AssistantData: AssistantParams, logoFile?:File) => {
  try {
    const assistantId = ID.unique();
    let logoResult;
    if (logoFile) {
      const arrayBuffer = await logoFile.arrayBuffer();
      const inputFile = InputFile.fromBuffer(Buffer.from(arrayBuffer), logoFile.name);
      logoResult = await storage.createFile(BUCKET_ID!, ID.unique(), inputFile);
    }  
    const passkey = generatePasskey();
    const labPassword = 'ASSIT' + AssistantData.name.slice(0, 2).toUpperCase();
    const newAssistant = await databases.createDocument(
      DATABASE_ID!,
      ASSISTANT_COLLECTION_ID!,
      assistantId,
      { ...AssistantData ,
          logoUrl: logoResult
          ? `${ENDPOINT}/storage/buckets/${BUCKET_ID}/files/${logoResult.$id}/view?project=${PROJECT_ID}`
          : null,
        logoId: logoResult?.$id ?? null,
        logo: logoResult?.name ?? null,
        passkey : passkey,
      }
    );

    const AssistantPDF = await generatePasskeyPDF({
        name: AssistantData.name,
        email: AssistantData.email,
        role: "Assistant",
        passkey: passkey,
        password: labPassword,
      });

    await sendEmailWithPDF({
      to: AssistantData.email,
      name: AssistantData.name,
      role: "Assistant",
      pdfBlob: AssistantPDF,    
    });
    
    return { assistant: newAssistant, assistantId };
  } catch (error) {
    console.error("❌ Error creating lab:", error);
    throw error;
  }
};


export const getAssistantsByDoctorId = async (doctorId: string) => {
  try {
    const response = await databases.listDocuments(
      DATABASE_ID!,
      ASSISTANT_COLLECTION_ID!,
      [Query.equal("doctorId", doctorId)]
    );

    return response.documents;
  } catch (error) {
    console.error("Error fetching assistants:", error);
    return [];
  }
};
export const getAssistantsByLabId = async (labId: string) => {
  try {
    const response = await databases.listDocuments(
      DATABASE_ID!,
      ASSISTANT_COLLECTION_ID!,
      [Query.equal("labId", labId)]
    );

    return response.documents;
  } catch (error) {
    console.error("Error fetching assistants:", error);
    return [];
  }
};
export const getAssistantById = async (assistantId: string) => {
  const res = await databases.getDocument(DATABASE_ID!, ASSISTANT_COLLECTION_ID!, assistantId);
    return res;
};



export const getAppointmentsByAssistant = async(assistantId: string) : Promise<Models.DocumentList<Models.Document> | null> => {
  try {
    // Step 1: Fetch assistant document
    const assistantRes = await databases.getDocument(
      DATABASE_ID!,
      ASSISTANT_COLLECTION_ID!,
      assistantId,
    );

    // Step 2: If assistant has doctorId, fetch the doctor document
    if (assistantRes.doctorId) {
      const doctorRes = await getDoctorById(assistantRes.doctorId);

      const doctorName = doctorRes?.Name;
      const hospitalId = doctorRes?.hospitalId;

      if (doctorName && hospitalId) {
        const appointmentsRes = await databases.listDocuments(
          DATABASE_ID!,
          APPOINTMENT_COLLECTION_ID!,
          [
            Query.equal("status", "pending"),
            Query.equal("doctorName", doctorName),
            Query.equal("hospitalId", hospitalId)
          ]
        );

        return appointmentsRes;
      }
      
    }

    // Step 3: If assistant has labId, fetch appointments by labId
    if (assistantRes.labId) {
      const appointmentsRes = await databases.listDocuments(
        DATABASE_ID!,
        APPOINTMENT_COLLECTION_ID!,
        [Query.equal("labId", assistantRes.labId)]
      );

      return appointmentsRes;
    }
    return null

  } catch (error) {
    console.error("❌ Error fetching appointments for assistant:", error);
    return null;
  }
}


export async function sendSMSToPatients(patients: { phone: string }[], message: string) {
  try {
    const uniquePhones = [...new Set(patients.map(p => p.phone))];

    const sendRequests = uniquePhones.map(phone =>
      fetch(`${process.env.NEXT_PUBLIC_SITE_URL}/api/send-sms`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone: `+91${phone}`, message }),
      })
    );

    await Promise.all(sendRequests);
    return true;
  } catch (error) {
    console.error("Failed to send SMS to patients:", error);
    return false;
  }
}

export const updateAssistantPasskey = async (
  assistantId: string,
  updates: { passkey: string }
) => {
  try {
    await databases.updateDocument(
      DATABASE_ID!,
      ASSISTANT_COLLECTION_ID!,
      assistantId,
      updates
    );
  } catch (error) {
    console.error("Failed to update doctor passkey:", error);
    throw error;
  }
};


export const handleResetPasskey = async (assistantId : string) => {
    try {
        const assistant = await getAssistantById(assistantId);
        if (!assistant || !assistant.email || !assistant.name) {
        throw new Error("Assistant info is incomplete");
        }

    // 1. Generate new passkey & password
    const newPasskey = generatePasskey();
    const newPassword = "ASSI" + assistant.name.slice(-2).toUpperCase();

    // 2. Update doctor record in Appwrite
    await updateAssistantPasskey(assistant.$id, {
      passkey: newPasskey,
    });

    // 3. Generate new PDF
    const newPDF = await generatePasskeyPDF({
      name: assistant.name,
      email: assistant.email,
      role: "Assistant",
      passkey: newPasskey,
      password: newPassword,
    });

    // 4. Send email with new PDF
    await sendEmailWithPDF({
      to: assistant.email,
      name: assistant.name,
      role: "Assistant",
      pdfBlob: newPDF,
    });

    return { success: true, message: "New passkey generated and emailed successfully." };
  } catch (err) {
    console.error("Error resetting passkey:", err);
      return { success: false, message: "Failed to reset passkey." };  }

};


export const getAssistantsByHospitalId = async (hospitalId: string) => {
  try {
    const response = await databases.listDocuments(
      DATABASE_ID!,
      ASSISTANT_COLLECTION_ID!,
      [Query.equal("hospitalId", hospitalId)]
    );

    return response.documents;
  } catch (error) {
    console.error("Error fetching assistants by hospitalId:", error);
    return [];
  }
};
