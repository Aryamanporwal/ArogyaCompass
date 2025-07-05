"use client";

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { useEffect, useState, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { getAllLabs } from "@/lib/actions/lab.action";
import Image from "next/image";
const markerIcon = new L.Icon({
  iconUrl: "/assets/icons/lab_marker.png",
  iconSize: [60, 60],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

export interface LabMapProps {
  onLocationFetched?: (coords: [number, number]) => void;
}

interface Lab {
  $id?: string;
  name: string;
  address: string;
  coordinates: [number, number];
  test: string[];
  logoUrl:string;
}

export default function LabMap({ onLocationFetched }: LabMapProps) {
  const [position, setPosition] = useState<[number, number] | null>(null);
  const [labs, setLabs] = useState<Lab[]>([]);
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
    const fetchLabs = async () => {
      const result = await getAllLabs();
      setLabs(result as unknown as Lab[]);
    };
    fetchLabs();
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

          {labs.map((lab, index) => (
            <Marker
              key={lab.$id || index}
              position={lab.coordinates}
              icon={markerIcon}
            >
              <Popup>
                <div className="flex flex-col items-center">
                {lab.logoUrl &&(
                  <Image
                  src = {lab.logoUrl}
                  alt = {`${lab.name} logo`}
                  width = {96}
                  height = {96}
                  className = "mb-2 h-24 w-24 object-cover rounded-md shadow"/>
                )}
              <h3 className="text-base font-bold text-center">{lab.name}</h3>
              <p className="text-sm font-semibold text-center text-gray-700">
                {lab.address}
              </p>

                {lab.test?.length > 0 && (
                  <select className="mt-2 text-sm text-black rounded0md p-1 w-full">
                    {lab.test.map((test, i) => (
                      <option key={i}>{test.replace(/_/g, " ")}</option>
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
