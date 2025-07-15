// firstAidUpload.action.ts
"use server";
import { storage, databases, DATABASE_ID, FIRST_AID_VIDEO_UPLOAD_COLLECTION_ID, BUCKET_ID } from "@/lib/appwrite.config";
import { ID, Permission, Role } from "appwrite";

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

    // 🔐 Upload and make public (if needed)
    const uploaded = await storage.createFile(BUCKET_ID!, ID.unique(), file, [
      Permission.read(Role.any()) // 👈 or Role.user(userId) if private
    ]);

    videoId = uploaded.$id;
  }

  // Save to Appwrite Database (NO videoUrl)
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
      await storage.deleteFile(BUCKET_ID!, videoId);
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