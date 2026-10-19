import { NavLink, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const ADMIN_TABS = [
  ["Dashboard", "/admin"],
  ["Inventory", "/admin/inventory"],
  ["Edit", "/admin/edit"],
  ["Import", "/admin/import"],
  ["QR Codes", "/admin/qr"],
  ["Labels", "/admin/labels"],
  ["Activity", "/admin/activity"],
  ["Locations", "/admin/batch-location"],
  ["Replace Image", "/admin/replace-image"],
];

export default function Layout({ children }) {
  const { admin, logout } = useAuth();
  const isAdmin = !!admin;
  const loc = useLocation();
  const navigate = useNavigate();
  const inAdmin = loc.pathname.startsWith("/admin") && loc.pathname !== "/admin/login";

  return (
    <>
      <header className="topnav">
        <div className="topnav-inner">
          <NavLink to="/" className="brand-link">
            <img src="/logo.webp" alt="ABC Art Gallery" />
            <div className="bt">
              <b>ABC Art Gallery</b>
              <span>Private Collection</span>
            </div>
          </NavLink>
          <nav className="nav-links">
            <NavLink to="/" end className={({ isActive }) => "nav-link keep" + (isActive ? " active" : "")}>Gallery</NavLink>
            <NavLink to="/artists" className={({ isActive }) => "nav-link" + (isActive ? " active" : "")}>Artists</NavLink>
            <NavLink to="/about" className={({ isActive }) => "nav-link" + (isActive ? " active" : "")}>About</NavLink>
            {isAdmin ? (
              <NavLink to="/admin" className={({ isActive }) => "nav-link" + (isActive || inAdmin ? " active" : "")}>Admin</NavLink>
            ) : (
              <NavLink to="/admin/login" className="nav-link nav-cta">Sign In</NavLink>
            )}
          </nav>
        </div>
      </header>
      <div className="page">
        {inAdmin && isAdmin && (
          <div className="admin-tabs">
            {ADMIN_TABS.map(([label, to]) => (
              <NavLink key={to} to={to} end={to === "/admin"}
                className={({ isActive }) => "nav-link" + (isActive ? " active" : "")}>
                {label}
              </NavLink>
            ))}
            <button className="nav-link" style={{ border: "none", background: "none", cursor: "pointer", font: "inherit" }}
              onClick={() => { logout(); navigate("/"); }}>
              Log out
            </button>
          </div>
        )}
        {children}
        <footer className="footer">
          <div className="footer-inner">
            <NavLink to="/" className="f-brand">
              <img src="/logo.webp" alt="ABC Art Gallery" />
              <div>
                <b>ABC Art Gallery</b>
                <span>Private Collection</span>
              </div>
            </NavLink>
            <div className="f-links">
              <NavLink to="/">Gallery</NavLink>
              <NavLink to="/artists">Artists</NavLink>
              <NavLink to="/about">About</NavLink>
            </div>
          </div>
          <div className="f-bottom">
            <span>A private collection of Myanmar fine art.</span>
            <span>© {new Date().getFullYear()} ABC Art Gallery</span>
          </div>
        </footer>
      </div>
    </>
  );
}
