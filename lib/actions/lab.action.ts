"use server";

import { ID, Models, Query } from "node-appwrite";
import {
  databases,
  DATABASE_ID,
  LAB_COLLECTION_ID,
  storage,
  BUCKET_ID,
  ENDPOINT,
  PROJECT_ID,
  APPOINTMENT_COLLECTION_ID,
} from "@/lib/appwrite.config";
import type { LabTest } from "@/lib/constants/lab.constants";
import { InputFile } from "node-appwrite/file";
import { generatePasskey } from "../utils/generatePasskey";
import { generatePasskeyPDF } from "../utils/generatePasskeyPDF";
import { sendEmailWithPDF } from "./sendEmailwithPDF";

type LabParams = {
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  licenseNumber: string;
  logoUrl: string;
  logoId: string;
  logo?:string;
  isVerified: boolean;
  istrueLocation: boolean;
  coordinates: [number, number];
  test: LabTest[];
};

// ✅ Register lab
export const registerLab = async (labData: LabParams, logoFile?:File) => {
  try {
    const labId = ID.unique();
    let logoResult;
    if (logoFile) {
      const arrayBuffer = await logoFile.arrayBuffer();
      const inputFile = InputFile.fromBuffer(Buffer.from(arrayBuffer), logoFile.name);
      logoResult = await storage.createFile(BUCKET_ID!, ID.unique(), inputFile);
    }  
    const passkey = generatePasskey();
    const labPassword = 'LAB' + labData.name.slice(0, 2).toUpperCase();
    const newLab = await databases.createDocument(
      DATABASE_ID!,
      LAB_COLLECTION_ID!,
      labId,
      { ...labData ,
          logoUrl: logoResult
          ? `${ENDPOINT}/storage/buckets/${BUCKET_ID}/files/${logoResult.$id}/view?project=${PROJECT_ID}`
          : null,
        logoId: logoResult?.$id ?? null,
        logo: logoResult?.name ?? null,
        passkey : passkey,
      }
    );

    const labPDF = await generatePasskeyPDF({
        name: labData.name,
        email: labData.email,
        role: "Lab",
        passkey: passkey,
        password: labPassword,
      });

    await sendEmailWithPDF({
      to: labData.email,
      name: labData.name,
      role: "Lab",
      pdfBlob: labPDF,    
    });
    
    return { lab: newLab, labId };
  } catch (error) {
    console.error("❌ Error creating lab:", error);
    throw error;
  }
};

// ✅ Upload lab logo
export const uploadLabLogo = async (file: File) => {
  try {
    const uploaded = await storage.createFile("686138bf0019a96102f4", ID.unique(), file);
    return storage.getFilePreview("686138bf0019a96102f4", uploaded.$id);
  } catch (err) {
    console.error("❌ Lab logo upload error:", err);
    throw err;
  }
};

// ✅ Fetch all labs
export const getAllLabs = async () => {
  try {
    const response = await databases.listDocuments(
      DATABASE_ID!,
      LAB_COLLECTION_ID!,
      [Query.limit(100)]
    );
    return response.documents;
  } catch (error) {
    console.error("❌ Error fetching labs:", error);
    return [];
  }
};


// Fetch lab details
export const getLabById = async (labId: string) => {
  const res = await databases.getDocument(DATABASE_ID!, LAB_COLLECTION_ID!, labId);
  return res;
};

export const updateLabPasskey = async (
  labId: string,
  updates: { passkey: string }
) => {
  try {
    await databases.updateDocument(
      DATABASE_ID!,
      LAB_COLLECTION_ID!,
      labId,
      updates
    );
  } catch (error) {
    console.error("Failed to update Lab passkey:", error);
    throw error;
  }
};

export const handleResetPasskey = async (labId : string) => {
    try {
        const lab = await getLabById(labId);
        if (!lab || !lab.email || !lab.name) {
        throw new Error("Lab info is incomplete");
        }

    // 1. Generate new passkey & password
    const newPasskey = generatePasskey();
    const newPassword = "LAB" + lab.name.slice(0,2).toUpperCase();

    await updateLabPasskey(lab.$id, {
      passkey: newPasskey,
    });

    // 3. Generate new PDF
    const newPDF = await generatePasskeyPDF({
      name: lab.name,
      email: lab.email,
      role: "Lab",
      passkey: newPasskey,
      password: newPassword,
    });

    // 4. Send email with new PDF
    await sendEmailWithPDF({
      to: lab.email,
      name: lab.name,
      role: "Lab",
      pdfBlob: newPDF,
    });

    return { success: true, message: "New passkey generated and emailed successfully." };
  } catch (err) {
    console.error("Error resetting passkey:", err);
      return { success: false, message: "Failed to reset passkey." };  }

};


export const getAppointmentsByLab = async (
  labId: string
): Promise<Models.DocumentList<Models.Document> | null> => {
  try {
    const response = await databases.listDocuments(
      DATABASE_ID!,
      APPOINTMENT_COLLECTION_ID!,
      [
        Query.equal("labId", labId),
      ]
    );
    return response;
  } catch (error) {
    console.error("Error fetching appointments:", error);
    return null;
  }
};
export const getPendingAppointmentsByLab = async (
  labId: string
): Promise<Models.DocumentList<Models.Document> | null> => {
  try {
    const response = await databases.listDocuments(
      DATABASE_ID!,
      APPOINTMENT_COLLECTION_ID!,
      [
        Query.equal("labId", labId),
        Query.equal("status","pending"),
      ]
    );
    return response;
  } catch (error) {
    console.error("Error fetching appointments:", error);
    return null;
  }
};


