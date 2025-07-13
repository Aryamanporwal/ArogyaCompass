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
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/60 backdrop-blur-sm">
        <div className="min-w-[340px] max-w-sm w-full flex flex-col items-center justify-center bg-white rounded-2xl px-6 py-8 shadow-xl border border-gray-200">
          {/* Logo */}
          <div className="flex flex-col items-center justify-center mb-4">
            <Image
              alt="logo"
              src="/assets/icons/logo.png"
              height={120}
              width={120}
              className="h-20 w-auto object-contain"
            />
            <div className="text-center leading-tight mt-1">
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-500 via-blue-700 to-blue-500 bg-clip-text text-transparent">
                ArogyaCompass
              </h1>
              <h2 className="text-sm text-blue-500">Your Smart Path to Faster Care</h2>
            </div>
          </div>

          {/* Success Animation */}
          <div className="mb-5">
            <Image
              src="/assets/gifs/success.gif"
              alt="Success"
              width={100}
              height={100}
            />
          </div>

          {/* Success Message */}
          <div className="text-center mb-6">
            <h2 className="text-xl font-semibold text-gray-800">
              Your <span className="text-green-600">appointment request</span> was submitted!
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              We’ll be in touch soon to confirm.
            </p>
          </div>

          {/* Appointment Details */}
          <div className="w-full bg-gray-50 border border-gray-200 rounded-lg px-6 py-4 flex flex-col items-center">
            <span className="text-gray-500 text-sm mb-2">Appointment Details</span>
            <div className="flex items-center gap-2 flex-wrap justify-center">
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-white text-gray-800 border border-gray-300 shadow-sm">
                {/* Doctor/Test Icon */}
                <svg className="w-4 h-4 mr-1 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                  <circle cx="10" cy="10" r="10" />
                </svg>
                {detailLabel}
              </span>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-white text-gray-800 border border-gray-300 shadow-sm">
                {/* Calendar Icon */}
                <Image
                  src="/assets/icons/calendar.svg"
                  alt="Calendar"
                  width={20}
                  height={20}
                  className="w-4 h-4 mr-1"
                />
                {dateString} – {timeString}
              </span>
            </div>
          </div>

          {/* OK Button */}
          <div className="w-full mt-6">
            <Button
              onClick={onOk}
              className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white text-lg font-semibold py-2.5 rounded-lg shadow-md transition-all"
            >
              OK
            </Button>
          </div>
        </div>
      </div>
    );

};

export default SuccessAppointment;
