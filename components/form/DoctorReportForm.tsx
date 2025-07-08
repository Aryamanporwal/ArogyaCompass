"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { createMedicalRecord, updateAppointmentStatus } from "@/lib/actions/doctor.action";

interface DoctorReportFormProps {
  doctorName: string;
  doctorPhone: string;
  userId: string;
  appointmentId: string;
  doctorId: string;
}

export default function DoctorReportForm({
  doctorName,
  doctorPhone,
  userId,
  appointmentId,
  doctorId
}: DoctorReportFormProps) {
  const [diagnosis, setDiagnosis] = useState("");
  const [prescription, setPrescription] = useState("");
  const [testRecommended, settestRecommended] = useState("");
  const [loading, setLoading] = useState(false);
  const [bp, setBp] = useState("");
    const [temperature, setTemperature] = useState("");
    const [dosage, setDosage] = useState("");
    const [frequency, setFrequency] = useState("");
    const [medicine, setMedicine] = useState("");

  const handleSubmit = async () => {
    setLoading(true);
    const newRecord = {
      userId,
      doctorName,
      doctorContact: doctorPhone,
      diagnose: prescription,
      testRecommended,
      timestamp: new Date().toISOString(),
      medicine, // Add appropriate value or another state if needed
      bp,
      temperature,
      dosage,
      frequency,
      doctorId,
    };

    await createMedicalRecord(newRecord);
    await updateAppointmentStatus(appointmentId, "done");
    setLoading(false);
    alert("Medical Report submitted successfully.");
    setDiagnosis("");
    setPrescription("");
    settestRecommended("");
    setBp("");
    setTemperature("");
    setDosage("");
    setFrequency("");
    setMedicine("");
  };

  return (
    <div className="bg-white dark:bg-[#1e1e1e] p-6 rounded-xl shadow-md w-full sm:w-1/2 mx-auto sm:ml-6 mt-6 sm:mt-0">
      <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
        Doctor Report
      </h3>

      <div className="grid grid-cols-1 gap-4 text-sm">
        <Input value={doctorName} disabled placeholder="Doctor Name" className=" bg-gray-50 dark:bg-[#2b2b2b] dark:border-gray-700"/>
        <Input value={doctorPhone} disabled placeholder="Doctor Phone" className=" bg-gray-50 dark:bg-[#2b2b2b] dark:border-gray-700" />
        <Textarea
          placeholder="Diagnosis"
          value={diagnosis}
          onChange={(e) => setDiagnosis(e.target.value)}
          className=" bg-gray-50 dark:bg-[#2b2b2b] dark:border-gray-700"
        />
        {/* <Textarea
          placeholder="Prescription"
          value={diagnosis}
          className=" bg-gray-50 dark:bg-[#2b2b2b] dark:border-gray-700"
          onChange={(e) => setPrescription(e.target.value)}
        /> */}
        <Textarea
          placeholder="Test Recommendations"
          value={testRecommended}
          className=" bg-gray-50 dark:bg-[#2b2b2b] dark:border-gray-700"
          onChange={(e) => settestRecommended(e.target.value)}
        />
        <Input
          placeholder="Blood Pressure"
          value={bp}
          className=" bg-gray-50 dark:bg-[#2b2b2b] dark:border-gray-700"
          onChange={(e) => setBp(e.target.value)}
        />
        <Input
          placeholder="Temperature"
          value={temperature}
          className=" bg-gray-50 dark:bg-[#2b2b2b] dark:border-gray-700"
          onChange={(e) => setTemperature(e.target.value)}
        />
        <Input
          placeholder="Medicine"
          value={medicine}
          className=" bg-gray-50 dark:bg-[#2b2b2b] dark:border-gray-700"
          onChange={(e) => setMedicine(e.target.value)}
        />
        <Input
            placeholder="Dosage"
            value={dosage}
            className=" bg-gray-50 dark:bg-[#2b2b2b] dark:border-gray-700"
            onChange={(e) => setDosage(e.target.value)}
        />
        <Input
            placeholder="Frequency"
            value={frequency}
            className=" bg-gray-50 dark:bg-[#2b2b2b] dark:border-gray-700"
            onChange={(e) => setFrequency(e.target.value)}
        />
        <div className="text-xs text-gray-500">
          Please ensure all information is accurate before submitting.
        </div>
        <Button
          className="bg-blue-600 text-white hover:bg-blue-700 mt-2"
          onClick={handleSubmit}
          disabled={loading}
        >
          {loading ? "Submitting..." : "Submit"}
        </Button>
      </div>
    </div>
  );
}


