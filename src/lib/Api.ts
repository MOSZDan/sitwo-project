// src/lib/Api.ts

import axios, { AxiosHeaders } from "axios";
import type { AxiosInstance, Method, InternalAxiosRequestConfig } from "axios";

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

// --- 👇 SE AÑADEN ESTOS TIPOS PARA QUE PUEDAN SER USADOS EN OTROS ARCHIVOS ---
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
    recibir_notificaciones?: boolean; // Propiedad que añadimos
}
// --- FIN DE LOS TIPOS AÑADIDOS ---

export function getCookie(name: string): string | null {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()!.split(";").shift() ?? null;
  return null;
}

Api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const method = (config.method ?? "get").toLowerCase() as Method;
  if (method === "post" || method === "put" || method === "patch" || method === "delete") {
    const csrf = getCookie("csrftoken");
    if (csrf) {
      const hdrs = AxiosHeaders.from(config.headers);
      hdrs.set("X-CSRFToken", csrf);
      config.headers = hdrs;
    }
  }
  return config;
});

export async function seedCsrf(): Promise<void> {
  await Api.get("/auth/csrf/");
}

// --- 👇 FUNCIÓN CORREGIDA PARA USAR LA INSTANCIA GLOBAL 'Api' ---
export const updateUserSettings = async (settings: { recibir_notificaciones: boolean }, token: string) => {
  try {
    // Usamos la instancia 'Api' que ya está configurada, no creamos una nueva.
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