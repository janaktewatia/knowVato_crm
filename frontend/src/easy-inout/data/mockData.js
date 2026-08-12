import { Nfc, Bus, FileText, Users, Settings, MessageSquare, Clock, Route as RouteIcon, MapPin, ArrowLeftRight } from "lucide-react";

export const initialStudents = [
  { id: 1, name: "Aarav Sharma", cls: "5", section: "A", mobile: "9876543210", email: "aarav@example.com", nfc: "NFC1001", photo: 1 },
  { id: 2, name: "Diya Patel", cls: "5", section: "A", mobile: "9876543211", email: "diya@example.com", nfc: "NFC1002", photo: 5 },
  { id: 3, name: "Vihaan Gupta", cls: "6", section: "B", mobile: "9876543212", email: "vihaan@example.com", nfc: "NFC1003", photo: 12 },
  { id: 4, name: "Ananya Singh", cls: "6", section: "B", mobile: "9876543213", email: "ananya@example.com", nfc: "NFC1004", photo: 9 },
  { id: 5, name: "Reyansh Kumar", cls: "7", section: "C", mobile: "9876543214", email: "reyansh@example.com", nfc: "NFC1005", photo: 14 },
  { id: 6, name: "Ishita Verma", cls: "7", section: "C", mobile: "9876543215", email: "ishita@example.com", nfc: "NFC1006", photo: 20 },
  { id: 7, name: "Kabir Joshi", cls: "8", section: "A", mobile: "9876543216", email: "kabir@example.com", nfc: "NFC1007", photo: 33 },
  { id: 8, name: "Myra Reddy", cls: "8", section: "A", mobile: "9876543217", email: "myra@example.com", nfc: "NFC1008", photo: 29 },
];

export const initialBusStops = [
  { id: 1, name: "Sector 12 Gate", charges: 800, sequence: 1 },
  { id: 2, name: "City Mall", charges: 900, sequence: 2 },
  { id: 3, name: "Green Park", charges: 750, sequence: 3 },
];

export const initialRoutes = [
  { id: 1, name: "Route A - Morning", vehicleNo: "UP16 AB 1234", driver: "Ramesh Yadav", conductor: "Suresh Lal", stopIds: [1, 2, 3] },
];

export const initialAssignments = [
  { id: 1, studentId: 1, routeId: 1, stopId: 1, fromDate: "2026-04-01", status: "Active" },
  { id: 2, studentId: 2, routeId: 1, stopId: 1, fromDate: "2026-04-01", status: "Active" },
  { id: 3, studentId: 3, routeId: 1, stopId: 2, fromDate: "2026-04-01", status: "Active" },
  { id: 4, studentId: 4, routeId: 1, stopId: 2, fromDate: "2026-04-01", status: "Active" },
  { id: 5, studentId: 5, routeId: 1, stopId: 3, fromDate: "2026-04-01", status: "Active" },
  { id: 6, studentId: 6, routeId: 1, stopId: 3, fromDate: "2026-04-01", status: "Active" },
];

export const MENU = [
  { key: "inout", label: "Mark In-Out", icon: Nfc, type: "mobile", path: "/modules/easy-inout/inout" },
  { key: "bus", label: "Mark Bus Attendance", icon: Bus, type: "mobile", path: "/modules/easy-inout/bus" },
  { key: "report", label: "Report", icon: FileText, type: "web", path: "/modules/easy-inout/report" },
  { key: "student", label: "Student Master", icon: Users, type: "web", path: "/modules/easy-inout/student" },
  { key: "setup", label: "Setup", icon: Settings, type: "web", path: "/modules/easy-inout/setup" },
];

export const SETUP_TABS = [
  { key: "comm", label: "Communication Master", icon: MessageSquare },
  { key: "timing", label: "Timing Configuration", icon: Clock },
  { key: "route", label: "Route", icon: RouteIcon },
  { key: "stop", label: "Bus Stop", icon: MapPin },
  { key: "assign", label: "Student Route Assignment", icon: ArrowLeftRight },
];

export const avatar = (n) => `https://i.pravatar.cc/150?img=${n}`;

export function getSession(timeStr, cfg) {
  if (timeStr >= cfg.morningStart && timeStr <= cfg.morningEnd) return { session: "Morning", type: "IN" };
  if (timeStr >= cfg.afternoonStart && timeStr <= cfg.afternoonEnd) return { session: "Afternoon", type: "OUT" };
  return { session: "Outside Window", type: "IN" };
}
