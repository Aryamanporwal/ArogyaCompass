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
      {/* Feed */}
      <div className="flex-1 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8 p-4">
        {videos.map(video => (
          <div
            key={video.$id}
            className={`
              relative rounded-2xl shadow-lg border flex flex-col gap-2 p-4
              ${darkMode
                ? "bg-[#151a28] border-blue-900 text-white"
                : "bg-white border-gray-200 text-gray-900"}
            `}
          >
            {/* Delete Icon */}
            <button
              className="absolute top-4 right-4 text-red-500 hover:text-red-700"
              onClick={() => handleDelete(video)}
              disabled={deletingId === video.$id}
              title="Delete video"
            >
              <Trash2 size={22} />
            </button>
            <div className="w-full aspect-[9/16] bg-black rounded-lg flex items-center justify-center mb-2">
              {video.type === "youtube" ? (
                <iframe
                  className="w-full h-full rounded-lg"
                  src={`https://www.youtube.com/embed/${extractYouTubeId(video.youtubeUrl ?? "")}`}
                  title={video.title}
                  allow="autoplay; encrypted-media"
                  allowFullScreen
                />
              ) : (
                <video
                  src={video.videoUrl || undefined}
                  controls
                  autoPlay
                  muted
                  loop
                  className="w-full h-full rounded-lg"
                />
              )}
            </div>
            <div className="font-semibold text-lg">{video.title}</div>
            <div className="text-gray-400 text-sm">{video.description}</div>
          </div>
        ))}
      </div>
      {/* Upload Form at the bottom */}
      <div className="mt-8 mb-4">
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
