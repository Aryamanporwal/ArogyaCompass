// app/api/payment/route.ts
import Razorpay from "razorpay";
import {NextRequest ,  NextResponse } from "next/server";

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID!,
  key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

export async function POST(request: NextRequest) {
  try {
        const body = await request.json();
        const { amount } = body;
        if (!amount || typeof amount !== "number") {
            return NextResponse.json({ error: "Invalid amount" }, { status: 400 });
        }
    const order = await razorpay.orders.create({
      amount: amount * 100,
      currency: "INR",
      receipt: "receipt_" + Math.random().toString(36).substring(7),
    });

    return NextResponse.json({ orderId: order.id }, { status: 200 });
  } catch (error) {
    console.error("Error Creating order:", error);
    return NextResponse.json(
      { error: "Error creating the order" },
      { status: 500 }
    );
  }
}
