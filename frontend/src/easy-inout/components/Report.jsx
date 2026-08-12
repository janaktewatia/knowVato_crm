import React, { useState } from "react";
import { Download } from "lucide-react";
import { Badge } from "./Badge";
import { Field, inputCls, btnPrimary } from "./Field";
import { avatar } from "../data/mockData";

export function Report({ students, log, routes, busStops, assignments }) {
  const [type, setType] = useState("inout");
  const [cls, setCls] = useState("all");

  const rows = type === "inout"
    ? log.map(l => ({ ...l, s: students.find(s => s.id === l.studentId) })).filter(r => r.s && (cls === "all" || r.s.cls === cls))
    : assignments.map(a => ({
        s: students.find(s => s.id === a.studentId),
        route: routes.find(r => r.id === a.routeId)?.name,
        stop: busStops.find(b => b.id === a.stopId)?.name,
      })).filter(r => r.s && (cls === "all" || r.s.cls === cls));

  const exportCsv = () => {
    const header = type === "inout" ? "Name,Class,Session,Type,Time,Method\n" : "Name,Class,Route,Stop\n";
    const body = rows.map(r => type === "inout"
      ? `${r.s.name},${r.s.cls}-${r.s.section},${r.session},${r.type},${r.time},${r.method}`
      : `${r.s.name},${r.s.cls}-${r.s.section},${r.route},${r.stop}`
    ).join("\n");
    const blob = new Blob([header + body], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = `${type}-report.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="p-3 sm:p-6 max-w-5xl mx-auto w-full">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">Reports</h2>
      <div className="flex flex-col sm:flex-row flex-wrap gap-3 sm:items-end mb-4 bg-white border rounded-xl p-3 sm:p-4">
        <Field label="Report Type">
          <select value={type} onChange={e => setType(e.target.value)} className={inputCls} style={{ width: "100%", maxWidth: 200 }}>
            <option value="inout">In-Out Attendance</option>
            <option value="bus">Bus Attendance</option>
          </select>
        </Field>
        <Field label="Class">
          <select value={cls} onChange={e => setCls(e.target.value)} className={inputCls} style={{ width: "100%", maxWidth: 140 }}>
            <option value="all">All Classes</option>
            {[...new Set(students.map(s => s.cls))].map(c => <option key={c} value={c}>Class {c}</option>)}
          </select>
        </Field>
        <Field label="Date">
          <input type="date" defaultValue="2026-07-30" className={inputCls} style={{ width: "100%", maxWidth: 160 }} />
        </Field>
        <button onClick={exportCsv} className={`${btnPrimary} sm:ml-auto w-full sm:w-auto mt-2 sm:mt-0`}><Download size={16} /> Export CSV</button>
      </div>

      <div className="bg-white border rounded-xl overflow-x-auto shadow-xs w-full">
        <table className="w-full text-sm min-w-[500px]">
          <thead className="bg-gray-50 text-gray-500 text-left">
            {type === "inout" ? (
              <tr><th className="px-4 py-2">Student</th><th className="px-4 py-2">Class</th><th className="px-4 py-2">Session</th><th className="px-4 py-2">Type</th><th className="px-4 py-2">Time</th><th className="px-4 py-2">Method</th></tr>
            ) : (
              <tr><th className="px-4 py-2">Student</th><th className="px-4 py-2">Class</th><th className="px-4 py-2">Route</th><th className="px-4 py-2">Stop</th></tr>
            )}
          </thead>
          <tbody>
            {rows.length === 0 && <tr><td colSpan={6} className="text-center text-gray-400 py-8">No records found</td></tr>}
            {rows.map((r, i) => type === "inout" ? (
              <tr key={i} className="border-t">
                <td className="px-4 py-2 flex items-center gap-2"><img src={avatar(r.s.photo)} className="w-6 h-6 rounded-full" alt={r.s.name} /> {r.s.name}</td>
                <td className="px-4 py-2">{r.s.cls}-{r.s.section}</td>
                <td className="px-4 py-2">{r.session}</td>
                <td className="px-4 py-2"><Badge color={r.type === "IN" ? "green" : "amber"}>{r.type}</Badge></td>
                <td className="px-4 py-2">{r.time}</td>
                <td className="px-4 py-2">{r.method}</td>
              </tr>
            ) : (
              <tr key={i} className="border-t">
                <td className="px-4 py-2 flex items-center gap-2"><img src={avatar(r.s.photo)} className="w-6 h-6 rounded-full" alt={r.s.name} /> {r.s.name}</td>
                <td className="px-4 py-2">{r.s.cls}-{r.s.section}</td>
                <td className="px-4 py-2">{r.route}</td>
                <td className="px-4 py-2">{r.stop}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
