import React, { useMemo, useState } from "react";
import { useEventData } from "../context/EventDataContext";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

const THEME = "var(--primary)";
const COLORS = ["var(--primary)", "var(--info)", "var(--success)", "var(--warning)", "#EF4444", "#06B6D4", "#8B5CF6", "#EC4899"];

const StatCard = ({ icon, label, value, trend, color }) => (
  <div
    className="card border shadow-sm h-100"
    style={{ borderRadius: "var(--radius)", background: "var(--card)", borderColor: "var(--border)", overflow: "hidden" }}
  >
    <div className="card-body p-3 d-flex align-items-center gap-3">
      <div
        style={{
          width: 44,
          height: 44,
          borderRadius: "var(--radius)",
          background: `color-mix(in oklch, ${color} 15%, transparent)`,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        <i className={`bi ${icon}`} style={{ fontSize: 20, color }} />
      </div>
      <div className="flex-grow-1 min-w-0">
        <div style={{ fontSize: 12, color: "var(--muted-foreground)" }}>
          {label}
        </div>
        <div className="fw-bold" style={{ fontSize: 24, color: "var(--foreground)", lineHeight: 1.2 }}>
          {value}
        </div>
      </div>
      {trend && (
        <span style={{ color: trend > 0 ? "var(--success)" : "var(--destructive)", fontSize: 11, fontWeight: 600, flexShrink: 0 }}>
          {trend > 0 ? "↑" : "↓"} {Math.abs(trend)}%
        </span>
      )}
    </div>
  </div>
);

const ChartCard = ({ title, children }) => (
  <div className="card border shadow-sm" style={{ borderRadius: "var(--radius)", background: "var(--card)", borderColor: "var(--border)" }}>
    <div className="card-body p-4">
      <h6 className="card-title fw-bold mb-4" style={{ fontSize: 14, color: "var(--foreground)" }}>
        {title}
      </h6>
      {children}
    </div>
  </div>
);

const formatDate = (date) => {
  if (!date) return "—";
  const d = new Date(date);
  return d.toLocaleDateString("en-IN", { month: "short", day: "numeric", year: "numeric" });
};

const parseDate = (dateStr) => {
  if (!dateStr) return null;
  const parts = dateStr.split("/");
  if (parts.length === 3) {
    return new Date(parts[2], parts[1] - 1, parts[0]);
  }
  return new Date(dateStr);
};

const DashboardPage = () => {
  const { events, attendees, eventTypes } = useEventData();
  const [showEventTypeTable, setShowEventTypeTable] = useState(false);
  const [showLast7DaysTable, setShowLast7DaysTable] = useState(false);

  const now = new Date();
  const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  // Calculate KPIs
  const totalEvents = events.length;
  const totalRegistrants = attendees.length;
  const totalAttendees = attendees.filter((a) => a.status && a.status !== "registered").length;
  const attendeePercentage = totalRegistrants > 0 ? ((totalAttendees / totalRegistrants) * 100).toFixed(1) : 0;

  // Last 7 days events
  const last7DaysEvents = useMemo(() => {
    return events.filter((e) => {
      const startDate = parseDate(e.startDate);
      return startDate && startDate >= sevenDaysAgo && startDate <= now;
    });
  }, [events]);

  // Event type wise count with proper mapping
  const eventTypeWiseData = useMemo(() => {
    const types = {};
    const eventTypeMap = {};
    const eventTypeMapByIdOnly = {};

    // Create mapping both ways - by id field and by _id field (in case normalization varies)
    (eventTypes || []).filter((et) => et.active).forEach((et) => {
      const id = et.id || et._id;
      eventTypeMap[id] = et.label;
      eventTypeMapByIdOnly[et._id] = et.label;
      types[et.label] = 0;
    });

    let unclassifiedCount = 0;

    events.forEach((e) => {
      const eventTypeId = e.eventType?.trim() || "";

      if (eventTypeId) {
        // Try to match with mapped event type
        const mappedLabel = eventTypeMap[eventTypeId] || eventTypeMapByIdOnly[eventTypeId];

        if (mappedLabel) {
          types[mappedLabel]++;
        } else if (eventTypeId.length <= 50 && !/^[a-f0-9]{24}$/.test(eventTypeId)) {
          // EventType is already a label (not an ObjectId)
          types[eventTypeId] = (types[eventTypeId] || 0) + 1;
        } else {
          // No valid event type found
          unclassifiedCount++;
        }
      } else {
        unclassifiedCount++;
      }
    });

    // Only add Unclassified if there are unclassified events
    if (unclassifiedCount > 0) {
      types["Unclassified"] = unclassifiedCount;
    }

    return Object.entries(types)
      .filter(([, count]) => count > 0) // Only show types with at least 1 event
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count);
  }, [events, eventTypes]);

  // Event wise attendee percentage
  const eventWiseAttendance = useMemo(() => {
    return events.map((e) => {
      const eventAttendees = attendees.filter((a) => a.eventId === e._id || a.eventId === e.id);
      const checkedIn = eventAttendees.filter((a) => a.status && a.status !== "registered").length;
      const percentage = eventAttendees.length > 0 ? Math.round((checkedIn / eventAttendees.length) * 100) : 0;
      return {
        name: e.eventName,
        registered: eventAttendees.length,
        attended: checkedIn,
        percentage,
      };
    }).sort((a, b) => b.percentage - a.percentage);
  }, [events, attendees]);

  // Last 7 days timeline
  const last7DaysTimeline = useMemo(() => {
    const data = {};
    const labels = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      const key = d.toLocaleDateString("en-IN", { month: "short", day: "numeric" });
      data[key] = 0;
      labels.push(key);
    }
    last7DaysEvents.forEach((e) => {
      const startDate = parseDate(e.startDate);
      const key = startDate.toLocaleDateString("en-IN", { month: "short", day: "numeric" });
      data[key]++;
    });
    return labels.map((label) => ({ date: label, events: data[label] }));
  }, [last7DaysEvents, events]);

  return (
    <div className="container-fluid p-3" style={{ background: "var(--background)", minHeight: "100vh" }}>
      {/* Header */}
      <div className="mb-4">
        <h2 className="fw-bold mb-1" style={{ fontSize: 28, color: "var(--foreground)" }}>
          Analytics & Insights
        </h2>
        <p className="text-muted mb-0" style={{ fontSize: 14 }}>
          Real-time overview of your events and attendee data
        </p>
      </div>

      {/* KPI Cards */}
      <div className="row g-2 mb-4">
        <div className="col-6 col-md-3">
          <StatCard
            icon="bi-calendar-event"
            label="Total Events"
            value={totalEvents}
            color={THEME}
          />
        </div>
        <div className="col-6 col-md-3">
          <StatCard
            icon="bi-people"
            label="Total Registrants"
            value={totalRegistrants}
            color="var(--info)"
          />
        </div>
        <div className="col-6 col-md-3">
          <StatCard
            icon="bi-person-check"
            label="Total Attendees"
            value={totalAttendees}
            color="var(--success)"
          />
        </div>
        <div className="col-6 col-md-3">
          <StatCard
            icon="bi-percent"
            label="Attendance Rate"
            value={`${attendeePercentage}%`}
            color="var(--warning)"
          />
        </div>
      </div>

      {/* Charts Row 1 */}
      <div className="row g-3 mb-4">
        {/* Event Type Distribution */}
        <div className="col-12 col-lg-6">
          <div className="card border-0 shadow-sm" style={{ borderRadius: 12, background: "var(--card)", height: 420 }}>
            <div className="card-body p-4 d-flex flex-column" style={{ height: "100%" }}>
              <div className="d-flex align-items-center justify-content-between mb-4">
                <h6 className="card-title fw-bold mb-0" style={{ fontSize: 14, color: "var(--foreground)" }}>
                  Event Type Distribution
                </h6>
                <button
                  type="button"
                  className="btn btn-sm"
                  style={{
                    background: showEventTypeTable ? THEME : "var(--secondary)",
                    color: showEventTypeTable ? "var(--card)" : "var(--muted-foreground)",
                    border: "none",
                    fontSize: 11,
                  }}
                  onClick={() => setShowEventTypeTable(!showEventTypeTable)}
                >
                  <i className="bi bi-table me-1" />
                  {showEventTypeTable ? "Hide" : "Show"} Table
                </button>
              </div>
              {eventTypeWiseData.length > 0 ? (
                showEventTypeTable ? (
                  <div className="table-responsive flex-grow-1" style={{ overflowY: "auto" }}>
                    <table className="table table-sm align-middle mb-0" style={{ fontSize: 12 }}>
                      <thead style={{ background: "var(--background)", position: "sticky", top: 0 }}>
                        <tr>
                          <th>Event Type</th>
                          <th className="text-end">Count</th>
                          <th className="text-end">Percentage</th>
                        </tr>
                      </thead>
                      <tbody>
                        {eventTypeWiseData.map((type, idx) => {
                          const total = eventTypeWiseData.reduce((sum, t) => sum + t.count, 0);
                          const percentage = ((type.count / total) * 100).toFixed(1);
                          return (
                            <tr key={idx}>
                              <td>
                                <div className="d-flex align-items-center gap-2">
                                  <div
                                    style={{
                                      width: 12,
                                      height: 12,
                                      borderRadius: 2,
                                      background: COLORS[idx % COLORS.length],
                                    }}
                                  />
                                  {type.name}
                                </div>
                              </td>
                              <td className="text-end fw-semibold">{type.count}</td>
                              <td className="text-end">
                                <span
                                  className="badge"
                                  style={{
                                    background: "oklch(var(--success-h) var(--success-s) var(--success-l) / 10%)",
                                    color: "var(--success)",
                                    fontSize: 11,
                                  }}
                                >
                                  {percentage}%
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={320}>
                    <PieChart>
                      <Pie
                        data={eventTypeWiseData}
                        cx="45%"
                        cy="50%"
                        labelLine={true}
                        label={({ name, count, percent }) => `${name}\n${count}`}
                        outerRadius={75}
                        fill="#8884d8"
                        dataKey="count"
                      >
                        {eventTypeWiseData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Legend
                        verticalAlign="middle"
                        align="right"
                        layout="vertical"
                        formatter={(value, entry) => `${entry.payload.name}: ${entry.payload.count}`}
                      />
                      <Tooltip
                        contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8 }}
                        formatter={(value) => `${value} event${value > 1 ? 's' : ''}`}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                )
              ) : (
                <div className="text-center text-muted py-5">No event type data available</div>
              )}
            </div>
          </div>
        </div>

        {/* Last 7 Days Events */}
        <div className="col-12 col-lg-6">
          <div className="card border-0 shadow-sm" style={{ borderRadius: 12, background: "var(--card)", height: 420 }}>
            <div className="card-body p-4 d-flex flex-column" style={{ height: "100%" }}>
              <div className="d-flex align-items-center justify-content-between mb-4">
                <h6 className="card-title fw-bold mb-0" style={{ fontSize: 14, color: "var(--foreground)" }}>
                  Last 7 Days - Events Created
                </h6>
                <button
                  type="button"
                  className="btn btn-sm"
                  style={{
                    background: showLast7DaysTable ? THEME : "var(--secondary)",
                    color: showLast7DaysTable ? "var(--card)" : "var(--muted-foreground)",
                    border: "none",
                    fontSize: 11,
                  }}
                  onClick={() => setShowLast7DaysTable(!showLast7DaysTable)}
                >
                  <i className="bi bi-table me-1" />
                  {showLast7DaysTable ? "Hide" : "Show"} Table
                </button>
              </div>
              {showLast7DaysTable ? (
                <div className="table-responsive flex-grow-1" style={{ overflowY: "auto" }}>
                  <table className="table table-sm align-middle mb-0" style={{ fontSize: 12 }}>
                    <thead style={{ background: "var(--background)", position: "sticky", top: 0 }}>
                      <tr>
                        <th>Date</th>
                        <th>Event Name</th>
                      </tr>
                    </thead>
                    <tbody>
                      {last7DaysEvents.length > 0 ? (
                        last7DaysEvents.map((event) => (
                          <tr key={event._id || event.id}>
                            <td className="fw-semibold text-nowrap">{formatDate(event.startDate)}</td>
                            <td>{event.eventName}</td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={2} className="text-center text-muted py-3">
                            No events created in last 7 days
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={280}>
                  <BarChart data={last7DaysTimeline}>
                    <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                    <XAxis dataKey="date" stroke="var(--muted-foreground)" style={{ fontSize: 11 }} />
                    <YAxis stroke="var(--muted-foreground)" style={{ fontSize: 11 }} allowDecimals={false} />
                    <Tooltip
                      contentStyle={{ background: "var(--card)", border: "1px solid var(--border)", borderRadius: 8 }}
                      formatter={(value) => [`${value} event${value > 1 ? 's' : ''}`, 'Count']}
                    />
                    <Bar dataKey="events" fill={THEME} radius={[6, 6, 0, 0]} barSize={20} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </div>
        </div>
      </div>



      {/* Event-wise Attendance Details */}
      <div className="row g-3 mt-1">
        <div className="col-12">
          <div className="card border-0 shadow-sm" style={{ borderRadius: 12 }}>
            <div className="card-body p-0">
              <div className="px-4 py-3" style={{ borderBottom: "1px solid var(--border)" }}>
                <h6 className="fw-bold mb-0" style={{ fontSize: 14, color: "var(--foreground)" }}>
                  Event-wise Attendance Details
                </h6>
              </div>
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0" style={{ fontSize: 13 }}>
                  <thead>
                    <tr style={{ background: "var(--background)" }}>
                      <th>Event Name</th>
                      <th className="text-end">Registered</th>
                      <th className="text-end">Attended</th>
                      <th className="text-end">Percentage</th>
                      <th className="text-center">Progress</th>
                    </tr>
                  </thead>
                  <tbody>
                    {eventWiseAttendance.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="text-center py-4 text-muted">
                          No event data available
                        </td>
                      </tr>
                    ) : (
                      eventWiseAttendance.map((row) => (
                        <tr key={row.name}>
                          <td className="fw-semibold">{row.name}</td>
                          <td className="text-end fw-semibold">{row.registered}</td>
                          <td className="text-end fw-semibold">{row.attended}</td>
                          <td className="text-end">
                            <span className="badge" style={{ background: "oklch(var(--success-h) var(--success-s) var(--success-l) / 10%)", color: "var(--success)" }}>
                              {row.percentage}%
                            </span>
                          </td>
                          <td>
                            <div
                              style={{
                                background: "var(--border)",
                                borderRadius: 8,
                                height: 24,
                                overflow: "hidden",
                              }}
                            >
                              <div
                                style={{
                                  background: row.percentage >= 80 ? "var(--success)" : row.percentage >= 50 ? "var(--warning)" : THEME,
                                  height: "100%",
                                  width: `${row.percentage}%`,
                                  transition: "width 0.3s ease",
                                }}
                              />
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
