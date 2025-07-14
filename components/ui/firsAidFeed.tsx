"use client";
import { useEffect, useState } from "react";
import { getFirstAidVideos, FirstAidVideo } from "@/lib/actions/firstAidFeed.action";

export default function FirstAidShortsFeed() {
const [videos, setVideos] = useState<FirstAidVideo[]>([]);

useEffect(() => {
    async function fetchVideos() {
    const vids = await getFirstAidVideos();
    setVideos(vids);
    }
    fetchVideos();
    }, []);

return (
        <div className="h-[80vh] w-full overflow-y-scroll flex flex-col gap-8">
            {videos.map(video => (
                <div key={video.$id} className="flex flex-col items-center">
                <div className="w-full max-w-xs aspect-[9/16] bg-black rounded-lg shadow-lg flex items-center justify-center">
            {video.type === "youtube" ? (
                <iframe
                    className="w-full h-full"
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
            <div className="mt-2 text-lg font-semibold">{video.title}</div>
            <div className="text-gray-400">{video.description}</div>
        </div>
        ))}
        </div>
    );
    }

// Helper to extract YouTube video ID from URL
function extractYouTubeId(url: string) {
   const match = url.match(/(?:youtube\.com.*v=|youtu\.be\/)([\w-]+)/);
    return match ? match[1] : "";
}