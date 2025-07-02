"use server";

import { ID, Query } from "node-appwrite";
import {
  databases,
  DATABASE_ID,
  LAB_COLLECTION_ID,
  storage,
} from "@/lib/appwrite.config";
import type { LabTest } from "@/lib/constants/lab.constants";

type LabParams = {
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  licenseNumber: string;
  logoUrl: string;
  isVerified: boolean;
  istrueLocation: boolean;
  coordinates: [number, number];
  test: LabTest[];
};

// ✅ Register lab
export const registerLab = async (labData: LabParams) => {
  try {
    const labId = ID.unique();
    const newLab = await databases.createDocument(
      DATABASE_ID!,
      LAB_COLLECTION_ID!,
      labId,
      { ...labData }
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
