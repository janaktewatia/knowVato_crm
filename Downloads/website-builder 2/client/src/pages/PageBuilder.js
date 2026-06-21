import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../api/client";
import VersionHistory from "../components/VersionHistory";
import { RenderBlock } from "../blocks/SharedBlocks";
import { BLOCK_DEFS, BLOCK_MAP } from "../blocks/blockDefs";
import ListBlockEditor from "../blocks/ListBlockEditor";
import { LIST_BLOCKS } from "../blocks/itemSchemas";
import { TEMPLATES } from "../templates/templates";

let uid = 0;
const newId = () => `b${Date.now()}_${uid++}`;

// Simple text fields that get a direct input; everything else uses a JSON editor.
const SIMPLE_FIELDS = {
  heading: ["text", "align"],
  paragraph: ["text", "align"],
  sectionHeading: ["eyebrow", "title", "subtitle"],
  hero: ["eyebrow", "title", "subtitle", "buttonText", "buttonLink", "bg"],
  cta: ["title", "subtitle", "buttonText", "buttonLink"],
  image: ["src", "alt"],
  button: ["text", "href", "variant"],
};

function BlockEditor({ block, onChange }) {
  const p = block.props || {};
  const set = (k, v) => onChange({ ...block, props: { ...p, [k]: v } });

  const simple = SIMPLE_FIELDS[block.type];
  if (simple) {
    return (
      <>
        {simple.map((k) => (
          <div className="mb-2" key={k}>
            <label className="form-label small mb-0 text-capitalize">{k}</label>
            {k === "align" || k === "variant"
              ? <select className="form-select form-select-sm" value={p[k] || ""} onChange={(e) => set(k, e.target.value)}>
                  {(k === "align" ? ["left", "center", "right"] : ["solid", "outline"]).map((o) => <option key={o}>{o}</option>)}
                </select>
              : <input className="form-control form-control-sm" value={p[k] || ""} onChange={(e) => set(k, e.target.value)} />}
          </div>
        ))}
      </>
    );
  }

  if (LIST_BLOCKS[block.type]) {
    return <ListBlockEditor block={block} onChange={onChange} />;
  }
  return <p className="text-muted small">No editable settings.</p>;
}

export default function PageBuilder() {
  const { websiteId, pageId } = useParams();
  const nav = useNavigate();
  const [page, setPage] = useState(null);
  const [blocks, setBlocks] = useState([]);
  const [selected, setSelected] = useState(null);
  const [saved, setSaved] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);

  const load = () => api.get(`/websites/${websiteId}/pages/single/${pageId}`).then((r) => {
    setPage(r.data);
    setBlocks((r.data.blocks || []).map((b) => ({ ...b, _key: newId() })));
  });
  useEffect(() => { load(); }, [websiteId, pageId]);

  const addBlock = (w) => { const k = newId(); setBlocks((b) => [...b, { _key: k, type: w.type, props: JSON.parse(JSON.stringify(w.defaults || {})) }]); setSelected(k); };
  const updateBlock = (key, updated) => setBlocks((b) => b.map((blk) => (blk._key === key ? updated : blk)));
  const move = (key, dir) => setBlocks((b) => { const i = b.findIndex((x) => x._key === key), j = i + dir; if (j < 0 || j >= b.length) return b; const c = [...b]; [c[i], c[j]] = [c[j], c[i]]; return c; });
  const removeBlock = (key) => { setBlocks((b) => b.filter((x) => x._key !== key)); if (selected === key) setSelected(null); };

  const applyTemplate = (tpl) => {
    if (blocks.length && !window.confirm("Replace current content with this template?")) return;
    setBlocks(tpl.blocks.map((b) => ({ ...JSON.parse(JSON.stringify(b)), _key: newId() })));
    setShowTemplates(false); setSelected(null);
  };

  const save = async (publish = false) => {
    await api.put(`/websites/${websiteId}/pages/${pageId}`, {
      blocks: blocks.map(({ _key, ...rest }) => rest),
      ...(publish ? { status: "published" } : {}),
    });
    setSaved(true); setTimeout(() => setSaved(false), 1500);
  };

  if (!page) return <div className="text-center p-5"><span className="spinner-border" /></div>;
  const selectedBlock = blocks.find((b) => b._key === selected);

  return (
    <div className="d-flex flex-column" style={{ height: "calc(100vh - 3rem)" }}>
      <div className="d-flex justify-content-between align-items-center border-bottom pb-2 mb-3 flex-wrap gap-2">
        <div>
          <button className="btn btn-link px-0" onClick={() => nav(`/websites/${websiteId}/pages`)}><i className="bi bi-arrow-left me-1" />Back</button>
          <span className="ms-3 fw-semibold"><i className="bi bi-pencil-square me-2" />{page.name}</span>
        </div>
        <div className="btn-group btn-group-sm">
          {saved && <span className="text-success me-2 align-self-center"><i className="bi bi-check-circle" /> Saved</span>}
          <button className="btn btn-outline-primary" onClick={() => setShowTemplates(true)}><i className="bi bi-grid-1x2 me-1" />Templates</button>
          <button className="btn btn-outline-secondary" onClick={() => setShowHistory(true)}><i className="bi bi-clock-history me-1" />History</button>
          <button className="btn btn-outline-secondary" onClick={() => save(false)}><i className="bi bi-save me-1" />Save</button>
          <button className="btn btn-success" onClick={() => save(true)}><i className="bi bi-cloud-arrow-up me-1" />Publish</button>
        </div>
      </div>

      <div className="row flex-grow-1 g-3" style={{ minHeight: 0 }}>
        <div className="col-2 d-flex flex-column" style={{ minHeight: 0 }}>
          <div className="card stat-card shadow-sm flex-grow-1 d-flex flex-column" style={{ minHeight: 0 }}>
            <div className="card-header bg-white small fw-semibold"><i className="bi bi-grid me-1" />Widgets</div>
            <div className="card-body d-grid gap-2 overflow-auto p-2 flex-grow-1">
              {BLOCK_DEFS.map((w) => (
                <button key={w.type} className="btn btn-light btn-sm text-start" onClick={() => addBlock(w)}>
                  <i className={`bi ${w.icon} me-2`} />{w.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="col-7 d-flex flex-column" style={{ minHeight: 0 }}>
          <div className="card stat-card shadow-sm flex-grow-1 d-flex flex-column" style={{ minHeight: 0 }}>
            <div className="card-body bg-white overflow-auto flex-grow-1" style={{ minHeight: 0 }}>
              {blocks.length === 0 && (
                <div className="text-center text-muted py-5">
                  <i className="bi bi-grid-1x2 fs-1 d-block mb-2" />
                  Add widgets, or <button className="btn btn-link p-0" onClick={() => setShowTemplates(true)}>start from a template</button>
                </div>
              )}
              {blocks.map((b) => (
                <div key={b._key}
                  className={`canvas-block position-relative my-2 ${selected === b._key ? "border border-primary" : ""}`}
                  onClick={() => setSelected(b._key)}>
                  <RenderBlock block={b} />
                  <div className="position-absolute top-0 end-0 btn-group btn-group-sm">
                    <button className="btn btn-sm btn-light" onClick={(e) => { e.stopPropagation(); move(b._key, -1); }}><i className="bi bi-arrow-up" /></button>
                    <button className="btn btn-sm btn-light" onClick={(e) => { e.stopPropagation(); move(b._key, 1); }}><i className="bi bi-arrow-down" /></button>
                    <button className="btn btn-sm btn-light text-danger" onClick={(e) => { e.stopPropagation(); removeBlock(b._key); }}><i className="bi bi-trash" /></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="col-3 d-flex flex-column" style={{ minHeight: 0 }}>
          <div className="card stat-card shadow-sm flex-grow-1 d-flex flex-column" style={{ minHeight: 0 }}>
            <div className="card-header bg-white small fw-semibold"><i className="bi bi-sliders me-1" />Properties</div>
            <div className="card-body overflow-auto flex-grow-1" style={{ minHeight: 0 }}>
              {selectedBlock
                ? <><div className="badge bg-light text-dark mb-2">{BLOCK_MAP[selectedBlock.type]?.label || selectedBlock.type}</div>
                    <BlockEditor block={selectedBlock} onChange={(u) => updateBlock(selectedBlock._key, u)} /></>
                : <p className="text-muted small">Select a block to edit its settings.</p>}
            </div>
          </div>
        </div>
      </div>

      {showHistory && <VersionHistory entityId={pageId} onClose={() => setShowHistory(false)} onRestore={load} />}

      {showTemplates && (
        <div className="modal d-block" style={{ background: "rgba(0,0,0,.5)" }} onClick={() => setShowTemplates(false)}>
          <div className="modal-dialog modal-xl modal-dialog-scrollable" onClick={(e) => e.stopPropagation()}>
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title"><i className="bi bi-grid-1x2 me-2" />Choose a Template</h5>
                <button className="btn-close" onClick={() => setShowTemplates(false)} />
              </div>
              <div className="modal-body">
                <div className="row g-3">
                  {TEMPLATES.map((t) => (
                    <div className="col-md-4" key={t.key}>
                      <div className="card stat-card h-100">
                        <div style={{ height: 8, background: t.accent }} />
                        <img src={t.thumbnail} alt={t.name} className="card-img-top" style={{ height: 150, objectFit: "cover" }} />
                        <div className="card-body">
                          <div className="d-flex justify-content-between"><h6 className="mb-1">{t.name}</h6><span className="badge bg-light text-dark">{t.category}</span></div>
                          <p className="small text-muted mb-2">{t.blocks.length} sections</p>
                          <button className="btn btn-sm btn-primary w-100" onClick={() => applyTemplate(t)}><i className="bi bi-check-lg me-1" />Use Template</button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
