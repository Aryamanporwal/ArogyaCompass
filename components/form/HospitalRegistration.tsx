"use client";

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
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
      router.push(`hospital/${result.hospitalId}/payment`);
    }
  } catch (error) {
    console.error("Registration failed:", error);
    alert("Failed to register. See console for details.");
  }
};



return (
  <div className="flex flex-col md:flex-row h-screen w-full bg-background text-foreground overflow-hidden">
    {/* Map Section - first on mobile */}
    <div className="w-full md:w-[45%] bg-muted px-3 pt-4 md:px-0 md:pt-0 flex items-center justify-center">
      <div className="w-full h-[350px] sm:h-[420px] md:h-[95%] rounded-2xl shadow-2xl overflow-hidden">
        <HospitalMap onLocationFetched={setCoordinates} />
      </div>
    </div>

    {/* Form Section */}
    <div className="w-full md:w-[55%] overflow-y-auto p-6 sm:p-8 bg-gray-900 text-white">
      <form onSubmit={handleSubmit} className="space-y-8">
        <h2 className="text-3xl font-bold text-center md:text-left">Register Hospital</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input required placeholder="Hospital Name" value={hospital.name} onChange={e => handleHospitalChange("name", e.target.value)} />
          <Input required placeholder="Email Address" type="email" value={hospital.email} onChange={e => handleHospitalChange("email", e.target.value)} />
          <Input required placeholder="Phone Number" value={hospital.phone} onChange={e => handleHospitalChange("phone", e.target.value)} />
          <Input required placeholder="Address" value={hospital.address} onChange={e => handleHospitalChange("address", e.target.value)} />
          <Input required placeholder="City" value={hospital.city} onChange={e => handleHospitalChange("city", e.target.value)} />
          <Input required placeholder="State" value={hospital.state} onChange={e => handleHospitalChange("state", e.target.value)} />
          <Input required placeholder="Pincode" value={hospital.pincode} onChange={e => handleHospitalChange("pincode", e.target.value)} />
          <Input required placeholder="License Number" value={hospital.licenseNumber} onChange={e => handleHospitalChange("licenseNumber", e.target.value)} />
          <Input placeholder="Specialities (comma-separated)" value={specialities.join(",")} onChange={e => setSpecialities(e.target.value.split(","))} />
          <div>
            <label className="block mb-1 text-sm font-medium">Hospital Image</label>
            <FileUpload files={logoFile} onChange={setLogoFile} />
          </div>
        </div>

        <div>
          <h3 className="text-xl font-semibold mt-4 mb-2">Doctors</h3>
          {doctors.map((doctor, index) => (
            <div key={index} className="border border-gray-700 p-4 rounded-lg mb-4 space-y-4">
              <div className="flex justify-between items-center">
                <h4 className="text-lg font-medium">Doctor #{index + 1}</h4>
                {index > 0 && (
                  <button type="button" onClick={() => removeDoctor(index)} className="text-red-500 cursor-pointer hover:text-red-700">
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
                  <label className="block mb-1 text-sm font-medium">Doctor Image</label>
                  <FileUpload files={doctorLogoFile} onChange={setDoctorLogoFile} />
                </div>
                <Input placeholder="Speciality (comma-separated)" value={doctor.speciality.join(",")} onChange={e => updateDoctor(index, "speciality", e.target.value.split(","))} />
                <Input placeholder="Availability (comma-separated)" value={doctor.availability.join(",")} onChange={e => updateDoctor(index, "availability", e.target.value.split(","))} />
                <Input type="number" placeholder="Experience (years)" value={doctor.experience} onChange={e => updateDoctor(index, "experience", parseInt(e.target.value) || 0)} />
              </div>
            </div>
          ))}

          <button type="button" onClick={addDoctor} className="mt-2 flex items-center space-x-2 cursor-pointer text-blue-400 hover:text-blue-600">
            <Plus />
            <span>Add another doctor</span>
          </button>
        </div>

        <div className="flex items-center justify-between">
          <button
            type="submit"
            className="bg-green-500 hover:bg-green-600 text-white cursor-pointer font-semibold py-2 px-6 rounded-lg"
          >
            Submit and Continue
          </button>

          <button
            type="button"
            className="text-blue-500 font-bold ml-auto cursor-pointer hover:underline"
            onClick={() => router.push("/labRegistration")}
          >
            Go to Lab Registration
          </button>
        </div>
      </form>
    </div>
  </div>
);

}