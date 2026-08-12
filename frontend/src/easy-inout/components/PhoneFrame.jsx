import React from "react";
import { ChevronLeft } from "lucide-react";

export function PhoneFrame({ children, title, onBack }) {
  return (
    <div className="mx-auto w-full max-w-md sm:w-[320px] px-2 sm:px-0 my-0 sm:my-4">
      <div className="bg-slate-900 sm:rounded-3xl p-0 sm:p-3 shadow-2xl overflow-hidden">
        <div className="bg-white sm:rounded-2xl overflow-hidden flex flex-col min-h-[calc(100vh-80px)] sm:h-[620px]">
          <div className="bg-slate-900 text-white text-xs flex justify-between px-4 py-1">
            <span>9:41</span>
            <span>EasyInOut</span>
            <span>100%</span>
          </div>
          <div className="bg-[var(--btn-dark,#0f172a)] text-white px-4 py-3 flex items-center gap-2 shadow-xs">
            {onBack && (
              <button onClick={onBack} className="p-1 -ml-1 rounded hover:bg-white/20 cursor-pointer transition">
                <ChevronLeft size={20} />
              </button>
            )}
            <div className="font-semibold text-base">{title}</div>
          </div>
          <div className="flex-1 overflow-y-auto bg-slate-50">{children}</div>
        </div>
      </div>
    </div>
  );
}
