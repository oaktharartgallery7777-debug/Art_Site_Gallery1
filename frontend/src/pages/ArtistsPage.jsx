import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api/client";
import { useAuth } from "../context/AuthContext";
import { cloudinaryThumb } from "../utils/images";

export default function ArtistsPage() {
  const { admin } = useAuth();
  const [artists, setArtists] = useState(null);
  const [uploading, setUploading] = useState(null);
  const [failed, setFailed] = useState({});

  function load() {
    api.artists().then(setArtists).catch(() => setArtists([]));
  }
  useEffect(load, []);

  async function onFile(name, file) {
    if (!file) return;
    setUploading(name);
    try {
      await api.uploadArtistPhoto(name, file);
      await load();
    } catch (e) {
      alert("Upload failed: " + (e.message || "unknown error"));
    } finally {
      setUploading(null);
    }
  }

  async function removePhoto(name) {
    if (!window.confirm(`Remove the photo for ${name}?`)) return;
    try {
      await api.deleteArtistPhoto(name);
      await load();
    } catch (e) {
      alert("Failed: " + (e.message || "unknown error"));
    }
  }

  return (
    <>
      <div className="page-head">
        <span className="eyebrow">The makers</span>
        <h1>Artists</h1>
        <p>
          {artists ? `${artists.length} artists` : "…"} represented in the collection.
          {admin && " Hover a card to upload a photo."}
        </p>
      </div>
      {!artists ? (
        <div className="spinner" />
      ) : artists.length === 0 ? (
        <div className="empty"><div className="big">👨‍🎨</div><p>No artists found.</p></div>
      ) : (
        <div className="artist-grid">
          {artists.map((a) => (
            <div key={a.name} className="artist-cell-wrap">
              <Link to={`/?artist=${encodeURIComponent(a.name)}`} className="artist-cell">
                <div className="a-img">
                  {a.photo_url && !failed[a.name] ? (
                    <img src={cloudinaryThumb(a.photo_url, 400)} alt={a.name}
                      onError={() => setFailed((f) => ({ ...f, [a.name]: true }))} />
                  ) : (
                    <div style={{ width: "100%", height: "100%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "2.4rem", color: "#cfc9bb", background: "var(--bg-soft)" }}>👨‍🎨</div>
                  )}
                  {uploading === a.name && <div className="a-uploading">Uploading…</div>}
                </div>
                <h3 className="a-name">{a.name}</h3>
                <p className="a-count">{a.count} work{a.count === 1 ? "" : "s"}</p>
              </Link>
              {admin && (
                <div className="a-admin-actions">
                  <label className="a-upload-btn" title="Upload artist photo">
                    📷 Photo
                    <input type="file" accept="image/*" hidden
                      onChange={(e) => { onFile(a.name, e.target.files[0]); e.target.value = ""; }} />
                  </label>
                  {a.photo_url && (
                    <button className="a-remove-btn" onClick={() => removePhoto(a.name)} title="Remove photo">✕</button>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </>
  );
}
