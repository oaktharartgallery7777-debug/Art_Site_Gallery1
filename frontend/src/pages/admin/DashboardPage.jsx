import { useEffect, useState } from "react";
import { api } from "../../api/client";

function Bars({ title, items }) {
  const max = Math.max(1, ...items.map(([, v]) => v));
  return (
    <div className="card">
      <h3>{title}</h3>
      {items.map(([k, v]) => (
        <div className="bar-row" key={k}>
          <span className="bl" title={k}>{k}</span>
          <div className="bar-track"><div className="bar-fill" style={{ width: `${(v / max) * 100}%` }} /></div>
          <span className="bv">{v}</span>
        </div>
      ))}
    </div>
  );
}

export default function DashboardPage() {
  const [d, setD] = useState(null);

  useEffect(() => {
    api.analytics().then(setD).catch(() => setD({ error: true }));
  }, []);

  if (!d) return <div className="spinner" />;
  if (d.error) return <div className="alert alert-error">Could not load analytics.</div>;

  const stats = [
    ["🎨", d.total_artworks, "Artworks"],
    ["👨‍🎨", d.total_artists, "Artists"],
    ["📍", d.total_locations, "Locations"],
    ["💰", d.purchased_count, "Sold"],
  ];

  return (
    <>
      <div className="page-head">
        <h1>Admin Dashboard</h1>
        <p>Collection overview and statistics</p>
        <div className="gold-rule" />
      </div>
      <div className="stat-row">
        {stats.map(([ico, n, l]) => (
          <div className="stat-card" key={l}>
            <p className="num">{ico} {n}</p>
            <p className="lbl">{l}</p>
          </div>
        ))}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 18 }}>
        <Bars title="Artworks per Artist" items={d.by_artist} />
        <Bars title="Medium Distribution" items={d.by_medium} />
        <Bars title="Artworks per Location" items={d.by_location} />
        <Bars title="Artworks by Year" items={d.by_year} />
      </div>
    </>
  );
}
