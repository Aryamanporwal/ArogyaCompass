"use client";

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
        return; // ✅ Exit early
      }

      // ✅ CASE 2: No or invalid coupon → initiate payment
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
  <div className="h-screen bg-[#0B0E1C] text-white flex justify-center flex-col md:flex-row items-center px-4 py-6 gap-6 overflow-hidden">
    <Script src = "https://checkout.razorpay.com/v1/checkout.js"/>
    {/* Left: Payment Card */}
    <div className="bg-white text-black rounded-2xl shadow-lg w-[600px] p-6 flex flex-col overflow-y-auto max-h-[95vh] scrollbar-thin scrollbar-thumb-gray-300 justify center">
      {/* Logo */}
    <div className="flex flex-col items-center justify-center -mt-2 mb-3">
      <Image
        alt="logo"
        src="/assets/icons/logo.png"
        height={200}
        width={200}
        className="h-20 sm:h-24 md:h-28 w-auto object-contain"
      />
      <div className="-mt-1 text-center leading-tight">
        <h1 className="text-[1.3rem] font-extrabold bg-gradient-to-r from-blue-600 via-blue-600 to-blue-400 bg-clip-text text-transparent ">
          ArogyaCompass
        </h1>
        <h2 className="text-sm text-blue-400 mt-0.5 font-bold">Your Smart Path to Faster Care</h2>
      </div>
    </div>

      {/* Countdown */}
      <div className="flex items-center justify-center text-blue-600  font-bold text-lg mb-4">
        ⏳ <span id="countdown" className="ml-2">05:00</span>
      </div>

      {/* Title */}
      <h2 className="text-2xl font-bold mb-1">
        {type === "hospital" ? "🏥 Hospital Subscription" : "🔬 Lab Subscription"}
      </h2>

      {/* Description */}
      <p className="text-gray-600 mb-1">
        {type === "hospital"
          ? "Dashboard tools, doctor visibility & location verification"
          : "Get featured on maps, manage tests, and patient records"}
      </p>

      {/* Price */}
      <p className="text-green-600 font-semibold text-xl mb-1">
        ₹{type === "hospital" ? "2000" : "1500"} / month
      </p>

      {/* Trust */}
      <p className="text-sm text-gray-500 mb-4">Trusted by Government</p>

      {/* Coupon Section */}
      <label className="text-sm font-semibold mb-1">Do you have a coupon code?</label>
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
        className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded w-full mb-4 disabled:opacity-50"
      >
        {loading ? "Processing..." : "Grab the Subscription Now →"}
      </button>

      {/* Features */}
      <div className="bg-gray-100 rounded-xl p-4 overflow-y-auto max-h-[300px]">
        <h3 className="text-md font-semibold mb-3">Everything you’ll get:</h3>
        <ul className="space-y-3 text-sm text-gray-800 list-none">
          <li>
            <span className="font-semibold">📅 Everyday Patient Registered</span><br />
            <span className="text-gray-600">Track daily patient registrations with real-time insights.</span>
          </li>
          <li>
            <span className="font-semibold">📲 Real-Time Update Sending to Patient</span><br />
            <span className="text-gray-600">Notify patients instantly via SMS or app updates.</span>
          </li>
          <li>
            <span className="font-semibold">🤖 AI Based Data Handling</span><br />
            <span className="text-gray-600">Automated data processing using intelligent algorithms.</span>
          </li>
          <li>
            <span className="font-semibold">✨ Smart File Analysis</span><br />
            <span className="text-gray-600">Upload and analyze medical files, prescriptions, or reports instantly.</span>
          </li>
          <li>
            <span className="font-semibold">📊 Interactive Dashboard</span><br />
            <span className="text-gray-600">Visualize performance metrics, reports, and activities with ease.</span>
          </li>
          <li>
            <span className="font-semibold">🌐 Patient Medical History</span><br />
            <span className="text-gray-600">Access complete patient records in one click.</span>
          </li>
          <li>
            <span className="font-semibold">🔐 Data Privacy</span><br />
            <span className="text-gray-600">Your data stays secure and confidential — always.</span>
          </li>
          <li>
            <span className="font-semibold">💼 Commercial Rights</span><br />
            <span className="text-gray-600">Full ownership of your data and outputs — no restrictions.</span>
          </li>
          <li>
            <span className="font-semibold">🗺️ Featured on Arogya Maps</span><br />
            <span className="text-gray-600">Boost visibility by appearing on verified health maps.</span>
          </li>
        </ul>
      </div>
    </div>

    {/* Right: Illustration Image */}
    {/* <div className="w-full md:w-1/2 flex items-center justify-center p-4 max-h-[100vh]">
      <Image
        src="/assets/images/pay_image.png"
        alt="Pay Illustration"
        width={500}
        height={500}
        className="object-contain rounded-2xl"
      />
    </div> */}

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
