"use server";
import { BUCKET_ID, DATABASE_ID, databases, ENDPOINT, FIRST_AID_VIDEO_UPLOAD_COLLECTION_ID, PROJECT_ID } from "@/lib/appwrite.config";

export interface FirstAidVideo {
  $id: string;
  title: string;
  description: string;
  type: "youtube" | "upload";
  youtubeUrl?: string;
  videoId?: string;
  videoUrl?: string | null;
  [key: string]: unknown;
}

export async function getFirstAidVideos(): Promise<FirstAidVideo[]> {
  const res = await databases.listDocuments(DATABASE_ID!, FIRST_AID_VIDEO_UPLOAD_COLLECTION_ID!);

  const withUrls: FirstAidVideo[] = await Promise.all(
    res.documents.map(async (doc) => {
      // Defensive: check for required fields
      if (!doc.title || !doc.description || !doc.type) {
        throw new Error("Document missing required fields");
      }
      let videoUrl: string | null = null;
      if (doc.type === "upload" && doc.videoId) {
        // Use .href for browser SDK (returns URL object)
        videoUrl = `${ENDPOINT}/storage/buckets/${BUCKET_ID}/files/${doc.videoFileId}/preview?project=${PROJECT_ID}`;
      }
      return { ...doc, videoUrl } as unknown as FirstAidVideo;
    })
  );
  return withUrls;
}
