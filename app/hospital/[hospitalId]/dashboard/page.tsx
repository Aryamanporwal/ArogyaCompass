"use client"
import HospitalDashboard from '@/components/hospitalDashboard'
import React from 'react'
import { useParams } from "next/navigation";

const Hospital_dashboard = () => {
   const params = useParams();
    const hospitalId = typeof params?.hospitalId === "string" ? params.hospitalId : "";
  return (
    <div><HospitalDashboard params = {{hospitalId}}/></div>
  )
}

export default Hospital_dashboard