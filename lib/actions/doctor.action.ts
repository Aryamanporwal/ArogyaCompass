import { databases, DATABASE_ID, DOCTOR_COLLECTION_ID } from "@/lib/appwrite.config";
import { Query } from "node-appwrite";

export const getDoctorsByNames = async (names: string[]) => {
  const result = await databases.listDocuments(
    DATABASE_ID!,
    DOCTOR_COLLECTION_ID!,
    [
      // Filter doctors whose Name is in the names[] list
      Query.equal("Name", names),
    ]
  );
  return result.documents;
};