// firstAidFeed.action.ts
"use server";
import {
  DATABASE_ID,
  databases,
  FIRST_AID_VIDEO_UPLOAD_COLLECTION_ID,
  BUCKET_ID,
  ENDPOINT,
  PROJECT_ID
} from "@/lib/appwrite.config";

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

// Utility to generate preview URL
function generateVideoUrl(videoId: string): string {
  return `${ENDPOINT}/storage/buckets/${BUCKET_ID}/files/${videoId}/preview?project=${PROJECT_ID}`;
}

export async function getFirstAidVideos(): Promise<FirstAidVideo[]> {
  const res = await databases.listDocuments(DATABASE_ID!, FIRST_AID_VIDEO_UPLOAD_COLLECTION_ID!);

  const videos: FirstAidVideo[] = res.documents.map((doc) => {
    if (!doc.title || !doc.description || !doc.type) {
      throw new Error("Invalid document");
    }

    let videoUrl: string | null = null;

    if (doc.type === "upload" && doc.videoId) {
      videoUrl = generateVideoUrl(doc.videoId);
    }

    return {
      ...doc,
      videoUrl,
    } as unknown as FirstAidVideo;
  });

  return videos;
}
