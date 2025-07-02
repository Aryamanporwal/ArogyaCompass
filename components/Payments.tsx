"use client";

import { useParams, useRouter, usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import {
  updateHospitalStatus,
  updateLabStatus,
} from "@/lib/actions/payment.action";

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
    if (!validCoupons.includes(trimmedCoupon)) {
      alert("❌ Invalid coupon code");
      return;
    }

    try {
      setLoading(true);
      const timestamp = new Date().toISOString();

      if (type === "hospital") {
        await updateHospitalStatus(id, true, true, timestamp);
        alert("✅ Successful payment and Verification for Hospital");
        router.push(`/hospital/${id}/dashboard`);
      } else if (type === "lab") {
        await updateLabStatus(id, true, true, timestamp);
        alert("✅ Successful payment and Verification for Lab");
        router.push(`/lab/${id}/dashboard`);
      }
    } catch (err) {
      console.error(err);
      alert("❌ Error updating payment status");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B0E1C] text-white flex items-center justify-center py-12 px-6">
      <div className="max-w-xl w-full">
        {type === "hospital" && (
          <div className="bg-[#111827] p-6 rounded-2xl shadow-xl">
            <h2 className="text-2xl font-semibold mb-2">🏥 Hospital Subscription</h2>
            <p className="text-gray-400 mb-4">
              Get access to dashboard tools, doctor management and visibility.
            </p>
            <p className="text-green-400 text-lg font-bold mb-2">₹2000 / month</p>
            <input
              type="text"
              placeholder="Enter Coupon Code"
              value={coupon}
              onChange={(e) => setCoupon(e.target.value)}
              className="w-full px-3 py-2 rounded bg-gray-800 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-green-500 mb-4"
            />
            <button
              onClick={handlePayment}
              disabled={loading}
              className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded disabled:opacity-50"
            >
              {loading ? "Processing..." : "Pay & Activate"}
            </button>
          </div>
        )}

        {type === "lab" && (
          <div className="bg-[#111827] p-6 rounded-2xl shadow-xl">
            <h2 className="text-2xl font-semibold mb-2">🔬 Lab Subscription</h2>
            <p className="text-gray-400 mb-4">
              Get featured on maps, test management tools, and patient tracking.
            </p>
            <p className="text-green-400 text-lg font-bold mb-2">₹1500 / month</p>
            <input
              type="text"
              placeholder="Enter Coupon Code"
              value={coupon}
              onChange={(e) => setCoupon(e.target.value)}
              className="w-full px-3 py-2 rounded bg-gray-800 text-white border border-gray-600 focus:outline-none focus:ring-2 focus:ring-green-500 mb-4"
            />
            <button
              onClick={handlePayment}
              disabled={loading}
              className="w-full bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded disabled:opacity-50"
            >
              {loading ? "Processing..." : "Pay & Activate"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
