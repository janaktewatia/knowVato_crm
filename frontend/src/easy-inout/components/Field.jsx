import React from "react";

export const inputCls = "w-full border border-[var(--border,#cbd5e1)] rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--btn-dark,#0f172a)] focus:border-[var(--btn-dark,#0f172a)] bg-[var(--surface,#ffffff)] text-[var(--text,#0f172a)] transition-all";
export const btnPrimary = "bg-[var(--btn-dark,#0f172a)] hover:opacity-90 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 justify-center cursor-pointer transition-all shadow-xs";
export const btnSecondary = "bg-[var(--surface,#ffffff)] border border-[var(--border,#e2e8f0)] hover:bg-[var(--accent-soft,#f1f5f9)] text-[var(--heading-text,#0f172a)] px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 justify-center cursor-pointer transition-all";

export function Field({ label, children }) {
  return (
    <label className="block mb-3">
      <span className="block text-sm font-medium text-[var(--muted,#64748b)] mb-1">{label}</span>
      {children}
    </label>
  );
}
