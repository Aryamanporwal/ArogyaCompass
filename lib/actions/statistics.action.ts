"use server";

import { DATABASE_ID, APPOINTMENT_COLLECTION_ID, databases } from "@/lib/appwrite.config";
import { Query } from "node-appwrite";
import { getAllHospitals, getHospitalById } from "./hospital.action"; // Adjust path as needed


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


export const getHospitalsWithAppointmentCount = async () => {
  try {
    const hospitals = await getAllHospitals(); // from your existing hospital.action.ts
    const appointments = await databases.listDocuments(DATABASE_ID!, APPOINTMENT_COLLECTION_ID!);

    const hospitalMap: Record<string, number> = {};
    appointments.documents.forEach((appt) => {
      if (appt.hospitalId) {
        hospitalMap[appt.hospitalId] = (hospitalMap[appt.hospitalId] || 0) + 1;
      }
    });

    return hospitals.map((hospital) => ({
      ...hospital,
      appointmentCount: hospitalMap[hospital.$id] || 0,
    }));
  } catch (err) {
    console.error("Error fetching heatmap data:", err);
    return [];
  }
};

