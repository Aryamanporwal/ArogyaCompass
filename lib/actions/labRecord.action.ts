"use server"
import { InputFile } from "node-appwrite/file";
import { ID, Query } from "node-appwrite";
import { storage, databases, ENDPOINT, BUCKET_ID, PROJECT_ID, DATABASE_ID, LAB_RECORD_COLLECTION_ID } from "@/lib/appwrite.config";
import { sendReportEmailWithPDF } from "./sendReportEmailwithPDF";

export async function uploadLabTestReport(file: File) {
  const arrayBuffer = await file.arrayBuffer();
  const inputFile = InputFile.fromBuffer(Buffer.from(arrayBuffer), file.name);

  const uploadedFile = await storage.createFile(
    BUCKET_ID!,
    ID.unique(),
    inputFile
  );

  return {
    fileUrl: `${ENDPOINT}/storage/buckets/${BUCKET_ID}/files/${uploadedFile.$id}/view?project=${PROJECT_ID}`,
    fileId: uploadedFile.$id,
    fileName: uploadedFile.name,
    fileBuffer: Buffer.from(arrayBuffer), // for email
  };
}

export async function saveLabTestReport(details: {
  file: File;
  labId: string;
  labName: string;
  labContact: string;
  userId: string;
  patientName: string;
  patientEmail: string;
  patientPhone: string;
}) {
  const { file, patientEmail, patientName, ...data } = details;

  const uploaded = await uploadLabTestReport(file);

  const res = await databases.createDocument(
    DATABASE_ID!,
    LAB_RECORD_COLLECTION_ID!,
    ID.unique(),
    {
      ...data,
      patientEmail,
      patientName,
      timestamp: new Date().toISOString(),
      testReport: uploaded.fileName,
      testReportId: uploaded.fileId,
      testReportUrl: uploaded.fileUrl,
    }
  );

  // 📨 Send email with attached PDF
  const base64PDF = uploaded.fileBuffer.toString("base64");
  await sendReportEmailWithPDF(patientEmail, base64PDF, patientName);

  return res;
}


export async function getLabTestReports(labId: string) {
    try{

        const response = await databases.listDocuments(
          DATABASE_ID!,
          LAB_RECORD_COLLECTION_ID!,
          [Query.equal("labId", labId)]
        );
        return response.documents;
    }
    catch (error) {
        console.error("Error fetching lab test reports:", error);
        return [];
    }
}