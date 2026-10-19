import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const PUBLIC_LINKS = [{ to: "/", label: "Gallery", ico: "🖼️" }];

const ADMIN_LINKS = [
  { to: "/admin", label: "Dashboard", ico: "📊" },
  { to: "/admin/inventory", label: "Inventory", ico: "🎨" },
  { to: "/admin/edit", label: "Edit Artwork", ico: "⚙️" },
  { to: "/admin/import", label: "Bulk Import", ico: "📥" },
  { to: "/admin/qr", label: "QR Generator", ico: "🔳" },
  { to: "/admin/labels", label: "Print Labels", ico: "🖨️" },
  { to: "/admin/batch-location", label: "Batch Location", ico: "🔁" },
  { to: "/admin/replace-image", label: "Replace Image", ico: "🖼️" },
  { to: "/admin/activity", label: "Activity Log", ico: "📋" },
];

export default function Layout({ children }) {
  const { admin, logout } = useAuth();
  const navigate = useNavigate();

  async function handleLogout() {
    await logout();
    navigate("/");
  }

  return (
    <div className="shell">
      <aside className="sidebar">
        <Link to="/" style={{ textDecoration: "none" }}>
          <div className="brand">
            <img src="/logo.webp" alt="ABC Art Gallery" style={{ width: 44, height: 44, borderRadius: 12 }} />
            <div>
              <h2>ABC Art Gallery</h2>
              <p>Art Collection</p>
            </div>
          </div>
        </Link>

        <div className="nav-label">Explore</div>
        {PUBLIC_LINKS.map((l) => (
          <NavLink key={l.to} to={l.to} end className={({ isActive }) => "nav-link" + (isActive ? " active" : "")}>
            <span className="ico">{l.ico}</span> {l.label}
          </NavLink>
        ))}

        <div className="nav-label">Administration</div>
        {admin ? (
          <>
            {ADMIN_LINKS.map((l) => (
              <NavLink key={l.to} to={l.to} end={l.to === "/admin"} className={({ isActive }) => "nav-link" + (isActive ? " active" : "")}>
                <span className="ico">{l.ico}</span> {l.label}
              </NavLink>
            ))}
            <button onClick={handleLogout} className="nav-link" style={{ width: "100%", background: "none", border: "none", cursor: "pointer", fontFamily: "inherit", fontSize: "0.9rem", fontWeight: 500 }}>
              <span className="ico">🚪</span> Logout
            </button>
          </>
        ) : (
          <NavLink to="/admin/login" className={({ isActive }) => "nav-link" + (isActive ? " active" : "")}>
            <span className="ico">🔐</span> Admin Login
          </NavLink>
        )}
      </aside>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div className="mobile-topbar">
          <Link to="/" style={{ textDecoration: "none", fontWeight: 700 }}>🎨 ABC Art Gallery</Link>
          {admin ? (
            <button onClick={handleLogout} className="btn btn-ghost" style={{ padding: "7px 14px", fontSize: "0.78rem" }}>Logout</button>
          ) : (
            <Link to="/admin/login" className="btn btn-ghost" style={{ padding: "7px 14px", fontSize: "0.78rem" }}>Login</Link>
          )}
        </div>
        <main className="main">{children}</main>
      </div>
    </div>
  );
}
