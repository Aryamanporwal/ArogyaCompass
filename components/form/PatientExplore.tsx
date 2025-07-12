// import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
// import Image from "next/image";
// import { Input } from "@/components/ui/input";
// import { getAllHospitals } from "@/lib/actions/hospital.action";
// import { createAppointment } from "@/lib/actions/appointment.action"
// import { useRouter } from "next/navigation";
// import { getAllLabs } from "@/lib/actions/lab.action";
// import { getUserIdFromCookie } from "@/lib/actions/user.action";
// import { Models } from "node-appwrite";
// type Document = Models.Document;

const ExploreMap = dynamic(() => import("@/components/ExploreMapView"), { ssr: false });

export default function PatientExplore() {
  


  return (
  <div className="w-full h-screen overflow-hidden">
    {/* Map Section */}
     <div className="w-screen h-screen bg-[#0B0E1C] flex items-center justify-center">
       <div className="w-full h-full rounded-2xl shadow-2xl overflow-hidden bg-[#0B0E1C]">
         <ExploreMap 
  //         view={view} 
  //         selectedHospitalId={selectedHospital} 
  //         userLocation={userLocation} 
  //         selectedLabId={selectedLab} 
        />
      </div>
       </div>
      {/* Right Panel */}
      {/* <div className="w-full lg:w-[40%] bg-[#0B0E1C] text-white p-6 space-y-4 overflow-y-auto">
        <div className="flex flex-col items-center space-y-1">
        <Image
            alt="logo"
            src="/assets/icons/logo.png"
            height={200}
            width={200}
            className="h-20 sm:h-24 md:h-28 w-auto object-contain"
        />
        <div className="text-center leading-tight">
            <h1 className="text-[1.3rem] font-bold bg-gradient-to-r from-blue-400 via-blue-600 to-blue-400 bg-clip-text text-transparent">
            ArogyaCompass
            </h1>
            <h2 className="text-sm text-blue-500 mt-0.5">
            Your Smart Path to Faster Care
            </h2>
        </div>
        </div>
        <h2 className="text-2xl font-bold mb-2">Explore Healthcare Services</h2>

        {/* Search Hospital */}
        {/* <Input
          type="text"
          placeholder="Search hospital or Lab by name"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        /> */}

        {/* <Input
          placeholder={state || "State"}
          className="bg-gray-800 px-4 py-2 rounded-md w-full"
          value={state}
          onFocus={async () => {
            if (!state && userLocation) {
              await autofillState();
            }
          }}
          onChange={(e) => setState(e.target.value)}
        /> */}

        {/* <Input
          placeholder={city || "City"}
          className="bg-gray-800 px-4 py-2 rounded-md w-full"
          value={city}
          onFocus={async () => {
            if (!city && userLocation) {
              await autofillState();
            }
          }}
          onChange={(e) => setState(e.target.value)}
        /> */}

        {/* View Filter Dropdown */}
        {/* <select
          value={view}
          onChange={(e) => setView(e.target.value as "all" | "hospital" | "lab")}
          className="bg-gray-800 px-4 py-2 rounded-md w-full"
        >
          <option value="all">All</option>
          <option value="hospital">Hospitals</option>
          <option value="lab">Labs</option>
        </select>

        {/* State, City, Hospital, Doctor */}

{/* 
        {view === "hospital" ? (
        <select
            value={selectedHospital}
            onChange={(e) => handleHospitalSelect(e.target.value)}
            className="bg-gray-800 px-4 py-2 rounded-md w-full"
        >
            <option value="">Select Hospital</option>
            {filteredHospitals.map((h) => (
            <option key={h.$id} value={h.$id}>
                {h.name}
            </option>
            ))}

        </select>
        ) : (
        <select
            value={selectedLab}
            onChange={(e) => handleLabsSelect(e.target.value)}
            className="bg-gray-800 px-4 py-2 rounded-md w-full"
        >
            <option value="">Select Lab</option>
            {filteredLabs.map((l) => (
            <option key={l.$id} value={l.$id}>
                {l.name}
            </option>
            ))}
        </select>
        )}
        <select
          value={selectedDoctor}
          onChange={(e) => setSelectedDoctor(e.target.value)}
          className="bg-gray-800 px-4 py-2 rounded-md w-full"
          disabled={!selectedHospital}
        >
          <option value="">Select Doctor</option>
          {doctors.map((doc, i) => (
            <option key={i}>{doc}</option>
          ))}
        </select>
        <select
          value={selectedTests}
          onChange={(e) => setSelectedtests(e.target.value)}
          className="bg-gray-800 px-4 py-2 rounded-md w-full"
          disabled={!selectedLab}
        >
          <option value="">Select Test</option>
          {tests.map((doc, i) => (
            <option key={i}>{doc}</option>
          ))}
        </select> */} 



        {/* Continue Button */}
        {/* <button
          disabled={
                (view === "hospital" && (!selectedHospital || !selectedDoctor)) ||
                (view === "lab" && (!selectedLab || selectedTests.length === 0))
            }
          onClick={handleContinue}
          className="bg-blue-600 hover:bg-blue-700 cursor-pointer px-4 py-2 rounded-md w-full disabled:opacity-40"
        >
          Continue
        </button> */}
      </div>
  );
}
