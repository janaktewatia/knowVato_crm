import React, { useEffect, useMemo, useRef, useState } from "react";
import { FiSearch } from "react-icons/fi";
import { useParams, useSearchParams, useNavigate } from "../lib/router-shim";
import { useEventData } from "../context/EventDataContext";

const DEFAULT_CATEGORIES = [
  { name: "VIP", color: "var(--warning)" },
  { name: "General", color: "var(--info)" },
  { name: "Staff", color: "var(--success)" },
  { name: "Speaker", color: "#8B5CF6" },
  { name: "Press", color: "#EF4444" },
];

const normalizeKey = (k) =>
  k?.toString().trim().toLowerCase().replace(/[^a-z0-9]/g, "") || "";

const AttendanceRecordsPage = () => {
  const { eventId: paramEventId } = useParams();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { events, attendees, setSelectedEventId } = useEventData();

  // eventId from URL param (action button route) or query param (sidebar route)
  const fixedEventId = paramEventId || searchParams.get("event") || "";

  const [search, setSearch] = useState("");
  const [filterEventId, setFilterEventId] = useState(fixedEventId);
  const [filterStatus, setFilterStatus] = useState("");
  const [filterCat, setFilterCat] = useState("");
  const [filterOpen, setFilterOpen] = useState(false);
  const filterRef = useRef(null);

  // Fetch attendees for the selected event
  useEffect(() => {
    const id = filterEventId || fixedEventId;
    if (id) setSelectedEventId(id);
  }, [filterEventId, fixedEventId, setSelectedEventId]);

  // Close filter dropdown on outside click
  useEffect(() => {
    if (!filterOpen) return;
    const handler = (e) => {
      if (filterRef.current && !filterRef.current.contains(e.target))
        setFilterOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [filterOpen]);

  const selectedEvent = useMemo(
    () =>
      filterEventId
        ? events.find((e) => String(e.id) === String(filterEventId)) || null
        : null,
    [events, filterEventId],
  );

  // ── Dynamic column visibility ────────────────────────────────────────────

  const showPhone = useMemo(() => {
    if (!selectedEvent) return true;
    const fields = selectedEvent.attendeeFields;
    if (!fields?.length) return true;
    const f = fields.find((f) => f.fieldId === "mobile");
    return f ? f.enabled !== false : true;
  }, [selectedEvent]);

  const showEmail = useMemo(() => {
    if (!selectedEvent) return true;
    const fields = selectedEvent.attendeeFields;
    if (!fields?.length) return true;
    const f = fields.find((f) => f.fieldId === "email");
    return f ? f.enabled !== false : true;
  }, [selectedEvent]);

  const showCat = useMemo(() => {
    if (!selectedEvent) return false;
    return (selectedEvent.categories || []).some((c) => c.enabled === true);
  }, [selectedEvent]);

  const showOrg = useMemo(() => {
    if (!selectedEvent) return false;
    const fields = selectedEvent.attendeeFields;
    if (!fields?.length) return false;
    return fields.some(
      (f) => normalizeKey(f.label) === "organization" && f.enabled === true,
    );
  }, [selectedEvent]);

  // When accessed via /events/:eventId/attendees, hide the event column and selector
  const isEventLocked = Boolean(paramEventId);

  const eventCats = useMemo(
    () =>
      selectedEvent
        ? (selectedEvent.categories || []).filter((c) => c.enabled !== false)
        : [],
    [selectedEvent],
  );

  const getCatColor = (name) => {
    const evtCat = eventCats.find(
      (c) => c.label?.toLowerCase() === name?.toLowerCase(),
    );
    if (evtCat?.color) return evtCat.color;
    return (
      DEFAULT_CATEGORIES.find(
        (c) => c.name.toLowerCase() === name?.toLowerCase(),
      )?.color || "var(--muted-foreground)"
    );
  };

  // ── Filtering ────────────────────────────────────────────────────────────

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return attendees.filter((a) => {
      // Only show scanned attendees
      if (!a.status || a.status === "registered") return false;
      if (filterEventId && String(a.eventId) !== String(filterEventId))
        return false;
      if (filterStatus && a.status !== filterStatus) return false;
      if (filterCat && a.category !== filterCat) return false;
      if (
        q &&
        !`${a.name} ${a.phone} ${a.email} ${a.organization}`
          .toLowerCase()
          .includes(q)
      )
        return false;
      return true;
    });
  }, [attendees, filterEventId, filterStatus, filterCat, search]);

  const getEventName = (eventId) =>
    events.find((e) => String(e.id) === String(eventId))?.eventName || "—";

  const checkedInCount = filtered.filter((a) => a.status === "checked-in").length;
  const checkedOutCount = filtered.filter((a) => a.status === "checked-out").length;

  const activeFilterCount = [filterCat, filterStatus].filter(Boolean).length;

  const totalColSpan =
    2 +
    (!isEventLocked ? 1 : 0) +
    (showPhone ? 1 : 0) +
    (showEmail ? 1 : 0) +
    (showCat ? 1 : 0) +
    (showOrg ? 1 : 0) +
    2;

  return (
    <div className="container-fluid p-2 fade-in">
      {/* Header */}
      <div className="card border-0 shadow-sm mb-3">
        <div className="card-body p-3">
          {/* Breadcrumb */}
          <nav aria-label="breadcrumb" className="mb-2">
            <ol className="breadcrumb mb-0 app-breadcrumb">
              <li className="breadcrumb-item flex-shrink-0">
                <button
                  type="button"
                  className="btn btn-link p-0 text-decoration-none"
                  style={{ fontSize: "inherit", lineHeight: "inherit", whiteSpace: "nowrap" }}
                  onClick={() => navigate("/events")}
                >
                  Events
                </button>
              </li>
              {selectedEvent && (
                <li className="breadcrumb-item flex-shrink-0 text-truncate" style={{ minWidth: 0, maxWidth: "40vw" }}>
                  {selectedEvent.eventName}
                </li>
              )}
              <li className="breadcrumb-item active flex-shrink-0">Attendance</li>
            </ol>
          </nav>

          <div className="d-flex gap-2 align-items-center justify-content-between">
            {/* Left: filter + search + counts */}
            <div className="d-flex gap-2 align-items-center flex-grow-1 flex-wrap">

              {/* Filter button */}
              <div className="position-relative" ref={filterRef}>
                <button
                  type="button"
                  className={
                    "btn btn-sm " +
                    (activeFilterCount > 0
                      ? "btn-primary"
                      : "btn-outline-secondary")
                  }
                  onClick={() => setFilterOpen((o) => !o)}
                >
                  <i className="bi bi-funnel me-1" />
                  Filter
                  {activeFilterCount > 0 && (
                    <span
                      className="badge bg-white text-primary ms-1"
                      style={{ fontSize: 10 }}
                    >
                      {activeFilterCount}
                    </span>
                  )}
                </button>

                {filterOpen && (
                  <div
                    className="card border-0 shadow"
                    style={{
                      position: "absolute",
                      top: "calc(100% + 6px)",
                      left: 0,
                      zIndex: 999,
                      minWidth: 240,
                      padding: "0.85rem",
                    }}
                  >
                    {/* Event selector — only when not locked to a specific event */}
                    {!isEventLocked && (
                      <div className="mb-2">
                        <label className="form-label small fw-semibold mb-1">
                          Event
                        </label>
                        <select
                          className="form-select form-select-sm"
                          value={filterEventId}
                          onChange={(e) => {
                            setFilterEventId(e.target.value);
                            setFilterCat("");
                          }}
                        >
                          <option value="">All Events</option>
                          {events.map((ev) => (
                            <option key={ev.id} value={ev.id}>
                              {ev.eventName}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}

                    {showCat && (
                      <div className="mb-2">
                        <label className="form-label small fw-semibold mb-1">
                          Category
                        </label>
                        <select
                          className="form-select form-select-sm"
                          value={filterCat}
                          onChange={(e) => setFilterCat(e.target.value)}
                        >
                          <option value="">All Categories</option>
                          {eventCats.map((c) => (
                            <option key={c.label} value={c.label}>
                              {c.label}
                            </option>
                          ))}
                        </select>
                      </div>
                    )}

                    <div className="mb-3">
                      <label className="form-label small fw-semibold mb-1">
                        Scan Status
                      </label>
                      <select
                        className="form-select form-select-sm"
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                      >
                        <option value="">All Scanned</option>
                        <option value="checked-in">Checked In</option>
                        <option value="checked-out">Checked Out</option>
                      </select>
                    </div>

                    <button
                      type="button"
                      className="btn btn-sm btn-outline-secondary w-100"
                      onClick={() => {
                        setFilterCat("");
                        setFilterStatus("");
                        setFilterOpen(false);
                      }}
                    >
                      Clear Filters
                    </button>
                  </div>
                )}
              </div>

              {/* Search */}
              <div
                className="position-relative"
                style={{ maxWidth: 240, width: "100%" }}
              >
                <span
                  className="position-absolute"
                  style={{
                    left: "0.6rem",
                    top: "50%",
                    transform: "translateY(-50%)",
                    pointerEvents: "none",
                    color: "var(--muted-foreground)",
                  }}
                >
                  <FiSearch size={13} />
                </span>
                <input
                  type="text"
                  className="form-control form-control-sm"
                  placeholder="Search name, phone, email…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  style={{ paddingLeft: "1.8rem" }}
                />
              </div>

              <span className="text-muted small">
                {filtered.length} record{filtered.length !== 1 ? "s" : ""}
              </span>
            </div>

            {/* Right: clickable stat badges */}
            <div className="d-flex gap-2 flex-wrap">
              <button
                type="button"
                className="btn btn-sm py-2 px-3 fw-semibold border-0"
                style={{
                  background:
                    filterStatus === "checked-in" ? "#146c43" : "var(--success)",
                  color: "var(--card)",
                  outline:
                    filterStatus === "checked-in"
                      ? "2px solid #0f5132"
                      : "none",
                  borderRadius: 6,
                  fontSize: 13,
                }}
                onClick={() =>
                  setFilterStatus((s) =>
                    s === "checked-in" ? "" : "checked-in",
                  )
                }
                title="Click to filter by Checked In"
              >
                {checkedInCount} Checked In
              </button>
              <button
                type="button"
                className="btn btn-sm py-2 px-3 fw-semibold border-0"
                style={{
                  background:
                    filterStatus === "checked-out" ? "#cc8a00" : "#ffc107",
                  color: filterStatus === "checked-out" ? "var(--card)" : "#212529",
                  outline:
                    filterStatus === "checked-out"
                      ? "2px solid #9a6700"
                      : "none",
                  borderRadius: 6,
                  fontSize: 13,
                }}
                onClick={() =>
                  setFilterStatus((s) =>
                    s === "checked-out" ? "" : "checked-out",
                  )
                }
                title="Click to filter by Checked Out"
              >
                {checkedOutCount} Checked Out
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Desktop table */}
      <div className="card border-0 shadow-sm d-none d-md-block">
        <div className="card-body p-0">
          <div className="table-responsive">
            <table
              className="table table-hover align-middle mb-0"
              style={{ fontSize: 13 }}
            >
              <thead className="table-light">
                <tr>
                  <th style={{ width: 36 }}>#</th>
                  <th>Name</th>
                  {!isEventLocked && <th>Event</th>}
                  {showPhone && <th>Phone</th>}
                  {showEmail && <th>Email</th>}
                  {showCat && <th>Category</th>}
                  {showOrg && <th>Organization</th>}
                  <th>Check-in Time</th>
                  <th>Check-out Time</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td
                      colSpan={totalColSpan}
                      className="text-center py-5 text-muted"
                    >
                      {attendees.every(
                        (a) => !a.status || a.status === "registered",
                      )
                        ? "No scanned attendees yet. Records appear here after scanning."
                        : "No records match your filter."}
                    </td>
                  </tr>
                ) : (
                  filtered.map((a, i) => (
                    <tr key={a.id}>
                      <td className="text-muted">{i + 1}</td>
                      <td className="fw-semibold">{a.name || "—"}</td>
                      {!isEventLocked && (
                        <td className="text-muted small">
                          {getEventName(a.eventId)}
                        </td>
                      )}
                      {showPhone && <td>{a.phone || "—"}</td>}
                      {showEmail && (
                        <td
                          className="text-truncate"
                          style={{ maxWidth: 160 }}
                        >
                          {a.email || "—"}
                        </td>
                      )}
                      {showCat && (
                        <td>
                          {a.category ? (
                            <span
                              className="badge"
                              style={{
                                background: getCatColor(a.category),
                                color: "var(--card)",
                              }}
                            >
                              {a.category}
                            </span>
                          ) : (
                            "—"
                          )}
                        </td>
                      )}
                      {showOrg && <td>{a.organization || "—"}</td>}
                      <td className="text-muted small">
                        {a.checkInTime
                          ? new Date(a.checkInTime).toLocaleString()
                          : "—"}
                      </td>
                      <td className="text-muted small">
                        {a.checkOutTime
                          ? new Date(a.checkOutTime).toLocaleString()
                          : "—"}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Mobile cards */}
      <div className="d-md-none">
        {filtered.length === 0 ? (
          <div className="text-center py-5 text-muted">
            {attendees.every((a) => !a.status || a.status === "registered")
              ? "No scanned attendees yet. Records appear here after scanning."
              : "No records match."}
          </div>
        ) : (
          filtered.map((a) => (
            <div key={a.id} className="card border-0 shadow-sm mb-2">
              <div className="card-body p-3">
                <div className="d-flex justify-content-between align-items-start mb-2">
                  <div>
                    <div className="fw-bold">{a.name || "—"}</div>
                    {!isEventLocked && (
                      <div className="text-muted small">
                        {getEventName(a.eventId)}
                      </div>
                    )}
                    {showOrg && a.organization && (
                      <div className="text-muted small">{a.organization}</div>
                    )}
                  </div>
                  {showCat && a.category && (
                    <span
                      className="badge"
                      style={{
                        background: getCatColor(a.category),
                        color: "var(--card)",
                        fontSize: 10,
                      }}
                    >
                      {a.category}
                    </span>
                  )}
                </div>
                <div className="row g-1 small text-muted">
                  {showPhone && a.phone && (
                    <div className="col-12">📞 {a.phone}</div>
                  )}
                  {showEmail && a.email && (
                    <div className="col-12">✉ {a.email}</div>
                  )}
                  {a.checkInTime && (
                    <div className="col-12">
                      ✅ In: {new Date(a.checkInTime).toLocaleString()}
                    </div>
                  )}
                  {a.checkOutTime && (
                    <div className="col-12">
                      ⬆ Out: {new Date(a.checkOutTime).toLocaleString()}
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default AttendanceRecordsPage;
