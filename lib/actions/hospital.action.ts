"use server";

import { ID } from "node-appwrite";
import { databases, DATABASE_ID, HOSPITAL_COLLECTION_ID, DOCTOR_COLLECTION_ID } from "@/lib/appwrite.config";
import { Query } from "node-appwrite";
import { storage } from "@/lib/appwrite.config";
type Doctor = {
  Name: string;
  Email: string;
  phone: string;
  Address: string;
  City: string;
  licenseNumber: string;
  logoUrl: string;
  speciality: string[];
  isVerified: boolean;
  availability: string[];
  experience: number;
};

type HospitalParams = {
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  licenseNumber: string;
  logoUrl: string;
  specialities: string[];
  isVerified: boolean;
  istrueLocation: boolean;
  coordinates: number[];
  doctors: string[],
};


export const registerHospital = async (
  hospitalData: HospitalParams,
  doctors: Doctor[]
) => {
  try {
    const hospitalId = ID.unique();

    // Create hospital document
    const newHospital = await databases.createDocument(
      DATABASE_ID!,
      HOSPITAL_COLLECTION_ID!,
      hospitalId,
      {
        ...hospitalData,
        doctors: [], // Optionally leave empty
      }
    );

    // Create doctor documents, each linked to this hospital
    for (const doctor of doctors) {
      await databases.createDocument(
        DATABASE_ID!,
        DOCTOR_COLLECTION_ID!,
        ID.unique(),
        {
          ...doctor,
          hospitalId,
        }
      );
    }

    return { hospital: newHospital };
  } catch (error) {
    console.error("❌ Error creating hospital and doctors:", error);
    throw error;
  }
};


export const uploadDoctorLogo = async (file: File) => {
  try {
    const uploaded = await storage.createFile("686138bf0019a96102f4", ID.unique(), file);
    // Construct the file preview URL manually
    const url = storage.getFilePreview("686138bf0019a96102f4", uploaded.$id);
    return url; // This returns a string URL in Appwrite JS SDK
  } catch (err) {
    console.error("Server logo upload error:", err);
    throw err;
  }
};

export const uploadHospitalLogo = async (file: File) => {
  try {
    const uploaded = await storage.createFile("686138bf0019a96102f4", ID.unique(), file);
    const url = storage.getFilePreview("686138bf0019a96102f4", uploaded.$id);
    return url; // returns string
  } catch (err) {
    console.error("Server hospital logo upload error:", err);
    throw err;
  }
};


export const getAllHospitals = async () => {
  try {
    const res = await databases.listDocuments("686137f30030ecedb50e", "68635669000de553d623", [
      Query.limit(100), // or paginate
    ]);

    return res.documents;
  } catch (err) {
    console.error("Error fetching hospitals:", err);
    return [];
  }
};

