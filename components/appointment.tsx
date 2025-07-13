"use client";
import {
  CalendarDays,
  Search,
  LogOut,
  Settings,
  Home,
  ClipboardList,
  Sun,
  Moon,
  Clock,
  CalendarX,
  FileText,
  AlertCircle,
  HeartPulse,
  CalendarPlus,
} from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
// import { Models } from "node-appwrite";
// import { handleResetPasskey } from "@/lib/actions/lab.action";
import { useRouter } from "next/navigation";
// import { Button } from "./ui/button";

// interface PageProps {
//   params: {
//     patientId: string;
//   };
// }
// { params }: PageProps

export default function PatientDashboard() {
   const [sidebarOpen, setSidebarOpen] = useState(false);
   const [darkMode, setDarkMode] = useState(false);
   const [selectedNav, setSelectedNav] = useState("Dashboard");
//    const [loading, setLoading] = useState(false);
   const router = useRouter();

    const handleSignOut = () => {
        router.push("/"); 
    };

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
  }, [darkMode]);

  return (
    <div
      className={`relative font-sans transition-colors duration-300 min-h-screen ${
        darkMode ? "bg-[#0a0a0a] text-white" : "bg-gray-100 text-gray-900"
      }`}
    >
      {/* Backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-10 bg-transparent backdrop-blur-sm bg-opacity-40 sm:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Layout Container */}
      <div className="flex h-screen w-full overflow-hidden">
        {/* Sidebar */}
        <aside
          className={`fixed sm:sticky top-0 left-0 z-20 ${
            sidebarOpen ? "w-64" : "w-16"
          } h-full sm:h-screen ${
            darkMode ? "bg-[#121212] text-white" : "bg-white text-gray-900"
          } border-r p-2.5 flex flex-col justify-between transition-all duration-300 ease-in-out`}
        >
          <div>
            <div
              className="flex items-center gap-3 cursor-pointer mb-10"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              <Image
                src="/assets/icons/logo.png"
                alt="Lab"
                width={50}
                height={50}
              />
              <span
                className={`text-xl font-semibold transition-all duration-300 ${
                  sidebarOpen ? "opacity-100" : "opacity-0 w-0"
                }`}
              >
                ArogyaCompass
              </span>
            </div>
            <nav className="space-y-6">
              <NavItem
                icon={<Home size={20} />}
                label="Dashboard"
                active={selectedNav === "Dashboard"}
                open={sidebarOpen}
                onClick={() => setSelectedNav("Dashboard")}
              />
              <NavItem
                icon={<ClipboardList size={20} />}
                label="Appointments"
                active={selectedNav === "Appointments"}
                open={sidebarOpen}
                onClick={() => setSelectedNav("Appointments")}
              />
                <NavItem
                icon={<CalendarX size={20} />}
                label="Cancel Appointment"
                active={selectedNav === "Cancel_Appointment"}
                open={sidebarOpen}
                onClick={() => setSelectedNav("Cancel_Appointment")}
                />

                <NavItem
                icon={<FileText size={20} />}
                label="Medical Records"
                active={selectedNav === "Medical_Records"}
                open={sidebarOpen}
                onClick={() => setSelectedNav("Medical_Records")}
                />

                <NavItem
                icon={<AlertCircle size={20} />}
                label="Report Problem"
                active={selectedNav === "Report_Problem"}
                open={sidebarOpen}
                onClick={() => setSelectedNav("Report_Problem")}
                />

                <NavItem
                icon={<HeartPulse size={20} />}
                label="First Aid"
                active={selectedNav === "First_Aid"}
                open={sidebarOpen}
                onClick={() => setSelectedNav("First_Aid")}
                />

                <NavItem
                icon={<CalendarPlus size={20} />}
                label="Book Appointment"
                active={selectedNav === "Book_Appointment"}
                open={sidebarOpen}
                onClick={() => setSelectedNav("Book_Appointment")}
                />

              <NavItem
                icon={<Settings size={20} />}
                label="Settings"
                active={selectedNav === "Settings"}
                open={sidebarOpen}
                onClick={() => setSelectedNav("Settings")}
              />

            </nav>
          </div>
          <div className="flex flex-col gap-3">
            <button
              className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-white"
              onClick={() => setDarkMode(!darkMode)}
            >
              {darkMode ? <Sun size={16} /> : <Moon size={16} />}
              {sidebarOpen && <span>{darkMode ? "Light Mode" : "Dark Mode"}</span>}
            </button>
            <button className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-white"
             onClick = {handleSignOut}>
              <LogOut size={16} />
              {sidebarOpen && <span>Sign out</span>}
            </button>
          </div>
        </aside>
{/* 
            <h1 className="text-2xl font-semibold">
              Welcome, Dr. {doctor ? doctor.Name : "Loading..."}
            </h1> */}
        <main
          className={`flex-1 pt-6 sm:pt-10 px-4 sm:px-10 transition-all duration-300 ease-in-out overflow-y-auto ${
            sidebarOpen ? "sm:ml-4 ml-15" : "sm:ml-4 ml-15"
          }`}
        >
        {selectedNav === "Dashboard" && (
            <>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            <div className="flex flex-col gap-1 mb-4">
            <h1 className="text-2xl font-semibold">Welcome, Aryaman</h1>
            <h2 className="text-lg font-medium flex items-center gap-3 mt-1 text-black dark:text-gray-300">
            <span className="flex items-center gap-1">
                <CalendarDays size={18} className="text-blue-600 dark:text-blue-400" />
                {new Date().toLocaleDateString("en-IN", {
                year: "numeric",
                month: "long",
                day: "numeric",
                })}
            </span>

            <span className="flex items-center gap-1">
                <Clock size={18} className="text-blue-600 dark:text-blue-400" />
                {new Date().toLocaleTimeString("en-IN", {
                hour: "2-digit",
                minute: "2-digit",
                })}
            </span>
            </h2>
            </div>
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
                <input
                  type="text"
                  placeholder="Search"
                  className="pl-9 pr-3 py-2 rounded-md border border-gray-300 text-sm dark:bg-[#121212] dark:border-gray-600 dark:text-white"
                />
              </div>


            <div className="h-12 w-12 rounded-full overflow-hidden border-2 border-gray-500 shadow-lg">
              {/* ------- */}
              <Image
                src={"/assets/images/dr-cameron.png"}
                alt="Lab"
                className="border w-full h-full object-cover"
                width={18}
                height={18}
              />
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
            {/* <StatCard
              icon={<CalendarDays size={24} className="text-blue-600" />}
              title="Upcoming Appointments"
              value={pendingCount}
            />
            <StatCard
              icon={<Users size={24} className="text-green-600" />}
              title="Total Patients"
              value={totalCount}
            />
            <StatCard
              icon={<PlusSquare size={24} className="text-indigo-600" />}
              title="Assistants on duty"
              value={assistants?.length || 0}
            />
          </div> */}

          {/* Appointments & Patients */}
          {/* <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pb-10">
            {/* Appointments Section */}
            {/* <div className="bg-white dark:bg-[#1e1e1e] p-6 rounded-xl shadow-md">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Appointments</h3>
              </div>
             <ul className="space-y-4">
                {(showAllAppointments ? appointmentPatientList : appointmentPatientList.slice(0, 5)).map(
                    ({ appointment, patient }, index) => (
                    <li
                        key={index}
                        className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0 px-4 py-3 rounded-lg border dark:border-gray-700 bg-gray-100 dark:bg-[#2b2b2b] hover:shadow transition-all"
                        >
                        <div>
                            <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
                            <span className="text-gray-500 mr-2 dark:text-gray-400">
                                {new Date(appointment.timestamp).toLocaleString()}
                            </span>
                            {patient?.name || "Unknown Patient"}
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{appointment.city}</p>
                        </div>
                        <button
                                onClick={() => {
                                    setSelectedNav("Appointments");
                                    setSelectedPatientId(appointment.userId); 
                                    setSelectedAppointmentId(appointment.$id);// This maps to patient.userId
                                }}
                            className="px-4 py-2 text-sm text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
                        >
                            Review
                        </button>
                    </li>

                    )
                )}
                </ul>
                <button
                className="mt-4 text-blue-600 text-sm hover:underline"
                onClick={() => setShowAllAppointments(!showAllAppointments)}
                >
                {showAllAppointments ? "Show less" : "View all"}
                </button>
            </div> */}

            {/* Patients Section */}
            {/* <div className="bg-white dark:bg-[#1e1e1e] p-6 rounded-xl shadow-md">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold">Patient List</h3>
              </div>
              <div className="relative mb-4">
                <Search className="absolute left-2.5 top-2.5 text-gray-400" size={16} />
                <input
                  type="text"
                  placeholder="Search patients"
                  className="pl-8 pr-3 py-1.5 rounded-md border border-gray-300 text-sm dark:bg-[#121212] dark:border-gray-600 dark:text-white"
                />
              </div>
                <ul className="space-y-2">
                {(showAllPatients
                    ? appointmentPatientList
                    : appointmentPatientList.slice(0, 5)
                ).map(({ patient }, index) => (
                    <li
                    key={index}
                    className="flex justify-between text-sm text-gray-800 dark:text-gray-200"
                    >
                    <span>{patient?.name || "Unknown"}</span>
                    <span className="text-blue-500">{patient?.gender || "N/A"}</span>
                    </li>
                ))}
                </ul>
                <button
                    className="mt-4 text-blue-600 text-sm hover:underline"
                    onClick={() => setShowAllPatients(!showAllPatients)}
                    >
                    {showAllPatients ? "Show less" : "View all"}
                </button>
            </div> */}
          </div> 
          </>
          )}


        {selectedNav === "Appointments" && (
            <></>
            )}
        {selectedNav === "Cancel_Appointment" && (
            <></> 
            )}
        {selectedNav === "Medical_Records" && (
            <></>
        )}
        {selectedNav === "Report_Problem" && (
            <></>
        )}
        {selectedNav === "First_Aid" && (
            <></>
        )}
        {selectedNav === "Settings" && (
         <></>
        )}
            </main>
        </div>
    </div>

  );
}

const NavItem = ({
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
}) => (
  <div
    onClick={onClick}
    className={`flex items-center gap-3 px-3 py-2 rounded-md cursor-pointer transition-all duration-300 whitespace-nowrap overflow-hidden ${
      active
        ? "bg-gray-200 dark:bg-[#222] text-black dark:text-white"
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


// const StatCard = ({ icon, title, value }: { icon: React.ReactNode; title: string; value: number }) => (
//   <div className="bg-white dark:bg-[#1e1e1e] rounded-xl shadow-md p-5 flex items-center gap-4">
//     <div className="p-2 bg-gray-100 dark:bg-[#2a2a2a] rounded-lg">{icon}</div>
//     <div>
//       <p className="text-sm text-gray-500 dark:text-gray-400">{title}</p>
//       <p className="text-xl font-bold text-gray-900 dark:text-white">{value}</p>
//     </div>
//   </div>
// );



