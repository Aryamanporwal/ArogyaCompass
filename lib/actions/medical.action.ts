"use server"
import { databases, } from "@/lib/appwrite.config";
import { Query } from "node-appwrite";
import { DATABASE_ID, MEDICINE_RECORD_COLLECTION_ID } from "@/lib/appwrite.config";


export async function getMedicalRecordsByDoctorId(doctorId: string) {
  try {
    const response = await databases.listDocuments(
      DATABASE_ID!,
      MEDICINE_RECORD_COLLECTION_ID!,
      [Query.equal("doctorId", doctorId)]
    );

    return response.documents;
  } catch (error) {
    console.error("Error fetching medical records:", error);
    return [];
  }
}




