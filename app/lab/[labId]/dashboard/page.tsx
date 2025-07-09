"use client";
import LabDashboard from '@/components/labDashboard'
import React from 'react'
import { useParams } from "next/navigation";

const LabDash = () => {
  const params = useParams();
  const labId = typeof params?.labId === "string" ? params.labId : "";
  return (
    <div>
      <LabDashboard params={{ labId }}/>
    </div>
  )
}

export default LabDash