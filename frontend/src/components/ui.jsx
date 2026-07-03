// Shared presentational components — used everywhere so the UI is identical
// across the whole application (header, tabs, filter bar, table, pills, buttons).

export function PageHeader({ title, subtitle, actions }) {
  return (
    <div className="d-flex justify-content-between align-items-start mb-3 flex-wrap gap-2">
      <div>
        <h1 className="page-title">{title}</h1>
        {subtitle && <p className="page-sub">{subtitle}</p>}
      </div>
      {actions && <div className="d-flex gap-2">{actions}</div>}
    </div>
  );
}

// Pill-style tab track matching the theme
export function Tabs({ tabs, value, onChange }) {
  return (
    <div className="tab-track">
      {tabs.map((t) => {
        const v = typeof t === "string" ? t : t.value;
        const label = typeof t === "string" ? t : t.label;
        return (
          <button key={v} className={"tab" + (value === v ? " active" : "")} onClick={() => onChange(v)}>
            {label}
          </button>
        );
      })}
    </div>
  );
}

// Filter bar shell — children are <Field> blocks + action buttons
export function FilterBar({ children }) {
  return <div className="filter-bar d-flex flex-wrap align-items-end gap-3">{children}</div>;
}
export function Field({ label, children, style }) {
  return (
    <div style={style}>
      {label && <label className="field-label">{label}</label>}
      {children}
    </div>
  );
}

export function Spinner({ label = "Loading…" }) {
  return (
    <div className="text-center text-muted py-5">
      <div className="spinner-border spinner-border-sm me-2" role="status" style={{ color: "var(--accent)" }} />
      {label}
    </div>
  );
}

export function EmptyState({ icon = "inbox", text = "Nothing here yet." }) {
  return (
    <div className="text-center py-5" style={{ color: "var(--muted)" }}>
      <i className={`bi bi-${icon} fs-3 d-block mb-2`}></i>
      {text}
    </div>
  );
}

export function ErrorBox({ error }) {
  if (!error) return null;
  return (
    <div className="alert alert-danger py-2 small mb-3">
      <i className="bi bi-exclamation-triangle me-1"></i>
      {error.message || String(error)}
    </div>
  );
}

// Standard data table: pass columns [{key,label,align,render}] and rows.
// Keeps every table in the app visually identical.
export function DataTable({ columns, rows, rowKey = "_id", onRowClick, loading, empty }) {
  return (
    <div className="card">
      <div className="table-responsive">
        <table className={"table" + (onRowClick ? " table-hover" : "")}>
          <thead>
            <tr>
              {columns.map((c) => (
                <th key={c.key} style={{ textAlign: c.align || "left", width: c.width }}>{c.label}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={columns.length}><Spinner /></td></tr>
            ) : !rows || rows.length === 0 ? (
              <tr><td colSpan={columns.length}><EmptyState {...(empty || {})} /></td></tr>
            ) : (
              rows.map((r) => (
                <tr key={r[rowKey]} className={onRowClick ? "cursor-pointer" : ""} onClick={onRowClick ? () => onRowClick(r) : undefined}>
                  {columns.map((c) => (
                    <td key={c.key} style={{ textAlign: c.align || "left" }}>
                      {c.render ? c.render(r) : r[c.key]}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// Colour-coded status pill (neutral structure; colour only conveys meaning)
export function StatusPill({ color, name, sub }) {
  if (!name) return <span className="text-muted">—</span>;
  const style = color ? { background: color + "1f", color } : undefined;
  return (
    <span className="d-inline-flex flex-column" style={{ lineHeight: 1.25 }}>
      <span className="pill" style={style}>
        <span className="dot" style={color ? { background: color } : undefined} />
        {name}
      </span>
      {sub && <span style={{ fontSize: 10, color: "var(--muted)" }}>{sub}</span>}
    </span>
  );
}

// Row action icon button
export function IconBtn({ icon, title, danger, onClick }) {
  return (
    <button className={"btn-icon" + (danger ? " danger" : "")} title={title} onClick={(e) => { e.stopPropagation(); onClick && onClick(e); }}>
      <i className={`bi bi-${icon}`}></i>
    </button>
  );
}

export function Avatar({ name = "?", size = 32 }) {
  const initials = name.split(" ").map((w) => w[0]).slice(0, 2).join("").toUpperCase();
  // neutral, theme-aligned avatar (no random bright colours)
  return (
    <span
      className="d-inline-flex align-items-center justify-content-center flex-shrink-0"
      style={{ width: size, height: size, background: "var(--accent-soft)", color: "var(--accent-ink)", fontSize: size * 0.38, fontWeight: 600, borderRadius: "50%" }}
    >
      {initials}
    </span>
  );
}

// Standard modal shell
export function Modal({ title, onClose, children, footer, size, bodyStyle }) {
  return (
    <>
      <div className="modal-backdrop fade show"></div>
      <div className="modal d-block" tabIndex={-1}>
        <div className={"modal-dialog" + (size ? " modal-" + size : "")}> 
          <div className="modal-content">
            <div className="modal-header">
              <h5 className="modal-title" style={{ fontSize: 16 }}>{title}</h5>
              <button className="btn-close" onClick={onClose}></button>
            </div>
            <div className="modal-body" style={bodyStyle}>{children}</div>
            {footer && <div className="modal-footer">{footer}</div>}
          </div>
        </div>
      </div>
    </>
  );
}
