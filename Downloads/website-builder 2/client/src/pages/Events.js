import { useState } from "react";
import api from "../api/client";
import useList from "../hooks/useList";
import PageHeader from "../components/PageHeader";
import Toolbar from "../components/Toolbar";
import Pagination from "../components/Pagination";
import EmptyState from "../components/EmptyState";
import Loader from "../components/Loader";

const STATUS = ["draft", "published", "archived"];
const CATEGORIES = ["general", "conference", "workshop", "seminar", "celebration", "sports", "cultural"];
const statusBadge = { draft: "secondary", published: "success", archived: "dark" };
const blank = { name: "", category: "general", venue: "", description: "", banner: "", startDate: "", endDate: "", status: "draft", registrationEnabled: false };

const toLocalInput = (d) => d ? new Date(d).toISOString().slice(0, 16) : "";
const fmt = (d) => d ? new Date(d).toLocaleString([], { dateStyle: "medium", timeStyle: "short" }) : "—";

export default function Events() {
  const list = useList("/events", { initialFilters: { status: "", category: "", when: "", sort: "startDate" }, limit: 12 });
  const [form, setForm] = useState(blank);
  const [editing, setEditing] = useState(null);
  const [selected, setSelected] = useState([]);

  const openNew = () => { setEditing(null); setForm(blank); };
  const openEdit = (ev) => {
    setEditing(ev._id);
    setForm({ ...blank, ...ev, startDate: toLocalInput(ev.startDate), endDate: toLocalInput(ev.endDate) });
  };

  const submit = async (e) => {
    e.preventDefault();
    const payload = { ...form, endDate: form.endDate || null };
    if (editing) await api.put(`/events/${editing}`, payload);
    else await api.post("/events", payload);
    list.refetch();
  };

  const remove = async (id) => { if (window.confirm("Delete this event?")) { await api.delete(`/events/${id}`); list.refetch(); } };
  const toggleSel = (id) => setSelected((s) => s.includes(id) ? s.filter((x) => x !== id) : [...s, id]);
  const bulk = async (action) => {
    if (action === "delete" && !window.confirm(`Delete ${selected.length} event(s)?`)) return;
    await api.post("/events/bulk", { ids: selected, action });
    setSelected([]); list.refetch();
  };

  const isPast = (ev) => new Date(ev.startDate) < new Date();

  return (
    <>
      <PageHeader icon="bi-calendar-event" title="Events" subtitle="Manage upcoming & past events">
        <button className="btn btn-primary" data-bs-toggle="modal" data-bs-target="#eventModal" onClick={openNew}>
          <i className="bi bi-plus-lg me-1" />New Event
        </button>
      </PageHeader>

      <Toolbar
        search={list.search} onSearch={list.onSearch}
        filters={[
          { label: "When", value: list.filters.when, onChange: (v) => list.setFilter("when", v), options: [{ value: "upcoming", label: "Upcoming" }, { value: "past", label: "Past" }] },
          { label: "Status", value: list.filters.status, onChange: (v) => list.setFilter("status", v), options: STATUS.map((s) => ({ value: s, label: s })) },
          { label: "Category", value: list.filters.category, onChange: (v) => list.setFilter("category", v), options: CATEGORIES.map((c) => ({ value: c, label: c })) },
        ]}
        right={
          <select className="form-select form-select-sm" value={list.filters.sort} onChange={(e) => list.setFilter("sort", e.target.value)}>
            <option value="startDate">Date ↑</option><option value="-startDate">Date ↓</option><option value="name">Name A-Z</option>
          </select>
        }
      />

      {selected.length > 0 && (
        <div className="alert alert-primary d-flex justify-content-between align-items-center py-2">
          <span><i className="bi bi-check2-square me-2" />{selected.length} selected</span>
          <div className="btn-group btn-group-sm">
            <button className="btn btn-outline-success" onClick={() => bulk("published")}>Publish</button>
            <button className="btn btn-outline-danger" onClick={() => bulk("delete")}>Delete</button>
            <button className="btn btn-outline-secondary" onClick={() => setSelected([])}>Clear</button>
          </div>
        </div>
      )}

      {list.loading ? <Loader /> : list.items.length === 0 ? (
        <EmptyState icon="bi-calendar-x" title="No events found" text="Create an event to get started." />
      ) : (
        <>
          <div className="row g-3">
            {list.items.map((ev) => (
              <div className="col-md-6 col-xl-4" key={ev._id}>
                <div className={`card stat-card shadow-sm h-100 ${selected.includes(ev._id) ? "border border-primary" : ""}`}>
                  {ev.banner && <img src={ev.banner} alt="" className="card-img-top" style={{ height: 140, objectFit: "cover" }} />}
                  <div className="card-body">
                    <div className="d-flex justify-content-between align-items-start">
                      <input type="checkbox" className="form-check-input" checked={selected.includes(ev._id)} onChange={() => toggleSel(ev._id)} />
                      <div>
                        <span className={`badge bg-${statusBadge[ev.status]} text-capitalize me-1`}>{ev.status}</span>
                        <span className={`badge ${isPast(ev) ? "bg-secondary" : "bg-info"}`}>{isPast(ev) ? "Past" : "Upcoming"}</span>
                      </div>
                    </div>
                    <h5 className="card-title mt-2 mb-1">{ev.name}</h5>
                    <p className="small text-muted mb-1"><i className="bi bi-geo-alt me-1" />{ev.venue || "—"}</p>
                    <p className="small mb-1"><i className="bi bi-clock me-1" />{fmt(ev.startDate)}</p>
                    {ev.registrationEnabled && <span className="badge bg-success-subtle text-success"><i className="bi bi-pencil-square me-1" />Registration open</span>}
                    <div className="btn-group btn-group-sm w-100 mt-3">
                      <button className="btn btn-outline-primary" data-bs-toggle="modal" data-bs-target="#eventModal" onClick={() => openEdit(ev)}><i className="bi bi-pencil me-1" />Edit</button>
                      <button className="btn btn-outline-danger" onClick={() => remove(ev._id)}><i className="bi bi-trash" /></button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <Pagination page={list.page} pages={list.pages} total={list.total} onPage={list.setPage} />
        </>
      )}

      {/* Create/Edit modal */}
      <div className="modal fade" id="eventModal" tabIndex="-1">
        <div className="modal-dialog modal-lg">
          <div className="modal-content">
            <form onSubmit={submit}>
              <div className="modal-header">
                <h5 className="modal-title"><i className={`bi ${editing ? "bi-pencil" : "bi-plus-circle"} me-2`} />{editing ? "Edit" : "New"} Event</h5>
                <button type="button" className="btn-close" data-bs-dismiss="modal" />
              </div>
              <div className="modal-body">
                <div className="row g-3">
                  <div className="col-md-8"><label className="form-label small">Event Name *</label>
                    <input className="form-control" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
                  <div className="col-md-4"><label className="form-label small">Category</label>
                    <select className="form-select text-capitalize" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })}>
                      {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                    </select></div>
                  <div className="col-md-6"><label className="form-label small">Start Date & Time *</label>
                    <input type="datetime-local" className="form-control" required value={form.startDate} onChange={(e) => setForm({ ...form, startDate: e.target.value })} /></div>
                  <div className="col-md-6"><label className="form-label small">End Date & Time</label>
                    <input type="datetime-local" className="form-control" value={form.endDate} onChange={(e) => setForm({ ...form, endDate: e.target.value })} /></div>
                  <div className="col-md-8"><label className="form-label small">Venue</label>
                    <input className="form-control" value={form.venue} onChange={(e) => setForm({ ...form, venue: e.target.value })} /></div>
                  <div className="col-md-4"><label className="form-label small">Status</label>
                    <select className="form-select text-capitalize" value={form.status} onChange={(e) => setForm({ ...form, status: e.target.value })}>
                      {STATUS.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select></div>
                  <div className="col-12"><label className="form-label small">Description</label>
                    <textarea className="form-control" rows="3" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} /></div>
                  <div className="col-12"><label className="form-label small">Banner Image URL</label>
                    <input className="form-control" placeholder="/uploads/... or https://..." value={form.banner} onChange={(e) => setForm({ ...form, banner: e.target.value })} /></div>
                  <div className="col-12">
                    <div className="form-check">
                      <input className="form-check-input" type="checkbox" checked={form.registrationEnabled} onChange={(e) => setForm({ ...form, registrationEnabled: e.target.checked })} id="regCheck" />
                      <label className="form-check-label small" htmlFor="regCheck">Enable event registration</label>
                    </div>
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-light" data-bs-dismiss="modal">Cancel</button>
                <button className="btn btn-primary" data-bs-dismiss="modal">{editing ? "Save Changes" : "Create"}</button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </>
  );
}
