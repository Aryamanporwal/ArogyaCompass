"use server"
import { databases } from "@/lib/appwrite.config";
import { DATABASE_ID, HOSPITAL_COLLECTION_ID, DOCTOR_COLLECTION_ID, LAB_COLLECTION_ID, ASSISTANT_COLLECTION_ID } from "@/lib/appwrite.config";
import { Query } from "node-appwrite";


export async function searchByPasskey(passkey: string): Promise<null | { role: string; id: string }> {
  try {
    if (!DATABASE_ID || !HOSPITAL_COLLECTION_ID || !DOCTOR_COLLECTION_ID || !LAB_COLLECTION_ID || !ASSISTANT_COLLECTION_ID) {
      throw new Error("Database or collection IDs are not defined.");
    }

    const collections = [
      { name: "hospital", id: HOSPITAL_COLLECTION_ID },
      { name: "doctor", id: DOCTOR_COLLECTION_ID },
      { name: "lab", id: LAB_COLLECTION_ID },
      { name: "assistant", id: ASSISTANT_COLLECTION_ID },
    ];

    for (const col of collections) {
      const result = await databases.listDocuments(DATABASE_ID, col.id, [
        Query.equal("passkey", passkey),
      ]);

      if (result.documents.length > 0) {
        return {
          role: col.name,
          id: result.documents[0].$id,
        };
      }
    }

    return null;
  } catch (err) {
    console.error("🔍 Error searching passkey:", err);
    return null;
  }
}
