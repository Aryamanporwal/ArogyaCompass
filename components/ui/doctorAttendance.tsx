import { useEffect, useState } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Cell,
  CartesianGrid,
} from "recharts";
import { format } from "date-fns";
import { CalendarDays } from "lucide-react";
import { getAttendanceByDoctorId, markAttendance } from "@/lib/actions/docattendance.action"

interface AttendanceDocument {
  date: string;
  status: string[];
  remark?: string;
}

interface Props {
  doctorId: string;
}

const monthOrder = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"
];

const DoctorAttendance = ({ doctorId }: Props) => {
  const [attendanceData, setAttendanceData] = useState<AttendanceDocument[]>([]);
  const [filter, setFilter] = useState<"monthly" | "yearly">("yearly");
  const [status, setStatus] = useState<"present" | "absent" | "leave">("present");
  const [remark, setRemark] = useState("");
  const [todayMarked, setTodayMarked] = useState(false);

  useEffect(() => {
    if (!doctorId) return;
    const fetchAttendance = async () => {
      const data = await getAttendanceByDoctorId(doctorId, filter);
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
  }, [doctorId, filter]);

  const handleMarkAttendance = async () => {
    const today = new Date().toISOString();
    await markAttendance({ doctorId, date: today, status: status, remark });
    setTodayMarked(true);
    setTimeout(() => setTodayMarked(false), 3000);
  };

  // --- Yearly Aggregation (Month-wise) ---
  const monthlySummary: Record<string, { total: number; present: number }> = {};
  attendanceData.forEach(record => {
    const dateObj = new Date(record.date);
    const month = format(dateObj, "MMM");
    if (!monthlySummary[month]) monthlySummary[month] = { total: 0, present: 0 };
    monthlySummary[month].total += 1;
    if (record.status.includes("present")) monthlySummary[month].present += 1;
  });
  const yearlyChartData = monthOrder.map(month => {
    const { total = 0, present = 0 } = monthlySummary[month] || {};
    const attendancePercent = total > 0 ? (present / total) * 100 : 0;
    return {
      label: month,
      attendancePercent: Number(attendancePercent.toFixed(1)),
    };
  });

  // --- Monthly Aggregation (Day-wise for current month) ---
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

  const dailySummary: Record<number, { present: number; total: number }> = {};
  attendanceData.forEach(record => {
    const dateObj = new Date(record.date);
    if (dateObj.getMonth() === currentMonth && dateObj.getFullYear() === currentYear) {
      const day = dateObj.getDate();
      if (!dailySummary[day]) dailySummary[day] = { present: 0, total: 0 };
      dailySummary[day].total += 1;
      if (record.status.includes("present")) dailySummary[day].present += 1;
    }
  });
  const monthlyChartData = Array.from({ length: daysInMonth }, (_, i) => {
    const day = i + 1;
    const { total = 0, present = 0 } = dailySummary[day] || {};
    const attendancePercent = total > 0 ? (present / total) * 100 : 0;
    return {
      label: `${day}`,
      attendancePercent: Number(attendancePercent.toFixed(1)),
    };
  });

  // --- Overall Attendance Percentage ---
  const totalDays = attendanceData.length;
  const totalPresent = attendanceData.filter((item) => item.status.includes("present")).length;
  const attendancePercentage = totalDays
    ? ((totalPresent / totalDays) * 100).toFixed(1)
    : "0";

  // --- Chart Data Selection ---
  const chartData = filter === "yearly" ? yearlyChartData : monthlyChartData;

  return (
    <div className="flex flex-col mb-6 sm:flex-row gap-6">
      <div className="bg-white dark:bg-[#1e1e1e] p-6 rounded-xl shadow-md w-full mx-auto">
        <h3 className="text-2xl font-bold text-gray-800 dark:text-white mb-4 flex items-center gap-2">
          <CalendarDays size={22} /> doctor Attendance
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

        {/* Bar Chart */}
        <div style={{ color: "initial" }}>
          <ResponsiveContainer width="100%" height={320}>
            <BarChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="label" />
              <YAxis
                domain={[0, 100]}
                ticks={[0, 25, 50, 75, 100]}
                tickFormatter={(tick) => `${tick}%`}
              />
              <Tooltip formatter={(value) => `${value}%`} />
              <Bar dataKey="attendancePercent">
                {chartData.map((entry, idx) => {
                  let color = "#ef4444"; // red
                  if (entry.attendancePercent > 75) color = "#22c55e"; // green
                  else if (entry.attendancePercent > 50) color = "#6366f1"; // indigo
                  return <Cell key={`cell-${idx}`} fill={color} />;
                })}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <p className="mt-4 text-sm text-gray-600 dark:text-gray-300">
          Attendance Rate:{" "}
          <span className="font-semibold text-indigo-600 dark:text-indigo-400">
            {attendancePercentage}%
          </span>
        </p>

        {/* Mark Today's Attendance */}
        <div className="mt-10 pt-6 border-t border-gray-300 dark:border-gray-700">
          <h4 className="text-lg font-semibold text-gray-800 dark:text-white mb-3">
            Mark Todays Attendance
          </h4>

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

export default DoctorAttendance;
