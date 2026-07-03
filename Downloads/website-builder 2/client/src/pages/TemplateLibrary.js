import { useState } from "react";
import PageHeader from "../components/PageHeader";
import { TEMPLATES } from "../templates/templates";
import { RenderBlock } from "../blocks/SharedBlocks";

export default function TemplateLibrary() {
  const [preview, setPreview] = useState(null);
  const cats = ["All", ...Array.from(new Set(TEMPLATES.map((t) => t.category)))];
  const [cat, setCat] = useState("All");
  const list = cat === "All" ? TEMPLATES : TEMPLATES.filter((t) => t.category === cat);

  return (
    <>
      <PageHeader icon="bi-grid-1x2" title="Template Library" subtitle="Ready-made designs — open any page in the builder and click Templates to apply" />

      <div className="mb-3 d-flex flex-wrap gap-2">
        {cats.map((c) => (
          <button key={c} className={`btn btn-sm ${cat === c ? "btn-primary" : "btn-outline-secondary"}`} onClick={() => setCat(c)}>{c}</button>
        ))}
      </div>

      <div className="row g-3">
        {list.map((t) => (
          <div className="col-md-6 col-xl-4" key={t.key}>
            <div className="card stat-card h-100">
              <div style={{ height: 8, background: t.accent }} />
              <img src={t.thumbnail} alt={t.name} className="card-img-top" style={{ height: 170, objectFit: "cover" }} />
              <div className="card-body">
                <div className="d-flex justify-content-between"><h5 className="mb-1">{t.name}</h5><span className="badge bg-light text-dark">{t.category}</span></div>
                <p className="small text-muted mb-3">{t.blocks.length} sections · professionally designed</p>
                <button className="btn btn-sm btn-outline-primary w-100" onClick={() => setPreview(t)}><i className="bi bi-eye me-1" />Preview</button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {preview && (
        <div className="modal d-block" style={{ background: "rgba(0,0,0,.6)" }} onClick={() => setPreview(null)}>
          <div className="modal-dialog modal-xl modal-dialog-scrollable" onClick={(e) => e.stopPropagation()}>
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">{preview.name} <span className="badge bg-light text-dark ms-2">{preview.category}</span></h5>
                <button className="btn-close" onClick={() => setPreview(null)} />
              </div>
              <div className="modal-body bg-white">
                <div className="alert alert-info py-2 small"><i className="bi bi-info-circle me-1" />To use this: open a page in the builder → click <strong>Templates</strong> → choose this design.</div>
                {preview.blocks.map((b, i) => (
                  <div className="my-2" key={i}><RenderBlock block={b} theme={{ primary: preview.accent }} /></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
