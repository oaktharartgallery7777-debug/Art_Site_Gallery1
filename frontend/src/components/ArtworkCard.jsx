import { Link } from "react-router-dom";
import { cloudinaryThumb } from "../utils/images";

export function dimText(row) {
  const w = (row.width || "").toString().trim();
  const h = (row.height || "").toString().trim();
  const u = (row.unit || "").toString().trim();
  if (!w && !h) return "";
  return `${w}${w && h ? " × " : ""}${h}${u ? " " + u : ""}`;
}

export function acquiredText(row) {
  const y = (row.purchase_year || "").toString().trim();
  return y || "—";
}

export default function ArtworkCard({ row }) {
  const meta = [row.draw_year, row.medium].filter(Boolean).join(" · ");
  return (
    <Link to={`/art/${encodeURIComponent(row.id)}`} className="art-cell">
      <div className="img-wrap">
        {row.image_url
          ? <img src={cloudinaryThumb(row.image_url, 600)} alt={row.title || row.id} loading="lazy" />
          : <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "3rem", color: "#d8d4cb" }}>🖼️</div>}
      </div>
      <h3 className="a-title">{row.title || "Untitled"}</h3>
      <p className="a-artist">{row.artist || "Unknown Artist"}</p>
      {meta && <p className="a-meta">{meta}</p>}
    </Link>
  );
}
