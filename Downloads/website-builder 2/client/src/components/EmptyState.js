export default function EmptyState({ icon = "bi-inbox", title = "Nothing here yet", text, action }) {
  return (
    <div className="text-center text-muted py-5">
      <i className={`bi ${icon} d-block mb-3`} style={{ fontSize: "3rem", opacity: .4 }} />
      <h6>{title}</h6>
      {text && <p className="small">{text}</p>}
      {action}
    </div>
  );
}
