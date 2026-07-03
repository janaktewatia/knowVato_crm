import { useEffect, useState, useCallback } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import api from "../api/client";
import BlockRenderer from "./BlockRenderer";
import ChatWidget from "./ChatWidget";

function buildMenuItems(menus, location) {
  const menu = menus.find((m) => m.location === location);
  return menu?.items?.filter((i) => i.visible) || [];
}

export default function PublicSite() {
  const { slug, pageSlug } = useParams();
  const nav = useNavigate();
  const [site, setSite] = useState(null);
  const [page, setPage] = useState(null);
  const [banners, setBanners] = useState([]);
  const [news, setNews] = useState([]);
  const [events, setEvents] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true); setError("");
    try {
      const siteRes = await api.get(`/public/site/${slug}`);
      setSite(siteRes.data);
      const pageRes = pageSlug
        ? await api.get(`/public/site/${slug}/page/${pageSlug}`)
        : await api.get(`/public/site/${slug}/home`);
      setPage(pageRes.data);

      // fire-and-forget extras + analytics
      api.get(`/public/site/${slug}/banners`).then((r) => setBanners(r.data)).catch(() => {});
      api.get(`/public/site/${slug}/news`).then((r) => setNews(r.data)).catch(() => {});
      api.get(`/public/site/${slug}/events`).then((r) => setEvents(r.data)).catch(() => {});
      api.post(`/public/site/${slug}/track`, { path: pageSlug ? `/${pageSlug}` : "/" }).catch(() => {});
    } catch (e) {
      setError(e.response?.data?.message || "Could not load site");
    } finally {
      setLoading(false);
    }
  }, [slug, pageSlug]);

  useEffect(() => { load(); }, [load]);

  if (loading) return <div className="vh-100 d-flex align-items-center justify-content-center"><span className="spinner-border" /></div>;
  if (error) return (
    <div className="vh-100 d-flex flex-column align-items-center justify-content-center text-center">
      <i className="bi bi-exclamation-triangle text-warning" style={{ fontSize: "3rem" }} />
      <h4 className="mt-3">{error}</h4>
      <p className="text-muted">Make sure the website is published.</p>
    </div>
  );

  const theme = site.theme;
  const colors = theme?.colors || {};
  const typo = theme?.typography || {};
  const headerMenu = buildMenuItems(site.menus, "header");
  const footerMenu = buildMenuItems(site.menus, "footer");
  // fallback nav from published pages if no header menu defined
  const navItems = headerMenu.length ? headerMenu
    : (site.pages || []).map((p) => ({ label: p.name, url: `/site/${slug}/page/${p.slug}` }));

  const isHome = !pageSlug || page?.type === "home";

  return (
    <div style={{
      background: colors.background || "#fff",
      color: colors.text || "#212529",
      fontFamily: typo.fontFamily || "system-ui, sans-serif",
      fontSize: typo.baseFontSize || 16,
      minHeight: "100vh",
      display: "flex", flexDirection: "column",
    }}>
      {theme?.customCss && <style>{theme.customCss}</style>}

      {/* Header */}
      <header style={{ background: colors.header || "#212529" }} className="text-white">
        <div className="container d-flex justify-content-between align-items-center py-3">
          <Link to={`/site/${slug}`} className="text-white text-decoration-none d-flex align-items-center">
            {site.website.logo
              ? <img src={site.website.logo} alt={site.website.name} height="36" className="me-2" />
              : <i className="bi bi-globe2 me-2 fs-4" />}
            <strong style={{ fontFamily: typo.headingFont }}>{site.website.name}</strong>
          </Link>
          <nav className="d-none d-md-flex gap-3">
            {navItems.map((item, i) => (
              item.url?.startsWith("/site/")
                ? <Link key={i} to={item.url} className="text-white text-decoration-none">{item.icon && <i className={`bi ${item.icon} me-1`} />}{item.label}</Link>
                : <a key={i} href={item.url || "#"} target={item.target || "_self"} className="text-white text-decoration-none">{item.icon && <i className={`bi ${item.icon} me-1`} />}{item.label}</a>
            ))}
          </nav>
        </div>
      </header>

      {/* Homepage banners (slider — simple carousel) */}
      {isHome && banners.length > 0 && (
        <div id="siteCarousel" className="carousel slide" data-bs-ride="carousel">
          <div className="carousel-inner">
            {banners.map((b, i) => (
              <div key={b._id} className={`carousel-item ${i === 0 ? "active" : ""}`}>
                <div style={{ background: b.image ? `url(${b.image}) center/cover` : colors.primary, minHeight: 360 }} className="d-flex align-items-center">
                  <div className="container text-white" style={{ textShadow: "0 1px 4px rgba(0,0,0,.5)" }}>
                    <h1 className="display-4">{b.title}</h1>
                    {b.subtitle && <p className="lead">{b.subtitle}</p>}
                    {b.buttonText && <a href={b.buttonLink || "#"} className="btn btn-light btn-lg mt-2">{b.buttonText}</a>}
                  </div>
                </div>
              </div>
            ))}
          </div>
          {banners.length > 1 && (
            <>
              <button className="carousel-control-prev" type="button" data-bs-target="#siteCarousel" data-bs-slide="prev"><span className="carousel-control-prev-icon" /></button>
              <button className="carousel-control-next" type="button" data-bs-target="#siteCarousel" data-bs-slide="next"><span className="carousel-control-next-icon" /></button>
            </>
          )}
        </div>
      )}

      {/* Main content: page blocks */}
      <main className="container py-5 flex-grow-1">
        {page?.blocks?.length ? page.blocks.map((b, i) => <BlockRenderer key={i} block={b} theme={theme} />)
          : <p className="text-muted text-center">This page has no content yet.</p>}

        {/* Homepage dynamic sections */}
        {isHome && news.length > 0 && (
          <section className="mt-5">
            <h3 style={{ fontFamily: typo.headingFont }} className="mb-3">Latest News</h3>
            <div className="row g-3">
              {news.map((n) => (
                <div className="col-md-4" key={n._id}>
                  <div className="card h-100 shadow-sm">
                    {n.featuredImage && <img src={n.featuredImage} alt="" className="card-img-top" style={{ height: 160, objectFit: "cover" }} />}
                    <div className="card-body">
                      <h6>{n.title}</h6>
                      <p className="small text-muted">{n.excerpt}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {isHome && events.length > 0 && (
          <section className="mt-5">
            <h3 style={{ fontFamily: typo.headingFont }} className="mb-3">Upcoming Events</h3>
            <div className="row g-3">
              {events.map((ev) => (
                <div className="col-md-4" key={ev._id}>
                  <div className="card h-100 shadow-sm">
                    {ev.banner && <img src={ev.banner} alt="" className="card-img-top" style={{ height: 160, objectFit: "cover" }} />}
                    <div className="card-body">
                      <h6>{ev.name}</h6>
                      <p className="small mb-1"><i className="bi bi-geo-alt me-1" />{ev.venue}</p>
                      <p className="small text-muted"><i className="bi bi-clock me-1" />{new Date(ev.startDate).toLocaleString()}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>

      {/* Footer */}
      <footer style={{ background: colors.footer || "#212529" }} className="text-white py-4 mt-auto">
        <div className="container">
          <div className="row">
            <div className="col-md-6">
              <strong style={{ fontFamily: typo.headingFont }}>{site.website.name}</strong>
              <p className="small text-white-50 mb-1">{site.website.description}</p>
              {site.website.contactEmail && <div className="small"><i className="bi bi-envelope me-1" />{site.website.contactEmail}</div>}
              {site.website.contactNumber && <div className="small"><i className="bi bi-telephone me-1" />{site.website.contactNumber}</div>}
            </div>
            <div className="col-md-6 text-md-end">
              {footerMenu.map((item, i) => (
                <a key={i} href={item.url || "#"} className="text-white-50 text-decoration-none d-block small">{item.label}</a>
              ))}
            </div>
          </div>
          <hr className="border-secondary" />
          <div className="small text-center text-white-50">© {new Date().getFullYear()} {site.website.name}. All rights reserved.</div>
        </div>
      </footer>

      {theme?.customJs && <script dangerouslySetInnerHTML={{ __html: theme.customJs }} />}
      <ChatWidget slug={slug} />
    </div>
  );
}
