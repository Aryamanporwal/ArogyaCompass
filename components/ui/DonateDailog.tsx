"use client";
import React, { useState } from "react";
import { SuccessfulPayment } from "./SuccessfulPayment";

interface DonateDialogProps {
  onClose: () => void;
}

const VALID_COUPONS = ["AROGYACOMPASS", "AROGYADONATE"];

export default function DonateDialog({ onClose }: DonateDialogProps) {
  const [amount, setAmount] = useState<string>("");
  const [coupon, setCoupon] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [successMsg, setSuccessMsg] = useState<string>("");
  const [errorMsg, setErrorMsg] = useState<string>("");
  const [paymentSuccess , setPaymentSuccess] = useState(false);

  // Load Razorpay script
  const loadRazorpayScript = (): Promise<boolean> =>
    new Promise((resolve) => {
      if (window.Razorpay) {
        resolve(true);
        return;
      }
      const script = document.createElement("script");
      script.src = "https://checkout.razorpay.com/v1/checkout.js";
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });

  // Handle payment
  const handlePayment = async () => {
    setErrorMsg("");
    setSuccessMsg("");

    
    if (coupon && VALID_COUPONS.includes(coupon.trim().toUpperCase())) {
        setSuccessMsg(
            "Thank you! Coupon accepted, your Pro access is granted."
        );
        setPaymentSuccess(true)
        setLoading(false)
         console.log("Coupon valid — paymentSuccess set true");
        return;
    }
    if (!amount || isNaN(Number(amount)) || Number(amount) < 1) {
      setErrorMsg("Please enter a valid donation amount.");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("/api/payment", {
        method: "POST",
        body: JSON.stringify({ amount: Number(amount) }),
        headers: { "Content-Type": "application/json" },
      });
      const data = await response.json();

      if (!data.orderId) throw new Error("Failed to create payment order");

      const scriptLoaded = await loadRazorpayScript();
      if (!scriptLoaded) {
        setErrorMsg("Razorpay SDK failed to load. Please try again later.");
        setLoading(false);
        return;
      }

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID as string,
        amount: Number(amount) * 100,
        currency: "INR",
        name: "ArogyaCompass",
        description: "Donate to ArogyaCompass",
        order_id: data.orderId,
        handler: function (response: { razorpay_payment_id: string }) {
          // The 'response' is used here but you can add more logic if needed
          console.log(response)
          setSuccessMsg("Payment successful! Thank you for your support.");
          setPaymentSuccess(true)
        //   setTimeout(() => onClose(), 2000);
        },
        prefill: {},
        theme: {
          color: "#2563eb",
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch  {
      setErrorMsg(
        "Something went wrong. Please try again or contact support."
      );
      setLoading(false);
    }
  };

  const handleUnlock = () => {
    //I should add logic,  what will happen on closing
    onClose();
  }
  if (paymentSuccess) {
      console.log("Rendering SuccessfulPayment component");
      return <SuccessfulPayment onUnlock={handleUnlock} />;
    }

  return (
    <div className="fixed inset-0 z-30 bg-black/40 flex items-center justify-center p-4">
      <div
        className="w-full max-w-md rounded-2xl shadow-2xl bg-white dark:bg-[#1e1e21] relative flex flex-col gap-6 px-6 py-8"
        style={{ fontFamily: "Inter, sans-serif" }}
      >
        <button
          className="absolute top-3 right-4 text-2xl text-gray-400 hover:text-gray-700 dark:text-gray-500"
          onClick={onClose}
          aria-label="Close"
        >
          ×
        </button>
        <h2 className="text-xl font-bold text-blue-700 dark:text-blue-200 mb-2 text-center">
          Donate to ArogyaCompass
        </h2>
        <div>
          <label
            htmlFor="amount-input"
            className="block font-medium mb-2 text-gray-700 dark:text-gray-300"
          >
            Amount (INR)
          </label>
          <input
            id="amount-input"
            type="number"
            min={1}
            step={1}
            className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-100 dark:bg-[#262a2f] text-gray-900 dark:text-white shadow-sm focus:ring-2 focus:ring-blue-400 outline-none transition"
            placeholder="Enter amount (e.g., 2100)"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
          />
        </div>
        <div>
          <label
            htmlFor="coupon-input"
            className="block font-medium mb-2 text-gray-700 dark:text-gray-300"
          >
            Coupon Code{" "}
            <span className="font-normal text-xs text-gray-500">(optional)</span>
          </label>
          <input
            id="coupon-input"
            type="text"
            className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-100 dark:bg-[#262a2f] text-gray-900 dark:text-white shadow-sm focus:ring-2 focus:ring-blue-400 outline-none transition"
            placeholder='e.g. "FREE"'
            value={coupon}
            onChange={(e) => setCoupon(e.target.value)}
            autoCapitalize="characters"
          />
        </div>
        <button
          onClick={handlePayment}
          disabled={loading}
          className="w-full py-3 mt-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-lg font-semibold transition-all"
        >
          {loading ? "Processing..." : "Donate & Continue"}
        </button>
        {successMsg && (
          <p className="text-green-600 text-center font-medium">{successMsg}</p>
        )}
        {errorMsg && (
          <p className="text-red-500 text-center font-medium">{errorMsg}</p>
        )}
        <div className="text-xs text-center text-gray-400 mt-3">
          Payment powered by Razorpay. Coupon grants instant Pro (demo).
        </div>
      </div>
    </div>
  );
}
