"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { Input } from "@/components/ui/input";
// import Image from "next/image";
import { registerLab} from "@/lib/actions/lab.action";
import { LAB_TEST_OPTIONS, LabTest } from "@/lib/constants/lab.constants";
import FileUpload from "../ui/FileUploader";

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
      const result = await registerLab(labData, logoFile[0]);
      alert("Lab registered successfully!");
      router.push(`/lab/${result.labId}/pay`);
    } catch (error) {
      console.error("Registration failed:", error);
      alert("Failed to register lab.");
    }
  };

return (
  <div className="flex flex-col md:flex-row h-screen w-full bg-background text-foreground overflow-hidden">
    {/* Map Section */}
    <div className="w-full md:w-[45%] bg-muted px-3 pt-4 md:px-0 md:pt-0 flex items-center justify-center">
      <div className="w-full h-[350px] sm:h-[420px] md:h-[95%] rounded-2xl shadow-2xl overflow-hidden">
        <LabMap onLocationFetched={setCoordinates} />
      </div>
    </div>

    {/* Form Section */}
    <div className="w-full md:w-[55%] overflow-y-auto p-6 sm:p-8 bg-gray-900 text-white">
      <form onSubmit={handleSubmit} className="space-y-8">
        <h2 className="text-3xl font-bold text-center md:text-left">Register Lab</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input required placeholder="Lab Name" value={lab.name} onChange={e => handleLabChange("name", e.target.value)} />
          <Input required type="email" placeholder="Email" value={lab.email} onChange={e => handleLabChange("email", e.target.value)} />
          <Input required placeholder="Phone" value={lab.phone} onChange={e => handleLabChange("phone", e.target.value)} />
          <Input required placeholder="Address" value={lab.address} onChange={e => handleLabChange("address", e.target.value)} />
          <Input required placeholder="City" value={lab.city} onChange={e => handleLabChange("city", e.target.value)} />
          <Input required placeholder="License Number" value={lab.licenseNumber} onChange={e => handleLabChange("licenseNumber", e.target.value)} />
          <div>
            <label className="block mb-1 text-sm font-medium">Lab Image</label>
            <FileUpload files={logoFile} onChange={setLogoFile} />
          </div>
        </div>

        <div>
          <label className="block mb-2 font-semibold">Select Tests Offered</label>
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

        <div className="flex justify-center md:justify-start">
          <button
            type="submit"
            className="bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-6 rounded-lg"
          >
            Submit and Continue
          </button>
        </div>
      </form>
    </div>
  </div>
);

}
