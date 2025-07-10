"use client";

import { useState } from "react";
import { SendHorizonal, Megaphone } from "lucide-react";
import { sendSMSToPatients } from "@/lib/actions/assistant.action";

interface Props {
  patients: { phone: string }[];
}

export default function BroadcastMessageBox({ patients }: Props) {
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [success, setSuccess] = useState<boolean | null>(null);

  const handleSend = async () => {
    if (!message.trim()) return;
    setSending(true);
    const result = await sendSMSToPatients(patients, message);
    setSuccess(result);
    setSending(false);
    setMessage("");
    setTimeout(() => setSuccess(null), 3000);
  };

  return (
    <div className="bg-white dark:bg-[#1e1e1e] p-6 rounded-xl shadow-md mb-8">
      <h3 className="text-lg font-semibold text-red-600 dark:text-red-400 flex items-center gap-2 mb-4">
        <Megaphone className="text-red-500 dark:text-red-400" size={20} />
        Alert All Patients
      </h3>

      <div className="flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type your alert message..."
          className="flex-grow rounded-md px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-[#121212] dark:text-white text-black text-sm"
        />
        <button
          onClick={handleSend}
          disabled={sending}
          className="flex items-center gap-2 px-4 py-2 rounded-md bg-blue-600 text-white text-sm hover:bg-blue-700 disabled:opacity-50 transition"
        >
          <SendHorizonal size={16} />
          {sending ? "Sending..." : "Send"}
        </button>
      </div>

      {success === true && (
        <p className="text-sm text-green-600 mt-2">✅ Message sent successfully!</p>
      )}
      {success === false && (
        <p className="text-sm text-red-600 mt-2">❌ Failed to send message.</p>
      )}
    </div>
  );
}
