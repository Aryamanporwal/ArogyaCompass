"use client"
import ProHospitalDashBoard from '@/components/ProDashBoard'
import React from 'react'
import { useParams } from "next/navigation";

const ProDashBoard = () => {
    const params = useParams();
    const hospitalId = typeof params?.hospitalId === "string" ? params.hospitalId : "";
  return (
    <div><ProHospitalDashBoard params = {{hospitalId}}/></div>
  )
}

export default ProDashBoard