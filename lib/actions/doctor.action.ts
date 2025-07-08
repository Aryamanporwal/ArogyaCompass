"use server";
import { databases, DATABASE_ID, DOCTOR_COLLECTION_ID, APPOINTMENT_COLLECTION_ID, MEDICINE_RECORD_COLLECTION_ID } from "@/lib/appwrite.config";
import { Models, Query, ID } from "node-appwrite";

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


export const getDoctorById = async (doctorId: string) => {
  try {
    const doctor = await databases.getDocument(DATABASE_ID!, DOCTOR_COLLECTION_ID!, doctorId);
    return doctor;
  } catch (error) {
    console.error("Error fetching doctor:", error);
    return null;
  }
};


export const getAppointmentsByDoctorAndHospital = async (
  doctorName: string,
  hospitalId: string
): Promise<Models.DocumentList<Models.Document> | null> => {
  try {
    const response = await databases.listDocuments(
      DATABASE_ID!,
      APPOINTMENT_COLLECTION_ID!,
      [
        Query.equal("doctorName", doctorName),
        Query.equal("hospitalId", hospitalId),
      ]
    );

    return response;
  } catch (error) {
    console.error("Error fetching appointments:", error);
    return null;
  }
};


// CREATE a new record in medicalRecord collection
export const createMedicalRecord = async (data: {
  userId: string;
  doctorName: string;
  doctorContact: string;
  diagnose: string;
  testRecommended: string;
  timestamp: string;
  medicine: string;
  bp: string;
  temperature: string;
  dosage: string;
  frequency: string;
}) => {
  try {
    const res = await databases.createDocument(
      DATABASE_ID!,
      MEDICINE_RECORD_COLLECTION_ID!,
      ID.unique(),
      data
    );
    return res;
  } catch (error) {
    console.error("Failed to create medical record:", error);
  }
};

// UPDATE appointment status to "done"
export const updateAppointmentStatus = async (appointmentId: string, status: string) => {
  try {
    await databases.updateDocument(DATABASE_ID!, APPOINTMENT_COLLECTION_ID!, appointmentId, {
      status,
    });
  } catch (error) {
    console.error("Failed to update appointment status:", error);
  }
};
