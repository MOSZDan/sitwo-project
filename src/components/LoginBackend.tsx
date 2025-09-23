// src/components/LoginBackend.tsx
import { useEffect, useRef } from "react";
import { Api, getCookie } from "../lib/Api";
import axios, { AxiosError } from "axios";

export type LoginPayload = {
  email: string;
  password: string;
};

export type LoginSuccess = {
  ok: boolean;
  message: string;
  token: string;
  user: {
    id: number;
    email: string;
    first_name: string;
    last_name: string;
    is_active: boolean;
  };
  usuario: {
    codigo: number;
    nombre: string;
    apellido: string;
    telefono: string | null;
    sexo: string | null;
    subtipo: "paciente" | "odontologo" | "recepcionista" | "administrador";
    idtipousuario: number;
  };
};

export type LoginError = {
  status?: number;
  detail?: string;
  fields?: Record<string, string>;
};

type Props = {
  /** Cuando pase de null a objeto, se dispara el login */
  payload: LoginPayload | null;
  onDone: (
      result:
          | { ok: true; data: LoginSuccess }
          | { ok: false; error: LoginError }
  ) => void;
};

/** Componente "backend" (sin UI): hace login real a /auth/login/ */
export default function LoginBackend({ payload, onDone }: Props): null {
  const isProcessingRef = useRef(false);
  const lastPayloadRef = useRef<LoginPayload | null>(null);

  useEffect(() => {
    // Guard 1: No hay payload
    if (!payload) {
      console.log("LoginBackend: No payload");
      return;
    }

    // Guard 2: Ya está procesando
    if (isProcessingRef.current) {
      console.log("LoginBackend: Ya procesando, ignorando...");
      return;
    }

    // Guard 3: Mismo payload que antes (evitar duplicados)
    if (lastPayloadRef.current &&
        lastPayloadRef.current.email === payload.email &&
        lastPayloadRef.current.password === payload.password) {
      console.log("LoginBackend: Mismo payload, ignorando duplicado");
      return;
    }

    console.log("LoginBackend: Procesando login para", payload.email);
    isProcessingRef.current = true;
    lastPayloadRef.current = payload;

    (async () => {
      try {
        // 1) siembra CSRF (opcional para login, pero por consistencia)
        console.log("LoginBackend: Obteniendo CSRF token...");
        await Api.get("/auth/csrf/");
        const csrf = getCookie("csrftoken");
        const headers = csrf ? { "X-CSRFToken": csrf } : undefined;

        // 2) body para login
        const body = {
          email: payload.email,
          password: payload.password,
        };

        console.log("LoginBackend: Enviando request de login...");
        const { data } = await Api.post<LoginSuccess>("/auth/login/", body, { headers });

        console.log("LoginBackend: Login exitoso");
        onDone({ ok: true, data });

      } catch (err: unknown) {
        console.log("LoginBackend: Error en login", err);
        const error: LoginError = {};
        if (axios.isAxiosError(err)) {
          const ax = err as AxiosError<Record<string, unknown>>;
          error.status = ax.response?.status;

          const d = ax.response?.data;
          if (d) {
            error.detail = typeof d["detail"] === "string" ? (d["detail"] as string) : undefined;
            const fields: Record<string, string> = {};
            Object.keys(d).forEach((k) => {
              if (k === "detail") return;
              const v = d[k];
              if (Array.isArray(v)) fields[k] = (v as unknown[]).join(" ");
              else if (typeof v === "string") fields[k] = v;
            });
            if (Object.keys(fields).length) error.fields = fields;
          } else {
            error.detail = ax.message;
          }
        } else {
          error.detail = "Error desconocido";
        }
        onDone({ ok: false, error });
      } finally {
        // Liberar el flag después de un pequeño delay para evitar race conditions
        setTimeout(() => {
          isProcessingRef.current = false;
          console.log("LoginBackend: Proceso completado");
        }, 100);
      }
    })();
  }, [payload, onDone]);

  return null;
}