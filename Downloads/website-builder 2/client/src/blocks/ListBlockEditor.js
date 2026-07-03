import { LIST_BLOCKS } from "./itemSchemas";

// Renders add/remove/edit UI for a list-type block (features, pricing, etc.)
export default function ListBlockEditor({ block, onChange }) {
  const schema = LIST_BLOCKS[block.type];
  if (!schema) return null;
  const p = block.props || {};
  const items = p[schema.key] || [];

  const setItems = (next) => onChange({ ...block, props: { ...p, [schema.key]: next } });
  const updateItem = (i, field, val) => {
    const next = [...items];
    if (schema.simpleList) next[i] = val;
    else next[i] = { ...next[i], [field]: val };
    setItems(next);
  };
  const addItem = () => setItems([...items, schema.simpleList ? schema.blank : { ...schema.blank }]);
  const removeItem = (i) => setItems(items.filter((_, j) => j !== i));
  const move = (i, dir) => { const j = i + dir; if (j < 0 || j >= items.length) return; const n = [...items]; [n[i], n[j]] = [n[j], n[i]]; setItems(n); };

  const renderField = (item, i, f) => {
    const val = schema.simpleList ? item : (item[f.name] ?? "");
    const on = (v) => updateItem(i, f.name, v);
    switch (f.type) {
      case "textarea": return <textarea className="form-control form-control-sm" rows="2" value={val} onChange={(e) => on(e.target.value)} />;
      case "number": return <input type="number" className="form-control form-control-sm" value={val} onChange={(e) => on(+e.target.value)} />;
      case "bool": return <div className="form-check"><input className="form-check-input" type="checkbox" checked={!!val} onChange={(e) => on(e.target.checked)} /></div>;
      case "lines": return <textarea className="form-control form-control-sm" rows="3" value={(val || []).join("\n")} onChange={(e) => on(e.target.value.split("\n").filter(Boolean))} />;
      case "image": return (
        <div className="input-group input-group-sm">
          <input className="form-control" value={val} onChange={(e) => on(e.target.value)} placeholder="image URL" />
          {val && <span className="input-group-text p-0"><img src={val} alt="" style={{ width: 28, height: 28, objectFit: "cover" }} /></span>}
        </div>);
      case "icon": return (
        <div className="input-group input-group-sm">
          <span className="input-group-text"><i className={`bi ${val || "bi-star"}`} /></span>
          <input className="form-control" value={val} onChange={(e) => on(e.target.value)} placeholder="bi-star" />
        </div>);
      default: return <input className="form-control form-control-sm" value={val} onChange={(e) => on(e.target.value)} />;
    }
  };

  return (
    <div>
      {items.map((item, i) => (
        <div className="border rounded p-2 mb-2 bg-light" key={i}>
          <div className="d-flex justify-content-between align-items-center mb-1">
            <span className="small fw-semibold">{schema.label} {i + 1}</span>
            <div className="btn-group btn-group-sm">
              <button className="btn btn-light py-0" onClick={() => move(i, -1)}><i className="bi bi-arrow-up" /></button>
              <button className="btn btn-light py-0" onClick={() => move(i, 1)}><i className="bi bi-arrow-down" /></button>
              <button className="btn btn-light py-0 text-danger" onClick={() => removeItem(i)}><i className="bi bi-trash" /></button>
            </div>
          </div>
          {schema.fields.map((f) => (
            <div className="mb-2" key={f.name}>
              {!schema.simpleList && <label className="form-label small mb-0">{f.label}</label>}
              {renderField(item, i, f)}
            </div>
          ))}
        </div>
      ))}
      <button className="btn btn-sm btn-outline-primary w-100" onClick={addItem}><i className="bi bi-plus-lg me-1" />Add {schema.label}</button>
    </div>
  );
}
