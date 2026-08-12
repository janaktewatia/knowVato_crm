import React, { useState } from "react";
import { Plus, ChevronRight } from "lucide-react";
import { Field, inputCls, btnPrimary } from "./Field";

export function RouteSetup({ routes, setRoutes, busStops }) {
  const [form, setForm] = useState({ name: "", vehicleNo: "", driver: "", conductor: "" });
  const [expanded, setExpanded] = useState(null);

  const addRoute = () => {
    if (!form.name) return;
    setRoutes(prev => [...prev, { ...form, id: Date.now(), stopIds: [] }]);
    setForm({ name: "", vehicleNo: "", driver: "", conductor: "" });
  };

  const toggleStop = (routeId, stopId) => {
    setRoutes(prev => prev.map(r => r.id === routeId
      ? { ...r, stopIds: r.stopIds.includes(stopId) ? r.stopIds.filter(id => id !== stopId) : [...r.stopIds, stopId] }
      : r));
  };

  return (
    <div className="space-y-4 w-full">
      <div className="bg-white border rounded-xl p-3 sm:p-4 grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-2xl w-full">
        <Field label="Route Name"><input className={inputCls} value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} /></Field>
        <Field label="Vehicle Number"><input className={inputCls} value={form.vehicleNo} onChange={e => setForm({ ...form, vehicleNo: e.target.value })} /></Field>
        <Field label="Driver"><input className={inputCls} value={form.driver} onChange={e => setForm({ ...form, driver: e.target.value })} /></Field>
        <Field label="Conductor"><input className={inputCls} value={form.conductor} onChange={e => setForm({ ...form, conductor: e.target.value })} /></Field>
        <button onClick={addRoute} className={`${btnPrimary} col-span-1 sm:col-span-2 w-full`}><Plus size={16} /> Add Route</button>
      </div>

      <div className="space-y-2 max-w-2xl w-full">
        {routes.map(r => (
          <div key={r.id} className="bg-white border rounded-xl p-3">
            <button className="w-full flex items-center justify-between text-left cursor-pointer" onClick={() => setExpanded(expanded === r.id ? null : r.id)}>
              <div>
                <p className="font-medium text-gray-800">{r.name}</p>
                <p className="text-xs text-gray-500">{r.vehicleNo} · Driver: {r.driver} · Conductor: {r.conductor}</p>
              </div>
              <ChevronRight size={16} className={`transition ${expanded === r.id ? "rotate-90" : ""}`} />
            </button>
            {expanded === r.id && (
              <div className="mt-3 pt-3 border-t">
                <p className="text-xs font-semibold text-gray-500 uppercase mb-2">Define Bus Stops (sequence order)</p>
                <div className="space-y-1">
                  {busStops.sort((a, b) => a.sequence - b.sequence).map(stop => (
                    <label key={stop.id} className="flex items-center gap-2 text-sm cursor-pointer">
                      <input type="checkbox" checked={r.stopIds.includes(stop.id)} onChange={() => toggleStop(r.id, stop.id)} />
                      Stop {stop.sequence}: {stop.name} <span className="text-gray-400">(₹{stop.charges})</span>
                    </label>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
