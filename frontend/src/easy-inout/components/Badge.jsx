import React from "react";

export function Badge({ children, color = "sky" }) {
  const colors = {
    sky: "bg-[var(--accent-soft,#f1f5f9)] text-[var(--btn-dark,#0f172a)] font-semibold border border-[var(--border,#e2e8f0)]",
    green: "bg-emerald-100 text-emerald-800 font-semibold",
    amber: "bg-amber-100 text-amber-800 font-semibold",
    gray: "bg-slate-100 text-slate-700 font-semibold",
    red: "bg-rose-100 text-rose-800 font-semibold",
  };
  return <span className={`text-xs px-2.5 py-0.5 rounded-full ${colors[color] || colors.sky}`}>{children}</span>;
}
