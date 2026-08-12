import React, { useState } from "react";
import { Plus } from "lucide-react";
import { Field, inputCls, btnPrimary } from "./Field";

export function BusStopSetup({ busStops, setBusStops }) {
  const [form, setForm] = useState({ name: "", charges: "", sequence: "" });

  const add = () => {
    if (!form.name) return;
    setBusStops(prev => [...prev, { ...form, id: Date.now(), charges: Number(form.charges) || 0, sequence: Number(form.sequence) || prev.length + 1 }]);
    setForm({ name: "", charges: "", sequence: "" });
  };

  return (
    <div className="space-y-4 w-full">
      <div className="bg-white border rounded-xl p-3 sm:p-4 grid grid-cols-1 sm:grid-cols-3 gap-3 max-w-2xl items-end w-full">
        <Field label="Bus Stop Name"><input className={inputCls} value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></Field>
        <Field label="Charges (₹)"><input type="number" className={inputCls} value={form.charges} onChange={e => setForm({ ...form, charges: e.target.value })} /></Field>
        <Field label="Sequence"><input type="number" className={inputCls} value={form.sequence} onChange={e => setForm({ ...form, sequence: e.target.value })} /></Field>
        <button onClick={add} className={`${btnPrimary} col-span-1 sm:col-span-3 w-full`}><Plus size={16} /> Add Bus Stop</button>
      </div>
      <div className="bg-white border rounded-xl overflow-x-auto max-w-2xl w-full">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 text-gray-500 text-left"><tr><th className="px-4 py-2">Seq</th><th className="px-4 py-2">Stop Name</th><th className="px-4 py-2">Charges</th></tr></thead>
          <tbody>
            {busStops.sort((a, b) => a.sequence - b.sequence).map(s => (
              <tr key={s.id} className="border-t"><td className="px-4 py-2">{s.sequence}</td><td className="px-4 py-2">{s.name}</td><td className="px-4 py-2">₹{s.charges}</td></tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
