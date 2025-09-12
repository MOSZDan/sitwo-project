// src/context/AuthContext.tsx
import React, {createContext, useContext, useEffect, useMemo, useState} from "react";
import {Api} from "../lib/Api";

type UsuarioApp = {
    codigo: number;
    nombre: string;
    apellido: string;
    correoelectronico: string;
    idtipousuario: number;
};

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

export const AuthProvider: React.FC<React.PropsWithChildren> = ({children}) => {
    const [token, setToken] = useState<string | null>(null);
    const [user, setUser] = useState<UsuarioApp | null>(null);
    const [loading, setLoading] = useState(true);

    // src/context/AuthContext.tsx

    const loginFromStorage = async () => {
        // 1. Obtenemos tanto el token como los datos del usuario del storage.
        const storedToken = localStorage.getItem("auth_token");
        const storedUser = localStorage.getItem("user_data");

        // 2. Si falta alguno de los dos, no hay sesión válida.
        if (!storedToken || !storedUser) {
            setLoading(false);
            return;
        }

        // 3. ESTA ES LA PARTE CLAVE:
        // Establecemos el estado de la aplicación INMEDIATAMENTE con los datos guardados.
        // Así, la interfaz carga al instante con el perfil de paciente correcto.
        setToken(storedToken);
        setUser(JSON.parse(storedUser));
        Api.defaults.headers.common["Authorization"] = `Token ${storedToken}`;

        // 4. Ahora, en segundo plano, validamos que el token siga siendo activo en el backend.
        try {
            // Hacemos la llamada, no para obtener los datos (ya los tenemos), sino para verificar.
            await Api.get<UsuarioApp>("/auth/user/");
            // Si la llamada tiene éxito, perfecto. No necesitamos hacer nada más.
        } catch {
            // 5. Si la llamada falla (ej. el token expiró), entonces borramos todo.
            // Esto mantiene la lógica de seguridad de tu función original.
            localStorage.removeItem("auth_token");
            localStorage.removeItem("user_data");
            delete (Api.defaults.headers as any).Authorization;
            setToken(null);
            setUser(null);
        } finally {
            // 6. Al final de todo el proceso, terminamos la carga.
            setLoading(false);
        }
    };

    useEffect(() => {
        loginFromStorage();
    }, []);

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
            setUser(preload.user);
            setLoading(false); // pinta inmediatamente el nombre
        } else {
            try {
                // aún así refrescamos para asegurar consistencia
                await refreshUser();
            } finally {
                setLoading(false);
            }
        }
    };

    const value: AuthState = useMemo(
        () => ({token, user, isAuth: !!token && !!user, loading, loginFromStorage, refreshUser, logout, adoptToken}),
        [token, user, loading]
    );

    return <AuthCtx.Provider value={value}>{children}</AuthCtx.Provider>;
};

export const useAuth = (): AuthState => {
    const ctx = useContext(AuthCtx);
    if (ctx) return ctx;
    return {
        token: null, user: null, isAuth: false, loading: false,
        loginFromStorage: async () => {
        }, refreshUser: async () => {
        },
        logout: () => {
        }, adoptToken: async () => {
        },
    };
};
