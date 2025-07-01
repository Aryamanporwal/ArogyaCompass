"use client";

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { registerHospital } from "@/lib/actions/hospital.action";

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

  const updateDoctor = (
    index: number,
    key: keyof Doctor,
    value: Doctor[keyof Doctor]
  ) => {
    const updated = [...doctors];
    (updated[index][key] as typeof value) = value;
    setDoctors(updated);
  };

  const removeDoctor = (index: number) => {
    if (doctors.length === 1) return;
    const updated = doctors.filter((_, i) => i !== index);
    setDoctors(updated);
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
      logoUrl: (document.querySelector('input[placeholder="Logo URL"]') as HTMLInputElement)?.value || "",
      specialities: (document.querySelector('input[placeholder="Specialities (comma-separated)"]') as HTMLInputElement)?.value.split(",") || [],
      isVerified: false,
      istrueLocation: false,
      coordinates: [],
    };

    try {
      await registerHospital(hospitalData, doctors);
      alert("Hospital and doctors registered successfully!");
      // Optionally: reset form or redirect
    } catch (error) {
      console.error("Registration failed:", error);
      alert("Failed to register. See console for details.");
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-4xl mx-auto p-6 bg-gray-900 rounded-xl text-white space-y-8"
    >
      <h2 className="text-3xl font-bold">🏥 Register Hospital</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <input required placeholder="Hospital Name" className="input" />
        <input required placeholder="Email Address" type="email" className="input" />
        <input required placeholder="Phone Number" className="input" />
        <input required placeholder="Address" className="input" />
        <input required placeholder="City" className="input" />
        <input required placeholder="License Number" className="input" />
        <input placeholder="Logo URL" className="input" />
        <input placeholder="Specialities (comma-separated)" className="input" />
      </div>

      {/* Doctors Section */}
      <div>
        <h3 className="text-xl font-semibold mt-4 mb-2">👨‍⚕️ Doctors</h3>

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
              <input
                required
                placeholder="Name"
                className="input"
                value={doctor.Name}
                onChange={(e) => updateDoctor(index, "Name", e.target.value)}
              />
              <input
                required
                placeholder="Email"
                type="email"
                className="input"
                value={doctor.Email}
                onChange={(e) => updateDoctor(index, "Email", e.target.value)}
              />
              <input
                required
                placeholder="Phone"
                className="input"
                value={doctor.phone}
                onChange={(e) => updateDoctor(index, "phone", e.target.value)}
              />
              <input
                required
                placeholder="Address"
                className="input"
                value={doctor.Address}
                onChange={(e) => updateDoctor(index, "Address", e.target.value)}
              />
              <input
                required
                placeholder="City"
                className="input"
                value={doctor.City}
                onChange={(e) => updateDoctor(index, "City", e.target.value)}
              />
              <input
                required
                placeholder="License Number"
                className="input"
                value={doctor.licenseNumber}
                onChange={(e) => updateDoctor(index, "licenseNumber", e.target.value)}
              />
              <input
                placeholder="Logo URL"
                className="input"
                value={doctor.logoUrl}
                onChange={(e) => updateDoctor(index, "logoUrl", e.target.value)}
              />
              <input
                placeholder="Speciality (comma-separated)"
                className="input"
                value={doctor.speciality.join(",")}
                onChange={(e) =>
                  updateDoctor(index, "speciality", e.target.value.split(","))
                }
              />
              <input
                placeholder="Availability (comma-separated)"
                className="input"
                value={doctor.availability.join(",")}
                onChange={(e) =>
                  updateDoctor(index, "availability", e.target.value.split(","))
                }
              />
              <input
                type="number"
                placeholder="Experience (years)"
                className="input"
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

      {/* Submit */}
      <button
        type="submit"
        className="bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-6 rounded-lg"
      >
        Submit and Continue
      </button>
    </form>
  );
}
