"use client";

import { MapContainer, TileLayer, Marker, useMap, Popup } from "react-leaflet";
import {
  Search,
  MapPin,
  Hotel,
  FlaskConical,
  X,
  User,
  Bookmark,
  Filter,
  Building2,
  FlaskRound,
} from "lucide-react";
import { useEffect, useState, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { getAllHospitals } from "@/lib/actions/hospital.action";
import { getAllLabs } from "@/lib/actions/lab.action";
import { createAppointment } from "@/lib/actions/appointment.action";
import { getUserIdFromCookie } from "@/lib/actions/user.action";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { Models } from "node-appwrite";
import React from "react";

// Types
type Document = Models.Document;

interface Hospital {
  $id: string;
  name: string;
  address: string;
  coordinates: [number, number];
  doctorName?: string[];
  logoUrl: string;
  city?: string;
  state?: string;
}

interface Lab {
  $id: string;
  name: string;
  address: string;
  coordinates: [number, number];
  test?: string[];
  logoUrl: string;
  city?: string;
  state?: string;
}

// Map icons
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

// Focus helpers
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
      if (selected && selected.coordinates)
        map.setView(selected.coordinates, 18, { animate: true });
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
      if (selected && selected.coordinates)
        map.setView(selected.coordinates, 18, { animate: true });
    }
  }, [selectedLabId, labs, map]);
  return null;
};

const ResizeMap = () => {
  const map = useMap();
  useEffect(() => {
    setTimeout(() => map.invalidateSize(), 200);
  }, [map]);
  return null;
};

export default function ExploreMap() {
  const [hospitals, setHospitals] = useState<Hospital[]>([]);
  const [labs, setLabs] = useState<Lab[]>([]);
  const [filter, setFilter] = useState<"all" | "hospital" | "lab">("all");
  const mapRef = useRef<HTMLDivElement>(null);

  // Geolocation state
  const [userLocation, setUserLocation] = useState<[number, number] | null>(null);

  // For sidebar and filtering
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [search, setSearch] = useState("");
  const [showListSidebar, setShowListSidebar] = useState(false);
  const [selected, setSelected] = useState<Hospital | Lab | null>(null);

  // For selection and appointment
  const [selectedDoctor, setSelectedDoctor] = useState<string>("");
  const [selectedTest, setSelectedTest] = useState<string>("");

  const router = useRouter();

  // Responsive detection
  const [isMobile, setIsMobile] = useState(false);
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 640);
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Animation state for smooth slide up
  const [sidebarVisible, setSidebarVisible] = useState(showListSidebar);
  useEffect(() => {
    if (showListSidebar) setSidebarVisible(true);
    else setTimeout(() => setSidebarVisible(false), 350); // match transition duration
  }, [showListSidebar]);

  // ----- DRAG-TO-CLOSE LOGIC -----
  const [sheetY, setSheetY] = useState(0); // 0 = fully open, >0 = moved down
  const [isDragging, setIsDragging] = useState(false);
  const dragStartY = useRef<number | null>(null);
  const lastSheetY = useRef(0);

  const SHEET_MIN_Y = 0; // fully open (top of sheet)
  const SHEET_MAX_Y = window.innerHeight * 0.4; 


useEffect(() => {
    if (showListSidebar) {
      setSheetY(SHEET_MIN_Y);
      lastSheetY.current = SHEET_MIN_Y;
    }
  }, [showListSidebar]);

  // Touch handlers
  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!isMobile) return;
    setIsDragging(true);
    dragStartY.current = e.touches[0].clientY;
  };

  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!isMobile || !isDragging || dragStartY.current === null) return;
    const delta = e.touches[0].clientY - dragStartY.current;
    let nextY = lastSheetY.current + delta;
    // Prevent dragging above the top or below the screen
    nextY = Math.max(SHEET_MIN_Y, Math.min(nextY, SHEET_MAX_Y));
    setSheetY(nextY);
  };

  const handleTouchEnd = () => {
    if (!isMobile) return;
    setIsDragging(false);
    // If dragged near the bottom, close
    if (sheetY > SHEET_MAX_Y * 0.9) {
      setShowListSidebar(false);
      setSheetY(SHEET_MIN_Y);
      lastSheetY.current = SHEET_MIN_Y;
    } else {
      // Stay at current position
      lastSheetY.current = sheetY;
    }
    dragStartY.current = null;
  };


  // Inline styles for mobile bottom sheet
const mobileSheetStyle: React.CSSProperties = {
  position: "fixed",
  left: 0,
  right: 0,
  bottom: 0,
  display: (selected || sidebarVisible) ? "flex" : "none",
  height: `calc(100vh - ${sheetY}px)`, // Sheet height reduces as you drag down
  background: "#fff",
  borderTopLeftRadius: "1.5rem",
  borderTopRightRadius: "1.5rem",
  boxShadow: "0 -8px 32px 0 rgba(31,38,135,0.18)",
  zIndex: 1002,
  // display: sidebarVisible ? "flex" : "none",
  flexDirection: "column",
  transition: isDragging ? "none" : "height 0.35s cubic-bezier(.4,0,.2,1)",
  overflow: "hidden",
  overscrollBehavior: "contain",
  touchAction: "none",
};


  // Desktop sidebar style (left)
  const desktopSidebarStyle: React.CSSProperties = {
    position: "fixed",
    top: 0,
    left: 0,
    height: "100vh",
    width: 380,
    background: "rgba(255,255,255,0.98)",
    borderTopRightRadius: "1.5rem",
    borderBottomRightRadius: "1.5rem",
    boxShadow: "0 8px 32px 0 rgba(31,38,135,0.18)",
    zIndex: 1002,
    display: (selected || sidebarVisible )? "flex" : "none",
    flexDirection: "column",
    transform: showListSidebar ? "translateX(0%)" : "translateX(-100%)",
    transition: "transform 0.35s cubic-bezier(.4,0,.2,1)",
    overflow: "hidden",
  };

  // Fetch user location on mount
  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords: [number, number] = [
          pos.coords.latitude,
          pos.coords.longitude,
        ];
        setUserLocation(coords);
      },
      (error) => {
        console.log(error)
        setUserLocation([28.6139, 77.209]);
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      }
    );
  }, []);

  // Autofill city/state on mount if userLocation is available
  useEffect(() => {
    if (!userLocation) return;
    const fetchLocation = async () => {
      try {
        const res = await fetch(
          `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${userLocation[0]}&longitude=${userLocation[1]}&localityLanguage=en`
        );
        const data = await res.json();
        setState(data.principalSubdivision || "");
        setCity(data.city || data.locality || "");
      } catch {
        // fallback: do nothing
      }
    };
    fetchLocation();
  }, [userLocation]);

  // Fetch hospitals/labs
  useEffect(() => {
    const fetchAll = async () => {
      const fetchedHospitals = await getAllHospitals();
      const hospitals = fetchedHospitals
        .map((doc: Document) => ({
          $id: doc.$id,
          name: doc.name as string,
          address: doc.address as string,
          coordinates:
            Array.isArray(doc.coordinates) && doc.coordinates.length === 2
              ? (doc.coordinates as [number, number])
              : undefined,
          doctorName: doc.doctorName as string[] | undefined,
          logoUrl: doc.logoUrl as string,
          city: doc.city as string,
          state: doc.state as string,
        }))
        .filter((h) => h.coordinates);

      setHospitals(hospitals as Hospital[]);

      const fetchedLabs = await getAllLabs();
      const labs = fetchedLabs
        .map((doc: Document) => ({
          $id: doc.$id,
          name: doc.name as string,
          address: doc.address as string,
          coordinates:
            Array.isArray(doc.coordinates) && doc.coordinates.length === 2
              ? (doc.coordinates as [number, number])
              : undefined,
          test: doc.test as string[] | undefined,
          logoUrl: doc.logoUrl as string,
          city: doc.city as string,
        }))
        .filter((l) => l.coordinates);

      setLabs(labs as Lab[]);
    };
    fetchAll();
  }, []);

  // Filtering logic
  const filteredHospitals = hospitals.filter(
    (h) =>
      h.name.toLowerCase().includes(search.toLowerCase()) &&
      (city ? h.city?.toLowerCase() === city.toLowerCase() : true) &&
      (state ? h.state?.toLowerCase() === state.toLowerCase() : true)
  );
  const filteredLabs = labs.filter(
    (l) =>
      l.name.toLowerCase().includes(search.toLowerCase()) &&
      (city ? l.city?.toLowerCase() === city.toLowerCase() : true)
  );

  // Open list sidebar when filter is changed to hospital/lab
  useEffect(() => {
    if (filter === "hospital" || filter === "lab") {
      setShowListSidebar(true);
    } else {
      setShowListSidebar(false);
    }
    setSelected(null);
    setSelectedDoctor("");
    setSelectedTest("");
  }, [filter]);

  // Show details sidebar when marker or card is clicked
  const handleMarkerClick = (item: Hospital | Lab) => {
    setSelected(item);
    if (isMobile) {
    setShowListSidebar(false); 
  } else {
    setShowListSidebar(true); 
  }
    setSelectedDoctor("");
    setSelectedTest("");
  };

  const handleFilterClick = (type: "all" | "hospital" | "lab") => {
    setFilter(type);
    if (type === "hospital" || type === "lab") {
      setShowListSidebar(true);
      setSelected(null);
      setSelectedDoctor("");
      setSelectedTest("");
    } else {
      setShowListSidebar(false);
      setSelected(null);
      setSelectedDoctor("");
      setSelectedTest("");
    }
  };

  const handleHospitalSelect = (id: string) => {
    const hospital = hospitals.find(h => h.$id === id);
    setSelectedDoctor("");
    setSelectedTest("");
    if(hospital) setSelected(hospital)
  };
  const handleLabSelect = (id: string) => {
    const lab = labs.find(l => l.$id === id);
    setSelectedDoctor("");
    setSelectedTest("");
    if (lab) setSelected(lab);
  };

  // Continue logic
  const handleContinue = async ({
    hospitalId,
    doctorName,
    labId,
    test,
    city,
    state,
  }: {
    hospitalId?: string;
    doctorName?: string;
    labId?: string;
    test?: string;
    city: string;
    state: string;
  }) => {
    try {
      if (hospitalId && doctorName) {
        await createAppointment({
          hospitalId,
          doctorName,
          city,
          state,
        });
      } else if (labId && test) {
        await createAppointment({
          labId,
          test,
          city,
          state,
        });
      }
      const userId = await getUserIdFromCookie();
      if (!userId) {
        alert("Not logged in.");
        return;
      }
      router.push(`/patients/${userId}/pdetails`);
    } catch {
      alert("❌ Failed to create appointment");
    }
  };

  const mapTilerKey = process.env.NEXT_PUBLIC_MAPTILER_KEY;
  const tileURL = `https://api.maptiler.com/maps/streets-v2/256/{z}/{x}/{y}.png?key=${mapTilerKey}`;

  return (
    <div ref={mapRef} className="relative h-full w-full bg-gray-100 text-gray-900">
      {/* Filter Buttons */}
      <div className="absolute z-[1001] top-4 left-4 flex gap-2">
        {[
          { type: "all", icon: <Filter size={16} /> },
          { type: "hospital", icon: <Building2 size={16} /> },
          { type: "lab", icon: <FlaskRound size={16} /> },
        ].map(({ type, icon }) => (
          <button
            key={type}
            onClick={() => handleFilterClick(type as "all" | "hospital" | "lab")}
            className={`flex items-center gap-1 px-6 py-1 rounded-full font-semibold shadow border border-gray-200 transition
              ${filter === type
                ? "bg-blue-600 text-white"
                : "bg-white text-black hover:bg-blue-50"
              }`}
            type="button"
          >
            {icon}
            {type.charAt(0).toUpperCase() + type.slice(1)}
          </button>
        ))}
      </div>

      {/* Fullscreen Button */}
      <button
        onClick={() => mapRef.current?.requestFullscreen()}
        className="absolute top-4 right-4 z-[1001] cursor-pointer rounded-full bg-gray-500 p-2 shadow-lg hover:bg-amber-500 transition"
        type="button"
        aria-label="Fullscreen"
      >
        ⛶
      </button>

      {/* Map */}
      {!isMobile || !showListSidebar ? (
        userLocation ? (
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
              selectedHospitalId={
                selected && "doctorName" in selected ? selected.$id : undefined
              }
              hospitals={hospitals}
            />
            <FocusOnSelectedLab
              selectedLabId={selected && "test" in selected ? selected.$id : undefined}
              labs={labs}
            />
            <Marker position={userLocation} icon={userIcon}>
              <Popup>Your current location</Popup>
            </Marker>
            {(filter === "all" || filter === "hospital") &&
              filteredHospitals.map((hospital) => (
                <Marker
                  key={hospital.$id}
                  position={hospital.coordinates!}
                  icon={hospitalIcon}
                  eventHandlers={{
                    click: () => handleMarkerClick(hospital),
                  }}
                >
                  <Popup>{hospital.name}</Popup>
                </Marker>
              ))}
            {(filter === "all" || filter === "lab") &&
              filteredLabs.map((lab) => (
                <Marker
                  key={lab.$id}
                  position={lab.coordinates!}
                  icon={labIcon}
                  eventHandlers={{
                    click: () => handleMarkerClick(lab),
                  }}
                >
                  <Popup>{lab.name}</Popup>
                </Marker>
              ))}
          </MapContainer>
        ) : (
          <div className="flex h-full w-full items-center justify-center text-gray-500">
            Loading map...
          </div>
        )
      ) : null}

      {/* List Sidebar */}
      {(sidebarVisible || showListSidebar) && (
        <div
          style={isMobile ? mobileSheetStyle : desktopSidebarStyle}
          className="backdrop-blur-xl"
          onTouchStart={isMobile ? handleTouchStart : undefined}
          onTouchMove={isMobile ? handleTouchMove : undefined}
          onTouchEnd={isMobile ? handleTouchEnd : undefined}
        >
          {/* Drag Handle for mobile */}
          {isMobile && (
            <div
              style={{
                width: 40,
                height: 6,
                borderRadius: 3,
                background: "#ccc",
                margin: "12px auto 8px auto",
              }}
            />
          )}
          {/* Header */}
          <div className="p-6 border-b border-gray-200 flex flex-col gap-4 relative rounded-t-2xl bg-transparent">
            <div className="flex gap-3 items-center">
              <span className="text-gray-400">
                <Search size={18} />
              </span>
              <input
                type="text"
                placeholder="Search hospital or lab"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="bg-white/80 px-4 py-3 rounded-lg w-full border border-gray-200 focus:ring-2 focus:ring-blue-400 outline-none transition shadow"
              />
            </div>
            <div className="flex gap-3">
              <input
                type="text"
                placeholder={state || "State"}
                value={state}
                onFocus={async () => {
                  if (!state && userLocation) {
                    try {
                      const res = await fetch(
                        `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${userLocation[0]}&longitude=${userLocation[1]}&localityLanguage=en`
                      );
                      const data = await res.json();
                      setState(data.principalSubdivision || "");
                    } catch {}
                  }
                }}
                onChange={(e) => setState(e.target.value)}
                className="bg-white/80 px-4 py-3 rounded-lg w-full border border-gray-200 focus:ring-2 focus:ring-blue-400 outline-none transition shadow"
              />
              <input
                type="text"
                placeholder={city || "City"}
                value={city}
                onFocus={async () => {
                  if (!city && userLocation) {
                    try {
                      const res = await fetch(
                        `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${userLocation[0]}&longitude=${userLocation[1]}&localityLanguage=en`
                      );
                      const data = await res.json();
                      setCity(data.city || data.locality || "");
                    } catch {}
                  }
                }}
                onChange={(e) => setCity(e.target.value)}
                className="bg-white/80 px-4 py-3 rounded-lg w-full border border-gray-200 focus:ring-2 focus:ring-blue-400 outline-none transition shadow"
              />
            </div>
            <button
              onClick={() => setShowListSidebar(false)}
              className="absolute top-6 right-6 bg-black/60 hover:bg-black/80 rounded-full p-2 transition-colors"
              aria-label="Close"
              type="button"
            >
              <X className="w-5 h-5 text-white" />
            </button>
          </div>
          {/* Content */}
          <div
            className="p-6 space-y-6 flex-1"
            style={{
              overflowY: "auto",
              minHeight: 0,
              WebkitOverflowScrolling: "touch",
            }}
          >
            <h2 className="text-2xl font-bold mb-4">
              {filter === "hospital" ? "Hospitals" : "Labs"} in {city || "your area"}
            </h2>
            {(filter === "hospital" ? filteredHospitals : filteredLabs).length === 0 && (
              <div className="text-gray-400 text-center py-10">No results found.</div>
            )}
            {(filter === "hospital" ? filteredHospitals : filteredLabs).map((item) => (
              <div
                key={item.$id}
                className="flex items-center gap-4 p-4 mb-4 bg-white/95 rounded-xl shadow border border-gray-100 hover:shadow-lg hover:border-blue-400 transition cursor-pointer group"
                onClick={() =>
                  filter === "hospital"
                    ? handleHospitalSelect(item.$id)
                    : handleLabSelect(item.$id)
                }
              >
                {item.logoUrl && (
                  <Image
                    src={item.logoUrl}
                    alt="logo"
                    width={56}
                    height={56}
                    className="object-cover rounded-lg w-14 h-14 border border-gray-200 shadow"
                  />
                )}
                <div className="flex flex-col flex-1">
                  <h3 className="text-base font-semibold flex items-center gap-2 group-hover:text-blue-600 transition">
                    {filter === "hospital" ? (
                      <Hotel className="w-5 h-5 text-blue-500" />
                    ) : (
                      <FlaskConical className="w-5 h-5 text-green-500" />
                    )}
                    {item.name}
                  </h3>
                  <span className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                    <MapPin className="w-4 h-4" /> {item.address}
                  </span>
                  <span className="text-xs text-gray-400 mt-0.5">
                    {item.city}
                    {("state" in item && item.state) ? `, ${item.state}` : ""}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Details Sidebar */}
      {selected && (
        <div
          style={isMobile ? mobileSheetStyle : desktopSidebarStyle}
          className="backdrop-blur-xl"
          onTouchStart={isMobile ? handleTouchStart : undefined}
          onTouchMove={isMobile ? handleTouchMove : undefined}
          onTouchEnd={isMobile ? handleTouchEnd : undefined}
        >
          {/* Drag Handle for mobile */}
          {isMobile && (
            <div
              style={{
                width: 40,
                height: 6,
                borderRadius: 3,
                background: "#ccc",
                margin: "12px auto 8px auto",
              }}
            />
          )}
          {/* Header with image */}
          <div className="relative">
            {selected.logoUrl && (
              <Image
                src={selected.logoUrl}
                alt="logo"
                width={384}
                height={180}
                className="object-cover w-full h-48 rounded-t-2xl"
              />
            )}
            <button
              onClick={() => setSelected(null)}
              className="absolute top-4 right-4 bg-black/60 hover:bg-black/80 rounded-full p-2 transition-colors"
              aria-label="Close"
              type="button"
            >
              <X className="w-5 h-5 text-white" />
            </button>
          </div>
          {/* Main content */}
          <div
            className="p-6 space-y-4 flex-1"
            style={{
              overflowY: "auto",
              minHeight: 0,
              WebkitOverflowScrolling: "touch",
            }}
          >
            <h2 className="text-2xl font-bold flex items-center gap-2 mb-2">
              {"doctorName" in selected ? (
                <Hotel className="w-6 h-6 text-blue-500" />
              ) : (
                <FlaskConical className="w-6 h-6 text-green-500" />
              )}
              {selected.name}
            </h2>
            <p className="flex items-center gap-2 text-sm text-gray-500 mb-2">
              <MapPin className="w-4 h-4" />
              {selected.address}
            </p>

            {/* Doctor selection for hospitals */}
            {"doctorName" in selected && selected.doctorName && (
              <div>
                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Doctors
                </span>
                <div className="flex flex-wrap gap-2 mt-2">
                  {selected.doctorName.map((doc) => (
                    <button
                      key={doc}
                      onClick={() => setSelectedDoctor(doc)}
                      className={`px-4 py-2 rounded-full text-xs font-medium border transition ${
                        selectedDoctor === doc
                          ? "bg-blue-600 text-white border-blue-600"
                          : "bg-blue-50 text-blue-700 border-blue-200"
                      } hover:bg-blue-500 hover:text-white`}
                      type="button"
                    >
                      <User className="w-4 h-4 inline-block mr-1" /> {doc}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Test selection for labs */}
            {"test" in selected && selected.test && (
              <div>
                <span className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Tests
                </span>
                <div className="flex flex-wrap gap-2 mt-2">
                  {selected.test.map((test) => (
                    <button
                      key={test}
                      onClick={() => setSelectedTest(test)}
                      className={`px-4 py-2 rounded-full text-xs font-medium border transition ${
                        selectedTest === test
                          ? "bg-green-600 text-white border-green-600"
                          : "bg-green-50 text-green-700 border-green-200"
                      } hover:bg-green-500 hover:text-white`}
                      type="button"
                    >
                      <FlaskConical className="w-4 h-4 inline-block mr-1" /> {test}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Continue Button */}
            <button
              className={`mt-4 px-5 py-3 rounded-full w-full font-semibold text-lg shadow transition ${
                "doctorName" in selected
                  ? selectedDoctor
                    ? "bg-blue-600 text-white hover:bg-blue-700"
                    : "bg-blue-300 text-white opacity-60 cursor-not-allowed"
                  : selectedTest
                  ? "bg-green-600 text-white hover:bg-green-700"
                  : "bg-green-300 text-white opacity-60 cursor-not-allowed"
              }`}
              disabled={
                ("doctorName" in selected && !selectedDoctor) ||
                ("test" in selected && !selectedTest)
              }
              type="button"
              onClick={() => {
                if ("doctorName" in selected && selectedDoctor) {
                  handleContinue({
                    hospitalId: selected.$id,
                    doctorName: selectedDoctor,
                    city,
                    state,
                  });
                } else if ("test" in selected && selectedTest) {
                  handleContinue({
                    labId: selected.$id,
                    test: selectedTest,
                    city,
                    state,
                  });
                }
              }}
            >
              Continue
            </button>

            {/* Action Buttons */}
            <div className="flex gap-3 mt-4">
              <button className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white rounded-full px-4 py-2 text-sm font-medium shadow hover:bg-blue-700 transition-colors" type="button">
                <MapPin className="w-4 h-4" />
                Directions
              </button>
              <button className="flex-1 flex items-center justify-center gap-2 bg-gray-200 rounded-full px-4 py-2 text-sm font-medium shadow hover:bg-gray-300 transition-colors" type="button">
                <Bookmark className="w-4 h-4" />
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
