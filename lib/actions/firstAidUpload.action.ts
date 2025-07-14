"use server";
import { storage, databases, DATABASE_ID, FIRST_AID_VIDEO_UPLOAD_COLLECTION_ID } from "@/lib/appwrite.config"; // adjust import as per your setup
import { ID } from "appwrite";

// This function receives FormData from the client
export async function uploadFirstAidVideo(formData: FormData) {
  const type = formData.get("type") as string;
  const title = formData.get("title") as string;
  const description = formData.get("description") as string;
  const userId = formData.get("userId") as string;

  let videoId: string | null = null;
  let youtubeUrl: string | null = null;

  if (type === "youtube") {
    youtubeUrl = formData.get("youtubeUrl") as string;
  } else if (type === "upload") {
    const file = formData.get("video") as File;
    if (!file) throw new Error("No video file provided");
    // Upload to Appwrite Storage
    const uploaded = await storage.createFile("firstaid-videos", ID.unique(), file);
    videoId = uploaded.$id;
  }

  // Save metadata to Appwrite Database
  await databases.createDocument(
    DATABASE_ID!,
    FIRST_AID_VIDEO_UPLOAD_COLLECTION_ID!,
    ID.unique(),
    {
      title,
      description,
      type,
      youtubeUrl,
      videoId,
      userId,
    }
  );

  return { success: true };
}


export async function deleteFirstAidVideo({
  docId,
  type,
  videoId,
}: {
  docId: string;
  type: "youtube" | "upload";
  videoId?: string | null;
}) {
  // Delete from Storage if uploaded file
  if (type === "upload" && videoId) {
    try {
      await storage.deleteFile("firstaid-videos", videoId);
    } catch (err) {
      // File might already be deleted, ignore error
      console.log(err);
    }
  }
  // Delete from Database
  await databases.deleteDocument(
    DATABASE_ID!,
    FIRST_AID_VIDEO_UPLOAD_COLLECTION_ID!,
    docId
  );
  return { success: true };
}