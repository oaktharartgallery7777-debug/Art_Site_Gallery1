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
    ["Artist", row.artist || "Unknown"],
    ["Medium", row.medium || "—"],
    ["Dimensions", dimText(row)],
    ["Year", row.draw_year || "—"],
    ["Acquired", acquiredText(row)],
    ["Location", row.location ? `📍 ${row.location}` : "—"],
  ];

  return (
    <>
      <Link to="/" className="btn btn-ghost" style={{ marginBottom: 24 }}>← Back to Gallery</Link>
      <div className="detail">
        <div>
          <div className="detail-img zoomable" onClick={() => row.image_url && setLightbox(true)}
            title={row.image_url ? "Click to enlarge" : ""}>
            {row.image_url
              ? <img src={cloudinaryThumb(row.image_url, 1200)} alt={row.title || row.id} />
              : <div className="empty"><div className="big">🖼️</div></div>}
          </div>
          {row.image_url && (
            <p style={{ color: "var(--text-faint)", fontSize: "0.78rem", marginTop: 10, textAlign: "center" }}>
              🔍 Click the image to view fullscreen
            </p>
          )}
        </div>
        <div>
          <div className="plaque">
            <h2>{row.title || "Unknown"}</h2>
            <p className="p-artist">{row.artist || "Unknown Artist"}</p>
            <dl>
              {kv.map(([k, v]) => (
                <div key={k} style={{ display: "contents" }}>
                  <dt>{k}</dt><dd>{v}</dd>
                </div>
              ))}
            </dl>
          </div>
          <p style={{ color: "var(--text-faint)", fontSize: "0.82rem", marginTop: 18, lineHeight: 1.6 }}>
            ID · {row.id} — part of the ABC Art Gallery private collection.
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
