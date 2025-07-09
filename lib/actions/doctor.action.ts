"use server";
import { databases, DATABASE_ID, DOCTOR_COLLECTION_ID, APPOINTMENT_COLLECTION_ID, MEDICINE_RECORD_COLLECTION_ID } from "@/lib/appwrite.config";
import { Models, Query, ID } from "node-appwrite";
import { generatePasskey } from "../utils/generatePasskey";
import { generatePasskeyPDF } from "../utils/generatePasskeyPDF";
import { sendEmailWithPDF } from "./sendEmailwithPDF";

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


export const updateDoctorPasskey = async (
  doctorId: string,
  updates: { passkey: string }
) => {
  try {
    await databases.updateDocument(
      DATABASE_ID!,
      DOCTOR_COLLECTION_ID!,
      doctorId,
      updates
    );
  } catch (error) {
    console.error("Failed to update doctor passkey:", error);
    throw error;
  }
};


export const handleResetPasskey = async (doctorId : string) => {
    try {
        const doctor = await getDoctorById(doctorId);
        if (!doctor || !doctor.Email || !doctor.Name) {
        throw new Error("Doctor info is incomplete");
        }

    // 1. Generate new passkey & password
    const newPasskey = generatePasskey();
    const newPassword = "DOCT" + doctor.Name.slice(-2).toUpperCase();

    // 2. Update doctor record in Appwrite
    await updateDoctorPasskey(doctor.$id, {
      passkey: newPasskey,
    });

    // 3. Generate new PDF
    const newPDF = await generatePasskeyPDF({
      name: doctor.Name,
      email: doctor.Email,
      role: "Doctor",
      passkey: newPasskey,
      password: newPassword,
    });

    // 4. Send email with new PDF
    await sendEmailWithPDF({
      to: doctor.Email,
      name: doctor.Name,
      role: "Doctor",
      pdfBlob: newPDF,
    });

    return { success: true, message: "New passkey generated and emailed successfully." };
  } catch (err) {
    console.error("Error resetting passkey:", err);
      return { success: false, message: "Failed to reset passkey." };  }

};
