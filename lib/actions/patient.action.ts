"use server"
import { ID, Query } from "node-appwrite"
import { BUCKET_ID, DATABASE_ID, databases, ENDPOINT, PATIENT_COLLECTION_ID, PROJECT_ID, storage, users } from "../appwrite.config"
import { Resend } from "resend"; 
type ErrorWithCode = {
    code: number;
    [key: string]: unknown;
};
import {cookies} from "next/headers"
import { InputFile } from "node-appwrite/file"
import { parseStringify } from "../utils";


export type RegisterUserParams = {
  userId: string;
  name: string;
  email: string;
  phone: string;
  birthDate: Date;
  gender: "Male" | "Female" | "Other";
  address: string;
  occupation: string;
  emergencyContactName: string;
  emergencyContactNumber: string;
  insuranceProvider: string;
  insurancePolicyNumber: string;

  identificationType?: string;
  identificationNumber?: string;
  identificationDocument?: FormData;

  primaryPhysician?: string;
  test?: string;

  allergies?: string;
  currentMedication?: string;
  familyMedicalHistory?: string;
  pastMedicalHistory?: string;

  treatmentConsent: boolean;
  disclosureConsent: boolean;
  privacyConsent: boolean;
};


export const createUser = async (user: CreateUserParams) => {
  const resend = new Resend('re_PFSSmak7_FrQaPKiRyRjLH8n3fQ84eBjd');
  try {
    const newUser = await users.create(
      ID.unique(), 
      user.email, 
      user.phone, 
      undefined, 
      user.name
    );
    
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    const cookieStore = await cookies();
    cookieStore.set("userId", newUser.$id, {
      httpOnly: true,
      secure: true,
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
    });
    
    await resend.emails.send({
      from: "onboarding@resend.dev",
      to: user.email,
      subject: "Your Email Verification Code",
      html: `<p>Hello ${user.name},</p>
             <p>Your verification code is:</p>
             <h2>${verificationCode}</h2>`,
    });

    return { user: newUser, code: verificationCode };

  } catch (error: unknown) {
    if (error && (error as ErrorWithCode)?.code === 409) {
      const existingUser = await users.list([
        Query.equal("email", [user.email]),
      ]);
      
      // For existing users, generate a new verification code
      const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
      const cookieStore = await cookies();
      cookieStore.set("userId", existingUser.users[0].$id, {
        httpOnly: true,
        secure: true,
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 7,
      });

      await resend.emails.send({
        from: "onboarding@resend.dev",
        to: user.email,
        subject: "Your Verification Code",
        html: `<p>Your verification code is: <strong>${verificationCode}</strong></p>`
      });
      
      return { user: existingUser.users[0], code: verificationCode };
    }
    console.error("Error creating user:", error);
    throw error;
  }
};


export async function  verifyPatient(userId : string){
  try{
    const update = await databases.updateDocument(
      process.env.DATABASE_ID!,
      process.env.PATIENT_COLLECTION_ID!,
      userId,
      {
        isVerified : true
      }
    );
    return update;
  }catch(error){
    console.log("Failed to Verify Patient", error);
  }

}

export const registerPatient = async (params: RegisterUserParams) => {
  try {
    let fileResult;

    if (params.identificationDocument) {
      const fileBuffer = params.identificationDocument.get("blobFile") as Blob;
      const fileName = params.identificationDocument.get("fileName") as string;

      const arrayBuffer = await fileBuffer.arrayBuffer(); // Fix for Blob to Buffer
      const inputFile = InputFile.fromBuffer(Buffer.from(arrayBuffer), fileName);

      fileResult = await storage.createFile(BUCKET_ID!, ID.unique(), inputFile);
    }

    const doc = await databases.createDocument(
      DATABASE_ID!,
      PATIENT_COLLECTION_ID!,
      ID.unique(),
      {
        userId: params.userId,
        name: params.name,
        email: params.email,
        phone: params.phone,
        birthDate: params.birthDate,
        gender: params.gender,
        address: params.address,
        occupation: params.occupation,
        emergencyContactName: params.emergencyContactName,
        emergencyContactNumber: params.emergencyContactNumber,
        insuranceProvider: params.insuranceProvider,
        insurancePolicyNumber: params.insurancePolicyNumber,
        identificationType: params.identificationType,
        identificationNumber: params.identificationNumber,
        primaryPhysician: params.primaryPhysician,
        test: params.test,
        allergies: params.allergies,
        currentMedication: params.currentMedication,
        familyMedicalHistory: params.familyMedicalHistory,
        pastMedicalHistory: params.pastMedicalHistory,
        treatmentConsent: params.treatmentConsent,
        disclosureConsent: params.disclosureConsent,
        privacyConsent: params.privacyConsent,
        identificationDocumentId: fileResult?.$id ?? null,
        identificationDocumentUrl: fileResult
          ? `${ENDPOINT}/storage/buckets/${BUCKET_ID}/files/${fileResult.$id}/view?project=${PROJECT_ID}`
          : null,
      }
    );

    return parseStringify(doc);
  } catch (error) {
    console.error("registerPatient failed:", error);
    throw error;
  }
};


export const getPatient = async (userId: string) => {
  try {
    const patients = await databases.listDocuments(
      DATABASE_ID!,
      PATIENT_COLLECTION_ID!,
      [Query.equal("userId", [userId])]
    );

    return parseStringify(patients.documents[0]);
  } catch (error) {
    console.error(
      "An error occurred while retrieving the patient details:",
      error
    );
  }
};


export const getUser = async(userId : string) =>{
  try{
    const user = await users.get(userId);
    return parseStringify(user);
  }catch(error){
    console.error("error occured during retrieving the user details " , error);
  }
};