"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { registerDoctor } from "@/lib/actions/doctor.action";
import { Loader2 } from "lucide-react";
import FileUpload from "../ui/FileUploader";

const doctorSchema = z.object({
  Name: z.string().min(2),
  Email: z.string().email(),
  phone: z.string().min(10),
  Address: z.string().min(5),
  City: z.string().min(2),
  licenseNumber: z.string(),
  speciality: z.string(),
  experience: z.string(),
  availability: z.string(),
});

type DoctorFormValues = z.infer<typeof doctorSchema>;

export default function DoctorRegisterForm({ hospitalId }: { hospitalId: string }) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<DoctorFormValues>({
    resolver: zodResolver(doctorSchema),
  });

  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [logoFile, setLogoFile] = useState<File[]>([]);


  const onSubmit = async (data: DoctorFormValues) => {
    setLoading(true);
    setSuccessMsg("");

    const formattedData = {
      ...data,
      speciality: data.speciality.split(",").map((s) => s.trim()),
      availability: data.availability.split(",").map((a) => a.trim()),
      experience: parseInt(data.experience),
      hospitalId,
    };

    const res = await registerDoctor(formattedData, logoFile[0]);
    setLoading(false);

    if (res?.success) {
      setSuccessMsg("Doctor registered successfully!");
      reset();
      setLogoFile([]);
    }
  };

return (
  <div className="bg-white dark:bg-[#1e1e1e] p-10 rounded-2xl shadow-xl w-full mx-auto">
    <h2 className="text-2xl font-bold mb-8 text-gray-900 dark:text-white">Register a New Doctor</h2>

    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid sm:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Name</label>
          <input
            {...register("Name")}
            placeholder="Enter doctor's full name"
            className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-[#222] text-gray-900 dark:text-white shadow-sm focus:ring-2 focus:ring-blue-400 focus:border-blue-500 outline-none transition"
          />
          {errors.Name && <p className="text-xs text-red-500 pt-1">{errors.Name.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Email</label>
          <input
            type="email"
            {...register("Email")}
            placeholder="e.g. doctor@mail.com"
            className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-[#222] text-gray-900 dark:text-white shadow-sm focus:ring-2 focus:ring-blue-400 focus:border-blue-500 outline-none transition"
          />
          {errors.Email && <p className="text-xs text-red-500 pt-1">{errors.Email.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Phone</label>
          <input
            {...register("phone")}
            placeholder="e.g. +91 98765 43210"
            className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-[#222] text-gray-900 dark:text-white shadow-sm focus:ring-2 focus:ring-blue-400 focus:border-blue-500 outline-none transition"
          />
          {errors.phone && <p className="text-xs text-red-500 pt-1">{errors.phone.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">City</label>
          <input
            {...register("City")}
            placeholder="e.g. Mumbai"
            className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-[#222] text-gray-900 dark:text-white shadow-sm focus:ring-2 focus:ring-blue-400 focus:border-blue-500 outline-none transition"
          />
          {errors.City && <p className="text-xs text-red-500 pt-1">{errors.City.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Address</label>
          <input
            {...register("Address")}
            placeholder="Clinic or home address"
            className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-[#222] text-gray-900 dark:text-white shadow-sm focus:ring-2 focus:ring-blue-400 focus:border-blue-500 outline-none transition"
          />
          {errors.Address && <p className="text-xs text-red-500 pt-1">{errors.Address.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">License Number</label>
          <input
            {...register("licenseNumber")}
            placeholder="License ID"
            className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-[#222] text-gray-900 dark:text-white shadow-sm focus:ring-2 focus:ring-blue-400 focus:border-blue-500 outline-none transition"
          />
          {errors.licenseNumber && <p className="text-xs text-red-500 pt-1">{errors.licenseNumber.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Specialities (comma-separated)</label>
          <input
            {...register("speciality")}
            placeholder="e.g. Cardiology, Pediatrics"
            className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-[#222] text-gray-900 dark:text-white shadow-sm focus:ring-2 focus:ring-blue-400 focus:border-blue-500 outline-none transition"
          />
          {errors.speciality && <p className="text-xs text-red-500 pt-1">{errors.speciality.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Experience (years)</label>
          <input
            type="number"
            {...register("experience")}
            placeholder="e.g. 5"
            className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-[#222] text-gray-900 dark:text-white shadow-sm focus:ring-2 focus:ring-blue-400 focus:border-blue-500 outline-none transition"
          />
          {errors.experience && <p className="text-xs text-red-500 pt-1">{errors.experience.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Availability (comma-separated)</label>
          <input
            {...register("availability")}
            placeholder="e.g. Mon, Tue, Fri"
            className="w-full px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-[#222] text-gray-900 dark:text-white shadow-sm focus:ring-2 focus:ring-blue-400 focus:border-blue-500 outline-none transition"
          />
          {errors.availability && <p className="text-xs text-red-500 pt-1">{errors.availability.message}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Doctor Image</label>
            <FileUpload
             files={logoFile} 
             onChange={setLogoFile} 
             className="w-full px-4 py-3 rounded-lg border font-normal flex cursor-pointer flex-col items-center justify-center border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-[#222] text-gray-900 dark:text-white shadow-sm focus:ring-2 focus:ring-blue-400 focus:border-blue-500 outline-none transition"
             />
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full mt-2 py-3 rounded-lg bg-blue-600 text-white text-base font-semibold hover:bg-blue-700 transition-all shadow focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-offset-2"
      >
        {loading ? <Loader2 className="animate-spin h-5 w-5 mx-auto" /> : "Register Doctor"}
      </button>

      {successMsg && <p className="text-green-600 text-center mt-4">{successMsg}</p>}
    </form>
  </div>
);

}
