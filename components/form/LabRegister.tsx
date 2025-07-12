"use client";


import Image from "next/image";
import {  FlaskConical } from "lucide-react";
import { useState } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
// import Image from "next/image";
import { registerLab} from "@/lib/actions/lab.action";
import { LAB_TEST_OPTIONS, LabTest } from "@/lib/constants/lab.constants";
import FileUpload from "../ui/FileUploader";
import { LogOut } from "lucide-react"

// Load map dynamically to avoid SSR issues
const LabMap = dynamic(() => import("@/components/LabMap"), { ssr: false });

type LabData = {
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  licenseNumber: string;
  logoUrl: string;
  logoId: string;
  logo?: string; 
  isVerified: boolean;
  istrueLocation: boolean;
  coordinates: [number, number];
  test: LabTest[];

};

export default function LabForm() {
  const router = useRouter();
  const [lab, setLab] = useState<Omit<LabData, "logoUrl" | "coordinates" | "test">>({
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    licenseNumber: "",
    isVerified: false,
    istrueLocation: false,
    logoId : "",
  });
  // const [logoUrl, setLogoUrl] = useState<string>("");
  const [logoFile, setLogoFile ] = useState<File[]>([]);
  const [coordinates, setCoordinates] = useState<[number, number] | null>(null);
  const [selectedTests, setSelectedTests] = useState<LabTest[]>([]);

  const handleLabChange = (key: keyof typeof lab, value: string | boolean) => {
    setLab((prev) => ({ ...prev, [key]: value }));
  };

  // const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
  //   const file = e.target.files?.[0];
  //   if (!file) return;
  //   try {
  //     const result = await uploadLabLogo(file);
  //     // If result is ArrayBuffer, convert to base64 string
  //     let logoString: string;
  //     if (result instanceof ArrayBuffer) {
  //       const base64String = Buffer.from(result).toString("base64");
  //       logoString = `data:${file.type};base64,${base64String}`;
  //     } else {
  //       logoString = result as string;
  //     }
  //     setLogoUrl(logoString);
  //   } catch (err) {
  //     console.error("Lab Image upload failed:", err);
  //     alert("Failed to upload logo.");
  //   }
  // };

  const toggleTest = (test: LabTest) => {
    setSelectedTests((prev) =>
      prev.includes(test) ? prev.filter((t) => t !== test) : [...prev, test]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!coordinates || coordinates.length !== 2) {
      alert("Please select a valid location on the map.");
      return;
    }
    const labData: LabData = {
      ...lab,
      logoUrl:"",
      logoId:"",
      logo:"",
      coordinates: coordinates,
      test: selectedTests,
      isVerified: false,
      istrueLocation: false,
    };

    try {
      await registerLab(labData, logoFile[0]);
      alert("Lab registered successfully!");
      router.push(`/pay`);
    } catch (error) {
      console.error("Registration failed:", error);
      alert("Failed to register lab.");
    }
  };

return (
  <div className="flex flex-col md:flex-row h-screen w-full bg-black text-white overflow-hidden font-sans">
    {/* Map Section - first on mobile */}
    <div className="w-full md:w-[45%] px-3 pt-4 md:px-0 md:pt-0 flex items-center justify-center">
      <div className="w-full h-[350px] sm:h-[420px] md:h-[95%] rounded-2xl shadow-2xl overflow-hidden border border-gray-700 backdrop-blur-md bg-[#1f1f1f]/40">
        <LabMap onLocationFetched={setCoordinates} />
      </div>
    </div>

    {/* Form Section */}
    <div className="w-full md:w-[55%] overflow-y-auto p-6 sm:p-8 bg-black">
      {/* Logo Header */}
      <div className="flex items-center justify-center md:justify-start mb-8 gap-3 backdrop-blur-md bg-[#2a2a2a]/30 px-6 py-3 rounded-2xl shadow border border-gray-700">
        <Image src="/assets/icons/logo.png" alt="Logo" width={40} height={40} />
        <h1 className="text-2xl font-semibold text-green-400">ArogyaCompass</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-10">
        <h2 className="text-3xl font-bold text-center md:text-left text-green-400 flex items-center gap-2">
          <FlaskConical className="text-green-400" size={34} /> Register Lab
        </h2>

        <div className="border border-gray-700 p-6 rounded-xl bg-[#080808] shadow-md space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <Input required placeholder="Lab Name" value={lab.name} onChange={e => handleLabChange("name", e.target.value)} />
            <Input required type="email" placeholder="Email" value={lab.email} onChange={e => handleLabChange("email", e.target.value)} />
            <Input required placeholder="Phone" value={lab.phone} onChange={e => handleLabChange("phone", e.target.value)} />
            <Input required placeholder="Address" value={lab.address} onChange={e => handleLabChange("address", e.target.value)} />
            <Input required placeholder="City" value={lab.city} onChange={e => handleLabChange("city", e.target.value)} />
            <Input required placeholder="License Number" value={lab.licenseNumber} onChange={e => handleLabChange("licenseNumber", e.target.value)} />
            <div>
              <label className="block mb-1 text-sm font-medium text-gray-300">Lab Image</label>
              <FileUpload files={logoFile} onChange={setLogoFile} />
            </div>
          </div>
        </div>

        <div className="border border-gray-700 p-6 rounded-xl bg-[#080808] shadow-md space-y-4">
          <label className="block mb-2 font-semibold text-indigo-300">Select Tests Offered</label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {LAB_TEST_OPTIONS.map((test) => (
              <label key={test} className="flex items-center space-x-2 text-sm">
                <input
                  type="checkbox"
                  value={test}
                  checked={selectedTests.includes(test)}
                  onChange={() => toggleTest(test)}
                />
                <span>{test.replace(/_/g, " ")}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="flex flex-col sm:flex-row mb-6 items-center justify-between gap-4">
          <button
            type="submit"
            className="bg-green-600 hover:bg-green-700 text-white font-semibold py-2 px-6 rounded-lg transition-all"
          >
            Submit and Continue
          </button>

          <div className="flex flex-col gap-3 mt-3">
            <button
              type="button"
              className="text-blue-500 hover:underline text-sm font-medium"
              onClick={() => router.push("/hospitalregistration")}
            >
              Go to Hospital Registration
            </button>

            <button
              onClick={() => router.push("/")}
              className="flex items-center gap-2 text-red-600 hover:text-red-800 font-medium"
            >
              <LogOut className="w-5 h-5" />
              Home
            </button>
          </div>
        </div>
      </form>
    </div>
  </div>
);


}
