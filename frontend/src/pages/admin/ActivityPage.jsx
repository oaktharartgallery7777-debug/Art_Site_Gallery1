import { useEffect, useState } from "react";
import { api } from "../../api/client";

export default function ActivityPage() {
  const [data, setData] = useState(null);
  const [page, setPage] = useState(1);

  useEffect(() => {
    setData(null);
    api.activity(page)
      .then(setData)
      .catch(() => setData({ items: [], total: 0, total_pages: 1 }));
  }, [page]);

  return (
    <>
      <div className="page-head">
        <h1>Activity Log</h1>
        <p>Every change made to the collection</p>
        <div className="gold-rule" />
      </div>

      {!data ? <div className="spinner" /> : data.items.length === 0 ? (
        <div className="empty"><div className="big">📋</div><p>No activity recorded yet.</p></div>
      ) : (
        <>
          <div className="tbl-wrap">
            <table className="tbl">
              <thead><tr><th>When</th><th>Action</th><th>Artwork</th><th>Details</th></tr></thead>
              <tbody>
                {data.items.map((r, i) => (
                  <tr key={r.id || i}>
                    <td style={{ whiteSpace: "nowrap" }}>{r.timestamp ? new Date(r.timestamp).toLocaleString() : "—"}</td>
                    <td><span className="pill available">{r.action}</span></td>
                    <td style={{ color: "var(--gold-soft)" }}>{r.artwork_id || "—"}</td>
                    <td style={{ maxWidth: 420 }}>{r.details || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="pagination">
            <button className="btn btn-ghost" disabled={page <= 1} onClick={() => setPage(page - 1)}>← Prev</button>
            <span className="info">Page {page} / {data.total_pages} · {data.total} total</span>
            <button className="btn btn-ghost" disabled={page >= data.total_pages} onClick={() => setPage(page + 1)}>Next →</button>
          </div>
        </>
      )}
    </>
  );
}
