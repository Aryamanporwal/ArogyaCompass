"use client";

import React, {  useState } from "react";
import {  registerAssistant } from "@/lib/actions/assistant.action";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import FileUpload from "../ui/FileUploader";

interface Assistant {
  name: string;
  email: string;
  phone: string;
  address: string;
  logoUrl: string;
  logo?: string;
  logoId: string;
  timestamp: string;
  labId?: string;
  doctorId?: string;
  hospitalId?: string;
}

interface AssistantRegistrationProps {
  doctorId?: string;
  labId?: string;
  hospitalId?: string;
}

export default function AssistantRegistration({ doctorId, labId , hospitalId }: AssistantRegistrationProps) {
//   const [assistants, setAssistants] = useState<Assistant[]>([]);
  const [formData, setFormData] = useState<Partial<Assistant>>({
    name: "",
    email: "",
    phone: "",
    address: "",
    logo: "",
    logoUrl: "",
    logoId: "",
  });
  const [logoFile, setLogoFile] = useState<File[]>([]);

  const handleSubmit = async () => {
    const newAssistant = {
      ...formData,
      doctorId: doctorId || "",
      labId: labId || "",
      hospitalId : hospitalId || "",
      logoUrl: formData.logoUrl || "",
      logo: formData.logo || "",
      logoId: formData.logoId || "",
      timestamp: new Date().toISOString(),
    } as Assistant;

    await registerAssistant(newAssistant, logoFile[0]);
    // setAssistants((prev) => [...prev, newAssistant]);
    setFormData({ name: "", email: "", phone: "", address: "", logoUrl: "", logo: "", logoId: "" });
    setLogoFile([]);
  };



  return (
    <div className="bg-white dark:bg-[#1e1e1e] mb-6 p-6 rounded-xl shadow-md">


      {/* Add Assistant on Duty */}
      <h3 className="text-lg font-semibold mb-4">Add Assistant on Duty</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Input
          placeholder="Name"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
        />
        <Input
          placeholder="Email"
          value={formData.email}
          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
        />
        <Input
          placeholder="Phone"
          value={formData.phone}
          onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
        />
        <Input
          placeholder="Address"
          value={formData.address}
          onChange={(e) => setFormData({ ...formData, address: e.target.value })}
        />
        <div className="col-span-1 sm:col-span-2">
          <FileUpload files={logoFile} onChange={setLogoFile} />
        </div>
        <Button className="col-span-1 sm:col-span-2 mt-2" onClick={handleSubmit}>
          Register Assistant
        </Button>
      </div>
    </div>
  );
}
