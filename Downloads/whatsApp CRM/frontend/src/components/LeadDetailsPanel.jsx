import { useState } from "react";
import { leadsApi } from "../api";
import { useApi } from "../hooks/useApi";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { Spinner, ErrorBox } from "./ui";
import { formatDate } from "../utils/dateFormat";

export default function LeadDetailsPanel({ id, onClose, onChanged, statuses, services = [] }) {
  const toast = useToast();
  const { can } = useAuth();
  const lead = useApi(() => leadsApi.get(id), [id]);
  const [note, setNote] = useState("");
  const [adding, setAdding] = useState(false);
  const [selectedService, setSelectedService] = useState("");
  const [isClosing, setIsClosing] = useState(false);
  const l = lead.data;
  const serviceMap = Object.fromEntries((services || []).map((s) => [s._id, s]));

  const handleClose = () => {
    setIsClosing(true);
  };

  async function setTrackStatus(serviceId, statusId) {
    try {
      await leadsApi.setServiceStatus(id, serviceId, statusId);
      toast("Status updated");
      lead.reload();
      onChanged();
    } catch (e) {
      toast(e.message, "error");
    }
  }

  async function addService() {
    if (!selectedService) return;
    try {
      await leadsApi.addService(id, selectedService);
      toast("Service added");
      setSelectedService("");
      setAdding(false);
      lead.reload();
      onChanged();
    } catch (e) {
      toast(e.message, "error");
    }
  }

  async function addNote() {
    if (!note.trim()) return;
    try {
      await leadsApi.addNote(id, note);
      setNote("");
      toast("Note added");
      lead.reload();
    } catch (e) {
      toast(e.message, "error");
    }
  }

  return (
    <>
      <div className="offcanvas-backdrop fade show" onClick={handleClose}></div>
      <div
        className="offcanvas offcanvas-end show"
        style={{
          visibility: "visible",
          width: 550,
          animation: isClosing ? "slideOutRight 0.5s ease-out forwards" : "slideInRight 0.5s ease-out"
        }}
        onAnimationEnd={() => isClosing && onClose()}
      >
        <div className="offcanvas-header border-bottom">
          <div>
            <h5 className="offcanvas-title mb-0" style={{ fontSize: 18, fontWeight: 600 }}>{l?.name || "…"}</h5>
            <div className="text-muted small">{l?.phone}{l?.email ? " · " + l.email : ""}</div>
          </div>
          <button className="btn-close" onClick={handleClose}></button>
        </div>

        <div className="offcanvas-body" style={{ maxHeight: "calc(100vh - 100px)", overflowY: "auto" }}>
          {lead.loading ? (
            <Spinner />
          ) : !l ? (
            <ErrorBox error={lead.error} />
          ) : (
            <>
              <div className="mb-4">
                <h6 className="mb-3" style={{ fontSize: 13, fontWeight: 600, textTransform: "uppercase", color: "var(--text-2)" }}>
                  Services & Statuses
                </h6>

                {(l.serviceTracks || []).length === 0 ? (
                  <div className="alert alert-info alert-sm" role="alert" style={{ fontSize: 12, padding: "8px 12px" }}>
                    No services yet. Add one to start tracking.
                  </div>
                ) : (
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: 16 }}>
                    {(l.serviceTracks || []).map((t, idx) => {
                      const svc = serviceMap[t.service?._id || t.service] || {};
                      const curStatus = t.status;
                      const opts = statuses.filter((s) => !s.service || String(s.service) === String(t.service));

                      return (
                        <div key={idx} className="border rounded p-3" style={{ background: "var(--surface-2)" }}>
                          <div className="mb-3">
                            <div style={{ fontSize: 13, fontWeight: 600, marginBottom: "8px" }}>
                              {svc.name || "Service"}
                            </div>
                            {t.nextFollowUp && (
                              <div className="text-muted small" style={{ fontSize: 11 }}>
                                <i className="bi bi-calendar-event me-1"></i>
                                {formatDate(t.nextFollowUp)}
                              </div>
                            )}
                          </div>

                          <select
                            className="form-select form-select-sm"
                            value={curStatus || ""}
                            onChange={(e) => setTrackStatus(t.service, e.target.value)}
                            disabled={!can("leads", "edit")}
                            style={{ fontSize: 12 }}
                          >
                            <option value="">Select Status</option>
                            {opts.map((s) => (
                              <option key={s._id} value={s._id}>
                                {s.name}
                              </option>
                            ))}
                          </select>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Add Service Button */}
                {can("leads", "edit") && (
                  <div>
                    {!adding ? (
                      <button
                        className="btn btn-outline-primary btn-sm w-100"
                        onClick={() => setAdding(true)}
                        style={{ fontSize: 12 }}
                      >
                        <i className="bi bi-plus-lg me-1"></i>Add Service
                      </button>
                    ) : (
                      <div style={{ display: "grid", gridTemplateColumns: "1fr auto auto", gap: "8px" }}>
                        <select
                          className="form-select form-select-sm"
                          value={selectedService}
                          onChange={(e) => setSelectedService(e.target.value)}
                        >
                          <option value="">Select a service</option>
                          {services.map((s) => (
                            <option key={s._id} value={s._id}>{s.name}</option>
                          ))}
                        </select>
                        <button
                          className="btn btn-primary btn-sm"
                          onClick={addService}
                          disabled={!selectedService}
                        >
                          Add
                        </button>
                        <button
                          className="btn btn-secondary btn-sm"
                          onClick={() => { setAdding(false); setSelectedService(""); }}
                        >
                          Cancel
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="mb-4">
                <h6 className="mb-2" style={{ fontSize: 13, fontWeight: 600, textTransform: "uppercase", color: "var(--text-2)" }}>
                  Information
                </h6>
                <dl className="row small mb-0">
                  <dt className="col-5 text-muted fw-normal">Source</dt>
                  <dd className="col-7 mb-2">{l.source?.name || "—"}</dd>
                  <dt className="col-5 text-muted fw-normal">Course</dt>
                  <dd className="col-7 mb-2">{l.course || "—"}</dd>
                  <dt className="col-5 text-muted fw-normal">Owner</dt>
                  <dd className="col-7 mb-2">{l.owner}</dd>
                  <dt className="col-5 text-muted fw-normal">Value</dt>
                  <dd className="col-7">₹{(l.value || 0).toLocaleString()}</dd>
                </dl>
              </div>

              <div>
                <h6 className="mb-2" style={{ fontSize: 13, fontWeight: 600, textTransform: "uppercase", color: "var(--text-2)" }}>
                  Activity
                </h6>
                {can("leads", "edit") && (
                  <div className="input-group input-group-sm mb-2">
                    <input
                      className="form-control"
                      placeholder="Log a note…"
                      value={note}
                      onChange={(e) => setNote(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && addNote()}
                    />
                    <button className="btn btn-primary" onClick={addNote}>Add</button>
                  </div>
                )}
                {(l.notes || []).length === 0 ? (
                  <div className="text-muted small">No notes yet.</div>
                ) : (
                  <ul className="list-unstyled small mb-0">
                    {l.notes.map((n, i) => (
                      <li key={i} className="py-2 border-bottom small">
                        <div className="fw-semibold" style={{ fontSize: 12 }}>{n.by}</div>
                        <div className="text-muted" style={{ fontSize: 11 }}>{new Date(n.at).toLocaleString()}</div>
                        <div style={{ fontSize: 12, marginTop: "4px" }}>{n.text}</div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
