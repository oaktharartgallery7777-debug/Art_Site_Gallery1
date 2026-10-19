import { useState } from "react";
import { api } from "../../api/client";

export default function BulkImportPage() {
  const [file, setFile] = useState(null);
  const [msg, setMsg] = useState(null);
  const [busy, setBusy] = useState(false);
  const [result, setResult] = useState(null);

  async function submit(e) {
    e.preventDefault();
    if (!file) return;
    setBusy(true);
    setMsg(null);
    setResult(null);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const r = await api.bulkImport(fd);
      setResult(r);
      setMsg({ t: "ok", x: `Imported ${r.added} artworks.` });
    } catch (err) {
      setMsg({ t: "error", x: err.message });
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <div className="page-head">
        <h1>Bulk Import</h1>
        <p>Import many artworks at once from a CSV file</p>
        <div className="gold-rule" />
      </div>

      {msg && <div className={`alert alert-${msg.t}`}>{msg.x}</div>}

      <div className="card" style={{ marginBottom: 20 }}>
        <h3>CSV Format</h3>
        <p style={{ color: "var(--text-dim)", fontSize: "0.9rem" }}>
          Required columns: <code style={{ color: "var(--gold-soft)" }}>id, title, artist, width, height, unit, medium, location, draw_year, purchase_year, price, image_url</code>
        </p>
        <p style={{ color: "var(--text-dim)", fontSize: "0.9rem" }}>
          Rows with an ID that already exists are <b>skipped</b>, never overwritten.
        </p>
        <button className="btn btn-outline" onClick={() => api.importTemplate()}>
          ⬇ Download CSV Template
        </button>
      </div>

      <div className="card">
        <h3>Upload CSV</h3>
        <form onSubmit={submit}>
          <input className="input" type="file" accept=".csv" onChange={(e) => setFile(e.target.files[0] || null)} style={{ marginBottom: 16 }} />
          <button className="btn btn-gold" disabled={!file || busy}>{busy ? "Importing…" : "Import"}</button>
        </form>
        {result && result.skipped.length > 0 && (
          <div className="alert alert-error" style={{ marginTop: 18, marginBottom: 0 }}>
            Skipped existing IDs: {result.skipped.join(", ")}
          </div>
        )}
      </div>
    </>
  );
}
