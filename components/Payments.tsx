"use client";

import { CalendarClock, Hospital, FlaskConical } from "lucide-react";
import { useParams, useRouter, usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import {
  updateHospitalStatus,
  updateLabStatus,
} from "@/lib/actions/payment.action";
import Image from "next/image";
import Script from "next/script";

declare global{
  interface Window{
    Razorpay: new (options: object) => { open: () => void };
  }
}

const validCoupons = [
  "AROGYAFREE",
  "ARYAFREE",
  "COMPASSOFF",
  "AROGYACOMPASS",
];

export default function Payments() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useParams();
  const [coupon, setCoupon] = useState("");
  const [loading, setLoading] = useState(false);
  const [type, setType] = useState<"hospital" | "lab" | null>(null);
  const [id, setId] = useState<string | null>(null);
  const AMOUNT = (type=="hospital")?2000:1500;

  useEffect(() => {
    if (pathname.includes("hospital")) {
      setType("hospital");
      setId(params.hospitalId as string);
    } else if (pathname.includes("lab")) {
      setType("lab");
      setId(params.labId as string);
    }
  }, [pathname, params]);

    const handlePayment = async () => {
      if (!id || !type) return;

      const trimmedCoupon = coupon.trim().toUpperCase();

      // ✅ CASE 1: VALID COUPON → skip Razorpay
      if (validCoupons.includes(trimmedCoupon)) {
        const timestamp = new Date().toISOString();
        if (type === "hospital") {
          await updateHospitalStatus(id, true, true, timestamp);
          alert("✅ Coupon applied. Hospital verified.");
          router.push(`/hospital/${id}/dashboard`);
        } else if (type === "lab") {
          await updateLabStatus(id, true, true, timestamp);
          alert("✅ Coupon applied. Lab verified.");
          router.push(`/lab/${id}/dashboard`);
        }
        return; 
      }
      try {
        setLoading(true);

        const response = await fetch("/api/payment", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ amount: AMOUNT }),
        });

        const data = await response.json();

        const options = {
          key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
          amount: AMOUNT * 100,
          currency: "INR",
          name: "ArogyaCompass",
          description: "Test Transaction",
          order_id: data.orderId,
          handler: async function (response: { razorpay_payment_id: string; razorpay_order_id: string; razorpay_signature: string }) {
            console.log("Payment Successful", response);
            const timestamp = new Date().toISOString();

            if (type === "hospital") {
              await updateHospitalStatus(id, true, true, timestamp);
              alert("✅ Payment successful. Hospital verified.");
              router.push(`/hospital/${id}/dashboard`);
            } else if (type === "lab") {
              await updateLabStatus(id, true, true, timestamp);
              alert("✅ Payment successful. Lab verified.");
              router.push(`/lab/${id}/dashboard`);
            }
          },
          theme: {
            color: "#3399cc",
          },
        };

        const rzp1 = new window.Razorpay(options);
        rzp1.open();
      } catch (err) {
        console.error(err);
        alert("❌ Error during payment");
      } finally {
        setLoading(false);
      }
    };




return (
  <div className="min-h-screen bg-[#0B0E1C] text-white flex flex-col md:flex-row items-center justify-center px-4 py-6 gap-6 overflow-hidden">
    <Script src="https://checkout.razorpay.com/v1/checkout.js" />

    {/* Payment Card */}
    <div className="bg-white text-black rounded-2xl shadow-lg w-full max-w-xl p-6 overflow-y-auto max-h-[95vh]">
      {/* Logo */}
      <div className="flex flex-col items-center justify-center -mt-2 mb-4">
        <Image
          alt="logo"
          src="/assets/icons/logo.png"
          height={80}
          width={80}
          className="h-20 w-auto object-contain"
        />
        <h1 className="text-2xl font-extrabold bg-gradient-to-r from-blue-600 via-blue-600 to-blue-400 bg-clip-text text-transparent">
          ArogyaCompass
        </h1>
        <p className="text-sm text-blue-400 font-semibold -mt-1">
          Your Smart Path to Faster Care
        </p>
      </div>

      {/* Countdown */}
      <div className="flex items-center justify-center text-blue-600 font-bold text-base mb-4">
        <CalendarClock className="mr-2" size={18} />
        <span id="countdown">05:00</span>
      </div>

      {/* Title & Description */}
      <h2 className="text-xl font-bold mb-1 flex items-center gap-2">
        {type === "hospital" ? <Hospital size={20} /> : <FlaskConical size={20} />}
        {type === "hospital" ? "Hospital Subscription" : "Lab Subscription"}
      </h2>
      <p className="text-sm text-gray-600 mb-1">
        {type === "hospital"
          ? "Dashboard tools, doctor visibility & location verification"
          : "Get featured on maps, manage tests, and patient records"}
      </p>

      {/* Price */}
      <p className="text-green-600 font-semibold text-lg mb-2">
        ₹{type === "hospital" ? "2000" : "1500"} / month
      </p>
      <p className="text-xs text-gray-500 mb-4">Trusted by Government</p>

      {/* Coupon */}
      <label className="text-sm font-semibold mb-1 block">Do you have a coupon code?</label>
      <input
        type="text"
        placeholder="Enter Coupon Code"
        value={coupon}
        onChange={(e) => setCoupon(e.target.value)}
        className="w-full px-3 py-2 mb-4 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-purple-500"
      />
      <button
        onClick={handlePayment}
        disabled={loading}
        className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded w-full mb-5 disabled:opacity-50"
      >
        {loading ? "Processing..." : "Grab the Subscription Now →"}
      </button>

      {/* Features List */}
      <div className="bg-gray-100 rounded-xl p-4 max-h-[300px] overflow-y-auto">
        <h3 className="text-md font-semibold mb-3">Everything you’ll get:</h3>
        <ul className="space-y-3 text-sm text-gray-800 list-disc list-inside">
          {[
            ["📅", "Everyday Patient Registered", "Track daily patient registrations with real-time insights."],
            ["📲", "Real-Time Update Sending", "Notify patients instantly via SMS or app updates."],
            ["🤖", "AI Based Data Handling", "Automated data processing using intelligent algorithms."],
            ["✨", "Smart File Analysis", "Upload and analyze prescriptions or reports instantly."],
            ["📊", "Interactive Dashboard", "Visualize performance and activity metrics easily."],
            ["🌐", "Patient Medical History", "Access complete patient records instantly."],
            ["🔐", "Data Privacy", "Your data stays secure and confidential."],
            ["💼", "Commercial Rights", "Full ownership of your data — no restrictions."],
            ["🗺️", "Featured on Arogya Maps", "Boost your visibility across verified maps."]
          ].map(([icon, title, desc], i) => (
            <li key={i}>
              <span className="font-semibold">{icon} {title}</span><br />
              <span className="text-gray-600">{desc}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>

    {/* Countdown Script */}
    <script dangerouslySetInnerHTML={{
      __html: `
        let timer = 300;
        const el = document.getElementById('countdown');
        const interval = setInterval(() => {
          const mins = String(Math.floor(timer / 60)).padStart(2, '0');
          const secs = String(timer % 60).padStart(2, '0');
          el.textContent = \`\${mins}:\${secs}\`;
          if (--timer < 0) clearInterval(interval);
        }, 1000);
      `
    }} />
  </div>
);



}
