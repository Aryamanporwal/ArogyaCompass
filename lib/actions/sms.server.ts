// lib/actions/sms.server.ts
"use server";
import twilio from "twilio";

const accountSid = process.env.TWILIO_ACCOUNT_SID!;
const authToken = process.env.TWILIO_AUTH_TOKEN!;
const fromNumber = process.env.TWILIO_PHONE_NUMBER!;

const client = twilio(accountSid, authToken);

export async function sendSMS(to: string, message: string) {
  try {
    const result = await client.messages.create({
      body: message,
      from: fromNumber,
      to : to.startsWith("+") ? to : `+${to}`, // Ensure phone number is in E.164 format
    });

    return result;
  } catch (error) {
    console.error("❌ Failed to send SMS:", error);
    throw error;
  }
}
