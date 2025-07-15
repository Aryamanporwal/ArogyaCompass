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
import { Heart, Share2, Bookmark } from "lucide-react";
import "swiper/css";
import "swiper/css/mousewheel";

export default function FirstAidShortsFeed() {
  const [videos, setVideos] = useState<FirstAidVideo[]>([]);
  const videoRefs = useRef<Array<HTMLVideoElement | null>>([]);
  const swiperRef = useRef<SwiperType | null>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [likedVideos, setLikedVideos] = useState<Record<string, boolean>>({});


  // Fetch videos
  useEffect(() => {
    async function fetchVideos() {
      const vids = await getFirstAidVideos();
      setVideos(vids);
    }
    fetchVideos();
  }, []);

  // Autoplay the first video when videos are loaded
  useEffect(() => {
    if (videos.length > 0) {
      setTimeout(() => {
        const firstVideo = videoRefs.current[0];
        if (firstVideo) {
          firstVideo.play().catch(() => {});
        }
      }, 300);
    }
  }, [videos]);

  // Handle slide change: only play active video
  const handleActiveIndexChange = (swiper: SwiperType) => {
    setActiveIndex(swiper.activeIndex);
    videoRefs.current.forEach((video, idx) => {
      if (!video) return;
      if (idx === swiper.activeIndex) {
        video.play().catch(() => {});
        video.muted = false;
      } else {
        video.pause();
        video.currentTime = 0;
        video.muted = true;
      }
    });
  };

  //like button 
  const toggleLike = (videoId: string) => {
  setLikedVideos((prev) => ({
    ...prev,
    [videoId]: !prev[videoId],
  }));
};
  // Share function
  function handleShare(video: FirstAidVideo) {
    const shareUrl =
      video.type === "youtube"
        ? video.youtubeUrl ?? window.location.href
        : video.videoUrl ?? window.location.href;

    const shareData = {
      title: video.title,
      text: video.description,
      url: shareUrl,
    };

    if (navigator.share) {
      navigator.share(shareData).catch(() => {
        navigator.clipboard.writeText(shareUrl);
        alert("Link copied to clipboard!");
      });
    } else {
      navigator.clipboard.writeText(shareUrl);
      alert("Link copied to clipboard!");
    }
  }

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
          <div className="relative h-screen w-full bg-black overflow-hidden">
            {/* Centered Video */}
            <div className="absolute inset-0 flex justify-center items-center">
              <div className="w-full max-w-[400px] aspect-[9/16] relative rounded-lg overflow-hidden shadow-lg">
                {video.type === "youtube" ? (
                  <iframe
                    className="w-full h-full absolute inset-0"
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
                    loop
                    muted={index !== activeIndex}
                    playsInline
                    autoPlay={index === activeIndex}
                    className="w-full h-full object-cover absolute inset-0"
                  />
                )}

                {/* Bottom Overlay with Title & Description */}
                <div className="absolute bottom-0 w-full px-4 py-6 bg-gradient-to-t from-black/80 to-transparent text-white pointer-events-none">
                  <h2 className="text-lg font-semibold mb-1 line-clamp-2">
                    {video.title}
                  </h2>
                  <p className="text-sm text-gray-300 line-clamp-3">
                    {video.description}
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="absolute right-4 bottom-28 flex flex-col items-center space-y-6 text-white z-10">
                  <button
                    className="hover:scale-110 transition active:scale-95 bg-black/40 rounded-full p-2"
                    title="Like"
                    onClick={() => toggleLike(video.$id)}
                  >
                    <Heart
                      size={28}
                      className={`transition-colors duration-200 ${
                        likedVideos[video.$id] ? "text-pink-500 fill-pink-500" : "text-white"
                      }`}
                    />
                  </button>
                  <button
                    className="hover:scale-110 transition active:scale-95 bg-black/40 rounded-full p-2"
                    title="Share"
                    onClick={() => handleShare(video)}
                  >
                    <Share2 size={28} />
                  </button>
                  <button
                    className="hover:scale-110 transition active:scale-95 bg-black/40 rounded-full p-2"
                    title="Save"
                    onClick={() => alert("Saved 🔖")}
                  >
                    <Bookmark size={28} />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </SwiperSlide>
      ))}
    </Swiper>
  );
}

// Helper to extract YouTube video ID
function extractYouTubeId(url: string) {
  const match = url.match(
    /(?:youtube\.com.*[?&]v=|youtu\.be\/|youtube\.com\/embed\/)([\w-]+)/
  );
  return match ? match[1] : "";
}
