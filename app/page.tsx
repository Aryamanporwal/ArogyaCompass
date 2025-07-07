"use client";
import PatientForm from "@/components/form/PatientForm";
import Image from "next/image";
import Link from "next/link";
import dynamic from "next/dynamic";
import AdminPasskeyLogin from "@/components/adminPassKeyLogin";
import { useState } from "react";

const MapView = dynamic(() => import("@/components/MapView"), { ssr: false });

export default function Home() {
  const [showAdminModal, setShowAdminModal] = useState(false);
  //  const searchParams = useSearchParams();
  // const isAdminMode = searchParams.get("admin") === "true";
return (
  <div className="flex flex-col md:flex-row h-screen w-full bg-background text-foreground ">
    {/* Map Section - first on mobile */}
    <div className="w-full md:w-3/5 bg-muted px-3 pt-4 md:px-0 md:pt-0 flex items-center justify-center">
      <div className="w-full h-[350px] sm:h-[400px] md:h-[95%] rounded-2xl shadow-2xl overflow-hidden">
        <MapView />
      </div>
    </div>

    {/* Form Section */}
    <section className="w-full md:w-2/5 flex flex-col justify-start px-6 pt-6 pb-4 sm:px-10 md:px-12 lg:px-16 bg-background overflow-y-auto">
      {/* Logo + Tagline */}
      <div className="flex flex-col items-center justify-center -mt-2 mb-3">
        <Image
          alt="logo"
          src="/assets/icons/logo.png"
          height={200}
          width={200}
          className="h-20 sm:h-24 md:h-28 w-auto object-contain"
        />
        <div className="-mt-1 text-center leading-tight">
          <h1 className="text-[1.3rem] font-bold bg-gradient-to-r from-blue-400 via-blue-600 to-blue-400 bg-clip-text text-transparent">
            ArogyaCompass
          </h1>
          <h2 className="text-sm text-blue-500 mt-0.5">
            Your Smart Path to Faster Care
          </h2>
        </div>
      </div>

      {/* Headings */}
      <div className="mb-5">
        <h1 className="text-2xl font-bold mb-1 text-left">Hi there...</h1>
        <p className="text-base text-dark-600 text-left">
          Get started with your appointment journey
        </p>
      </div>

      {/* Form Card */}
      <div className="w-full rounded-xl bg-transparent p-5 shadow-md border border-dark-500">
        <PatientForm />
      </div>

      {/* Register CTA */}
      <div className="text-sm mt-5 text-dark-600 text-center">
        Don’t have a hospital account?{" "}
        <Link
          href="/hospitalregistration"
          className="text-green-500 font-medium hover:underline"
        >
          Register here
        </Link>
      </div>

      {/* Footer */}
      <div className="text-xs mt-3 px-2 flex justify-between text-dark-600">
        <p>&copy; 2025 ArogyaCompass</p>
        <button
            onClick={() => setShowAdminModal(true)}
            className="text-green-600 hover:underline"
          >
            Admin
          </button>
      </div>
    </section>
      {showAdminModal && (
          <AdminPasskeyLogin
            onClose={() => setShowAdminModal(false)}
          />
        )}
  </div>
);

}
