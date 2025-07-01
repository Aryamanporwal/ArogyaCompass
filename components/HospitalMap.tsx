"use client";

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import { useEffect, useState, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix for missing marker icon
const markerIcon = new L.Icon({
  iconUrl: "/assets/icons/hospital_marker.png",
  iconSize: [66, 66],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

interface MapViewProps {
  hospital?: {
    name: string;
    address: string;
    coordinates: [number, number];
    doctors: { Name: string }[];
  };
  onLocationFetched?: (coords: [number, number]) => void;
}

export default function MapView({ hospital, onLocationFetched }: MapViewProps) {
  const [position, setPosition] = useState<[number, number] | null>(null);
  const mapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => {
        const coords: [number, number] = [
          pos.coords.latitude,
          pos.coords.longitude,
        ];
        setPosition(coords);
        if (onLocationFetched) onLocationFetched(coords);
      });
    }
  }, [onLocationFetched]);

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
      {/* Expand Button */}
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
          <Marker
            position={hospital?.coordinates || position}
            icon={markerIcon}
          >
            <Popup>
              {hospital ? (
                <div>
                  <strong>{hospital.name}</strong>
                  <p>{hospital.address}</p>
                  {hospital.doctors.length > 0 && (
                    <select className="mt-2 text-sm text-black">
                      {hospital.doctors.map((doc, i) => (
                        <option key={i}>{doc.Name}</option>
                      ))}
                    </select>
                  )}
                </div>
              ) : (
                "Your current location"
              )}
            </Popup>
          </Marker>
        </MapContainer>
      ) : (
        <div className="flex h-full w-full items-center justify-center text-white">
          Loading map...
        </div>
      )}
    </div>
  );
}
