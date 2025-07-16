"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { getHospitalsWithAppointmentCount } from "@/lib/actions/hospital.action";

// Dynamic Leaflet imports
const MapContainer = dynamic(() => import("react-leaflet").then(mod => mod.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import("react-leaflet").then(mod => mod.TileLayer), { ssr: false });
const Circle = dynamic(() => import("react-leaflet").then(mod => mod.Circle), { ssr: false });
const Popup = dynamic(() => import("react-leaflet").then(mod => mod.Popup), { ssr: false });
const mapTilerKey = process.env.NEXT_PUBLIC_MAPTILER_KEY || "";
// Type definition
type HospitalMapData = {
  name: string;
  address: string;
  coordinates : [number , number]
  appointmentCount: number;
};

export default function HospitalHeatMap() {
  const [data, setData] = useState<HospitalMapData[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      const res = await getHospitalsWithAppointmentCount();
      setData(res as unknown as HospitalMapData[]);
    };
    fetchData();
  }, []);

  return (
    <div className="h-[600px] w-full rounded-xl overflow-hidden shadow-md">
      <MapContainer center={[22.9734, 78.6569]} zoom={5} scrollWheelZoom className="h-full w-full">
        <TileLayer
          url={`https://api.maptiler.com/maps/streets/256/{z}/{x}/{y}.png?key=${mapTilerKey}`}
        />
        {data.map((hospital, idx) => (
          <Circle
            key={idx}
            center={[hospital?.coordinates[0], hospital?.coordinates[1]]}
            radius={hospital.appointmentCount * 100}
            pathOptions={{
              color: "red",
              fillColor: "red",
              fillOpacity: 0.4,
            }}
          >
            <Popup>
              <div>
                <p className="font-semibold">{hospital.name}</p>
                <p>{hospital.address}</p>
                <p>Appointments: {hospital.appointmentCount}</p>
              </div>
            </Popup>
          </Circle>
        ))}
      </MapContainer>
    </div>
  );
}
