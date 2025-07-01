// ✅ HospitalMap.tsx
"use client";

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { useEffect, useState, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { getAllHospitals } from "@/lib/actions/hospital.action";

const markerIcon = new L.Icon({
  iconUrl: "/assets/icons/hospital_marker.png",
  iconSize: [66, 66],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

export interface HospitalMapProps {
  onLocationFetched?: (coords: [number, number]) => void;
   registeredHospital?: {
    name: string;
    address: string;
    coordinates: [number, number];
    doctorName?: { Name: string }[];
  };
}

interface Hospital {
  $id?: string;
  name: string;
  address: string;
  coordinates: [number, number];
  doctorName?: string[];
}

export default function HospitalMap({ onLocationFetched }: HospitalMapProps) {
  const [position, setPosition] = useState<[number, number] | null>(null);
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const mapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition((pos) => {
      const coords: [number, number] = [
        pos.coords.latitude,
        pos.coords.longitude,
      ];
      setPosition(coords);
      if (onLocationFetched) onLocationFetched(coords);
    });
  }, [onLocationFetched]);

  useEffect(() => {
    const fetchHospitals = async () => {
      const result = await getAllHospitals();
      setHospitals(result as unknown as Hospital[]);
    };
    fetchHospitals();
  }, []);

  const handleFullscreen = () => {
    if (mapRef.current) {
      if (!document.fullscreenElement) {
        mapRef.current.requestFullscreen();
      } else {
        document.exitFullscreen();
      }
    }
  };

  const mapTilerKey = process.env.NEXT_PUBLIC_MAPTILER_KEY;
  const tileURL = `https://api.maptiler.com/maps/streets-v2/256/{z}/{x}/{y}.png?key=${mapTilerKey}`;

  return (
    <div ref={mapRef} className="relative h-full w-full">
      <button
        onClick={handleFullscreen}
        className="absolute top-4 right-4 z-[1000] rounded-full bg-gray-500 p-2 shadow-lg hover:bg-amber-500"
        title="Toggle Fullscreen"
      >
        ⛶
      </button>

      {position ? (
        <MapContainer
          center={position}
          zoom={16}
          scrollWheelZoom={false}
          style={{ height: "100%", width: "100%" }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.maptiler.com/copyright/">MapTiler</a>'
            url={tileURL}
          />

          {hospitals.map((hospital, index) => (
            <Marker
              key={hospital.$id || index}
              position={hospital.coordinates}
              icon={markerIcon}
            >
              <Popup>
                <strong>{hospital.name}</strong>
                <p>{hospital.address}</p>
                {hospital.doctorName && hospital.doctorName.length > 0 && (
                  <select className="mt-2 text-sm text-black">
                    {hospital.doctorName.map((name, i) => (
                      <option key={i}>{name}</option>
                    ))}
                  </select>
                )}
              </Popup>

            </Marker>
          ))}
        </MapContainer>
      ) : (
        <div className="flex h-full w-full items-center justify-center text-white">
          Loading map...
        </div>
      )}
    </div>
  );
}