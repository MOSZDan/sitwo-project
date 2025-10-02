// src/lib/Api.ts
import axios, { AxiosHeaders } from "axios";
import type { AxiosInstance, Method, InternalAxiosRequestConfig } from "axios";

const DEFAULT_RENDER_BASE = "https://sitwo-project-backend-vzq2.onrender.com";
    //"http://127.0.0.1:8000/" ;

const baseURL: string = import.meta.env.DEV
    ? "http://127.0.0.1:8000/api" // DEV: Vite proxy -> http://localhost:8000
    : `${(
        (import.meta.env.VITE_API_BASE as string | undefined) ?? DEFAULT_RENDER_BASE
    ).replace(/\/$/, "")}/api`;

export const Api: AxiosInstance = axios.create({
  baseURL,
  withCredentials: true,
});

// --- Tipos exportados para reutilizar en otros archivos ---
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
// --- Fin tipos ---

export function getCookie(name: string): string | null {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) return parts.pop()!.split(";").shift() ?? null;
  return null;
}

// 👉 Helper para saber si una URL es absoluta (no la tocamos en ese caso)
function isAbsoluteUrl(u: string): boolean {
  return /^https?:\/\//i.test(u);
}

// 👉 Interceptor: normaliza URL para evitar doble "/api" y agrega CSRF en métodos mutantes
Api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  // --- Normalización anti "/api/api/..." ---
  if (typeof config.url === "string" && !isAbsoluteUrl(config.url)) {
    const base = String(config.baseURL ?? Api.defaults.baseURL ?? "");
    let url = config.url;

    // Asegura slash inicial en rutas relativas
    if (!url.startsWith("/")) url = `/${url}`;

    // Si base termina en "/api" y la url empieza con "/api/", quita el prefijo duplicado
    if (base.endsWith("/api") && url.startsWith("/api/")) {
      url = url.replace(/^\/api\/+/, "/"); // "/api/usuario/me" -> "/usuario/me"
    }

    config.url = url;
  }

  // --- CSRF para métodos que lo requieren ---
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

// 🆗 Usa la instancia global 'Api' (no crea otra)
export const updateUserSettings = async (settings: { recibir_notificaciones: boolean }, token: string) => {
  try {
    const response = await Api.patch("/auth/user/settings/", settings, {
      headers: { Authorization: `Token ${token}` },
    });
    return response.data;
  } catch (error) {
    console.error("Error al actualizar las preferencias:", error);
    throw error;
  }
};

/**
 * Cancela una cita específica.
 * @param consultaId El ID de la consulta a cancelar.
 * @param motivo Motivo de cancelación (opcional).
 */
export const cancelarCita = async (consultaId: number, motivo?: string): Promise<void> => {
  try {
    await Api.post(`/consultas/${consultaId}/cancelar/`, {
      motivo_cancelacion: motivo || ''
    });
  } catch (error) {
    console.error(`Error al cancelar la cita ${consultaId}:`, error);
    throw error;
  }
};

/**
 * Reprograma una cita a una nueva fecha y horario.
 * @param consultaId El ID de la consulta a reprogramar.
 * @param nuevaFecha La nueva fecha en formato 'YYYY-MM-DD'.
 * @param nuevoHorarioId El ID del nuevo horario.
 */
export const reprogramarCita = async (consultaId: number, nuevaFecha: string, nuevoHorarioId: number) => {
  try {
    const response = await Api.post(`/consultas/${consultaId}/reprogramar/`, {
      fecha: nuevaFecha,
      idhorario: nuevoHorarioId,
    });
    return response.data;
  } catch (error) {
    console.error(`Error al reprogramar la cita ${consultaId}:`, error);
    throw error;
  }
};

/**
 * Obtiene horarios disponibles para una fecha y odontólogo específicos.
 * @param fecha La fecha en formato 'YYYY-MM-DD'.
 * @param odontologoId El ID del odontólogo.
 */
export const obtenerHorariosDisponibles = async (fecha: string, odontologoId: number) => {
  try {
    const response = await Api.get(`/horarios-disponibles/?fecha=${fecha}&odontologo_id=${odontologoId}`);
    return response.data;
  } catch (error) {
    console.error('Error al obtener horarios disponibles:', error);
    throw error;
  }
};