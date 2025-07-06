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
    <div className="min-h-screen bg-[#0f172a] text-white px-8 py-6">
      {/* Navbar */}
      <nav className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <Image src="/assets/icons/logo.png" alt="ArogyaCompass Logo" width={40} height={40} />
          <span className="text-2xl font-bold bg-gradient-to-r from-blue-400 via-blue-600 to-blue-400 bg-clip-text text-transparent">
            ArogyaCompass
          </span>
        </div>
        {/* Placeholder for user/avatar */}
        <div className="flex items-center gap-2 cursor-pointer">
          <div className="rounded-full bg-blue-600 text-white w-8 h-8 flex items-center justify-center font-semibold">A</div>
          <span>Admin</span>
        </div>
      </nav>

      {/* Header */}
      <h1 className="text-3xl font-semibold mb-1">Welcome, {name}</h1>
      <p className="text-gray-400 mb-8">Start day with managing new appointments</p>

      {/* Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
        {STATUS_CARDS.map(({ key, label, icon, bgColor, iconColor }) => (
          <div
            key={key}
            onClick={() => setSelectedStatus(key)}
            className={`cursor-pointer rounded-xl p-6 flex items-center gap-6 shadow-md transition ${
              selectedStatus === key ? "bg-[#1e293b]" : "bg-[#172031]"
            }`}
          >
            <div className={`rounded-lg p-3 ${bgColor} flex items-center justify-center`}>
              <Image src={icon} alt={label} width={28} height={28} className={iconColor} />
            </div>
            <div>
              <div className="text-3xl font-bold">{counts[key]}</div>
              <div className="text-gray-400 text-sm mt-1">
                Total number of {label.toLowerCase()} appointments
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Table */}
      <div className="overflow-x-auto bg-[#172031] rounded-xl shadow-lg">
        <table className="min-w-full border-collapse">
          <thead>
            <tr className="text-gray-400 text-left text-sm border-b border-gray-700">
              {/* <th className="py-4 px-6">Appointment Number</th> */}
              <th className="py-4 px-6">Date</th>
              <th className="py-4 px-6">Time</th>
              {/* <th className="py-4 px-6">Doctor / Test</th> */}
              <th className="py-4 px-6">Hospital / Lab</th>
              <th className="py-4 px-6">Doctor Name / Test Name</th>
              <th className="py-4 px-6">Status</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} className="text-center py-8 text-gray-500">
                  Loading...
                </td>
              </tr>
            ) : filteredAppointments.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-8 text-gray-500">
                  No appointments found.
                </td>
              </tr>
            ) : (
              filteredAppointments.map((appt) => {
                const dateObj = new Date(appt.timestamp);
                const date = dateObj.toLocaleDateString(undefined, {
                  day: "2-digit",
                  month: "short",
                  year: "numeric",
                });
                const time = dateObj.toLocaleTimeString(undefined, {
                  hour: "2-digit",
                  minute: "2-digit",
                  hour12: true,
                });
                const isHospital = !!appt.hospitalId;
                const institutionName = isHospital
                  ? hospitalNames[appt.hospitalId!] || "—"
                  : appt.labId
                  ? labNames[appt.labId] || "—"
                  : "—";
                return (
                  <tr
                    key={appt.$id}
                    className="border-b border-gray-700 hover:bg-[#1e293b] transition"
                  >
                    {/* <td className="py-4 px-6 font-medium">{appt.appointmentNumber || appt.$id}</td> */}
                    <td className="py-4 px-6">{date}</td>
                    <td className="py-4 px-6">{time}</td>
                    {/* <td className="py-4 px-6">{appt.doctorName ? "Doctor" : appt.test ? "Test" : "—"}</td> */}
                    <td className="py-4 px-6">{institutionName}</td>
                    <td className="py-4 px-6">{appt.doctorName || appt.test || "—"}</td>
                    <td className="py-4 px-6">
                      {appt.status === AppointmentStatus.Done && (
                        <span className="inline-flex items-center px-3 py-1 rounded bg-green-700 text-green-300 font-semibold text-xs">
                          &#10003; Scheduled
                        </span>
                      )}
                      {appt.status === AppointmentStatus.Pending && (
                        <span className="inline-flex items-center px-3 py-1 rounded bg-blue-700 text-blue-300 font-semibold text-xs">
                          &#8987; Pending
                        </span>
                      )}
                      {appt.status === AppointmentStatus.Cancelled && (
                        <span className="inline-flex items-center px-3 py-1 rounded bg-red-700 text-red-300 font-semibold text-xs">
                          &#10060; Cancelled
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Book Appointment Button */}
      <div className="flex justify-end mt-8">
        <button
          onClick={() => router.push(`/patients/${userId}/explore`)}
          className="bg-gradient-to-r from-green-500 via-green-600 to-green-700 px-6 py-3 rounded-lg font-semibold shadow hover:from-green-600 hover:to-green-800 transition"
        >
          Book a new Appointment
        </button>
      </div>
    </div>
  );
}
