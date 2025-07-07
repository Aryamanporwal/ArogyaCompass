// utils/generatePasskeyPDF.ts
import { jsPDF } from "jspdf";
import autoTable from "jspdf-autotable";

export async function generatePasskeyPDF({
  name,
  email,
  role,
  passkey,
  password,  // e.g. "HOSPRA"
}: {
name: string;
  email: string;
  role: string; // "Hospital", "Doctor", etc.
  passkey: string;
  password: string;
}): Promise<Blob> {
  const doc = new jsPDF();

  const imgResponse = await fetch("/assets/full-logo.png");
  const imgBlob = await imgResponse.blob();
  const imgDataUrl = await new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(imgBlob);
  });
  doc.addImage(imgDataUrl, "PNG", 80, 10, 50, 50);


  doc.setFontSize(18);
  doc.text("🔐 Secure Access Passkey", 105, 70, { align: "center" });

  autoTable(doc, {
    head: [["Admin Details", ""]],
    body: [
      ["Name", name],
      ["Email", email],
      ["Role", role],
    ],
    startY: 80,
  });

  autoTable(doc, {
    head: [["Your 6-digit Passkey", passkey]],
    body: [],
    startY: (doc.lastAutoTable?.finalY ?? 100) + 10,
  });

  autoTable(doc, {
    head: [["Important Note"]],
    body: [
      [
        `This PDF very confidential. \nIn future you forget you passkey then , use: ${password} as password to login your account and set new passkey.\n\nDo not share this passkey with anyone. It is required to access your admin dashboard.`,
      ],
    ],
    startY: (doc.lastAutoTable?.finalY ?? 110) + 10,
    styles: { cellWidth: 'wrap' },
  });

  // Convert to Blob for sending via email
  return new Promise((resolve) => {
    const blob = doc.output("blob");
    resolve(blob);
  });
}
