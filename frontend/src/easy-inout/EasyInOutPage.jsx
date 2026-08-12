import React from "react";
import { useLocation } from "react-router-dom";
import { EasyInOutProvider, useEasyInOut } from "./EasyInOutContext";
import { PhoneFrame } from "./components/PhoneFrame";
import { MarkInOut } from "./components/MarkInOut";
import { BusAttendance } from "./components/BusAttendance";
import { Report } from "./components/Report";
import { StudentMaster } from "./components/StudentMaster";
import { Setup } from "./components/Setup";

function EasyInOutContent() {
  const location = useLocation();
  const {
    students, setStudents,
    busStops, setBusStops,
    routes, setRoutes,
    assignments, setAssignments,
    cfg, setCfg,
    templates, setTemplates,
    log, setLog
  } = useEasyInOut();

  const pathname = location.pathname;
  let active = "inout";
  if (pathname.includes("/bus")) active = "bus";
  else if (pathname.includes("/report")) active = "report";
  else if (pathname.includes("/student")) active = "student";
  else if (pathname.includes("/setup")) active = "setup";
  else if (pathname.includes("/inout")) active = "inout";

  return (
    <div className="w-full h-full min-h-screen bg-gray-100 py-2 sm:py-6 overflow-x-hidden">
      {active === "inout" && (
        <PhoneFrame title="Mark In-Out">
          <MarkInOut students={students} cfg={cfg} log={log} setLog={setLog} />
        </PhoneFrame>
      )}
      {active === "bus" && (
        <PhoneFrame title="Bus Attendance">
          <BusAttendance students={students} routes={routes} busStops={busStops} assignments={assignments} cfg={cfg} />
        </PhoneFrame>
      )}
      {active === "report" && (
        <Report students={students} log={log} routes={routes} busStops={busStops} assignments={assignments} />
      )}
      {active === "student" && (
        <StudentMaster students={students} setStudents={setStudents} />
      )}
      {active === "setup" && (
        <Setup
          templates={templates} setTemplates={setTemplates}
          cfg={cfg} setCfg={setCfg}
          routes={routes} setRoutes={setRoutes}
          busStops={busStops} setBusStops={setBusStops}
          students={students}
          assignments={assignments} setAssignments={setAssignments}
        />
      )}
    </div>
  );
}

export default function EasyInOutPage() {
  return (
    <EasyInOutProvider>
      <EasyInOutContent />
    </EasyInOutProvider>
  );
}
