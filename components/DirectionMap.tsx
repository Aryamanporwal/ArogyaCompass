"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Polyline } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { getAppointmentByUserId } from "@/lib/actions/appointment.action";
import { getHospitalById, getLabById } from "@/lib/actions/payment.action";
import Image from "next/image";
import { useRouter } from "next/navigation";

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
  const router = useRouter();
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);
  const [destination, setDestination] = useState<[number, number] | null>(null);
  const [route, setRoute] = useState<[number, number][]>([]);
  const [distance, setDistance] = useState<number | null>(null);
  const [duration, setDuration] = useState<number | null>(null);
  const [steps, setSteps] = useState<Step[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isMobileView, setIsMobileView] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobileView(window.innerWidth < 768);
    };
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  function coordsEqual(a: [number, number], b: [number, number]) {
    return a[0] === b[0] && a[1] === b[1];
  }

  useEffect(() => {
    if (!navigator.geolocation) {
      setError("Geolocation not supported.");
      setLoading(false);
      return;
    }
    const watchId = navigator.geolocation.watchPosition(
      (pos) => {
        setUserLocation([pos.coords.latitude, pos.coords.longitude]);
        setLoading(false);
      },
      () => {
        setError("Unable to get location.");
        setLoading(false);
      },
      { enableHighAccuracy: true, maximumAge: 1000, timeout: 5000 }
    );
    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

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
          setError("No destination found.");
        }
      } catch {
        setError("Failed to fetch destination.");
      }
    };
    fetchDestination();
  }, [userId]);

  useEffect(() => {
    const fetchRoute = async () => {
      if (!userLocation || !destination) return;
      if (coordsEqual(userLocation, destination)) {
        setError("You're already at the destination.");
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
        setError("Missing Mapbox token.");
        return;
      }
      const url = `https://api.mapbox.com/directions/v5/mapbox/driving/${startLng},${startLat};${endLng},${endLat}?geometries=geojson&steps=true&access_token=${token}`;
      try {
        const res = await fetch(url);
        const data = await res.json();
        if (data.routes?.[0]?.geometry?.coordinates) {
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
      } catch {
        setError("Route fetch failed.");
      }
    };
    fetchRoute();
  }, [userLocation, destination]);

  const formatDuration = (s: number) =>
    s < 3600 ? `${Math.round(s / 60)} min` : `${Math.floor(s / 3600)} hr ${Math.round((s % 3600) / 60)} min`;

  const formatDistance = (m: number) => (m < 1000 ? `${Math.round(m)} m` : `${(m / 1000).toFixed(1)} km`);

  if (loading) return <div className="text-center p-4 text-white">Fetching your location...</div>;
  if (error) return <div className="text-center p-4 text-red-600 bg-white rounded">{error}</div>;

  return userLocation && destination ? (
    <>
      <div className="flex flex-col md:flex-row h-screen w-full">
        {/* Map Section */}
        <div
          className={`
            ${isFullscreen ? "fixed top-0 left-0 w-full h-screen z-50 rounded-none" : "w-full md:w-3/4 h-[65vh] md:h-full"}
            relative overflow-hidden
            ${!isFullscreen ? "rounded-t-3xl md:rounded-l-3xl" : ""}
            transition-all duration-300 ease-in-out
          `}
        >
          <MapContainer
            center={userLocation}
            zoom={16}
            style={{ height: "100%", width: "100%" }}
            className="z-0"
          >
            <TileLayer
              url={`https://api.maptiler.com/maps/streets-v2/256/{z}/{x}/{y}.png?key=${process.env.NEXT_PUBLIC_MAPTILER_KEY}`}
              attribution="&copy; ArogyaCompass"
            />
            <Marker position={userLocation} icon={userIcon} />
            <Marker position={destination} icon={destinationIcon} />
            {route.length > 0 && <Polyline positions={route} color="blue" />}
          </MapContainer>

          {/* Fullscreen Toggle */}
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="absolute top-4 right-4 bg-white text-black px-4 py-1 rounded-full shadow-md text-sm font-medium z-[1000]"
          >
            {isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
          </button>
        </div>

        {/* Directions Panel */}
        <div
          className={`
            w-full md:w-1/4
            ${isFullscreen ? "hidden" : "block"}
            bg-white text-gray-800 p-6 z-10
            shadow-[0_-4px_20px_rgba(0,0,0,0.15)] flex-shrink-0
            overflow-y-auto
            ${isMobileView ? "fixed bottom-0 left-0 h-[35vh] rounded-t-3xl" : "h-full md:rounded-l-none md:rounded-r-3xl"}
          `}
        >
          <div className="flex flex-col items-center justify-center -mt-2 mb-3">
            <Image
              alt="logo"
              src="/assets/icons/logo.png"
              height={200}
              width={200}
              className="h-20 sm:h-24 md:h-28 w-auto object-contain"
            />
            <div className="-mt-1 text-center leading-tight">
              <h1 className="text-[1.3rem] font-bold bg-gradient-to-r from-blue-400 via-blue-600 to-blue-400 bg-clip-text text-transparent">
                ArogyaCompass
              </h1>
              <h2 className="text-sm text-blue-500 mt-0.5">
                Your Smart Path to Faster Care
              </h2>
            </div>
          </div>

          {distance !== null && duration !== null && (
            <div className="mb-4 text-center">
              <div className="inline-block bg-red-500 text-white px-4 py-1 rounded-full text-sm font-semibold animate-pulse shadow-md">
                ETA: {formatDuration(duration)}
              </div>
              <p className="text-sm text-gray-600 mt-2">
                <span className="font-semibold text-gray-800">Distance:</span> {formatDistance(distance)}
              </p>
            </div>
          )}

          <h3 className="text-lg font-semibold mb-4 border-b border-gray-200 pb-2 text-center">
            Step-by-Step Directions
          </h3>
          <ol className="space-y-4 text-sm max-h-[calc(35vh-150px)] md:max-h-full overflow-y-auto pr-1">
            {steps.map((step, i) => (
              <li key={i} className="flex items-start gap-2">
                <span className="text-blue-600 font-bold">{i + 1}.</span>
                <div>
                  <span className="font-medium text-gray-900">{step.maneuver.instruction}</span>
                  {step.name && (
                    <span className="text-gray-500 italic text-xs ml-1">on {step.name}</span>
                  )}
                  <div className="text-gray-400 text-xs">({formatDistance(step.distance)})</div>
                </div>
              </li>
            ))}
          </ol>

          {steps.length === 0 && (
            <div className="text-gray-500 text-sm text-center mt-4">No directions available.</div>
          )}

          {/* Mobile Skip Button inside Info Panel */}
          {isMobileView && !isFullscreen && (
            <button
              onClick={() => router.push(`/patients/${userId}/appointments`)}
              className="absolute top-3 right-4 bg-blue-500 text-white text-sm px-3 py-1 rounded-full shadow-md z-50"
            >
              Skip
            </button>
          )}
        </div>
      </div>

      {/* Desktop Skip Button */}
      {!isMobileView && (
        <button
          onClick={() => router.push(`/patients/${userId}/appointments`)}
          className="fixed bottom-6 left-6 z-50 bg-blue-600 text-white px-4 py-2 rounded-full shadow-md hover:bg-blue-700"
        >
          Skip
        </button>
      )}
    </>
  ) : (
    <div className="text-center p-4 text-white">Fetching directions...</div>
  );
}
