"use server";
import { cookies } from "next/headers";

export const getUserIdFromCookie = async (): Promise<string | null> => {
  const cookieStore = await cookies();
  return cookieStore.get("userId")?.value ?? null;
};
