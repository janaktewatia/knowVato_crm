import React from "react";

// Renders a single block by type. `theme` carries colors for public site; optional.
export function RenderBlock({ block, theme = {} }) {
  const p = block.props || {};
  const primary = theme.primary || p.color || "#1d4ed8";

  switch (block.type) {
    case "heading":
      return <h2 style={{ textAlign: p.align || "left" }} className="fw-bold">{p.text}</h2>;

    case "sectionHeading":
      return (
        <div className="text-center my-3">
          {p.eyebrow && <div className="text-uppercase small fw-bold mb-2" style={{ color: primary, letterSpacing: ".08em" }}>{p.eyebrow}</div>}
          <h2 className="fw-bold mb-2">{p.title}</h2>
          {p.subtitle && <p className="text-muted mx-auto" style={{ maxWidth: 640 }}>{p.subtitle}</p>}
        </div>
      );

    case "paragraph":
      return <p style={{ textAlign: p.align || "left" }} className="m-0">{p.text}</p>;

    case "image":
      return <img src={p.src} alt={p.alt || ""} className="img-fluid rounded" style={{ width: p.full ? "100%" : "auto" }} />;

    case "button":
      return <a className="btn px-4 py-2" style={{ background: p.variant === "outline" ? "transparent" : primary, color: p.variant === "outline" ? primary : "#fff", border: `2px solid ${primary}` }} href={p.href || "#"}>{p.text}</a>;

    case "divider":
      return <hr className="my-4" />;

    case "hero":
      return (
        <div className="text-center text-white rounded-3 p-5 my-2" style={{ background: p.bg || `linear-gradient(135deg, ${primary}, ${shade(primary, -30)})`, minHeight: 320, display: "flex", flexDirection: "column", justifyContent: "center" }}>
          {p.eyebrow && <div className="text-uppercase small fw-bold mb-2" style={{ letterSpacing: ".1em", opacity: .85 }}>{p.eyebrow}</div>}
          <h1 className="display-5 fw-bold mb-3">{p.title}</h1>
          {p.subtitle && <p className="lead mb-4 mx-auto" style={{ maxWidth: 600, opacity: .92 }}>{p.subtitle}</p>}
          {p.buttonText && <div><a href={p.buttonLink || "#"} className="btn btn-light btn-lg px-4 fw-semibold">{p.buttonText}</a></div>}
        </div>
      );

    case "features": {
      const items = p.items || [];
      return (
        <div className="row g-4 my-2">
          {items.map((it, i) => (
            <div className={`col-md-${12 / Math.min(p.cols || 3, items.length || 1) | 0 || 4}`} key={i}>
              <div className="p-4 h-100 rounded-3 border bg-white">
                <div className="d-inline-flex align-items-center justify-content-center rounded-3 mb-3" style={{ width: 52, height: 52, background: `${primary}1a`, color: primary }}>
                  <i className={`bi ${it.icon || "bi-star"} fs-4`} />
                </div>
                <h5 className="fw-semibold">{it.title}</h5>
                <p className="text-muted small mb-0">{it.text}</p>
              </div>
            </div>
          ))}
        </div>
      );
    }

    case "stats": {
      const items = p.items || [];
      return (
        <div className="row g-4 text-center my-3 py-3">
          {items.map((it, i) => (
            <div className="col-6 col-md-3" key={i}>
              <div className="display-5 fw-bold" style={{ color: primary }}>{it.value}</div>
              <div className="text-muted small text-uppercase" style={{ letterSpacing: ".05em" }}>{it.label}</div>
            </div>
          ))}
        </div>
      );
    }

    case "gallery": {
      const imgs = p.images || [];
      return (
        <div className="row g-3 my-2">
          {imgs.map((src, i) => (
            <div className="col-6 col-md-4" key={i}>
              <img src={src} alt="" className="img-fluid rounded-3 w-100" style={{ height: 200, objectFit: "cover" }} />
            </div>
          ))}
        </div>
      );
    }

    case "testimonial": {
      const items = p.items || [];
      return (
        <div className="row g-4 my-2">
          {items.map((it, i) => (
            <div className={`col-md-${items.length > 1 ? 6 : 12}`} key={i}>
              <div className="p-4 rounded-3 border bg-white h-100">
                <div className="mb-2" style={{ color: "#f5b50a" }}>{"★".repeat(it.rating || 5)}</div>
                <p className="fst-italic">"{it.quote}"</p>
                <div className="d-flex align-items-center gap-2 mt-3">
                  {it.avatar && <img src={it.avatar} alt="" width="44" height="44" className="rounded-circle" style={{ objectFit: "cover" }} />}
                  <div><div className="fw-semibold small">{it.name}</div><div className="text-muted small">{it.role}</div></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      );
    }

    case "team": {
      const items = p.items || [];
      return (
        <div className="row g-4 my-2">
          {items.map((it, i) => (
            <div className="col-6 col-md-3 text-center" key={i}>
              <img src={it.photo} alt="" className="rounded-circle mb-2" width="120" height="120" style={{ objectFit: "cover" }} />
              <h6 className="fw-semibold mb-0">{it.name}</h6>
              <div className="text-muted small">{it.role}</div>
            </div>
          ))}
        </div>
      );
    }

    case "pricing": {
      const plans = p.plans || [];
      return (
        <div className="row g-4 my-2 justify-content-center">
          {plans.map((pl, i) => (
            <div className="col-md-4" key={i}>
              <div className={`p-4 rounded-3 border h-100 bg-white ${pl.featured ? "shadow" : ""}`} style={pl.featured ? { borderColor: primary, borderWidth: 2 } : {}}>
                {pl.featured && <span className="badge mb-2" style={{ background: primary }}>Popular</span>}
                <h5 className="fw-semibold">{pl.name}</h5>
                <div className="display-6 fw-bold my-2">{pl.price}<span className="fs-6 text-muted fw-normal">{pl.period}</span></div>
                <ul className="list-unstyled small my-3">{(pl.features || []).map((f, j) => <li key={j} className="mb-1"><i className="bi bi-check-lg me-2" style={{ color: primary }} />{f}</li>)}</ul>
                <a href="#" className="btn w-100" style={{ background: pl.featured ? primary : "transparent", color: pl.featured ? "#fff" : primary, border: `2px solid ${primary}` }}>{pl.cta || "Choose"}</a>
              </div>
            </div>
          ))}
        </div>
      );
    }

    case "faq": {
      const items = p.items || [];
      return (
        <div className="accordion my-2" id={`faq-${block._key || block._id || "x"}`}>
          {items.map((it, i) => {
            const id = `${block._key || block._id || "x"}-${i}`;
            return (
              <div className="accordion-item" key={i}>
                <h2 className="accordion-header">
                  <button className="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target={`#c${id}`}>{it.q}</button>
                </h2>
                <div id={`c${id}`} className="accordion-collapse collapse" data-bs-parent={`#faq-${block._key || block._id || "x"}`}>
                  <div className="accordion-body text-muted">{it.a}</div>
                </div>
              </div>
            );
          })}
        </div>
      );
    }

    case "cta":
      return (
        <div className="rounded-3 p-5 my-2 text-center text-white" style={{ background: primary }}>
          <h3 className="fw-bold mb-2">{p.title}</h3>
          {p.subtitle && <p className="mb-4 mx-auto" style={{ maxWidth: 560, opacity: .92 }}>{p.subtitle}</p>}
          {p.buttonText && <a href={p.buttonLink || "#"} className="btn btn-light btn-lg px-4 fw-semibold">{p.buttonText}</a>}
        </div>
      );

    case "logos": {
      const items = p.items || [];
      return (
        <div className="d-flex flex-wrap justify-content-center align-items-center gap-4 my-3 py-2">
          {items.map((src, i) => <img key={i} src={src} alt="" style={{ height: 36, objectFit: "contain", opacity: .7 }} />)}
        </div>
      );
    }

    default:
      return <em className="text-muted">Unknown block: {block.type}</em>;
  }
}

// lighten/darken a hex color
function shade(hex, percent) {
  try {
    const n = parseInt(hex.replace("#", ""), 16);
    let r = (n >> 16) + percent, g = ((n >> 8) & 0xff) + percent, b = (n & 0xff) + percent;
    r = Math.max(0, Math.min(255, r)); g = Math.max(0, Math.min(255, g)); b = Math.max(0, Math.min(255, b));
    return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, "0")}`;
  } catch { return hex; }
}

export default RenderBlock;
