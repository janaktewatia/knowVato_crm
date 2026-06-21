// Elegant filter bar: labeled search + dropdowns inside a white card.
export default function Toolbar({ search, onSearch, filters = [], right, searchLabel = "Search" }) {
  return (
    <div className="card stat-card mb-3">
      <div className="card-body">
        <div className="row g-3 align-items-end">
          <div className="col-12 col-md">
            <label className="form-label small mb-1">{searchLabel}</label>
            <div className="input-group">
              <span className="input-group-text"><i className="bi bi-search text-muted" /></span>
              <input className="form-control" placeholder="Type to search..." value={search}
                onChange={(e) => onSearch(e.target.value)} />
              {search && (
                <button className="btn btn-outline-secondary" onClick={() => onSearch("")}>
                  <i className="bi bi-x-lg" />
                </button>
              )}
            </div>
          </div>
          {filters.map((f) => (
            <div className="col-6 col-md-auto" style={{ minWidth: 170 }} key={f.label}>
              <label className="form-label small mb-1">{f.label}</label>
              <select className="form-select" value={f.value}
                onChange={(e) => f.onChange(e.target.value)}>
                <option value="">All</option>
                {f.options.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
          ))}
          {right && <div className="col-auto ms-auto">{right}</div>}
        </div>
      </div>
    </div>
  );
}
