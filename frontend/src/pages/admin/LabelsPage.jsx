import { useEffect, useState } from "react";
import { api } from "../../api/client";

export default function LabelsPage() {
  const [data, setData] = useState(null);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState(new Set());
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

  async function download() {
    if (selected.size === 0) return;
    setBusy(true);
    try {
      await api.labelsPdf([...selected]);
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <div className="page-head">
        <h1>Print Labels</h1>
        <p>Select artworks and download printable label cards with QR codes</p>
        <div className="gold-rule" />
      </div>

      <form onSubmit={(e) => { e.preventDefault(); setPage(1); load(); }} className="filter-bar">
        <div className="fg" style={{ flex: "1 1 260px" }}>
          <input className="input" placeholder="Search ID, title, artist…" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <button className="btn btn-ghost" type="submit">Search</button>
        <div className="fg" style={{ flex: "0 0 auto", display: "flex", alignItems: "flex-end" }}>
          <button type="button" className="btn btn-gold" disabled={selected.size === 0 || busy} onClick={download}>
            🖨️ {busy ? "Generating…" : `Labels PDF (${selected.size})`}
          </button>
        </div>
      </form>

      {!data ? <div className="spinner" /> : (
        <>
          <div className="tbl-wrap">
            <table className="tbl">
              <thead><tr><th></th><th>ID</th><th>Title</th><th>Artist</th><th>Location</th></tr></thead>
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
            <button className="btn btn-ghost" disabled={page <= 1} onClick={() => setPage(page - 1)}>← Prev</button>
            <span className="info">Page {page} / {data.total_pages}</span>
            <button className="btn btn-ghost" disabled={page >= data.total_pages} onClick={() => setPage(page + 1)}>Next →</button>
          </div>
        </>
      )}
    </>
  );
}
