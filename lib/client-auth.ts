"use client"
import { Client, Account, Models } from "appwrite";

const client = new Client();

client
  .setEndpoint(process.env.NEXT_PUBLIC_ENDPOINT!) // Use public endpoint
  .setProject(process.env.PROJECT_ID!);           // Public project ID

const account = new Account(client);

export const getUserId = async (): Promise<string | null> => {
  try {
    const user: Models.User<Models.Preferences> = await account.get();
    return user.$id;
  } catch (err) {
    console.error("❌ Not logged in:", err);
    return null;
  }
};
