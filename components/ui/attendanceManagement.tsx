import { useEffect, useState } from "react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from "recharts";
import { format } from "date-fns";
import { CalendarDays } from "lucide-react";
import { getAttendanceByAssistantId, markAttendance } from "@/lib/actions/attendance.action";

interface AttendanceDocument {
  date: string;
  status: string[];
  remark?: string;
}

interface Props {
  assistantId: string;
}

// interface AttendanceDocumentFromDB {
//   date: string;
//   status: string[];
//   remark?: string;
//   // Include other fields Appwrite returns if you need them, e.g.:
//   $id?: string;
//   $createdAt?: string;
//   // ...etc
// }

const AttendanceManagement = ({ assistantId }: Props) => {
  const [attendanceData, setAttendanceData] = useState<AttendanceDocument[]>([]);
  const [filter, setFilter] = useState<"monthly" | "yearly">("monthly");
  const [status, setStatus] = useState<"present" | "absent" | "leave">("present");
  const [remark, setRemark] = useState("");
  const [todayMarked, setTodayMarked] = useState(false);

useEffect(() => {
  if (!assistantId) return;
  const fetchAttendance = async () => {
    const data = await getAttendanceByAssistantId(assistantId, filter);
    if (data) {
      setAttendanceData(
        data.documents.map((doc) => ({
          date: doc.date,
          status: doc.status,
          remark: doc.remark,
        }))
      );
      // Check if today is already marked
      const todayISO = new Date().toISOString().split("T")[0];
      const found = data.documents.some(
        (doc) => doc.date.split("T")[0] === todayISO
      );
      setTodayMarked(found);
    }
  };
  fetchAttendance();
}, [assistantId, filter]);




  const handleMarkAttendance = async () => {
    const today = new Date().toISOString();
    await markAttendance({ assistantId, date: today, status: status, remark });
    setTodayMarked(true);
    setTimeout(() => setTodayMarked(false), 3000);
  };

  const summary = attendanceData.reduce(
    (acc, item) => {
      acc.total++;
      if (item.status.includes("present")) acc.present++;
      else if (item.status.includes("leave")) acc.leave++;
      else acc.absent++;
      return acc;
    },
    { total: 0, present: 0, absent: 0, leave: 0 }
  );

    const statusToValue : Record<'present' | 'leave' | 'absent', number> =  {
    present: 1,
    leave: 0.5,
    absent: 0,
    };

    const chartData = attendanceData.map(a => {
    const status = a.status[0];
    return {
        date: format(new Date(a.date), filter === "monthly" ? "dd MMM" : "MMM yyyy"),
        statusValue: statusToValue[status as 'present' | 'leave' | 'absent'],
        statusLabel: status,
    };
    });



   
  const attendancePercentage = summary.total
    ? ((summary.present / summary.total) * 100).toFixed(1)
    : "0";

  return (
    <div className="flex flex-col mb-6 sm:flex-row gap-6">
      <div className="bg-white dark:bg-[#1e1e1e] p-6 rounded-xl shadow-md w-full mx-auto">
        <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
          <CalendarDays size={22} /> Assistant Attendance
        </h3>

        {/* Filter */}
        <div className="flex items-center gap-4 mb-6">
          {["monthly", "yearly"].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f as "monthly" | "yearly")}
              className={`text-sm px-4 py-2 rounded-md font-medium transition ${
                filter === f
                  ? "bg-indigo-600 text-white"
                  : "bg-gray-200 dark:bg-gray-800 text-gray-800 dark:text-white"
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>

        {/* Chart */}
         <div style={{ color: "initial" }}>
            <ResponsiveContainer width="100%" height={300} style={{ color: "initial" }}>
            <BarChart data={chartData}>
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="statusValue">
                {chartData.map((entry, idx) => {
                    let color = "#f87171"; // red for absent
                    if (entry.statusLabel === "present") color = "#4ade80"; // green
                    else if (entry.statusLabel === "leave") color = "#fbbf24"; // yellow
                    return <Cell key={`cell-${idx}`} fill={color} />;
                })}
                </Bar>
            </BarChart>
            </ResponsiveContainer>
         </div>


        <p className="mt-4 text-sm text-gray-600 dark:text-gray-300">
          Attendance Rate: <span className="font-semibold text-indigo-600 dark:text-indigo-400">{attendancePercentage}%</span>
        </p>

        {/* Mark Today's Attendance */}
        <div className="mt-10 pt-6 border-t border-gray-300 dark:border-gray-700">
          <h4 className="text-lg font-semibold text-gray-800 dark:text-white mb-3">Mark Todays Attendance</h4>

          <div className="flex items-center gap-4 mb-4">
            {["present", "absent", "leave"].map((opt) => (
              <button
                key={opt}
                onClick={() => setStatus(opt as "present" | "absent" | "leave")}
                className={`text-sm px-4 py-2 rounded-md font-medium transition ${
                  status === opt
                    ? "bg-indigo-600 text-white"
                    : "bg-gray-200 dark:bg-gray-800 text-gray-800 dark:text-white"
                }`}
              >
                {opt.charAt(0).toUpperCase() + opt.slice(1)}
              </button>
            ))}
          </div>

          {status === "leave" && (
            <input
              type="text"
              value={remark}
              onChange={(e) => setRemark(e.target.value)}
              placeholder="Reason for leave..."
              className="w-full px-4 py-2 rounded-md border border-gray-300 dark:border-gray-600 dark:bg-[#121212] dark:text-white text-sm mb-4"
            />
          )}

          <button
            onClick={handleMarkAttendance}
            disabled={todayMarked}
            className="px-5 py-2.5 bg-green-600 text-white rounded-md hover:bg-green-700 transition font-medium shadow"
          >
            {todayMarked ? "Marked" : "Submit Attendance"}
          </button>
        </div>
      </div>
    </div>
  );
};


export default AttendanceManagement;
