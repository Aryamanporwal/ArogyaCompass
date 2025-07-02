"use server";

import { databases } from "@/lib/appwrite.config";
import { DATABASE_ID, HOSPITAL_COLLECTION_ID, LAB_COLLECTION_ID } from "@/lib/appwrite.config";
import Razorpay from "razorpay";
import {   NextResponse } from "next/server";

const razorpay = new Razorpay({
  key_id : process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
})

export async function updateHospitalStatus(
  id: string,
  isVerified: boolean,
  istrueLocation: boolean,
  timestamp: Date | string // Accepts Date object or ISO string
) {
  const isoTimestamp = typeof timestamp === "string" ? timestamp : timestamp.toISOString();

  return await databases.updateDocument(DATABASE_ID!, HOSPITAL_COLLECTION_ID!, id, {
    isVerified,
    istrueLocation,
    timestamp: isoTimestamp,
  });
}

export async function updateLabStatus(
  id: string,
  isVerified: boolean,
  istrueLocation: boolean,
  timestamp: Date | string // Accepts Date object or ISO string
) {
  const isoTimestamp = typeof timestamp === "string" ? timestamp : timestamp.toISOString();

  return await databases.updateDocument(DATABASE_ID!, LAB_COLLECTION_ID!, id, {
    isVerified,
    istrueLocation,
    timestamp: isoTimestamp,
  });
}

export async function getHospitalById(id: string) {
  try {
    const hospital = await databases.getDocument(DATABASE_ID!, HOSPITAL_COLLECTION_ID!, id);
    return hospital;
  } catch (err) {
    console.error("Error fetching hospital:", err);
    return null;
  }
}

export async function getLabById(id: string) {
  try {
    const lab = await databases.getDocument(DATABASE_ID!, LAB_COLLECTION_ID!, id);
    return lab;
  } catch (err) {
    console.error("Error fetching lab:", err);
    return null;
  }
}


export async function POST(){
  try{
    const order = await razorpay.orders.create({
      amount : 100*100,
      currency : "INR",
      receipt : "receipt_" + Math.random().toString(36).substring(7),
    });

    return NextResponse.json({orderId : order.id }, {status : 200});
  }catch(error){
    console.error("Error Creating order : ", error);
    return NextResponse.json(
      {error: "Error creating the order"},
      {status : 500}
    );
  }
}



