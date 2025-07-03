"use server";

import { ID } from "appwrite";
import { databases, DATABASE_ID, APPOINTMENT_COLLECTION_ID } from "@/lib/appwrite.config";

// Define a type that allows either hospital or lab
type AppointmentParams = {
  userId: string;
  city: string;
  state: string;
  doctorName?: string;
  hospitalId?: string;
  labId?: string;
  test?: string;
};

export const createAppointment = async (data: AppointmentParams) => {
  try {
    await databases.createDocument(
      DATABASE_ID!,
      APPOINTMENT_COLLECTION_ID!,
      ID.unique(),
      data
    );
  } catch (err) {
    console.error("❌ Error creating appointment:", err);
    throw err;
  }
};
