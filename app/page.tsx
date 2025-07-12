// "use client";
// import PatientForm from "@/components/form/PatientForm";
// import Image from "next/image";
// import Link from "next/link";
// import dynamic from "next/dynamic";
// import AdminPasskeyLogin from "@/components/adminPassKeyLogin";
// import { useState } from "react";

// const MapView = dynamic(() => import("@/components/MapView"), { ssr: false });

// export default function Home() {
  
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
      // <div className="flex flex-col items-center justify-center -mt-2 mb-3">
      //   <Image
      //     alt="logo"
      //     src="/assets/icons/logo.png"
      //     height={200}
      //     width={200}
      //     className="h-20 sm:h-24 md:h-28 w-auto object-contain"
      //   />
      //   <div className="-mt-1 text-center leading-tight">
      //     <h1 className="text-[1.3rem] font-bold bg-gradient-to-r from-blue-400 via-blue-600 to-blue-400 bg-clip-text text-transparent">
      //       ArogyaCompass
      //     </h1>
      //     <h2 className="text-sm text-blue-500 mt-0.5">
      //       Your Smart Path to Faster Care
      //     </h2>
      //   </div>
      // </div>

//       {/* Headings */}
      // <div className="mb-5">
      //   <h1 className="text-2xl font-bold mb-1 text-left">Hi there...</h1>
      //   <p className="text-base text-dark-600 text-left">
      //     Get started with your appointment journey
      //   </p>
      // </div>

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

//     </section>

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
  Building2,
  // Menu,
} from "lucide-react";
import {
  Hospital,
  ShieldCheck,
  Users,
  Brain,
  Newspaper,
//   Linkedin,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import dynamic from "next/dynamic";
import {  useRef } from "react";
import {PatientForm} from "@/components/form/PatientForm";
import AdminPasskeyLogin from "@/components/adminPassKeyLogin";
import ReviewSection from "@/components/ui/Review";
import { useRouter } from "next/navigation";
// import AboutUs from "@/components/ui/AboutUs";
// Dynamically import MapView to avoid SSR issues with leaflet
const MapView = dynamic(() => import("@/components/MapView"), { ssr: false });

const NAV_ITEMS = [
  { label: "About Us", icon: <Info size={20} /> },
  { label: "Contact", icon: <Phone size={20} /> },
  { label: "Review", icon: <Star size={20} /> },
  { label: "Admin", icon: <Shield size={20} /> },
  { label: "Super Admin", icon: <UserCog size={20} /> },
  { label: "Register" , icon : <Building2 size={20}/>}
];

export default function Page() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [selectedNav, setSelectedNav] = useState<string | null>(null);
  const navContentRef = useRef<HTMLDivElement>(null);
  const [isPatientFormOpen, setIsPatientFormOpen] = useState(false);
  const [showAdminModal, setShowAdminModal] = useState(false);
  const router = useRouter()



  useEffect(() => {
  const handleClickOutside = (event: MouseEvent) => {
    if (
      navContentRef.current &&
      !navContentRef.current.contains(event.target as Node)
    ) {
      setSelectedNav(null); // Clear selection if click is outside
    }
  };

  if (selectedNav) {
    document.addEventListener("mousedown", handleClickOutside);
  }

  return () => {
    document.removeEventListener("mousedown", handleClickOutside);
  };
}, [selectedNav]);


  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsPatientFormOpen(false);
      }
    };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);



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
        {/* <aside
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
        > */}
        <aside
          className={`
            z-50 h-screen 
            ${sidebarOpen ? "w-56" : "w-0"} 
            sm:w-16 
            ${darkMode ? "bg-[#121212] text-white" : "bg-white text-gray-900"} 
            border-r p-2.5 
            flex flex-col justify-between 
            overflow-hidden 
            transition-all duration-300 ease-in-out
            fixed top-0 left-0 sm:relative
          `}
          style={{
            minWidth: sidebarOpen ? "15rem" : "4rem",
            width: sidebarOpen ? "15rem" : "4rem",
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
                width={50}
                height={50}
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
            <nav className="space-y-2 overflow-y-auto max-h-[60vh] pr-0.25">
              {NAV_ITEMS.map((item) => (
                <NavItem
                  key={item.label}
                  icon={item.icon}
                  label={item.label}
                  active={selectedNav === item.label}
                  open={sidebarOpen}
                  onClick={() => {
                      setSelectedNav(item.label);
                      if (window.innerWidth < 640) {
                        setSidebarOpen(false); // Close sidebar on mobile
                      }
                    }}
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
            onClick={() => setIsPatientFormOpen(true)}
          >
            Login
          </button>
          {/* Selected Nav Content */}
          <div className="absolute top-17 left-0 right-0 z-10 px-4 sm:px-10 pointer-events-none">
            <div ref={navContentRef} className={`flex-1 pt-6 sm:pt-10 px-4 sm:px-10 transition-all duration-300 ease-in-out overflow-y-auto ${
            sidebarOpen ? "sm:ml-4 ml-15" : "sm:ml-4 ml-15"
          }`}>
            {selectedNav === "About Us" && (
              // <div className="max-w-lg mx-auto bg-white/80 dark:bg-[#232323]/80 rounded-xl shadow p-6 mb-4 pointer-events-auto">
              // <div className="max-w-lg mx-auto bg-white/80 dark:bg-[#232323]/80 rounded-xl shadow p-6 mb-4 pointer-events-auto">
                
                <div 
                  className="w-full max-w-5xl mx-auto bg-white/80 dark:bg-[#232323]/80 rounded-xl shadow p-6 sm:p-8 mt-0 pointer-events-auto"
                  style={{
                    maxHeight: "80vh",
                    overflowY: "auto",
                    scrollbarWidth: "none",          // Firefox
                    msOverflowStyle: "none",         // IE/Edge
                  }}
                >
                  <style jsx>{`
                    div::-webkit-scrollbar {
                      display: none;
                    }
                  `}</style>
                    {/* Close Button */}
                    {/* <div className="flex justify-end">
                      <button onClick={onClose} className="text-gray-700 dark:text-gray-300 hover:text-red-500">
                        <X className="w-6 h-6" />
                      </button>
                    </div> */}
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
              
                    {/* Heading */}
                    <div className="text-center mb-6">
                      {/* <h2 className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">
                        About ArogyaCompass
                      </h2> */}
                      <p className="text-gray-700 dark:text-gray-300 text-sm sm:text-base leading-relaxed">
                        ArogyaCompass is a modern healthcare platform built to transform the healthcare landscape of India. By streamlining communication between patients and hospitals, it bridges accessibility gaps and powers faster, organized, and reliable care delivery across the country.
                      </p>
                    </div>
              
                    {/* Feature Cards */}
                    <div className="grid sm:grid-cols-2 gap-6">
                      {/* Each Feature */}
                      {[
                        {
                          icon: <ShieldCheck className="w-12 h-14 text-blue-500 dark:text-blue-400" />,
                          title: "Empowering Indian Healthcare",
                          desc: "Bringing digital transformation to every tier of Indian healthcare—from rural PHCs to metropolitan super-specialty hospitals.",
                        },
                        {
                          icon: <Users className="w-12 h-14 text-blue-500 dark:text-blue-400" />,
                          title: "Organizing Patient Journeys",
                          desc: "Helps patients discover, book, navigate, and manage healthcare appointments with ease, reducing wait times and inefficiencies.",
                        },
                        {
                          icon: <Hospital className="w-12 h-14 text-blue-500 dark:text-blue-400" />,
                          title: "Enabling Hospitals to Scale",
                          desc: "With real-time dashboards, staff workflows, verification, and map routing, hospitals can scale operations with clarity and control.",
                        },
                        {
                          icon: <Brain className="w-12 h-14 text-blue-500 dark:text-blue-400" />,
                          title: "Smart Technology, Real Impact",
                          desc: "Integrates AI routing, geolocation, assistant coordination, and digital records—all in a beautifully simple user interface.",
                        },
                      ].map((item, idx) => (
                        <div
                          key={idx}
                          className="flex items-start gap-4 bg-white dark:bg-[#2b2b2b] rounded-xl p-4 border border-gray-200 dark:border-gray-700 shadow-sm"
                        >
                          {item.icon}
                          <div>
                            <h3 className="font-semibold text-base sm:text-lg text-gray-800 dark:text-white">
                              {item.title}
                            </h3>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                              {item.desc}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
              
                    {/* News + Relevance Section */}
                    <div className="mt-10 space-y-4">
                      <h2 className="text-xl font-bold text-blue-600 dark:text-blue-400 flex items-center gap-2">
                        <Newspaper className="w-6 h-6" />
                        Why India Needs ArogyaCompass
                      </h2>
                      <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 text-sm sm:text-base space-y-2">
                        <li>
                          <strong>Rural Disparity:</strong> 70% of India’s population lives in rural areas but 80% of doctors are based in urban zones. ArogyaCompass bridges this divide digitally.
                        </li>
                        <li>
                          <strong>Ayushman Bharat (PMJAY):</strong> With over 50 crore beneficiaries, hospitals need streamlined tech infrastructure to manage universal health coverage.
                        </li>
                        <li>
                          <strong>NEET Admissions Surge:</strong> Record medical seat allocations demand better digital systems for internship, hospital deployment, and assistant coordination.
                        </li>
                        <li>
                          <strong>Time-Sensitive Care:</strong> Delays in appointment booking or finding nearby labs/tests can be fatal. ArogyaCompass maps and routes patients quickly.
                        </li>
                      </ul>
                    </div>
              
                    {/* Founder Section */}
                    <div className="mt-10 border-t border-gray-300 dark:border-gray-600 pt-6">
                      <h2 className="text-xl font-bold text-blue-600 dark:text-blue-400 mb-4">
                        Meet the Founder
                      </h2>

                      <div className="flex flex-col sm:flex-row items-center sm:items-start justify-center sm:justify-between gap-6">
                        {/* Profile Image */}
                        <Image
                          src="/assets/images/aryaman2.jpg"
                          alt="Aryaman"
                          width={120}
                          height={120}
                          className="rounded-full border-2 sm:ml-5 border-blue-400 shadow-md object-cover"
                        />

                        {/* Text Content aligned right */}
                        <div className="text-center sm:text-right sm:flex-1">
                          <h3 className="text-lg font-semibold text-gray-800 dark:text-white">
                            Er. Aryaman
                          </h3>
                          <p className="text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                            Founder & CEO, ArogyaCompass <br />
                            B.Tech CSE, GLA University <br />
                            V Scholar, IIT Gandhinagar
                          </p>

                          <div className="mt-2 space-y-1 sm:space-y-0 sm:space-x-3 sm:flex sm:justify-end">
                            <Link
                              href="https://www.linkedin.com/in/aryaman-ba8765281"
                              target="_blank"
                              className="inline-block text-blue-600 dark:text-blue-400 text-sm hover:underline"
                            >
                              LinkedIn Profile
                            </Link>
                            <Link
                              href="https://www.github.com/Aryamanporwal"
                              target="_blank"
                              className="inline-block text-blue-600 dark:text-blue-400 text-sm hover:underline"
                            >
                              GitHub Profile
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>

                  </div>
                
              //  </div>
            )}
          {selectedNav === "Contact" && (
            <div
              className="w-full max-w-3xl mx-auto bg-white/80 dark:bg-[#232323]/80 rounded-xl shadow p-6 sm:p-8 mt-0 pointer-events-auto"
              style={{
                maxHeight: "80vh",
                overflowY: "auto",
                scrollbarWidth: "none",          // Firefox
                msOverflowStyle: "none",         // IE/Edge
              }}
            >
              <style jsx>{`
                div::-webkit-scrollbar {
                  display: none;
                }
              `}</style>

              {/* Logo */}
              <div className="flex flex-col items-center justify-center mb-5">
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

              {/* Heading */}
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold text-blue-600 dark:text-blue-400 mb-1">
                  Contact Us
                </h2>
                <p className="text-gray-700 dark:text-gray-300 text-sm sm:text-base leading-relaxed">
                  Have questions about hospital or lab registration? Need assistance using our platform? 
                  We’re here to help—just reach out and we’ll get back to you shortly.
                </p>
              </div>

              {/* Contact Form */}
              <form
                action="mailto:aryamanporwal@gmail.com"
                method="POST"
                encType="text/plain"
                className="space-y-5"
              >
                <div>
                  <label className="block text-sm font-medium text-gray-800 dark:text-gray-200 mb-1">
                    Your Name
                  </label>
                  <input
                    type="text"
                    name="Name"
                    required
                    placeholder="Enter your name"
                    className="w-full px-4 py-2 dark:bg-[#252222] dark:text-white rounded-md border border-gray-300 dark:border-gray-600 text-black  placeholder-gray-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium  text-gray-800 dark:text-gray-200 mb-1">
                    Your Email
                  </label>
                  <input
                    type="email"
                    name="Email"
                    required
                    placeholder="example@example.com"
                    className="w-full px-4 py-2 rounded-md dark:text-white border dark:bg-[#252222] border-gray-300 dark:border-gray-600 text-black placeholder-gray-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-800 dark:text-gray-200 mb-1">
                    Message
                  </label>
                  <textarea
                    name="Message"
                    rows={5}
                    required
                    placeholder="Write your message here..."
                    className="w-full px-4 py-2 rounded-md border dark:text-white dark:bg-[#252222] border-gray-300 dark:border-gray-600 text-black placeholder-gray-500 resize-none"
                  ></textarea>
                </div>

                <div className="text-center pt-2">
                  <button
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2 rounded-md shadow"
                  >
                    Send Message
                  </button>
                </div>
              </form>
            </div>
          )}

        {selectedNav === "Review" && (
          <div
            className="w-full max-w-3xl mx-auto bg-white/80 dark:bg-[#232323]/80 rounded-xl shadow p-6 sm:p-8 mt-0 pointer-events-auto"
            style={{
              maxHeight: "80vh",
              overflowY: "auto",
              scrollbarWidth: "none",
              msOverflowStyle: "none",
            }}
          >
            <style jsx>{`
              div::-webkit-scrollbar {
                display: none;
              }
            `}</style>
            <ReviewSection />
          </div>
        )}
            {selectedNav === "Admin" && (
              <div className="max-w-lg mx-auto bg-white/80 dark:bg-[#232323]/80 rounded-xl shadow p-6 mb-4 pointer-events-auto">
                {/* Admin content goes here */}
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
                      
                            <div className="mb-8">
                              <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-left bg-gradient-to-r from-blue-500 via-blue-600 to-blue-400 bg-clip-text text-transparent animate-gradient">
                                Welcome Admin...
                              </h1>
                              <p className="mt-2 text-base sm:text-m text-left text-gray-800 dark:text-gray-300">
                                ArogyaCompass assures your bussiness growth with seamless technology!✨
                              </p>
                            </div>
                            <div className="text-xs mt-3 px-2 flex justify-between text-dark-600">
                          <p>&copy; 2025 ArogyaCompass</p>
                          <button
                              onClick={() => setShowAdminModal(true)}
                              className="text-green-600 hover:underline"
                            >
                              Admin
                            </button>
                          </div>
              </div>
            )}
            {selectedNav === "Super Admin" && (
              <div className="max-w-lg mx-auto bg-white/80 dark:bg-[#232323]/80 rounded-xl shadow p-6 mb-4 pointer-events-auto">
                {/* Admin content goes here */}
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
                      
                            <div className="mb-8">
                              <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight text-left bg-gradient-to-r from-blue-500 via-blue-600 to-blue-400 bg-clip-text text-transparent animate-gradient">
                                Welcome Super Admin...
                              </h1>
                              <p className="mt-2 text-base sm:text-m text-left text-gray-800 dark:text-gray-300">
                                ArogyaCompass Welcomes you to drive into the statics and technicalities!✨
                              </p>
                            </div>
                            <div className="text-xs mt-3 px-2 flex justify-between text-dark-600">
                          <p>&copy; 2025 ArogyaCompass</p>
                          <button
                              onClick={() => setShowAdminModal(true)}
                              className="text-green-600 hover:underline"
                            >
                              Super Admin
                            </button>
                          </div>
              </div>
            )}
            {selectedNav === "Register" && (
                (() => {
                router.push("/hospitalregistration");
                return null; // avoid rendering anything
              })()
            )}
            </div>
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
      {isPatientFormOpen && (
    <div className="fixed inset-0 z-[1100] flex items-center justify-center backdrop-blur-sm ">
      <div className="bg-white  rounded-xl p-6 w-full max-w-md mx-4 shadow-lg relative">
        {/* Close Button */}
        <button
          onClick={() => setIsPatientFormOpen(false)}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-800 dark:hover:text-white"
        >
          ✕
        </button>
  
        {/* Your PatientForm */}
        <PatientForm />
      </div>
    </div>
  )}
        {showAdminModal && (
          <AdminPasskeyLogin
            onClose={() => setShowAdminModal(false)}
          />
        )}
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
