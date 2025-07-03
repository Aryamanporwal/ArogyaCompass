"use server"
import { databases } from "@/lib/appwrite.config"; // your Appwrite server SDK instance
import { ID } from "appwrite";

export const createAppointment = async ({ userId, hospitalId, doctorName, city, state }: {
  userId: string;
  hospitalId: string;
  doctorName: string;
  city: string;
  state: string;
}) => {
  await databases.createDocument("your_database_id", "Appointments", ID.unique(), {
    userId,
    hospitalId,
    doctorName,
    city,
    state,
  });
};
