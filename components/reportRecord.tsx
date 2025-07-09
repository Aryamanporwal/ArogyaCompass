"use client";

import { useEffect, useState } from "react";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { getLabTestReports } from "@/lib/actions/labRecord.action";
// import dynamic from "next/dynamic";

interface LabRecord {
  labId: string;
  testReport: string;
  testReportId: string;
  testReportUrl: string;
  userId: string;
  patientName: string;
  patientEmail: string;
  patientPhone: string;
  labName: string;
  labContact: string;
  timestamp: string;
}

export default function LabRecordList({ labId }: { labId: string }) {
  const [records, setRecords] = useState<LabRecord[]>([]);
  const [filtered, setFiltered] = useState<LabRecord[]>([]);
  const [searchDate, setSearchDate] = useState<string>("");

  useEffect(() => {
    const fetchRecords = async () => {
      if (!labId) return;
      const result = await getLabTestReports(labId);
            const mapped: LabRecord[] = result.map((doc) => ({
            labId: doc.labId,
            testReport: doc.testReport,
            testReportId: doc.testReportId,
            testReportUrl: doc.testReportUrl,
            userId: doc.userId,
            patientName: doc.patientName,
            patientEmail: doc.patientEmail,
            patientPhone: doc.patientPhone,
            labName: doc.labName,
            labContact: doc.labContact,
            timestamp: doc.timestamp,
            }));

            setRecords(mapped);
            setFiltered(mapped);
    };
    fetchRecords();
  }, [labId]);

  const handleSearch = () => {
    if (!searchDate) return setFiltered(records);
    const filteredByDate = records.filter((r) =>
      r.timestamp.startsWith(searchDate)
    );
    setFiltered(filteredByDate);
  };

  return (
    <div className="bg-white mb-6 dark:bg-[#1e1e1e] p-6 rounded-xl shadow-md w-full">
      <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
        Lab Test Records
      </h3>

      <div className="relative mb-6 flex items-center gap-2">
        <Input
          type="date"
          value={searchDate}
          onChange={(e) => setSearchDate(e.target.value)}
          className="dark:bg-[#121212] dark:text-white text-black "
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
            className="flex flex-col sm:flex-row border rounded-xl p-5 bg-white dark:bg-[#121212] dark:text-white text-black shadow-md hover:shadow-lg transition-shadow duration-200"
            >
            {/* Left: PDF preview */}
            <div className="w-full sm:w-1/3 flex items-center justify-center mb-4 sm:mb-0">
                <iframe
                src={`${rec.testReportUrl}#page=1&zoom=100`}
                width="100%"
                height="200"
                className="rounded-lg border dark:border-gray-700"
                title={`Test Report Preview for ${rec.patientName}`}
                ></iframe>
            </div>

            {/* Right: Report details and action buttons below */}
            <div className="w-full sm:w-2/3 flex flex-col justify-center pl-0 sm:pl-6">
                <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                <span className="font-medium">Date:</span> {new Date(rec.timestamp).toLocaleDateString()}
                </p>
                <p className="text-base font-semibold text-gray-900 dark:text-white mb-1">
                {rec.patientName}
                <span className="ml-2 text-xs text-gray-500 dark:text-gray-400">({rec.patientPhone})</span>
                </p>
                <p className="text-sm text-gray-700 dark:text-gray-300 mb-1">
                <span className="font-medium">Email:</span> {rec.patientEmail}
                </p>
                <p className="text-sm text-gray-700 dark:text-gray-300 mb-1">
                <span className="font-medium">Test Report:</span> {rec.testReport || "N/A"}
                </p>
                <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
                <span className="font-medium">Lab:</span> {rec.labName} <span className="text-xs text-gray-500 dark:text-gray-400">({rec.labContact})</span>
                </p>
                {/* Action buttons BELOW the details */}
                <div className="flex gap-3 mt-2">
                <a
                    href={rec.testReportUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 px-4 py-2 text-sm rounded-lg bg-blue-600 text-white hover:bg-blue-700 shadow transition focus:outline-none focus:ring-2 focus:ring-blue-300"
                    aria-label="View Full Report"
                >
                    View Full
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path d="M15 12H3m0 0l4 4m-4-4l4-4m8 8v-4a4 4 0 00-4-4H7" />
                    </svg>
                </a>
                <a
                    href={rec.testReportUrl}
                    download={rec.testReport}
                    className="flex items-center gap-1 px-4 py-2 text-sm rounded-lg bg-green-600 text-white hover:bg-green-700 shadow transition focus:outline-none focus:ring-2 focus:ring-green-300"
                    aria-label="Download Report"
                >
                    Download
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                    <path d="M12 4v16m8-8H4" />
                    </svg>
                </a>
                </div>
            </div>
            </div>
        ))}
        </div>


    </div>
  );
}
