"use server";

import { databases } from "@/lib/appwrite.config";
import { DATABASE_ID, HOSPITAL_COLLECTION_ID, LAB_COLLECTION_ID } from "@/lib/appwrite.config";

export async function updateHospitalStatus(
  id: string,
  isVerified: boolean,
  istrueLocation: boolean,
  timestamp: Date | string // Accepts Date object or ISO string
) {
  const isoTimestamp = typeof timestamp === "string" ? timestamp : timestamp.toISOString();

  return await databases.updateDocument(DATABASE_ID!, HOSPITAL_COLLECTION_ID!, id, {
    isVerified,
    istrueLocation,
    timestamp: isoTimestamp,
  });
}

export async function updateLabStatus(
  id: string,
  isVerified: boolean,
  istrueLocation: boolean,
  timestamp: Date | string // Accepts Date object or ISO string
) {
  const isoTimestamp = typeof timestamp === "string" ? timestamp : timestamp.toISOString();

  return await databases.updateDocument(DATABASE_ID!, LAB_COLLECTION_ID!, id, {
    isVerified,
    istrueLocation,
    timestamp: isoTimestamp,
  });
}

export async function getHospitalById(id: string) {
  try {
    const hospital = await databases.getDocument(DATABASE_ID!, HOSPITAL_COLLECTION_ID!, id);
    return hospital;
  } catch (err) {
    console.error("Error fetching hospital:", err);
    return null;
  }
}

export async function getLabById(id: string) {
  try {
    const lab = await databases.getDocument(DATABASE_ID!, LAB_COLLECTION_ID!, id);
    return lab;
  } catch (err) {
    console.error("Error fetching lab:", err);
    return null;
  }
}
