"use client";
import { useState, ChangeEvent, FormEvent } from "react";
import { uploadFirstAidVideo } from "@/lib/actions/firstAidUpload.action";

interface FirstAidUploadProps {
  userId: string;
  darkMode: boolean;
  onUploadSuccess?: () => void;
}

export default function FirstAidUpload({ userId, darkMode , onUploadSuccess}: FirstAidUploadProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [type, setType] = useState<"youtube" | "upload">("youtube");
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [video, setVideo] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);

  const handleVideoChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setVideo(e.target.files[0]);
    } else {
      setVideo(null);
    }
  };

 const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setUploading(true);

    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    formData.append("type", type);
    formData.append("userId", userId);

    if (type === "youtube") {
      formData.append("youtubeUrl", youtubeUrl);
    } else {
      if (video) {
        formData.append("video", video);
      } else {
        setUploading(false);
        alert("Please select a video file.");
        return;
      }
    }

    try {
      await uploadFirstAidVideo(formData);
      setTitle("");
      setDescription("");
      setYoutubeUrl("");
      setVideo(null);
      if (onUploadSuccess) onUploadSuccess();
      // Optionally, show a toast
    } catch {
      alert("Upload failed.");
    }
    setUploading(false);
  };


  return (
    <form
      onSubmit={handleSubmit}
      className={`
        max-w-md mx-auto p-8 rounded-2xl shadow-2xl flex flex-col gap-5 border
        ${darkMode
          ? "bg-gradient-to-br from-[#151a28] to-[#222d44] border-blue-900 text-white"
          : "bg-white border-gray-200 text-gray-900"}
      `}
    >
      <h2 className={`text-2xl font-bold mb-2 ${darkMode ? "text-blue-300" : "text-blue-700"}`}>
        Upload First Aid Video
      </h2>
      <input
        className={`
          border rounded-lg p-3 outline-none transition
          ${darkMode
            ? "bg-[#192133] border-blue-900 text-white placeholder:text-gray-400 focus:ring-2 focus:ring-blue-600"
            : "bg-gray-50 border-gray-300 text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500"}
        `}
        type="text"
        placeholder="Title"
        value={title}
        onChange={e => setTitle(e.target.value)}
        required
      />
      <textarea
        className={`
          border rounded-lg p-3 outline-none transition resize-none min-h-[80px]
          ${darkMode
            ? "bg-[#192133] border-blue-900 text-white placeholder:text-gray-400 focus:ring-2 focus:ring-blue-600"
            : "bg-gray-50 border-gray-300 text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500"}
        `}
        placeholder="Description"
        value={description}
        onChange={e => setDescription(e.target.value)}
      />
      <select
        value={type}
        onChange={e => setType(e.target.value as "youtube"||"upload")}
        className={`
          border rounded-lg p-3 outline-none transition
          ${darkMode
            ? "bg-[#192133] border-blue-900 text-white focus:ring-2 focus:ring-blue-600"
            : "bg-gray-50 border-gray-300 text-gray-900 focus:ring-2 focus:ring-blue-500"}
        `}
      >
        <option value="youtube">YouTube Link</option>
        <option value="upload">Upload File</option>
      </select>
      {type === "youtube" ? (
        <input
          className={`
            border rounded-lg p-3 outline-none transition
            ${darkMode
              ? "bg-[#192133] border-blue-900 text-white placeholder:text-gray-400 focus:ring-2 focus:ring-blue-600"
              : "bg-gray-50 border-gray-300 text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-blue-500"}
          `}
          type="url"
          placeholder="YouTube URL"
          value={youtubeUrl}
          onChange={e => setYoutubeUrl(e.target.value)}
          required
        />
      ) : (
        <input
          className={`
            border rounded-lg p-3 outline-none transition
            file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0
            file:text-sm file:font-semibold
            ${darkMode
              ? "bg-[#192133] border-blue-900 text-white file:bg-blue-800 file:text-white"
              : "bg-gray-50 border-gray-300 text-gray-900 file:bg-blue-100 file:text-blue-700"}
          `}
          type="file"
          accept="video/*"
          onChange={handleVideoChange}
          required
        />
      )}
      <button
        type="submit"
        className={`
          w-full py-3 rounded-lg font-semibold text-base shadow transition
          ${darkMode
            ? "bg-blue-700 hover:bg-blue-600 text-white"
            : "bg-blue-600 hover:bg-blue-700 text-white"}
        `}
        disabled={uploading}
      >
        {uploading ? "Uploading..." : "Upload"}
      </button>
    </form>
  );
}
