"use client"
import AssistantDashboard from '@/components/assistantDashboard'
import React from 'react'
import { useParams } from "next/navigation";
const Assistant_dashbaord = () => {
    const params = useParams();
    const assistantId = typeof params?.assistantId === "string" ? params.assistantId:"";
  return (
    <div>
        <AssistantDashboard params = {{assistantId}}/>
    </div>
  )
}

export default Assistant_dashbaord