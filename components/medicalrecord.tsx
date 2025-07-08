"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { getMedicalRecordsByDoctorId } from "@/lib/actions/medical.action";
import { getPatient } from "@/lib/actions/patient.action";

interface MedicalRecord {
  timestamp: string;
  temperature: string;
  bp: string;
  diagnose: string;
  dosage: string;
  testRecommended: string;
  doctorName: string;
  doctorContact: string;
  medicine: string;
  frequency: string;
  userId: string;
}

export default function MedicalRecordList({ doctorId }: { doctorId: string }) {
  const [records, setRecords] = useState<MedicalRecord[]>([]);
  const [filtered, setFiltered] = useState<MedicalRecord[]>([]);
  const [searchDate, setSearchDate] = useState<string>("");
  const [patientMap, setPatientMap] = useState<Record<string, string>>({});
    useEffect(() => {
    const fetchRecords = async () => {
        if (!doctorId) return;

        const result = await getMedicalRecordsByDoctorId(doctorId);

        const mappedRecords: MedicalRecord[] = result.map((doc) => ({
        timestamp: doc.timestamp,
        temperature: doc.temperature,
        bp: doc.bp,
        diagnose: doc.diagnose,
        dosage: doc.dosage,
        testRecommended: doc.testRecommended,
        doctorName: doc.doctorName,
        doctorContact: doc.doctorContact,
        medicine: doc.medicine,
        frequency: doc.frequency,
        userId: doc.userId,
        }));

        setRecords(mappedRecords);
        setFiltered(mappedRecords);

        const uniqueUserIds = [...new Set(mappedRecords.map((r) => r.userId))];
        const map: Record<string, string> = {};
        await Promise.all(
        uniqueUserIds.map(async (id) => {
            const patient = await getPatient(id);
            if (patient) map[id] = patient.name;
        })
        );
        setPatientMap(map);
    };

    fetchRecords();
    }, [doctorId]);


  const handleSearch = () => {
    if (!searchDate) return setFiltered(records);
    const filteredByDate = records.filter((r) =>
      r.timestamp.startsWith(searchDate)
    );
    setFiltered(filteredByDate);
  };

  return (
    <div className="bg-white dark:bg-[#1e1e1e] p-6 rounded-xl shadow-md w-full">
      <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
        Medical Records
      </h3>

      <div className="relative mb-6 flex items-center gap-2">
        <Input
          type="date"
          value={searchDate}
          onChange={(e) => setSearchDate(e.target.value)}
          className="dark:bg-[#121212] dark:text-white text-black"
        />
        <button
          onClick={handleSearch}
          className="px-4 py-2 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700"
        >
          <Search className="w-5 h-5 inline-block mr-1" />
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        {filtered.map((rec, index) => (
          <div
            key={index}
            className="border rounded-lg p-4 bg-gray-100 dark:bg-[#2b2b2b] dark:border-gray-700 shadow-sm"
          >
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
              Date: {new Date(rec.timestamp).toLocaleDateString()}
            </p>
            <p className="text-sm font-semibold text-gray-800 dark:text-white">
              Patient: {patientMap[rec.userId] || "Unknown"}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Diagnosis: {rec.diagnose || "N/A"}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Temperature: {rec.temperature || "N/A"} | BP: {rec.bp || "N/A"}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Medicine: {rec.medicine || "N/A"} ({rec.dosage || "-"} / {rec.frequency || "-"})
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Test: {rec.testRecommended || "N/A"}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
