import { useEffect, useState } from "react";
import { api } from "../../api/client";

export default function BatchLocationPage() {
  const [data, setData] = useState(null);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState(new Set());
  const [location, setLocation] = useState("");
  const [msg, setMsg] = useState(null);
  const [busy, setBusy] = useState(false);

  function load() {
    setData(null);
    api.paintings({ page, search: search.trim(), per_page: 15 })
      .then(setData)
      .catch(() => setData({ items: [], total: 0, total_pages: 1 }));
  }

  useEffect(load, [page]); // eslint-disable-line react-hooks/exhaustive-deps

  function toggle(id) {
    const next = new Set(selected);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelected(next);
  }

  async function submit(e) {
    e.preventDefault();
    if (selected.size === 0 || !location.trim()) return;
    setBusy(true);
    setMsg(null);
    try {
      const r = await api.batchLocation([...selected], location.trim());
      setMsg({ t: "ok", x: `Moved ${r.updated} artworks to "${location.trim()}".` });
      setSelected(new Set());
      load();
    } catch (err) {
      setMsg({ t: "error", x: err.message });
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <div className="page-head">
        <h1>Batch Location</h1>
        <p>Move many artworks to a new location at once</p>
        <div className="gold-rule" />
      </div>

      {msg && <div className={`alert alert-${msg.t}`}>{msg.x}</div>}

      <form onSubmit={submit} className="filter-bar">
        <div className="fg" style={{ flex: "1 1 200px" }}>
          <label className="f-label">New location</label>
          <input className="input" value={location} onChange={(e) => setLocation(e.target.value)} placeholder="e.g. Storage B" />
        </div>
        <div className="fg" style={{ flex: "0 0 auto", display: "flex", alignItems: "flex-end" }}>
          <button className="btn btn-gold" disabled={selected.size === 0 || !location.trim() || busy}>
            {busy ? "Moving…" : `Move ${selected.size} selected`}
          </button>
        </div>
      </form>

      <form onSubmit={(e) => { e.preventDefault(); setPage(1); load(); }} className="filter-bar">
        <div className="fg" style={{ flex: "1 1 260px" }}>
          <input className="input" placeholder="Search ID, title, artist…" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <button className="btn btn-outline" type="submit">Search</button>
      </form>

      {!data ? <div className="spinner" /> : (
        <>
          <div className="tbl-wrap">
            <table className="tbl">
              <thead><tr><th></th><th>ID</th><th>Title</th><th>Artist</th><th>Current Location</th></tr></thead>
              <tbody>
                {data.items.map((r) => (
                  <tr key={r.id} onClick={() => toggle(r.id)} style={{ cursor: "pointer" }}>
                    <td><input type="checkbox" checked={selected.has(r.id)} onChange={() => toggle(r.id)} onClick={(e) => e.stopPropagation()} /></td>
                    <td style={{ color: "var(--gold-soft)", fontWeight: 600 }}>{r.id}</td>
                    <td>{r.title || "Unknown"}</td>
                    <td>{r.artist || "—"}</td>
                    <td>{r.location || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="pagination">
            <button className="btn btn-outline" disabled={page <= 1} onClick={() => setPage(page - 1)}>← Prev</button>
            <span className="info">Page {page} / {data.total_pages}</span>
            <button className="btn btn-outline" disabled={page >= data.total_pages} onClick={() => setPage(page + 1)}>Next →</button>
          </div>
        </>
      )}
    </>
  );
}
