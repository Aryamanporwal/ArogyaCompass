"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { getDoctorById } from "@/lib/actions/doctor.action";
import { getLabById } from "@/lib/actions/lab.action";

interface Props {
  doctorId?: string;
  labId?: string;
}

interface Info {
  name: string;
  email: string;
  phone: string;
  logoUrl: string;
}

export default function DoctorLabInfoCard({ doctorId, labId }: Props) {
  const [info, setInfo] = useState<Info | null>(null);
  const [type, setType] = useState<"Doctor" | "Lab">();

  useEffect(() => {
    const fetchData = async () => {
      if (doctorId) {
        const doc = await getDoctorById(doctorId);
        if (doc) {
          setInfo({
            name: doc.Name,
            email: doc.Email,
            phone: doc.phone,
            logoUrl: doc.logoUrl,
          });
          setType("Doctor");
        }
      } else if (labId) {
        const lab = await getLabById(labId);
        if (lab) {
          setInfo({
            name: lab.name,
            email: lab.email,
            phone: lab.phone,
            logoUrl: lab.logoUrl,
          });
          setType("Lab");
        }
      }
    };

    fetchData();
  }, [doctorId, labId]);

  if (!info || !type) return null;

  return (
    <div className="bg-white dark:bg-[#1e1e1e] rounded-xl shadow-md p-5 flex items-center gap-5">
      <div className="w-20 h-20 rounded-lg overflow-hidden border dark:border-gray-700">
        <Image
          src={info.logoUrl}
          alt={`${type} Logo`}
          width={80}
          height={80}
          className="object-cover w-full h-full"
        />
      </div>
      <div>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Working with {type}</p>
        <p className="text-lg font-semibold text-gray-900 dark:text-white">{info.name}</p>
        <p className="text-sm text-gray-700 dark:text-gray-300">{info.email}</p>
        <p className="text-sm text-gray-700 dark:text-gray-300">{info.phone}</p>
      </div>
    </div>
  );
}
