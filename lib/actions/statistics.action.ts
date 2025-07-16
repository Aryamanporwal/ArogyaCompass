"use server";

import { DATABASE_ID, APPOINTMENT_COLLECTION_ID, databases } from "@/lib/appwrite.config";
import { Query } from "node-appwrite";
import { getHospitalById } from "./hospital.action"; // Adjust path as needed


export const getAppointmentsByCityGroupedByHospital = async (city: string) => {
  try {
    const response = await databases.listDocuments(
      DATABASE_ID!,
      APPOINTMENT_COLLECTION_ID!,
      [Query.equal("city", city)]
    );

    // Step 1: Filter appointments with valid hospitalId
    const validAppointments = response.documents.filter(doc => !!doc.hospitalId);

    // Step 2: Group by hospitalId
    const hospitalCountMap: Record<string, number> = {};
    validAppointments.forEach(doc => {
      const hospitalId = doc.hospitalId;
      hospitalCountMap[hospitalId] = (hospitalCountMap[hospitalId] || 0) + 1;
    });

    // Step 3: Map hospitalId to hospitalName
    const hospitalEntries = await Promise.all(
      Object.entries(hospitalCountMap).map(async ([hospitalId, count]) => {
        try {
          const hospital = await getHospitalById(hospitalId);
          return {
            hospitalName: hospital?.name || "Unnamed Hospital",
            totalAppointments: count,
          };
        } catch {
          return {
            hospitalName: "Unknown Hospital",
            totalAppointments: count,
          };
        }
      })
    );

    return hospitalEntries;
  } catch (err) {
    console.error("❌ Error fetching appointment stats by city:", err);
    return [];
  }
};




