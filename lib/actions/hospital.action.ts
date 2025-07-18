"use server";

import { ID } from "node-appwrite";
import { databases, DATABASE_ID, HOSPITAL_COLLECTION_ID, DOCTOR_COLLECTION_ID, ENDPOINT, BUCKET_ID, PROJECT_ID, APPOINTMENT_COLLECTION_ID, USERS_COLLECTION_ID } from "@/lib/appwrite.config";
import { Query } from "node-appwrite";
import { storage } from "@/lib/appwrite.config";
import { InputFile } from "node-appwrite/file";
import { generatePasskey } from "../utils/generatePasskey";
import { generatePasskeyPDF } from "../utils/generatePasskeyPDF";
import { sendEmailWithPDF } from "./sendEmailwithPDF";
import { cookies } from "next/headers";
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
  logoId: string;
  logo?: string;
  specialities: string[];
  isVerified: boolean;
  istrueLocation: boolean;
  coordinates: number[];
  doctors: Doctor[];
  doctorName : string[];
  state : string;
  pincode : string;
};


// export const registerHospital = async (
//   hospitalData: HospitalParams,
//   doctors: Doctor[]
// ) => {
//   try {
//     const hospitalId = ID.unique();
    

//     // Create hospital document
//     const newHospital = await databases.createDocument(
//       DATABASE_ID!,
//       HOSPITAL_COLLECTION_ID!,
//       hospitalId,
//       {
//         ...hospitalData,
//         doctors: [], // Optionally leave empty
//       }
//     );

//     // Create doctor documents, each linked to this hospital
//     for (const doctor of doctors) {
//       await databases.createDocument(
//         DATABASE_ID!,
//         DOCTOR_COLLECTION_ID!,
//         ID.unique(),
//         {
//           ...doctor,
//           hospitalId,
//         }
//       );
//     }

//     return { hospital: newHospital , hospitalId};
//   } catch (error) {
//     console.error("❌ Error creating hospital and doctors:", error);
//     throw error;
//   }
// };
export const registerHospital = async (
  hospitalData: HospitalParams,
  doctors: Doctor[],
  logoFile?: File,
  doctorLogoFile?:File
) => {
  try {
    const hospitalId = ID.unique();


    let logoResult;
    if (logoFile) {
      const arrayBuffer = await logoFile.arrayBuffer();
      const inputFile = InputFile.fromBuffer(Buffer.from(arrayBuffer), logoFile.name);
      logoResult = await storage.createFile(BUCKET_ID!, ID.unique(), inputFile);
    }

    let doctorLogoResult;
    if(doctorLogoFile){
      const arrayBuffer = await doctorLogoFile.arrayBuffer();
      const inputFile = InputFile.fromBuffer(Buffer.from(arrayBuffer), doctorLogoFile.name);
      doctorLogoResult = await storage.createFile(BUCKET_ID!, ID.unique(), inputFile);
    }
    
    const hospitalPasskey = generatePasskey();
    const hospitalPassword = 'HOSP' + hospitalData.name.slice(0, 2).toUpperCase();
    
    const newHospital = await databases.createDocument(
      DATABASE_ID!,
      HOSPITAL_COLLECTION_ID!,
      hospitalId,
      {
        ...hospitalData,
        logoUrl: logoResult
        ? `${ENDPOINT}/storage/buckets/${BUCKET_ID}/files/${logoResult.$id}/view?project=${PROJECT_ID}`
        : null,
        logoId: logoResult?.$id ?? null,
        logo: logoResult?.name ?? null, // optional: store file name
        passkey: hospitalPasskey,
        doctors: [],
      }
    );

    const hospitalPDF = await generatePasskeyPDF({
        name: hospitalData.name,
        email: hospitalData.email,
        role: "Hospital",
        passkey: hospitalPasskey,
        password: hospitalPassword,
      });

      await sendEmailWithPDF({
        to: hospitalData.email,
        name: hospitalData.name,
        role: "Hospital",
        pdfBlob: hospitalPDF,
      });
    for (const doctor of doctors) {
      const doctorPasskey = generatePasskey();
      const doctorPassword = 'DOCT' + doctor.Name.slice(-2).toUpperCase(); // e.g., "DOCTSH"
      await databases.createDocument(
        DATABASE_ID!,
        DOCTOR_COLLECTION_ID!,
        ID.unique(),
        {
          ...doctor,
        logoUrl: doctorLogoResult
          ? `${ENDPOINT}/storage/buckets/${BUCKET_ID}/files/${doctorLogoResult.$id}/view?project=${PROJECT_ID}`
          : null,
        logoId: doctorLogoResult?.$id ?? null,
        logo: doctorLogoResult?.name ?? null,
          hospitalId,
        passkey: doctorPasskey,
        }
      );


        const doctorPDF = await generatePasskeyPDF({
          name: doctor.Name,
          email: doctor.Email,
          role: "Doctor",
          passkey: doctorPasskey,
          password: doctorPassword,
        });
        await sendEmailWithPDF({
          to: doctor.Email,
          name: doctor.Name,
          role: "Doctor",
          pdfBlob: doctorPDF,
        });
    }

      await databases.createDocument(
      DATABASE_ID!,
      USERS_COLLECTION_ID!,   
      newHospital.$id,     
      {
        name: hospitalData.name,
        email: hospitalData.email,
        proUser: false,   // default flag
      }
    );

    return { hospital: newHospital, hospitalId };
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

// Fetch hospital details
export const getHospitalById = async (hospitalId: string) => {
  const res = await databases.getDocument(DATABASE_ID!, HOSPITAL_COLLECTION_ID!, hospitalId);
  return res;
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



export const updateLabPasskey = async (
  hospitalId: string,
  updates: { passkey: string }
) => {
  try {
    await databases.updateDocument(
      DATABASE_ID!,
      HOSPITAL_COLLECTION_ID!,
      hospitalId,
      updates
    );
  } catch (error) {
    console.error("Failed to update Lab passkey:", error);
    throw error;
  }
};

export const handleResetPasskey = async (labId : string) => {
    try {
        const hospital = await getHospitalById(labId);
        if (!hospital || !hospital.email || !hospital.name) {
        throw new Error("Hospital info is incomplete");
        }

    // 1. Generate new passkey & password
    const newPasskey = generatePasskey();
    const newPassword = "HOSP" + hospital.name.slice(0,2).toUpperCase();

    await updateLabPasskey(hospital.$id, {
      passkey: newPasskey,
    });

    // 3. Generate new PDF
    const newPDF = await generatePasskeyPDF({
      name: hospital.name,
      email: hospital.email,
      role: "Hospital",
      passkey: newPasskey,
      password: newPassword,
    });

    // 4. Send email with new PDF
    await sendEmailWithPDF({
      to: hospital.email,
      name: hospital.name,
      role: "Hospital",
      pdfBlob: newPDF,
    });

    return { success: true, message: "New passkey generated and emailed successfully." };
  } catch (err) {
    console.error("Error resetting passkey:", err);
      return { success: false, message: "Failed to reset passkey." };  }

};


export const getHospitalIdFromCookie = async (): Promise<string | null> => {
  const cookieStore = await cookies();
  return cookieStore.get("hospitalId")?.value ?? null;
};


export const checkProUserStatus = async (hospitalId: string) => {
  try {

    const userDoc = await databases.getDocument(
      DATABASE_ID!,
      USERS_COLLECTION_ID!,
      hospitalId,
    );

    return userDoc?.proUser ?? false;
  } catch (error) {
    console.error("Failed to fetch Pro user status:", error);
    return false;
  }
};

export const grantProAccessToUser = async (hospitalId: string) => {
  try {
    if (!hospitalId) throw new Error("Hospital ID not found");
    await databases.updateDocument(
      DATABASE_ID!,
      USERS_COLLECTION_ID!,
      hospitalId,
      {
        proUser: true,
      }
    );
    return true;
  } catch (error) {
    console.error("Error granting pro access to hospital:", error);
    return false;
  }
};
