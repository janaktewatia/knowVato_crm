import { useEffect, useState, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/client";
import PageHeader from "../components/PageHeader";
import Pagination from "../components/Pagination";
import EmptyState from "../components/EmptyState";
import Loader from "../components/Loader";

const cell = (v) => Array.isArray(v) ? v.join(", ") : v == null ? "—" : String(v);

export default function FormResponses() {
  const { id } = useParams();
  const nav = useNavigate();
  const [form, setForm] = useState(null);
  const [data, setData] = useState({ items: [], total: 0, page: 1, pages: 1 });
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [detail, setDetail] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [f, r] = await Promise.all([
        api.get(`/forms/${id}`),
        api.get(`/forms/${id}/responses`, { params: { page, limit: 20 } }),
      ]);
      setForm(f.data); setData(r.data);
    } finally { setLoading(false); }
  }, [id, page]);

  useEffect(() => { load(); }, [load]);

  const remove = async (rid) => {
    if (!window.confirm("Delete this response?")) return;
    await api.delete(`/forms/${id}/responses/${rid}`);
    load();
  };

  const exportCsv = async () => {
    const res = await api.get(`/forms/${id}/responses/export`, { responseType: "blob" });
    const url = URL.createObjectURL(new Blob([res.data]));
    const a = document.createElement("a");
    a.href = url; a.download = `${form.title}_responses.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  if (loading && !form) return <Loader />;
  const cols = form?.fields?.slice(0, 4) || []; // show first 4 in table

  return (
    <>
      <button className="btn btn-link px-0 mb-2" onClick={() => nav("/forms")}><i className="bi bi-arrow-left me-1" />Back to forms</button>
      <PageHeader icon="bi-inbox" title={`Responses — ${form?.title || ""}`} subtitle={`${data.total} total submissions`}>
        <button className="btn btn-outline-secondary" onClick={() => nav(`/forms/${id}/build`)}><i className="bi bi-pencil-square me-1" />Edit Form</button>
        <button className="btn btn-success" onClick={exportCsv} disabled={data.total === 0}><i className="bi bi-file-earmark-excel me-1" />Export CSV</button>
      </PageHeader>

      {loading ? <Loader /> : data.items.length === 0 ? (
        <EmptyState icon="bi-inbox" title="No responses yet" text="Responses will appear here once people submit the form." />
      ) : (
        <div className="card stat-card shadow-sm">
          <div className="table-responsive">
            <table className="table table-hover align-middle m-0">
              <thead className="table-light">
                <tr>
                  <th>Submitted</th>
                  {cols.map((c) => <th key={c.name}>{c.label}</th>)}
                  <th className="text-end">Actions</th>
                </tr>
              </thead>
              <tbody>
                {data.items.map((r) => (
                  <tr key={r._id}>
                    <td className="small text-muted">{new Date(r.createdAt).toLocaleString()}</td>
                    {cols.map((c) => <td key={c.name} className="small text-truncate" style={{ maxWidth: 200 }}>{cell(r.data[c.name])}</td>)}
                    <td className="text-end">
                      <div className="btn-group btn-group-sm">
                        <button className="btn btn-outline-primary" onClick={() => setDetail(r)} title="View"><i className="bi bi-eye" /></button>
                        <button className="btn btn-outline-danger" onClick={() => remove(r._id)} title="Delete"><i className="bi bi-trash" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="card-body py-2"><Pagination page={data.page} pages={data.pages} total={data.total} onPage={setPage} /></div>
        </div>
      )}

      {/* Detail modal */}
      {detail && (
        <div className="modal d-block" style={{ background: "rgba(0,0,0,.5)" }} onClick={() => setDetail(null)}>
          <div className="modal-dialog modal-dialog-centered" onClick={(e) => e.stopPropagation()}>
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title"><i className="bi bi-card-list me-2" />Response Detail</h5>
                <button className="btn-close" onClick={() => setDetail(null)} />
              </div>
              <div className="modal-body">
                <p className="small text-muted">{new Date(detail.createdAt).toLocaleString()}</p>
                <table className="table table-sm">
                  <tbody>
                    {(form?.fields || []).map((f) => (
                      <tr key={f.name}>
                        <th style={{ width: "40%" }} className="small">{f.label}</th>
                        <td className="small">{cell(detail.data[f.name])}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="modal-footer">
                <button className="btn btn-light" onClick={() => setDetail(null)}>Close</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
