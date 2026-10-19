import { useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function LoginPage() {
  const { admin, login } = useAuth();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  if (admin) return <Navigate to="/admin" replace />;

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      await login(password);
      navigate("/admin");
    } catch {
      setError("Incorrect password. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="login-wrap">
      <form className="login-card" onSubmit={submit}>
        <div className="brand-mark" style={{ margin: "0 auto", width: 56, height: 56, fontSize: 30 }}>🔐</div>
        <h1>Admin Login</h1>
        <p>This section requires administrator access.</p>
        {error && <div className="alert alert-error">{error}</div>}
        <input
          className="input"
          type="password"
          placeholder="Enter admin password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoFocus
          style={{ marginBottom: 16, textAlign: "center" }}
        />
        <button className="btn btn-gold" style={{ width: "100%" }} disabled={busy || !password}>
          {busy ? "Checking…" : "Login"}
        </button>
      </form>
    </div>
  );
}
