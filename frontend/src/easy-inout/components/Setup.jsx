import React, { useState } from "react";
import { SETUP_TABS } from "../data/mockData";
import { CommunicationMaster } from "./CommunicationMaster";
import { TimingConfiguration } from "./TimingConfiguration";
import { RouteSetup } from "./RouteSetup";
import { BusStopSetup } from "./BusStopSetup";
import { StudentRouteAssignment } from "./StudentRouteAssignment";

export function Setup(props) {
  const [tab, setTab] = useState("comm");
  return (
    <div className="p-3 sm:p-6 max-w-6xl mx-auto w-full">
      <h2 className="text-xl font-semibold text-[var(--heading-text,#0f172a)] mb-4">Setup</h2>
      <div className="flex gap-2 mb-5 flex-wrap overflow-x-auto pb-1">
        {SETUP_TABS.map(t => {
          const Icon = t.icon;
          const isActive = tab === t.key;
          return (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={`px-3 py-2 rounded-lg text-xs sm:text-sm flex items-center gap-2 border cursor-pointer transition-all whitespace-nowrap ${isActive ? "bg-[var(--btn-dark,#0f172a)] text-white border-[var(--btn-dark,#0f172a)] shadow-xs font-medium" : "bg-white text-[var(--text,#334155)] border-[var(--border,#e2e8f0)] hover:bg-[var(--accent-soft,#f1f5f9)]"}`}>
              <Icon size={15} /> {t.label}
            </button>
          );
        })}
      </div>
      {tab === "comm" && <CommunicationMaster templates={props.templates} setTemplates={props.setTemplates} />}
      {tab === "timing" && <TimingConfiguration cfg={props.cfg} setCfg={props.setCfg} />}
      {tab === "route" && <RouteSetup routes={props.routes} setRoutes={props.setRoutes} busStops={props.busStops} />}
      {tab === "stop" && <BusStopSetup busStops={props.busStops} setBusStops={props.setBusStops} />}
      {tab === "assign" && <StudentRouteAssignment students={props.students} routes={props.routes} busStops={props.busStops} assignments={props.assignments} setAssignments={props.setAssignments} />}
    </div>
  );
}
