"use client";

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import dynamic from "next/dynamic";
import { registerHospital, uploadDoctorLogo, uploadHospitalLogo } from "@/lib/actions/hospital.action";
import { Input } from "@/components/ui/input";
import Image from "next/image";

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
  licenseNumber: string;
  logoUrl: string;
  specialities: string[];
  isVerified: boolean;
  istrueLocation: boolean;
  coordinates: [number, number] | [];
  doctors:string[];
};

export default function HospitalForm() {
  // Hospital state
  const [hospital, setHospital] = useState<Omit<HospitalData, "logoUrl" | "specialities" | "coordinates">>({
    name: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    licenseNumber: "",
    isVerified: false,
    istrueLocation: false,
    doctors: []
  });
  const [specialities, setSpecialities] = useState<string[]>([]);
  const [hospitalLogoUrl, setHospitalLogoUrl] = useState<string>("");
  const [coordinates, setCoordinates] = useState<[number, number] | null>(null);

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


  // Logo upload handlers
  const handleDoctorLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>, index: number) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const result = await uploadDoctorLogo(file);
      let previewUrl: string;
      if (typeof result === "string") {
        previewUrl = result;
      } else if (result instanceof ArrayBuffer) {
        const base64String = btoa(String.fromCharCode(...new Uint8Array(result)));
        previewUrl = `data:image/png;base64,${base64String}`;
      } else {
        throw new Error("Unexpected logo upload result type");
      }
      updateDoctor(index, "logoUrl", previewUrl);
    } catch (err) {
      console.error("Logo upload failed:", err);
      alert("Failed to upload logo.");
    }
  };

  const handleHospitalLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const result = await uploadHospitalLogo(file);
      let previewUrl: string;
      if (typeof result === "string") {
        previewUrl = result;
      } else if (result instanceof ArrayBuffer) {
        const base64String = btoa(String.fromCharCode(...new Uint8Array(result)));
        previewUrl = `data:image/png;base64,${base64String}`;
      } else {
        throw new Error("Unexpected hospital logo upload result type");
      }
      setHospitalLogoUrl(previewUrl);
    } catch (err) {
      console.error("Hospital logo upload failed:", err);
      alert("Failed to upload hospital logo.");
    }
  };

  // Submit handler
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const hospitalData: HospitalData = {
      ...hospital,
      logoUrl: hospitalLogoUrl,
      specialities,
      coordinates: coordinates ?? [],
      isVerified: false,
      istrueLocation: false,
      doctors : doctors.map((doc) => doc.Name),
    };
    try {
      await registerHospital(hospitalData, doctors);
      alert("Hospital and doctors registered successfully!");
    } catch (error) {
      console.error("Registration failed:", error);
      alert("Failed to register. See console for details.");
    }
  };

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Map on the left */}
      <div className="w-[45%] bg-black">
        <HospitalMap onLocationFetched={setCoordinates} />
      </div>
      {/* Scrollable form on the right */}
      <div className="w-[55%] overflow-y-auto p-8 bg-gray-900 text-white">
        <form onSubmit={handleSubmit} className="space-y-8">
          <h2 className="text-3xl font-bold">Register Hospital</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input required placeholder="Hospital Name" value={hospital.name} onChange={e => handleHospitalChange("name", e.target.value)} />
            <Input required placeholder="Email Address" type="email" value={hospital.email} onChange={e => handleHospitalChange("email", e.target.value)} />
            <Input required placeholder="Phone Number" value={hospital.phone} onChange={e => handleHospitalChange("phone", e.target.value)} />
            <Input required placeholder="Address" value={hospital.address} onChange={e => handleHospitalChange("address", e.target.value)} />
            <Input required placeholder="City" value={hospital.city} onChange={e => handleHospitalChange("city", e.target.value)} />
            <Input required placeholder="License Number" value={hospital.licenseNumber} onChange={e => handleHospitalChange("licenseNumber", e.target.value)} />
            <Input placeholder="Specialities (comma-separated)" value={specialities.join(",")} onChange={e => setSpecialities(e.target.value.split(","))} />
            <div>
              <label className="block mb-1">Hospital Image</label>
              <Input type="file" accept="image/*" onChange={handleHospitalLogoUpload} placeholder="Upload hospital logo" />
              {hospitalLogoUrl && (
                <Image src={hospitalLogoUrl} alt="Hospital logo" width={80} height={80} className="mt-2 rounded" />
              )}
            </div>
          </div>
          <div>
            <h3 className="text-xl font-semibold mt-4 mb-2">Doctors</h3>
            {doctors.map((doctor, index) => (
              <div key={index} className="border border-gray-700 p-4 rounded-lg mb-4 space-y-4">
                <div className="flex justify-between items-center">
                  <h4 className="text-lg font-medium">Doctor #{index + 1}</h4>
                  {index > 0 && (
                    <button type="button" onClick={() => removeDoctor(index)} className="text-red-500 hover:text-red-700">
                      <Trash2 />
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
                  <div>
                    <label className="block mb-1">Doctor License Image</label>
                    <Input type="file" accept="image/*" onChange={e => handleDoctorLogoUpload(e, index)} placeholder="Upload here" />
                    {doctor.logoUrl && (
                      <Image src={doctor.logoUrl} alt="Doctor Logo" width={64} height={64} className="mt-2 rounded" />
                    )}
                  </div>
                  <Input placeholder="Speciality (comma-separated)" value={doctor.speciality.join(",")} onChange={e => updateDoctor(index, "speciality", e.target.value.split(","))} />
                  <Input placeholder="Availability (comma-separated)" value={doctor.availability.join(",")} onChange={e => updateDoctor(index, "availability", e.target.value.split(","))} />
                  <Input type="number" placeholder="Experience (years)" value={doctor.experience} onChange={e => updateDoctor(index, "experience", parseInt(e.target.value) || 0)} />
                </div>
              </div>
            ))}
            <button type="button" onClick={addDoctor} className="mt-2 flex items-center space-x-2 text-blue-400 hover:text-blue-600">
              <Plus />
              <span>Add another doctor</span>
            </button>
          </div>
          <button type="submit" className="bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-6 rounded-lg">
            Submit and Continue
          </button>
        </form>
      </div>
    </div>
  );
}