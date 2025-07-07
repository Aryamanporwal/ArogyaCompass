"use client";

import { useState, useEffect } from "react";
import { cancelAppointment } from "@/lib/actions/appointment.action";
import Image from "next/image";

interface CancelAppointmentFormProps {
  appointmentId: string;
  onClose?: () => void; // Optional callback to close the form
}

export default function CancelAppointmentForm({ appointmentId , onClose}: CancelAppointmentFormProps) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (successMsg) {
      const timeout = setTimeout(() => {
        if (onClose) onClose(); // Call the parent close function
      }, 2000); // Close after 2 seconds

      return () => clearTimeout(timeout); // Cleanup timeout on unmount or rerun
    }
  }, [successMsg, onClose]);

  const handleCancel = async () => {
    setLoading(true);
      setLoading(false);
      setSuccessMsg("");
      setErrorMsg("");

    try {
      const result = await cancelAppointment(appointmentId, reason);
      if (result.success) {
        setSuccessMsg("✅ Appointment successfully cancelled.");
      } else {
        throw new Error("Failed to cancel");
      }
    } catch (err) {
      console.error(err);
      setErrorMsg("❌ " + err);
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-transparent backdrop-blur-sm px-4">
      <div className="relative w-full max-w-lg bg-gray-900 text-white rounded-2xl shadow-2xl border border-white/10 p-6">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white text-lg font-semibold focus:outline-none"
        >
          &times;
        </button>

        <div className="flex flex-col items-center text-center mb-6">
          <Image
            src="/assets/icons/logo.png"
            alt="Logo"
            className="w-12 h-12 rounded-md mb-2"
            width = {80}
            height = {80}
          />
          <h2 className="text-xl sm:text-2xl font-bold text-white mb-1">Cancel Appointment</h2>
          <p className="text-sm text-gray-400">
            Please provide your details and reason for cancellation
          </p>
        </div>

        {/* Form Inputs */}
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300">Patient Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full mt-1 px-3 py-2 bg-gray-800 text-white border border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
              placeholder="Enter patient name"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300">Phone Number</label>
            <input
              type="text"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="w-full mt-1 px-3 py-2 bg-gray-800 text-white border border-gray-600 rounded-lg focus:ring-2 focus:ring-red-500 outline-none"
              placeholder="Enter phone number"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300">Reason for Cancellation</label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full mt-1 px-3 py-2 bg-gray-800 text-white border border-gray-600 rounded-lg resize-none h-24 focus:ring-2 focus:ring-red-500 outline-none"
              placeholder="Write the reason here..."
            />
          </div>
        </div>

        {/* Cancel Button */}
        <button
          onClick={handleCancel}
          disabled={loading}
          className="mt-6 w-full bg-red-600 hover:bg-red-700 text-white py-2 px-4 rounded-lg transition duration-300 disabled:opacity-50"
        >
          {loading ? "Cancelling..." : "Cancel This Appointment"}
        </button>

        {/* Messages */}
        {successMsg && <p className="mt-4 text-green-400 font-medium text-center">{successMsg}</p>}
        {errorMsg && <p className="mt-4 text-red-400 font-medium text-center">{errorMsg}</p>}
      </div>
    </div>
  );
}

