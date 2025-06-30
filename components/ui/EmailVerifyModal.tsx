"use client";
import { useState } from "react";

interface Props {
  expectedCode: string;
  onSuccess: () => void;
}

const EmailVerifyModal = ({ expectedCode, onSuccess }: Props) => {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");

  const handleVerify = () => {
    if (code === expectedCode) {
      onSuccess();
    } else {
      setError("Invalid verification code.");
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-[1000] backdrop-blur-sm bg-black/30">
      <div className="bg-[#0f172a] text-white p-6 rounded-2xl w-full max-w-md text-center shadow-2xl border border-gray-700">
        <div className="text-2xl font-semibold mb-2 text-green-400">Verify Email</div>
        <p className="mb-4 text-gray-300">Enter the 6-digit code sent to your email.</p>

        <input
          type="text"
          className="w-full p-3 text-xl text-center tracking-widest bg-[#1e293b] border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
          maxLength={6}
          placeholder="------"
          value={code}
          onChange={(e) => setCode(e.target.value)}
        />

        {error && <p className="text-red-500 mt-2">{error}</p>}

        <button
          className="mt-6 w-full py-2 bg-green-500 hover:bg-green-600 text-white font-semibold rounded-md transition-all"
          onClick={handleVerify}
        >
          Verify
        </button>
      </div>
    </div>
  );
};

export default EmailVerifyModal;
