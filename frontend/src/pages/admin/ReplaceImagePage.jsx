import { useState } from "react";
import { api } from "../../api/client";

export default function ReplaceImagePage() {
  const [idInput, setIdInput] = useState("");
  const [row, setRow] = useState(null);
  const [file, setFile] = useState(null);
  const [msg, setMsg] = useState(null);
  const [busy, setBusy] = useState(false);

  async function search(e) {
    e.preventDefault();
    const id = idInput.trim();
    if (!id) return;
    setMsg(null);
    setRow(null);
    try {
      setRow(await api.painting(id));
    } catch {
      setMsg({ t: "error", x: `ID '${id}' not found.` });
    }
  }

  async function submit(e) {
    e.preventDefault();
    if (!row || !file) return;
    setBusy(true);
    setMsg(null);
    try {
      const fd = new FormData();
      fd.append("image", file);
      const r = await api.replaceImage(row.id, fd);
      setRow({ ...row, image_url: r.image_url });
      setFile(null);
      setMsg({ t: "ok", x: "Image replaced." });
    } catch (err) {
      setMsg({ t: "error", x: err.message });
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <div className="page-head">
        <h1>Replace Image</h1>
        <p>Swap an artwork's photo — the old one is removed from storage</p>
        <div className="gold-rule" />
      </div>

      {msg && <div className={`alert alert-${msg.t}`}>{msg.x}</div>}

      <form onSubmit={search} className="filter-bar">
        <div className="fg" style={{ flex: "1 1 260px" }}>
          <label className="f-label">Artwork ID</label>
          <input className="input" value={idInput} onChange={(e) => setIdInput(e.target.value)} placeholder="001-0001" />
        </div>
        <div className="fg" style={{ flex: "0 0 auto", display: "flex", alignItems: "flex-end" }}>
          <button className="btn btn-gold" type="submit">🔍 Search</button>
        </div>
      </form>

      {row && (
        <div className="card">
          <h3>{row.id} — {row.title || "Unknown"}</h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
            <div>
              <label className="f-label">Current image</label>
              {row.image_url
                ? <img src={row.image_url} alt="" style={{ width: "100%", borderRadius: 12, border: "1px solid var(--border)" }} />
                : <p style={{ color: "var(--text-faint)" }}>No image.</p>}
            </div>
            <form onSubmit={submit}>
              <label className="f-label">New image (max 20MB)</label>
              <input className="input" type="file" accept="image/jpeg,image/png,image/webp"
                onChange={(e) => setFile(e.target.files[0] || null)} style={{ marginBottom: 16 }} />
              <button className="btn btn-gold" disabled={!file || busy}>
                {busy ? "Uploading…" : "Replace Image"}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
