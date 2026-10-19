import { useEffect, useState } from "react";
import { useParams, useSearchParams, Link } from "react-router-dom";
import { api } from "../api/client";
import { cloudinaryThumb } from "../utils/images";
import { acquiredText, dimText } from "../components/ArtworkCard";

export default function ArtworkPage() {
  const { id: pathId } = useParams();
  const [searchParams] = useSearchParams();
  const id = pathId || searchParams.get("id");
  const [row, setRow] = useState(null);
  const [missing, setMissing] = useState(false);

  useEffect(() => {
    if (!id) { setMissing(true); return; }
    api.painting(id).then(setRow).catch(() => setMissing(true));
  }, [id]);

  if (missing) {
    return (
      <div className="empty" style={{ paddingTop: 120 }}>
        <div className="big">🔍</div>
        <h2 className="serif" style={{ fontSize: "1.8rem" }}>Artwork Not Found</h2>
        <p>The artwork you scanned could not be located in our collection.</p>
        <Link to="/" className="btn btn-gold" style={{ marginTop: 20 }}>Back to Gallery</Link>
      </div>
    );
  }

  if (!row) return <div className="spinner" />;

  const kv = [
    ["Artwork ID", row.id],
    ["Medium", row.medium || "—"],
    ["Dimensions", dimText(row)],
    ["Year Created", row.draw_year || "—"],
    ["Year Acquired", acquiredText(row)],
    ["Price", row.price || "—"],
    ["Location", row.location ? `📍 ${row.location}` : "—"],
  ];

  return (
    <>
      <Link to="/" className="btn btn-ghost" style={{ marginBottom: 24 }}>← Back to Gallery</Link>
      <div className="detail">
        <div className="detail-img">
          {row.image_url
            ? <img src={cloudinaryThumb(row.image_url, 1200)} alt={row.title || row.id} />
            : <div className="empty"><div className="big">🖼️</div></div>}
        </div>
        <div className="detail-info">
          <span className="id-badge" style={{ position: "static" }}>ID · {row.id}</span>
          <h1 style={{ marginTop: 14 }}>{row.title || "Unknown"}</h1>
          <p className="artist">by {row.artist || "Unknown Artist"}</p>
          <dl className="kv">
            {kv.map(([k, v]) => (
              <div key={k} style={{ display: "contents" }}>
                <dt>{k}</dt><dd>{v}</dd>
              </div>
            ))}
          </dl>
        </div>
      </div>
    </>
  );
}
