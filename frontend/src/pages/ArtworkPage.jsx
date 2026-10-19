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
  const [lightbox, setLightbox] = useState(false);

  useEffect(() => {
    if (!id) { setMissing(true); return; }
    api.painting(id).then(setRow).catch(() => setMissing(true));
  }, [id]);

  useEffect(() => {
    if (!lightbox) return;
    function onKey(e) { if (e.key === "Escape") setLightbox(false); }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [lightbox]);

  if (missing) {
    return (
      <div className="empty">
        <div className="big">🔍</div>
        <h2 className="serif" style={{ fontSize: "1.8rem" }}>Artwork Not Found</h2>
        <p>The artwork you scanned could not be located in our collection.</p>
        <Link to="/" className="btn btn-dark" style={{ marginTop: 20 }}>Back to Gallery</Link>
      </div>
    );
  }

  if (!row) return <div className="spinner" />;

  const facts = [
    ["Artwork ID", row.id],
    ["Medium", row.medium || "—"],
    ["Dimensions", dimText(row) || "—"],
    ["Year", row.draw_year || "—"],
    ["Acquired", acquiredText(row)],
    ["Location", row.location || "—"],
  ];

  return (
    <>
      <div className="artwork-detail">
        <div className="detail-img" onClick={() => row.image_url && setLightbox(true)}
          title={row.image_url ? "Click to enlarge" : ""}>
          {row.image_url
            ? <img src={cloudinaryThumb(row.image_url, 1400)} alt={row.title || row.id} />
            : <div className="empty"><div className="big">🖼️</div></div>}
        </div>
        <div className="detail-info">
          <span className="eyebrow">From the collection</span>
          <h1>{row.title || "Untitled"}</h1>
          <p className="d-artist">{row.artist || "Unknown Artist"}</p>
          <dl className="detail-facts">
            {facts.map(([k, v]) => (
              <div className="fr" key={k}>
                <dt>{k}</dt><dd>{v}</dd>
              </div>
            ))}
          </dl>
          <div className="detail-actions">
            <Link to="/" className="btn btn-outline">← Gallery</Link>
            <Link to={`/artists`} className="btn btn-dark">More by this artist</Link>
          </div>
          <p style={{ color: "var(--text-faint)", fontSize: "0.8rem", marginTop: 24 }}>
            Part of the ABC Art Gallery private collection. This work is not for sale.
          </p>
        </div>
      </div>

      {lightbox && row.image_url && (
        <div className="lightbox" onClick={() => setLightbox(false)}>
          <span className="close-hint">ESC / CLICK TO CLOSE</span>
          <img src={row.image_url} alt={row.title || row.id} onClick={(e) => e.stopPropagation()} />
        </div>
      )}
    </>
  );
}
