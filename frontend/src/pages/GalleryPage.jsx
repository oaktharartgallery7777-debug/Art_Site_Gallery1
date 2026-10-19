import { useEffect, useState } from "react";
import { api } from "../api/client";
import ArtworkCard from "../components/ArtworkCard";

export default function GalleryPage() {
  const [data, setData] = useState(null);
  const [opts, setOpts] = useState({ artists: [], locations: [], mediums: [] });
  const [search, setSearch] = useState("");
  const [artist, setArtist] = useState("");
  const [location, setLocation] = useState("");
  const [medium, setMedium] = useState("");
  const [page, setPage] = useState(1);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    api.filterOptions().then(setOpts).catch(() => {});
  }, []);

  useEffect(() => {
    setData(null);
    api.paintings({ page, search: search.trim(), artist, location, medium })
      .then((d) => {
        setData(d);
        if (!stats) {
          setStats({ total: d.total });
        }
      })
      .catch(() => setData({ items: [], total: 0, total_pages: 1 }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, search, artist, location, medium]);

  function reset() {
    setSearch(""); setArtist(""); setLocation(""); setMedium(""); setPage(1);
  }

  return (
    <>
      <div className="page-head">
        <h1>Gallery Explorer</h1>
        <p>Browse the collection — {opts.artists.length} artists · {data ? data.total : "…"} artworks</p>
        <div className="gold-rule" />
      </div>

      <div className="filter-bar">
        <div className="fg" style={{ flex: "2 1 220px" }}>
          <label className="f-label">Search</label>
          <input className="input" placeholder="Title, artist or ID…" value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }} />
        </div>
        <div className="fg">
          <label className="f-label">Artist</label>
          <select className="input" value={artist} onChange={(e) => { setArtist(e.target.value); setPage(1); }}>
            <option value="">All artists</option>
            {opts.artists.map((a) => <option key={a} value={a}>{a}</option>)}
          </select>
        </div>
        <div className="fg">
          <label className="f-label">Location</label>
          <select className="input" value={location} onChange={(e) => { setLocation(e.target.value); setPage(1); }}>
            <option value="">All locations</option>
            {opts.locations.map((l) => <option key={l} value={l}>{l}</option>)}
          </select>
        </div>
        <div className="fg">
          <label className="f-label">Medium</label>
          <select className="input" value={medium} onChange={(e) => { setMedium(e.target.value); setPage(1); }}>
            <option value="">All mediums</option>
            {opts.mediums.map((m) => <option key={m} value={m}>{m}</option>)}
          </select>
        </div>
        <div className="fg" style={{ flex: "0 0 auto", display: "flex", alignItems: "flex-end" }}>
          <button className="btn btn-ghost" onClick={reset}>Reset</button>
        </div>
      </div>

      {!data ? (
        <div className="spinner" />
      ) : data.items.length === 0 ? (
        <div className="empty"><div className="big">🖼️</div><p>No artworks match your filters.</p></div>
      ) : (
        <>
          <div className="art-grid">
            {data.items.map((row) => <ArtworkCard key={row.id} row={row} />)}
          </div>
          <div className="pagination">
            <button className="btn btn-ghost" disabled={page <= 1} onClick={() => setPage(page - 1)}>← Prev</button>
            <span className="info">Showing {data.items.length} of {data.total} · Page {page} / {data.total_pages}</span>
            <button className="btn btn-ghost" disabled={page >= data.total_pages} onClick={() => setPage(page + 1)}>Next →</button>
          </div>
        </>
      )}
    </>
  );
}
