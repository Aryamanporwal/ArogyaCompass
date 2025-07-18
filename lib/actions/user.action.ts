"use server";
import { cookies } from "next/headers";
import { users } from "@/lib/appwrite.config";

export const getUserIdFromCookie = async (): Promise<string | null> => {
  const cookieStore = await cookies();
  return cookieStore.get("userId")?.value ?? null;
};

export const getUserNameById = async (userId: string): Promise<string | null> => {
  try {
    const user = await users.get(userId);
    return user.name;
  } catch (error) {
    console.error("Error fetching user:", error);
    return null;
  }
}
