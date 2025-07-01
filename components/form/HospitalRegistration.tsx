"use client";

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import dynamic from "next/dynamic";
import { registerHospital } from "@/lib/actions/hospital.action";
import { Input } from "@/components/ui/input";
import Image from "next/image";
import { uploadDoctorLogo } from "@/lib/actions/hospital.action";
import { uploadHospitalLogo } from "@/lib/actions/hospital.action";

// Dynamically load HospitalMap to avoid SSR issues
const HospitalMap = dynamic(() => import("@/components/HospitalMap"), {
  ssr: false,
});

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

export default function HospitalForm() {
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

  const [coordinates, setCoordinates] = useState<[number, number] | null>(null);
  const [registeredHospital, setRegisteredHospital] = useState<any>(null);
  const [hospitalLogoUrl, setHospitalLogoUrl] = useState<string>("");


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

  const updateDoctor = <K extends keyof Doctor>(
    index: number,
    key: K,
    value: Doctor[K]
  ) => {
    const updated = [...doctors];
    updated[index][key] = value;
    setDoctors(updated);
  };

  const removeDoctor = (index: number) => {
    if (doctors.length === 1) return;
    const updated = doctors.filter((_, i) => i !== index);
    setDoctors(updated);
  };
    const handleDoctorLogoUpload = async (
      e: React.ChangeEvent<HTMLInputElement>,
      index: number
    ) => {
      const file = e.target.files?.[0];
      if (!file) return;

      try {
        const result = await uploadDoctorLogo(file); // Calls the server
        let previewUrl: string;
        if (typeof result === "string") {
          previewUrl = result;
        } else if (result instanceof ArrayBuffer) {
          // Convert ArrayBuffer to base64 data URL
          const base64String = btoa(
            String.fromCharCode(...new Uint8Array(result))
          );
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

  const handleHospitalLogoUpload = async (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
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


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const hospitalData = {
      name: (document.querySelector('input[placeholder="Hospital Name"]') as HTMLInputElement).value,
      email: (document.querySelector('input[placeholder="Email Address"]') as HTMLInputElement).value,
      phone: (document.querySelector('input[placeholder="Phone Number"]') as HTMLInputElement).value,
      address: (document.querySelector('input[placeholder="Address"]') as HTMLInputElement).value,
      city: (document.querySelector('input[placeholder="City"]') as HTMLInputElement).value,
      licenseNumber: (document.querySelector('input[placeholder="License Number"]') as HTMLInputElement).value,
      logoUrl: hospitalLogoUrl,
      specialities: (document.querySelector('input[placeholder="Specialities (comma-separated)"]') as HTMLInputElement)?.value.split(",") || [],
      isVerified: false,
      istrueLocation: false,
      coordinates: coordinates ?? [],
    };

    try {
      await registerHospital(hospitalData, doctors);
      setRegisteredHospital({
        name: hospitalData.name,
        address: hospitalData.address,
        coordinates: hospitalData.coordinates,
        doctors: doctors,
      });
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
        <HospitalMap
          onLocationFetched={(coords) => setCoordinates(coords)}
          hospital={registeredHospital}
        />
      </div>

      {/* Scrollable form on the right */}
      <div className="w-[55%] overflow-y-auto p-8 bg-gray-900 text-white">
        <form onSubmit={handleSubmit} className="space-y-8">
          <h2 className="text-3xl font-bold">Register Hospital</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input required placeholder="Hospital Name" />
            <Input required placeholder="Email Address" type="email" />
            <Input required placeholder="Phone Number" />
            <Input required placeholder="Address" />
            <Input required placeholder="City" />
            <Input required placeholder="License Number" />
            <Input placeholder="Specialities (comma-separated)" />
            <div>
            <label className="block mb-1">Hospital Image</label>
            <Input
              type="file"
              accept="image/*"
              onChange={handleHospitalLogoUpload}
              placeholder="Upload hospital logo"
            />
            {hospitalLogoUrl?.startsWith("http") && (
              <Image
                src={hospitalLogoUrl}
                alt="Hospital logo"
                width={80}
                height={80}
                className="mt-2 rounded"
              />
            )}
          </div>
          </div>

          <div>
            <h3 className="text-xl font-semibold mt-4 mb-2">Doctors</h3>

            {doctors.map((doctor, index) => (
              <div
                key={index}
                className="border border-gray-700 p-4 rounded-lg mb-4 space-y-4"
              >
                <div className="flex justify-between items-center">
                  <h4 className="text-lg font-medium">Doctor #{index + 1}</h4>
                  {index > 0 && (
                    <button
                      type="button"
                      onClick={() => removeDoctor(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 />
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Input
                    required
                    placeholder="Name"
                    value={doctor.Name}
                    onChange={(e) => updateDoctor(index, "Name", e.target.value)}
                  />
                  <Input
                    required
                    placeholder="Email"
                    type="email"
                    value={doctor.Email}
                    onChange={(e) => updateDoctor(index, "Email", e.target.value)}
                  />
                  <Input
                    required
                    placeholder="Phone"
                    value={doctor.phone}
                    onChange={(e) => updateDoctor(index, "phone", e.target.value)}
                  />
                  <Input
                    required
                    placeholder="Address"
                    value={doctor.Address}
                    onChange={(e) => updateDoctor(index, "Address", e.target.value)}
                  />
                  <Input
                    required
                    placeholder="City"
                    value={doctor.City}
                    onChange={(e) => updateDoctor(index, "City", e.target.value)}
                  />
                  <Input
                    required
                    placeholder="License Number"
                    value={doctor.licenseNumber}
                    onChange={(e) =>
                      updateDoctor(index, "licenseNumber", e.target.value)
                    }
                  />
                  <div>
                    <label className="block mb-1"> Doctor License Image</label>
                    <Input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleDoctorLogoUpload(e, index)}
                      placeholder="uplaod here"
                    />
                    {doctor.logoUrl?.startsWith("http") && (
                      <Image
                        src={doctor.logoUrl}
                        alt="Doctor Logo"
                        width={64}
                        height={64}
                        className="mt-2 rounded"
                      />
                    )}
                  </div>
                  
                  <Input
                    placeholder="Speciality (comma-separated)"
                    value={doctor.speciality.join(",")}
                    onChange={(e) =>
                      updateDoctor(index, "speciality", e.target.value.split(","))
                    }
                  />
                  <Input
                    placeholder="Availability (comma-separated)"
                    value={doctor.availability.join(",")}
                    onChange={(e) =>
                      updateDoctor(index, "availability", e.target.value.split(","))
                    }
                  />
                  <Input
                    type="number"
                    placeholder="Experience (years)"
                    value={doctor.experience}
                    onChange={(e) =>
                      updateDoctor(index, "experience", parseInt(e.target.value) || 0)
                    }
                  />
                </div>
              </div>
            ))}

            <button
              type="button"
              onClick={addDoctor}
              className="mt-2 flex items-center space-x-2 text-blue-400 hover:text-blue-600"
            >
              <Plus />
              <span>Add another doctor</span>
            </button>
          </div>

          <button
            type="submit"
            className="bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-6 rounded-lg"
          >
            Submit and Continue
          </button>
        </form>
      </div>
    </div>
  );
}
