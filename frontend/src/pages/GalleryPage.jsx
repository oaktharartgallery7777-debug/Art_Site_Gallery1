import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { api } from "../api/client";
import { cloudinaryThumb } from "../utils/images";
import ArtworkCard from "../components/ArtworkCard";

export default function GalleryPage() {
  const [searchParams] = useSearchParams();
  const [data, setData] = useState(null);
  const [opts, setOpts] = useState({ artists: [], locations: [], mediums: [] });
  const [page, setPage] = useState(1);
  const [featured, setFeatured] = useState(null);
  const [f, setF] = useState({ search: "", artist: searchParams.get("artist") || "", location: "", medium: "" });

  useEffect(() => {
    setData(null);
    const params = { page, per_page: 12, ...Object.fromEntries(Object.entries(f).filter(([_, v]) => v)) };
    api.paintings(params).then(setData).catch(() => setData({ items: [], total: 0, pages: 0 }));
  }, [page, f]);

  useEffect(() => {
    api.filterOptions().then(setOpts).catch(() => {});
    api.paintings({ page: 1, per_page: 20 }).then((d) => {
      const withImg = (d.items || []).find((r) => r.image_url);
      if (withImg) setFeatured(withImg);
    }).catch(() => {});
  }, []);

  const totalPages = data?.pages || 0;

  return (
    <>
      <div className="hero">
        <div className="hero-bg">
          {featured && <img src={cloudinaryThumb(featured.image_url, 1600)} alt="" />}
        </div>
        <div className="hero-shade" />
        <div className="hero-content">
          <span className="eyebrow">Private Collection</span>
          <h1>The Collection</h1>
          <p>
            {opts.artists.length > 0 ? `${opts.artists.length} artists` : "Dozens of artists"} ·{" "}
            {data ? `${data.total} works` : "hundreds of works"} — Myanmar fine art,
            preserved and catalogued in one place.
          </p>
          <div className="hero-stats">
            <div className="hs"><b>{data ? data.total : "—"}</b><span>Artworks</span></div>
            <div className="hs"><b>{opts.artists.length || "—"}</b><span>Artists</span></div>
            <div className="hs"><b>{opts.mediums.length || "—"}</b><span>Mediums</span></div>
          </div>
        </div>
      </div>

      <div className="filter-bar">
        <div className="fg">
          <label className="f-label">Search</label>
          <input className="input" placeholder="Title, artist, or ID…" value={f.search}
            onChange={(e) => { setPage(1); setF({ ...f, search: e.target.value }); }} />
        </div>
        <div className="fg">
          <label className="f-label">Artist</label>
          <select className="input" value={f.artist}
            onChange={(e) => { setPage(1); setF({ ...f, artist: e.target.value }); }}>
            <option value="">All artists</option>
            {opts.artists.map((a) => <option key={a} value={a}>{a}</option>)}
          </select>
        </div>
        <div className="fg">
          <label className="f-label">Medium</label>
          <select className="input" value={f.medium}
            onChange={(e) => { setPage(1); setF({ ...f, medium: e.target.value }); }}>
            <option value="">All mediums</option>
            {opts.mediums.map((m) => <option key={m} value={m}>{m}</option>)}
          </select>
        </div>
        <div className="fg">
          <label className="f-label">Location</label>
          <select className="input" value={f.location}
            onChange={(e) => { setPage(1); setF({ ...f, location: e.target.value }); }}>
            <option value="">All locations</option>
            {opts.locations.map((l) => <option key={l} value={l}>{l}</option>)}
          </select>
        </div>
        <div>
          <button className="btn btn-outline btn-sm" style={{ marginTop: 22 }}
            onClick={() => { setPage(1); setF({ search: "", artist: "", location: "", medium: "" }); }}>
            Reset
          </button>
        </div>
      </div>

      {!data ? (
        <div className="spinner" />
      ) : data.items.length === 0 ? (
        <div className="empty">
          <div className="big">🖼️</div>
          <p>No artworks match your filters.</p>
        </div>
      ) : (
        <>
          <div className="art-grid">
            {data.items.map((r) => <ArtworkCard key={r.id} row={r} />)}
          </div>
          {totalPages > 1 && (
            <div className="pagination">
              <button className="btn btn-outline btn-sm" disabled={page <= 1} onClick={() => setPage(page - 1)}>← Prev</button>
              <span className="info">Page {page} of {totalPages}</span>
              <button className="btn btn-outline btn-sm" disabled={page >= totalPages} onClick={() => setPage(page + 1)}>Next →</button>
            </div>
          )}
        </>
      )}
    </>
  );
}
