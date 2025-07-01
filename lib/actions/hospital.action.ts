"use server";

import { ID } from "node-appwrite";
import { databases, DATABASE_ID, HOSPITAL_COLLECTION_ID, DOCTOR_COLLECTION_ID } from "@/lib/appwrite.config";
import { Query } from "node-appwrite";
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

export const getAllHospitals = async () => {
  try {
    const res = await databases.listDocuments(
      DATABASE_ID!,
      HOSPITAL_COLLECTION_ID!,
      [
        Query.isNotNull("coordinates"),
        Query.notEqual("coordinates", []),
      ]
    );

    const hospitalsWithDoctors = await Promise.all(
      res.documents.map(async (hospital) => {
        const doctorsRes = await databases.listDocuments(
          DATABASE_ID!,
          DOCTOR_COLLECTION_ID!,
          [Query.equal("hospitalId", hospital.$id)]
        );

        return {
          ...hospital,
          doctors: doctorsRes.documents,
        };
      })
    );

    return hospitalsWithDoctors;
  } catch (error) {
    console.error("❌ Error fetching hospitals:", error);
    return [];
  }
};

