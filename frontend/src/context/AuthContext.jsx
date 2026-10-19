import { createContext, useContext, useEffect, useState } from "react";
import { api } from "../api/client";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [admin, setAdmin] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.me()
      .then(() => setAdmin({ role: "admin" }))
      .catch(() => setAdmin(null))
      .finally(() => setLoading(false));
  }, []);

  async function login(password) {
    await api.login(password);
    setAdmin({ role: "admin" });
  }

  async function logout() {
    await api.logout().catch(() => {});
    setAdmin(null);
  }

  return (
    <AuthContext.Provider value={{ admin, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
