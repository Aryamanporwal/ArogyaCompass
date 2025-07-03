
import { Client, Account, Models } from "appwrite";

export const getUserId = async (): Promise<string | null> => {
  try {
    const user: Models.User<Models.Preferences> = await account.get();
    return user.$id;
  } catch (err) {
    console.error("❌ Not logged in:", err);
    return null;
  }
};
