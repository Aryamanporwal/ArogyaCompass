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
  PlusSquare,
  User,
} from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
// import { handleResetPasskey } from "@/lib/actions/lab.action";
import { useRouter } from "next/navigation";
// import { Button } from "./ui/button";
import { getHospitalById } from "@/lib/actions/hospital.action";
import { getLabById } from "@/lib/actions/lab.action";
import { getAllAppointmentsByUserId } from "@/lib/actions/appointment.action";
import { getUserNameById } from "@/lib/actions/user.action";
import { Models } from "node-appwrite";
import  CancelAppointmentForm  from "@/components/ui/cancelAppointment";
import FinePaymentModal from "./ui/finepayment";
import MedicalRecords from "./ui/Medical_Record";
import { getLabRecordsByUserId, getMedicineRecordsByUserId } from "@/lib/actions/medicalr.action";
import { generateMedicalHistoryPDF } from "@/lib/utils/generateMedicalHistoryPDF";


type Document = Models.Document;


enum AppointmentStatus {
  Done = "done",
  Cancelled = "cancelled",
  Pending = "pending",
}

interface Appointment {
  $id: string;
//   appointmentNumber: string; // assuming you have this field; else generate/display $id
  hospitalId?: string;
  doctorName?: string;
  city: string;
  state: string;
  timestamp: string; // ISO string from DB
  status: AppointmentStatus;
  labId?: string;
  test?: string;
  userId: string;
}

interface Hospital {
  $id: string;
  name?: string;
}

interface Lab {
  $id: string;
  name?: string;
}

interface Props {
  userId: string;
}


async function handleDownloadFullHistory(userId: string) {
  const [labRecords, medicineRecords] = await Promise.all([
    getLabRecordsByUserId(userId),
    getMedicineRecordsByUserId(userId),
  ]);

  await generateMedicalHistoryPDF({
    userId,
    labRecords,
    medicineRecords,
    logoUrl: "/assets/icons/logo-full.png", // optional
  });
}


export default function PatientDashboard({ userId }: Props) {
   const [sidebarOpen, setSidebarOpen] = useState(false);
   const [darkMode, setDarkMode] = useState(false);
   const [selectedNav, setSelectedNav] = useState("Dashboard");
   const router = useRouter();
   const [name, setName] = useState<string | null>(null);
   const [appointments, setAppointments] = useState<Appointment[]>([]);
   const [loading, setLoading] = useState(true);
  //  const [selectedStatus, setSelectedStatus] = useState<AppointmentStatus>(AppointmentStatus.Pending);
   const [hospitalNames, setHospitalNames] = useState<Record<string, string>>({});
   const [labNames, setLabNames] = useState<Record<string, string>>({});
   const [showCancelForm, setShowCancelForm] = useState(false);
   const [selectedAppointmentId, setSelectedAppointmentId] = useState<string | null>(null);
   const [showFineModal, setShowFineModal] = useState(false);
   const [cancelledSinceLastFine, setCancelledSinceLastFine] = useState(0);
   const handleSignOut = () => {
        router.push("/"); 
    };


        useEffect(() => {
            async function fetchAppointments() {
                setLoading(true);
                try {
                const rawDocs = await getAllAppointmentsByUserId(userId);
    
                const docs: Appointment[] = rawDocs.map((doc: Document) => ({
                    $id: doc.$id,
                    hospitalId: doc.hospitalId,
                    doctorName: doc.doctorName,
                    city: doc.city,
                    state: doc.state,
                    timestamp: doc.timestamp,
                    status: doc.status,
                    labId: doc.labId,
                    test: doc.test,
                    userId: doc.userId,
                }));
    
                setAppointments(docs);
                } catch (error) {
                console.error("Error fetching appointments:", error);
                setAppointments([]);
                }
                setLoading(false);
            }
    
            fetchAppointments();
            }, [userId]);
    
            useEffect(() => {
                async function fetchName() {
                const result = await getUserNameById(userId);
                setName(result);
                }
                fetchName();
            }, [userId]);
    
      // Fetch hospital and lab names for appointments
      useEffect(() => {
        async function fetchInstitutions() {
          const hNames: Record<string, string> = {};
          const lNames: Record<string, string> = {};
          await Promise.all(
            appointments.map(async (appt) => {
              if (appt.hospitalId && !hospitalNames[appt.hospitalId]) {
                try {
                  const hospital: Hospital = await getHospitalById(appt.hospitalId);
                  hNames[appt.hospitalId] = hospital.name || "—";
                } catch {
                  hNames[appt.hospitalId] = "—";
                }
              }
              if (appt.labId && !labNames[appt.labId]) {
                try {
                  const lab: Lab = await getLabById(appt.labId);
                  lNames[appt.labId] = lab.name || "—";
                } catch {
                  lNames[appt.labId] = "—";
                }
              }
            })
          );
          setHospitalNames((prev) => ({ ...prev, ...hNames }));
          setLabNames((prev) => ({ ...prev, ...lNames }));
        }
        if (appointments.length) fetchInstitutions();
        // eslint-disable-next-line react-hooks/exhaustive-deps
      }, [appointments]);
    
      // Filter appointments by selected status
      // const filteredAppointments = appointments.filter((appt) => appt.status === selectedStatus);
    
      // Counts for cards
      const counts = {
        [AppointmentStatus.Done]: appointments.filter((a) => a.status === AppointmentStatus.Done).length,
        [AppointmentStatus.Pending]: appointments.filter((a) => a.status === AppointmentStatus.Pending).length,
        [AppointmentStatus.Cancelled]: appointments.filter((a) => a.status === AppointmentStatus.Cancelled).length,
      };

      const upcomingAppointments = appointments.filter(a => a.status === AppointmentStatus.Pending);
      const cancelledAppointments = appointments.filter(a => a.status === AppointmentStatus.Cancelled);

      const fineDue = cancelledSinceLastFine >= 5;

      const handleFinePaymentSuccess = () => {
        setShowFineModal(false);
        setCancelledSinceLastFine(0);
      }

      const handleCancel = (appointmentId : string) => {
        setSelectedAppointmentId(appointmentId);
        setShowCancelForm(true);
      }

      const handleCancelConfirmed = () => {
        setCancelledSinceLastFine(prev => prev+1);
      }

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

      <FinePaymentModal
        open={showFineModal}
        onClose={() => setShowFineModal(false)}
        onSuccess={handleFinePaymentSuccess}
        darkMode={darkMode}
      />

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
                disabled = {false}
              />
              <NavItem
                icon={<ClipboardList size={20} />}
                label="Appointments"
                active={selectedNav === "Appointments"}
                open={sidebarOpen}
                onClick={() => setSelectedNav("Appointments")}
                disabled = {false}
              />
                <NavItem
                icon={<CalendarX size={20} />}
                label="Cancel Appointment"
                active={selectedNav === "Cancel_Appointment"}
                open={sidebarOpen}
                disabled = {fineDue}
                onClick={() =>{
                  if(fineDue) {
                    setShowFineModal(true);
                    setSelectedNav("Cancel_Appointment")
                  }else{
                    setSelectedNav("Cancel_Appointment")
                  }
                }}
                />

                <NavItem
                icon={<FileText size={20} />}
                label="Medical Records"
                active={selectedNav === "Medical_Records"}
                open={sidebarOpen}
                onClick={() => setSelectedNav("Medical_Records")}
                disabled={false}
                />
                

                <NavItem
                icon={<AlertCircle size={20} />}
                label="Report Problem"
                active={selectedNav === "Report_Problem"}
                open={sidebarOpen}
                onClick={() => setSelectedNav("Report_Problem")}
                disabled = {false}
                />

                <NavItem
                icon={<HeartPulse size={20} />}
                label="First Aid"
                active={selectedNav === "First_Aid"}
                open={sidebarOpen}
                onClick={() => setSelectedNav("First_Aid")}
                disabled = {false}
                />

                <NavItem
                icon={<CalendarPlus size={20} />}
                label="Book Appointment"
                active={selectedNav === "Book_Appointment"}
                open={sidebarOpen}
                onClick={() => setSelectedNav("Book_Appointment")}
                disabled = {false}
                />

              <NavItem
                icon={<Settings size={20} />}
                label="Settings"
                active={selectedNav === "Settings"}
                open={sidebarOpen}
                onClick={() => setSelectedNav("Settings")}
                disabled = {false}
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
            <h1 className="text-2xl font-semibold">Welcome, {name}</h1>
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
            <StatCard
              icon={<CalendarDays size={24} className="text-blue-600" />}
              title="Upcoming Appointments"
              value={counts[AppointmentStatus.Pending]}
            />
            <StatCard
              icon={<User size={24} className="text-green-600" />}
              title="Previous Appointments"
              value={counts[AppointmentStatus.Done]}
            />
            <StatCard
              icon={<PlusSquare size={24} className="text-indigo-600" />}
              title="Cancelled Appointments"
              value={counts[AppointmentStatus.Cancelled]}
            />
          </div>

          {/* Upcoming Appointments Table (Desktop) */}
          <div className={`
            hidden sm:block overflow-x-auto rounded-2xl shadow-2xl 
            ${darkMode ? "bg-[#111418]/60 ring-1 ring-white/10" : "bg-white border border-gray-200"}
            backdrop-blur-md mb-8
          `}>
            <table className={`min-w-full border-collapse text-sm 
              ${darkMode ? "text-white" : "text-gray-900"}
            `}>
              <thead>
                <tr className={`
                  ${darkMode 
                    ? "text-gray-400 border-b border-white/10 bg-transparent"
                    : "text-gray-500 border-b border-gray-200 bg-[#f3f6fa]"
                  }
                `}>
                  <th className="py-4 px-6 text-left font-medium">Date</th>
                  <th className="py-4 px-6 text-left font-medium">Time</th>
                  <th className="py-4 px-6 text-left font-medium">Hospital / Lab</th>
                  <th className="py-4 px-6 text-left font-medium">Doctor Name / Test Name</th>
                  <th className="py-4 px-6 text-left font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  <tr>
                    <td colSpan={5} className="text-center py-8 text-gray-500">Loading...</td>
                  </tr>
                ) : appointments.filter(a => a.status === AppointmentStatus.Pending).length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-8 text-gray-500">No upcoming appointments found.</td>
                  </tr>
                ) : (
                  appointments
                    .filter(appt => appt.status === AppointmentStatus.Pending)
                    .map(appt => {
                      const dateObj = new Date(appt.timestamp);
                      const date = dateObj.toLocaleDateString(undefined, { day: "2-digit", month: "short", year: "numeric" });
                      const time = dateObj.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit", hour12: true });
                      const isHospital = !!appt.hospitalId;
                      const institutionName = isHospital
                        ? hospitalNames[appt.hospitalId!] || "—"
                        : appt.labId
                        ? labNames[appt.labId] || "—"
                        : "—";
                      return (
                        <tr key={appt.$id} className={`
                          border-b 
                          ${darkMode ? "border-white/10 hover:bg-white/5" : "border-gray-100 hover:bg-gray-50"}
                          transition-all
                        `}>
                          <td className="py-4 px-6">{date}</td>
                          <td className="py-4 px-6">{time}</td>
                          <td className="py-4 px-6">{institutionName}</td>
                          <td className="py-4 px-6">{appt.doctorName || appt.test || "—"}</td>
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-3">
                              <span
                                className={`
                                  inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold
                                  ${darkMode 
                                    ? "bg-blue-900 text-blue-400" 
                                    : "bg-blue-100 text-blue-700"
                                  }
                                `}
                              >
                                ⏳ Upcoming
                              </span>
                              <button
                                className={`
                                  px-4 py-1 rounded-full text-xs font-semibold
                                  ${darkMode 
                                    ? "bg-red-900 text-red-400" 
                                    : "bg-red-100 text-red-700"
                                  }
                                `}
                                disabled = {cancelledSinceLastFine>=5}
                                onClick={
                                  () => handleCancel(appt.$id)}
                              >
                                ✖ Cancel
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                )}
              </tbody>
            </table>
          </div>

            {/* Upcoming Appointments Card View (Mobile) */}
          <div className="sm:hidden space-y-4 mb-8">
            {loading ? (
              <p className="text-center py-4 text-gray-400">Loading...</p>
            ) : appointments.filter(a => a.status === AppointmentStatus.Pending).length === 0 ? (
              <p className="text-center py-4 text-gray-400">No upcoming appointments found.</p>
            ) : (
              appointments
                .filter(appt => appt.status === AppointmentStatus.Pending)
                .map(appt => {
                  const dateObj = new Date(appt.timestamp);
                  const date = dateObj.toLocaleDateString(undefined, { day: "2-digit", month: "short", year: "numeric" });
                  const time = dateObj.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit", hour12: true });
                  const isHospital = !!appt.hospitalId;
                  const institutionName = isHospital
                    ? hospitalNames[appt.hospitalId!] || "—"
                    : appt.labId
                    ? labNames[appt.labId] || "—"
                    : "—";
                  return (
                    <div key={appt.$id}
                      className={`
                        ring-1 rounded-xl p-4 shadow-xl backdrop-blur-md space-y-2
                        ${darkMode 
                          ? "bg-[#111418]/70 ring-white/10"
                          : "bg-white ring-gray-200"
                        }
                      `}
                    >
                      <div className="flex justify-between text-sm">
                        <span className={darkMode ? "text-white font-medium" : "text-gray-900 font-medium"}>{date}</span>
                        <span className={darkMode ? "text-gray-400" : "text-gray-500"}>{time}</span>
                      </div>
                      <div className={darkMode ? "text-sm text-white/90" : "text-sm text-gray-800"}>
                        <span className="font-semibold">
                          {appt.doctorName ? "Hospital" : appt.test ? "Lab" : "Hospital/Lab"}:
                        </span>{" "}
                        {institutionName}
                      </div>
                      <div className={darkMode ? "text-sm text-white/90" : "text-sm text-gray-800"}>
                        <span className="font-semibold">
                          {appt.doctorName ? "Doctor Name" : appt.test ? "Test" : "—"}:
                        </span>{" "}
                        {appt.doctorName || appt.test || "—"}
                      </div>
                      <div>
                        <div
                          className={`
                            inline-block px-3 py-1 rounded-full text-xs font-semibold mb-1
                            ${darkMode 
                              ? "bg-blue-900 text-blue-400" 
                              : "bg-blue-100 text-blue-700"
                            }
                          `}
                        >
                          ⏳ Upcoming
                        </div>
                        <button
                          className={`
                            inline-block mt-1 px-4 py-1 rounded-full text-xs font-semibold
                            ${darkMode 
                              ? "bg-red-900 text-red-400" 
                              : "bg-red-100 text-red-700"
                            }
                          `}
                          onClick={() => handleCancel(appt.$id)}
                          disabled = {cancelledSinceLastFine>=5}
                        >
                          ✖ Cancel
                        </button>
                      </div>
                    </div>
                  );
                })
            )}
          </div>

          </>
          )}


        {selectedNav === "Appointments" && (
          <>
            <h2 className="text-xl font-semibold mb-4">Completed Appointments</h2>
            <div className={`
              hidden sm:block overflow-x-auto rounded-2xl shadow-2xl mb-8
              ${darkMode ? "bg-[#111418]/60 ring-1 ring-white/10" : "bg-white border border-gray-200"}
              backdrop-blur-md
            `}>
              <table className={`min-w-full border-collapse text-sm ${darkMode ? "text-white" : "text-gray-900"}`}>
                <thead>
                  <tr className={`
                    ${darkMode
                      ? "text-gray-400 border-b border-white/10 bg-transparent"
                      : "text-gray-500 border-b border-gray-200 bg-[#f3f6fa]"
                    }
                  `}>
                    <th className="py-4 px-6 text-left font-medium">Date</th>
                    <th className="py-4 px-6 text-left font-medium">Time</th>
                    <th className="py-4 px-6 text-left font-medium">Hospital / Lab</th>
                    <th className="py-4 px-6 text-left font-medium">Doctor Name / Test Name</th>
                    <th className="py-4 px-6 text-left font-medium">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan={5} className="text-center py-8 text-gray-500">Loading...</td>
                    </tr>
                  ) : appointments.filter(a => a.status === AppointmentStatus.Done).length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center py-8 text-gray-500">No completed appointments found.</td>
                    </tr>
                  ) : (
                    appointments
                      .filter(appt => appt.status === AppointmentStatus.Done)
                      .map(appt => {
                        const dateObj = new Date(appt.timestamp);
                        const date = dateObj.toLocaleDateString(undefined, { day: "2-digit", month: "short", year: "numeric" });
                        const time = dateObj.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit", hour12: true });
                        const isHospital = !!appt.hospitalId;
                        const institutionName = isHospital
                          ? hospitalNames[appt.hospitalId!] || "—"
                          : appt.labId
                          ? labNames[appt.labId] || "—"
                          : "—";
                        return (
                          <tr key={appt.$id} className={`
                            border-b
                            ${darkMode ? "border-white/10 hover:bg-white/5" : "border-gray-100 hover:bg-gray-50"}
                            transition-all
                          `}>
                            <td className="py-4 px-6">{date}</td>
                            <td className="py-4 px-6">{time}</td>
                            <td className="py-4 px-6">{institutionName}</td>
                            <td className="py-4 px-6">{appt.doctorName || appt.test || "—"}</td>
                            <td className="py-4 px-6">
                              <span className={`
                                inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold
                                ${darkMode ? "bg-green-900 text-green-400" : "bg-green-100 text-green-700"}
                              `}>
                                ✔ Done
                              </span>
                            </td>
                          </tr>
                        );
                      })
                  )}
                </tbody>
              </table>
            </div>
            {/* Mobile Card View */}
            <div className="sm:hidden space-y-4 mb-8">
              {loading ? (
                <p className="text-center py-4 text-gray-400">Loading...</p>
              ) : appointments.filter(a => a.status === AppointmentStatus.Done).length === 0 ? (
                <p className="text-center py-4 text-gray-400">No completed appointments found.</p>
              ) : (
                appointments
                  .filter(appt => appt.status === AppointmentStatus.Done)
                  .map(appt => {
                    const dateObj = new Date(appt.timestamp);
                    const date = dateObj.toLocaleDateString(undefined, { day: "2-digit", month: "short", year: "numeric" });
                    const time = dateObj.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit", hour12: true });
                    const isHospital = !!appt.hospitalId;
                    const institutionName = isHospital
                      ? hospitalNames[appt.hospitalId!] || "—"
                      : appt.labId
                      ? labNames[appt.labId] || "—"
                      : "—";
                    return (
                      <div key={appt.$id}
                        className={`
                          ring-1 rounded-xl p-4 shadow-xl backdrop-blur-md space-y-2
                          ${darkMode ? "bg-[#111418]/70 ring-white/10" : "bg-white ring-gray-200"}
                        `}
                      >
                        <div className="flex justify-between text-sm">
                          <span className={darkMode ? "text-white font-medium" : "text-gray-900 font-medium"}>{date}</span>
                          <span className={darkMode ? "text-gray-400" : "text-gray-500"}>{time}</span>
                        </div>
                        <div className={darkMode ? "text-sm text-white/90" : "text-sm text-gray-800"}>
                          <span className="font-semibold">
                            {appt.doctorName ? "Hospital" : appt.test ? "Lab" : "Hospital/Lab"}:
                          </span>{" "}
                          {institutionName}
                        </div>
                        <div className={darkMode ? "text-sm text-white/90" : "text-sm text-gray-800"}>
                          <span className="font-semibold">
                            {appt.doctorName ? "Doctor Name" : appt.test ? "Test" : "—"}:
                          </span>{" "}
                          {appt.doctorName || appt.test || "—"}
                        </div>
                        <div>
                          <span
                            className={`
                              inline-block px-3 py-1 rounded-full text-xs font-semibold
                              ${darkMode ? "bg-green-900 text-green-400" : "bg-green-100 text-green-700"}
                            `}
                          >
                            ✔ Done
                          </span>
                        </div>
                      </div>
                    );
                  })
              )}
            </div>
          </>
        )}

        {selectedNav === "Cancel_Appointment" && (
          fineDue ? (
            <FinePaymentModal
            open = {true}
            onClose = {() => setShowFineModal(false)}
            onSuccess = {handleFinePaymentSuccess}
            darkMode = {darkMode}
            />
          ):(
          <>
            {/* --- UPCOMING APPOINTMENTS (Cards, Responsive) --- */}
            <div className="mb-8">
              <h2 className="text-xl font-semibold mb-4">Upcoming Appointments</h2>

              {/* Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {upcomingAppointments.length === 0 ? (
                  <div className="text-gray-500 col-span-full text-center py-8">No upcoming appointments.</div>
                ) : (
                  upcomingAppointments.map(appt => {
                    const dateObj = new Date(appt.timestamp);
                    const date = dateObj.toLocaleDateString(undefined, { day: "2-digit", month: "short", year: "numeric" });
                    const time = dateObj.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit", hour12: true });
                    const isHospital = !!appt.hospitalId;
                    const institutionName = isHospital
                      ? hospitalNames[appt.hospitalId!] || "—"
                      : appt.labId
                      ? labNames[appt.labId] || "—"
                      : "—";
                    return (
                      <div
                        key={appt.$id}
                        className={`
                          ring-1 rounded-xl p-4 shadow-xl backdrop-blur-md space-y-2
                          ${darkMode ? "bg-[#111418]/70 ring-white/10" : "bg-white ring-gray-200"}
                        `}
                      >
                        <div className="flex justify-between text-sm">
                          <span className={darkMode ? "text-white font-medium" : "text-gray-900 font-medium"}>{date}</span>
                          <span className={darkMode ? "text-gray-400" : "text-gray-500"}>{time}</span>
                        </div>
                        <div className={darkMode ? "text-sm text-white/90" : "text-sm text-gray-800"}>
                          <span className="font-semibold">
                            {appt.doctorName ? "Hospital" : appt.test ? "Lab" : "Hospital/Lab"}:
                          </span>{" "}
                          {institutionName}
                        </div>
                        <div className={darkMode ? "text-sm text-white/90" : "text-sm text-gray-800"}>
                          <span className="font-semibold">
                            {appt.doctorName ? "Doctor Name" : appt.test ? "Test" : "—"}:
                          </span>{" "}
                          {appt.doctorName || appt.test || "—"}
                        </div>
                        <div>
                          <div
                            className={`
                              inline-block px-3 py-1 rounded-full text-xs font-semibold mb-1
                              ${darkMode ? "bg-blue-900 text-blue-400" : "bg-blue-100 text-blue-700"}
                            `}
                          >
                            ⏳ Upcoming
                          </div>
                          <button
                            className={`
                              inline-block mt-1 px-4 py-1 rounded-full text-xs font-semibold
                              ${darkMode ? "bg-red-900 text-red-400" : "bg-red-100 text-red-700"}
                            `}
                            onClick={() =>  handleCancel(appt.$id)}
                           
                          >
                            ✖ Cancel
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* --- CANCELLED APPOINTMENTS (Table, Responsive) --- */}
            <div>
              <h2 className="text-xl font-semibold mb-4">Cancelled Appointments</h2>
              <div className={`
                hidden sm:block overflow-x-auto rounded-2xl shadow-2xl mb-8
                ${darkMode ? "bg-[#111418]/60 ring-1 ring-white/10" : "bg-white border border-gray-200"}
                backdrop-blur-md
              `}>
                <table className={`min-w-full border-collapse text-sm ${darkMode ? "text-white" : "text-gray-900"}`}>
                  <thead>
                    <tr className={`
                      ${darkMode
                        ? "text-gray-400 border-b border-white/10 bg-transparent"
                        : "text-gray-500 border-b border-gray-200 bg-[#f3f6fa]"
                      }
                    `}>
                      <th className="py-4 px-6 text-left font-medium">Date</th>
                      <th className="py-4 px-6 text-left font-medium">Time</th>
                      <th className="py-4 px-6 text-left font-medium">Hospital / Lab</th>
                      <th className="py-4 px-6 text-left font-medium">Doctor Name / Test Name</th>
                      <th className="py-4 px-6 text-left font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {cancelledAppointments.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="text-center py-8 text-gray-500">No cancelled appointments.</td>
                      </tr>
                    ) : (
                      cancelledAppointments.map(appt => {
                        const dateObj = new Date(appt.timestamp);
                        const date = dateObj.toLocaleDateString(undefined, { day: "2-digit", month: "short", year: "numeric" });
                        const time = dateObj.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit", hour12: true });
                        const isHospital = !!appt.hospitalId;
                        const institutionName = isHospital
                          ? hospitalNames[appt.hospitalId!] || "—"
                          : appt.labId
                          ? labNames[appt.labId] || "—"
                          : "—";
                        return (
                          <tr key={appt.$id} className={`
                            border-b
                            ${darkMode ? "border-white/10 hover:bg-white/5" : "border-gray-100 hover:bg-gray-50"}
                            transition-all
                          `}>
                            <td className="py-4 px-6">{date}</td>
                            <td className="py-4 px-6">{time}</td>
                            <td className="py-4 px-6">{institutionName}</td>
                            <td className="py-4 px-6">{appt.doctorName || appt.test || "—"}</td>
                            <td className="py-4 px-6">
                              <span className={`
                                inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold
                                ${darkMode ? "bg-red-900 text-red-400" : "bg-red-100 text-red-700"}
                              `}>
                                ✖ Cancelled
                              </span>
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
              {/* Mobile Card View for Cancelled */}
              <div className="sm:hidden space-y-4 mb-8">
                {cancelledAppointments.length === 0 ? (
                  <p className="text-center py-4 text-gray-400">No cancelled appointments.</p>
                ) : (
                  cancelledAppointments.map(appt => {
                    const dateObj = new Date(appt.timestamp);
                    const date = dateObj.toLocaleDateString(undefined, { day: "2-digit", month: "short", year: "numeric" });
                    const time = dateObj.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit", hour12: true });
                    const isHospital = !!appt.hospitalId;
                    const institutionName = isHospital
                      ? hospitalNames[appt.hospitalId!] || "—"
                      : appt.labId
                      ? labNames[appt.labId] || "—"
                      : "—";
                    return (
                      <div
                        key={appt.$id}
                        className={`
                          ring-1 rounded-xl p-4 shadow-xl backdrop-blur-md space-y-2
                          ${darkMode ? "bg-[#111418]/70 ring-white/10" : "bg-white ring-gray-200"}
                        `}
                      >
                        <div className="flex justify-between text-sm">
                          <span className={darkMode ? "text-white font-medium" : "text-gray-900 font-medium"}>{date}</span>
                          <span className={darkMode ? "text-gray-400" : "text-gray-500"}>{time}</span>
                        </div>
                        <div className={darkMode ? "text-sm text-white/90" : "text-sm text-gray-800"}>
                          <span className="font-semibold">
                            {appt.doctorName ? "Hospital" : appt.test ? "Lab" : "Hospital/Lab"}:
                          </span>{" "}
                          {institutionName}
                        </div>
                        <div className={darkMode ? "text-sm text-white/90" : "text-sm text-gray-800"}>
                          <span className="font-semibold">
                            {appt.doctorName ? "Doctor Name" : appt.test ? "Test" : "—"}:
                          </span>{" "}
                          {appt.doctorName || appt.test || "—"}
                        </div>
                        <div>
                          <span
                            className={`
                              inline-block px-3 py-1 rounded-full text-xs font-semibold
                              ${darkMode ? "bg-red-900 text-red-400" : "bg-red-100 text-red-700"}
                            `}
                          >
                            ✖ Cancelled
                          </span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </>
          )
        )}


        {selectedNav === "Medical_Records" && (
            <>
            <button
              className="mt-4 px-6 py-2 mb-4 rounded-lg bg-blue-700 text-white font-semibold hover:bg-blue-800"
              onClick={() => handleDownloadFullHistory(userId)}
            >
              Download Full Medical History (PDF)
            </button>
            <MedicalRecords userId={userId} darkMode={darkMode}/>
            </>
            )}
        {selectedNav === "Report_Problem" && (
            <></>
            )}
        {selectedNav === "First_Aid" && (
            <></>
            )}
        {selectedNav === "Book_Appointment" && (
            
            (() => {
                router.push(`/patients/${userId}/explore`);
                return null; // avoid rendering anything
              })()
            
            )}
        {selectedNav === "Settings" && (
         <></>
            )}
            </main>
        </div>

        {/* Cancel Appointment Form Modal */}
        {showCancelForm && selectedAppointmentId && (
          <CancelAppointmentForm
            appointmentId={selectedAppointmentId}
            onClose={() => {
              setShowCancelForm(false);
              setSelectedAppointmentId(null);
            }}
            onCancelConfirmed = {handleCancelConfirmed}
          />
        )}
    </div>

  );
}

const NavItem = ({
  icon,
  label,
  active = false,
  open = true,
  onClick,
  disabled = false,
}: {
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  open?: boolean;
  onClick: () => void;
  disabled : boolean;
}) => (
  <div
    onClick={!disabled ? onClick : undefined}
    className={`flex items-center gap-3 px-3 py-2 rounded-md cursor-pointer transition-all duration-300 whitespace-nowrap overflow-hidden ${
      active
        ? "bg-gray-200 dark:bg-[#222] text-black dark:text-white"
        : "hover:bg-gray-100 dark:hover:bg-[#222] text-gray-600 dark:text-gray-300"
    }`}
    aria-disabled={disabled}
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



