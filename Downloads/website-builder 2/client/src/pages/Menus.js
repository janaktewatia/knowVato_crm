import { useEffect, useState } from "react";
import api from "../api/client";
import PageHeader from "../components/PageHeader";
import EmptyState from "../components/EmptyState";
import Loader from "../components/Loader";

const LOCATIONS = ["header", "footer", "sidebar"];
let uid = 0;
const newItem = (label = "New Item") => ({ _id: `n${Date.now()}_${uid++}`, label, url: "#", icon: "", target: "_self", visible: true, children: [] });

// Recursive editable item row
function ItemRow({ item, depth, onChange, onDelete, onAddChild, onMove }) {
  return (
    <div className="mb-1" style={{ marginLeft: depth * 20 }}>
      <div className="border rounded p-2 bg-white">
        <div className="row g-2 align-items-center">
          <div className="col-auto"><i className="bi bi-grip-vertical text-muted" /></div>
          <div className="col"><input className="form-control form-control-sm" placeholder="Label" value={item.label} onChange={(e) => onChange({ ...item, label: e.target.value })} /></div>
          <div className="col"><input className="form-control form-control-sm" placeholder="URL" value={item.url} onChange={(e) => onChange({ ...item, url: e.target.value })} /></div>
          <div className="col-auto"><input className="form-control form-control-sm" style={{ width: 90 }} placeholder="bi-house" value={item.icon} onChange={(e) => onChange({ ...item, icon: e.target.value })} /></div>
          <div className="col-auto">
            <div className="btn-group btn-group-sm">
              <button className="btn btn-outline-secondary" title="Move up" onClick={() => onMove(-1)}><i className="bi bi-arrow-up" /></button>
              <button className="btn btn-outline-secondary" title="Move down" onClick={() => onMove(1)}><i className="bi bi-arrow-down" /></button>
              <button className="btn btn-outline-primary" title="Add submenu" onClick={onAddChild}><i className="bi bi-diagram-2" /></button>
              <button className="btn btn-outline-secondary" title="Visibility" onClick={() => onChange({ ...item, visible: !item.visible })}><i className={`bi ${item.visible ? "bi-eye" : "bi-eye-slash"}`} /></button>
              <button className="btn btn-outline-danger" title="Delete" onClick={onDelete}><i className="bi bi-trash" /></button>
            </div>
          </div>
        </div>
      </div>
      {item.children?.map((child, i) => (
        <ItemRow key={child._id} item={child} depth={depth + 1}
          onChange={(u) => onChange({ ...item, children: item.children.map((c, j) => j === i ? u : c) })}
          onDelete={() => onChange({ ...item, children: item.children.filter((_, j) => j !== i) })}
          onAddChild={() => onChange({ ...item, children: item.children.map((c, j) => j === i ? { ...c, children: [...c.children, newItem()] } : c) })}
          onMove={(dir) => {
            const arr = [...item.children]; const j = i + dir;
            if (j < 0 || j >= arr.length) return;
            [arr[i], arr[j]] = [arr[j], arr[i]];
            onChange({ ...item, children: arr });
          }}
        />
      ))}
    </div>
  );
}

export default function Menus() {
  const [menus, setMenus] = useState([]);
  const [loading, setLoading] = useState(true);
  const [edit, setEdit] = useState(null);

  const load = () => { setLoading(true); api.get("/menus").then((r) => { setMenus(r.data.items); setLoading(false); }); };
  useEffect(() => { load(); }, []);

  const openNew = () => setEdit({ name: "New Menu", location: "header", status: "active", items: [] });
  const openEdit = (m) => setEdit(JSON.parse(JSON.stringify(m)));
  const save = async () => {
    if (edit._id) await api.put(`/menus/${edit._id}`, edit);
    else await api.post("/menus", edit);
    setEdit(null); load();
  };
  const remove = async (id) => { if (window.confirm("Delete this menu?")) { await api.delete(`/menus/${id}`); load(); } };

  if (edit) {
    return (
      <>
        <button className="btn btn-link px-0 mb-2" onClick={() => setEdit(null)}><i className="bi bi-arrow-left me-1" />Back to menus</button>
        <PageHeader icon="bi-list-nested" title={edit._id ? "Edit Menu" : "New Menu"}>
          <button className="btn btn-primary" onClick={save}><i className="bi bi-save me-1" />Save Menu</button>
        </PageHeader>
        <div className="card stat-card shadow-sm mb-3">
          <div className="card-body row g-3">
            <div className="col-md-6"><label className="form-label small">Menu Name</label>
              <input className="form-control" value={edit.name} onChange={(e) => setEdit({ ...edit, name: e.target.value })} /></div>
            <div className="col-md-3"><label className="form-label small">Location</label>
              <select className="form-select text-capitalize" value={edit.location} onChange={(e) => setEdit({ ...edit, location: e.target.value })}>
                {LOCATIONS.map((l) => <option key={l} value={l}>{l}</option>)}
              </select></div>
            <div className="col-md-3"><label className="form-label small">Status</label>
              <select className="form-select" value={edit.status} onChange={(e) => setEdit({ ...edit, status: e.target.value })}>
                <option value="active">Active</option><option value="inactive">Inactive</option>
              </select></div>
          </div>
        </div>
        <div className="card stat-card shadow-sm">
          <div className="card-header bg-white small fw-semibold d-flex justify-content-between">
            <span><i className="bi bi-list-ol me-1" />Menu Items</span>
            <button className="btn btn-sm btn-outline-primary" onClick={() => setEdit({ ...edit, items: [...edit.items, newItem()] })}><i className="bi bi-plus-lg me-1" />Add Item</button>
          </div>
          <div className="card-body bg-light">
            {edit.items.length === 0 && <p className="text-muted small text-center m-0">No items. Click "Add Item". Use the submenu button to nest items (mega/multi-level).</p>}
            {edit.items.map((item, i) => (
              <ItemRow key={item._id} item={item} depth={0}
                onChange={(u) => setEdit({ ...edit, items: edit.items.map((it, j) => j === i ? u : it) })}
                onDelete={() => setEdit({ ...edit, items: edit.items.filter((_, j) => j !== i) })}
                onAddChild={() => setEdit({ ...edit, items: edit.items.map((it, j) => j === i ? { ...it, children: [...it.children, newItem()] } : it) })}
                onMove={(dir) => { const arr = [...edit.items]; const j = i + dir; if (j < 0 || j >= arr.length) return; [arr[i], arr[j]] = [arr[j], arr[i]]; setEdit({ ...edit, items: arr }); }}
              />
            ))}
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <PageHeader icon="bi-list-nested" title="Menus" subtitle="Header, footer & sidebar navigation">
        <button className="btn btn-primary" onClick={openNew}><i className="bi bi-plus-lg me-1" />New Menu</button>
      </PageHeader>
      {loading ? <Loader /> : menus.length === 0 ? (
        <EmptyState icon="bi-list-nested" title="No menus yet" text="Create your first navigation menu." />
      ) : (
        <div className="row g-3">
          {menus.map((m) => (
            <div className="col-md-6 col-xl-4" key={m._id}>
              <div className="card stat-card shadow-sm h-100">
                <div className="card-body">
                  <div className="d-flex justify-content-between">
                    <h5 className="card-title mb-1">{m.name}</h5>
                    <span className={`badge ${m.status === "active" ? "bg-success" : "bg-secondary"}`}>{m.status}</span>
                  </div>
                  <p className="small text-muted text-capitalize mb-2"><i className="bi bi-geo me-1" />{m.location} · {m.items?.length || 0} items</p>
                  <div className="btn-group btn-group-sm w-100">
                    <button className="btn btn-outline-primary" onClick={() => openEdit(m)}><i className="bi bi-pencil me-1" />Edit</button>
                    <button className="btn btn-outline-danger" onClick={() => remove(m._id)}><i className="bi bi-trash" /></button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
