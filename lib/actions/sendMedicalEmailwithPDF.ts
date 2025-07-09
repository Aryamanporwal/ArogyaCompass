// lib/utils/sendMedicalEmailWithPDF.ts
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendMedicalEmailWithPDF = async (
  to: string,
  pdfBlob: Blob,
  patientName: string
) => {
  try {
    const buffer = await pdfBlob.arrayBuffer();
    const base64PDF = Buffer.from(buffer).toString("base64");

    await resend.emails.send({
      from: 'onboarding@resend.dev', // Setup verified domain in Resend
      to,
      subject: "Your Medical Report",
      html: `<p>Dear ${patientName},</p>
             <p>Please find attached your medical report from ArogyaCompass.</p>
             <p>Best regards,<br/>ArogyaCompass Team</p>`,
      attachments: [
        {
          filename: "medical_report.pdf",
          content: base64PDF,
        },
      ],
    });
  } catch (error) {
    console.error("Failed to send email with PDF:", error);
  }
};
