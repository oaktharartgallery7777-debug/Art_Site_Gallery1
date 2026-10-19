import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api/client";

export default function ArtistsPage() {
  const [artists, setArtists] = useState(null);

  useEffect(() => {
    api.artists().then(setArtists).catch(() => setArtists([]));
  }, []);

  return (
    <>
      <div className="page-head">
        <span className="eyebrow">The makers</span>
        <h1>Artists</h1>
        <p>{artists ? `${artists.length} artists` : "…"} represented in the collection.</p>
      </div>
      {!artists ? (
        <div className="spinner" />
      ) : artists.length === 0 ? (
        <div className="empty"><div className="big">👨‍🎨</div><p>No artists found.</p></div>
      ) : (
        <div className="artist-grid">
          {artists.map((a) => (
            <Link key={a.name} to={`/?artist=${encodeURIComponent(a.name)}`} className="artist-cell">
              <div className="a-img">
                <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "2.4rem", color: "#cfc9bb", background: "var(--bg-soft)" }}>👨‍🎨</div>
              </div>
              <h3 className="a-name">{a.name}</h3>
              <p className="a-count">{a.count} work{a.count === 1 ? "" : "s"}</p>
            </Link>
          ))}
        </div>
      )}
    </>
  );
}
