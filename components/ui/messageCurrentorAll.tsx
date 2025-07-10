"use client";

import { useState } from "react";
import { SendHorizonal, MessageSquareHeart } from "lucide-react";
import { sendSMS } from "@/lib/actions/sms.server";
import {
  getPendingAppointmentByUserId,
  markAppointmentDone,
} from "@/lib/actions/appointment.action";

interface Patient {
  name: string;
  phone: string;
  userId: string;
}

interface Props {
  currentPatient: Patient;
  allPatients: Patient[];
  patientIndex: number;
  onSuccess?: ()=>void;
}

export default function MessageCurrentOrAllPatients({
  currentPatient,
  allPatients,
  patientIndex,
  onSuccess,
}: Props) {
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [successSend, setSuccessSend] = useState<null | boolean>(null);
  const [successSubmit, setSuccessSubmit] = useState<null | boolean>(null);

  const isTemplateMsg = ["5", "10", "15"].some((val) =>
    message.includes(`next in ${val}`)
  );

  const handleSend = async () => {
    if (!message.trim()) return;
    setSending(true);

    try {
      if (isTemplateMsg) {
        const interval = parseInt(message.match(/\d+/)?.[0] || "0", 10);
        if (!interval) throw new Error("Invalid interval");

        const smsJobs = allPatients.map((p, index) => {
          const eta = interval * (index - patientIndex);
          if (eta < 0) return null;
          const personalizedMsg = `Hello ${p.name}, your appointment is in approximately ${eta} mins.`;
          return sendSMS(`+${p.phone}`, personalizedMsg);
        });

        await Promise.all(smsJobs.filter(Boolean));
      } else {
        await sendSMS(`+${currentPatient.phone}`, message);
      }

      setSuccessSend(true);
    } catch (err) {
      console.error(err);
      setSuccessSend(false);
    } finally {
      setSending(false);
      setMessage("");
      setTimeout(() => setSuccessSend(null), 3000);
    }
  };

  const handleMarkDone = async () => {
    if (!allPatients[patientIndex]?.userId) return;

    setSending(true);
    try {
      const currentUserId = allPatients[patientIndex].userId;
      const currentAppt = await getPendingAppointmentByUserId(currentUserId);
      if (!currentAppt?.$id) throw new Error("Appointment not found");

      await markAppointmentDone(currentAppt.$id);
      setSuccessSubmit(true);
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error("Error marking done:", error);
      setSuccessSubmit(false);
    } finally {
      setSending(false);
      setTimeout(() => setSuccessSubmit(null), 3000);
    }
  };

  const templateOptions = ["next in 5 mins", "next in 10 mins", "next in 15 mins"];

  return (
    <div className="bg-white dark:bg-[#1e1e1e] p-6 rounded-xl shadow-md w-full sm:w-1/2 mx-auto">
      <h3 className="text-lg font-semibold text-indigo-600 dark:text-indigo-400 flex items-center gap-2 mb-3">
        <MessageSquareHeart size={20} />
        Message Patient
      </h3>

      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-bold uppercase">
          {currentPatient.name[0]}
        </div>
        <div>
          <p className="text-sm font-semibold text-gray-900 dark:text-white">
            {currentPatient.name}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">+{currentPatient.phone}</p>
        </div>
      </div>

      <p className="text-sm text-red-600 dark:text-red-400 mb-3 leading-snug">
        ⚠️ Please send messages with a sense of responsibility. The assistant is liable for any
        misinformation and may be subject to legal action for incorrect communication.
      </p>

      <div className="flex flex-wrap gap-2 mb-4">
        {templateOptions.map((option) => (
          <button
            key={option}
            onClick={() => setMessage(option)}
            className="px-3 py-1 rounded-full bg-indigo-100 dark:bg-indigo-900 text-indigo-700 dark:text-indigo-300 text-xs hover:bg-indigo-200 transition"
          >
            {option}
          </button>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Enter your custom message..."
          className="flex-grow rounded-md px-4 py-2 border border-gray-300 dark:border-gray-600 dark:bg-[#121212] dark:text-white text-black text-sm"
        />
        <button
          onClick={handleSend}
          disabled={sending}
          className="flex items-center gap-2 px-4 py-2 rounded-md bg-indigo-600 text-white text-sm hover:bg-indigo-700 disabled:opacity-50 transition"
        >
          <SendHorizonal size={16} />
          {sending ? "Sending..." : "Send"}
        </button>
      </div>

      {message && (
        <div className="mt-3 text-sm border rounded-md p-2 bg-gray-50 dark:bg-[#2b2b2b] border-gray-300 dark:border-gray-600 text-gray-800 dark:text-gray-100">
          <strong>Preview:</strong> {message}
        </div>
      )}

      <div className="mt-3 text-right">
        <button
          onClick={() => setMessage("")}
          className="text-xs text-gray-500 hover:text-red-500 transition"
        >
          Clear
        </button>
      </div>

      <div className="mt-4">
        <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Quick Notes:</p>
        <div className="flex flex-wrap gap-2">
          {["Doctor is running late", "Bring your reports", "Please wait outside"].map((note) => (
            <button
              key={note}
              onClick={() => setMessage(note)}
              className="text-xs px-3 py-1 rounded-full bg-gray-300 dark:bg-gray-800 text-gray-800 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700 transition"
            >
              {note}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-4 text-xs text-gray-600 dark:text-gray-400">
        You are currently attending patient <strong>#{patientIndex + 1}</strong> of{" "}
        <strong>{allPatients.length}</strong>. Next estimated:{" "}
        <strong>
          {allPatients[patientIndex + 1] ? allPatients[patientIndex + 1].name : "No one"}
        </strong>
      </div>

      {/* ✅ Feedback messages */}
      {successSend === true && (
        <p className="text-sm text-green-600 mt-2">✅ Message sent successfully!</p>
      )}
      {successSend === false && (
        <p className="text-sm text-red-600 mt-2">❌ Failed to send message.</p>
      )}

      {successSubmit === true && (
        <p className="text-sm text-green-600 mt-2">✅ Appointment marked as done!</p>
      )}
      {successSubmit === false && (
        <p className="text-sm text-red-600 mt-2">❌ Failed to mark appointment as done.</p>
      )}

      <div className="flex flex-col mt-4 sm:flex-row gap-3">
        <button
          onClick={handleMarkDone}
          disabled={sending}
          className="flex items-center gap-2 px-4 py-2 rounded-md bg-green-600 text-white text-sm hover:bg-green-700 disabled:opacity-50 transition"
        >
          Submit
        </button>
      </div>
    </div>
  );
}
