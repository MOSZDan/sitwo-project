// src/context/AuthContext.tsx
import React, { createContext, useContext, useEffect, useMemo, useState } from "react";
import { Api } from "../lib/Api";

type UsuarioApp = { id: number; email: string; first_name?: string; last_name?: string };

type AuthState = {
  token: string | null;
  user: UsuarioApp | null;
  isAuth: boolean;
  loading: boolean;
  loginFromStorage: () => Promise<void>;
  refreshUser: () => Promise<void>;
  logout: () => void;
  adoptToken: (tk: string, preload?: { user?: any; usuario?: any }) => Promise<void>;
};

const AuthCtx = createContext<AuthState | undefined>(undefined);

export const AuthProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<UsuarioApp | null>(null);
  const [loading, setLoading] = useState(true);

  const loginFromStorage = async () => {
    const stored = localStorage.getItem("auth_token");
    if (!stored) { setLoading(false); return; }
    setToken(stored);
    Api.defaults.headers.common["Authorization"] = `Token ${stored}`;
    try {
      const r = await Api.get<UsuarioApp>("/auth/user/");
      setUser(r.data);
    } catch {
      localStorage.removeItem("auth_token");
      localStorage.removeItem("user_data");
      delete (Api.defaults.headers as any).Authorization;
      setToken(null);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loginFromStorage(); }, []);

  const refreshUser = async () => {
    if (!token) return;
    const r = await Api.get<UsuarioApp>("/auth/user/");
    setUser(r.data);
  };

  const logout = () => {
    localStorage.removeItem("auth_token");
    localStorage.removeItem("user_data");
    delete (Api.defaults.headers as any).Authorization;
    setToken(null);
    setUser(null);
    setLoading(false);
  };

  // ✅ Bloquea mientras adopta y precarga user si viene en la respuesta de login
  const adoptToken = async (tk: string, preload?: { user?: any; usuario?: any }) => {
    setLoading(true);
    localStorage.setItem("auth_token", tk);
    setToken(tk);
    Api.defaults.headers.common["Authorization"] = `Token ${tk}`;

    if (preload?.user) {
      setUser(preload.user); // pinta inmediatamente el nombre
    }
    try {
      // aún así refrescamos para asegurar consistencia
      await refreshUser();
    } finally {
      setLoading(false);
    }
  };

  const value: AuthState = useMemo(
    () => ({ token, user, isAuth: !!token && !!user, loading, loginFromStorage, refreshUser, logout, adoptToken }),
    [token, user, loading]
  );

  return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
};

export const useAuth = (): AuthState => {
  const ctx = useContext(AuthCtx);
  if (ctx) return ctx;
  return {
    token: null, user: null, isAuth: false, loading: false,
    loginFromStorage: async () => {}, refreshUser: async () => {},
    logout: () => {}, adoptToken: async () => {},
  };
};
