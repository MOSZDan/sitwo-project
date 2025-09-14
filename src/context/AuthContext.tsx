// src/context/AuthContext.tsx

import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { Api, type User, type Usuario } from "../lib/Api";

type UsuarioApp = {
    codigo: number;
    nombre: string;
    apellido: string;
    correoelectronico: string;
    idtipousuario: number;
    subtipo: string;
    recibir_notificaciones?: boolean;
};

type AuthState = {
    token: string | null;
    user: UsuarioApp | null;
    isAuth: boolean;
    loading: boolean;
    loginFromStorage: () => Promise<void>;
    refreshUser: () => Promise<void>;
    logout: () => void;
    adoptToken: (tk: string, preload?: { user?: User; usuario?: Usuario }) => Promise<void>;
    updateNotificationSetting: (newSetting: boolean) => void;
};

const AuthCtx = createContext<AuthState | undefined>(undefined);

export const AuthProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
    const [token, setToken] = useState<string | null>(null);
    const [user, setUser] = useState<UsuarioApp | null>(null);
    const [loading, setLoading] = useState(true);

    const logout = useCallback(() => {
        localStorage.removeItem("auth_token");
        localStorage.removeItem("user_data");
        delete (Api.defaults.headers as any).Authorization;
        setToken(null);
        setUser(null);
        setLoading(false);
    }, []);

    const loginFromStorage = async () => {
        const storedToken = localStorage.getItem("auth_token");
        const storedUser = localStorage.getItem("user_data");

        if (!storedToken || !storedUser) {
            setLoading(false);
            return;
        }

        setToken(storedToken);
        setUser(JSON.parse(storedUser));
        Api.defaults.headers.common["Authorization"] = `Token ${storedToken}`;

        try {
            await Api.get("/auth/user/");
        } catch {
            logout();
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loginFromStorage();
    }, []);

    const refreshUser = async () => {
        if (!token) return;
        try {
            const { data } = await Api.get<{ user: User; usuario: Usuario }>("/auth/user/");
            const fullUser: UsuarioApp = {
                codigo: data.usuario.codigo,
                nombre: data.usuario.nombre,
                apellido: data.usuario.apellido,
                correoelectronico: data.user.email,
                idtipousuario: data.usuario.idtipousuario,
                subtipo: data.usuario.subtipo,
                recibir_notificaciones: data.usuario.recibir_notificaciones
            };
            setUser(fullUser);
            localStorage.setItem("user_data", JSON.stringify(fullUser));
        } catch (e) {
            console.error("Failed to refresh user", e);
            logout();
        }
    };

    const adoptToken = async (tk: string, preload?: { user?: User; usuario?: Usuario }) => {
        setLoading(true);
        localStorage.setItem("auth_token", tk);
        setToken(tk);
        Api.defaults.headers.common["Authorization"] = `Token ${tk}`;

        if (preload?.user && preload.usuario) {
            const fullUser: UsuarioApp = {
                codigo: preload.usuario.codigo,
                nombre: preload.usuario.nombre,
                apellido: preload.usuario.apellido,
                correoelectronico: preload.user.email,
                idtipousuario: preload.usuario.idtipousuario,
                subtipo: preload.usuario.subtipo,
                recibir_notificaciones: preload.usuario.recibir_notificaciones
            };
            setUser(fullUser);
            localStorage.setItem("user_data", JSON.stringify(fullUser));
            setLoading(false);
        } else {
            try {
                await refreshUser();
            } finally {
                setLoading(false);
            }
        }
    };

    const updateNotificationSetting = useCallback((newSetting: boolean) => {
        setUser(currentUser => {
            if (!currentUser) return null;
            const updatedUser = { ...currentUser, recibir_notificaciones: newSetting };
            localStorage.setItem('user_data', JSON.stringify(updatedUser));
            return updatedUser;
        });
    }, []);

    const value: AuthState = useMemo(
        () => ({
            token,
            user,
            isAuth: !!token && !!user,
            loading,
            loginFromStorage,
            refreshUser,
            logout,
            adoptToken,
            updateNotificationSetting
        }),
        [token, user, loading, updateNotificationSetting, logout]
    );

    return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
};

export const useAuth = (): AuthState => {
    const ctx = useContext(AuthCtx);
    if (!ctx) {
        // Esto previene errores si se usa fuera del provider, devolviendo un estado "vacío" funcional.
        return {
            token: null,
            user: null,
            isAuth: false,
            loading: true, // true para que los componentes esperen
            loginFromStorage: async () => {},
            refreshUser: async () => {},
            logout: () => {},
            adoptToken: async () => {},
            updateNotificationSetting: () => {},
        };
    }
    return ctx;
};
