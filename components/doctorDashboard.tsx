"use client";
import {
  CalendarDays,
  Users,
  PlusSquare,
  Search,
  LogOut,
  Settings,
  Home,
  ClipboardList,
  Sun,
  Moon,
  UserPlus
} from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";
import { getAppointmentsByDoctorAndHospital, getDoctorById } from "@/lib/actions/doctor.action";
import { Models } from "node-appwrite";
import { getPatient } from "@/lib/actions/patient.action";
import AssistantRegistration from "./form/AssistantRegistrationForm";
import { getAssistantsByDoctorId } from "@/lib/actions/assistant.action";
import DoctorReportForm from "./form/DoctorReportForm";
import MedicalRecordList from "./medicalrecord";

interface PageProps {
  params: {
    doctorId: string;
  };
}

interface docData {
  Name: string; 
  Email : string;
  phone: string;
  Address: string;
  City: string;
  licenseNumber: string;
  logoUrl: string;
  speciality: string[];
  availability:string[];
  experience: number;
  hospitalId?: string; // Assuming hospitalId is part of the document
}


export type Appointment = {
  $id: string;
  hospitalId: string;
  doctorName: string;
  city: string;
  state: string;
  timestamp: string; // ISO format string
  status: "pending" | "completed" | "cancelled" | string;
  labId: string;
  test: string;
  userId: string;
  cancelReason?: string;
  doctorId?: string;
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


// const appointments = [
//   { time: "08:00 AM", name: "John Doe", type: "Follow-up" },
//   { time: "10:00 AM", name: "Jane Smith", type: "Consultation" },
//   { time: "11:30 AM", name: "Michael Brown", type: "Check-up" },
// ];


export default function DoctorDashboard({ params }: PageProps) {
   const [showAllAppointments, setShowAllAppointments] = useState(false);
   const [doctor, setDoctor] = useState<docData | null>(null);
   const [sidebarOpen, setSidebarOpen] = useState(false);
   const [darkMode, setDarkMode] = useState(false);
   const [selectedNav, setSelectedNav] = useState("Dashboard");
   const [appointments, setAppointments] = useState<Models.Document[]>([]);
   const [pendingCount, setPendingCount] = useState(0);
   const [totalCount, setTotalCount] = useState(0);
   const [appointmentPatientList, setAppointmentPatientList] = useState<{ appointment: Appointment; patient: Patient | null }[]>([]);
   const [showAllPatients, setShowAllPatients] = useState(false);
   const [selectedPatientId, setSelectedPatientId] = useState<string | null>(null);
   const [currentPatient, setCurrentPatient] = useState<Patient | null>(null);
   const [selectedAppointmentId, setSelectedAppointmentId] = useState<string | null>(null);

   interface Assistant {
     name: string;
     email: string;
     phone: string;
     address: string;
     logo: string;
     logoUrl: string;
     logoId: string;
     timestamp: string;
     doctorId: string;
     labId: string;
   }
   const [assistants, setAssistants] = useState<Assistant[]>([]);

  useEffect(() => {
    document.documentElement.classList.toggle("dark", darkMode);
  }, [darkMode]);

  useEffect(() => {
    const fetchDoctor = async () => {
      const doc = await getDoctorById(params.doctorId);
      
      // Map the returned Document to docData type if necessary
      if (doc && typeof doc === "object") {
        setDoctor({
          Name: doc.Name,
          Email: doc.Email,
          phone: doc.phone,
          Address: doc.Address,
          City: doc.City,
          licenseNumber: doc.licenseNumber,
          logoUrl: doc.logoUrl,
          speciality: Array.isArray(doc.speciality) ? doc.speciality : [],
          availability: Array.isArray(doc.availability) ? doc.availability : [],
          experience: typeof doc.experience === "number" ? doc.experience : 0,
          hospitalId: doc.hospitalId || "", // Assuming hospitalId is part of the document
        });
      } else {
        setDoctor(null);
      }
    };
    fetchDoctor();
  }, [params.doctorId]);


    useEffect(() => {
    const fetchAppointments = async () => {
        if (doctor?.Name && doctor?.hospitalId) {
        const res = await getAppointmentsByDoctorAndHospital(
            doctor.Name,
            doctor.hospitalId
        );

        const allAppointments = res?.documents || [];
        setAppointments(allAppointments);
        setTotalCount(allAppointments.length); 

        // Filter pending
        const pending = allAppointments.filter(
            (a) => a.status?.toLowerCase() === "pending"
        );
        setPendingCount(pending.length);
        }
    };

    fetchAppointments();
    }, [doctor]);

    useEffect(() => {
        const fetchPatientsForAppointments = async () => {
            if (!appointments.length) return;

            const listWithPatients = await Promise.all(
            appointments.map(async (appt) => {
                const patient = await getPatient(appt.userId);
                // Map Models.Document to Appointment type
                const mappedAppointment: Appointment = {
                  $id: appt.$id,
                  hospitalId: appt.hospitalId,
                  doctorName: appt.doctorName,
                  city: appt.city,
                  state: appt.state,
                  timestamp: appt.timestamp,
                  status: appt.status,
                  labId: appt.labId,
                  test: appt.test,
                  userId: appt.userId,
                  cancelReason: appt.cancelReason,
                  doctorId: appt.doctorId,
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
            const fetchAssistants = async () => {
              if (params.doctorId) {
                const result = await getAssistantsByDoctorId(params.doctorId);
        
                const mapped = result.map((doc) => ({
                  name: doc.name,
                  email: doc.email,
                  phone: doc.phone,
                  address: doc.address,
                  logo: doc.logo,
                  logoUrl: doc.logoUrl,
                  logoId: doc.logoId,
                  timestamp: doc.timestamp,
                  doctorId: doc.doctorId,
                  labId: doc.labId,
                }));
        
                setAssistants(mapped);
              }
            };
            fetchAssistants();
          }, [params.doctorId]);



          useEffect(() => {
            const fetchSelectedPatient = async () => {
                if (selectedPatientId) {
                const patientData = await getPatient(selectedPatientId);
                setCurrentPatient(patientData);
                }
            };
            fetchSelectedPatient();
            }, [selectedPatientId]);
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
                alt="Doctor"
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
                icon={<Users size={20} />}
                label="Patients"
                active={selectedNav === "Patients"}
                open={sidebarOpen}
                onClick={() => setSelectedNav("Patients")}
              />
              <NavItem
                icon={<UserPlus size={20} />}
                label="Add Assistants"
                active={selectedNav === "Add Patient"}
                open={sidebarOpen}
                onClick={() => setSelectedNav("Add Patient")}
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
            <button className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-300 dark:hover:text-white">
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
            <h1 className="text-2xl font-semibold">Welcome, Dr. {doctor?.Name}</h1>
            <div className="flex items-center gap-4">
              <div className="relative">
                <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
                <input
                  type="text"
                  placeholder="Search"
                  className="pl-9 pr-3 py-2 rounded-md border border-gray-300 text-sm dark:bg-[#121212] dark:border-gray-600 dark:text-white"
                />
              </div>
              <Image
                src={doctor?.logoUrl || "/assets/icons/dr-cameron.png"}
                alt="Doctor"
                width={36}
                height={36}
                className="rounded-full border "
              />
            </div>
          </div>

          {/* Stats */}
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
            <StatCard
              icon={<PlusSquare size={24} className="text-indigo-600" />}
              title="Assistants on duty"
              value={assistants?.length || 0}
            />
          </div>

          {/* Appointments & Patients */}
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


        {selectedNav === "Add Patient" && (
            <>
                {/* Greeting */}
                <div className="mb-6">
                <h1 className="text-xl font-semibold">Hy, Doctor</h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                    {new Date().toLocaleDateString("en-IN", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                    })}
                </p>
                </div>

                {/* Assistants on Duty */}
                <div className="mb-8 p-6 rounded-xl shadow-md bg-white dark:bg-[#2a2a2a]">
                <h3 className="text-lg font-semibold mb-4 text-gray-800 dark:text-gray-100">
                    Assistants on Duty
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {assistants.map((a, i) => (
                    <div
                        key={i}
                        className="flex items-center p-4 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-[#3a3a3a] shadow-sm"
                    >
                        <div className="w-16 h-16 rounded-full overflow-hidden border border-gray-300 dark:border-gray-600 mr-4">
                        {a.logoUrl ? (
                            <Image
                            src={a.logoUrl}
                            alt={a.name}
                            width={64}
                            height={64}
                            className="object-cover w-full h-full"
                            />
                        ) : (
                            <div className="bg-gray-200 dark:bg-gray-600 w-full h-full flex items-center justify-center text-xs text-gray-600 dark:text-white">
                            No Img
                            </div>
                        )}
                        </div>
                        <div>
                        <p className="text-sm font-semibold text-gray-800 dark:text-white">{a.name}</p>
                        <p className="text-xs text-gray-600 dark:text-gray-300">{a.email}</p>
                        <p className="text-xs text-gray-600 dark:text-gray-300">{a.phone}</p>
                        </div>
                    </div>
                    ))}
                </div>
                </div>
                <div className="mt-4">
                    {doctor && <AssistantRegistration doctorId={params.doctorId} />}
                </div>
            </>
            )}
        {selectedNav === "Appointments" ? (
            currentPatient  && selectedAppointmentId ? (
             <div className="flex flex-col sm:flex-row gap-6">
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
                    { label: "Primary Physician", value: currentPatient.primaryPhysician || "N/A" },
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
                <DoctorReportForm
                    doctorId={params.doctorId}
                    doctorName={doctor?.Name || ""}
                    doctorPhone={doctor?.phone || ""}
                    userId={currentPatient.userId}
                    appointmentId={selectedAppointmentId}
                />
                </div>
            ) : (
                <div className="bg-white dark:bg-[#1e1e1e] p-6 rounded-xl shadow-md w-full justify-center sm:w-1/2 mx-auto text-center">
                <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2">Oops!! Doctor</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">
                    Please select a patient to review from the dashboard.
                </p>
                </div>
            )
            
            ) : null}

        {selectedNav === "Patients" && (
          // <div className="bg-white dark:bg-[#1e1e1e] p-6 rounded-xl shadow-md w-full sm:w-1/2 mx-auto">
          //   <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">
          //     Patient List
          //   </h3>

          //   <div className="relative mb-4">
          //     <Search className="absolute left-2.5 top-2.5 text-gray-400" size={16} />
          //     <input
          //       type="text"
          //       placeholder="Search patients"
          //       className="pl-8 pr-3 py-1.5 rounded-md border border-gray-300 text-sm dark:bg-[#121212] dark:border-gray-600 dark:text-white w-full"
          //       // Optional: add onChange for search
          //     />

              <MedicalRecordList doctorId={params.doctorId} />

            // </div>

            // <ul className="space-y-2">
            //   {(showAllPatients
            //     ? appointmentPatientList
            //     : appointmentPatientList.slice(0, 5)
            //   ).map(({ patient }, index) => (
            //     <li
            //       key={index}
            //       className="flex justify-between items-center px-3 py-2 bg-gray-100 dark:bg-[#2b2b2b] rounded-md hover:shadow transition-all"
            //     >
            //       <span className="text-sm font-medium text-gray-800 dark:text-white">
            //         {patient?.name || "Unknown"}
            //       </span>
            //       <span className="text-sm text-blue-500">
            //         {patient?.gender || "N/A"}
            //       </span>
            //     </li>
            //   ))}
            // </ul>

            // {appointmentPatientList.length > 5 && (
            //   <button
            //     onClick={() => setShowAllPatients(!showAllPatients)}
            //     className="mt-4 text-blue-600 text-sm hover:underline"
            //   >
            //     {showAllPatients ? "Show less" : "View all"}
            //   </button>
            // )}
          // </div>
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