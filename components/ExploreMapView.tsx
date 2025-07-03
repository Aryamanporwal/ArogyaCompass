"use client";

import { MapContainer, TileLayer, Marker, Popup , useMap} from "react-leaflet";
import { useEffect, useState, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { getAllHospitals } from "@/lib/actions/hospital.action";
import { getAllLabs } from "@/lib/actions/lab.action";

const userIcon = new L.Icon({
  iconUrl: "/assets/icons/marker.png",
  iconSize: [50, 50],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

const hospitalIcon = new L.Icon({
  iconUrl: "/assets/icons/hospital_marker.png",
  iconSize: [66, 66],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

const labIcon = new L.Icon({
  iconUrl: "/assets/icons/lab_marker.png",
  iconSize: [60, 60],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

const ResizeMap = () => {
  const map = useMap();
  useEffect(() => {
    setTimeout(() => {
      map.invalidateSize();
    }, 200);
  }, [map]);
  return null;
};


export default function ExploreMapView() {
  const [position, setPosition] = useState<[number, number] | null>(null);
  interface Hospital {
    $id?: string;
    name: string;
    address: string;
    coordinates: [number, number];
    doctorName?: string[];
  }

  interface Lab {
    $id?: string;
    name: string;
    address: string;
    coordinates: [number, number];
    test?: string[];
  }
  
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [labs, setLabs] = useState<Lab[]>([]);
  const [view, setView] = useState<"all" | "hospital" | "lab">("all");
  const mapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition((pos) => {
      setPosition([pos.coords.latitude, pos.coords.longitude]);
    });
  }, []);

  useEffect(() => {
    const fetchAll = async () => {
      const fetchedHospitals = await getAllHospitals();
      const fetchedLabs = await getAllLabs();
      setHospitals(
        fetchedHospitals.map((doc: any) => ({
          $id: doc.$id,
          name: doc.name,
          address: doc.address,
          coordinates: doc.coordinates,
          doctorName: doc.doctorName,
        }))
      );
      setLabs(
        fetchedLabs.map((doc: any) => ({
          $id: doc.$id,
          name: doc.name,
          address: doc.address,
          coordinates: doc.coordinates,
          test: doc.test,
        }))
      );
    };
    fetchAll();
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
      {/* Buttons */}
      <div className="absolute top-4 right-4 z-[1000] flex gap-2">
        <button
          onClick={handleFullscreen}
          className="rounded-full bg-gray-500 p-2 shadow-lg hover:bg-amber-500"
          title="Toggle Fullscreen"
        >
          ⛶
        </button>
        <button
          onClick={() =>
            setView(view === "all" ? "hospital" : view === "hospital" ? "lab" : "all")
          }
          className="rounded-full bg-blue-600 text-white px-4 py-2 shadow-md hover:bg-blue-700"
        >
          Show: {view === "all" ? "Hospitals" : view === "hospital" ? "Labs" : "All"}
        </button>
      </div>

      {position ? (
        <MapContainer
          center={position}
          zoom={16}
          scrollWheelZoom={false}
          className="rounded-2xl"
          style={{ height: "100%", width: "100%" }}
        >
            <ResizeMap /> 
          <TileLayer attribution="&copy; MapTiler" url={tileURL} />

          {/* User marker */}
          <Marker position={position} icon={userIcon}>
            <Popup>Your current location</Popup>
          </Marker>

          {/* Hospitals */}
          {(view === "all" || view === "hospital") &&
            hospitals.map((hospital, i) => (
              <Marker
                key={hospital.$id || i}
                position={hospital.coordinates}
                icon={hospitalIcon}
              >
                <Popup>
                  <strong>{hospital.name}</strong>
                  <p>{hospital.address}</p>
                  {(hospital.doctorName?.length ?? 0) > 0 && (
                    <select className="mt-2 text-sm text-black">
                      {hospital.doctorName?.map((doc: string, j: number) => (
                        <option key={j}>{doc}</option>
                      ))}
                    </select>
                  )}
                </Popup>
              </Marker>
            ))}

          {/* Labs */}
          {(view === "all" || view === "lab") &&
            labs.map((lab, i) => (
              <Marker key={lab.$id || i} position={lab.coordinates} icon={labIcon}>
                <Popup>
                  <strong>{lab.name}</strong>
                  <p>{lab.address}</p>
                  {(lab.test?.length ?? 0) > 0 && (
                    <select className="mt-2 text-sm text-black">
                      {(lab.test ?? []).map((test: string, j: number) => (
                        <option key={j}>{test.replace(/_/g, " ")}</option>
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
