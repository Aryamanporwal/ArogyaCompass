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
  Trash2,
} from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { handleResetPasskey } from "@/lib/actions/hospital.action";
import { useRouter } from "next/navigation";
import { getHospitalById } from "@/lib/actions/payment.action";
import { getPendingAppointmentsByHospitalId } from "@/lib/actions/appointment.action";
import { deleteDoctorById, getDoctorsByHospitalId } from "@/lib/actions/doctor.action";
import { getAssistantsByHospitalId } from "@/lib/actions/assistant.action";
import { getTodaysAppointmentsByHospitalId } from "@/lib/actions/appointment.action";
import DoctorAttendanceChart from "./ui/DoctorAttendanceChart";
import AssistantAttendanceChart from "./ui/AssistantAttendanceChart";
import HospitalComparisonChart from "@/components/ui/HospitalComparisonChart";
import HospitalHeatMap from "./HospitalHeatMap";
import DoctorRegisterForm from "@/components/form/DoctorRegisterForm"; // adjust the path as needed
import { useKeenSlider } from "keen-slider/react"
import "keen-slider/keen-slider.min.css"


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

    const handleResetHospitalPasskey = async () => {
        const confirmed = confirm("Are you sure you want to reset your passkey?");
        if (!confirmed) return;
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

    const handleDeleteDoctor = async (doctorId: string) => {
    const res = await deleteDoctorById(doctorId);
    if (res.success) {
      // refresh doctor list or show toast
      console.log(res.message);
    } else {
      console.error(res.message);
    }
  };


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
                label="Statistics"
                active={selectedNav === "Statics"}
                open={sidebarOpen}
                onClick={() => setSelectedNav("Statics")}
              />
              <NavItem
                icon={<CalendarCheck size={20} />}
                label="Add Doctor"
                active={selectedNav === "Add Doctor"}
                open={sidebarOpen}
                onClick={() => setSelectedNav("Add Doctor")}
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

      {selectedNav === "Add Doctor" && (
        <section className="w-full max-w-6xl mx-auto px-2 md:px-4 flex flex-col gap-8">
          {/* Doctor Cards List */}
          <div>
            <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
              All Registered Doctors
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-h-[70vh] overflow-y-auto pr-2">
              {doctors.length === 0 ? (
                <div className="col-span-full text-center text-gray-500 dark:text-gray-400 py-20">
                  No doctors registered yet.
                </div>
              ) : (
                doctors.map((doctor) => (
                  <div
                    key={doctor.$id}
                    className="flex items-center gap-4 bg-white dark:bg-[#1e1e1e]  rounded-xl shadow px-5 py-4 hover:shadow-lg transition border border-gray-100 dark:border-[#32394a]"
                  >
                    <Image
                      src={doctor.logoUrl || "/doctor-avatar.png"}
                      alt={doctor.Name}
                      width={56}
                      height={56}
                      className="rounded-full object-cover border-2 border-blue-100 dark:border-gray-700 bg-gray-100 dark:bg-gray-800"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white truncate">
                          Dr. {doctor.Name}
                        </h3>
                        {doctor.isVerified && (
                          <span className="ml-1 px-2 py-0.5 text-xs bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 rounded">
                            Verified
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500 dark:text-gray-400 truncate">
                        {doctor.Email}
                      </p>
                      <p className="mt-1 text-xs text-blue-600 dark:text-blue-300">
                        {Array.isArray(doctor.speciality)
                          ? doctor.speciality.join(", ")
                          : doctor.speciality}
                      </p>
                      {doctor.City && (
                        <p className="text-xs text-gray-400 mt-1">{doctor.City}</p>
                      )}
                    </div>
                    <button
                      aria-label="Delete doctor"
                      className="ml-2 p-2 rounded-full transition bg-red-50 hover:bg-red-100 dark:bg-[#25292c] dark:hover:bg-red-900"
                      onClick={() => handleDeleteDoctor(doctor.$id)}
                    >
                      <Trash2 className="h-5 w-5 text-red-500 dark:text-red-400" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Doctor Registration Form at Bottom */}
          <div className="w-full mb-10">
              <DoctorRegisterForm hospitalId={params.hospitalId} />
          </div>
        </section>
      )}


        {selectedNav === "Update Details" && (
            <>
          <div className="flex flex-col mb-6 sm:flex-row gap-6">
            {/* <div className="hidden lg:block lg:min-w-[250px]" /> */}
          <div className="bg-white dark:bg-[#1e1e1e] mb-6 p-6 sm:p-10 rounded-2xl shadow-xl w-full mx-auto space-y-10">
            
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
                      handleResetHospitalPasskey();
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
            </>
        )}

        {selectedNav === "Donate" && (
          <div className="w-full  mx-auto px-4 py-8 flex flex-col gap-8">
            {/* Emotional Image Banner */}
              <div className="w-full">
                {/* Mobile Slider */}
                <div className="block md:hidden">
                  <MobileImageSlider />
                </div>

                {/* Desktop Layout */}
                <div className="hidden md:flex flex-row gap-6 items-center">
                  <Image
                    src="/assets/images/donate2.jpg"
                    alt="Poor child hoping for help"
                    className="w-1/2 h-56 object-cover rounded-xl shadow-md"
                    width={220}
                    height={220}
                  />
                  <Image
                    src="/assets/images/donate3.jpg"
                    alt="Children needing medical care"
                    className="w-1/2 h-56 object-cover rounded-xl shadow-md"
                    width={220}
                    height={220}
                  />
                  <Image
                    src="/assets/images/donate4.jpg"
                    alt="Children needing medical care"
                    className="w-1/2 h-56 object-cover rounded-xl shadow-md"
                    width={220}
                    height={220}
                  />
                  <Image
                    src="/assets/images/donate1.jpg"
                    alt="Children needing medical care"
                    className="w-1/2 h-56 object-cover rounded-xl shadow-md"
                    width={220}
                    height={220}
                  />
                </div>
              </div>

            {/* Data & Facts about Poverty and Sickness in India */}
            <section>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 dark:text-white mb-2 tracking-tight" style={{ fontFamily: "Inter, sans-serif" }}>
                India’s Healthcare & Poverty Reality
              </h2>
              <ul className="list-disc ml-6 text-base md:text-lg text-gray-700 dark:text-gray-300 leading-relaxed" style={{ fontFamily: "Inter, sans-serif" }}>
                <li>
                  <span className="font-semibold text-red-600 dark:text-red-400">63 million</span> Indians fall into poverty every year due to catastrophic health expenses—most cannot afford critical treatment<sup>[5]</sup>.
                </li>
                <li>
                  Still, <span className="font-semibold">over 2.35% (33.6 million)</span> Indians live below the poverty line<sup>[3]</sup>, risking health and security.
                </li>
                <li>
                  Poor and rural families face special hardship: outpatient care costs alone can push them into poverty<sup>[6]</sup>.
                </li>
              </ul>
            </section>

            {/* Campaign Message */}
            <section className="bg-gradient-to-r from-blue-50 to-green-50 dark:from-[#18191e] dark:via-[#3c425c] dark:to-[#1a1e2b] rounded-xl shadow-sm px-6 py-7 flex flex-col gap-3">
              <h3 className="text-xl font-bold text-blue-700 dark:text-blue-200 mb-1" style={{ fontFamily: "Inter, sans-serif" }}>
                Join ArogyaCompass in Transforming Lives
              </h3>
              <p className="text-lg text-gray-800 dark:text-gray-200" style={{ fontFamily: "Inter, sans-serif", lineHeight: 1.6 }}>
                <span className="font-semibold text-blue-600 dark:text-blue-200">ArogyaCompass</span> has taken an oath to help as many Indians as possible access healthcare and a healthy lifestyle.
                <br />
                <span className="font-semibold">Will you be a part of this campaign?</span>
              </p>
              <p className="text-base text-gray-700 dark:text-gray-300" style={{ fontFamily: "Inter, sans-serif" }}>
                We believe in the power of community and user experience. <span className="font-bold text-green-700 dark:text-green-400">Donate more than <span style={{ fontFamily: "inherit", fontWeight: 700 }}>₹2100</span> and unlock ArogyaCompass Pro!</span>
              </p>
            </section>

            {/* Pro Features Card */}
            <div  className="bg-gradient-to-r from-blue-50 to-green-50 dark:from-[#18191e] dark:via-[#3c425c] dark:to-[#1a1e2b] rounded-xl shadow-sm px-6 py-7 flex flex-col gap-3">
              <h4 className="text-lg md:text-xl font-semibold mb-2 text-blue-700 dark:text-blue-200" style={{ fontFamily: "Inter, sans-serif" }}>
                ArogyaCompass Pro: Your Exclusive Advantage
              </h4>
              <ul className="list-disc ml-5 text-gray-800 dark:text-gray-200" style={{ fontFamily: "Inter, sans-serif" }}>
                <li>Unlimited access to daily healthcare research and real-time news</li>
                <li>AI-powered suggestions to boost your business and personal wellbeing</li>
                <li>Advanced analytics to track growth and get personalized insights</li>
                <li>Direct access to our powerful Medical Bot for instant answers, anytime</li>
                <li>Enjoy all exclusive features for <span className="font-semibold text-green-700 dark:text-green-400">three months</span></li>
              </ul>
            </div>

            {/* Call To Action */}
            <div className="text-center mt-6">
              <p className="text-lg md:text-xl font-bold text-gray-900 dark:text-white mb-2" style={{ fontFamily: "Inter, sans-serif" }}>
                Why wait? No more questions, just become a hero for Indian healthcare.
              </p>
              <button
                className="inline-block mt-3 px-8 py-3 rounded-lg shadow bg-blue-600 hover:bg-blue-700 text-white font-semibold text-lg  transition-all duration-200"
                style={{ fontFamily: "Inter, sans-serif", letterSpacing: 0.2 }}
                // onClick={() => handleDonate()} // Hook up your donation handler here
              >
                Donate Now
              </button>
              <div className="mt-2 text-gray-600 dark:text-gray-400 text-sm">Help Indians and unlock exclusive Pro features.</div>
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

const MobileImageSlider = () => {
  const [sliderRef] = useKeenSlider<HTMLDivElement>({
    loop: true,
    mode: "snap",
    slides: { perView: 1 },
    renderMode: "performance",
    drag: true,
  })

  const images = [
    "/assets/images/donate2.jpg",
    "/assets/images/donate3.jpg",
    "/assets/images/donate4.jpg",
    "/assets/images/donate1.jpg",
  ]

  return (
    <div ref={sliderRef} className="keen-slider rounded-xl overflow-hidden">
      {images.map((src, idx) => (
        <div key={idx} className="keen-slider__slide">
          <Image
            src={src}
            alt={`Donation image ${idx + 1}`}
            width={500}
            height={220}
            className="w-full h-56 object-cover rounded-xl"
          />
        </div>
      ))}
    </div>
  )
}
