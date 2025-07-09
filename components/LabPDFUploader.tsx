"use client";

import { useState } from "react";
import PDFUploader from "@/components/ui/PDFfileUploader";
import { saveLabTestReport} from "@/lib/actions/labRecord.action";
import { Button } from "@/components/ui/button";

interface LabPDFUploadProps {
  labId: string;
  labName: string;
  labContact: string;
  userId: string;
  patientName: string;
  patientEmail: string;
  patientPhone: string;
}

const LabPDFUpload = ({
  labId,
  labName,
  labContact,
  userId,
  patientName,
  patientEmail,
  patientPhone,
}: LabPDFUploadProps) => {
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);

const handleUpload = async () => {
  if (!files.length) return;
  setLoading(true);

  try {
    await saveLabTestReport({
      file: files[0],
      labId,
      labName,
      labContact,
      userId,
      patientName,
      patientEmail,
      patientPhone,

    });


    alert("Report uploaded successfully.");
    setFiles([]);
  } catch (error) {
    console.error("Error uploading report:", error);
    alert("Upload failed.");
  } finally {
    setLoading(false);
  }
};


  return (
    <div className="bg-white dark:bg-[#1e1e1e] p-6 rounded-xl shadow-md w-full sm:w-1/2 mx-auto">
      <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
        Upload Test Report
      </h3>

      <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
        Please upload a clear and accurate PDF report. Ensure all patient details, test results, and lab information are thoroughly verified before submission. The uploaded document will be permanently recorded and securely emailed to the patient.
        <br /><br />
        <span className="text-red-600 dark:text-red-400 font-medium">
            Important:
        </span> Any discrepancies, falsified data, or incorrect test reports may lead to medical errors and patient harm. Labs are fully accountable for the authenticity of the reports they upload. 
        <br />
        Uploading incorrect or misleading medical data is a serious offense and may result in legal consequences, including suspension of lab privileges and further action under applicable health regulations.
        </p>


      <PDFUploader files={files} onChange={setFiles} />

      {files.length > 0 && (
        <Button
          onClick={handleUpload}
          disabled={loading}
          className="mt-4 bg-blue-600 text-white hover:bg-blue-700"
        >
          {loading ? "Uploading..." : "Upload"}
        </Button>
      )}
    </div>
  );
};

export default LabPDFUpload;
