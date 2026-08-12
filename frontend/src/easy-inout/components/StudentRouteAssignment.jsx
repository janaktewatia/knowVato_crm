import React, { useState } from "react";
import { Upload, Check } from "lucide-react";
import { Badge } from "./Badge";
import { Field, inputCls, btnPrimary, btnSecondary } from "./Field";

export function StudentRouteAssignment({ students, routes, busStops, assignments, setAssignments }) {
  const [form, setForm] = useState({ studentId: "", routeId: "", stopId: "", fromDate: "2026-07-30", action: "Assign" });

  const routeStops = busStops.filter(bs => routes.find(r => r.id === Number(form.routeId))?.stopIds.includes(bs.id));

  const submit = () => {
    if (!form.studentId || !form.routeId || !form.stopId) return;
    setAssignments(prev => {
      const withdrawn = prev.map(a => a.studentId === Number(form.studentId) && form.action !== "Assign" ? { ...a, status: form.action === "Withdrawal" ? "Withdrawn" : a.status } : a);
      return [...withdrawn, { id: Date.now(), studentId: Number(form.studentId), routeId: Number(form.routeId), stopId: Number(form.stopId), fromDate: form.fromDate, status: "Active" }];
    });
    setForm({ studentId: "", routeId: "", stopId: "", fromDate: "2026-07-30", action: "Assign" });
  };

  return (
    <div className="space-y-4 w-full">
      <div className="bg-white border rounded-xl p-3 sm:p-4 grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-2xl items-end">
        <Field label="Action">
          <select className={inputCls} value={form.action} onChange={e => setForm({ ...form, action: e.target.value })}>
            <option>Assign</option><option>Change Route</option><option>Withdrawal</option>
          </select>
        </Field>
        <Field label="Applicable Date"><input type="date" className={inputCls} value={form.fromDate} onChange={e => setForm({ ...form, fromDate: e.target.value })} /></Field>
        <Field label="Student">
          <select className={inputCls} value={form.studentId} onChange={e => setForm({ ...form, studentId: e.target.value })}>
            <option value="">Select student</option>
            {students.map(s => <option key={s.id} value={s.id}>{s.name} ({s.cls}-{s.section})</option>)}
          </select>
        </Field>
        <Field label="Route">
          <select className={inputCls} value={form.routeId} onChange={e => setForm({ ...form, routeId: e.target.value, stopId: "" })}>
            <option value="">Select route</option>
            {routes.map(r => <option key={r.id} value={r.id}>{r.name}</option>)}
          </select>
        </Field>
        <Field label="Bus Stop">
          <select className={inputCls} value={form.stopId} onChange={e => setForm({ ...form, stopId: e.target.value })}>
            <option value="">Select stop</option>
            {routeStops.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        </Field>
        <label className={`${btnSecondary} cursor-pointer sm:justify-self-start w-full sm:w-auto`}>
          <Upload size={16} /> Import Assignments
          <input type="file" className="hidden" onChange={() => alert("Import file received — mapping screen would appear here.")} />
        </label>
        <button onClick={submit} className={`${btnPrimary} col-span-1 sm:col-span-2 w-full`}><Check size={16} /> Save Assignment</button>
      </div>

      <div className="bg-white border rounded-xl overflow-x-auto max-w-3xl w-full">
        <table className="w-full text-sm min-w-[500px]">
          <thead className="bg-gray-50 text-gray-500 text-left"><tr><th className="px-4 py-2">Student</th><th className="px-4 py-2">Route</th><th className="px-4 py-2">Stop</th><th className="px-4 py-2">From</th><th className="px-4 py-2">Status</th></tr></thead>
          <tbody>
            {assignments.map(a => {
              const s = students.find(x => x.id === a.studentId);
              if (!s) return null;
              return (
                <tr key={a.id} className="border-t">
                  <td className="px-4 py-2">{s.name}</td>
                  <td className="px-4 py-2">{routes.find(r => r.id === a.routeId)?.name}</td>
                  <td className="px-4 py-2">{busStops.find(b => b.id === a.stopId)?.name}</td>
                  <td className="px-4 py-2">{a.fromDate}</td>
                  <td className="px-4 py-2"><Badge color={a.status === "Active" ? "green" : "red"}>{a.status}</Badge></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
