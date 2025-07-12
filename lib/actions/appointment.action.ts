"use server";

import { ID , Query} from "appwrite";
import { databases, DATABASE_ID, APPOINTMENT_COLLECTION_ID } from "@/lib/appwrite.config";
import { cookies } from "next/headers"
import { DateTime } from "luxon";
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
    const now =  DateTime.now().setZone("Asia/Kolkata").toISO(); 
    const status = "pending"; 

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
            status,
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
export const getPendingAppointmentByUserId = async (userId: string) => {
  if (!userId) {
    throw new Error("User ID is required");
  }

  try {
    const response = await databases.listDocuments(
      DATABASE_ID!,
      APPOINTMENT_COLLECTION_ID!,
      [
         Query.equal("status", "pending"),
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


export const getAllAppointmentsByUserId = async (userId: string) => {
  if (!userId) throw new Error("User ID is required");

  try {
    const response = await databases.listDocuments(
      DATABASE_ID!,
      APPOINTMENT_COLLECTION_ID!,
      [
        Query.equal("userId", userId),
        Query.orderDesc("timestamp"),
      ]
    );
    return response.documents; // ✅ returns Appointment[]
  } catch (error) {
    console.error("❌ Error fetching all appointments:", error);
    return [];
  }
};


export const cancelAppointment = async (appointmentId: string, reason: string) => {
  if (!appointmentId) throw new Error("appointment ID is required");

  try {

    await databases.updateDocument(
      DATABASE_ID!,
      APPOINTMENT_COLLECTION_ID!,
      appointmentId,
      {
        status: "cancelled",
        cancelReason: reason,
      }
    );
    console.log("✅ Appointment cancelled successfully");
    return { success: true };
  } catch (error) {
    console.error("❌ Error cancelling appointment:", error);
    return { success: false, error: error };
  }
};


export async function markAppointmentDone(appointmentId: string) {
  try {
    await databases.updateDocument(
      DATABASE_ID!,
      APPOINTMENT_COLLECTION_ID!, // your collectionId
      appointmentId,
      {
        status: "done",
      }
    );
    return true;
  } catch (error) {
    console.error("Failed to mark appointment as done:", error);
    return false;
  }
}