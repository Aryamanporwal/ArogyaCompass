"use client";
import {
  Home,
  ClipboardList,
  Users,
  AlertTriangle,
  Sun,
  Moon,
  LogOut,
  Search,
  CalendarDays,
  Clock,
  Settings,
  Mail,
  Phone,
//   PlusSquare,
} from "lucide-react";
import Image from "next/image";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getAppointmentsByAssistant, getAssistantById, handleResetPasskey } from "@/lib/actions/assistant.action";
import DoctorLabInfoCard from "./ui/doctorLabInfoCard";
import { Models } from "node-appwrite";
import { getPatient, getPatientWithDetail } from "@/lib/actions/patient.action";
import BroadcastMessageBox from "./ui/broadcastMessageBox";
import MessageCurrentOrAllPatients from "./ui/messageCurrentorAll";

interface PageProps {
  params: {
    assistantId: string;
  };
}

interface docData {
  name: string; 
  email : string;
  phone: string;
  address: string;
  logoUrl: string;
  doctorId?: string;
  labId?: string;
}

export type Appointment = {
  $id: string;
  labId?: string;
  hospitalId?: string;
  doctorName?: string;
  city: string;
  state: string;
  timestamp: string; // ISO format string
  status: "pending" | "completed" | "cancelled" | string;
//   test: string;
  userId: string;
  cancelReason?: string;
};

export type Patient = {
  $id: string;
  userId: string;
  email: string;
  phone: string;
  name: string;
  privacyConsent: boolean;
  gender: "Male" | "Female" | "Other" | string;
  address?: string;
  occupation?: string;
  emergencyContactNumber?: string;
  insuranceProvider?: string;
  insurancePolicyNumber?: string;
  allergies?: string;
  currentMedication?: string;
  familyMedicalHistory?: string;
  pastMedicalHistory?: string;
  identificationType?: string;
  identificationDocument?: string;
  identificationNumber?: string;
  primaryPhysician?: string;
  emergencyContactName?: string;
  treatmentConsent: boolean;
  disclosureConsent: boolean;
  test?: string;
  identificationDocumentId?: string;
  identificationDocumentUrl?: string;
  birthDate: string; // ISO format string
};

const navItems = [
  { label: "Dashboard", icon: <Home size={20} /> },
  { label: "Appointments", icon: <ClipboardList size={20} /> },
  { label: "Management", icon: <Users size={20} /> },
  { label: "Emergency", icon: <AlertTriangle size={20} /> },
  { label: "Settings", icon: <Settings size={20} /> },
];

export default function AssistantDashboard({params}: PageProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [selectedNav, setSelectedNav] = useState("Dashboard");
  const [assistant, setAssistant] = useState<docData | null>(null);
  const [appointments, setAppointments] = useState<Models.Document[]>([]);
  const [totalCount, setTotalCount] = useState(0);
  const [pendingCount, setPendingCount] = useState(0);
  const [appointmentPatientList, setAppointmentPatientList] = useState<{ appointment: Appointment; patient: Patient | null }[]>([]);
  const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
  const [currentPatient, setCurrentPatient] = useState<Patient | null>(null);
  const [showAllPatients, setShowAllPatients] = useState(false);
  const [showAllAppointments, setShowAllAppointments] = useState(false);
  const [selectedAppointmentId, setSelectedAppointmentId] = useState<string | null>(null);
  const [passkey, setPasskey] = useState("");

  const router = useRouter();

    useEffect(() => {
      const fetchLab = async () => {
        const doc = await getAssistantById(params.assistantId);
        
        // Map the returned Document to docData type if necessary
        if (doc && typeof doc === "object") {
          setAssistant({
            name: doc.name,
            email: doc.email,
            phone: doc.phone,
            address: doc.address,
            logoUrl: doc.logoUrl,
            doctorId: doc?.doctorId,
            labId: doc?.labId, // Ensure test is an array
          });
        } else {
          setAssistant(null);
        }
      };
      fetchLab();
    }, [params.assistantId]);
  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
  }, [darkMode]);


  useEffect(() => {
    const fetchAppointments = async () => {
        if (!assistant) return;
        const res = await getAppointmentsByAssistant(
            params.assistantId // Assuming lab.labId is the correct identifier
        );

        const allAppointments = res?.documents || [];
        setAppointments(allAppointments);
        setTotalCount(allAppointments.length); 

        // Filter pending
        const pending = allAppointments.filter(
            (a) => a.status?.toLowerCase() === "pending"
        );
        setPendingCount(pending.length);
    };

    fetchAppointments();
    }, [assistant, params.assistantId]);


    useEffect(() => {
        const fetchPatientsForAppointments = async () => {
            if (!appointments.length) return;

            const listWithPatients = await Promise.all(
            appointments.map(async (appt) => {
                const patient = await getPatient(appt.userId);
                // Map Models.Document to Appointment type
                const mappedAppointment: Appointment = {
                  $id: appt.$id,
                  labId: appt.labId,
                  hospitalId: appt.hospitalId,
                  doctorName : appt.doctorName,
                  city: appt.city,
                  state: appt.state,
                  timestamp: appt.timestamp,
                  status: appt.status,
                //   test: appt.test,
                  userId: appt.userId,
                  
                  cancelReason: appt.cancelReason,
                };
                return {
                  appointment: mappedAppointment,
                  patient: patient || null,
                };
            })
            );

            setAppointmentPatientList(listWithPatients);
        };

        fetchPatientsForAppointments();
        }, [appointments]);

        useEffect(() => {
        const fetchSelectedPatient = async () => {
            if (!selectedPatientId) return;

            // Find the matching appointment
            const selectedAppointment = appointmentPatientList.find(
            (item) => item.appointment.userId === selectedPatientId
            );

            const doctorName = selectedAppointment?.appointment?.doctorName;

            const patientData = await getPatientWithDetail(selectedPatientId, doctorName);
            setCurrentPatient(patientData as Patient);
        };

        fetchSelectedPatient();
        }, [selectedPatientId, appointmentPatientList]);

            
    const validPatients = appointmentPatientList
    .map((item) => item.patient)
    .filter((p): p is Patient => !!p && !!p.phone);

    const allPatients = appointmentPatientList
        .map((item) => item.patient)
        .filter((p): p is Patient => !!p?.phone);

        const patientIndex = allPatients.findIndex(
        (p) => p?.userId === selectedPatientId
        );

  const handleSignOut = () => {
    router.push("/");
  };

   const handleResetLabPasskey = async () => {
              const confirmed = confirm("Are you sure you want to reset your passkey?");
              if (!confirmed) return;
  
              // Call Appwrite function or backend logic here
              const res = await handleResetPasskey(params.assistantId);
              if (res) {
                alert(res.message || "Passkey reset successfully. Please check your email for the new passkey.");
              } else {
                alert("Failed to reset passkey. Please try again later.");
              }
            };

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
                alt="Assistant"
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
              {navItems.map((item) => (
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
          <div className="flex flex-col gap-3">
            <button
              className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-white"
              onClick={() => setDarkMode(!darkMode)}
            >
              {darkMode ? <Sun size={16} /> : <Moon size={16} />}
              {sidebarOpen && (
                <span>{darkMode ? "Light Mode" : "Dark Mode"}</span>
              )}
            </button>
            <button
              className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-white"
              onClick={handleSignOut}
            >
              <LogOut size={16} />
              {sidebarOpen && <span>Sign out</span>}
            </button>
          </div>
        </aside>

        {/* Main Content */}
        <main
          className={`flex-1 pt-6 sm:pt-10 px-4 sm:px-10 transition-all duration-300 ease-in-out overflow-y-auto ${
            sidebarOpen ? "sm:ml-4 ml-15" : "sm:ml-4 ml-15"
          }`}
        >
          {selectedNav === "Dashboard" && (
            <>
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            <div className="flex flex-col gap-1 mb-4">
            <h1 className="text-2xl font-semibold">Welcome, Mr. {assistant?.name}</h1>
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
                src={assistant?.logoUrl || "/assets/images/dr-cameron.png"}
                alt="Assistant"
                className="border w-full h-full object-cover"
                width={18}
                height={18}
              />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
            <StatCard
              icon={<CalendarDays size={24} className="text-blue-600" />}
              title="Upcoming Appointments"
              value={pendingCount}
            />
            <StatCard
              icon={<Users size={24} className="text-green-600" />}
              title="Total Patients"
              value={totalCount}
            />
            <DoctorLabInfoCard doctorId={assistant?.doctorId} labId={assistant?.labId} />
          </div>  


          <BroadcastMessageBox  patients={validPatients} />


          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pb-10">
            {/* Appointments Section */}
            <div className="bg-white dark:bg-[#1e1e1e] p-6 rounded-xl shadow-md">
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
            </div>

            {/* Patients Section */}
            <div className="bg-white dark:bg-[#1e1e1e] p-6 rounded-xl shadow-md">
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
            </div>
          </div>               
            </>
          )}
        {selectedNav === "Appointments" ? (
            currentPatient  && selectedAppointmentId ? (
             <div className="flex flex-col mb-6 sm:flex-row gap-6">
                <div className="bg-white dark:bg-[#1e1e1e] p-6 rounded-xl shadow-md w-full sm:w-1/2 mx-auto">
                <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
                    Patient Details
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                    {[
                    { label: "Name", value: currentPatient.name },
                    { label: "Email", value: currentPatient.email },
                    { label: "Phone", value: currentPatient.phone },
                    { label: "Gender", value: currentPatient.gender },
                    { label: "Birth Date", value: new Date(currentPatient.birthDate).toLocaleDateString() },
                    { label: "Address", value: currentPatient.address || "N/A" },
                    { label: "Occupation", value: currentPatient.occupation || "N/A" },
                    { label: "Emergency Contact Name", value: currentPatient.emergencyContactName || "N/A" },
                    { label: "Emergency Contact Number", value: currentPatient.emergencyContactNumber || "N/A" },
                    { label: "Insurance Provider", value: currentPatient.insuranceProvider || "N/A" },
                    { label: "Insurance Policy No", value: currentPatient.insurancePolicyNumber || "N/A" },
                    { label: "Allergies", value: currentPatient.allergies || "N/A" },
                    { label: "Current Medication", value: currentPatient.currentMedication || "N/A" },
                    { label: "Family Medical History", value: currentPatient.familyMedicalHistory || "N/A" },
                    { label: "Past Medical History", value: currentPatient.pastMedicalHistory || "N/A" },
                    { label: "Test", value: currentPatient.test || "N/A" },
                    {label : "Primary Physician", value: currentPatient.primaryPhysician || "N/A" },
                    { label: "Identification Number", value: currentPatient.identificationNumber || "N/A" },
                    ].map((item, idx) => (
                    <div
                        key={idx}
                        className="p-3 rounded-md border bg-gray-50 dark:bg-[#2b2b2b] dark:border-gray-700"
                    >
                        <p className="text-gray-500 dark:text-gray-400 text-xs mb-1">{item.label}</p>
                        <p className="text-gray-800 dark:text-gray-100 font-medium break-words">
                        {item.value}
                        </p>
                    </div>
                    ))}
                </div>
                </div>
                
                    <MessageCurrentOrAllPatients
                    currentPatient={currentPatient}
                    allPatients={allPatients}
                    patientIndex={patientIndex}
                    onSuccess = {()=>{setSelectedNav("Dashboard")}}
                    />
                
                </div>
            ) : (
                <div className="bg-white dark:bg-[#1e1e1e] p-6 rounded-xl shadow-md w-full justify-center sm:w-1/2 mx-auto text-center">
                <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">Oops!! Assistant</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                    Please select a patient to review from the dashboard.
                </p>
                </div>
            )
            
            ) : null}
          {selectedNav === "Management" && (
            <div>
              {/* Management content goes here */}
            </div>
          )}
          {selectedNav === "Emergency" && (
            <div>
              {/* Emergency content goes here */}
            </div>
          )}

        {selectedNav === "Settings" && (
            <>
            
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
                  src={assistant?.logoUrl || "/assets/icons/user.svg"}
                  alt="Lab Profile"
                  width={112}
                  height={112}
                  className="object-cover w-full h-full"
                />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 w-full">
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Full Name</p>
                  <p className="text-base font-semibold text-gray-900 dark:text-white">{assistant?.name}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Email</p>
                  <p className="text-base font-semibold text-gray-900 dark:text-white break-all">{assistant?.email}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Phone Number</p>
                  <p className="text-base font-semibold text-gray-900 dark:text-white">{assistant?.phone}</p>
                </div>
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Address</p>
                  <p className="text-base font-semibold text-gray-900 dark:text-white">{assistant?.address || "N/A"}</p>
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
                    const AssistantName = assistant?.name || "";
                    const lastTwo = AssistantName.slice(-2).toUpperCase();
                    const expectedKey = `ASSI${lastTwo}`;

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
           </>
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
