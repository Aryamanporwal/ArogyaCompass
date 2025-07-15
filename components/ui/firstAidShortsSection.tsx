"use client";
import { useState, useEffect } from "react";
import { getFirstAidVideos, FirstAidVideo } from "@/lib/actions/firstAidFeed.action";
import { deleteFirstAidVideo } from "@/lib/actions/firstAidUpload.action";
import { Trash2 } from "lucide-react"; // or any icon lib
import FirstAidUpload from "./firstAidUpload";

export default function FirstAidShortsSection({ userId, darkMode }: { userId: string, darkMode: boolean }) {
  const [videos, setVideos] = useState<FirstAidVideo[]>([]);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [refreshFlag, setRefreshFlag] = useState(0);

  useEffect(() => {
    (async () => {
      const vids = await getFirstAidVideos();
      setVideos(vids);
    })();
  }, [refreshFlag]);

  async function handleDelete(video: FirstAidVideo) {
    if (!confirm("Are you sure you want to delete this video?")) return;
    setDeletingId(video.$id);
    await deleteFirstAidVideo({
      docId: video.$id,
      type: video.type,
      videoId: video.videoId || null || undefined ,
    });
    setDeletingId(null);
    setRefreshFlag(f => f + 1);
  }

  function handleUploadSuccess() {
    setRefreshFlag(f => f + 1);
  }

  return (
      <div className="flex flex-col min-h-[90vh]">
        {/* Feed Grid */}
        <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 p-4">
          {videos.map(video => (
            <div
              key={video.$id}
              className={`
                relative rounded-xl shadow-md border p-3 flex flex-col gap-2
                transition-transform hover:scale-[1.01]
                ${darkMode
                  ? "bg-[#10131B] border-[#2B3A57] text-white"
                  : "bg-white border-slate-200 text-gray-900"}
              `}
            >
              {/* Delete Icon */}
              <button
                title="Delete"
                onClick={() => handleDelete(video)}
                disabled={deletingId === video.$id}
                className="absolute top-3 right-3 text-red-500 hover:text-red-700"
              >
                <Trash2 size={20} />
              </button>

              {/* Video / Thumbnail */}
              <div className="w-full aspect-video bg-black rounded-lg overflow-hidden">
                {video.type === "youtube" ? (
                  <iframe
                    className="w-full h-full"
                    src={`https://www.youtube.com/embed/${extractYouTubeId(video.youtubeUrl ?? "")}`}
                    title={video.title}
                    allow="autoplay; encrypted-media"
                    allowFullScreen
                    loading="lazy"
                  />
                ) : (
                  <video
                    src={video.videoUrl || undefined}
                    controls
                    className="w-full h-full object-cover"
                  />
                )}
              </div>

              {/* Title & Description */}
              <div className="flex-1">
                <div className="font-semibold text-base truncate">{video.title}</div>
                <p className="text-sm opacity-70 line-clamp-2">{video.description}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Upload Form Section */}
        <div className="mt-8 mb-4 max-w-3xl mx-auto w-full px-4">
          <FirstAidUpload userId={userId} darkMode={darkMode} onUploadSuccess={handleUploadSuccess} />
        </div>
      </div>
  );
}

// Helper to extract YouTube video ID from URL
function extractYouTubeId(url: string) {
  const match = url.match(/(?:youtube\.com.*v=|youtu\.be\/)([\w-]+)/);
  return match ? match[1] : "";
}
