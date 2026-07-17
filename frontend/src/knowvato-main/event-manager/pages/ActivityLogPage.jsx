import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "../lib/router-shim";
import { useEventData } from "../context/EventDataContext";
import { fetchEventLogs } from "../services/api";

const ACTION_META = {
  "Event Created":      { icon: "bi-plus-circle",   color: "var(--success)" },
  "Event Updated":      { icon: "bi-pencil",         color: "var(--info)" },
  "Event Deleted":      { icon: "bi-trash",          color: "var(--destructive)" },
  "Attendees Imported": { icon: "bi-cloud-upload",   color: "var(--info)" },
  "Attendee Updated":   { icon: "bi-person-check",   color: "var(--warning)" },
  "Attendee Deleted":   { icon: "bi-person-x",       color: "var(--destructive)" },
  "Pass Design Saved":  { icon: "bi-qr-code",        color: "var(--primary)" },
  "Passes Downloaded":  { icon: "bi-download",       color: "var(--success)" },
};

const fmtDate = (d) => {
  if (!d) return "—";
  return new Date(d).toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

// Smart value renderer — handles nested objects/arrays gracefully
const renderValue = (value) => {
  if (value === null || value === undefined) return "—";

  if (Array.isArray(value)) {
    if (value.length === 0) return "None";

    if (typeof value[0] === "object" && value[0] !== null) {
      // Attendee field settings (have label + type/fieldId)
      const isFields =
        value[0]?.label !== undefined &&
        (value[0]?.type !== undefined || value[0]?.fieldId !== undefined);
      if (isFields) {
        return (
          <table style={{ width: "100%", borderCollapse: "collapse", marginTop: 4 }}>
            <thead>
              <tr style={{ fontSize: 10, color: "var(--muted-foreground)", textTransform: "uppercase" }}>
                <th style={{ fontWeight: 600, paddingBottom: 4, paddingRight: 12 }}>Field</th>
                <th style={{ fontWeight: 600, paddingBottom: 4, paddingRight: 12 }}>Type</th>
                <th style={{ fontWeight: 600, paddingBottom: 4, paddingRight: 12 }}>Used</th>
                <th style={{ fontWeight: 600, paddingBottom: 4 }}>Required</th>
              </tr>
            </thead>
            <tbody>
              {value.map((f, i) => (
                <tr key={i} style={{ fontSize: 12 }}>
                  <td style={{ paddingRight: 12, paddingBottom: 2, fontWeight: 600 }}>{f.label || f.fieldId}</td>
                  <td style={{ paddingRight: 12, paddingBottom: 2, color: "var(--muted-foreground)" }}>{f.type || "—"}</td>
                  <td style={{ paddingRight: 12, paddingBottom: 2 }}>
                    {f.enabled !== false
                      ? <span style={{ color: "#16a34a", fontWeight: 600 }}>Yes</span>
                      : <span style={{ color: "var(--muted-foreground)" }}>No</span>}
                  </td>
                  <td style={{ paddingBottom: 2 }}>
                    {f.required
                      ? <span style={{ color: "#dc2626", fontWeight: 600 }}>Yes</span>
                      : <span style={{ color: "var(--muted-foreground)" }}>No</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        );
      }

      // Category settings (have label + color)
      const isCats =
        value[0]?.label !== undefined && value[0]?.color !== undefined;
      if (isCats) {
        const enabled = value.filter((c) => c.enabled !== false);
        if (enabled.length === 0) return <span style={{ color: "var(--muted-foreground)" }}>None selected</span>;
        return (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginTop: 4 }}>
            {enabled.map((c, i) => (
              <span
                key={i}
                style={{
                  background: c.color || "var(--muted-foreground)",
                  color: "var(--card)",
                  borderRadius: 4,
                  padding: "1px 8px",
                  fontSize: 11,
                  fontWeight: 600,
                }}
              >
                {c.label}
              </span>
            ))}
          </div>
        );
      }

      // Generic array of objects — show count
      return <span style={{ color: "var(--muted-foreground)" }}>{value.length} item{value.length !== 1 ? "s" : ""}</span>;
    }

    return value.join(", ");
  }

  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
};

const LABEL_MAP = {
  eventName:            "Event Name",
  startDate:            "Start Date",
  endDate:              "End Date",
  venue:                "Venue",
  organizer:            "Organizer",
  attendeeFields:       "Attendee Details",
  attendeeFieldSettings:"Attendee Details",
  categories:           "Categories",
  count:                "Count",
  names:                "Names",
  status:               "Status",
  passStatus:           "Pass Status",
  passDesignSaved:      "Pass Design",
};

const RecordBlock = ({ data, type }) => {
  if (!data || Object.keys(data).length === 0) return null;
  const isOld = type === "old";
  return (
    <div
      style={{
        background: isOld ? "#fff5f5" : "#f0fdf4",
        border: `1px solid ${isOld ? "var(--destructive)" : "#bbf7d0"}`,
        borderRadius: 8,
        padding: "10px 14px",
        marginTop: 8,
        flex: 1,
      }}
    >
      <div
        style={{
          fontSize: 10,
          fontWeight: 700,
          color: isOld ? "#dc2626" : "#16a34a",
          textTransform: "uppercase",
          letterSpacing: 0.6,
          marginBottom: 8,
        }}
      >
        {isOld ? "Old Record" : "New Record"}
      </div>
      {Object.entries(data).map(([k, v]) => (
        <div key={k} style={{ marginBottom: 6 }}>
          <span style={{ fontSize: 11, color: "var(--muted-foreground)", fontWeight: 600 }}>
            {LABEL_MAP[k] || k}:
          </span>
          <div style={{ fontSize: 12, color: isOld ? "#dc2626" : "#16a34a", marginTop: 2 }}>
            {renderValue(v)}
          </div>
        </div>
      ))}
    </div>
  );
};

const ActivityLogPage = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const { events } = useEventData();
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  const selectedEvent = events.find(
    (e) => e.id === Number(eventId) || e.id === eventId,
  );

  useEffect(() => {
    setLoading(true);
    fetchEventLogs(eventId)
      .then(setLogs)
      .catch(() => setLogs([]))
      .finally(() => setLoading(false));
  }, [eventId]);

  return (
    <div className="container-fluid p-2 fade-in">
      {/* Header */}
      <div className="card border-0 shadow-sm mb-3">
        <div className="card-body p-3">
          <nav aria-label="breadcrumb" className="mb-2">
            <ol className="breadcrumb mb-0 app-breadcrumb">
              <li className="breadcrumb-item flex-shrink-0">
                <button type="button" className="btn btn-link p-0" style={{ fontSize: "inherit", lineHeight: "inherit", textDecoration: "none", whiteSpace: "nowrap" }} onClick={() => navigate("/events")}>
                  Events
                </button>
              </li>
              <li className="breadcrumb-item active text-truncate" style={{ minWidth: 0 }}>
                {selectedEvent?.eventName || "Event"} — Activity Log
              </li>
            </ol>
          </nav>
          <div className="d-flex align-items-center justify-content-between">
            <div>
              <h5 className="fw-bold mb-0">Activity Log</h5>
              {selectedEvent && (
                <small className="text-muted">{selectedEvent.eventName}</small>
              )}
            </div>
            {!loading && (
              <span
                className="badge border"
                style={{ background: "var(--background)", color: "var(--muted-foreground)", fontSize: 12 }}
              >
                {logs.length} {logs.length === 1 ? "entry" : "entries"}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className="card border-0 shadow-sm">
        <div className="card-body p-3">
          {loading ? (
            <div className="text-center text-muted py-5">Loading…</div>
          ) : logs.length === 0 ? (
            <div className="text-center text-muted py-5">
              No activity recorded yet.
            </div>
          ) : (
            <div style={{ position: "relative", paddingLeft: 38 }}>
              {/* Vertical line */}
              <div
                style={{
                  position: "absolute",
                  left: 14,
                  top: 0,
                  bottom: 0,
                  width: 2,
                  background: "var(--border)",
                }}
              />

              {logs.map((log) => {
                const meta = ACTION_META[log.action] || {
                  icon: "bi-circle",
                  color: "var(--muted-foreground)",
                };
                const hasDiff = log.oldData || log.newData;

                return (
                  <div key={log._id} style={{ position: "relative", marginBottom: 20 }}>
                    {/* Dot */}
                    <div
                      style={{
                        position: "absolute",
                        left: -38,
                        top: 12,
                        width: 26,
                        height: 26,
                        borderRadius: "50%",
                        background: "var(--card)",
                        border: `2px solid ${meta.color}`,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        zIndex: 1,
                      }}
                    >
                      <i
                        className={`bi ${meta.icon}`}
                        style={{ fontSize: 11, color: meta.color }}
                      />
                    </div>

                    {/* Card */}
                    <div
                      style={{
                        background: "var(--background)",
                        border: "1px solid var(--border)",
                        borderRadius: 10,
                        padding: "12px 16px",
                      }}
                    >
                      {/* Action + timestamp */}
                      <div className="d-flex justify-content-between align-items-start gap-2 flex-wrap">
                        <span
                          style={{ fontSize: 14, fontWeight: 700, color: meta.color }}
                        >
                          {log.action}
                        </span>
                        <span style={{ fontSize: 11, color: "var(--muted-foreground)", whiteSpace: "nowrap" }}>
                          {fmtDate(log.changedAt)}
                        </span>
                      </div>

                      {/* Entity + who */}
                      <div style={{ fontSize: 12, color: "var(--muted-foreground)", marginTop: 4 }}>
                        {log.entityName && (
                          <span className="fw-semibold text-dark me-1">
                            {log.entityName}
                          </span>
                        )}
                        <span>
                          Modified by{" "}
                          <strong style={{ color: "var(--foreground)" }}>
                            {log.changedBy || "Admin"}
                          </strong>
                        </span>
                      </div>

                      {/* Old + New records */}
                      {hasDiff && (
                        <div
                          className="d-flex gap-2 flex-wrap mt-1 record-diff-row"
                          style={{ alignItems: "flex-start" }}
                        >
                          <RecordBlock data={log.oldData} type="old" />
                          <RecordBlock data={log.newData} type="new" />
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ActivityLogPage;
