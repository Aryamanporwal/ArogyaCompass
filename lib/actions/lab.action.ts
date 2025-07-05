"use server";

import { ID, Query } from "node-appwrite";
import {
  databases,
  DATABASE_ID,
  LAB_COLLECTION_ID,
  storage,
  BUCKET_ID,
  ENDPOINT,
  PROJECT_ID,
} from "@/lib/appwrite.config";
import type { LabTest } from "@/lib/constants/lab.constants";
import { InputFile } from "node-appwrite/file";

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

      }
    );
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
