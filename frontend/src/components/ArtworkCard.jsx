import { Link } from "react-router-dom";

export function dimText(row) {
  const w = row.width ?? "—";
  const h = row.height ?? "—";
  const unit = row.unit || "in";
  return `${w} × ${h} ${unit}`;
}

export function soldPill(row) {
  const sold = (row.purchase_year || "").toString().trim() !== "";
  return sold
    ? <span className="pill sold">Sold {row.purchase_year}</span>
    : <span className="pill available">Available</span>;
}

export default function ArtworkCard({ row }) {
  return (
    <Link to={`/art/${encodeURIComponent(row.id)}`} className="art-card">
      <div className="img-wrap">
        {row.image_url
          ? <img src={row.image_url} alt={row.title || row.id} loading="lazy" />
          : <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "3rem" }}>🖼️</div>}
        <span className="id-badge">ID · {row.id}</span>
      </div>
      <div className="body">
        <h3 className="title">{row.title || "Unknown"}</h3>
        <p className="artist">{row.artist || "Unknown Artist"}</p>
        <div className="meta-grid">
          <div className="m"><b>Medium</b>{row.medium || "—"}</div>
          <div className="m"><b>Size</b>{dimText(row)}</div>
          <div className="m"><b>Year</b>{row.draw_year || "—"}</div>
          <div className="m"><b>Location</b>📍 {row.location || "—"}</div>
        </div>
        <div style={{ marginTop: 12 }}>{soldPill(row)}</div>
      </div>
    </Link>
  );
}
