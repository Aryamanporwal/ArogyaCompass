// ✅ HospitalMap.tsx
"use client";

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { useEffect, useState, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { getAllHospitals } from "@/lib/actions/hospital.action";
import Image from "next/image";


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
  logoUrl: string; 
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
            attribution='&copy;ArogyaCompass'
            url={tileURL}
          />

          {hospitals.map((hospital, index) => (
            <Marker
              key={hospital.$id || index}
              position={hospital.coordinates}
              icon={markerIcon}
            >
          <Popup>
            <div className="flex flex-col items-center">
              {hospital.logoUrl && (
                <Image
                  src={hospital.logoUrl}
                  alt={`${hospital.name} logo`}
                  width={96}
                  height={96}
                  className="mb-2 h-24 w-24 object-cover rounded-md shadow"
                />
              )}

              <h3 className="text-base font-bold text-center">{hospital.name}</h3>
              <p className="text-sm font-semibold text-center text-gray-700">
                {hospital.address}
              </p>

              {hospital.doctorName && hospital.doctorName.length > 0 && (
                <select className="mt-2 w-full text-sm text-black rounded-md p-1">
                  {hospital.doctorName.map((name, i) => (
                    <option key={i}>{name}</option>
                  ))}
                </select>
              )}
            </div>
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