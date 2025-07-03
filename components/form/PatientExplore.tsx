import React from 'react'
import dynamic from 'next/dynamic'
const ExploreMap = dynamic(()=>import ("@/components/ExploreMapView"),{ssr:false})
const PatientExpo = () => {
return (
  <div className="flex flex-col lg:flex-row w-full min-h-screen">
    {/* Map Section - 65% height on small screens, 60% width on large */}
    <div className="w-full lg:w-[60%] bg-[#0B0E1C] flex items-center justify-center px-3 pt-4 lg:px-0 lg:pt-0">
      <div className="w-full h-[65vh] lg:h-[95%] rounded-2xl shadow-2xl overflow-hidden bg-[#0B0E1C]">
        <ExploreMap />
      </div>
    </div>

    {/* Right Content Section */}
    <div className="w-full lg:w-[40%] bg-[#0B0E1C] text-white p-6">
      <h2 className="text-2xl font-bold mb-4">Explore Healthcare Services</h2>
      <p className="mb-2">Find hospitals and labs near your location.</p>
      <button className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-md">
        Explore Now
      </button>
    </div>
  </div>
);
}

export default PatientExpo;