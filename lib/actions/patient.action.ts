"use server"
import { ID, Query } from "node-appwrite"
import { BUCKET_ID, DATABASE_ID, databases, ENDPOINT, PATIENT_COLLECTION_ID, PROJECT_ID, storage, users} from "../appwrite.config"
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

    const emailHTML = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <title>ArogyaCompass - Email Verification</title>
    <style>
        /* Basic Reset */
        body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
        table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
        img { -ms-interpolation-mode: bicubic; border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; }
        table { border-collapse: collapse !important; }
        body { height: 100% !important; margin: 0 !important; padding: 0 !important; width: 100% !important; }
        
        /* Main Styles */
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol';
            background-color: #f1f5f9; /* slate-100 */
        }

        .container {
            padding: 20px;
        }

        .content-card {
            background-color: #ffffff;
            border: 1px solid #e2e8f0; /* slate-200 */
            border-radius: 12px;
            max-width: 600px;
            margin: 0 auto;
            overflow: hidden;
        }
        
        .header {
            text-align: center;
            padding: 40px 20px;
            border-bottom: 1px solid #e2e8f0; /* slate-200 */
        }
        
        .header img {
            height: 80px;
            width: 80px;
            margin-bottom: 6px;
        }

        .header h1 {
            font-size: 24px;
            font-weight: 700;
            color: #2563eb; /* slate-800 */
            margin: 0;
        }

        .header p {
            font-size: 14px;
            color: #3b82f6; /* slate-500 */
            margin: 4px 0 0;
        }

        .main-content {
            padding: 32px 40px;
            text-align: left;
        }

        .main-content h2 {
            font-size: 20px;
            font-weight: 600;
            color: #334155; /* slate-700 */
            margin-top: 0;
            margin-bottom: 16px;
        }

        .main-content p {
            font-size: 16px;
            line-height: 1.6;
            color: #475569; /* slate-600 */
            margin: 0 0 24px;
        }

        .code-box {
            background-color: #f8fafc; /* slate-50 */
            border-radius: 8px;
            padding: 16px;
            text-align: center;
            margin-bottom: 24px;
        }

        .code-box h2 {
            font-size: 36px;
            font-weight: 700;
            color: #0f172a; /* slate-900 */
            letter-spacing: 8px;
            margin: 0;
            font-family: 'Courier New', Courier, monospace;
        }

        .footer-note {
            font-size: 14px;
            color: #64748b; /* slate-500 */
        }

        .footer {
            padding: 20px 40px;
            text-align: center;
            font-size: 12px;
            color: #94a3b8; /* slate-400 */
        }

    </style>
</head>
<body style="background-color: #f1f5f9; margin: 0 !important; padding: 0 !important;">
    <table border="0" cellpadding="0" cellspacing="0" width="100%">
        <tr>
            <td align="center" class="container">
                <!--[if (gte mso 9)|(IE)]>
                <table align="center" border="0" cellspacing="0" cellpadding="0" width="600">
                <tr>
                <td align="center" valign="top" width="600">
                <![endif]-->
                <div class="content-card">
                    <div class="header">
                        <img src="https://fra.cloud.appwrite.io/v1/storage/buckets/686138bf0019a96102f4/files/688255f9002c8b126dd8/view?project=686136ad00033a8b1a47&mode=admin" alt="ArogyaCompass Logo">
                        <h1>ArogyaCompass</h1>
                        <p>Smart App for Faster Care</p>
                    </div>
                    <div class="main-content">
                        <h2>Hello ${user.name},</h2>
                        <p>Thank you for signing up. Please use the following verification code to complete your registration:</p>
                        
                        <div class="code-box">
                            <h2>${verificationCode}</h2>
                        </div>

                        <p class="footer-note">This code will expire in 10 minutes. If you did not request this code, you can safely ignore this email.</p>
                    </div>
                </div>
                <!--[if (gte mso 9)|(IE)]>
                </td>
                </tr>
                </table>
                <![endif]-->
                <div class="footer">
                    &copy; 2025 ArogyaCompass. All rights reserved.
                </div>
            </td>
        </tr>
    </table>
</body>
</html>`
    
    await resend.emails.send({
      from: "support@arogyacompass.cloud",
      to: user.email,
      subject: "Your Email Verification Code",
      html: emailHTML
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

          const emailHTML = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <title>ArogyaCompass - Email Verification</title>
    <style>
        /* Basic Reset */
        body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
        table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
        img { -ms-interpolation-mode: bicubic; border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; }
        table { border-collapse: collapse !important; }
        body { height: 100% !important; margin: 0 !important; padding: 0 !important; width: 100% !important; }
        
        /* Main Styles */
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol';
            background-color: #f1f5f9; /* slate-100 */
        }

        .container {
            padding: 20px;
        }

        .content-card {
            background-color: #ffffff;
            border: 1px solid #e2e8f0; /* slate-200 */
            border-radius: 12px;
            max-width: 600px;
            margin: 0 auto;
            overflow: hidden;
        }
        
        .header {
            text-align: center;
            padding: 40px 20px;
            border-bottom: 1px solid #e2e8f0; /* slate-200 */
        }
        
        .header img {
            height: 80px;
            width: 80px;
            margin-bottom: 6px;
        }

        .header h1 {
            font-size: 24px;
            font-weight: 700;
            color: #2563eb; 
            margin: 0;
        }

        .header p {
            font-size: 14px;
            color: #3b82f6;
            margin: 4px 0 0;
        }

        .main-content {
            padding: 32px 40px;
            text-align: left;
        }

        .main-content h2 {
            font-size: 20px;
            font-weight: 600;
            color: #334155; /* slate-700 */
            margin-top: 0;
            margin-bottom: 16px;
        }

        .main-content p {
            font-size: 16px;
            line-height: 1.6;
            color: #475569; /* slate-600 */
            margin: 0 0 24px;
        }

        .code-box {
            background-color: #f8fafc; /* slate-50 */
            border-radius: 8px;
            padding: 16px;
            text-align: center;
            margin-bottom: 24px;
        }

        .code-box h2 {
            font-size: 36px;
            font-weight: 700;
            color: #0f172a; /* slate-900 */
            letter-spacing: 8px;
            margin: 0;
            font-family: 'Courier New', Courier, monospace;
        }

        .footer-note {
            font-size: 14px;
            color: #64748b; /* slate-500 */
        }

        .footer {
            padding: 20px 40px;
            text-align: center;
            font-size: 12px;
            color: #94a3b8; /* slate-400 */
        }

    </style>
</head>
<body style="background-color: #f1f5f9; margin: 0 !important; padding: 0 !important;">
    <table border="0" cellpadding="0" cellspacing="0" width="100%">
        <tr>
            <td align="center" class="container">
                <!--[if (gte mso 9)|(IE)]>
                <table align="center" border="0" cellspacing="0" cellpadding="0" width="600">
                <tr>
                <td align="center" valign="top" width="600">
                <![endif]-->
                <div class="content-card">
                    <div class="header">
                        <img src="https://fra.cloud.appwrite.io/v1/storage/buckets/686138bf0019a96102f4/files/688255f9002c8b126dd8/view?project=686136ad00033a8b1a47&mode=admin" alt="ArogyaCompass Logo">
                        <h1>ArogyaCompass</h1>
                        <p>Smart App for Faster Care</p>
                    </div>
                    <div class="main-content">
                        <h2>Hello ${user.name},</h2>
                        <p>Thank you for signing up. Please use the following verification code to complete your registration:</p>
                        
                        <div class="code-box">
                            <h2>${verificationCode}</h2>
                        </div>

                        <p class="footer-note">This code will expire in 10 minutes. If you did not request this code, you can safely ignore this email.</p>
                    </div>
                </div>
                <!--[if (gte mso 9)|(IE)]>
                </td>
                </tr>
                </table>
                <![endif]-->
                <div class="footer">
                    &copy; 2025 ArogyaCompass. All rights reserved.
                </div>
            </td>
        </tr>
    </table>
</body>
</html>`
      cookieStore.set("userId", existingUser.users[0].$id, {
        httpOnly: true,
        secure: true,
        sameSite: "lax",
        path: "/",
        maxAge: 60 * 60 * 24 * 7,
      });

      await resend.emails.send({
        from: "support@arogyacompass.cloud",
        to: user.email,
        subject: "Your Verification Code",
        html: emailHTML
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


export const getPatientWithDetail = async (userId: string, doctorName?: string) => {
  try {
    // 1. If doctorName is present, try fetching patient with primaryPhysician match
    if (doctorName) {
      const matchDoctor = await databases.listDocuments(
        DATABASE_ID!,
        PATIENT_COLLECTION_ID!,
        [
          Query.equal("userId", [userId]),
          Query.equal("primaryPhysician", [doctorName])
        ]
      );

      if (matchDoctor.documents.length > 0) {
        return {
          ...parseStringify(matchDoctor.documents[0]),
          matchedBy: "doctorName"
        };
      }
    }

    // 2. Else fallback: fetch by userId only
    const fallback = await databases.listDocuments(
      DATABASE_ID!,
      PATIENT_COLLECTION_ID!,
      [Query.equal("userId", [userId])]
    );

    if (fallback.documents.length > 0) {
      const patient = parseStringify(fallback.documents[0]);
      return {
        ...patient,
        matchedBy: doctorName ? "userIdOnly" : "testOnly",
        test: patient.test || null,
      };
    }

    // 3. No matching patient found
    return null;
  } catch (error) {
    console.error("Error in getPatientWithDetail:", error);
    return null;
  }
};


