// "use client";

// import { MapContainer, TileLayer, Marker, useMap, Popup } from "react-leaflet";
// import { useEffect, useState, useRef } from "react";
// import L from "leaflet";
// import "leaflet/dist/leaflet.css";
// import { getAllHospitals } from "@/lib/actions/hospital.action";
// import { getAllLabs } from "@/lib/actions/lab.action";
// import Image from "next/image";
// import { Models } from "node-appwrite";
// import { X, Sun, Moon, MapPin, Hotel, FlaskConical, Bookmark, User } from "lucide-react";

// type Document = Models.Document;

// interface Hospital {
//   $id?: string;
//   name: string;
//   address: string;
//   coordinates: [number, number];
//   doctorName?: string[];
//   logoUrl: string;
// }

// interface Lab {
//   $id: string;
//   name: string;
//   address: string;
//   coordinates: [number, number];
//   test?: string[];
//   logoUrl: string;
// }

// const FocusOnSelectedHospital = ({ selectedHospitalId, hospitals }: { selectedHospitalId?: string; hospitals: Hospital[] }) => {
//   const map = useMap();
//   useEffect(() => {
//     if (selectedHospitalId) {
//       const selected = hospitals.find((h) => h.$id === selectedHospitalId);
//       if (selected) map.setView(selected.coordinates, 18, { animate: true });
//     }
//   }, [selectedHospitalId, hospitals, map]);
//   return null;
// };

// const FocusOnSelectedLab = ({ selectedLabId, labs }: { selectedLabId?: string; labs: Lab[] }) => {
//   const map = useMap();
//   useEffect(() => {
//     if (selectedLabId) {
//       const selected = labs.find((l) => l.$id === selectedLabId);
//       if (selected) map.setView(selected.coordinates, 18, { animate: true });
//     }
//   }, [selectedLabId, labs, map]);
//   return null;
// };

// const userIcon = new L.Icon({ iconUrl: "/assets/icons/marker.png", iconSize: [50, 50], iconAnchor: [12, 41], popupAnchor: [1, -34] });
// const hospitalIcon = new L.Icon({ iconUrl: "/assets/icons/hospital_marker.png", iconSize: [66, 66], iconAnchor: [12, 41], popupAnchor: [1, -34] });
// const labIcon = new L.Icon({ iconUrl: "/assets/icons/lab_marker.png", iconSize: [60, 60], iconAnchor: [12, 41], popupAnchor: [1, -34] });

// const ResizeMap = () => {
//   const map = useMap();
//   useEffect(() => {
//     setTimeout(() => map.invalidateSize(), 200);
//   }, [map]);
//   return null;
// };

// interface ExploreMapProps {
//   view: "all" | "hospital" | "lab";
//   selectedHospitalId?: string;
//   userLocation: [number, number] | null;
//   selectedLabId?: string;
// }

// export default function ExploreMap({ view, selectedHospitalId, userLocation, selectedLabId }: ExploreMapProps) {
//   const [hospitals, setHospitals] = useState<Hospital[]>([]);
//   const [labs, setLabs] = useState<Lab[]>([]);
//   const [selected, setSelected] = useState<Hospital | Lab | null>(null);
//   const [filter, setFilter] = useState(view);
//   const [dark, setDark] = useState(false);
//   const mapRef = useRef<HTMLDivElement>(null);

//   useEffect(() => {
//     const fetchAll = async () => {
//       const fetchedHospitals = await getAllHospitals();
//       const fetchedLabs = await getAllLabs();
//       setHospitals(fetchedHospitals.map((doc: Document) => ({ $id: doc.$id, name: doc.name as string, address: doc.address as string, coordinates: doc.coordinates as [number, number], doctorName: doc.doctorName as string[], logoUrl: doc.logoUrl as string })));
//       setLabs(fetchedLabs.map((doc: Document) => ({ $id: doc.$id, name: doc.name as string, address: doc.address as string, coordinates: doc.coordinates as [number, number], test: doc.test as string[], logoUrl: doc.logoUrl as string })));
//     };
//     fetchAll();
//   }, []);

//   const mapTilerKey = process.env.NEXT_PUBLIC_MAPTILER_KEY;
//   const tileURL = `https://api.maptiler.com/maps/streets-v2/256/{z}/{x}/{y}.png?key=${mapTilerKey}`;

//   return (
//     <div ref={mapRef} className={`relative h-full w-full ${dark ? "bg-[#0a0a0a] text-white" : "bg-gray-100 text-gray-900"}`}>
//       <div className="absolute z-[1001] top-4 left-4 flex gap-2">
//         {["all", "hospital", "lab"].map((type) => (
//           <button
//             key={type}
//             onClick={() => setFilter(type as "all" | "hospital" | "lab")}
//             className={`px-4 py-1 rounded-full font-semibold shadow ${filter === type ? "bg-blue-600 text-white" : "bg-white text-black"}`}
//           >
//             {type.charAt(0).toUpperCase() + type.slice(1)}
//           </button>
//         ))}
//       </div>
//       <button onClick={() => mapRef.current?.requestFullscreen()} className="absolute top-4 right-4 z-[1001] cursor-pointer rounded-full bg-gray-500 p-2 shadow-lg hover:bg-amber-500">⛶</button>
//       {userLocation ? (
//         <MapContainer center={userLocation} zoom={16} scrollWheelZoom={false} className="rounded-2xl" style={{ height: "100%", width: "100%" }}>
//           <ResizeMap />
//           <TileLayer attribution="&copy;ArogyaCompass" url={tileURL} />
//           <FocusOnSelectedHospital selectedHospitalId={selectedHospitalId} hospitals={hospitals} />
//           <FocusOnSelectedLab selectedLabId={selectedLabId} labs={labs} />

//           <Marker position={userLocation} icon={userIcon}><Popup>Your current location</Popup></Marker>

//           {(filter === "all" || filter === "hospital") && hospitals.map((hospital) => (
//             <Marker key={hospital.$id} position={hospital.coordinates} icon={hospitalIcon} eventHandlers={{ click: () => setSelected(hospital) }}>
//               <Popup>{hospital.name}</Popup>
//             </Marker>
//           ))}

//           {(filter === "all" || filter === "lab") && labs.map((lab) => (
//             <Marker key={lab.$id} position={lab.coordinates} icon={labIcon} eventHandlers={{ click: () => setSelected(lab) }}>
//               <Popup>{lab.name}</Popup>
//             </Marker>
//           ))}
//         </MapContainer>
//       ) : (
//         <div className="flex h-full w-full items-center justify-center text-white">Loading map...</div>
//       )}

//       {/* Sidebar */}
// {selected && (
//   <div
//     className={`fixed z-[1002] top-0 left-0 h-full w-80 sm:w-96 rounded-xl shadow-2xl transition-transform duration-300 ease-in-out overflow-hidden border dark:border-gray-800 ${
//       dark ? "bg-[#18181b] text-white" : "bg-white text-gray-900"
//     }`}
//   >
//     {/* Header with image */}
//     <div className="relative">
//       {selected.logoUrl && (
//         <Image
//           src={selected.logoUrl}
//           alt="logo"
//           width={384}
//           height={180}
//           className="object-cover w-full h-44"
//         />
//       )}
//       <button
//         onClick={() => setSelected(null)}
//         className="absolute top-3 right-3 bg-black/50 hover:bg-black/70 rounded-full p-1 transition-colors"
//         aria-label="Close"
//       >
//         <X className="w-5 h-5 text-white" />
//       </button>
//       {/* Status/Deal Tag Example */}
//       {/* {selected.deal && (
//         <span className="absolute top-3 left-3 bg-green-600/90 text-white text-xs px-3 py-1 rounded-full shadow">
//           {selected.deal}
//         </span>
//       )} */}
//     </div>

//     {/* Main content */}
//     <div className="p-5 space-y-3">
//       <h2 className="text-2xl font-semibold flex items-center gap-2">
//         <Hotel className="w-6 h-6 text-blue-500" />
//         {selected.name}
//       </h2>
//       {/* {selected.rating && (
//         <div className="flex items-center gap-1">
//           <Star className="w-4 h-4 text-yellow-400" />
//           <span className="font-medium">{selected.rating}</span>
//           <span className="text-xs text-gray-400">({selected.reviewCount} reviews)</span>
//         </div>
//       )} */}
//       <p className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-300">
//         <MapPin className="w-4 h-4" />
//         {selected.address}
//       </p>

//       {/* Doctors */}
//       {"doctorName" in selected && selected.doctorName && (
//         <div>
//           <span className="text-xs font-semibold text-gray-400 uppercase">Doctors</span>
//           <ul className="flex flex-wrap gap-2 mt-1">
//             {selected.doctorName.map((d, i) => (
//               <li
//                 key={i}
//                 className="flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-900 rounded-md text-xs dark:bg-blue-900/20 dark:text-blue-200"
//               >
//                 <User className="w-4 h-4" /> {d}
//               </li>
//             ))}
//           </ul>
//         </div>
//       )}

//       {/* Tests */}
//       {"test" in selected && selected.test && (
//         <div>
//           <span className="text-xs font-semibold text-gray-400 uppercase">Tests</span>
//           <ul className="flex flex-wrap gap-2 mt-1">
//             {selected.test.map((t, i) => (
//               <li
//                 key={i}
//                 className="flex items-center gap-1 px-2 py-1 bg-green-50 text-green-900 rounded-md text-xs dark:bg-green-900/20 dark:text-green-200"
//               >
//                 <FlaskConical className="w-4 h-4" /> {t.replace(/_/g, " ")}
//               </li>
//             ))}
//           </ul>
//         </div>
//       )}

//       {/* Action Buttons */}
//       <div className="flex gap-2 mt-4">
//         <button className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-blue-700 transition-colors">
//           <MapPin className="w-4 h-4" />
//           Directions
//         </button>
//         <button className="flex-1 flex items-center justify-center gap-2 bg-gray-100 dark:bg-gray-800 rounded-lg px-4 py-2 text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
//           <Bookmark className="w-4 h-4" />
//           Save
//         </button>
//       </div>
//     </div>

//     {/* Footer: Dark/Light Toggle */}
//     <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
//       <button
//         onClick={() => setDark(!dark)}
//         className="flex items-center gap-2 px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-full text-sm font-medium shadow hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
//       >
//         {dark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
//         {dark ? "Light Mode" : "Dark Mode"}
//       </button>
//     </div>
//   </div>
// )}

//     </div>
//   );
// }

"use client";

import { MapContainer, TileLayer, Marker, useMap, Popup } from "react-leaflet";
import { useEffect, useState, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { getAllHospitals } from "@/lib/actions/hospital.action";
import { getAllLabs } from "@/lib/actions/lab.action";
import { createAppointment } from "@/lib/actions/appointment.action";
import { getUserIdFromCookie } from "@/lib/actions/user.action";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Models } from "node-appwrite";
import { X, Sun, Moon, MapPin, Hotel, FlaskConical, Bookmark, User } from "lucide-react";

type Document = Models.Document;

interface Hospital {
  $id: string;
  name: string;
  address: string;
  coordinates: [number, number];
  doctorName?: string[];
  logoUrl: string;
  city?: string;
  state?: string;
}

interface Lab {
  $id: string;
  name: string;
  address: string;
  coordinates: [number, number];
  test?: string[];
  logoUrl: string;
  city?: string;
}

const FocusOnSelectedHospital = ({ selectedHospitalId, hospitals }: { selectedHospitalId?: string; hospitals: Hospital[] }) => {
  const map = useMap();
  useEffect(() => {
    if (selectedHospitalId) {
      const selected = hospitals.find((h) => h.$id === selectedHospitalId);
      if (selected && selected.coordinates) map.setView(selected.coordinates, 18, { animate: true });
    }
  }, [selectedHospitalId, hospitals, map]);
  return null;
};

const FocusOnSelectedLab = ({ selectedLabId, labs }: { selectedLabId?: string; labs: Lab[] }) => {
  const map = useMap();
  useEffect(() => {
    if (selectedLabId) {
      const selected = labs.find((l) => l.$id === selectedLabId);
      if (selected && selected.coordinates) map.setView(selected.coordinates, 18, { animate: true });
    }
  }, [selectedLabId, labs, map]);
  return null;
};

const userIcon = new L.Icon({ iconUrl: "/assets/icons/marker.png", iconSize: [50, 50], iconAnchor: [12, 41], popupAnchor: [1, -34] });
const hospitalIcon = new L.Icon({ iconUrl: "/assets/icons/hospital_marker.png", iconSize: [66, 66], iconAnchor: [12, 41], popupAnchor: [1, -34] });
const labIcon = new L.Icon({ iconUrl: "/assets/icons/lab_marker.png", iconSize: [60, 60], iconAnchor: [12, 41], popupAnchor: [1, -34] });

const ResizeMap = () => {
  const map = useMap();
  useEffect(() => {
    setTimeout(() => map.invalidateSize(), 200);
  }, [map]);
  return null;
};

interface ExploreMapProps {
  view: "all" | "hospital" | "lab";
  selectedHospitalId?: string;
  userLocation: [number, number] | null;
  selectedLabId?: string;
}

export default function ExploreMap({ view, selectedHospitalId, userLocation, selectedLabId }: ExploreMapProps) {
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [labs, setLabs] = useState<Lab[]>([]);
  const [filter, setFilter] = useState<"all" | "hospital" | "lab">(view);
  const [dark, setDark] = useState(false);
  const mapRef = useRef<HTMLDivElement>(null);

  // For sidebar and filtering
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [search, setSearch] = useState("");
  const [showListSidebar, setShowListSidebar] = useState(false);
  const [selected, setSelected] = useState<Hospital | Lab | null>(null);

  // For selection and appointment
  const [selectedHospital, setSelectedHospital] = useState<string>("");
  const [selectedLab, setSelectedLab] = useState<string>("");
  const [selectedDoctor, setSelectedDoctor] = useState<string>("");
  const [selectedTest, setSelectedTest] = useState<string>("");

  const router = useRouter();

  // Autofill city/state on mount if userLocation is available
  useEffect(() => {
    if (!userLocation) return;
    const fetchLocation = async () => {
      try {
        const res = await fetch(
          `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${userLocation[0]}&longitude=${userLocation[1]}&localityLanguage=en`
        );
        const data = await res.json();
        setState(data.principalSubdivision || "");
        setCity(data.city || data.locality || "");
      } catch {
        // fallback: do nothing
      }
    };
    fetchLocation();
  }, [userLocation]);

  useEffect(() => {
    const fetchAll = async () => {
      const fetchedHospitals = await getAllHospitals();
      const hospitals = fetchedHospitals.map((doc: Document) => ({
        $id: doc.$id,
        name: doc.name as string,
        address: doc.address as string,
        coordinates: Array.isArray(doc.coordinates) && doc.coordinates.length === 2
          ? doc.coordinates as [number, number]
          : undefined,
        doctorName: doc.doctorName as string[] | undefined,
        logoUrl: doc.logoUrl as string,
        city: doc.city as string,
        state: doc.state as string,
      })).filter(h => h.coordinates);

      setHospitals(hospitals as unknown as Hospital[]);

      const fetchedLabs = await getAllLabs();
      const labs = fetchedLabs.map((doc: Document) => ({
        $id: doc.$id,
        name: doc.name as string,
        address: doc.address as string,
        coordinates: Array.isArray(doc.coordinates) && doc.coordinates.length === 2
          ? doc.coordinates as [number, number]
          : undefined,
        test: doc.test as string[] | undefined,
        logoUrl: doc.logoUrl as string,
        city: doc.city as string,
      })).filter(l => l.coordinates); // Only keep labs with coordinates

      setLabs(labs as unknown as Lab[]);
    };
    fetchAll();
  }, []);

  // Filtering logic
  const filteredHospitals = hospitals.filter(
    (h) =>
      h.name.toLowerCase().includes(search.toLowerCase()) &&
      (city ? (h.city?.toLowerCase() === city.toLowerCase()) : true) &&
      (state ? (h.state?.toLowerCase() === state.toLowerCase()) : true)
  );
  const filteredLabs = labs.filter(
    (l) =>
      l.name.toLowerCase().includes(search.toLowerCase()) &&
      (city ? (l.city?.toLowerCase() === city.toLowerCase()) : true)
  );

  // Open list sidebar when filter is changed to hospital/lab
  useEffect(() => {
    if (filter === "hospital" || filter === "lab") {
      setShowListSidebar(true);
    } else {
      setShowListSidebar(false);
    }
    setSelected(null);
    setSelectedHospital("");
    setSelectedDoctor("");
    setSelectedLab("");
    setSelectedTest("");
  }, [filter]);

  // Show details sidebar when marker is clicked
  const handleMarkerClick = (item: Hospital | Lab) => {
    setSelected(item);
    setShowListSidebar(false);
    // Set selected hospital/lab and clear doctor/test
    if ("doctorName" in item) {
      setSelectedHospital(item.$id);
      setSelectedDoctor("");
      setSelectedLab("");
      setSelectedTest("");
    } else {
      setSelectedLab(item.$id);
      setSelectedTest("");
      setSelectedHospital("");
      setSelectedDoctor("");
    }
  };

  // Show list sidebar when filter is clicked
  const handleFilterClick = (type: "all" | "hospital" | "lab") => {
    setFilter(type);
    if (type === "hospital" || type === "lab") {
      setShowListSidebar(true);
      setSelected(null);
      setSelectedHospital("");
      setSelectedDoctor("");
      setSelectedLab("");
      setSelectedTest("");
    } else {
      setShowListSidebar(false);
      setSelected(null);
      setSelectedHospital("");
      setSelectedDoctor("");
      setSelectedLab("");
      setSelectedTest("");
    }
  };

  // Handle selection from sidebar
  const handleHospitalSelect = (id: string) => {
    setSelectedHospital(id);
    setSelectedDoctor("");
    setSelectedLab("");
    setSelectedTest("");
  };
  const handleLabSelect = (id: string) => {
    setSelectedLab(id);
    setSelectedTest("");
    setSelectedHospital("");
    setSelectedDoctor("");
  };

  // Handle doctor/test chip click
  const handleDoctorClick = (doctor: string) => {
    setSelectedDoctor(doctor);
  };
  const handleTestClick = (test: string) => {
    setSelectedTest(test);
  };

  // Continue logic
  const handleContinue = async ({
    hospitalId,
    doctorName,
    labId,
    test,
    city,
    state,
  }: {
    hospitalId?: string;
    doctorName?: string;
    labId?: string;
    test?: string;
    city: string;
    state: string;
  }) => {
    try {
      if (hospitalId && doctorName) {
        await createAppointment({
          hospitalId,
          doctorName,
          city,
          state,
        });
      } else if (labId && test) {
        await createAppointment({
          labId,
          test,
          city,
          state,
        });
      }
      const userId = await getUserIdFromCookie();
      if (!userId) {
        alert("Not logged in.");
        return;
      }
      router.push(`/patients/${userId}/pdetails`);
    } catch {
      alert("❌ Failed to create appointment");
    }
  };

  const mapTilerKey = process.env.NEXT_PUBLIC_MAPTILER_KEY;
  const tileURL = `https://api.maptiler.com/maps/streets-v2/256/{z}/{x}/{y}.png?key=${mapTilerKey}`;

  return (
    <div ref={mapRef} className={`relative h-full w-full ${dark ? "bg-[#0a0a0a] text-white" : "bg-gray-100 text-gray-900"}`}>
      {/* Filter Buttons */}
      <div className="absolute z-[1001] top-4 left-4 flex gap-2">
        {["all", "hospital", "lab"].map((type) => (
          <button
            key={type}
            onClick={() => handleFilterClick(type as "all" | "hospital" | "lab")}
            className={`px-4 py-1 rounded-full font-semibold shadow ${filter === type ? "bg-blue-600 text-white" : "bg-white text-black"}`}
          >
            {type.charAt(0).toUpperCase() + type.slice(1)}
          </button>
        ))}
      </div>
      {/* Fullscreen Button */}
      <button onClick={() => mapRef.current?.requestFullscreen()} className="absolute top-4 right-4 z-[1001] cursor-pointer rounded-full bg-gray-500 p-2 shadow-lg hover:bg-amber-500">⛶</button>
      {/* Map */}
      {userLocation ? (
        <MapContainer center={userLocation} zoom={16} scrollWheelZoom={false} className="rounded-2xl" style={{ height: "100%", width: "100%" }}>
          <ResizeMap />
          <TileLayer attribution="&copy;ArogyaCompass" url={tileURL} />
          <FocusOnSelectedHospital selectedHospitalId={selectedHospitalId} hospitals={hospitals} />
          <FocusOnSelectedLab selectedLabId={selectedLabId} labs={labs} />
          <Marker position={userLocation} icon={userIcon}><Popup>Your current location</Popup></Marker>
          {(filter === "all" || filter === "hospital") && filteredHospitals.map((hospital) => (
            <Marker key={hospital.$id} position={hospital.coordinates!} icon={hospitalIcon} eventHandlers={{ click: () => handleMarkerClick(hospital) }}>
              <Popup>{hospital.name}</Popup>
            </Marker>
          ))}
          {(filter === "all" || filter === "lab") && filteredLabs.map((lab) => (
            <Marker key={lab.$id} position={lab.coordinates!} icon={labIcon} eventHandlers={{ click: () => handleMarkerClick(lab) }}>
              <Popup>{lab.name}</Popup>
            </Marker>
          ))}
        </MapContainer>
      ) : (
        <div className="flex h-full w-full items-center justify-center text-white">Loading map...</div>
      )}

      {/* List Sidebar for filtered results */}
      {showListSidebar && (
        <div className={`fixed z-[1002] top-0 left-0 h-full w-96 rounded-xl shadow-2xl transition-transform duration-300 ease-in-out overflow-y-auto border dark:border-gray-800 ${dark ? "bg-[#18181b] text-white" : "bg-white text-gray-900"}`}>
          {/* Header */}
          <div className="p-4 border-b dark:border-gray-700 flex flex-col gap-2 relative">
            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Search hospital or lab"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="bg-gray-100 dark:bg-gray-800 px-3 py-2 rounded-md w-full"
              />
            </div>
            <div className="flex gap-2 mt-2">
              <input
                type="text"
                placeholder={state || "State"}
                value={state}
                onFocus={async () => {
                  if (!state && userLocation) {
                    try {
                      const res = await fetch(
                        `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${userLocation[0]}&longitude=${userLocation[1]}&localityLanguage=en`
                      );
                      const data = await res.json();
                      setState(data.principalSubdivision || "");
                    } catch {}
                  }
                }}
                onChange={(e) => setState(e.target.value)}
                className="bg-gray-100 dark:bg-gray-800 px-3 py-2 rounded-md w-full"
              />
              <input
                type="text"
                placeholder={city || "City"}
                value={city}
                onFocus={async () => {
                  if (!city && userLocation) {
                    try {
                      const res = await fetch(
                        `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${userLocation[0]}&longitude=${userLocation[1]}&localityLanguage=en`
                      );
                      const data = await res.json();
                      setCity(data.city || data.locality || "");
                    } catch {}
                  }
                }}
                onChange={(e) => setCity(e.target.value)}
                className="bg-gray-100 dark:bg-gray-800 px-3 py-2 rounded-md w-full"
              />
            </div>
            <button
              onClick={() => setShowListSidebar(false)}
              className="absolute top-4 right-4 bg-black/50 hover:bg-black/70 rounded-full p-1 transition-colors"
              aria-label="Close"
            >
              <X className="w-5 h-5 text-white" />
            </button>
          </div>
          {/* Content */}
          <div className="p-4 space-y-4">
            <h2 className="text-xl font-bold mb-2">{filter === "hospital" ? "Hospitals" : "Labs"} in {city || "your area"}</h2>
            {(filter === "hospital" ? filteredHospitals : filteredLabs).length === 0 && (
              <div className="text-gray-400 text-center">No results found.</div>
            )}
            {(filter === "hospital" ? filteredHospitals : filteredLabs).map((item) => (
              <div
                key={item.$id}
                className={`bg-gray-50 dark:bg-gray-900 rounded-lg shadow flex flex-col gap-2 mb-4 p-4 hover:ring-2 hover:ring-blue-400 transition`}
              >
                <div className="flex gap-3 cursor-pointer" onClick={() => {
                  if (filter === "hospital") handleHospitalSelect(item.$id);
                  else handleLabSelect(item.$id);
                }}>
                  {item.logoUrl && (
                    <Image
                      src={item.logoUrl}
                      alt="logo"
                      width={80}
                      height={80}
                      className="object-cover rounded-lg w-20 h-20"
                    />
                  )}
                  <div className="flex flex-col justify-center flex-1">
                    <h3 className="text-lg font-semibold flex items-center gap-1">
                      {filter === "hospital" ? <Hotel className="w-5 h-5 text-blue-500" /> : <FlaskConical className="w-5 h-5 text-green-500" />}
                      {item.name}
                    </h3>
                    <span className="text-xs text-gray-400 flex items-center gap-1">
                      <MapPin className="w-4 h-4" /> {item.address}
                    </span>
                    <span className="text-xs text-gray-400">{item.city}{("state" in item && item.state) ? `, ${item.state}` : ""}</span>
                  </div>
                </div>
                {/* Doctor/Tests chips */}
                {filter === "hospital" && "doctorName" in item && item.doctorName && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {item.doctorName.map((doc) => (
                      <button
                        key={doc}
                        onClick={() => handleDoctorClick(doc)}
                        className={`px-3 py-1 rounded-full text-xs font-medium border ${selectedHospital === item.$id && selectedDoctor === doc ? "bg-blue-600 text-white border-blue-600" : "bg-blue-50 text-blue-700 border-blue-200"} hover:bg-blue-500 hover:text-white transition`}
                      >
                        <User className="w-4 h-4 inline-block mr-1" /> {doc}
                      </button>
                    ))}
                  </div>
                )}
                {filter === "lab" && "test" in item && item.test && (
                  <div className="flex flex-wrap gap-2 mt-2">
                    {item.test.map((test) => (
                      <button
                        key={test}
                        onClick={() => handleTestClick(test)}
                        className={`px-3 py-1 rounded-full text-xs font-medium border ${selectedLab === item.$id && selectedTest === test ? "bg-green-600 text-white border-green-600" : "bg-green-50 text-green-700 border-green-200"} hover:bg-green-500 hover:text-white transition`}
                      >
                        <FlaskConical className="w-4 h-4 inline-block mr-1" /> {test}
                      </button>
                    ))}
                  </div>
                )}
                {/* Continue Button */}
                <button
                  className={`mt-3 px-4 py-2 rounded-md w-full font-semibold ${filter === "hospital"
                    ? (selectedHospital === item.$id && selectedDoctor ? "bg-blue-600 text-white hover:bg-blue-700" : "bg-blue-300 text-white opacity-60 cursor-not-allowed")
                    : (selectedLab === item.$id && selectedTest ? "bg-green-600 text-white hover:bg-green-700" : "bg-green-300 text-white opacity-60 cursor-not-allowed")
                    } transition`}
                  disabled={
                    (filter === "hospital" && !(selectedHospital === item.$id && selectedDoctor)) ||
                    (filter === "lab" && !(selectedLab === item.$id && selectedTest))
                  }
                  onClick={() => {
                    if (filter === "hospital") {
                      handleContinue({
                        hospitalId: item.$id,
                        doctorName: selectedDoctor,
                        city: city,
                        state: state,
                      });
                    } else {
                      handleContinue({
                        labId: item.$id,
                        test: selectedTest,
                        city: city,
                        state: state,
                      });
                    }
                  }}
                >
                  Continue
                </button>
              </div>
            ))}
          </div>
          {/* Footer: Dark/Light Toggle */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
            <button
              onClick={() => setDark(!dark)}
              className="flex items-center gap-2 px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-full text-sm font-medium shadow hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
            >
              {dark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              {dark ? "Light Mode" : "Dark Mode"}
            </button>
          </div>
        </div>
      )}

      {/* Details Sidebar for marker click */}
      {selected && (
        <div
          className={`fixed z-[1002] top-0 left-0 h-full w-80 sm:w-96 rounded-xl shadow-2xl transition-transform duration-300 ease-in-out overflow-hidden border dark:border-gray-800 ${
            dark ? "bg-[#18181b] text-white" : "bg-white text-gray-900"
          }`}
        >
          {/* Header with image */}
          <div className="relative">
            {selected.logoUrl && (
              <Image
                src={selected.logoUrl}
                alt="logo"
                width={384}
                height={180}
                className="object-cover w-full h-44"
              />
            )}
            <button
              onClick={() => setSelected(null)}
              className="absolute top-3 right-3 bg-black/50 hover:bg-black/70 rounded-full p-1 transition-colors"
              aria-label="Close"
            >
              <X className="w-5 h-5 text-white" />
            </button>
          </div>
          {/* Main content */}
          <div className="p-5 space-y-3">
            <h2 className="text-2xl font-semibold flex items-center gap-2">
              {"doctorName" in selected
                ? <Hotel className="w-6 h-6 text-blue-500" />
                : <FlaskConical className="w-6 h-6 text-green-500" />}
              {selected.name}
            </h2>
            <p className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-300">
              <MapPin className="w-4 h-4" />
              {selected.address}
            </p>
            {"doctorName" in selected && selected.doctorName && (
              <div>
                <span className="text-xs font-semibold text-gray-400 uppercase">Doctors</span>
                <ul className="flex flex-wrap gap-2 mt-1">
                  {selected.doctorName.map((d, i) => (
                    <li
                      key={i}
                      className="flex items-center gap-1 px-2 py-1 bg-blue-50 text-blue-900 rounded-md text-xs dark:bg-blue-900/20 dark:text-blue-200"
                    >
                      <User className="w-4 h-4" /> {d}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {"test" in selected && selected.test && (
              <div>
                <span className="text-xs font-semibold text-gray-400 uppercase">Tests</span>
                <ul className="flex flex-wrap gap-2 mt-1">
                  {selected.test.map((t, i) => (
                    <li
                      key={i}
                      className="flex items-center gap-1 px-2 py-1 bg-green-50 text-green-900 rounded-md text-xs dark:bg-green-900/20 dark:text-green-200"
                    >
                      <FlaskConical className="w-4 h-4" /> {t.replace(/_/g, " ")}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {/* Action Buttons */}
            <div className="flex gap-2 mt-4">
              <button className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white rounded-lg px-4 py-2 text-sm font-medium hover:bg-blue-700 transition-colors">
                <MapPin className="w-4 h-4" />
                Directions
              </button>
              <button className="flex-1 flex items-center justify-center gap-2 bg-gray-100 dark:bg-gray-800 rounded-lg px-4 py-2 text-sm font-medium hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                <Bookmark className="w-4 h-4" />
                Save
              </button>
            </div>
          </div>
          {/* Footer: Dark/Light Toggle */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2">
            <button
              onClick={() => setDark(!dark)}
              className="flex items-center gap-2 px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-full text-sm font-medium shadow hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
            >
              {dark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
              {dark ? "Light Mode" : "Dark Mode"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
