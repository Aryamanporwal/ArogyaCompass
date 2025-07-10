// app/api/send-sms/route.ts (for Next.js 13+ API route)
import { sendSMS } from "@/lib/actions/sms.server";

export async function POST(req: Request) {
  const body = await req.json();
  const { phone, message } = body;

  try {
    await sendSMS(phone, message);
    return Response.json({ success: true });
  } catch {
    return Response.json({ success: false }, { status: 500 });
  }
}
