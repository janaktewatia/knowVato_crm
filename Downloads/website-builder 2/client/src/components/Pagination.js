export default function Pagination({ page, pages, total, onPage }) {
  if (pages <= 1) return <div className="text-muted small mt-3">{total} item(s)</div>;
  const nums = [];
  const start = Math.max(1, page - 2);
  const end = Math.min(pages, start + 4);
  for (let i = start; i <= end; i++) nums.push(i);

  return (
    <div className="d-flex justify-content-between align-items-center mt-3 flex-wrap gap-2">
      <div className="text-muted small">{total} item(s) · page {page} of {pages}</div>
      <nav>
        <ul className="pagination pagination-sm m-0">
          <li className={`page-item ${page === 1 ? "disabled" : ""}`}>
            <button className="page-link" onClick={() => onPage(page - 1)}><i className="bi bi-chevron-left" /></button>
          </li>
          {start > 1 && <li className="page-item"><button className="page-link" onClick={() => onPage(1)}>1</button></li>}
          {start > 2 && <li className="page-item disabled"><span className="page-link">…</span></li>}
          {nums.map((n) => (
            <li className={`page-item ${n === page ? "active" : ""}`} key={n}>
              <button className="page-link" onClick={() => onPage(n)}>{n}</button>
            </li>
          ))}
          {end < pages && <li className="page-item disabled"><span className="page-link">…</span></li>}
          {end < pages && <li className="page-item"><button className="page-link" onClick={() => onPage(pages)}>{pages}</button></li>}
          <li className={`page-item ${page === pages ? "disabled" : ""}`}>
            <button className="page-link" onClick={() => onPage(page + 1)}><i className="bi bi-chevron-right" /></button>
          </li>
        </ul>
      </nav>
    </div>
  );
}
