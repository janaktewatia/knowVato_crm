import React, { useState, useMemo, useCallback } from "react";
import { Nfc, QrCode, Phone, X, Clock, CheckCircle2, Wifi } from "lucide-react";
import { Badge } from "./Badge";
import { inputCls, btnPrimary, btnSecondary } from "./Field";
import { getSession, avatar } from "../data/mockData";
import { useNfcReader } from "../hooks/useNfcReader";

const DETECT_MS = 280; // sub-second "card in range -> marked" flash

export function MarkInOut({ students, cfg, log, setLog }) {
  const [demoTime, setDemoTime] = useState("08:15");
  const [qrOpen, setQrOpen] = useState(false);
  const [qrValue, setQrValue] = useState("");
  const [toast, setToast] = useState(null);
  const [detecting, setDetecting] = useState(false);

  const { session, type } = getSession(demoTime, cfg);

  const markedIds = useMemo(() => log.filter(l => l.session === session).map(l => l.studentId), [log, session]);

  const flash = (msg, tone = "green") => {
    setToast({ msg, tone });
    setTimeout(() => setToast(null), 1500);
  };

  const commitMark = (student, method) => {
    if (!student) return flash("Card not recognised", "red");
    if (markedIds.includes(student.id)) return flash(`${student.name} already marked`, "amber");
    setLog(prev => [
      { id: Date.now(), studentId: student.id, session, type, time: demoTime, method },
      ...prev,
    ]);
    flash(`${student.name} marked ${type}`, "green");
  };

  // Card detected (real tap or simulated) -> quick visual pulse, then commit. Total < 1s.
  const handleDetection = useCallback((student, method) => {
    if (detecting) return;
    setDetecting(true);
    setTimeout(() => {
      commitMark(student, method);
      setDetecting(false);
    }, DETECT_MS);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [detecting, markedIds, session, type, demoTime]);

  // Real hardware NFC: fires the instant a card comes into range.
  const onRealTag = useCallback((serial) => {
    const student = students.find(s => s.nfc.replace(/:/g, "").toUpperCase() === serial);
    handleDetection(student, "NFC");
  }, [students, handleDetection]);

  const { supported: nfcSupported, scanning, error: nfcError, start: startNfc } = useNfcReader(onRealTag);

  const handleSimulateTap = () => {
    const unmarked = students.find(s => !markedIds.includes(s.id));
    if (!unmarked) return flash("All students already marked", "amber");
    handleDetection(unmarked, "NFC");
  };

  const handleQrSubmit = () => {
    const student = students.find(s => s.nfc.toLowerCase() === qrValue.trim().toLowerCase());
    handleDetection(student, "QR");
    setQrValue("");
  };

  const todaysList = log.filter(l => l.session === session).sort((a, b) => b.id - a.id);

  return (
    <div className="flex flex-col h-full">
      <div className="px-4 pt-3 pb-2 bg-white border-b border-[var(--border,#e2e8f0)]">
        <div className="flex items-center justify-between">
          <Badge color={type === "IN" ? "green" : "amber"}>{session} · {type}</Badge>
          <div className="flex items-center gap-1 text-xs text-[var(--muted,#64748b)]">
            <Clock size={12} /> Simulate:
            <input
              type="time"
              value={demoTime}
              onChange={e => setDemoTime(e.target.value)}
              className="border border-[var(--border,#cbd5e1)] rounded px-1 py-0.5 text-xs ml-1"
            />
          </div>
        </div>
        <p className="text-xs text-[var(--muted,#94a3b8)] mt-1">Auto-detected from Timing Configuration — no manual morning/afternoon selection needed.</p>
      </div>

      <div className="px-4 py-4 flex flex-col items-center gap-3">
        {!qrOpen ? (
          <>
            <div className="relative w-32 h-32 flex items-center justify-center">
              {scanning && !detecting && <span className="absolute inset-0 rounded-full bg-sky-400 opacity-40 animate-ping" />}
              <button
                onClick={nfcSupported ? (scanning ? undefined : startNfc) : handleSimulateTap}
                className={`relative w-32 h-32 rounded-full text-white flex flex-col items-center justify-center shadow-lg transition-transform duration-150 cursor-pointer ${detecting ? "bg-emerald-500 scale-105" : "bg-[var(--btn-dark,#0f172a)] hover:opacity-95 active:scale-95"}`}
              >
                {detecting ? <CheckCircle2 size={40} /> : (nfcSupported && scanning ? <Wifi size={40} /> : <Nfc size={40} />)}
                <span className="text-xs mt-1 text-center px-2">
                  {detecting ? "Marking..." : nfcSupported ? (scanning ? "Hold card near phone" : "Start NFC Scanning") : "Tap NFC Card"}
                </span>
              </button>
            </div>
            {nfcSupported ? (
              <p className="text-[11px] text-[var(--muted,#94a3b8)] text-center px-6">
                {scanning ? "Scanner armed — reads happen automatically the instant a card is in range (<1s)." : "Tap once to arm the phone's NFC radio. After that, every card tap marks attendance automatically."}
              </p>
            ) : (
              <p className="text-[11px] text-[var(--muted,#94a3b8)] text-center px-6">
                Web NFC isn't available on this device/browser — using tap-to-simulate. On a supported Android phone, this reads real cards automatically the instant they're within ~1–2 cm.
              </p>
            )}
            {nfcError && <p className="text-[11px] text-rose-500 text-center px-6">{nfcError}</p>}
            <button onClick={() => setQrOpen(true)} className={btnSecondary}>
              <QrCode size={16} /> Scan QR instead
            </button>
          </>
        ) : (
          <div className="w-full bg-white border border-[var(--border,#e2e8f0)] rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium flex items-center gap-1 text-[var(--heading-text,#0f172a)]"><QrCode size={16} /> QR Scanner</span>
              <button onClick={() => setQrOpen(false)} className="cursor-pointer text-[var(--muted,#64748b)]"><X size={16} /></button>
            </div>
            <div className="h-28 border-2 border-dashed border-[var(--btn-dark,#0f172a)]/40 rounded-lg flex items-center justify-center text-xs text-[var(--muted,#64748b)] mb-3 bg-[var(--accent-soft,#f1f5f9)]">
              Point camera at admission QR
            </div>
            <input
              className={inputCls}
              placeholder="e.g. NFC1001 (admission code)"
              value={qrValue}
              onChange={e => setQrValue(e.target.value)}
            />
            <button onClick={handleQrSubmit} className={`${btnPrimary} w-full mt-2`}>Mark Attendance</button>
          </div>
        )}
      </div>

      {toast && (
        <div className={`mx-4 mb-2 px-3 py-2 rounded-lg text-sm text-center ${toast.tone === "green" ? "bg-emerald-100 text-emerald-800" : toast.tone === "amber" ? "bg-amber-100 text-amber-800" : "bg-rose-100 text-rose-800"}`}>
          {toast.msg}
        </div>
      )}

      <div className="px-4 py-2 text-xs font-semibold text-[var(--muted,#64748b)] uppercase tracking-wide">
        Marked today · {todaysList.length}
      </div>
      <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-2">
        {todaysList.length === 0 && <p className="text-sm text-[var(--muted,#94a3b8)] text-center mt-8">No entries yet. Tap NFC to begin.</p>}
        {todaysList.map(entry => {
          const s = students.find(st => st.id === entry.studentId);
          if (!s) return null;
          return (
            <div key={entry.id} className="bg-white rounded-xl border border-[var(--border,#e2e8f0)] p-2 flex items-center gap-3 shadow-xs">
              <img src={avatar(s.photo)} alt={s.name} className="w-11 h-11 rounded-full object-cover" />
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-[var(--heading-text,#0f172a)] truncate">{s.name}</p>
                <p className="text-xs text-[var(--muted,#64748b)]">Class {s.cls}-{s.section} · {entry.time} · {entry.method}</p>
              </div>
              <Badge color={entry.type === "IN" ? "green" : "amber"}>{entry.type}</Badge>
              <a href={`tel:${s.mobile}`} className="w-8 h-8 rounded-full bg-[var(--accent-soft,#f1f5f9)] text-[var(--btn-dark,#0f172a)] flex items-center justify-center hover:opacity-80 transition">
                <Phone size={15} />
              </a>
            </div>
          );
        })}
      </div>
    </div>
  );
}
