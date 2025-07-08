"use client";
import DoctorDashboard from '@/components/doctorDashboard'
import React from 'react'
import { useParams } from "next/navigation";

const DoctorDash = () => {
  const params = useParams();
  const doctorId = typeof params?.doctorId === "string" ? params.doctorId : "";
  return (
    <div>
      <DoctorDashboard params={{ doctorId }}/>
    </div>
  )
}

export default DoctorDash