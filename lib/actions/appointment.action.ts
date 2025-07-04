"use server";

import { ID , Query} from "appwrite";
import { databases, DATABASE_ID, APPOINTMENT_COLLECTION_ID } from "@/lib/appwrite.config";
import { cookies } from "next/headers"
// Define a type that allows either hospital or lab
type AppointmentParams = {
  city: string;
  state: string;
  doctorName?: string;
  hospitalId?: string;
  labId?: string;
  test?: string;
};

export const createAppointment = async (data : AppointmentParams) => {
    const cookieStore = await cookies();
    const userId = cookieStore.get("userId")?.value;
    const now = new Date().toISOString();

  if (!userId) {
    throw new Error("User not logged in");
  }
    try {
        await databases.createDocument(
        DATABASE_ID!,
        APPOINTMENT_COLLECTION_ID!,
        ID.unique(),
        {
            ...data,
            userId,
            timestamp: now,
        }
    );
  } catch (err) {
    console.error("❌ Error creating appointment:", err);
    throw err;
  }
};


export const getAppointmentByUserId = async (userId: string) => {
  if (!userId) {
    throw new Error("User ID is required");
  }

  try {
    const response = await databases.listDocuments(
      DATABASE_ID!,
      APPOINTMENT_COLLECTION_ID!,
      [
        Query.equal("userId", userId),
        Query.orderDesc("timestamp"),
        Query.limit(1)
      ]
    );

    return response.documents[0] || null;
  } catch (error) {
    console.error("❌ Error fetching appointment by userId:", error);
    return null;
  }
};