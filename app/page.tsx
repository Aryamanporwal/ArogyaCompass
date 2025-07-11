// "use client";
// import PatientForm from "@/components/form/PatientForm";
// import Image from "next/image";
// import Link from "next/link";
// import dynamic from "next/dynamic";
// import AdminPasskeyLogin from "@/components/adminPassKeyLogin";
// import { useState } from "react";

// const MapView = dynamic(() => import("@/components/MapView"), { ssr: false });

// export default function Home() {
//   const [showAdminModal, setShowAdminModal] = useState(false);
//   //  const searchParams = useSearchParams();
//   // const isAdminMode = searchParams.get("admin") === "true";
// return (
//   <div className="flex flex-col md:flex-row h-screen w-full bg-background text-foreground ">
//     {/* Map Section - first on mobile */}
//     <div className="w-full md:w-3/5 bg-muted px-3 pt-4 md:px-0 md:pt-0 flex items-center justify-center">
//       <div className="w-full h-[350px] sm:h-[400px] md:h-[95%] rounded-2xl shadow-2xl overflow-hidden">
//         <MapView />
//       </div>
//     </div>

//     {/* Form Section */}
//     <section className="w-full md:w-2/5 flex flex-col justify-start px-6 pt-6 pb-4 sm:px-10 md:px-12 lg:px-16 bg-background overflow-y-auto">
//       {/* Logo + Tagline */}
//       <div className="flex flex-col items-center justify-center -mt-2 mb-3">
//         <Image
//           alt="logo"
//           src="/assets/icons/logo.png"
//           height={200}
//           width={200}
//           className="h-20 sm:h-24 md:h-28 w-auto object-contain"
//         />
//         <div className="-mt-1 text-center leading-tight">
//           <h1 className="text-[1.3rem] font-bold bg-gradient-to-r from-blue-400 via-blue-600 to-blue-400 bg-clip-text text-transparent">
//             ArogyaCompass
//           </h1>
//           <h2 className="text-sm text-blue-500 mt-0.5">
//             Your Smart Path to Faster Care
//           </h2>
//         </div>
//       </div>

//       {/* Headings */}
//       <div className="mb-5">
//         <h1 className="text-2xl font-bold mb-1 text-left">Hi there...</h1>
//         <p className="text-base text-dark-600 text-left">
//           Get started with your appointment journey
//         </p>
//       </div>

//       {/* Form Card */}
//       <div className="w-full rounded-xl bg-transparent p-5 shadow-md border border-dark-500">
//         <PatientForm />
//       </div>

//       {/* Register CTA */}
//       <div className="text-sm mt-5 text-dark-600 text-center">
//         Don’t have a hospital account?{" "}
//         <Link
//           href="/hospitalregistration"
//           className="text-green-500 font-medium hover:underline"
//         >
//           Register here
//         </Link>
//       </div>

//       {/* Footer */}
//       <div className="text-xs mt-3 px-2 flex justify-between text-dark-600">
//         <p>&copy; 2025 ArogyaCompass</p>
//         <button
//             onClick={() => setShowAdminModal(true)}
//             className="text-green-600 hover:underline"
//           >
//             Admin
//           </button>
//       </div>
//     </section>
//       {showAdminModal && (
//           <AdminPasskeyLogin
//             onClose={() => setShowAdminModal(false)}
//           />
//         )}
//   </div>
// );

// }

"use client";

import { useEffect, useState } from "react";
import {
  Info,
  Phone,
  Star,
  Shield,
  UserCog,
  Sun,
  Moon,
  // Menu,
} from "lucide-react";
import Image from "next/image";
import dynamic from "next/dynamic";

// Dynamically import MapView to avoid SSR issues with leaflet
const MapView = dynamic(() => import("@/components/MapView"), { ssr: false });

const NAV_ITEMS = [
  { label: "About Us", icon: <Info size={20} /> },
  { label: "Contact", icon: <Phone size={20} /> },
  { label: "Review", icon: <Star size={20} /> },
  { label: "Admin", icon: <Shield size={20} /> },
  { label: "Super Admin", icon: <UserCog size={20} /> },
];

export default function Page() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [selectedNav, setSelectedNav] = useState("About Us");

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
  }, [darkMode]);

  return (
    <div
      className={`relative font-sans transition-colors duration-300 min-h-screen ${
        darkMode ? "bg-[#0a0a0a] text-white" : "bg-gray-100 text-gray-900"
      }`}
    >
      {/* Mobile Sidebar Backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/40 backdrop-blur-sm sm:hidden"
          onClick={() => setSidebarOpen(!sidebarOpen)}
        />
      )}

      <div className="flex h-screen w-full overflow-hidden relative">
        {/* Sidebar */}
        <aside
          className={`
              fixed top-0 left-0 h-full z-50
              ${sidebarOpen ? "w-56" : "w-0"}
              sm:w-16 sm:sticky sm:block
              transition-all duration-300 ease-in-out
              ${darkMode ? "bg-[#121212] text-white" : "bg-white text-gray-900"}
              border-r p-2.5 flex flex-col justify-between overflow-hidden
            `}
          style={{
            minWidth: sidebarOpen ? "14rem" : "4rem",
            width: sidebarOpen ? "14rem" : "4rem",
          }}
        >
          <div>
            <div
              className="flex items-center gap-3 cursor-pointer mb-8"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              <Image
                src="/assets/icons/logo.png"
                alt="Logo"
                width={40}
                height={40}
              />
              <span
                className={`text-lg font-semibold transition-all duration-300 ${
                  sidebarOpen ? "opacity-100" : "opacity-0 w-0"
                }`}
              >
                ArogyaCompass
              </span>
              {/* <span className="ml-auto sm:hidden">
                <Menu size={20} />
              </span> */}
            </div>
            <nav className="space-y-2 overflow-y-auto max-h-[60vh] pr-1">
              {NAV_ITEMS.map((item) => (
                <NavItem
                  key={item.label}
                  icon={item.icon}
                  label={item.label}
                  active={selectedNav === item.label}
                  open={sidebarOpen}
                  onClick={() => setSelectedNav(item.label)}
                />
              ))}
            </nav>
          </div>
          <div className="flex flex-col gap-3 mt-6">
            <button
              className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-white"
              onClick={() => setDarkMode(!darkMode)}
            >
              {darkMode ? <Sun size={18} /> : <Moon size={16} />}
              {sidebarOpen && (
                <span>{darkMode ? "Light Mode" : "Dark Mode"}</span>
              )}
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 flex flex-col relative h-screen">
          {/* Login Button absolutely on map */}
          <button
            className="absolute z-[1000] top-4 right-4  px-5 py-2 rounded-md bg-blue-600 text-white font-semibold shadow hover:bg-blue-700 transition"
            style={{ pointerEvents: "auto" }}
          >
            Login
          </button>
          {/* Selected Nav Content */}
          <div className="absolute top-20 left-0 right-0 z-10 px-4 sm:px-10 pointer-events-none">
            {selectedNav === "About Us" && (
              <div className="max-w-lg mx-auto bg-white/80 dark:bg-[#232323]/80 rounded-xl shadow p-6 mb-4 pointer-events-auto">
                {/* About Us content goes here */}
              </div>
            )}
            {selectedNav === "Contact" && (
              <div className="max-w-lg mx-auto bg-white/80 dark:bg-[#232323]/80 rounded-xl shadow p-6 mb-4 pointer-events-auto">
                {/* Contact content goes here */}
              </div>
            )}
            {selectedNav === "Review" && (
              <div className="max-w-lg mx-auto bg-white/80 dark:bg-[#232323]/80 rounded-xl shadow p-6 mb-4 pointer-events-auto">
                {/* Review content goes here */}
              </div>
            )}
            {selectedNav === "Admin" && (
              <div className="max-w-lg mx-auto bg-white/80 dark:bg-[#232323]/80 rounded-xl shadow p-6 mb-4 pointer-events-auto">
                {/* Admin content goes here */}
              </div>
            )}
            {selectedNav === "Super Admin" && (
              <div className="max-w-lg mx-auto bg-white/80 dark:bg-[#232323]/80 rounded-xl shadow p-6 mb-4 pointer-events-auto">
                {/* Super Admin content goes here */}
              </div>
            )}
          </div>
          {/* Map Section */}
          <div className="flex-1 inset-0 z-0 h-full w-full relative">
            {/* Desktop MapView */}
            <div className="hidden sm:block h-full w-full">
              <MapView />
            </div>

            {/* Mobile MapView */}
            <div
              className={`sm:hidden fixed top-0 transition-all duration-300 h-full ${
                sidebarOpen ? "left-0" : "left-16"
              } right-0 z-0`}
            >
              <MapView />
            </div>
          </div>

        </main>
      </div>
    </div>
  );
}

function NavItem({
  icon,
  label,
  active = false,
  open = true,
  onClick,
}: {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  open?: boolean;
  onClick: () => void;
}) {
  return (
    <div
      onClick={onClick}
      className={`flex items-center gap-3 px-3 py-2 rounded-md cursor-pointer transition-all duration-300 whitespace-nowrap overflow-hidden ${
        active
          ? "bg-gray-200 dark:bg-[#222] text-black dark:text-white font-semibold shadow"
          : "hover:bg-gray-100 dark:hover:bg-[#222] text-gray-600 dark:text-gray-300"
      }`}
    >
      {icon}
      <span
        className={`transition-all duration-300 ${
          open ? "opacity-100 ml-2" : "opacity-0 ml-[-999px]"
        }`}
      >
        {label}
      </span>
    </div>
  );
}
