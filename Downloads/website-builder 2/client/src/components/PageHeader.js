export default function PageHeader({ icon, title, subtitle, children }) {
  return (
    <div className="d-flex justify-content-between align-items-start flex-wrap gap-2 mb-4">
      <div>
        <h3 className="m-0"><i className={`bi ${icon} me-2`} />{title}</h3>
        {subtitle && <div className="text-muted small mt-1">{subtitle}</div>}
      </div>
      <div className="d-flex gap-2">{children}</div>
    </div>
  );
}
