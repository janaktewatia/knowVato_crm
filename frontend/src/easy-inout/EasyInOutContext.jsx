import React, { createContext, useContext, useState } from "react";
import { initialStudents, initialBusStops, initialRoutes, initialAssignments } from "./data/mockData";

const EasyInOutContext = createContext(null);

export function EasyInOutProvider({ children }) {
  const [students, setStudents] = useState(initialStudents);
  const [busStops, setBusStops] = useState(initialBusStops);
  const [routes, setRoutes] = useState(initialRoutes);
  const [assignments, setAssignments] = useState(initialAssignments);
  const [cfg, setCfg] = useState({ morningStart: "07:00", morningEnd: "09:30", afternoonStart: "13:00", afternoonEnd: "16:00" });
  const [templates, setTemplates] = useState({
    morningEntry: "Dear Parent, {{studentName}} has entered school premises at {{time}}. - EduNext",
    afternoonExit: "Dear Parent, {{studentName}} has left school premises at {{time}}. Have a safe journey home. - EduNext",
  });
  const [log, setLog] = useState([]);

  const value = {
    students, setStudents,
    busStops, setBusStops,
    routes, setRoutes,
    assignments, setAssignments,
    cfg, setCfg,
    templates, setTemplates,
    log, setLog,
  };

  return <EasyInOutContext.Provider value={value}>{children}</EasyInOutContext.Provider>;
}

export function useEasyInOut() {
  const ctx = useContext(EasyInOutContext);
  if (!ctx) throw new Error("useEasyInOut must be used within EasyInOutProvider");
  return ctx;
}
