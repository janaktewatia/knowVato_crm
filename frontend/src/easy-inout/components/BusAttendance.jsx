import React, { useState, useCallback } from "react";
import { Nfc, CheckCircle2, Circle, Clock, MapPin, ChevronRight, Wifi } from "lucide-react";
import { Badge } from "./Badge";
import { inputCls, btnPrimary, btnSecondary } from "./Field";
import { getSession, avatar } from "../data/mockData";
import { useNfcReader } from "../hooks/useNfcReader";

const DETECT_MS = 280;

export function BusAttendance({ students, routes, busStops, assignments, cfg }) {
  const [demoTime, setDemoTime] = useState("08:15");
  const [routeId, setRouteId] = useState(routes[0]?.id);
  const [present, setPresent] = useState({});
  const [finished, setFinished] = useState(false);
  const [flashId, setFlashId] = useState(null);

  const { session, type } = getSession(demoTime, cfg);
  const route = routes.find(r => r.id === routeId);

  const stopGroups = (route?.stopIds || [])
    .map(sid => busStops.find(s => s.id === sid))
    .filter(Boolean)
    .sort((a, b) => a.sequence - b.sequence)
    .map(stop => ({
      stop,
      studs: assignments
        .filter(a => a.routeId === routeId && a.stopId === stop.id && a.status === "Active")
        .map(a => students.find(s => s.id === a.studentId))
        .filter(Boolean),
    }));

  const totalStudents = stopGroups.reduce((sum, g) => sum + g.studs.length, 0);
  const presentCount = Object.values(present).filter(Boolean).length;

  const markPresent = useCallback((student) => {
    if (!student || present[student.id]) return;
    setFlashId(student.id);
    setTimeout(() => {
      setPresent(prev => ({ ...prev, [student.id]: true }));
      setFlashId(null);
    }, DETECT_MS);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [present]);

  const onRealTag = useCallback((serial) => {
    const all = stopGroups.flatMap(g => g.studs);
    const student = students.find(s => s.nfc.replace(/:/g, "").toUpperCase() === serial && all.some(a => a.id === s.id));
    markPresent(student);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [students, stopGroups, markPresent]);

  const { supported: nfcSupported, scanning, error: nfcError, start: startNfc } = useNfcReader(onRealTag);

  const simulateTap = () => {
    const all = stopGroups.flatMap(g => g.studs);
    const next = all.find(s => !present[s.id] && flashId !== s.id);
    if (next) markPresent(next);
  };

  if (finished) {
    return (
      <div className="p-4 flex flex-col items-center text-center gap-3 mt-6">
        <CheckCircle2 className="text-emerald-500" size={56} />
        <h3 className="font-semibold text-[var(--heading-text,#0f172a)]">Bus Attendance Completed</h3>
        <p className="text-sm text-[var(--muted,#64748b)]">{route?.name} · {session} {type}</p>
        <div className="w-full bg-white border border-[var(--border,#e2e8f0)] rounded-xl p-4 mt-2 text-sm">
          <div className="flex justify-between py-1"><span>Total assigned</span><b>{totalStudents}</b></div>
          <div className="flex justify-between py-1 text-emerald-600"><span>Present</span><b>{presentCount}</b></div>
          <div className="flex justify-between py-1 text-rose-500"><span>Absent</span><b>{totalStudents - presentCount}</b></div>
        </div>
        <button onClick={() => { setFinished(false); setPresent({}); }} className={`${btnSecondary} mt-2`}>Start New Session</button>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 pt-3 pb-2 bg-white border-b border-[var(--border,#e2e8f0)] space-y-2">
        <div className="flex items-center justify-between">
          <Badge color={type === "IN" ? "green" : "amber"}>{session} · {type}</Badge>
          <div className="flex items-center gap-1 text-xs text-[var(--muted,#64748b)]">
            <Clock size={12} /> Simulate:
            <input type="time" value={demoTime} onChange={e => setDemoTime(e.target.value)} className="border border-[var(--border,#cbd5e1)] rounded px-1 py-0.5 text-xs ml-1" />
          </div>
        </div>
        <select value={routeId} onChange={e => { setRouteId(Number(e.target.value)); setPresent({}); }} className={inputCls}>
          {routes.map(r => <option key={r.id} value={r.id}>{r.name} ({r.vehicleNo})</option>)}
        </select>
        <div className="text-xs text-[var(--muted,#64748b)] flex items-center justify-between">
          <span>{presentCount}/{totalStudents} present</span>
          <span>Driver: {route?.driver}</span>
        </div>
      </div>

      <div className="px-4 py-3">
        <button
          onClick={nfcSupported ? (scanning ? undefined : startNfc) : simulateTap}
          className="relative w-full py-3 rounded-xl bg-[var(--btn-dark,#0f172a)] hover:opacity-95 text-white flex items-center justify-center gap-2 font-medium shadow-md cursor-pointer transition overflow-hidden"
        >
          {scanning && <span className="absolute inset-0 bg-white opacity-10 animate-ping" />}
          {nfcSupported && scanning ? <Wifi size={18} /> : <Nfc size={18} />}
          {nfcSupported ? (scanning ? "Scanning — hold card near phone" : "Start NFC Scanning") : "Tap NFC Card"}
        </button>
        {nfcSupported && !scanning && (
          <p className="text-[11px] text-[var(--muted,#94a3b8)] text-center mt-1">Arm once — after that every tap is detected automatically in under a second.</p>
        )}
        {nfcError && <p className="text-[11px] text-rose-500 text-center mt-1">{nfcError}</p>}
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-4">
        {stopGroups.map(({ stop, studs }) => (
          <div key={stop.id}>
            <div className="flex items-center gap-1 text-xs font-semibold text-[var(--muted,#64748b)] uppercase mb-1">
              <MapPin size={12} /> Stop {stop.sequence}: {stop.name}
            </div>
            <div className="space-y-2">
              {studs.map(s => (
                <button
                  key={s.id}
                  onClick={() => (present[s.id] ? setPresent(prev => ({ ...prev, [s.id]: false })) : markPresent(s))}
                  className={`w-full flex items-center gap-3 p-2 rounded-xl border shadow-xs text-left transition-all duration-150 cursor-pointer ${present[s.id] ? "bg-emerald-50 border-emerald-300" : flashId === s.id ? "bg-emerald-100 border-emerald-400 scale-[1.02]" : "bg-white border-[var(--border,#e2e8f0)]"}`}
                >
                  <img src={avatar(s.photo)} className="w-10 h-10 rounded-full object-cover" alt={s.name} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[var(--heading-text,#0f172a)] truncate">{s.name}</p>
                    <p className="text-xs text-[var(--muted,#64748b)]">Class {s.cls}-{s.section}</p>
                  </div>
                  {(present[s.id] || flashId === s.id) ? <CheckCircle2 className="text-emerald-500" size={20} /> : <Circle className="text-slate-300" size={20} />}
                </button>
              ))}
              {studs.length === 0 && <p className="text-xs text-[var(--muted,#94a3b8)]">No students at this stop.</p>}
            </div>
          </div>
        ))}
      </div>

      <div className="p-4 border-t border-[var(--border,#e2e8f0)] bg-white">
        <button onClick={() => setFinished(true)} className={`${btnPrimary} w-full`}>
          Finish <ChevronRight size={16} />
        </button>
      </div>
    </div>
  );
}
