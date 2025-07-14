import { X } from "lucide-react";
import Script from "next/script";
import Image from "next/image";
import { useState } from "react";

declare global {
  interface Window {
    Razorpay: new (options: object) => { open: () => void };
  }
}

type FinePaymentModalProps = {
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
  darkMode: boolean;
};

export default function FinePaymentModal({ open, onClose, onSuccess, darkMode }: FinePaymentModalProps) {
  const [loading, setLoading] = useState(false);

  if (!open) return null;

  // Payment Handler
  const handleFinePayment = async () => {
    setLoading(true);
    try {
      // Create order on your backend
      const response = await fetch("/api/payment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: 21 }), // ₹21
      });
      const data = await response.json();

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: 21 * 100,
        currency: "INR",
        name: "ArogyaCompass",
        description: "Fine for Appointment Cancellations",
        order_id: data.orderId,
        handler: function (response: { razorpay_payment_id: string; razorpay_order_id: string; razorpay_signature: string }) {
          // You can verify payment on backend here if needed
          alert("✅ Fine payment successful. You can now cancel appointments.");
          console.log(response)
          onSuccess();
          onClose();
        },
        theme: {
          color: "#2563eb", // blue-600
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch  {
      alert("❌ Error during payment. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Script src="https://checkout.razorpay.com/v1/checkout.js" />
      {/* Modal Overlay */}
      <div className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm flex items-center justify-center">
        {/* Modal Card */}
        <div
          className={`
            relative w-full max-w-md mx-auto rounded-2xl shadow-2xl
            ${darkMode ? "bg-[#10131d] text-white" : "bg-white text-gray-900"}
            p-8
          `}
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-red-500"
            aria-label="Close"
          >
            <X size={22} />
          </button>
          {/* Logo */}
          <div className="flex flex-col items-center mb-4">
            <Image
              src="/assets/icons/logo.png"
              alt="ArogyaCompass"
              width={48}
              height={48}
              className="mb-2"
            />
            <h2 className="text-xl font-bold mb-1 text-center">
              Pay Fine to Continue
            </h2>
            <p className={`text-sm ${darkMode ? "text-gray-300" : "text-gray-600"} text-center`}>
              Please pay the fine to re-enable appointment cancellation.
            </p>
          </div>

          {/* Amount */}
          <div className={`flex items-center justify-center my-4`}>
            <span className={`text-2xl font-semibold ${darkMode ? "text-blue-400" : "text-blue-600"}`}>₹21</span>
          </div>

          {/* Note */}
          <div className={`rounded-lg p-3 mb-4 text-xs ${darkMode ? "bg-blue-950/60 text-blue-100" : "bg-blue-50 text-blue-800"} border border-blue-200`}>
            <b>Note:</b> The fine collected from you will be used in charity for helping needy people.
          </div>

          {/* Instructions */}
          <ul className={`mb-4 text-xs ${darkMode ? "text-gray-300" : "text-gray-600"} list-disc list-inside space-y-1`}>
            <li>Payment is secure via Razorpay.</li>
            <li>Once paid, you can immediately cancel appointments again.</li>
            <li>If payment fails, please try again or contact support.</li>
            <li>For any queries, email <a href="mailto:support@arogyacompass.com" className="underline text-blue-500">support@arogyacompass.com</a></li>
          </ul>

          {/* Pay Button */}
          <button
            onClick={handleFinePayment}
            disabled={loading}
            className={`
              w-full py-2 rounded-lg font-semibold text-base transition
              ${loading ? "opacity-60 cursor-not-allowed" : ""}
              ${darkMode ? "bg-blue-600 hover:bg-blue-700 text-white" : "bg-blue-600 hover:bg-blue-700 text-white"}
            `}
          >
            {loading ? "Processing..." : "Pay Fine ₹21"}
          </button>
        </div>
      </div>
    </>
  );
}
