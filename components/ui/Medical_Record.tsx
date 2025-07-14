import { useEffect, useState } from "react";
import { getLabRecordsByUserId, getMedicineRecordsByUserId } from "@/lib/actions/medicalr.action"; // adjust path as needed

interface LabRecord {
  $id: string;
  labName?: string;
  labContact?: string;
  timestamp?: string;
  testReportUrl?: string;
}

interface MedicineRecord {
  $id: string;
  timestamp?: string;
  temperature?: string;
  bp?: string;
  diagnose?: string;
  dosage?: string;
  testRecommended?: string;
  doctorName?: string;
  doctorContact?: string;
  medicine?: string;
  frequency?: string;
}

interface MedicalRecordsProps {
  userId: string;
  darkMode: boolean;
}

export default function MedicalRecords({ userId , darkMode } : MedicalRecordsProps) {
    const [labRecords, setLabRecords] = useState<LabRecord[]>([]);
    const [medicineRecords, setMedicineRecords] = useState<MedicineRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchRecords() {
      setLoading(true);
      try {
        const [labs, meds] = await Promise.all([
          getLabRecordsByUserId(userId),
          getMedicineRecordsByUserId(userId)
        ]);
        setLabRecords(labs || []);
        setMedicineRecords(meds || []);
      } catch  {
        setLabRecords([]);
        setMedicineRecords([]);
      }
      setLoading(false);
    }
    fetchRecords();
  }, [userId]);

  // Download handler for lab reports
  const handleDownload = (url?:string, fileName = "report.pdf") => {
    if(!url) return ;
    fetch(url)
      .then((response) => response.blob())
      .then((blob) => {
        const downloadUrl = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = downloadUrl;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        link.remove();
        window.URL.revokeObjectURL(downloadUrl);
      })
      .catch(() => alert("Failed to download file"));
  };

  return (
    <div className="space-y-12">
        {/* Lab Records */}
        <div>
            <h2 className={`text-2xl font-bold mb-6 ${darkMode ? "text-blue-300" : "text-blue-700"}`}>Lab Records</h2>
            {loading ? (
            <p className="text-center text-gray-400">Loading...</p>
            ) : labRecords.length === 0 ? (
            <p className="text-center text-gray-400">No lab records found.</p>
            ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                {labRecords.map((rec) => (
                <div
                    key={rec.$id}
                    className={`relative rounded-2xl  p-7 flex flex-col gap-4 border
                    ${darkMode
                        ? "bg-[#121212] border-gray-700 text-white"
                        : "bg-white border-gray-200 text-gray-900"}
                    
                    `}
                >
                    <div className="absolute top-4 right-4">
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold
                        ${darkMode ? "bg-blue-900 text-blue-300" : "bg-blue-100 text-blue-700"}
                    `}>
                        Lab Report
                    </span>
                    </div>
                    <div>
                    <span className="font-semibold">Lab Name:</span> {rec.labName || "—"}
                    </div>
                    <div>
                    <span className="font-semibold">Lab Contact:</span> {rec.labContact || "—"}
                    </div>
                    <div>
                    <span className="font-semibold">Date:</span>{" "}
                    {rec.timestamp ? new Date(rec.timestamp).toLocaleString() : "—"}
                    </div>
                    <div className="mt-2">
                    <button
                        className={`w-full py-2 rounded-lg font-semibold text-base shadow transition
                        ${darkMode
                            ? "bg-blue-700 hover:bg-blue-600 text-white"
                            : "bg-blue-600 hover:bg-blue-700 text-white"}
                        `}
                        onClick={() => handleDownload(rec.testReportUrl, `LabReport-${rec.labName || "Lab"}-${rec.timestamp || ""}.pdf`)}
                    >
                        Download Report
                    </button>
                    </div>
                </div>
                ))}
            </div>
            )}
        </div>

        {/* Medicine Records */}
        <div>
            <h2 className={`text-2xl font-bold mb-6 ${darkMode ? "text-green-300" : "text-green-700"}`}>Medicine Records</h2>
            {loading ? (
            <p className="text-center text-gray-400">Loading...</p>
            ) : medicineRecords.length === 0 ? (
            <p className="text-center text-gray-400">No medicine records found.</p>
            ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 mb-8 lg:grid-cols-3 gap-8">
                {medicineRecords.map((rec) => (
                <div
                    key={rec.$id}
                    className={`relative rounded-2xl p-7 flex flex-col gap-3 border
                    ${darkMode
                        ? "bg-[#121212] border-gray-700 text-white"
                        : "bg-white border-gray-200 text-gray-900"}
                    
                    `}
                >
                    <div className="absolute top-4 right-4">
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold
                        ${darkMode ? "bg-green-900 text-green-300" : "bg-green-100 text-green-700"}
                    `}>
                        Prescription
                    </span>
                    </div>
                    <div>
                    <span className="font-semibold">Date:</span>{" "}
                    {rec.timestamp ? new Date(rec.timestamp).toLocaleString() : "—"}
                    </div>
                    <div>
                    <span className="font-semibold">Doctor:</span> {rec.doctorName || "—"} ({rec.doctorContact || "—"})
                    </div>
                    <div>
                    <span className="font-semibold">Diagnose:</span> {rec.diagnose || "—"}
                    </div>
                    <div>
                    <span className="font-semibold">Dosage:</span> {rec.dosage || "—"}
                    </div>
                    <div>
                    <span className="font-semibold">Medicine:</span> {rec.medicine || "—"}
                    </div>
                    <div>
                    <span className="font-semibold">Frequency:</span> {rec.frequency || "—"}
                    </div>
                    <div>
                    <span className="font-semibold">Test Recommended:</span> {rec.testRecommended || "—"}
                    </div>
                    <div>
                    <span className="font-semibold">Temperature:</span> {rec.temperature || "—"}
                    </div>
                    <div>
                    <span className="font-semibold">BP:</span> {rec.bp || "—"}
                    </div>
                </div>
                ))}
            </div>
            )}
        </div>
    </div>
  );
}
