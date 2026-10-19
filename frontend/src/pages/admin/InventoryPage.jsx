import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../../api/client";
import { cloudinaryThumb } from "../../utils/images";

const EMPTY = { id: "", title: "", artist: "", width: "", height: "", unit: "in", medium: "", location: "", draw_year: "", purchase_year: "", price: "" };

export default function InventoryPage() {
  const [data, setData] = useState(null);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [form, setForm] = useState(EMPTY);
  const [file, setFile] = useState(null);
  const [msg, setMsg] = useState(null);
  const [busy, setBusy] = useState(false);

  function load() {
    setData(null);
    api.paintings({ page, search: search.trim(), per_page: 15 })
      .then(setData)
      .catch(() => setData({ items: [], total: 0, total_pages: 1 }));
  }

  useEffect(load, [page]); // eslint-disable-line react-hooks/exhaustive-deps

  function doSearch(e) {
    e.preventDefault();
    setPage(1);
    load();
  }

  async function submit(e) {
    e.preventDefault();
    if (!form.id.trim()) { setMsg({ t: "error", x: "ID is required." }); return; }
    setBusy(true);
    setMsg(null);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => fd.append(k, v));
      if (file) fd.append("image", file);
      await api.createPainting(fd);
      setMsg({ t: "ok", x: `Artwork ${form.id} added.` });
      setForm(EMPTY);
      setFile(null);
      load();
    } catch (err) {
      setMsg({ t: "error", x: err.message });
    } finally {
      setBusy(false);
    }
  }

  async function remove(id) {
    if (!window.confirm(`Delete artwork ${id}? This cannot be undone.`)) return;
    try {
      await api.deletePainting(id);
      setMsg({ t: "ok", x: `Deleted ${id}.` });
      load();
    } catch (err) {
      setMsg({ t: "error", x: err.message });
    }
  }

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  return (
    <>
      <div className="page-head">
        <h1>Inventory Management</h1>
        <p>Add, browse and delete artworks</p>
        <div className="gold-rule" />
      </div>

      {msg && <div className={`alert alert-${msg.t}`}>{msg.x}</div>}

      <div className="card" style={{ marginBottom: 26 }}>
        <h3>Add Artwork</h3>
        <form onSubmit={submit}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 }}>
            <div><label className="f-label">ID *</label><input className="input" value={form.id} onChange={set("id")} placeholder="001-0001" /></div>
            <div><label className="f-label">Title</label><input className="input" value={form.title} onChange={set("title")} /></div>
            <div><label className="f-label">Artist</label><input className="input" value={form.artist} onChange={set("artist")} /></div>
            <div><label className="f-label">Width</label><input className="input" type="number" step="any" value={form.width} onChange={set("width")} /></div>
            <div><label className="f-label">Height</label><input className="input" type="number" step="any" value={form.height} onChange={set("height")} /></div>
            <div><label className="f-label">Unit</label>
              <select className="input" value={form.unit} onChange={set("unit")}><option value="in">in</option><option value="cm">cm</option></select>
            </div>
            <div><label className="f-label">Medium</label><input className="input" value={form.medium} onChange={set("medium")} placeholder="AC" /></div>
            <div><label className="f-label">Location</label><input className="input" value={form.location} onChange={set("location")} placeholder="Home" /></div>
            <div><label className="f-label">Year Created</label><input className="input" value={form.draw_year} onChange={set("draw_year")} /></div>
            <div><label className="f-label">Purchase Year</label><input className="input" value={form.purchase_year} onChange={set("purchase_year")} /></div>
            <div><label className="f-label">Price</label><input className="input" value={form.price} onChange={set("price")} /></div>
            <div><label className="f-label">Image (max 20MB)</label><input className="input" type="file" accept="image/jpeg,image/png,image/webp" onChange={(e) => setFile(e.target.files[0] || null)} /></div>
          </div>
          <button className="btn btn-gold" style={{ marginTop: 18 }} disabled={busy}>{busy ? "Adding…" : "Add Artwork"}</button>
        </form>
      </div>

      <form onSubmit={doSearch} className="filter-bar">
        <div className="fg" style={{ flex: "1 1 260px" }}>
          <input className="input" placeholder="Search ID, title, artist…" value={search} onChange={(e) => setSearch(e.target.value)} />
        </div>
        <button className="btn btn-ghost" type="submit">Search</button>
      </form>

      {!data ? <div className="spinner" /> : (
        <>
          <div className="tbl-wrap">
            <table className="tbl">
              <thead><tr><th></th><th>ID</th><th>Title</th><th>Artist</th><th>Size</th><th>Location</th><th></th></tr></thead>
              <tbody>
                {data.items.map((r) => (
                  <tr key={r.id}>
                    <td>{r.image_url ? <img className="thumb" src={cloudinaryThumb(r.image_url, 200)} alt="" loading="lazy" /> : "—"}</td>
                    <td style={{ color: "var(--gold-soft)", fontWeight: 600 }}>{r.id}</td>
                    <td>{r.title || "Unknown"}</td>
                    <td>{r.artist || "—"}</td>
                    <td>{r.width} × {r.height} {r.unit}</td>
                    <td>{r.location || "—"}</td>
                    <td style={{ whiteSpace: "nowrap" }}>
                      <Link to={`/art/${encodeURIComponent(r.id)}`} className="btn btn-ghost" style={{ padding: "6px 12px", fontSize: "0.76rem", marginRight: 8 }}>View</Link>
                      <Link to={`/admin/edit?id=${encodeURIComponent(r.id)}`} className="btn btn-ghost" style={{ padding: "6px 12px", fontSize: "0.76rem", marginRight: 8 }}>Edit</Link>
                      <button className="btn btn-danger" style={{ padding: "6px 12px", fontSize: "0.76rem" }} onClick={() => remove(r.id)}>Delete</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="pagination">
            <button className="btn btn-ghost" disabled={page <= 1} onClick={() => { setPage(page - 1); }}>← Prev</button>
            <span className="info">Page {page} / {data.total_pages} · {data.total} total</span>
            <button className="btn btn-ghost" disabled={page >= data.total_pages} onClick={() => { setPage(page + 1); }}>Next →</button>
          </div>
        </>
      )}
    </>
  );
}
