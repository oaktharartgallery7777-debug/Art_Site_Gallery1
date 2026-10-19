import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function RequireAdmin({ children }) {
  const { admin, loading } = useAuth();
  if (loading) return <div className="spinner" />;
  if (!admin) return <Navigate to="/admin/login" replace />;
  return children;
}
