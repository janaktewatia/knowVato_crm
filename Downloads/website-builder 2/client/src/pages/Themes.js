import { useState } from "react";
import api from "../api/client";
import useList from "../hooks/useList";
import PageHeader from "../components/PageHeader";
import Toolbar from "../components/Toolbar";
import EmptyState from "../components/EmptyState";
import Loader from "../components/Loader";

const COLOR_FIELDS = [
  { key: "primary", label: "Primary" }, { key: "secondary", label: "Secondary" },
  { key: "header", label: "Header" }, { key: "footer", label: "Footer" },
  { key: "button", label: "Button" }, { key: "text", label: "Text" },
  { key: "background", label: "Background" },
];
const FONTS = ["system-ui, sans-serif", "Georgia, serif", "'Courier New', monospace", "Arial, sans-serif", "'Times New Roman', serif"];
const blankColors = { primary: "#0d6efd", secondary: "#6c757d", header: "#212529", footer: "#212529", button: "#0d6efd", text: "#212529", background: "#ffffff" };

export default function Themes() {
  const list = useList("/themes", { initialFilters: { mode: "", sort: "-createdAt" }, limit: 12 });
  const [edit, setEdit] = useState(null); // theme object being edited (or null)

  const openNew = () => setEdit({
    name: "New Theme", colors: { ...blankColors },
    typography: { fontFamily: FONTS[0], baseFontSize: 16, headingFont: FONTS[0] },
    mode: "light", customCss: "", customJs: "",
  });
  const openEdit = (t) => setEdit(JSON.parse(JSON.stringify(t)));

  const save = async () => {
    if (edit._id) await api.put(`/themes/${edit._id}`, edit);
    else await api.post("/themes", edit);
    setEdit(null); list.refetch();
  };
  const activate = async (id) => { await api.post(`/themes/${id}/activate`); list.refetch(); };
  const remove = async (id) => { if (window.confirm("Delete this theme?")) { await api.delete(`/themes/${id}`); list.refetch(); } };

  // ---- Editor view ----
  if (edit) {
    const c = edit.colors;
    return (
      <>
        <button className="btn btn-link px-0 mb-2" onClick={() => setEdit(null)}><i className="bi bi-arrow-left me-1" />Back to themes</button>
        <PageHeader icon="bi-palette" title={edit._id ? "Edit Theme" : "New Theme"}>
          <button className="btn btn-primary" onClick={save}><i className="bi bi-save me-1" />Save Theme</button>
        </PageHeader>
        <div className="row g-3">
          <div className="col-lg-5">
            <div className="card stat-card shadow-sm mb-3">
              <div className="card-header bg-white small fw-semibold"><i className="bi bi-info-circle me-1" />General</div>
              <div className="card-body">
                <div className="mb-3"><label className="form-label small">Theme Name</label>
                  <input className="form-control" value={edit.name} onChange={(e) => setEdit({ ...edit, name: e.target.value })} /></div>
                <div className="mb-3"><label className="form-label small">Mode</label>
                  <select className="form-select" value={edit.mode} onChange={(e) => setEdit({ ...edit, mode: e.target.value })}>
                    <option value="light">Light</option><option value="dark">Dark</option>
                  </select></div>
              </div>
            </div>
            <div className="card stat-card shadow-sm mb-3">
              <div className="card-header bg-white small fw-semibold"><i className="bi bi-droplet me-1" />Colors</div>
              <div className="card-body row g-2">
                {COLOR_FIELDS.map((f) => (
                  <div className="col-6" key={f.key}>
                    <label className="form-label small mb-0">{f.label}</label>
                    <div className="input-group input-group-sm">
                      <input type="color" className="form-control form-control-color" value={c[f.key]} onChange={(e) => setEdit({ ...edit, colors: { ...c, [f.key]: e.target.value } })} />
                      <input className="form-control" value={c[f.key]} onChange={(e) => setEdit({ ...edit, colors: { ...c, [f.key]: e.target.value } })} />
                    </div>
                  </div>
                ))}
              </div>
            </div>
            <div className="card stat-card shadow-sm mb-3">
              <div className="card-header bg-white small fw-semibold"><i className="bi bi-fonts me-1" />Typography</div>
              <div className="card-body row g-2">
                <div className="col-12"><label className="form-label small mb-0">Body Font</label>
                  <select className="form-select form-select-sm" value={edit.typography.fontFamily} onChange={(e) => setEdit({ ...edit, typography: { ...edit.typography, fontFamily: e.target.value } })}>
                    {FONTS.map((f) => <option key={f} value={f}>{f}</option>)}
                  </select></div>
                <div className="col-12"><label className="form-label small mb-0">Heading Font</label>
                  <select className="form-select form-select-sm" value={edit.typography.headingFont} onChange={(e) => setEdit({ ...edit, typography: { ...edit.typography, headingFont: e.target.value } })}>
                    {FONTS.map((f) => <option key={f} value={f}>{f}</option>)}
                  </select></div>
                <div className="col-6"><label className="form-label small mb-0">Base Size (px)</label>
                  <input type="number" className="form-control form-control-sm" value={edit.typography.baseFontSize} onChange={(e) => setEdit({ ...edit, typography: { ...edit.typography, baseFontSize: +e.target.value } })} /></div>
              </div>
            </div>
            <div className="card stat-card shadow-sm">
              <div className="card-header bg-white small fw-semibold"><i className="bi bi-code-slash me-1" />Custom CSS / JS</div>
              <div className="card-body">
                <label className="form-label small">Custom CSS</label>
                <textarea className="form-control font-monospace small mb-2" rows="4" value={edit.customCss} onChange={(e) => setEdit({ ...edit, customCss: e.target.value })} />
                <label className="form-label small">Custom JS</label>
                <textarea className="form-control font-monospace small" rows="3" value={edit.customJs} onChange={(e) => setEdit({ ...edit, customJs: e.target.value })} />
              </div>
            </div>
          </div>

          {/* Live preview */}
          <div className="col-lg-7">
            <div className="card stat-card shadow-sm sticky-top" style={{ top: 16 }}>
              <div className="card-header bg-white small fw-semibold"><i className="bi bi-eye me-1" />Live Preview</div>
              <div className="card-body p-0">
                <div style={{ background: c.background, color: c.text, fontFamily: edit.typography.fontFamily, fontSize: edit.typography.baseFontSize }}>
                  <div style={{ background: c.header, color: "#fff", padding: "1rem" }} className="d-flex justify-content-between align-items-center">
                    <strong style={{ fontFamily: edit.typography.headingFont }}>Your Brand</strong>
                    <span className="small">Home · About · Contact</span>
                  </div>
                  <div className="p-4">
                    <h2 style={{ fontFamily: edit.typography.headingFont }}>Welcome heading</h2>
                    <p>This is body text rendered with your selected colors and fonts. The quick brown fox jumps over the lazy dog.</p>
                    <button className="btn" style={{ background: c.button, color: "#fff" }}>Primary Button</button>
                    <button className="btn ms-2" style={{ background: c.secondary, color: "#fff" }}>Secondary</button>
                  </div>
                  <div style={{ background: c.footer, color: "#fff", padding: "1rem" }} className="small text-center">© 2025 Your Brand · Footer</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </>
    );
  }

  // ---- List view ----
  return (
    <>
      <PageHeader icon="bi-palette" title="Themes" subtitle="Manage color schemes & typography">
        <button className="btn btn-primary" onClick={openNew}><i className="bi bi-plus-lg me-1" />New Theme</button>
      </PageHeader>
      <Toolbar search={list.search} onSearch={list.onSearch}
        filters={[{ label: "Mode", value: list.filters.mode, onChange: (v) => list.setFilter("mode", v), options: [{ value: "light", label: "Light" }, { value: "dark", label: "Dark" }] }]} />

      {list.loading ? <Loader /> : list.items.length === 0 ? (
        <EmptyState icon="bi-palette" title="No themes yet" text="Create your first theme." />
      ) : (
        <div className="row g-3">
          {list.items.map((t) => (
            <div className="col-md-6 col-xl-4" key={t._id}>
              <div className={`card stat-card shadow-sm h-100 ${t.isActive ? "border border-success" : ""}`}>
                <div className="d-flex" style={{ height: 8 }}>
                  {COLOR_FIELDS.slice(0, 5).map((f) => <div key={f.key} style={{ flex: 1, background: t.colors[f.key] }} />)}
                </div>
                <div className="card-body">
                  <div className="d-flex justify-content-between">
                    <h5 className="card-title mb-1">{t.name}</h5>
                    {t.isActive && <span className="badge bg-success"><i className="bi bi-check-circle me-1" />Active</span>}
                  </div>
                  <p className="small text-muted text-capitalize mb-3">{t.mode} mode</p>
                  <div className="btn-group btn-group-sm w-100">
                    <button className="btn btn-outline-primary" onClick={() => openEdit(t)}><i className="bi bi-pencil me-1" />Edit</button>
                    <button className="btn btn-outline-success" onClick={() => activate(t._id)} disabled={t.isActive}><i className="bi bi-check2-circle me-1" />Activate</button>
                    <button className="btn btn-outline-danger" onClick={() => remove(t._id)}><i className="bi bi-trash" /></button>
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
