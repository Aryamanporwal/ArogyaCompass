"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { searchByPasskey } from "@/lib/actions/admin.action";
import { Loader2 } from "lucide-react";

interface AdminPasskeyLoginProps{
  onClose?: () => void;
}

export default function AdminPasskeyLogin({ onClose }: AdminPasskeyLoginProps) {
  const [passkey, setPasskey] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const router = useRouter();

  const handleVerify = async () => {
    if (passkey.length !== 6) {
      setErrorMsg("Passkey must be 6 digits.");
      return;
    }

    setLoading(true);
    setErrorMsg("");

    const result = await searchByPasskey(passkey);

    if (!result) {
      setErrorMsg("❌ Invalid passkey. Please try again.");
      setLoading(false);
      return;
    }

    const { role, id } = result;

    router.push(`/${role}/${id}/dashboard`);
  };

  return (
    <div className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/50 backdrop-blur-sm px-4">
      <div className="bg-[#111827] text-white rounded-2xl shadow-2xl px-8 py-6 w-full max-w-md">
        <button
          onClick={onClose}
          className="absolute top-3 right-4 text-gray-400 hover:text-white text-xl font-bold"
        >
          &times;
        </button>
        <h2 className="text-center text-2xl font-bold text-green-500 mb-2">Admin Login</h2>
        <p className="text-center text-sm text-gray-300 mb-6">
          Enter your 6-digit secure passkey
        </p>

        <input
          type="text"
          value={passkey}
          onChange={(e) => setPasskey(e.target.value)}
          maxLength={6}
          className="w-full text-center tracking-widest text-lg py-3 rounded-md bg-gray-800 text-white border border-gray-600 focus:ring-2 focus:ring-green-500 outline-none"
        />

        <button
          onClick={handleVerify}
          disabled={loading}
          className="mt-6 w-full bg-green-600 hover:bg-green-700 text-white py-2 rounded-md transition duration-300 disabled:opacity-50"
        >
          {loading ? <Loader2 className="animate-spin mx-auto" /> : "Verify"}
        </button>

        {errorMsg && (
          <p className="mt-4 text-center text-sm text-red-400 font-medium">{errorMsg}</p>
        )}
      </div>
    </div>
  );
}
