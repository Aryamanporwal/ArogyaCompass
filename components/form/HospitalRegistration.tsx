"use client";


import Image from "next/image";
import { Building2, LogOut } from "lucide-react";
import { useState } from "react";
import { Plus, Trash2, UserPlus } from "lucide-react";
import dynamic from "next/dynamic";
import { registerHospital } from "@/lib/actions/hospital.action";
import { Input } from "@/components/ui/input";
import { useRouter } from "next/navigation";
import FileUpload from "../ui/FileUploader";
// import { InputFile } from "node-appwrite/file";
// import { BUCKET_ID, ENDPOINT, ID, PROJECT_ID, storage } from "@/lib/appwrite.config";

// Dynamically load HospitalMap to avoid SSR issues
const HospitalMap = dynamic(() => import("@/components/HospitalMap"), { ssr: false });

type Doctor = {
  Name: string;
  Email: string;
  phone: string;
  Address: string;
  City: string;
  licenseNumber: string;
  logoUrl: string;
  logoId: string;
  logo?: string; 
  speciality: string[];
  isVerified: boolean;
  availability: string[];
  experience: number;
};

type HospitalData = {
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  pincode: string;
  licenseNumber: string;
  specialities: string[];
  logoUrl: string;
  logoId: string;
  logo?: string; // optional file name
  isVerified: boolean;
  istrueLocation: boolean;
  coordinates: number[];
  doctors: Doctor[];
  doctorName: string[];
};

export default function HospitalForm() {
  // Hospital state
  const router = useRouter();
const [hospital, setHospital] = useState<Omit<HospitalData, "logoUrl" | "specialities" | "coordinates">>({
  name: "",
  email: "",
  phone: "",
  address: "",
  city: "",
  licenseNumber: "",
  isVerified: false,
  istrueLocation: false,
  doctors: [],
  doctorName: [],
  state: "",
  pincode: "",
  logoId: "",
});
  const [specialities, setSpecialities] = useState<string[]>([]);
  // const [hospitalLogoUrl, setHospitalLogoUrl] = useState<string>("");
  const [coordinates, setCoordinates] = useState<[number, number] | null>(null);
  const [logoFile, setLogoFile] = useState<File[]>([]);
  const [doctorLogoFile, setDoctorLogoFile] = useState<File[]>([]);

  // Doctors state
  const [doctors, setDoctors] = useState<Doctor[]>([
    {
      Name: "",
      Email: "",
      phone: "",
      Address: "",
      City: "",
      licenseNumber: "",
      logoUrl: "",
      speciality: [],
      isVerified: false,
      availability: [],
      experience: 0,
      logoId:"",
    },
  ]);

  // Handlers for hospital fields
  const handleHospitalChange = (field: keyof typeof hospital, value: string) => {
    setHospital((prev) => ({ ...prev, [field]: value }));
  };

  // Handlers for doctors
  const addDoctor = () => {
    setDoctors([
      ...doctors,
      {
        Name: "",
        Email: "",
        phone: "",
        Address: "",
        City: "",
        licenseNumber: "",
        logoUrl: "",
        speciality: [],
        isVerified: false,
        availability: [],
        experience: 0,
        logoId:"",
      },
    ]);
  };

  const updateDoctor = <K extends keyof Doctor>(index: number, key: K, value: Doctor[K]) => {
    const updatedDoctors = [...doctors];
      updatedDoctors[index][key] = value;

      setDoctors(updatedDoctors);

  };

    const removeDoctor = (index: number) => {
      if (doctors.length === 1) return;
      setDoctors(doctors.filter((_, i) => i !== index));
    };


const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  try {
    const hospitalData: HospitalData = {
      ...hospital,
      logoUrl: "", // will be set server-side
      logoId: "",  // will be set server-side
      logo: "",    // will be set server-side
      specialities,
      coordinates: coordinates ?? [],
      isVerified: false,
      istrueLocation: false,
      doctorName: doctors.map((doc) => doc.Name),
      doctors: [], // leave empty here
    };

    const result = await registerHospital(hospitalData, doctors, logoFile[0], doctorLogoFile[0]);

    alert("Hospital Created. Proceed to payment");

    if (result?.hospitalId) {
      router.push(`/payment`);
    }
  } catch (error) {
    console.error("Registration failed:", error);
    alert("Failed to register. See console for details.");
  }
};


return (
  <div className="flex flex-col md:flex-row h-screen w-full bg-black mb-6 text-white overflow-hidden font-sans">
    {/* Map Section - first on mobile */}
    <div className="w-full md:w-[45%] bg-black px-3 pt-4 md:px-0 md:pt-0 flex items-center justify-center">
      <div className="w-full h-[350px] sm:h-[420px] md:h-[95%] rounded-2xl shadow-2xl overflow-hidden border border-gray-700">
        <HospitalMap onLocationFetched={setCoordinates} />
      </div>
    </div>

    {/* Form Section */}
    <div className="w-full md:w-[55%] overflow-y-auto p-6 sm:p-8 bg-black">
      {/* Logo Header */}
      <div className="flex items-center justify-center md:justify-start mb-8 gap-3 backdrop-blur-md bg-[#2a2a2a]/30 px-6 py-3 rounded-2xl shadow border border-gray-700">
        <Image src="/assets/icons/logo.png" alt="Logo" width={42} height={42} />
        <h1 className="text-2xl font-semibold text-white">ArogyaCompass</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-10">
        <h2 className="text-3xl font-bold text-center md:text-left text-green-400 flex items-center gap-2">
          <Building2 className="text-green-400" size={24} /> Register Hospital
        </h2>

        <div className="border border-gray-700 p-6 rounded-xl bg-[#080808] shadow-md space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <Input required placeholder="Hospital Name" value={hospital.name} onChange={e => handleHospitalChange("name", e.target.value)} />
            <Input required placeholder="Email Address" type="email" value={hospital.email} onChange={e => handleHospitalChange("email", e.target.value)} />
            <Input required placeholder="Phone Number" value={hospital.phone} onChange={e => handleHospitalChange("phone", e.target.value)} />
            <Input required placeholder="Address" value={hospital.address} onChange={e => handleHospitalChange("address", e.target.value)} />
            <Input required placeholder="City" value={hospital.city} onChange={e => handleHospitalChange("city", e.target.value)} />
            <Input required placeholder="State" value={hospital.state} onChange={e => handleHospitalChange("state", e.target.value)} />
            <Input required placeholder="Pincode" value={hospital.pincode} onChange={e => handleHospitalChange("pincode", e.target.value)} />
            <Input required placeholder="License Number" value={hospital.licenseNumber} onChange={e => handleHospitalChange("licenseNumber", e.target.value)} />
            <Input placeholder="Specialities (comma-separated)" value={specialities.join(",")} onChange={e => setSpecialities(e.target.value.split(","))} />
            <div >
              <label className="block mb-1 text-sm font-medium text-gray-300">Hospital Image</label>
              <FileUpload files={logoFile} onChange={setLogoFile} />
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-2xl font-semibold mb-4 text-indigo-400 flex items-center gap-2">
            <UserPlus className="text-indigo-400" size={20} /> Doctors
          </h3>
          {doctors.map((doctor, index) => (
            <div key={index} className="border border-gray-700 p-5 rounded-xl mb-6 bg-[#080808] shadow-md space-y-4">
              <div className="flex justify-between items-center">
                <h4 className="text-lg font-semibold">Doctor #{index + 1}</h4>
                {index > 0 && (
                  <button type="button" onClick={() => removeDoctor(index)} className="text-red-500 hover:text-red-600">
                    <Trash2 size={18} />
                  </button>
                )}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input required placeholder="Name" value={doctor.Name} onChange={e => updateDoctor(index, "Name", e.target.value)} />
                <Input required placeholder="Email" type="email" value={doctor.Email} onChange={e => updateDoctor(index, "Email", e.target.value)} />
                <Input required placeholder="Phone" value={doctor.phone} onChange={e => updateDoctor(index, "phone", e.target.value)} />
                <Input required placeholder="Address" value={doctor.Address} onChange={e => updateDoctor(index, "Address", e.target.value)} />
                <Input required placeholder="City" value={doctor.City} onChange={e => updateDoctor(index, "City", e.target.value)} />
                <Input required placeholder="License Number" value={doctor.licenseNumber} onChange={e => updateDoctor(index, "licenseNumber", e.target.value)} />
                <div  >
                  <label className="block mb-1 text-sm font-medium text-gray-300">Doctor Image</label>
                  <FileUpload files={doctorLogoFile} onChange={setDoctorLogoFile} />
                </div>
                <Input placeholder="Speciality (comma-separated)" value={doctor.speciality.join(",")} onChange={e => updateDoctor(index, "speciality", e.target.value.split(","))} />
                <Input placeholder="Availability (comma-separated)" value={doctor.availability.join(",")} onChange={e => updateDoctor(index, "availability", e.target.value.split(","))} />
                <Input type="number" placeholder="Experience (years)" value={doctor.experience} onChange={e => updateDoctor(index, "experience", parseInt(e.target.value) || 0)} />
              </div>
            </div>
          ))}

          <button type="button" onClick={addDoctor} className="mt-2 flex items-center space-x-2 text-blue-400 hover:text-blue-500">
            <Plus size={18} />
            <span className="font-medium">Add another doctor</span>
          </button>
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
              onClick={() => router.push("/labRegistration")}
            >
              Go to Lab Registration
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