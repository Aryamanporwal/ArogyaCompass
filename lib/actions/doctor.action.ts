"use server";
import { databases, DATABASE_ID, DOCTOR_COLLECTION_ID, APPOINTMENT_COLLECTION_ID, MEDICINE_RECORD_COLLECTION_ID, BUCKET_ID, storage, ENDPOINT, PROJECT_ID } from "@/lib/appwrite.config";
import { Models, Query, ID } from "node-appwrite";
import { generatePasskey } from "../utils/generatePasskey";
import { generatePasskeyPDF } from "../utils/generatePasskeyPDF";
import { sendEmailWithPDF } from "./sendEmailwithPDF";
import { generateMedicalPDF } from "../utils/generateMedicalPDF";
import { sendMedicalEmailWithPDF } from "./sendMedicalEmailwithPDF";
import { InputFile } from "node-appwrite/file";

export interface Doctor {
  $id: string;
  Name: string;
  Email: string;
  phone: string;
  address: string;
  City: string;
  licenseNumber: string;
  logoUrl: string;
  speciality: string[];
  isVerified: boolean;
  availability: string[];
  experience: number;
  hospitalId: string;
  logo: string;
  logoId: string;
}

export const getDoctorsByAssistantDoctorId = async (
  doctorId: string
): Promise<Doctor[]> => {
  try {
    const doctor = await databases.getDocument(
      DATABASE_ID!,
      DOCTOR_COLLECTION_ID!,
      doctorId
    );

    const hospitalId = doctor?.hospitalId;
    if (!hospitalId) return [];

    const doctorsList = await databases.listDocuments(
      DATABASE_ID!,
      DOCTOR_COLLECTION_ID!,
      [Query.equal("hospitalId", hospitalId)]
    );

    return doctorsList.documents as unknown as Doctor[];
  } catch (error) {
    console.error("Error fetching doctors:", error);
    return [];
  }
};

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
export const getPendingAppointmentsByDoctorAndHospital = async (
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
        Query.equal("status", "pending")
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
  patientName: string;
  patientEmail: string;
  patientPhone:string;// Optional
  doctorId: string; // Optional, if needed
}) => {
  try {
    const res = await databases.createDocument(
      DATABASE_ID!,
      MEDICINE_RECORD_COLLECTION_ID!,
      ID.unique(),
      data
    );

    const pdfBlob = await generateMedicalPDF(data)
    await sendMedicalEmailWithPDF(data.patientEmail, pdfBlob, data.patientName);
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

export const getDoctorsByHospitalId = async (
  hospitalId: string
): Promise<Doctor[]> => {
  if (!hospitalId) {
    throw new Error("Hospital ID is required");
  }

  try {
    const response = await databases.listDocuments(
      DATABASE_ID!,
      DOCTOR_COLLECTION_ID!,
      [Query.equal("hospitalId", hospitalId)]
    );

    return response.documents as unknown as  Doctor[];
  } catch (error) {
    console.error("Error fetching doctors by hospitalId:", error);
    return [];
  }
};


type DoctorParams = {
  Name: string;
  Email: string;
  phone: string;
  Address: string;
  City: string;
  licenseNumber: string;
  speciality: string[];
  availability: string[];
  experience: number;
  hospitalId: string;
};

export const registerDoctor = async (
  doctorData: DoctorParams,
  logoFile?: File
) => {
  try {
    const doctorId = ID.unique();
    let logoResult;

    // ✅ Upload doctor logo if provided
    if (logoFile) {
      const arrayBuffer = await logoFile.arrayBuffer();
      const inputFile = InputFile.fromBuffer(Buffer.from(arrayBuffer), logoFile.name);
      logoResult = await storage.createFile(BUCKET_ID!, ID.unique(), inputFile);
    }

    // ✅ Generate passkey and default password
    const doctorPasskey = generatePasskey();
    const doctorPassword = 'DOCT' + doctorData.Name.slice(-2).toUpperCase(); // e.g., DOCTSH

    // ✅ Create Doctor in Appwrite
    const newDoctor = await databases.createDocument(
      DATABASE_ID!,
      DOCTOR_COLLECTION_ID!,
      doctorId,
      {
        ...doctorData,
        logoUrl: logoResult
          ? `${ENDPOINT}/storage/buckets/${BUCKET_ID}/files/${logoResult.$id}/view?project=${PROJECT_ID}`
          : null,
        logoId: logoResult?.$id ?? null,
        logo: logoResult?.name ?? null,
        passkey: doctorPasskey,
      }
    );

    // ✅ Generate PDF & Send Email
    const pdfBlob = await generatePasskeyPDF({
      name: doctorData.Name,
      email: doctorData.Email,
      role: "Doctor",
      passkey: doctorPasskey,
      password: doctorPassword,
    });

    await sendEmailWithPDF({
      to: doctorData.Email,
      name: doctorData.Name,
      role: "Doctor",
      pdfBlob,
    });

    return { success: true, doctor: newDoctor };
  } catch (error) {
    console.error("❌ Error registering doctor:", error);
    return { success: false, error };
  }
};


