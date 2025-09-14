// src/lib/Api.ts
import axios, { AxiosHeaders } from "axios";
import type {
  AxiosInstance,
  Method,
  InternalAxiosRequestConfig,
} from "axios";

const DEFAULT_RENDER_BASE = "https://sitwo-project-backend-vzq2.onrender.com";

const baseURL: string = import.meta.env.DEV
  ? "/api" // DEV: Vite proxy -> http://localhost:8000
  : `${(
      (import.meta.env.VITE_API_BASE as string | undefined) ?? DEFAULT_RENDER_BASE
    ).replace(/\/$/, "")}/api`;

export const Api: AxiosInstance = axios.create({
  baseURL,
  withCredentials: true,
});

export interface User {
    id: number;
    email: string;
    first_name: string;
    last_name: string;
}

export interface Usuario {
    codigo: number;
    nombre: string;
    apellido: string;
    subtipo: string;
    idtipousuario: number;
    recibir_notificaciones?: boolean;
}

export function getCookie(name: string): string | null {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()!.split(";").shift() ?? null;
  return null;
}

/** Adjunta X-CSRFToken en POST/PUT/PATCH/DELETE (Axios v1-safe) */
Api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const method = (config.method ?? "get").toLowerCase() as Method;
  if (method === "post" || method === "put" || method === "patch" || method === "delete") {
    const csrf = getCookie("csrftoken");
    if (csrf) {
      // Normaliza lo que haya en headers a AxiosHeaders y setea el token
      const hdrs = AxiosHeaders.from(config.headers);
      hdrs.set("X-CSRFToken", csrf);
      config.headers = hdrs; // tipo compatible
    }
  }
  return config;
});

/** (Opcional) Sembrar CSRF explícitamente antes de un POST */
export async function seedCsrf(): Promise<void> {
  await Api.get("/auth/csrf/");
}

export const updateUserSettings = async (settings: { recibir_notificaciones: boolean }, token: string) => {
  try {
    // Usamos la instancia 'Api' que ya está configurada globalmente
    const response = await Api.patch('/auth/user/settings/', settings, {
      headers: {
        'Authorization': `Token ${token}`
      }
    });
    return response.data;
  } catch (error) {
    console.error("Error al actualizar las preferencias:", error);
    throw error;
  }
};