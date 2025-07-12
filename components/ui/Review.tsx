"use client";

import { useEffect, useState } from "react";
import { Star } from "lucide-react";
import  {createReview,getAllReviews}  from "@/lib/actions/review.action";

interface Review {
  $id: string;
  name: string;
  message: string;
  rating: number;
}

export default function ReviewSection() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [form, setForm] = useState<Pick<Review, "name" | "message" | "rating">>({
  name: "",
  message: "",
  rating: 0,
});

  useEffect(() => {
    getAllReviews().then((data) => setReviews(data as Review[]));
  }, []);

    const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name || !form.message || !form.rating) return;

    const res: Review = await createReview(form);
    setReviews((prev) => [res, ...prev]);
    setForm({ name: "", message: "", rating: 0 });
    };

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-center text-blue-600 dark:text-blue-400">
        Share Your Experience
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          placeholder="Your Name"
          className="w-full rounded-md border border-gray-300 p-2 text-sm dark:bg-[#1c1c1c] dark:border-gray-700 dark:text-white"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          required
        />
        <textarea
          placeholder="Write your thoughts here..."
          className="w-full h-24 rounded-md border border-gray-300 p-2 text-sm dark:bg-[#1c1c1c] dark:border-gray-700 dark:text-white"
          value={form.message}
          onChange={(e) => setForm({ ...form, message: e.target.value })}
          required
        />

        {/* Star Rating */}
        <div className="flex items-center gap-2">
          {[1, 2, 3, 4, 5].map((num) => (
            <Star
              key={num}
              className={`cursor-pointer w-5 h-5 ${
                form.rating >= num ? "text-yellow-400" : "text-gray-400"
              }`}
              onClick={() => setForm({ ...form, rating: num })}
              fill={form.rating >= num ? "currentColor" : "none"}
            />
          ))}
        </div>

        <button
          type="submit"
          className="w-full py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 transition"
        >
          Submit Review
        </button>
      </form>

      {/* Display Reviews */}
      <div className="space-y-4">
        {reviews.map((r) => (
          <div
            key={r.$id}
            className="rounded-lg bg-white dark:bg-[#2c2c2c] p-4 border border-gray-200 dark:border-gray-700"
          >
            <div className="flex justify-between items-center">
              <h3 className="font-semibold text-gray-800 dark:text-white">{r.name}</h3>
              <div className="flex gap-0.5">
                {[1, 2, 3, 4, 5].map((num) => (
                  <Star
                    key={num}
                    className={`w-4 h-4 ${
                      r.rating >= num ? "text-yellow-400" : "text-gray-300 dark:text-gray-600"
                    }`}
                    fill={r.rating >= num ? "currentColor" : "none"}
                  />
                ))}
              </div>
            </div>
            <p className="text-sm text-gray-600 dark:text-gray-300 mt-1">{r.message}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
