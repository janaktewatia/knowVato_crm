import React from "react";
import { Check } from "lucide-react";
import { Field, inputCls, btnPrimary } from "./Field";

export function TimingConfiguration({ cfg, setCfg }) {
  return (
    <div className="max-w-md space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <Field label="Morning Attendance Start"><input type="time" className={inputCls} value={cfg.morningStart} onChange={e => setCfg({ ...cfg, morningStart: e.target.value })} /></Field>
        <Field label="Morning Attendance End"><input type="time" className={inputCls} value={cfg.morningEnd} onChange={e => setCfg({ ...cfg, morningEnd: e.target.value })} /></Field>
        <Field label="Afternoon Attendance Start"><input type="time" className={inputCls} value={cfg.afternoonStart} onChange={e => setCfg({ ...cfg, afternoonStart: e.target.value })} /></Field>
        <Field label="Afternoon Attendance End"><input type="time" className={inputCls} value={cfg.afternoonEnd} onChange={e => setCfg({ ...cfg, afternoonEnd: e.target.value })} /></Field>
      </div>
      <button className={btnPrimary} onClick={() => alert("Timing configuration saved")}><Check size={16} /> Save Configuration</button>
    </div>
  );
}
