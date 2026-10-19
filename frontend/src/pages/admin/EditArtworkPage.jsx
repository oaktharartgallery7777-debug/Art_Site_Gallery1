import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { api } from "../../api/client";

const FIELDS = ["title", "artist", "draw_year", "purchase_year", "price", "medium", "location", "width", "height", "unit"];

export default function EditArtworkPage() {
  const [params] = useSearchParams();
  const [idInput, setIdInput] = useState(params.get("id") || "");
  const [row, setRow] = useState(null);
  const [form, setForm] = useState({});
  const [msg, setMsg] = useState(null);
  const [busy, setBusy] = useState(false);

  async function search(id) {
    const target = (id || idInput).trim();
    if (!target) return;
    setMsg(null);
    setRow(null);
    try {
      const r = await api.painting(target);
      setRow(r);
      const f = {};
      FIELDS.forEach((k) => { f[k] = r[k] ?? ""; });
      setForm(f);
    } catch {
      setMsg({ t: "error", x: `ID '${target}' not found.` });
    }
  }

  useEffect(() => {
    if (params.get("id")) search(params.get("id"));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function save(e) {
    e.preventDefault();
    setBusy(true);
    setMsg(null);
    try {
      const body = {};
      FIELDS.forEach((k) => {
        let v = form[k];
        if ((k === "width" || k === "height") && v !== "") v = Number(v);
        body[k] = v === "" ? null : v;
      });
      await api.updatePainting(row.id, body);
      setMsg({ t: "ok", x: `Artwork ${row.id} updated.` });
    } catch (err) {
      setMsg({ t: "error", x: err.message });
    } finally {
      setBusy(false);
    }
  }

  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value });

  return (
    <>
      <div className="page-head">
        <h1>Edit Artwork</h1>
        <p>Search by ID and update details</p>
        <div className="gold-rule" />
      </div>

      {msg && <div className={`alert alert-${msg.t}`}>{msg.x}</div>}

      <form onSubmit={(e) => { e.preventDefault(); search(); }} className="filter-bar">
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
          <h3>Editing ID: {row.id}</h3>
          <form onSubmit={save}>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 }}>
              {FIELDS.map((k) => (
                <div key={k}>
                  <label className="f-label">{k.replace("_", " ")}</label>
                  {k === "unit" ? (
                    <select className="input" value={form[k]} onChange={set(k)}>
                      <option value="in">in</option><option value="cm">cm</option>
                    </select>
                  ) : (
                    <input className="input" value={form[k]} onChange={set(k)}
                      type={k === "width" || k === "height" ? "number" : "text"} step="any" />
                  )}
                </div>
              ))}
            </div>
            <button className="btn btn-gold" style={{ marginTop: 18 }} disabled={busy}>
              {busy ? "Saving…" : "Save Changes"}
            </button>
          </form>
        </div>
      )}
    </>
  );
}
