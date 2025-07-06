"use client";

import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import { useEffect, useState, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { getAllHospitals } from "@/lib/actions/hospital.action";
import { getAllLabs } from "@/lib/actions/lab.action";
import Image from "next/image";
import { Models } from "node-appwrite";

type Document = Models.Document;

interface Hospital {
  $id?: string;
  name: string;
  address: string;
  coordinates: [number, number];
  doctorName?: string[];
  logoUrl:string;
}


interface Lab{
    $id : string;
    name : string;
    address : string;
    coordinates: [number, number];
    test?: string[];
    logoUrl:string;
}

const FocusOnSelectedHospital = ({
  selectedHospitalId,
  hospitals,
}: {
  selectedHospitalId?: string;
  hospitals: Hospital[];
}) => {
  const map = useMap();

  useEffect(() => {
    if (selectedHospitalId) {
      const selected = hospitals.find((h) => h.$id === selectedHospitalId);
      if (selected) {
        map.setView(selected.coordinates, 18, { animate: true });
      }
    }
  }, [selectedHospitalId, hospitals, map]);

  return null;
};

const FocusOnSelectedLab = ({
  selectedLabId,
  labs,
}: {
  selectedLabId?: string;
  labs: Lab[];
}) => {
  const map = useMap();

  useEffect(() => {
    if (selectedLabId) {
      const selected = labs.find((l) => l.$id === selectedLabId);
      if (selected) {
        map.setView(selected.coordinates, 18, { animate: true });
      }
    }
  }, [selectedLabId, labs, map]);

  return null;
};


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

interface ExploreMapProps {
  view: "all" | "hospital" | "lab";
  selectedHospitalId?: string;
  userLocation: [number, number] | null;
  selectedLabId?: string;
}

export default function ExploreMap({ view, selectedHospitalId, userLocation , selectedLabId}: ExploreMapProps) {

  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [labs, setLabs] = useState<Lab[]>([]);
  const mapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchAll = async () => {
      const fetchedHospitals = await getAllHospitals();
      const fetchedLabs = await getAllLabs();
      setHospitals(
        fetchedHospitals.map((doc: Document) => ({
          $id: doc.$id,
          name: doc.name as string,
          address: doc.address as string,
          coordinates: doc.coordinates as [number , number],
          doctorName: doc.doctorName as string[],
          logoUrl:doc.logoUrl as string,
        }))
      );
      setLabs(
        fetchedLabs.map((doc: Document) => ({
          $id: doc.$id,
          name: doc.name as string,
          address: doc.address as string,
          coordinates: doc.coordinates as [number , number],
          test: doc.test as string[],
          logoUrl:doc.logoUrl as string,
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
    <button
        onClick={handleFullscreen}
        className="absolute top-4 right-4 z-[1000] cursor-pointer rounded-full bg-gray-500 p-2 shadow-lg hover:bg-amber-500"
        title="Toggle Fullscreen"
      >
        ⛶
      </button>
      {userLocation ? (
        <MapContainer
          center={userLocation}
          zoom={16}
          scrollWheelZoom={false}
          className="rounded-2xl"
          style={{ height: "100%", width: "100%" }}
        >
          <ResizeMap />
          <TileLayer attribution="&copy;ArogyaCompass" url={tileURL} />
             <FocusOnSelectedHospital
                selectedHospitalId={selectedHospitalId}
                hospitals={hospitals}
                    />
             <FocusOnSelectedLab selectedLabId={selectedLabId}
                labs= {labs}
                 />
          {/* User marker */}
          <Marker position={userLocation} icon={userIcon}>
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

          {/* Labs */}
          {(view === "all" || view === "lab") &&
            labs.map((lab, i) => (
              <Marker key={lab.$id || i} position={lab.coordinates} icon={labIcon}>
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
                  {(lab.test?.length ?? 0) > 0 && (
                    <select className="mt-2 text-sm text-black">
                      {(lab.test ?? []).map((test: string, j: number) => (
                        <option key={j}>{test.replace(/_/g, " ")}</option>
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
