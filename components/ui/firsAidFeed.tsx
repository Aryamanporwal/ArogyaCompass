// "use client";
// import { useEffect, useState } from "react";
// import { getFirstAidVideos, FirstAidVideo } from "@/lib/actions/firstAidFeed.action";

// export default function FirstAidShortsFeed() {
// const [videos, setVideos] = useState<FirstAidVideo[]>([]);

// useEffect(() => {
//     async function fetchVideos() {
//     const vids = await getFirstAidVideos();
//     setVideos(vids);
//     }
//     fetchVideos();
//     }, []);

// return (
//         <div className="h-[80vh] w-full overflow-y-scroll flex flex-col gap-8">
//             {videos.map(video => (
//                 <div key={video.$id} className="flex flex-col items-center">
//                 <div className="w-full max-w-xs aspect-[9/16] bg-black rounded-lg shadow-lg flex items-center justify-center">
//             {video.type === "youtube" ? (
//                 <iframe
//                     className="w-full h-full"
//                      src={`https://www.youtube.com/embed/${extractYouTubeId(video.youtubeUrl ?? "")}`}
                    
//                      title={video.title}
//                      allow="autoplay; encrypted-media"
//                      allowFullScreen
//              />
              
//         ) : (
//         <video
//             src={video.videoUrl || undefined}
//             controls
//             autoPlay
//             muted
//             loop
//             className="w-full h-full rounded-lg"
//         />
//         )}
//         </div>
//             <div className="mt-2 text-lg font-semibold">{video.title}</div>
//             <div className="text-gray-400">{video.description}</div>
//         </div>
//         ))}
//         </div>
//     );
//     }

// // Helper to extract YouTube video ID from URL
// function extractYouTubeId(url: string) {
//    const match = url.match(/(?:youtube\.com.*v=|youtu\.be\/)([\w-]+)/);
//     return match ? match[1] : "";
// }


"use client";
import { useEffect, useState, useRef } from "react";
import { getFirstAidVideos, FirstAidVideo } from "@/lib/actions/firstAidFeed.action";
import { Swiper, SwiperSlide } from "swiper/react";
import { Mousewheel } from "swiper/modules";
import type { Swiper as SwiperType } from "swiper";
import "swiper/css";
import "swiper/css/mousewheel";

export default function FirstAidShortsFeed() {
  const [videos, setVideos] = useState<FirstAidVideo[]>([]);
  const videoRefs = useRef<Array<HTMLVideoElement | null>>([]);
  const swiperRef = useRef<SwiperType | null>(null);

  // Fetch videos
  useEffect(() => {
    async function fetchVideos() {
      const vids = await getFirstAidVideos();
      setVideos(vids);
    }
    fetchVideos();
  }, []);

  // Autoplay first video after videos are loaded
  useEffect(() => {
    if (videos.length > 0) {
      setTimeout(() => {
        const firstVideo = videoRefs.current[0];
        if (firstVideo) {
          firstVideo.play().catch(() => {});
        }
      }, 300); // Delay to ensure DOM is ready
    }
  }, [videos]);

  // Handle video playback on active slide change
  const handleActiveIndexChange = (swiper: SwiperType) => {
    videoRefs.current.forEach((video, index) => {
      if (!video) return;
      if (index === swiper.activeIndex) {
        video.play().catch(() => {});
      } else {
        video.pause();
        video.currentTime = 0;
      }
    });
  };

  return (
    <Swiper
      direction="vertical"
      slidesPerView={1}
      spaceBetween={0}
      mousewheel
      onActiveIndexChange={handleActiveIndexChange}
      onSwiper={(swiper) => {
        swiperRef.current = swiper;
      }}
      modules={[Mousewheel]}
      className="h-screen w-full"
    >
      {videos.map((video, index) => (
        <SwiperSlide key={video.$id}>
          <div className="h-screen w-full flex flex-col items-center justify-center bg-black text-white">
            <div className="w-full max-w-xs aspect-[9/16] rounded-lg shadow-lg overflow-hidden">
              {video.type === "youtube" ? (
                <iframe
                  className="w-full h-full"
                  src={`https://www.youtube.com/embed/${extractYouTubeId(video.youtubeUrl ?? "")}?autoplay=1&mute=1`}
                  title={video.title}
                  allow="autoplay; encrypted-media"
                  allowFullScreen
                />
              ) : (
                <video
                  ref={(el) => {
                    videoRefs.current[index] = el;
                  }}
                  src={video.videoUrl || undefined}
                  controls={false}
                  muted = {false}
                  loop
                  playsInline
                  className="w-full h-full object-cover"
                />
              )}
            </div>
            <div className="mt-4 text-xl font-bold">{video.title}</div>
            <div className="text-gray-400 text-sm px-4 text-center">{video.description}</div>
          </div>
        </SwiperSlide>
      ))}
    </Swiper>
  );
}

// Helper to extract YouTube video ID
function extractYouTubeId(url: string) {
  const match = url.match(/(?:youtube\.com.*v=|youtu\.be\/)([\w-]+)/);
  return match ? match[1] : "";
}
