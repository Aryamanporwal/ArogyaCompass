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
      from: 'support@arogyacompass.cloud', // Setup verified domain in Resend
      to,
      subject: "Your Medical Report",
      html: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <title>ArogyaCompass - Your Medical Report</title>
    <style>
        /* Basic Reset */
        body, table, td, a { -webkit-text-size-adjust: 100%; -ms-text-size-adjust: 100%; }
        table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
        img { -ms-interpolation-mode: bicubic; border: 0; height: auto; line-height: 100%; outline: none; text-decoration: none; }
        table { border-collapse: collapse !important; }
        body { height: 100% !important; margin: 0 !important; padding: 0 !important; width: 100% !important; }
        
        /* Main Styles */
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif, 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol';
            background-color: #f1f5f9; /* slate-100 */
        }

        .container {
            padding: 20px;
        }

        .content-card {
            background-color: #ffffff;
            border: 1px solid #e2e8f0; /* slate-200 */
            border-radius: 12px;
            max-width: 600px;
            margin: 0 auto;
            overflow: hidden;
        }
        
        .header {
            text-align: center;
            padding: 40px 20px;
            border-bottom: 1px solid #e2e8f0; /* slate-200 */
        }
        
        .header img {
            height: 80px;
            width: 80px;
            margin-bottom: 6px;
        }

        .header h1 {
            font-size: 22px;
            font-weight: 700;
            color: #2563eb; /* blue-600 */
            margin: 0;
        }

        .header p {
            font-size: 14px;
            color: #3b82f6; /* slate-500 */
            margin: 4px 0 0;
        }

        .main-content {
            padding: 32px 40px;
            text-align: left;
        }

        .main-content h2 {
            font-size: 20px;
            font-weight: 600;
            color: #334155; /* slate-700 */
            margin-top: 0;
            margin-bottom: 16px;
        }

        .main-content p {
            font-size: 16px;
            line-height: 1.6;
            color: #475569; /* slate-600 */
            margin: 0 0 24px;
        }

        .attachment-box {
            background-color: #f8fafc; /* slate-50 */
            border: 1px dashed #cbd5e1; /* slate-300 */
            border-radius: 8px;
            padding: 20px;
            text-align: center;
            margin-bottom: 24px;
        }

        .attachment-box p {
            font-size: 14px;
            color: #475569; /* slate-600 */
            margin: 0;
            line-height: 1.5;
        }
        
        .attachment-box p strong {
            color: #1e293b; /* slate-800 */
        }

        .confidentiality-note {
            font-size: 12px;
            color: #64748b; /* slate-500 */
            text-align: center;
            padding: 0 20px;
            line-height: 1.5;
        }

        .footer {
            padding: 20px 40px;
            text-align: center;
            font-size: 12px;
            color: #94a3b8; /* slate-400 */
        }

    </style>
</head>
<body style="background-color: #f1f5f9; margin: 0 !important; padding: 0 !important;">
    <table border="0" cellpadding="0" cellspacing="0" width="100%">
        <tr>
            <td align="center" class="container">
                <!--[if (gte mso 9)|(IE)]>
                <table align="center" border="0" cellspacing="0" cellpadding="0" width="600">
                <tr>
                <td align="center" valign="top" width="600">
                <![endif]-->
                <div class="content-card">
                    <div class="header">
                        <img src="https://fra.cloud.appwrite.io/v1/storage/buckets/686138bf0019a96102f4/files/688255f9002c8b126dd8/view?project=686136ad00033a8b1a47&mode=admin" alt="ArogyaCompass Logo">
                        <h1>ArogyaCompass</h1>
                        <p>"Smart App for Faster Care"</p>
                    </div>
                    <div class="main-content">
                        <h2>Dear ${patientName},</h2>
                        <p>As requested, your medical report is securely attached to this email. Please download the file to view it.</p>
                        
                        <div class="attachment-box">
                            <p>
                                <strong>Attached:</strong> medical_report.pdf<br>
                                Please keep this document confidential.
                            </p>
                        </div>

                        <p>If you have any questions regarding this report, we recommend discussing them with your healthcare provider.</p>
                        
                        <p style="margin-bottom: 0;">Best regards,<br/>The ArogyaCompass Team</p>
                    </div>
                     <div style="padding: 0 40px 32px;">
                        <p class="confidentiality-note">
                           This email and any attachments are confidential and intended solely for the use of the individual to whom it is addressed. If you have received this email in error, please notify us immediately and delete it from your system.
                        </p>
                    </div>
                </div>
                <!--[if (gte mso 9)|(IE)]>
                </td>
                </tr>
                </table>
                <![endif]-->
                <div class="footer">
                    &copy; 2025 ArogyaCompass. All rights reserved.
                </div>
            </td>
        </tr>
    </table>
</body>
</html>
`,
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
