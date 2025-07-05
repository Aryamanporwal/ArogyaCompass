"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "leaflet-routing-machine";
import "leaflet-routing-machine/dist/leaflet-routing-machine.css";
import { getAppointmentByUserId } from "@/lib/actions/appointment.action";
import { getHospitalById, getLabById } from "@/lib/actions/payment.action";

interface Props {
  userId: string;
}

function RoutingControl({
  userLocation,
  destination,
}: {
  userLocation: [number, number];
  destination: [number, number];
}) {
  const map = useMap();

  useEffect(() => {
    const control = L.Routing.control({
      waypoints: [
        L.latLng(userLocation[0], userLocation[1]),
        L.latLng(destination[0], destination[1]),
      ],
      routeWhileDragging: false,
      showAlternatives: false,
      fitSelectedRoutes: true,
      lineOptions: {
        styles: [{ color: "blue", weight: 5 }],
      },
      createMarker: () => null,
    }).addTo(map);

    return () => {
      map.removeControl(control);
    };
  }, [map, userLocation, destination]);

  return null;
}

export default function MapDirections({ userId }: Props) {
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [destination, setDestination] = useState<[number, number] | null>(null);

  useEffect(() => {
    navigator.geolocation.getCurrentPosition((pos) => {
      setUserLocation([pos.coords.latitude, pos.coords.longitude]);
    });
  }, []);

  useEffect(() => {
    const fetchDestination = async () => {
      const appointment = await getAppointmentByUserId(userId);
      if (!appointment) return;

      if (appointment.hospitalId) {
        const hospital = await getHospitalById(appointment.hospitalId);
        if (hospital?.coordinates) setDestination(hospital.coordinates);
      } else if (appointment.labId) {
        const lab = await getLabById(appointment.labId);
        if (lab?.coordinates) setDestination(lab.coordinates);
      }
    };

    fetchDestination();
  }, [userId]);

  return userLocation && destination ? (
    <MapContainer
      center={userLocation}
      zoom={14}
      style={{ height: "100vh", width: "100%" }}
    >
      <TileLayer
        url={`https://api.maptiler.com/maps/streets-v2/256/{z}/{x}/{y}.png?key=${process.env.NEXT_PUBLIC_MAPTILER_KEY}`}
        attribution="&copy; ArogyaCompass"
      />
      <RoutingControl userLocation={userLocation} destination={destination} />
    </MapContainer>
  ) : (
    <div className="text-center p-4 text-white">Fetching directions...</div>
  );
}
