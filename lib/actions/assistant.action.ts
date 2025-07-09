"use server";

import { ID, Query } from "node-appwrite";
import {
  databases,
  DATABASE_ID,
  ASSISTANT_COLLECTION_ID,
  storage,
  BUCKET_ID,
  ENDPOINT,
  PROJECT_ID,
} from "@/lib/appwrite.config";
import { InputFile } from "node-appwrite/file";
import { generatePasskey } from "../utils/generatePasskey";
import { generatePasskeyPDF } from "../utils/generatePasskeyPDF";
import { sendEmailWithPDF } from "./sendEmailwithPDF";

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