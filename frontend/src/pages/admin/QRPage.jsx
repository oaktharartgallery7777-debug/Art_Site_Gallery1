import { useState } from "react";
import { api } from "../../api/client";

export default function QRPage() {
  const [idInput, setIdInput] = useState("");
  const [ids, setIds] = useState([]);

  function add(e) {
    e.preventDefault();
    const id = idInput.trim();
    if (id && !ids.includes(id)) setIds([...ids, id]);
    setIdInput("");
  }

  return (
    <>
      <div className="page-head">
        <h1>QR Generator</h1>
        <p>Generate QR codes that link to artwork pages — print and stick on frames</p>
        <div className="gold-rule" />
      </div>

      <form onSubmit={add} className="filter-bar">
        <div className="fg" style={{ flex: "1 1 260px" }}>
          <label className="f-label">Artwork ID</label>
          <input className="input" value={idInput} onChange={(e) => setIdInput(e.target.value)} placeholder="001-0001" />
        </div>
        <div className="fg" style={{ flex: "0 0 auto", display: "flex", alignItems: "flex-end" }}>
          <button className="btn btn-gold" type="submit">Add QR</button>
        </div>
      </form>

      {ids.length === 0 ? (
        <div className="empty"><div className="big">🔳</div><p>Add an artwork ID to generate its QR code.</p></div>
      ) : (
        <div className="qr-grid">
          {ids.map((id) => (
            <div className="qr-card" key={id}>
              <img src={api.qrUrl(id)} alt={`QR for ${id}`} />
              <p style={{ margin: "12px 0 10px", fontWeight: 600, color: "var(--gold-soft)" }}>{id}</p>
              <a className="btn btn-outline" style={{ fontSize: "0.78rem", padding: "7px 14px" }}
                href={api.qrUrl(id)} download={`qr-${id}.png`}>Download</a>
              <button className="btn btn-outline" style={{ fontSize: "0.78rem", padding: "7px 14px", marginLeft: 8 }}
                onClick={() => setIds(ids.filter((x) => x !== id))}>Remove</button>
            </div>
          ))}
        </div>
      )}
    </>
  );
}
