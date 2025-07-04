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
  Gender: "Male" | "Female" | "Other";
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

  Allergies?: string;
  currentMedication?: string;
  FamilyMedicalHistory?: string;
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


export const registerPatient = async({identificationDocument, ...patient}:
  RegisterUserParams)=>{
    try{
      let file ;
      if(identificationDocument){
        const inputfile = identificationDocument && InputFile.fromBuffer(
          identificationDocument?.get('blobFile') as Blob,
          identificationDocument?.get('fileName') as string,
        )

        file = await storage.createFile(BUCKET_ID!, ID.unique(), inputfile)
      }

      const newPatient = await databases.createDocument(
        DATABASE_ID!,
        PATIENT_COLLECTION_ID!,
        ID.unique(),{
          identificationDocumentId: file?.$id ? file.$id : null,
          identificationDocumentUrl: file?.$id ?`${ENDPOINT}/storage/buckets/${BUCKET_ID}/files/${file?.$id}/view?project=${PROJECT_ID}`:null,
          ...patient
        }
      )

      return parseStringify(newPatient)
    }catch(error){
      console.log("not able to registerPatient", error)
    }
}

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