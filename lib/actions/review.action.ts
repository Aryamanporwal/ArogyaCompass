// app/lib/actions/review.action.ts
'use server';

import { databases , DATABASE_ID, REVIEW_COLLECTION_ID} from '@/lib/appwrite.config';
import { ID } from 'appwrite';

export type Review = {
    $id: string;
    name:  string;
    message : string;
    rating: number;
}

export const createReview = async (data: {
  name: string;
  message: string;
  rating: number;
}): Promise<Review> => {
  const res = await databases.createDocument(
    DATABASE_ID!,
    REVIEW_COLLECTION_ID!,
    ID.unique(),
    data
  );
  return res as unknown as  Review;
};

export async function getAllReviews() {
  try {
    const response = await databases.listDocuments(DATABASE_ID!, REVIEW_COLLECTION_ID!, []);
    return response.documents as unknown as Review[];
  } catch (error) {
    console.error('Error fetching reviews:', error);
    return [];
  }
}
