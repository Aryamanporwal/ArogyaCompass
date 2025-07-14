"use server"
import { databases , MEDICINE_RECORD_COLLECTION_ID , LAB_RECORD_COLLECTION_ID, DATABASE_ID } from "../appwrite.config";// adjust the import as per your project
import {  Query } from "appwrite";


export async function getLabRecordsByUserId(userId : string) {
  try {
    const response = await databases.listDocuments(
      DATABASE_ID!,
      LAB_RECORD_COLLECTION_ID!,
      [Query.equal("userId", userId)]
    );
    return response.documents; // array of lab records
  } catch (error) {
    console.error("Error fetching lab records:", error);
    return [];
  }
}

export async function getMedicineRecordsByUserId(userId: string) {
  try {
    const response = await databases.listDocuments(
      DATABASE_ID!,
      MEDICINE_RECORD_COLLECTION_ID!,
      [Query.equal("userId", userId)]
    );
    return response.documents; // array of medicine records
  } catch (error) {
    console.error("Error fetching medicine records:", error);
    return [];
  }
}
