// utils/sendEmailWithPDF.ts
import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY!);

export async function sendEmailWithPDF({
  to,
  name,
  role,
  pdfBlob,
}: {
  to: string;
  name: string;
  role: string;
  pdfBlob: Blob;
}) {
  const arrayBuffer = await pdfBlob.arrayBuffer();
  const pdfBase64 = Buffer.from(arrayBuffer).toString("base64");

  return await resend.emails.send({
    from: 'onboarding@resend.dev', // ⚠️ Needs verified domain
    to,
    subject: `${role} Access Passkey`,
    html: `<p>Hello ${name},</p><p>Attached is your secure access passkey. Please store it safely. Do not share it with anyone.</p>`,
    attachments: [
      {
        filename: `${role}_Passkey.pdf`,
        content: pdfBase64,
      },
    ],
  });
}
