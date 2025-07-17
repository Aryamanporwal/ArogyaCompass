import React from "react";
import Confetti from "react-confetti";
import useWindowSize from "@/hooks/useWindowSize"; // or implement your own hook to get window size

interface SuccessfulPaymentProps {
  onUnlock: () => void;
}

export function SuccessfulPayment({ onUnlock }: SuccessfulPaymentProps) {
  const { width, height } = useWindowSize();

  return (
    <div className="relative flex flex-col items-center justify-center gap-6 p-8 rounded-2xl bg-white dark:bg-[#121212] shadow-lg max-w-md mx-auto text-center">
      {/* Confetti */}
      <Confetti width={width} height={height} recycle={false} numberOfPieces={250} />

      {/* Text */}
      <h2 className="text-2xl font-extrabold text-purple-700 dark:text-purple-400">
        Thank You for Your Generous Donation!
      </h2>
      <p className="text-lg text-gray-800 dark:text-gray-300 leading-relaxed font-medium">
        You donated to save the life of one child.
      </p>
      <p className="text-base text-gray-700 dark:text-gray-400 italic">
        ArogyaCompass appreciates your love for India.
      </p>
      <p className="font-semibold text-gray-900 dark:text-white mt-2">
        You are rewarded with a Pro subscription of ArogyaCompass.
      </p>

      {/* Unlock Button */}
      <button
        onClick={onUnlock}
        className="mt-6 px-12 py-3 bg-gradient-to-r from-purple-600 to-indigo-700 rounded-lg text-white font-semibold shadow-lg hover:from-purple-700 hover:to-indigo-800 transition"
      >
        UNLOCK
      </button>
    </div>
  );
}
