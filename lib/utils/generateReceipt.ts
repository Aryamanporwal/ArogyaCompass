"use client"
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";



declare module "jspdf" {
  interface jsPDF {
    lastAutoTable?: {
      finalY?: number;
    };
  }
}


type AppointmentData = {
  timestamp: string;
  hospitalId?: string;
  labId?: string;
  doctorName?: string;
  test?: string;
};

type InstitutionData = {
  name: string;
  address: string;
};


type UserData = {
  name: string;
  email: string;
  phone: string;
};

export const generateReceiptPDF = async (
  user: UserData,
  logoUrl: string,
  appointment: AppointmentData,
  institution: InstitutionData,
) => {
  const doc = new jsPDF();

  // Add logo
  if (logoUrl) {
    const img = await fetch(logoUrl)
      .then((res) => res.blob())
      .then((blob) => {
        return new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.readAsDataURL(blob);
        });
      });

    doc.addImage(img, "PNG", 80, 10, 50, 50);
  }

  doc.setFontSize(18);
  doc.text("Appointment Receipt", 105, 70, { align: "center" });
  doc.setFontSize(12);

  autoTable(doc, {
    head: [["Patient Detail", ""]],
    body: [
      ["Name", user.name],
      ["Email", user.email],
      ["Phone", user.phone],
    ],
    startY: 80,
  });

  const finalY = doc.lastAutoTable?.finalY ?? 90;

  let sectionTitle = "";
  let details: string[][] = [];

  if (appointment.hospitalId) {
    sectionTitle = "Hospital Details";
    details = [
      ["Name", institution.name],
      ["Address", institution.address],
      ["Doctor", appointment.doctorName || "-"],
    ];
  } else {
    sectionTitle = "Lab Details";
    details = [
      ["Name", institution.name],
      ["Address", institution.address],
      ["Test", appointment.test || "-"],
    ];
  }

  autoTable(doc, {
    head: [[sectionTitle, ""]],
    body: details,
    startY: finalY + 10,
  });

  autoTable(doc, {
    head: [["Appointment Date", new Date(appointment.timestamp).toLocaleString()]],
    body: [],
    startY: (doc.lastAutoTable?.finalY ?? 80)+ 10,
    theme: "grid",
  });

  doc.save("appointment_receipt.pdf");
};
