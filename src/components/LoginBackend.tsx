import { useEffect } from "react";
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
  useEffect(() => {
    if (!payload) return;

    (async () => {
      try {
        // 1) siembra CSRF (opcional para login, pero por consistencia)
        await Api.get("/auth/csrf/");
        const csrf = getCookie("csrftoken");
        const headers = csrf ? { "X-CSRFToken": csrf } : undefined;

        // 2) body para login
        const body = {
          email: payload.email,
          password: payload.password,
        };

        const { data } = await Api.post<LoginSuccess>("/auth/login/", body, { headers });
        onDone({ ok: true, data });
      } catch (err: unknown) {
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
      }
    })();
  }, [payload, onDone]);

  return null;
}