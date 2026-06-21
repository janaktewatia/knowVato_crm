import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../api/client";
import useList from "../hooks/useList";
import PageHeader from "../components/PageHeader";
import Toolbar from "../components/Toolbar";
import Pagination from "../components/Pagination";
import EmptyState from "../components/EmptyState";
import Loader from "../components/Loader";

const STATUS = ["active", "inactive", "draft"];
const statusBadge = { active: "success", inactive: "secondary", draft: "warning" };
const SAMPLES = [
  { key: "contact", label: "Contact Form", icon: "bi-envelope" },
  { key: "admission", label: "Admission Form", icon: "bi-mortarboard" },
  { key: "enquiry", label: "Enquiry Form", icon: "bi-question-circle" },
  { key: "", label: "Blank Form", icon: "bi-file-earmark-plus" },
];

export default function Forms() {
  const nav = useNavigate();
  const list = useList("/forms", { initialFilters: { status: "", sort: "-createdAt" }, limit: 12 });
  const [selected, setSelected] = useState([]);
  const [newTitle, setNewTitle] = useState("");

  const create = async (sample) => {
    const res = await api.post("/forms", { sample, title: newTitle || undefined });
    setNewTitle("");
    nav(`/forms/${res.data._id}/build`);
  };

  const duplicate = async (id) => { await api.post(`/forms/${id}/duplicate`); list.refetch(); };
  const remove = async (id) => { if (window.confirm("Delete this form and all its responses?")) { await api.delete(`/forms/${id}`); list.refetch(); } };
  const setStatus = async (id, status) => { await api.put(`/forms/${id}`, { status }); list.refetch(); };

  const toggleSel = (id) => setSelected((s) => s.includes(id) ? s.filter((x) => x !== id) : [...s, id]);
  const allSel = list.items.length > 0 && selected.length === list.items.length;
  const toggleAll = () => setSelected(allSel ? [] : list.items.map((f) => f._id));
  const bulk = async (action) => {
    if (action === "delete" && !window.confirm(`Delete ${selected.length} form(s)?`)) return;
    await api.post("/forms/bulk", { ids: selected, action });
    setSelected([]); list.refetch();
  };

  return (
    <>
      <PageHeader icon="bi-ui-checks" title="Forms" subtitle="Build forms and collect responses">
        <button className="btn btn-primary" data-bs-toggle="modal" data-bs-target="#newFormModal">
          <i className="bi bi-plus-lg me-1" />New Form
        </button>
      </PageHeader>

      <Toolbar
        search={list.search} onSearch={list.onSearch}
        filters={[{ label: "Status", value: list.filters.status, onChange: (v) => list.setFilter("status", v), options: STATUS.map((s) => ({ value: s, label: s })) }]}
        right={
          <select className="form-select form-select-sm" value={list.filters.sort} onChange={(e) => list.setFilter("sort", e.target.value)}>
            <option value="-createdAt">Newest</option>
            <option value="-responseCount">Most responses</option>
            <option value="title">Title A-Z</option>
          </select>
        }
      />

      {selected.length > 0 && (
        <div className="alert alert-primary d-flex justify-content-between align-items-center py-2">
          <span><i className="bi bi-check2-square me-2" />{selected.length} selected</span>
          <div className="btn-group btn-group-sm">
            <button className="btn btn-outline-success" onClick={() => bulk("active")}><i className="bi bi-check-circle me-1" />Activate</button>
            <button className="btn btn-outline-secondary" onClick={() => bulk("inactive")}>Deactivate</button>
            <button className="btn btn-outline-danger" onClick={() => bulk("delete")}><i className="bi bi-trash me-1" />Delete</button>
            <button className="btn btn-outline-secondary" onClick={() => setSelected([])}>Clear</button>
          </div>
        </div>
      )}

      {list.loading ? <Loader /> : list.items.length === 0 ? (
        <EmptyState icon="bi-ui-checks" title="No forms yet" text="Create your first form from a template or blank."
          action={<button className="btn btn-primary btn-sm" data-bs-toggle="modal" data-bs-target="#newFormModal"><i className="bi bi-plus-lg me-1" />New Form</button>} />
      ) : (
        <>
          <div className="mb-2"><label className="small text-muted"><input type="checkbox" className="form-check-input me-2" checked={allSel} onChange={toggleAll} />Select all</label></div>
          <div className="row g-3">
            {list.items.map((f) => (
              <div className="col-md-6 col-xl-4" key={f._id}>
                <div className={`card stat-card shadow-sm h-100 ${selected.includes(f._id) ? "border border-primary" : ""}`}>
                  <div className="card-body">
                    <div className="d-flex justify-content-between align-items-start">
                      <input type="checkbox" className="form-check-input" checked={selected.includes(f._id)} onChange={() => toggleSel(f._id)} />
                      <span className={`badge bg-${statusBadge[f.status]} text-capitalize`}>{f.status}</span>
                    </div>
                    <h5 className="card-title mt-2 mb-1">{f.title}</h5>
                    <p className="small text-muted mb-2">{f.fields?.length || 0} fields · {f.responseCount || 0} responses</p>
                    <div className="btn-group btn-group-sm w-100">
                      <button className="btn btn-outline-primary" onClick={() => nav(`/forms/${f._id}/build`)} title="Edit"><i className="bi bi-pencil-square" /></button>
                      <button className="btn btn-outline-info" onClick={() => nav(`/forms/${f._id}/responses`)} title="Responses"><i className="bi bi-inbox" /></button>
                      <button className="btn btn-outline-success" onClick={() => setStatus(f._id, f.status === "active" ? "inactive" : "active")} title="Toggle active">
                        <i className={`bi ${f.status === "active" ? "bi-toggle-on" : "bi-toggle-off"}`} />
                      </button>
                      <button className="btn btn-outline-secondary" onClick={() => duplicate(f._id)} title="Duplicate"><i className="bi bi-copy" /></button>
                      <button className="btn btn-outline-danger" onClick={() => remove(f._id)} title="Delete"><i className="bi bi-trash" /></button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          <Pagination page={list.page} pages={list.pages} total={list.total} onPage={list.setPage} />
        </>
      )}

      {/* New form modal */}
      <div className="modal fade" id="newFormModal" tabIndex="-1">
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title"><i className="bi bi-plus-circle me-2" />New Form</h5>
              <button type="button" className="btn-close" data-bs-dismiss="modal" />
            </div>
            <div className="modal-body">
              <div className="mb-3">
                <label className="form-label small">Form title (optional)</label>
                <input className="form-control" placeholder="e.g. Newsletter Signup" value={newTitle} onChange={(e) => setNewTitle(e.target.value)} />
              </div>
              <label className="form-label small">Start from:</label>
              <div className="row g-2">
                {SAMPLES.map((s) => (
                  <div className="col-6" key={s.key}>
                    <button className="btn btn-light w-100 text-start" data-bs-dismiss="modal" onClick={() => create(s.key)}>
                      <i className={`bi ${s.icon} me-2`} />{s.label}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
