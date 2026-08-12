import React from "react";
import { Check } from "lucide-react";
import { Field, inputCls, btnPrimary } from "./Field";

export function CommunicationMaster({ templates, setTemplates }) {
  return (
    <div className="max-w-2xl space-y-4">
      <Field label="Morning Entry - WhatsApp Template">
        <textarea rows={3} className={inputCls} value={templates.morningEntry}
          onChange={e => setTemplates({ ...templates, morningEntry: e.target.value })} />
      </Field>
      <Field label="Afternoon Exit - WhatsApp Template">
        <textarea rows={3} className={inputCls} value={templates.afternoonExit}
          onChange={e => setTemplates({ ...templates, afternoonExit: e.target.value })} />
      </Field>
      <p className="text-xs text-gray-400">Merge fields available: {"{{studentName}}"}, {"{{time}}"}, {"{{className}}"}</p>
      <button className={btnPrimary} onClick={() => alert("Templates saved")}><Check size={16} /> Save Templates</button>
    </div>
  );
}
