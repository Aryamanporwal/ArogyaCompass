import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { Input } from "@/components/ui/input";
import { getAllHospitals } from "@/lib/actions/hospital.action";
import { createAppointment } from "@/lib/actions/appointment.action"
import { useRouter } from "next/navigation";

const ExploreMap = dynamic(() => import("@/components/ExploreMapView"), { ssr: false });

export default function PatientExplore() {
  const [search, setSearch] = useState("");
  const [view, setView] = useState<"all" | "hospital" | "lab">("all");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  interface Hospital {
    $id: string;
    name: string;
    city?: string;
    doctorName?: string[];
    // Add other fields as needed
  }
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [selectedHospital, setSelectedHospital] = useState<string>("");
  const [doctors, setDoctors] = useState<string[]>([]);
  const [selectedDoctor, setSelectedDoctor] = useState("");

  const router = useRouter();

  useEffect(() => {
    navigator.geolocation.getCurrentPosition((pos) => {
      const coords: [number, number] = [pos.coords.latitude, pos.coords.longitude];
      setUserLocation(coords);
    });
  }, []);

  useEffect(() => {
    const fetch = async () => {
      const res = await getAllHospitals();
      // Map Document[] to Hospital[]
      const hospitals: Hospital[] = res.map((doc: any) => ({
        $id: doc.$id,
        name: doc.name,
        city: doc.city,
        doctorName: doc.doctorName,
      }));
      setHospitals(hospitals);
    };
    fetch();
  }, []);

  const filteredHospitals = hospitals.filter((h) =>
    h.name.toLowerCase().includes(search.toLowerCase()) &&
    (city ? h.city?.toLowerCase() === city.toLowerCase() : true)
  );

  const handleHospitalSelect = (id: string) => {
    setSelectedHospital(id);
    const hosp = hospitals.find((h) => h.$id === id);
    if (hosp) setDoctors(hosp.doctorName || []);
  };

  const autofillState = async () => {
    try {
      const res = await fetch(
        `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${userLocation?.[0]}&longitude=${userLocation?.[1]}&localityLanguage=en`
      );
      const data = await res.json();
      setState(data.principalSubdivision);
    } catch {
      alert("Failed to fetch state");
    }
  };

  const handleContinue = async () => {
    try {
      await createAppointment({
        userId: "guest_user", // Replace with real user ID from auth if available
        hospitalId: selectedHospital,
        doctorName: selectedDoctor,
        city,
        state,
      });
      alert("✅ Appointment created");
      router.push("/appointment/confirmation");
    } catch  {
      alert("❌ Failed to create appointment");
    }
  };

  return (
    <div className="flex flex-col lg:flex-row w-full min-h-screen">
      {/* Map Section */}
      <div className="w-full lg:w-[60%] bg-[#0B0E1C] flex items-center justify-center px-3 pt-4 lg:px-0 lg:pt-0">
        <div className="w-full h-[65vh] lg:h-[95%] rounded-2xl shadow-2xl overflow-hidden bg-[#0B0E1C]">
          <ExploreMap view={view} selectedHospitalId={selectedHospital} userLocation={userLocation} />
        </div>
      </div>

      {/* Right Panel */}
      <div className="w-full lg:w-[40%] bg-[#0B0E1C] text-white p-6 space-y-4">
        <h2 className="text-2xl font-bold mb-2">Explore Healthcare Services</h2>

        {/* Search Hospital */}
        <Input
          type="text"
          placeholder="Search hospital by name"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        {/* View Filter Dropdown */}
        <select
          value={view}
          onChange={(e) => setView(e.target.value as "all" | "hospital" | "lab")}
          className="bg-gray-800 px-4 py-2 rounded-md w-full"
        >
          <option value="all">All</option>
          <option value="hospital">Hospitals</option>
          <option value="lab">Labs</option>
        </select>

        {/* State, City, Hospital, Doctor */}
        <button
          onClick={autofillState}
          className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-md w-full"
        >
          {state}
        </button>

        <Input
          placeholder="City"
          value={city}
          onChange={(e) => setCity(e.target.value)}
        />

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

        {/* Continue Button */}
        <button
          disabled={!selectedDoctor || !selectedHospital}
          onClick={handleContinue}
          className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-md w-full disabled:opacity-40"
        >
          Continue
        </button>
      </div>
    </div>
  );
}
