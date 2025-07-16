"use client";
import {
  LogOut,
  Sun,
  Moon,
  Phone,
  Mail,
  LayoutDashboard,
  BarChart2,
  CalendarCheck,
  FileEdit,
  HeartHandshake,
  Clock,
  CalendarDays,
  Stethoscope,
  User,
  CalendarCheck2,
  UserCog,
  Flame,
} from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { handleResetPasskey } from "@/lib/actions/lab.action";
import { useRouter } from "next/navigation";
import { getHospitalById } from "@/lib/actions/payment.action";
import { getPendingAppointmentsByHospitalId } from "@/lib/actions/appointment.action";
import { getDoctorsByHospitalId } from "@/lib/actions/doctor.action";
import { getAssistantsByHospitalId } from "@/lib/actions/assistant.action";
import { getTodaysAppointmentsByHospitalId } from "@/lib/actions/appointment.action";
import DoctorAttendanceChart from "./ui/DoctorAttendanceChart";
import AssistantAttendanceChart from "./ui/AssistantAttendanceChart";
import HospitalComparisonChart from "@/components/ui/HospitalComparisonChart";
import HospitalHeatMap from "./HospitalHeatMap";

interface PageProps {
  params: {
    hospitalId: string;
  };
}

type Appointment = {
  $id: string;
  $createdAt: string;
  userId: string;
  hospitalId?: string;
  labId?: string;
  doctorName?: string;
  test?: string;
  city: string;
  state: string;
  timestamp: string;
  status: "pending" | "done" | "cancelled";
  cancelReason?: string;
};

type Assistant = {
  $id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  logoUrl: string;
  logoId: string;
  logo: string;
  doctorId?: string;
  hospitalId?: string;
  labId?: string;
  passkey: string;
};

interface docData{
    name : string, 
    email : string , 
    phone : string,
    address : string,
    city : string,
    licenseNumber : string,
    doctorName : string[],
    state : string,
    pincode : string,
    logoUrl : string,
    specialities : string[],
}

type Doctor = {
  $id: string;
  Name: string;
  Email: string;
  phone: string;
  address: string;
  City: string;
  licenseNumber: string;
  logoUrl: string;
  speciality: string[];
  isVerified: boolean;
  availability: string[];
  experience: number;
  hospitalId: string;
  logo: string;
  logoId: string;
};




export default function HospitalDashboard({ params }: PageProps) {
   const[hospital , setHospital] = useState<docData | null>(null); 
   const [sidebarOpen, setSidebarOpen] = useState(false);
   const [darkMode, setDarkMode] = useState(false);
   const [selectedNav, setSelectedNav] = useState("Dashboard");
   const [passkey, setPasskey] = useState("");
   const [doctors, setDoctors] = useState<Doctor[]>([]);
   const router = useRouter();
   const [pendingAppointments, setPendingAppointments] = useState<Appointment[]>([]);
   const [assistants, setAssistants] = useState<Assistant[]>([]);
   const [viewMode, setViewMode] = useState<"doctor" | "assistant">("doctor");
   const [todaysAppointments, setTodaysAppointments] = useState<Appointment[]>([]);
   const [showAll, setShowAll] = useState(false);
   const [selectedDoctorId , setSelectedDoctorId] = useState<string | null>(null);
   const [selectedAssistantId , setSelectedAssistantId] = useState< string | null > (null);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
  }, [darkMode]);


useEffect(() => {
  const fetchAssistants = async () => {
    try {
      const res = await getAssistantsByHospitalId(params.hospitalId);
      setAssistants(res as unknown as Assistant[]);
    } catch (error) {
      console.error("Failed to fetch assistants:", error);
      setAssistants([]);
    }
  };

  fetchAssistants();
}, [params.hospitalId]);


    const handleSignOut = () => {
        router.push("/"); // redirect to home
    };

    const handleResetLabPasskey = async () => {
        const confirmed = confirm("Are you sure you want to reset your passkey?");
        if (!confirmed) return;
        // Call Appwrite function or backend logic here
        const res = await handleResetPasskey(params.hospitalId);
        if (res) {
            alert(res.message || "Passkey reset successfully. Please check your email for the new passkey.");
        } else {
            alert("Failed to reset passkey. Please try again later.");
        }
    };

    useEffect(() => {
      const fetchTodaysAppointments = async () => {
        try {
          const appointments = await getTodaysAppointmentsByHospitalId(params.hospitalId);
          setTodaysAppointments(appointments as unknown as Appointment[]);
        } catch (err) {
          console.error("Failed to fetch today's appointments:", err);
        }
      };

  fetchTodaysAppointments();
}, [params.hospitalId]);

      useEffect(() => {
    const fetchPendingAppointments = async () => {
      try {
        const data = await getPendingAppointmentsByHospitalId(params.hospitalId);
        setPendingAppointments(data as unknown as Appointment[]);
      } catch (error) {
        console.error("Failed to fetch pending appointments:", error);
        setPendingAppointments([]);
      }
    };

    fetchPendingAppointments();
  }, [params.hospitalId]);


  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const res = await getDoctorsByHospitalId(params.hospitalId);
        setDoctors(res || []);
      } catch (error) {
        console.error("Failed to fetch doctors:", error);
        setDoctors([]);
      }
    };

    fetchDoctors();
  }, [params.hospitalId]);

      useEffect(() => {
        const fetchHospital = async () => {
          const doc = await getHospitalById(params.hospitalId);
          
          // Map the returned Document to docData type if necessary
          if (doc && typeof doc === "object") {
            setHospital({
              name: doc.name,
              email: doc.email,
              phone: doc.phone,
              address: doc.address,
              city: doc.city,
              licenseNumber: doc.licenseNumber,
              logoUrl: doc.logoUrl,
              specialities : doc.specialities,
              state : doc.state,
              pincode : doc.pincide,
              doctorName : doc.doctorName,
            });
          } else {
            setHospital(null);
          }
        };
        fetchHospital();
      }, [params.hospitalId]);
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
                icon={<LayoutDashboard size={20} />}
                label="Dashboard"
                active={selectedNav === "Dashboard"}
                open={sidebarOpen}
                onClick={() => setSelectedNav("Dashboard")}
              />
              <NavItem
                icon={<BarChart2 size={20} />}
                label="Statics"
                active={selectedNav === "Statics"}
                open={sidebarOpen}
                onClick={() => setSelectedNav("Statics")}
              />
              <NavItem
                icon={<CalendarCheck size={20} />}
                label="Attendance Record"
                active={selectedNav === "Attendance Record"}
                open={sidebarOpen}
                onClick={() => setSelectedNav("Attendance Record")}
              />
              <NavItem
                icon={<FileEdit size={20} />}
                label="Update Details"
                active={selectedNav === "Update Details"}
                open={sidebarOpen}
                onClick={() => setSelectedNav("Update Details")}
              />
              <NavItem
                icon={<HeartHandshake size={20} />}
                label="Donate"
                active={selectedNav === "Donate"}
                open={sidebarOpen}
                onClick={() => setSelectedNav("Donate")}
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

        <main
          className={`flex-1 pt-6 sm:pt-10 px-4 sm:px-10 transition-all duration-300 ease-in-out overflow-y-auto ${
            sidebarOpen ? "sm:ml-4 ml-15" : "sm:ml-4 ml-15"
          }`}
        >
        {selectedNav === "Dashboard" && (
            <>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            <div className="flex flex-col gap-1 mb-4">
            <h1 className="text-2xl font-semibold">Welcome, {hospital?.name}</h1>
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
                  {/* Doctor / Assistant Toggle */}
                  <div className="flex bg-gray-100 dark:bg-[#1e1e1e] rounded-full p-1 shadow-sm border dark:border-gray-600">
                    <button
                      onClick={() => setViewMode("doctor")}
                      className={`px-5 py-2 text-sm font-semibold rounded-full transition-colors duration-300
                        ${
                          viewMode === "doctor"
                            ? "bg-blue-600 text-white shadow"
                            : "text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-[#2a2a2a]"
                        }`}
                    >
                      Doctor
                    </button>
                    <button
                      onClick={() => setViewMode("assistant")}
                      className={`px-5 py-2 text-sm font-semibold rounded-full transition-colors duration-300
                        ${
                          viewMode === "assistant"
                            ? "bg-blue-600 text-white shadow"
                            : "text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-[#2a2a2a]"
                        }`}
                    >
                      Assistant
                    </button>
                  </div>
              </div>


            <div className="h-12 w-12 rounded-full overflow-hidden border-2 border-gray-500 shadow-lg">
              {/* ------- */}
              <Image
                src={hospital?.logoUrl || "/assets/images/dr-cameron.png"}
                alt="Hospital"
                className="border w-full h-full object-cover"
                width={18}
                height={18}
              />
              </div>
            </div>        
          </div>  


          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard
              icon={<User size={24} className="text-blue-600" />}
              title="Total Patients"
              value={( pendingAppointments).length}
            />
            <StatCard
              icon={<Stethoscope  size={24} className="text-green-600" />}
              title="Total Doctors"
              value={doctors.length}
            />
            <StatCard
              icon={<UserCog  size={24} className="text-indigo-600" />}
              title="Total Assistants"
              value={assistants?.length || 0}
            />
            <StatCard
              icon={<CalendarCheck2  size={24} className="text-indigo-600" />}
              title="Today's Appointment Count"
              value={todaysAppointments.length || 0}
            />
          </div>   


          {viewMode === "doctor" ? (
              <>
                <div className="flex flex-col mb-8 lg:flex-row gap-6">
                    {/* Left: Doctor List */}
                    <div className="bg-white dark:bg-[#1e1e1e] p-6 rounded-xl shadow-md flex-1">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Doctors</h3>
                      </div>

                      <ul className="space-y-4">
                        {(showAll ? doctors : doctors.slice(0, 5)).map((doctor) => (
                          <li
                            key={doctor.$id}
                            className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0 px-4 py-3 rounded-lg border dark:border-gray-700 bg-gray-100 dark:bg-[#2b2b2b] hover:shadow transition-all"
                          >
                            <div>
                              <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
                                Dr. {doctor.Name}
                              </p>
                              {doctor.speciality && (
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                  {doctor.speciality}
                                </p>
                              )}
                              {doctor.City && (
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                  {doctor.City}
                                </p>
                              )}
                            </div>
                            <button
                              onClick={() => setSelectedDoctorId(doctor.$id)}
                              className="px-4 py-2 text-sm text-white bg-green-600 rounded-md hover:bg-green-700 transition-colors"
                            >
                              Records
                            </button>
                          </li>
                        ))}
                      </ul>

                      {doctors.length > 5 && (
                        <button
                          className="mt-4 text-blue-600 text-sm hover:underline"
                          onClick={() => setShowAll(!showAll)}
                        >
                          {showAll ? "Show less" : "View all"}
                        </button>
                      )}
                    </div>

                    {/* Right: Doctor Graph */}
                      {selectedDoctorId && (
                        <div className="bg-white dark:bg-[#1e1e1e] p-6 rounded-xl shadow-md w-full lg:w-[45%] relative">
                          {/* Close button */}
                          <button
                            onClick={() => setSelectedDoctorId(null)}
                            className="absolute top-3 right-3 text-gray-500 hover:text-red-600 dark:hover:text-red-400"
                            aria-label="Close chart"
                          >
                            ✕
                          </button>

                          <DoctorAttendanceChart doctorId={selectedDoctorId} />
                        </div>
                      )}
                  </div>
              </>
            ) : (
              <>
              {/* Right hand Assistant Side */}
              <div className="flex flex-col mb-8 lg:flex-row gap-6">
                  {/* Left: Assistant List */}
                  <div className="bg-white dark:bg-[#1e1e1e] p-6 rounded-xl shadow-md flex-1">
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Assistants</h3>
                    </div>

                    <ul className="space-y-4">
                      {(showAll ? assistants : assistants.slice(0, 5)).map((assistant) => (
                        <li
                          key={assistant.$id}
                          className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-0 px-4 py-3 rounded-lg border dark:border-gray-700 bg-gray-100 dark:bg-[#2b2b2b] hover:shadow transition-all"
                        >
                          <div>
                            <p className="text-sm font-medium text-gray-800 dark:text-gray-200">
                              {assistant.name}
                            </p>
                            {assistant.phone && (
                              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                {assistant.phone}
                              </p>
                            )}
                            {assistant.doctorId && (
                              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                {assistant.doctorId}
                              </p>
                            )}
                          </div>
                          <button
                            onClick={() => setSelectedAssistantId(assistant.$id)}
                            className="px-4 py-2 text-sm text-white bg-green-600 rounded-md hover:bg-green-700 transition-colors"
                          >
                            Records
                          </button>
                        </li>
                      ))}
                    </ul>

                    {assistants.length > 5 && (
                      <button
                        className="mt-4 text-blue-600 text-sm hover:underline"
                        onClick={() => setShowAll(!showAll)}
                      >
                        {showAll ? "Show less" : "View all"}
                      </button>
                    )}
                  </div>

                  {/* Right: Assistant Chart */}
                  {selectedAssistantId && (
                    <div className="bg-white dark:bg-[#1e1e1e] p-6 rounded-xl shadow-md w-full lg:w-[45%] relative">
                      <button
                        onClick={() => setSelectedAssistantId(null)}
                        className="absolute top-3 right-3 text-gray-500 hover:text-red-600 dark:hover:text-red-400"
                        aria-label="Close chart"
                      >
                        ✕
                      </button>
                      <AssistantAttendanceChart assistantId={selectedAssistantId} />
                    </div>
                  )}
                </div>
              </>
            )}                 
            </>
          )}
      {selectedNav === "Statics" && (
        <div className="space-y-8 mb-10">
          {/* Section Header */}
          <div className="mb-6">
            <h2 className="text-2xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <BarChart2 className="text-blue-600" size={22} />
              Statistics Overview
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Compare hospital performance and visualize appointment activity across the city.
            </p>
          </div>

          {/* Grid Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Hospital Comparison Card */}
            <div className="bg-white dark:bg-[#1e1e1e] p-6 rounded-xl shadow-md">
              <div className="flex items-center gap-2 mb-4">
                <BarChart2 className="text-green-600" size={20} />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Hospital Comparison
                </h3>
              </div>
              <HospitalComparisonChart city={hospital?.city || "Unknown"} />
            </div>

            {/* Heatmap Card */}
            <div className="bg-white dark:bg-[#1e1e1e] p-6 rounded-xl shadow-md">
              <div className="flex items-center gap-2 mb-4">
                <Flame className="text-red-600" size={20} />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  City Heatmap
                </h3>
              </div>
              <HospitalHeatMap />
            </div>
          </div>
        </div>
      )}

        {selectedNav === "Attendance Record" && (
            <>
            </>
            )}

        {selectedNav === "Update Details" && (
            <></>
        )}

        {selectedNav === "Donate" && (
          <div className="flex flex-col mb-6 sm:flex-row gap-6">
            {/* <div className="hidden lg:block lg:min-w-[250px]" /> */}
          <div className="bg-white dark:bg-[#1e1e1e] mb-6 p-6 sm:p-10 rounded-2xl shadow-xl w-full sm:max-w-4xl mx-auto space-y-10">
            
            {/* Header */}
            <div className="text-center">
              <h2 className="text-3xl font-bold text-gray-800 dark:text-white">Account Settings</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400">Manage your personal and security details.</p>
            </div>

            {/* Profile Section */}
            <div className="flex flex-col sm:flex-row gap-8 items-center">
              <div className="w-28 h-28 rounded-full overflow-hidden border-4 border-gray-500 shadow-lg">
                <Image
                  src={hospital?.logoUrl || "/assets/icons/user.svg"}
                  alt="Hospital Profile"
                  width={112}
                  height={112}
                  className="object-cover w-full h-full"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full">
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Full Name</p>
                  <p className="text-base font-semibold text-gray-900 dark:text-white">{hospital?.name}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Email</p>
                  <p className="text-base font-semibold text-gray-900 dark:text-white break-all">{hospital?.email}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Phone Number</p>
                  <p className="text-base font-semibold text-gray-900 dark:text-white">{hospital?.phone}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Address</p>
                  <p className="text-base font-semibold text-gray-900 dark:text-white">{hospital?.address || "N/A"}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">City</p>
                  <p className="text-base font-semibold text-gray-900 dark:text-white">{hospital?.city || "N/A"}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">License Number</p>
                  <p className="text-base font-semibold text-gray-900 dark:text-white">{hospital?.licenseNumber || "N/A"}</p>
                </div>
              </div>
            </div>

            {/* Security Section */}
            <div className="pt-6 border-t border-gray-300 dark:border-gray-700">
              <h3 className="text-xl font-bold text-gray-800 dark:text-white mb-3">Security</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                Enter your passkey to reset your secure access credentials.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 sm:items-center">
                <input
                  type="password"
                  value={passkey}
                  onChange={(e) => setPasskey(e.target.value)}
                  placeholder="Enter passkey"
                  className="w-full sm:w-auto px-4 py-2 rounded-md border border-gray-300 dark:border-gray-600 dark:bg-[#121212] dark:text-white text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
                <button
                  onClick={() => {
                    const HospitalName = hospital?.name || "";
                    const firstTwo = HospitalName.slice(0,2).toUpperCase();
                    const expectedKey = `HOSP${firstTwo}`;

                    if (passkey === expectedKey) {
                      handleResetLabPasskey();
                    } else {
                      alert("Invalid passkey. Please try again.");
                    }
                  }}
                  className="px-5 py-2.5 bg-red-600 text-white rounded-md hover:bg-red-700 transition font-medium shadow"
                >
                  Reset Passkey
                </button>
              </div>
            </div>

            {/* Contact Support Section */}
            <div className="pt-6 border-t border-gray-300 dark:border-gray-700 space-y-4">
              <h3 className="text-xl font-bold text-gray-800 dark:text-white">Contact ArogyaCompass</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Reach out to our support team for help or inquiries.
              </p>

              <div className="flex flex-col sm:flex-row gap-4">
                <a
                  href={`mailto:aryamanporwal@gmail.com?subject=Doctor Support Request&body=Hello ArogyaCompass Team,%0D%0A%0D%0AI need assistance regarding...%0D%0A%0D%0ARegards,%0D%0Aaryamanporwal@gmail.com`}
                  className="flex items-center justify-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition font-medium shadow text-sm"
                >
                  <Mail size={18} /> Email Support
                </a>
                <a
                  href="tel:+916392994628"
                  className="flex items-center justify-center gap-2 px-5 py-2.5 bg-green-600 text-white rounded-md hover:bg-green-700 transition font-medium shadow text-sm"
                >
                  <Phone size={18} /> Call Support
                </a>
              </div>
            </div>
          </div>
           </div>
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


const StatCard = ({ icon, title, value }: { icon: React.ReactNode; title: string; value: number }) => (
  <div className="bg-white dark:bg-[#1e1e1e] rounded-xl shadow-md p-5 flex items-center gap-4">
    <div className="p-2 bg-gray-100 dark:bg-[#2a2a2a] rounded-lg">{icon}</div>
    <div>
      <p className="text-sm text-gray-500 dark:text-gray-400">{title}</p>
      <p className="text-xl font-bold text-gray-900 dark:text-white">{value}</p>
    </div>
  </div>
);
