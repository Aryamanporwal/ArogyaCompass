"use client";

import { useEffect, useState } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { getAppointmentsByCityGroupedByHospital } from "@/lib/actions/statistics.action"; // You'll create this

interface HospitalAppointmentStats {
  hospitalName: string;
  totalAppointments: number;
}

export default function HospitalComparisonChart({ city }: { city: string }) {
  const [data, setData] = useState<HospitalAppointmentStats[]>([]);

  useEffect(() => {
    async function fetchStats() {
      try {
        const stats = await getAppointmentsByCityGroupedByHospital(city);
        setData(stats);
      } catch (err) {
        console.error("Failed to fetch hospital stats:", err);
      }
    }
    fetchStats();
  }, [city]);

  return (
    <div className="bg-white dark:bg-[#1e1e1e] p-6 rounded-xl shadow-md w-full">
      <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Hospital Comparison in {city}</h2>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data} margin={{ top: 20, right: 20, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="hospitalName" tick={{ fontSize: 12 }} />
          <YAxis />
          <Tooltip />
          <Bar dataKey="totalAppointments" fill="#4F46E5" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
