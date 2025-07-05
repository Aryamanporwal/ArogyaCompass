"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Polyline } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { getAppointmentByUserId } from "@/lib/actions/appointment.action";
import { getHospitalById, getLabById } from "@/lib/actions/payment.action";

// Custom marker icons
const userIcon = L.icon({
  iconUrl: "/assets/icons/location.png",
  iconSize: [44, 44],
  iconAnchor: [22, 44],
  popupAnchor: [0, -44],
});

const destinationIcon = L.icon({
  iconUrl: "/assets/icons/lab_marker.png",
  iconSize: [44, 44],
  iconAnchor: [22, 44],
  popupAnchor: [0, -44],
});

interface Props {
  userId: string;
}

interface Step {
  maneuver: {
    instruction: string;
  };
  name: string;
  distance: number;
}

export default function MapDirections({ userId }: Props) {
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [destination, setDestination] = useState<[number, number] | null>(null);
  const [route, setRoute] = useState<[number, number][]>([]);
  const [distance, setDistance] = useState<number | null>(null);
  const [duration, setDuration] = useState<number | null>(null);
  const [steps, setSteps] = useState<Step[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Helper: Compare coordinates
  function coordsEqual(a: [number, number], b: [number, number]) {
    return a[0] === b[0] && a[1] === b[1];
  }

  // Get user's current location
    useEffect(() => {
      if (!navigator.geolocation) {
        setError("Geolocation is not supported.");
        setLoading(false);
        return;
      }
      const watchId = navigator.geolocation.watchPosition(
        (pos) => {
          setUserLocation([pos.coords.latitude, pos.coords.longitude]);
          setLoading(false);
        },
        () => {
          setError("Unable to get your location.");
          setLoading(false);
        },
        {
          enableHighAccuracy: true,
          maximumAge: 1000,
          timeout: 5000,
        }
      );
      return () => navigator.geolocation.clearWatch(watchId);
    }, []);


  // Fetch destination from appointment
  useEffect(() => {
    const fetchDestination = async () => {
      try {
        const appointment = await getAppointmentByUserId(userId);
        if (!appointment) {
          setError("No appointment found.");
          return;
        }
        if (appointment.hospitalId) {
          const hospital = await getHospitalById(appointment.hospitalId);
          if (hospital?.coordinates) setDestination(hospital.coordinates);
        } else if (appointment.labId) {
          const lab = await getLabById(appointment.labId);
          if (lab?.coordinates) setDestination(lab.coordinates);
        } else {
          setError("No destination found for appointment.");
        }
      } catch {
        setError("Error fetching destination.");
      }
    };
    fetchDestination();
  }, [userId]);

  // Fetch route from Mapbox Directions API
  useEffect(() => {
    const fetchRoute = async () => {
      if (!userLocation || !destination) return;
      if (coordsEqual(userLocation, destination)) {
        setError("You are already at the destination.");
        setRoute([]);
        setDistance(0);
        setDuration(0);
        setSteps([]);
        return;
      }
      const [startLat, startLng] = userLocation;
      const [endLat, endLng] = destination;
      const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
      if (!token) {
        setError("Mapbox token not set.");
        return;
      }
      const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${startLng},${startLat};${endLng},${endLat}?geometries=geojson&steps=true&access_token=${token}`;
      try {
        const res = await fetch(url);
        const data = await res.json();
        if (
          data.routes &&
          data.routes[0] &&
          data.routes[0].geometry &&
          data.routes[0].geometry.coordinates
        ) {
          const coords = data.routes[0].geometry.coordinates.map(
            ([lng, lat]: [number, number]) => [lat, lng]
          );
          setRoute(coords);
          setDistance(data.routes[0].distance);
          setDuration(data.routes[0].duration);
          setSteps(data.routes[0].legs[0]?.steps || []);
        } else {
          setError("No route found.");
        }
      } catch  {
        setError("Failed to fetch route.");
      }
    };
    fetchRoute();
  }, [userLocation, destination]);

  // Format helpers
  function formatDuration(seconds: number) {
    const minutes = Math.round(seconds / 60);
    if (minutes < 60) return `${minutes} min`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours} hr ${mins} min`;
  }

  function formatDistance(meters: number) {
    if (meters < 1000) return `${Math.round(meters)} m`;
    return `${(meters / 1000).toFixed(1)} km`;
  }

  // UI
  if (loading)
    return (
      <div className="text-center p-4 text-white">Fetching your location...</div>
    );
  if (error)
    return (
      <div className="text-center p-4 text-red-600 bg-white rounded">{error}</div>
    );

  return userLocation && destination ? (
    <div className="flex flex-col md:flex-row h-full w-full">
      {/* Map Section */}
      <div className="w-full md:w-3/4 h-[65vh] md:h-screen">
        <MapContainer
          center={userLocation}
          zoom={16}
          style={{ height: "100%", width: "100%" }}
        >
          <TileLayer
            url={`https://api.maptiler.com/maps/streets-v2/256/{z}/{x}/{y}.png?key=${process.env.NEXT_PUBLIC_MAPTILER_KEY}`}
            attribution="&copy; ArogyaCompass"
          />
          <Marker position={userLocation} icon={userIcon} />
          <Marker position={destination} icon={destinationIcon} />
          {route.length > 0 && <Polyline positions={route} color="blue" />}
        </MapContainer>
      </div>

      {/* Directions Bar */}
      <div
        className={`
          w-full md:w-1/4
          md:h-screen
          flex flex-col
          justify-start
          items-center
          bg-[#181e2a]
          md:rounded-none
          rounded-t-3xl
          p-4
          md:fixed md:right-0 md:top-0
          
          z-10
          ${steps.length === 0 ? "justify-center" : ""}
          ${steps.length === 0 ? "items-center" : ""}
          md:shadow-none shadow-lg
          md:mt-0 mt-[-2rem]
        `}
        style={{
          minHeight: "35vh",
          boxShadow:
            "0px -4px 20px 0px rgba(0,0,0,0.15)",
        }}
      >
        {/* Blinking Red ETA Alert */}
        {distance !== null && duration !== null && (
          <div className="flex flex-col items-center w-full mb-4">
            <div className="flex items-center justify-center">
              <span className="animate-pulse bg-red-600 text-white px-4 py-2 rounded-full font-bold text-lg shadow-lg mb-2">
                ETA: {formatDuration(duration)}
              </span>
            </div>
            <div className="text-white text-sm mb-2">
              <span className="font-semibold">Distance:</span> {formatDistance(distance)}
            </div>
          </div>
        )}

        {/* Turn-by-turn directions */}
        <div className="overflow-y-auto w-full px-2">
          <h3 className="text-white font-bold mb-2 text-lg">Directions</h3>
          {steps.length > 0 ? (
            <ol className="list-decimal list-inside space-y-2">
              {steps.map((step, i) => (
                <li key={i} className="text-white text-base">
                  {step.maneuver.instruction}
                  {step.name && step.name !== "" && (
                    <span className="text-gray-400"> on {step.name}</span>
                  )}
                  <span className="ml-2 text-gray-500 text-xs">
                    ({formatDistance(step.distance)})
                  </span>
                </li>
              ))}
            </ol>
          ) : (
            <div className="text-gray-300 text-center">No directions available.</div>
          )}
        </div>
      </div>
    </div>
  ) : (
    <div className="text-center p-4 text-white">Fetching directions...</div>
  );
}
