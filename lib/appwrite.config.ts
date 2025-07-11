import * as sdk from "node-appwrite";

export const {
  NEXT_PUBLIC_ENDPOINT: ENDPOINT,
  PROJECT_ID,
  API_KEY,
  DATABASE_ID,
  PATIENT_COLLECTION_ID,
  DOCTOR_COLLECTION_ID,
  HOSPITAL_COLLECTION_ID,
  APPOINTMENT_COLLECTION_ID,
  LAB_COLLECTION_ID,
  ASSISTANT_COLLECTION_ID,
  MEDICINE_RECORD_COLLECTION_ID,
  NEXT_PUBLIC_BUCKET_ID: BUCKET_ID,
  LAB_RECORD_COLLECTION_ID,
  ATTENDANCE_COLLECTION_ID,
  DOCTOR_ATTENDANCE_COLLECTION_ID,
} = process.env;

const client = new sdk.Client();

client.setEndpoint(ENDPOINT!).setProject(PROJECT_ID!).setKey(API_KEY!);

export const account = new sdk.Account(client);
export const databases = new sdk.Databases(client);
export const users = new sdk.Users(client);
export const messaging = new sdk.Messaging(client);
export const storage = new sdk.Storage(client);
export const ID = sdk.ID;

