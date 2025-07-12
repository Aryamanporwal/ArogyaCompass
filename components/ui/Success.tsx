import React, { useEffect, useState } from "react";
import Image from "next/image";
import { getAppointmentByUserId } from "@/lib/actions/appointment.action";
import { Button } from "./button";
import { DateTime } from "luxon";

interface Appointment {
  doctorName?: string;
  test?: string;
  timestamp: Date;

}

interface SuccessAppointmentProps {
  userId: string;
  open: boolean;
  onOk: () => void;
}

const SuccessAppointment: React.FC<SuccessAppointmentProps> = ({ userId, open, onOk }) => {
  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!open) return;
    getAppointmentByUserId(userId)
    .then((doc) => {
      if (doc) {
        const timestamp = DateTime.fromISO(doc.timestamp, { zone: "utc" })
          .setZone("Asia/Kolkata")
          .toJSDate();

        setAppointment({
          doctorName: doc.doctorName,
          test: doc.test,
          timestamp,
        });
      } else {
        setAppointment(null);
      }
    })
      .finally(() => setLoading(false));
  }, [userId, open]);

  if (!open) return null;

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70">
        <div className="flex items-center justify-center min-h-[400px] bg-[#181A1B] rounded-xl px-8 py-10">
          <span className="text-white text-lg">Loading...</span>
        </div>
      </div>
    );
  }

  if (!appointment) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-70">
        <div className="flex items-center justify-center min-h-[400px] bg-[#181A1B] rounded-xl px-8 py-10">
          <span className="text-white text-lg">No appointment found.</span>
        </div>
      </div>
    );
  }

  const dateString = appointment.timestamp.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    timeZone: "Asia/Kolkata"
  });
  const timeString = appointment.timestamp.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
    timeZone: "Asia/Kolkata"
  });

  const detailLabel = appointment.doctorName
    ? `Dr. ${appointment.doctorName}`
    : appointment.test || "";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-transparent  backdrop-blur-sm ">
      <div className="min-w-[340px] flex flex-col items-center justify-center bg-gray-900 rounded-xl px-8 py-10">
        {/* Logo */}
        <div className="flex flex-col items-center justify-center -mt-2 mb-3">
          <Image
            alt="logo"
            src="/assets/icons/logo.png"
            height={150}
            width={150}
            className="h-20 sm:h-24 md:h-28 w-auto object-contain"
          />
          <div className="-mt-1 text-center leading-tight">
            <h1 className="text-[1.3rem] font-bold bg-gradient-to-r from-blue-400 via-blue-600 to-blue-400 bg-clip-text text-transparent">
              ArogyaCompass
            </h1>
            <h2 className="text-sm text-blue-500 mt-0.5">
              Your Smart Path to Faster Care
            </h2>
          </div>
        </div>
        {/* Success Checkmark */}
        <div className="mb-6">
          <Image
            src="/assets/gifs/success.gif"
            alt="Success"
            width={120}
            height={120}
            style={{ display: "block" }}
          />
        </div>
        {/* Success Message */}
        <div className="text-center mb-8">
          <h2 className="text-2xl font-semibold text-white mb-2">
            Your <span className="text-[#22C55E]">appointment request</span> has been successfully submitted!
          </h2>
          <p className="text-[#A3A3A3] mt-2">We will be in touch shortly to confirm.</p>
        </div>
        {/* Appointment Details */}
        <div className="bg-[#232627] rounded-lg px-8 py-4 flex flex-col items-center">
          <span className="text-[#A3A3A3] mb-2">Requested appointment details:</span>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center px-3 py-1 bg-[#181A1B] rounded text-white">
              {/* Doctor/Test Icon */}
              <svg className="w-5 h-5 mr-1 text-[#22C55E]" fill="currentColor" viewBox="0 0 20 20">
                <circle cx="10" cy="10" r="10" />
              </svg>
              {detailLabel}
            </span>
            <span className="inline-flex items-center px-3 py-1 bg-[#181A1B] rounded text-white">
              {/* Calendar Icon */}
              <Image
                src="/assets/icons/calendar.svg"
                alt="Calendar"
                className="w-5 h-5 mr-1 inline"
                style={{ display: "inline" }}
                width = {24}
                height  = {24}
              />
              {dateString} – {timeString}
            </span>
          </div>
        </div>
        <div className="w-full mt-5 py-3 rounded-lg bg-gradient-to-r from-green-500 via-green-600 to-green-700 text-white font-semibold text-lg shadow transition hover:from-green-600 hover:to-green-800 focus:outline-none focus:ring-4 focus:ring-green-300">
        <Button
            onClick={onOk}
            className="w-full bg-transparent cursor-pointer hover:bg-transparent text-white shadow-none text-lg font-semibold"
        >
            OK
        </Button>
        </div>

      </div>
    </div>
  );
};

export default SuccessAppointment;
