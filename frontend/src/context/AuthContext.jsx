import { createContext, useContext, useMemo, useState } from "react";
import api from "../lib/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem("agrotrack_token"));

  const value = useMemo(() => {
    const isAuthenticated = Boolean(token);

    async function login(username, password) {
      const res = await api.post("/api/auth/login", { username, password });
      const t = res?.data?.data?.token;
      if (!t) throw new Error(res?.data?.message || "Login falló");
      localStorage.setItem("agrotrack_token", t);
      setToken(t);
      return t;
    }

    async function register(userData) {
      const res = await api.post("/api/auth/register", userData);
      const t = res?.data?.data?.token;
      if (!t) throw new Error(res?.data?.message || "Registro falló");
      localStorage.setItem("agrotrack_token", t);
      setToken(t);
      return t;
    }

    function logout() {
      localStorage.removeItem("agrotrack_token");
      setToken(null);
    }

    return { token, isAuthenticated, login, register, logout };
  }, [token]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth debe usarse dentro de AuthProvider");
  return ctx;
}

