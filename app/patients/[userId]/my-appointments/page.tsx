"use client"
import PatientDashboard from '@/components/appointment';
// import AppointmentDashboard from '@/components/MyAppointments'
import { useParams } from 'next/navigation';
import React from 'react'

const MyAppointments = () => {
    const params = useParams();
    const userId = params?.userId as string;
  
    if (!userId) return <div className="text-white p-4">User ID missing from URL</div>;
  
  return (
    <div>
        <PatientDashboard userId={userId}/>
    </div>
  )
}

export default MyAppointments