// lib/utils/sendMedicalEmailWithPDF.ts
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export const sendReportEmailWithPDF = async (
  to: string,
  base64PDF: string,
  patientName: string
) => {
  try {
    await resend.emails.send({
      from: "onboarding@resend.dev",
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
    console.error("❌ Failed to send email with PDF:", error);
  }
};
