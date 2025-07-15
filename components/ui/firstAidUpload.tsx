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
    max-w-md mx-auto p-6 rounded-xl shadow-lg flex flex-col gap-4 border
    ${darkMode
      ? "bg-[#13151c] border-[#273864] text-white"
      : "bg-slate-50 border-slate-200 text-slate-900"}
  `}
>
  <h2
    className={`text-xl font-semibold tracking-tight mb-1 ${darkMode ? "text-blue-400" : "text-blue-700"}`}
  >
    Upload First Aid Video
  </h2>
  <input
    className={`
      border rounded-md p-2 outline-none transition
      text-base
      ${darkMode
        ? "bg-[#151929] border-[#273864] text-white placeholder:text-blue-100 focus:ring-2 focus:ring-blue-700"
        : "bg-white border-slate-300 text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-blue-400"}
    `}
    type="text"
    placeholder="Title"
    value={title}
    onChange={e => setTitle(e.target.value)}
    required
  />
  <textarea
    className={`
      border rounded-md p-2 outline-none resize-none min-h-[60px]
      ${darkMode
        ? "bg-[#151929] border-[#273864] text-white placeholder:text-blue-100 focus:ring-2 focus:ring-blue-700"
        : "bg-white border-slate-300 text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-blue-400"}
    `}
    placeholder="Description"
    value={description}
    onChange={e => setDescription(e.target.value)}
  />
  <select
    value={type}
    onChange={e => setType(e.target.value as "youtube"|"upload")}
    className={`
      border rounded-md p-2 outline-none text-base
      ${darkMode
        ? "bg-[#151929] border-[#273864] text-white focus:ring-2 focus:ring-blue-700"
        : "bg-white border-slate-300 text-slate-900 focus:ring-2 focus:ring-blue-400"}
    `}
  >
    <option value="youtube">YouTube Link</option>
    <option value="upload">Upload File</option>
  </select>
  {type === "youtube" ? (
    <input
      className={`
        border rounded-md p-2 outline-none transition
        ${darkMode
          ? "bg-[#151929] border-[#273864] text-white placeholder:text-blue-100 focus:ring-2 focus:ring-blue-700"
          : "bg-white border-slate-300 text-slate-900 placeholder:text-slate-400 focus:ring-2 focus:ring-blue-400"}
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
        border rounded-md p-2 outline-none transition file:mr-3 file:py-1.5 file:px-3 file:rounded
        file:border-0 file:text-sm file:font-medium
        ${darkMode
          ? "bg-[#151929] border-[#273864] text-white file:bg-blue-900 file:text-white"
          : "bg-white border-slate-300 text-slate-900 file:bg-blue-100 file:text-blue-700"}
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
      w-full py-2.5 rounded-md font-semibold text-base shadow transition
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
