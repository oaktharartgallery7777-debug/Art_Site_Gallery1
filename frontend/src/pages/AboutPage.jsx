import { Link } from "react-router-dom";

export default function AboutPage() {
  return (
    <>
      <div className="about-hero">
        <span className="eyebrow">About the gallery</span>
        <h1>ABC Art Gallery</h1>
        <p>
          A private collection of Myanmar fine art — hundreds of works by dozens of artists,
          gathered over the years and preserved at home. This digital catalogue keeps every
          piece documented, searchable, and beautifully presented in one place.
        </p>
      </div>
      <div className="about-grid">
        <div className="about-card">
          <div className="ico">🎨</div>
          <h3>The Collection</h3>
          <p>Paintings across mediums and eras, each catalogued with its story — artist, year, medium, and when it joined the collection.</p>
        </div>
        <div className="about-card">
          <div className="ico">👨‍🎨</div>
          <h3>The Artists</h3>
          <p>Works by Myanmar artists, from established names to emerging talents — browse the full roster on the Artists page.</p>
        </div>
        <div className="about-card">
          <div className="ico">🏛️</div>
          <h3>Not for Sale</h3>
          <p>This is a private collection, not a shop. Every piece is kept at home and shown here for appreciation and record-keeping.</p>
        </div>
      </div>
      <div style={{ textAlign: "center", marginBottom: 20 }}>
        <Link to="/" className="btn btn-dark">Browse the Collection</Link>
      </div>
    </>
  );
}
