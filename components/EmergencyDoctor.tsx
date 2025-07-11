"use client";

import { useEffect, useState } from "react";
import { getDoctorsByAssistantDoctorId, Doctor } from "@/lib/actions/doctor.action";
import Image from "next/image";
import {
  Mail,
  Phone,
  MapPin,
  Stethoscope,
  GraduationCap,
  ShieldCheck,
  SendHorizonal,
  AlertOctagonIcon,
} from "lucide-react";
import { sendSMS } from "@/lib/actions/sms.server";

interface EmergencyDoctorsProps {
  doctorId: string;
}

export default function EmergencyDoctors({ doctorId }: EmergencyDoctorsProps) {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [message, setMessage] = useState("");
  const [sendingId, setSendingId] = useState<string | null>(null);
  const [successMap, setSuccessMap] = useState<Record<string, boolean | null>>({});

  useEffect(() => {
    const fetchDoctors = async () => {
      const result = await getDoctorsByAssistantDoctorId(doctorId);
      setDoctors(result);
    };
    fetchDoctors();
  }, [doctorId]);

  const handleSend = async (doctor: Doctor) => {
    if (!message.trim()) return;
    setSendingId(doctor.$id);
    try {
      await sendSMS(`+91${doctor.phone}`, message);
      setSuccessMap((prev) => ({ ...prev, [doctor.$id]: true }));
    } catch (err) {
      console.error(err);
      setSuccessMap((prev) => ({ ...prev, [doctor.$id]: false }));
    } finally {
      setSendingId(null);
      setMessage("");
      setTimeout(() => {
        setSuccessMap((prev) => ({ ...prev, [doctor.$id]: null }));
      }, 3000);
    }
  };

  return (
    <div className="flex flex-col gap-6 px-2 py-6 w-full max-w-6xl mx-auto">
      {doctors.length === 0 ? (
        <div className="bg-white dark:bg-[#1e1e1e] p-6 rounded-xl shadow-md w-full text-center">
          <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">
            No Doctors Found
          </h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            There are no doctors registered in this hospital.
          </p>
        </div>
      ) : (
        doctors.map((doctor) => (
          <div
            key={doctor.$id}
            className="bg-gradient-to-br from-white via-gray-50 to-gray-100 dark:from-[#1e1e1e] dark:via-[#23272f] dark:to-[#18181b] border border-gray-200 dark:border-gray-700 shadow-lg p-8 rounded-2xl w-full flex flex-col sm:flex-row gap-8 transition-all hover:shadow-2xl"
          >
            <Image
              src={doctor.logoUrl || "/doctor-placeholder.png"}
              alt={doctor.Name}
              width={120}
              height={120}
              className="w-38 h-40 object-cover rounded-xl mx-auto sm:mx-0 ring-2 ring-indigo-100 dark:ring-indigo-700 shadow-md"
            />

            <div className="flex flex-col gap-3 w-full">
            <h4 className="text-2xl font-bold text-center sm:text-left text-gray-900 dark:text-white tracking-tight">
               Dr. {doctor.Name}
            </h4>
            <div className="flex items-center text-sm text-gray-700 dark:text-gray-300 gap-2">
                <span className="bg-indigo-50 dark:bg-indigo-900 p-1 rounded-full">
                <Mail className="w-4 h-4" />
                </span>
                <span>{doctor.Email}</span>
            </div>
            <div className="flex items-center text-sm text-gray-700 dark:text-gray-300 gap-2">
                <span className="bg-indigo-50 dark:bg-indigo-900 p-1 rounded-full">
                <Phone className="w-4 h-4" />
                </span>
                <span>{doctor.phone}</span>
            </div>
            <div className="flex items-center text-sm text-gray-700 dark:text-gray-300 gap-2">
                <span className="bg-indigo-50 dark:bg-indigo-900 p-1 rounded-full">
                <MapPin className="w-4 h-4" />
                </span>
                <span>{doctor.City}</span>
            </div>
            <div className="flex items-center text-sm text-gray-700 dark:text-gray-300 gap-2">
                <span className="bg-indigo-50 dark:bg-indigo-900 p-1 rounded-full">
                <Stethoscope className="w-4 h-4" />
                </span>
                <span>{doctor.speciality.join(", ") || "General"}</span>
            </div>
            <div className="flex items-center text-sm text-gray-700 dark:text-gray-300 gap-2">
                <span className="bg-indigo-50 dark:bg-indigo-900 p-1 rounded-full">
                <GraduationCap className="w-4 h-4" />
                </span>
                <span>{doctor.experience} yrs experience</span>
            </div>
            {doctor.isVerified && (
                <span className="mt-2 inline-flex items-center gap-1 text-xs px-3 py-1 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300 rounded-full font-semibold shadow">
                <ShieldCheck className="w-4 h-4" /> Verified
                </span>
            )}
            </div>


            {/* Messaging Box */}
                <div className="flex flex-col w-full sm:w-[40%] gap-3 bg-gray-50 dark:bg-[#18181b] border border-gray-200 dark:border-gray-700 rounded-xl p-4 shadow-inner">
                <h4 className="text-sm font-semibold text-red-700 dark:text-red-300 flex items-center gap-2 mb-2">
                    <AlertOctagonIcon size={18} /> Alert Doctor
                </h4>
                <input
                    type="text"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder={`Message ${doctor.Name}`}
                    className="rounded-md px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-[#23272f] dark:text-white text-sm focus:ring-2 focus:ring-indigo-400 transition"
                />
                <button
                    onClick={() => handleSend(doctor)}
                    disabled={sendingId === doctor.$id}
                    className="flex items-center mt-3 gap-2 px-4 py-2 rounded-md bg-gradient-to-r from-red-600 to-red-500 text-white text-sm font-semibold shadow hover:from-indigo-700 hover:to-indigo-600 disabled:opacity-60 transition w-fit"
                >
                    <SendHorizonal size={16} />
                    {sendingId === doctor.$id ? "Sending..." : "Send"}
                </button>
                {successMap[doctor.$id] === true && (
                    <p className="text-xs text-green-600 mt-1">✅ Message sent</p>
                )}
                {successMap[doctor.$id] === false && (
                    <p className="text-xs text-red-600 mt-1">❌ Failed to send</p>
                )}
                </div>

          </div>
        ))
      )}
    </div>
  );
}
