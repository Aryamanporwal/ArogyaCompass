"use client";

import { MapContainer, TileLayer, Marker, useMap, Popup } from "react-leaflet";
import { useEffect, useState, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { getAllHospitals } from "@/lib/actions/hospital.action";
import { getAllLabs } from "@/lib/actions/lab.action";
import Image from "next/image";
import { Models } from "node-appwrite";
import { X, Sun, Moon, MapPin, Hotel, FlaskConical, Bookmark, User } from "lucide-react";

type Document = Models.Document;

interface Hospital {
  $id?: string;
  name: string;
  address: string;
  coordinates: [number, number];
  doctorName?: string[];
  logoUrl: string;
}

interface Lab {
  $id: string;
  name: string;
  address: string;
  coordinates: [number, number];
  test?: string[];
  logoUrl: string;
}

const FocusOnSelectedHospital = ({ selectedHospitalId, hospitals }: { selectedHospitalId?: string; hospitals: Hospital[] }) => {
  const map = useMap();
  useEffect(() => {
    if (selectedHospitalId) {
      const selected = hospitals.find((h) => h.$id === selectedHospitalId);
      if (selected) map.setView(selected.coordinates, 18, { animate: true });
    }
  }, [selectedHospitalId, hospitals, map]);
  return null;
};

const FocusOnSelectedLab = ({ selectedLabId, labs }: { selectedLabId?: string; labs: Lab[] }) => {
  const map = useMap();
  useEffect(() => {
    if (selectedLabId) {
      const selected = labs.find((l) => l.$id === selectedLabId);
      if (selected) map.setView(selected.coordinates, 18, { animate: true });
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
  const [selected, setSelected] = useState<Hospital | Lab | null>(null);
  const [filter, setFilter] = useState(view);
  const [dark, setDark] = useState(false);
  const mapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchAll = async () => {
      const fetchedHospitals = await getAllHospitals();
      const fetchedLabs = await getAllLabs();
      setHospitals(fetchedHospitals.map((doc: Document) => ({ $id: doc.$id, name: doc.name as string, address: doc.address as string, coordinates: doc.coordinates as [number, number], doctorName: doc.doctorName as string[], logoUrl: doc.logoUrl as string })));
      setLabs(fetchedLabs.map((doc: Document) => ({ $id: doc.$id, name: doc.name as string, address: doc.address as string, coordinates: doc.coordinates as [number, number], test: doc.test as string[], logoUrl: doc.logoUrl as string })));
    };
    fetchAll();
  }, []);

  const mapTilerKey = process.env.NEXT_PUBLIC_MAPTILER_KEY;
  const tileURL = `https://api.maptiler.com/maps/streets-v2/256/{z}/{x}/{y}.png?key=${mapTilerKey}`;

  return (
    <div ref={mapRef} className={`relative h-full w-full ${dark ? "bg-[#0a0a0a] text-white" : "bg-gray-100 text-gray-900"}`}>
      <div className="absolute z-[1001] top-4 left-4 flex gap-2">
        {["all", "hospital", "lab"].map((type) => (
          <button
            key={type}
            onClick={() => setFilter(type as "all" | "hospital" | "lab")}
            className={`px-4 py-1 rounded-full font-semibold shadow ${filter === type ? "bg-blue-600 text-white" : "bg-white text-black"}`}
          >
            {type.charAt(0).toUpperCase() + type.slice(1)}
          </button>
        ))}
      </div>
      <button onClick={() => mapRef.current?.requestFullscreen()} className="absolute top-4 right-4 z-[1001] cursor-pointer rounded-full bg-gray-500 p-2 shadow-lg hover:bg-amber-500">⛶</button>
      {userLocation ? (
        <MapContainer center={userLocation} zoom={16} scrollWheelZoom={false} className="rounded-2xl" style={{ height: "100%", width: "100%" }}>
          <ResizeMap />
          <TileLayer attribution="&copy;ArogyaCompass" url={tileURL} />
          <FocusOnSelectedHospital selectedHospitalId={selectedHospitalId} hospitals={hospitals} />
          <FocusOnSelectedLab selectedLabId={selectedLabId} labs={labs} />

          <Marker position={userLocation} icon={userIcon}><Popup>Your current location</Popup></Marker>

          {(filter === "all" || filter === "hospital") && hospitals.map((hospital) => (
            <Marker key={hospital.$id} position={hospital.coordinates} icon={hospitalIcon} eventHandlers={{ click: () => setSelected(hospital) }}>
              <Popup>{hospital.name}</Popup>
            </Marker>
          ))}

          {(filter === "all" || filter === "lab") && labs.map((lab) => (
            <Marker key={lab.$id} position={lab.coordinates} icon={labIcon} eventHandlers={{ click: () => setSelected(lab) }}>
              <Popup>{lab.name}</Popup>
            </Marker>
          ))}
        </MapContainer>
      ) : (
        <div className="flex h-full w-full items-center justify-center text-white">Loading map...</div>
      )}

      {/* Sidebar */}
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
      {/* Status/Deal Tag Example */}
      {/* {selected.deal && (
        <span className="absolute top-3 left-3 bg-green-600/90 text-white text-xs px-3 py-1 rounded-full shadow">
          {selected.deal}
        </span>
      )} */}
    </div>

    {/* Main content */}
    <div className="p-5 space-y-3">
      <h2 className="text-2xl font-semibold flex items-center gap-2">
        <Hotel className="w-6 h-6 text-blue-500" />
        {selected.name}
      </h2>
      {/* {selected.rating && (
        <div className="flex items-center gap-1">
          <Star className="w-4 h-4 text-yellow-400" />
          <span className="font-medium">{selected.rating}</span>
          <span className="text-xs text-gray-400">({selected.reviewCount} reviews)</span>
        </div>
      )} */}
      <p className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-300">
        <MapPin className="w-4 h-4" />
        {selected.address}
      </p>

      {/* Doctors */}
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

      {/* Tests */}
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
