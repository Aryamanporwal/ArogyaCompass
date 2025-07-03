import { useState, useEffect } from "react";
import dynamic from "next/dynamic";
import Image from "next/image";
import { Input } from "@/components/ui/input";
import { getAllHospitals } from "@/lib/actions/hospital.action";
import { createAppointment } from "@/lib/actions/appointment.action"
import { useRouter } from "next/navigation";
import { getAllLabs } from "@/lib/actions/lab.action";
import { getUserId } from "@/lib/client-auth";

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

  interface Lab{
    $id : string;
    name : string;
    city?:string;
    test?:string[];
  }
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [selectedHospital, setSelectedHospital] = useState<string>("");
  const [doctors, setDoctors] = useState<string[]>([]);
  const [selectedDoctor, setSelectedDoctor] = useState("");
  const [labs, setLabs] = useState<Lab[]>([]); 
  const [selectedLab , setSelectedLab] = useState<string>("");
  const [tests, setTests] = useState<string[]>([]);
  const [selectedTests, setSelectedtests] = useState("");
  const router = useRouter();

  useEffect(() => {
    navigator.geolocation.getCurrentPosition((pos) => {
      const coords: [number, number] = [pos.coords.latitude, pos.coords.longitude];
      setUserLocation(coords);
    });
  }, []);

    useEffect(() => {
        const fetchLabs = async () => {
            const rest = await getAllLabs();
            const labs : Lab[] = rest.map((doc: any) => ({
            $id: doc.$id,
            name: doc.name,
            city: doc.city,
            test: doc.test, // optional
            }));
            setLabs(labs);
        };
        fetchLabs();
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
  const filteredLabs = labs.filter((l) =>
    l.name.toLowerCase().includes(search.toLowerCase()) &&
    (city ? l.city?.toLowerCase() === city.toLowerCase() : true)
  );

  const handleHospitalSelect = (id: string) => {
    setSelectedHospital(id);
    const hosp = hospitals.find((h) => h.$id === id);
    if (hosp) setDoctors(hosp.doctorName || []);
  };
  const handleLabsSelect = (id: string) => {
    setSelectedLab(id);
    const losp = labs.find((l) => l.$id === id);
    if(losp) setTests(losp.test || []);
  };

  const autofillState = async () => {
    try {
      const res = await fetch(
        `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${userLocation?.[0]}&longitude=${userLocation?.[1]}&localityLanguage=en`
      );
      const data = await res.json();
       setState(data.principalSubdivision); // State
       setCity(data.city || data.locality); // City or fallback to locality

    return { state: data.principalSubdivision, city: data.city || data.locality };
    } catch {
      alert("Failed to fetch state");
    }
  };

const handleContinue = async () => {
    const userId = await getUserId();
    if (!userId) {
        alert("Please login first");
        return;
    }
    try {
        if (view === "hospital") {
        await createAppointment({
            userId,
            hospitalId: selectedHospital,
            doctorName: selectedDoctor,
            city,
            state,
        });
        } else if (view === "lab") {
        await createAppointment({
            userId,
            labId: selectedLab,
            test: selectedTests, // selectedTests must be a string[]
            city,
            state,
        });
        }

        router.push(`/patients/${userId}/pdetails`);
    } catch {
        alert("❌ Failed to create appointment");
    }
    };


  return (
    <div className="flex flex-col lg:flex-row w-full min-h-screen">
      {/* Map Section */}
      <div className="w-full lg:w-[60%] bg-[#0B0E1C] flex items-center justify-center px-3 pt-4 lg:px-0 lg:pt-0">
        <div className="w-full h-[65vh] lg:h-[95%] rounded-2xl shadow-2xl overflow-hidden bg-[#0B0E1C]">
          <ExploreMap view={view} selectedHospitalId={selectedHospital} userLocation={userLocation} selectedLabId={selectedLab}/>
        </div>
      </div>

      {/* Right Panel */}
      <div className="w-full lg:w-[40%] bg-[#0B0E1C] text-white p-6 space-y-4">
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
        <Input
          type="text"
          placeholder="Search hospital or Lab by name"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />

        <Input
          placeholder={state || "State"}
          className="bg-gray-800 px-4 py-2 rounded-md w-full"
          value={state}
          onFocus={async () => {
            if (!state && userLocation) {
              await autofillState();
            }
          }}
          onChange={(e) => setState(e.target.value)}
        />

        <Input
          placeholder={city || "City"}
          className="bg-gray-800 px-4 py-2 rounded-md w-full"
          value={city}
          onFocus={async () => {
            if (!city && userLocation) {
              await autofillState();
            }
          }}
          onChange={(e) => setState(e.target.value)}
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
        </select>



        {/* Continue Button */}
        <button
          disabled={
                (view === "hospital" && (!selectedHospital || !selectedDoctor)) ||
                (view === "lab" && (!selectedLab || selectedTests.length === 0))
            }
          onClick={handleContinue}
          className="bg-blue-600 hover:bg-blue-700 px-4 py-2 rounded-md w-full disabled:opacity-40"
        >
          Continue
        </button>
      </div>
    </div>
  );
}
