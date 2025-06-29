"use client";
import PatientForm from "@/components/form/PatientForm";
import Image from "next/image";
import Link from "next/link";
import dynamic from "next/dynamic";

const MapView = dynamic(() => import("@/components/MapView"), { ssr: false });

export default function Home() {
  return (
    <div className="flex h-screen w-full bg-background text-foreground">
      {/* Left: Form Section */}
      <section className="flex w-full max-w-[600px] flex-col justify-center px-8 py-10 sm:px-12 md:px-16 lg:px-20">
        {/* Centered logo */}
        <div className="flex flex-col items-center justify-center mb-10">
          <Image
            alt="logo"
            src="/assets/icons/logo-full.png"
            height={240}
            width={240}
            className="h-20 sm:h-24 md:h-28 w-auto object-contain"
          />
        </div>

        <h1 className="text-32-bold mb-2 text-center">Hi there, ....</h1>
        <p className="text-16-regular mb-8 text-dark-600 text-center">
          Get started with your appointment journey.
        </p>

        {/* Form */}
        <div className="w-full rounded-xl bg-white p-6 shadow-xl">
          <PatientForm />
        </div>

        {/* Register CTA */}
        <div className="text-14-regular mt-6 text-dark-600 text-center">
          Don’t have a hospital account?{" "}
          <Link
            href="/hospitalregistration"
            className="text-green-500 font-medium hover:underline"
          >
            Register here
          </Link>
        </div>

        {/* Footer */}
        <div className="text-14-regular mt-12 flex justify-between text-dark-600">
          <p>&copy; 2025 ArogyaCompass</p>
          <Link
            href="/?admin=true"
            className="text-green-600 hover:underline"
          >
            Admin
          </Link>
        </div>
      </section>

      {/* Right: Map Section */}
      <div className="hidden h-full flex-1 md:flex items-center justify-center bg-muted">
        <div className="relative h-[95%] w-[95%] max-w-[1000px] rounded-2xl shadow-2xl overflow-hidden">
          <MapView />
        </div>
      </div>
    </div>
  );
}
