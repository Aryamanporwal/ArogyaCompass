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
    html: `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta http-equiv="X-UA-Compatible" content="ie=edge">
    <title>ArogyaCompass - Your Access Passkey</title>
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

        .security-warning {
            background-color: #fffbeb; /* yellow-50 */
            border: 1px solid #fde68a; /* yellow-200 */
            border-radius: 8px;
            padding: 20px;
            text-align: center;
            margin-bottom: 24px;
        }

        .security-warning p {
            font-size: 14px;
            color: #b45309; /* yellow-700 */
            margin: 0;
            line-height: 1.5;
            font-weight: 500;
        }
        
        .security-warning p strong {
            color: #92400e; /* yellow-800 */
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
                        <p>Smart App for Faster Care</p>
                    </div>
                    <div class="main-content">
                        <h2>Hello ${name},</h2>
                        <p>Your secure access passkey for your <strong>${role}</strong> account is attached to this email. Please download the attached PDF to access it.</p>
                        
                        <div class="security-warning">
                            <p>
                                <strong>Important Security Notice:</strong><br>
                                Treat this passkey like a password. Do not share it with anyone.
                            </p>
                        </div>

                        <p>You will need this passkey for secure access to designated areas. Please store it in a safe and private location.</p>
                        
                        <p style="margin-bottom: 0;">Best regards,<br/>The ArogyaCompass Team</p>
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
        filename: `${role}_Passkey.pdf`,
        content: pdfBase64,
      },
    ],
  });
}
