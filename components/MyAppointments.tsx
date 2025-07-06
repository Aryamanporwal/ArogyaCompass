"use client"
import React, { useEffect, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { getHospitalById } from "@/lib/actions/hospital.action";
import { getLabById } from "@/lib/actions/lab.action";
import { getAllAppointmentsByUserId } from "@/lib/actions/appointment.action";
import { getUserNameById } from "@/lib/actions/user.action";


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

const STATUS_CARDS = [
  {
    key: AppointmentStatus.Done,
    label: "Scheduled",
    icon: "/assets/icons/appointments.svg",
    bgColor: "bg-green-700",
    iconColor: "text-green-400",
  },
  {
    key: AppointmentStatus.Pending,
    label: "Pending",
    icon: "/assets/icons/pending.svg",
    bgColor: "bg-blue-700",
    iconColor: "text-blue-400",
  },
  {
    key: AppointmentStatus.Cancelled,
    label: "Cancelled",
    icon: "/assets/icons/cancelled.svg",
    bgColor: "bg-red-700",
    iconColor: "text-red-400",
  },
];

interface Props {
  userId: string;
}

export default function AppointmentDashboard({ userId }: Props) {
  const router = useRouter();
  const [name, setName] = useState<string | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedStatus, setSelectedStatus] = useState<AppointmentStatus>(AppointmentStatus.Pending);
  const [hospitalNames, setHospitalNames] = useState<Record<string, string>>({});
  const [labNames, setLabNames] = useState<Record<string, string>>({});

        useEffect(() => {
        async function fetchAppointments() {
            setLoading(true);
            try {
            const rawDocs = await getAllAppointmentsByUserId(userId);

            const docs: Appointment[] = rawDocs.map((doc: any) => ({
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
  const filteredAppointments = appointments.filter((appt) => appt.status === selectedStatus);

  // Counts for cards
  const counts = {
    [AppointmentStatus.Done]: appointments.filter((a) => a.status === AppointmentStatus.Done).length,
    [AppointmentStatus.Pending]: appointments.filter((a) => a.status === AppointmentStatus.Pending).length,
    [AppointmentStatus.Cancelled]: appointments.filter((a) => a.status === AppointmentStatus.Cancelled).length,
  };
  return (
      <div className="fixed inset-0 overflow-y-auto overflow-x-hidden bg-[#0f172a] text-white px-4 sm:px-8 py-6">
        {/* NavBar */}
        <nav className="flex items-center justify-between flex-wrap gap-4 sm:gap-6 mb-10 px-4 sm:px-6 py-3 sm:py-4 bg-gradient-to-br  bg-[#111418]/60 backdrop-blur-md ring-1 ring-white/10 rounded-2xl shadow-2xl border border-white/10">
          {/* Logo and Title */}
          <div className="flex items-center gap-3">
            <Image
              src="/assets/icons/logo.png"
              alt="ArogyaCompass Logo"
              width={55}
              height={55}
              className="rounded-lg sm:rounded-xl"
            />
            <span className="text-2xl sm:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-sky-500 to-cyan-400 drop-shadow-lg tracking-wide">
              ArogyaCompass
            </span>
          </div>

          {/* Profile - Hidden on small screens */}
          <div className="hidden sm:flex items-center gap-3 cursor-pointer">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-semibold shadow-inner">
              {name?.charAt(0).toUpperCase()}
            </div>
            <span className="text-white font-medium tracking-wide">{name}</span>
          </div>
        </nav>


        {/* Header */}
        <div className="mb-8 text-center sm:text-left">
          <h1 className="text-3xl sm:text-4xl font-bold text-white tracking-wide">
            Welcome, <span className="text-blue-400">{name}</span>
          </h1>
          <p className="text-gray-400 mt-2 text-sm">
            Start your day by managing new appointments with ease
          </p>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
          {STATUS_CARDS.map(({ key, label, icon }) => (
            <div
              key={key}
              onClick={() => setSelectedStatus(key)}
              className={`cursor-pointer group relative overflow-hidden rounded-2xl px-6 py-5 flex items-center gap-5 shadow-lg transition-all duration-300 border border-white/10 ${
                selectedStatus === key
                  ? "bg-gradient-to-br from-[#1a1a1a]/70 via-[#111827]/60 to-[#1a1a1a]/70"
                  : "bg-gradient-to-br from-[#1a1a1a]/50 via-[#111827]/40 to-[#1a1a1a]/50 hover:brightness-110"
              } backdrop-blur-md`}
            >
              {/* Icon circle */}
              <div className="p-3 rounded-xl bg-white/10 backdrop-blur-sm flex items-center justify-center shadow-md">
                <Image src={icon} alt={label} width={32} height={32} className="text-white" />
              </div>

              {/* Text */}
              <div>
                <p className="text-3xl font-semibold text-white drop-shadow-sm">{counts[key]}</p>
                <p className="text-sm text-white/70 tracking-wide mt-1">
                  Total number of <span className="font-medium text-white">{label.toLowerCase()}</span> appointments
                </p>
              </div>

              {/* Hover Light */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-10 transition duration-300 pointer-events-none bg-white rounded-2xl blur-lg" />
            </div>
          ))}
        </div>

        {/* Table */}
          <div className="w-full">
            <div className="hidden sm:block overflow-x-auto rounded-2xl shadow-2xl bg-[#111418]/60 backdrop-blur-md ring-1 ring-white/10">
              <table className="min-w-full border-collapse text-sm text-white">
                <thead>
                  <tr className="text-gray-400 border-b border-white/10">
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
                  ) : filteredAppointments.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center py-8 text-gray-500">No appointments found.</td>
                    </tr>
                  ) : (
                    filteredAppointments.map((appt) => {
                      const dateObj = new Date(appt.timestamp);
                      const date = dateObj.toLocaleDateString(undefined, { day: "2-digit", month: "short", year: "numeric" });
                      const time = dateObj.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit", hour12: true });

                      const isHospital = !!appt.hospitalId;
                      const institutionName = isHospital
                        ? hospitalNames[appt.hospitalId!] || "—"
                        : appt.labId
                        ? labNames[appt.labId] || "—"
                        : "—";

                      const statusStyles = {
                        done: "bg-green-900 text-green-400",
                        pending: "bg-blue-900 text-blue-400",
                        cancelled: "bg-red-900 text-red-400",
                      };

                      const statusLabel = {
                        done: "✓ Scheduled",
                        pending: "⏳ Pending",
                        cancelled: "✖ Cancelled",
                      };

                      return (
                        <tr key={appt.$id} className="border-b border-white/10 hover:bg-white/5 transition-all">
                          <td className="py-4 px-6">{date}</td>
                          <td className="py-4 px-6">{time}</td>
                          <td className="py-4 px-6">{institutionName}</td>
                          <td className="py-4 px-6">{appt.doctorName || appt.test || "—"}</td>
                          <td className="py-4 px-6">
                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold ${statusStyles[appt.status]}`}>
                              {statusLabel[appt.status]}
                            </span>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Card View for mobile */}
            <div className="sm:hidden space-y-4">
              {loading ? (
                <p className="text-center py-4 text-gray-400">Loading...</p>
              ) : filteredAppointments.length === 0 ? (
                <p className="text-center py-4 text-gray-400">No appointments found.</p>
              ) : (
                filteredAppointments.map((appt) => {
                  const dateObj = new Date(appt.timestamp);
                  const date = dateObj.toLocaleDateString(undefined, { day: "2-digit", month: "short", year: "numeric" });
                  const time = dateObj.toLocaleTimeString(undefined, { hour: "2-digit", minute: "2-digit", hour12: true });

                  const isHospital = !!appt.hospitalId;
                  const institutionName = isHospital
                    ? hospitalNames[appt.hospitalId!] || "—"
                    : appt.labId
                    ? labNames[appt.labId] || "—"
                    : "—";

                  const statusStyles = {
                    done: "bg-green-900 text-green-400",
                    pending: "bg-blue-900 text-blue-400",
                    cancelled: "bg-red-900 text-red-400",
                  };

                  const statusLabel = {
                    done: "✓ Scheduled",
                    pending: "⏳ Pending",
                    cancelled: "✖ Cancelled",
                  };

                  return (
                    <div key={appt.$id} className="bg-[#111418]/70 ring-1 ring-white/10 rounded-xl p-4 shadow-xl backdrop-blur-md space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-white font-medium">{date}</span>
                        <span className="text-gray-400">{time}</span>
                      </div>
                      <div className="text-sm text-white/90">
                         <span className="font-semibold">
                            {appt.doctorName ? "Hospital" : appt.test ? "Lab" : "Hospital/Lab"}:
                          </span>{" "}
                          {institutionName}
                      </div>
                      <div className="text-sm text-white/90">
                        <span className="font-semibold">
                            {appt.doctorName ? "Doctor Name" : appt.test ? "Test" : "—"}:
                          </span>{" "}
                          {appt.doctorName || appt.test || "—"}
                      </div>
                      <div>
                        <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${statusStyles[appt.status]}`}>
                          {statusLabel[appt.status]}
                        </span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>


        {/* Book Appointment Button */}
        <div className="flex justify-center sm:justify-end mt-8">
          <button
            onClick={() => router.push(`/patients/${userId}/explore`)}
            className="group relative inline-flex items-center justify-center overflow-hidden rounded-2xl px-6 py-3 font-semibold text-white shadow-xl transition-all duration-300 bg-gradient-to-br from-green-400 via-green-600 to-emerald-700 hover:from-green-500 hover:via-emerald-700 hover:to-green-800 focus:outline-none"
          >
            <span className="absolute inset-0 w-full h-full cursor-pointer bg-white opacity-10 transition-opacity duration-300 group-hover:opacity-20 rounded-2xl"></span>
            <span className="relative z-10 flex cursor-pointer items-center gap-2">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
              Book a new Appointment
            </span>
          </button>
        </div>
      </div>
    );


}
