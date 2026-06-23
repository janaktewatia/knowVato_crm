import { useState } from "react";
import { leadsApi, mastersApi } from "../api";
import { useApi } from "../hooks/useApi";
import { Spinner, ErrorBox } from "./ui";
import { formatDateTime } from "../utils/dateFormat";

export default function JourneySlider({ lead, onClose, statuses = [], services = [] }) {
  const [isClosing, setIsClosing] = useState(false);
  const leadData = useApi(() => leadsApi.get(lead._id), [lead._id]);

  const handleClose = () => {
    setIsClosing(true);
  };

  const l = leadData.data;

  // Calculate days
  const calculateDays = (fromDate) => {
    if (!fromDate) return 0;
    const now = new Date();
    const from = new Date(fromDate);
    const diffTime = Math.abs(now - from);
    return Math.floor(diffTime / (1000 * 60 * 60 * 24));
  };

  const leadDays = l ? calculateDays(l.createdAt) : 0;
  const conversionDays = l && l.createdAt && l.lastActivity ? calculateDays(l.createdAt) : 0;

  // Build timeline of events
  const events = [];

  if (l) {
    // 1. Lead Creation event
    if (l.createdAt) {
      events.push({
        type: "created",
        timestamp: new Date(l.createdAt),
        title: "Lead Created",
        icon: "plus-circle",
        color: "#0085a8",
        details: l.source?.name ? `From: ${l.source.name}` : "Lead added to system"
      });
    }

    // 2. Service Track events
    if (l.serviceTracks && l.serviceTracks.length > 0) {
      l.serviceTracks.forEach((track, idx) => {
        const svc = services.find(s => s._id === track.service?._id || s._id === track.service);
        if (track.updatedAt) {
          const status = statuses.find(s => s._id === track.status);
          events.push({
            type: "service",
            timestamp: new Date(track.updatedAt),
            title: `Service Added: ${svc?.name || "Service"}`,
            icon: "briefcase",
            color: "#25d366",
            details: status ? `Status: ${status.name}` : "Added to pipeline"
          });
        }
      });
    }

    // 3. Status change events
    if (l.status) {
      const mainStatus = statuses.find(s => s._id === l.status);
      events.push({
        type: "status",
        timestamp: new Date(l.updatedAt || l.lastActivity),
        title: "Status Changed",
        icon: "arrow-repeat",
        color: "#b07400",
        details: mainStatus ? `Changed to: ${mainStatus.name}` : "Status changed"
      });
    }

    // 4. Notes/Activity events
    if (l.notes && l.notes.length > 0) {
      l.notes.forEach((note) => {
        events.push({
          type: "note",
          timestamp: new Date(note.at),
          title: "Activity Note",
          icon: "chat-left-quote",
          color: "#6c757d",
          details: note.text,
          by: note.by
        });
      });
    }
  }

  // Sort events by timestamp (most recent first)
  events.sort((a, b) => b.timestamp - a.timestamp);

  // Remove duplicates and keep only unique timestamps/types
  const uniqueEvents = [];
  const seen = new Set();
  events.forEach(event => {
    const key = `${event.type}-${event.timestamp.getTime()}`;
    if (!seen.has(key)) {
      uniqueEvents.push(event);
      seen.add(key);
    }
  });

  return (
    <>
      <div className="offcanvas-backdrop fade show" onClick={handleClose}></div>
      <div
        className="offcanvas offcanvas-end show"
        style={{
          visibility: "visible",
          width: 500,
          animation: isClosing ? "slideOutRight 0.5s ease-out forwards" : "slideInRight 0.5s ease-out"
        }}
        onAnimationEnd={() => isClosing && onClose()}
      >
        <div className="offcanvas-header border-bottom">
          <h5 className="offcanvas-title">Lead Journey</h5>
          <button className="btn-close" onClick={handleClose}></button>
        </div>

        <div className="offcanvas-body" style={{ maxHeight: "calc(100vh - 100px)", overflowY: "auto" }}>
          {leadData.loading ? (
            <Spinner />
          ) : !l ? (
            <ErrorBox error={leadData.error} />
          ) : (
            <>
              {/* Lead Header */}
              <div className="mb-4 pb-3 border-bottom">
                <div className="fw-semibold mb-2" style={{ fontSize: 15 }}>{l.name}</div>
                <div className="text-muted small mb-3">{l.phone}</div>

                {/* Lead Days Stats */}
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                  <div style={{ background: "var(--accent-soft)", borderRadius: "6px", padding: "10px 12px" }}>
                    <div style={{ fontSize: 10, color: "var(--muted)", marginBottom: "4px" }}>Lead Days</div>
                    <div style={{ fontSize: 16, fontWeight: 600, color: "var(--accent)" }}>
                      {leadDays}
                    </div>
                  </div>
                  <div style={{ background: "#e3f6ea", borderRadius: "6px", padding: "10px 12px" }}>
                    <div style={{ fontSize: 10, color: "var(--muted)", marginBottom: "4px" }}>Conversion Days</div>
                    <div style={{ fontSize: 16, fontWeight: 600, color: "#139948" }}>
                      {conversionDays}
                    </div>
                  </div>
                </div>
              </div>

              {/* Timeline */}
              <div>
                <div style={{ fontSize: 12, fontWeight: 600, textTransform: "uppercase", color: "var(--text-2)", marginBottom: 16 }}>
                  <i className="bi bi-clock-history me-1"></i>Journey Timeline
                </div>

                {uniqueEvents.length === 0 ? (
                  <div className="text-muted text-center py-4" style={{ fontSize: 13 }}>
                    <i className="bi bi-inbox me-1"></i>No events recorded yet
                  </div>
                ) : (
                  <div style={{ position: "relative" }}>
                    {/* Timeline line */}
                    <div
                      style={{
                        position: "absolute",
                        left: "15px",
                        top: 0,
                        bottom: 0,
                        width: "2px",
                        background: "var(--border)"
                      }}
                    ></div>

                    {/* Timeline events */}
                    <div style={{ display: "flex", flexDirection: "column", gap: "20px", paddingLeft: "50px" }}>
                      {uniqueEvents.map((event, idx) => (
                        <div key={idx}>
                          {/* Event dot */}
                          <div
                            style={{
                              position: "absolute",
                              left: "5px",
                              width: "20px",
                              height: "20px",
                              borderRadius: "50%",
                              background: event.color,
                              border: "3px solid white",
                              boxShadow: `0 0 0 2px ${event.color}33`,
                              display: "flex",
                              alignItems: "center",
                              justifyContent: "center",
                              color: "white",
                              fontSize: "10px"
                            }}
                          >
                            <i className={`bi bi-${event.icon}`} style={{ fontSize: "10px" }}></i>
                          </div>

                          {/* Event card */}
                          <div
                            style={{
                              background: "var(--surface-2)",
                              border: "1px solid var(--border)",
                              borderRadius: "8px",
                              padding: "12px 14px"
                            }}
                          >
                            <div
                              style={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "baseline",
                                marginBottom: "6px"
                              }}
                            >
                              <div style={{ fontWeight: 600, fontSize: 13, color: event.color }}>
                                {event.title}
                              </div>
                              <div style={{ fontSize: 11, color: "var(--muted)" }}>
                                {formatDateTime(event.timestamp)}
                              </div>
                            </div>

                            <div style={{ fontSize: 12, color: "var(--text-2)", marginBottom: "4px" }}>
                              {event.details}
                            </div>

                            {event.by && (
                              <div style={{ fontSize: 11, color: "var(--muted)" }}>
                                <i className="bi bi-person-check me-1"></i>by {event.by}
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Summary Stats */}
              <div style={{ marginTop: "30px", paddingTop: "20px", borderTop: "1px solid var(--border)" }}>
                <div style={{ fontSize: 12, fontWeight: 600, textTransform: "uppercase", color: "var(--text-2)", marginBottom: 12 }}>
                  <i className="bi bi-graph-up me-1"></i>Summary
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                  <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "8px", padding: "10px 12px" }}>
                    <div style={{ fontSize: 11, color: "var(--muted)", marginBottom: "4px" }}>Total Actions</div>
                    <div style={{ fontSize: 18, fontWeight: 600, color: "var(--accent)" }}>
                      {uniqueEvents.length}
                    </div>
                  </div>
                  <div style={{ background: "var(--surface)", border: "1px solid var(--border)", borderRadius: "8px", padding: "10px 12px" }}>
                    <div style={{ fontSize: 11, color: "var(--muted)", marginBottom: "4px" }}>Services</div>
                    <div style={{ fontSize: 18, fontWeight: 600, color: "var(--accent)" }}>
                      {l.serviceTracks?.length || 0}
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
