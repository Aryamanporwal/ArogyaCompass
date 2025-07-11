"use server"
import { databases } from "@/lib/appwrite.config";
import { DATABASE_ID, ATTENDANCE_COLLECTION_ID } from "@/lib/appwrite.config";
import { Query } from "appwrite";

interface AttendanceEntry {
  assistantId: string;
  date: string; // ISO format string
  status: ("present" | "absent" | "leave");
  remark?: string;
}

interface AttendanceDocumentFromDB {
  date: string;
  status: string[];
  remark?: string;
}
export const getAttendanceByAssistantId = async (
  assistantId: string,
  filter: "monthly" | "yearly"
): Promise<{ documents: AttendanceDocumentFromDB[] }> => {
  try {
    const now = new Date();
    let startDate: Date;

    if (filter === "monthly") {
      startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    } else {
      startDate = new Date(now.getFullYear(), 0, 1);
    }

    const formattedStartDate = startDate.toISOString();

    const res = await databases.listDocuments(DATABASE_ID!, ATTENDANCE_COLLECTION_ID!, [
      Query.equal("assistantId", assistantId),
      Query.greaterThanEqual("date", formattedStartDate),
      Query.orderAsc("date"),
    ]);
    const docs = res.documents.map((doc) => ({
    date: doc.date,
    status: doc.status,
    remark: doc.remark,
    }));
    return { documents: docs };
  } catch (err) {
    console.error("Error fetching attendance:", err);
    return { documents: [] };
  }
};


export const markAttendance = async (entry: AttendanceEntry) => {
  try {
    // Check if attendance already marked for today
    const today = new Date(entry.date).toISOString().split("T")[0];
    const res = await databases.listDocuments(DATABASE_ID!, ATTENDANCE_COLLECTION_ID!, [
      Query.equal("assistantId", entry.assistantId),
      Query.startsWith("date", today),
    ]);

    if (res.total > 0) {
      // Update existing
      const docId = res.documents[0].$id;
      await databases.updateDocument(DATABASE_ID!, ATTENDANCE_COLLECTION_ID!, docId, {
        status: entry.status,
        remark: entry.remark || "",
      });
    } else {
      // Create new
      await databases.createDocument(DATABASE_ID!, ATTENDANCE_COLLECTION_ID!, "unique()", {
        assistantId: entry.assistantId,
        date: new Date(entry.date),
        status: entry.status,
        remark: entry.remark || "",
      });
    }

    return true;
  } catch (err) {
    console.error("Error marking attendance:", err);
    return false;
  }
};
