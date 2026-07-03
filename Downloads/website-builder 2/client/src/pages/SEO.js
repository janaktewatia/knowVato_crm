import { useEffect, useState } from "react";
import api from "../api/client";
import PageHeader from "../components/PageHeader";
import EmptyState from "../components/EmptyState";
import Loader from "../components/Loader";

const blankSeo = { metaTitle: "", metaDescription: "", keywords: "", ogImage: "", twitterCard: "summary_large_image", robots: "index, follow", canonicalBase: "", schemaType: "Organization", googleAnalyticsId: "" };

export default function SEO() {
  const [websites, setWebsites] = useState([]);
  const [selectedId, setSelectedId] = useState("");
  const [seo, setSeo] = useState(blankSeo);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);
  const [tools, setTools] = useState(null);

  useEffect(() => {
    api.get("/websites", { params: { limit: 100 } }).then((r) => {
      setWebsites(r.data.items);
      if (r.data.items[0]) setSelectedId(r.data.items[0]._id);
      setLoading(false);
    });
  }, []);

  useEffect(() => {
    if (!selectedId) return;
    api.get(`/websites/${selectedId}`).then((r) => setSeo({ ...blankSeo, ...(r.data.seo || {}) }));
    setTools(null);
  }, [selectedId]);

  const save = async () => {
    await api.put(`/websites/${selectedId}`, { seo });
    setSaved(true); setTimeout(() => setSaved(false), 1500);
  };

  const genTools = async () => {
    const r = await api.get(`/websites/${selectedId}/sitemap`);
    setTools(r.data);
  };

  if (loading) return <Loader />;
  if (websites.length === 0) return (
    <>
      <PageHeader icon="bi-search" title="SEO Management" />
      <EmptyState icon="bi-globe2" title="No websites yet" text="Create a website first to manage its SEO." />
    </>
  );

  const score = [seo.metaTitle, seo.metaDescription, seo.keywords, seo.ogImage].filter(Boolean).length * 25;

  return (
    <>
      <PageHeader icon="bi-search" title="SEO Management" subtitle="Meta tags, social cards, sitemap & more">
        <select className="form-select" style={{ maxWidth: 240 }} value={selectedId} onChange={(e) => setSelectedId(e.target.value)}>
          {websites.map((w) => <option key={w._id} value={w._id}>{w.name}</option>)}
        </select>
        <button className="btn btn-primary" onClick={save}><i className="bi bi-save me-1" />Save</button>
      </PageHeader>

      {saved && <div className="alert alert-success py-2"><i className="bi bi-check-circle me-1" />SEO settings saved</div>}

      <div className="row g-3">
        <div className="col-lg-8">
          <div className="card stat-card shadow-sm mb-3">
            <div className="card-header bg-white small fw-semibold"><i className="bi bi-tags me-1" />Basic Meta</div>
            <div className="card-body">
              <div className="mb-3"><label className="form-label small">Meta Title <span className="text-muted">({seo.metaTitle.length}/60)</span></label>
                <input className="form-control" maxLength="70" value={seo.metaTitle} onChange={(e) => setSeo({ ...seo, metaTitle: e.target.value })} /></div>
              <div className="mb-3"><label className="form-label small">Meta Description <span className="text-muted">({seo.metaDescription.length}/160)</span></label>
                <textarea className="form-control" rows="2" maxLength="180" value={seo.metaDescription} onChange={(e) => setSeo({ ...seo, metaDescription: e.target.value })} /></div>
              <div className="mb-0"><label className="form-label small">Keywords (comma separated)</label>
                <input className="form-control" value={seo.keywords} onChange={(e) => setSeo({ ...seo, keywords: e.target.value })} /></div>
            </div>
          </div>

          <div className="card stat-card shadow-sm mb-3">
            <div className="card-header bg-white small fw-semibold"><i className="bi bi-share me-1" />Social & Advanced</div>
            <div className="card-body row g-3">
              <div className="col-md-8"><label className="form-label small">Open Graph / Social Image URL</label>
                <input className="form-control" value={seo.ogImage} onChange={(e) => setSeo({ ...seo, ogImage: e.target.value })} /></div>
              <div className="col-md-4"><label className="form-label small">Twitter Card</label>
                <select className="form-select" value={seo.twitterCard} onChange={(e) => setSeo({ ...seo, twitterCard: e.target.value })}>
                  <option value="summary">summary</option><option value="summary_large_image">summary_large_image</option>
                </select></div>
              <div className="col-md-6"><label className="form-label small">Robots</label>
                <select className="form-select" value={seo.robots} onChange={(e) => setSeo({ ...seo, robots: e.target.value })}>
                  <option>index, follow</option><option>noindex, follow</option><option>index, nofollow</option><option>noindex, nofollow</option>
                </select></div>
              <div className="col-md-6"><label className="form-label small">Schema Type</label>
                <select className="form-select" value={seo.schemaType} onChange={(e) => setSeo({ ...seo, schemaType: e.target.value })}>
                  {["Organization", "LocalBusiness", "EducationalOrganization", "Restaurant", "WebSite"].map((t) => <option key={t}>{t}</option>)}
                </select></div>
              <div className="col-md-8"><label className="form-label small">Canonical Base URL</label>
                <input className="form-control" placeholder="https://example.com" value={seo.canonicalBase} onChange={(e) => setSeo({ ...seo, canonicalBase: e.target.value })} /></div>
              <div className="col-md-4"><label className="form-label small">Google Analytics ID</label>
                <input className="form-control" placeholder="G-XXXX" value={seo.googleAnalyticsId} onChange={(e) => setSeo({ ...seo, googleAnalyticsId: e.target.value })} /></div>
            </div>
          </div>

          <div className="card stat-card shadow-sm">
            <div className="card-header bg-white small fw-semibold d-flex justify-content-between">
              <span><i className="bi bi-diagram-3 me-1" />Sitemap & Robots</span>
              <button className="btn btn-sm btn-outline-primary" onClick={genTools}><i className="bi bi-gear me-1" />Generate</button>
            </div>
            <div className="card-body">
              {!tools ? <p className="small text-muted m-0">Click Generate to build sitemap.xml and robots.txt from published pages.</p> : (
                <>
                  <label className="form-label small">sitemap.xml</label>
                  <textarea className="form-control font-monospace small mb-3" rows="6" readOnly value={tools.sitemap} />
                  <label className="form-label small">robots.txt</label>
                  <textarea className="form-control font-monospace small" rows="3" readOnly value={tools.robots} />
                </>
              )}
            </div>
          </div>
        </div>

        {/* Right: SEO score + search/social preview */}
        <div className="col-lg-4">
          <div className="card stat-card shadow-sm mb-3">
            <div className="card-body text-center">
              <div className="display-5 fw-bold" style={{ color: score >= 75 ? "#198754" : score >= 50 ? "#fd7e14" : "#dc3545" }}>{score}%</div>
              <div className="small text-muted">SEO completeness</div>
              <div className="progress mt-2" style={{ height: 6 }}>
                <div className="progress-bar" style={{ width: `${score}%`, background: score >= 75 ? "#198754" : score >= 50 ? "#fd7e14" : "#dc3545" }} />
              </div>
            </div>
          </div>
          <div className="card stat-card shadow-sm">
            <div className="card-header bg-white small fw-semibold"><i className="bi bi-google me-1" />Search Preview</div>
            <div className="card-body">
              <div className="text-primary text-truncate" style={{ fontSize: "1.05rem" }}>{seo.metaTitle || "Your page title"}</div>
              <div className="text-success small">{seo.canonicalBase || "https://example.com"}</div>
              <div className="small text-muted">{seo.metaDescription || "Your meta description will appear here in search results."}</div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
