// src/services/Usuarios.ts
import { Api } from "../lib/Api.ts";

export type Usuario = {
  codigo: number;
  nombre: string;
  apellido: string;
  correoelectronico: string;
  telefono?: string | null;
  idtipousuario: number;
};

export type TipoUsuario = {
  identificacion: number;   // id del rol (1=admin, 2=paciente, etc.)
  rol: string;              // nombre del rol
  descripcion?: string;     // si tu backend devuelve "descripcion"
};

// Acepta ambos formatos de respuesta: array plano o paginado { results: [...] }
type ArrOrPaginated<T> = T[] | { results: T[] };

export async function buscarUsuarios(q: string = ""): Promise<Usuario[]> {
  const { data } = await Api.get<ArrOrPaginated<Usuario>>(
    "/api/usuarios/",
    { params: q ? { search: q } : undefined }
  );
  return Array.isArray(data) ? data : (data.results ?? []);
}

export async function listarTiposUsuario(): Promise<TipoUsuario[]> {
  const { data } = await Api.get<ArrOrPaginated<TipoUsuario>>("/api/tipos-usuario/");
  return Array.isArray(data) ? data : (data.results ?? []);
}

export async function cambiarRolPorCodigo(
  codigo: number,
  idtipousuario: number
): Promise<void> {
  await Api.patch(`/api/usuarios/${codigo}/`, { idtipousuario });
}

/* ===========================
   PERFIL (GET / PATCH propio)
   =========================== */

export type Perfil = {
  codigo: number;
  nombre: string;
  apellido: string;
  correoelectronico: string;
  sexo: "M" | "F" | null;
  telefono: string | null;
  idtipousuario: number;
  recibir_notificaciones: boolean;
};

/** GET /api/usuario/me */
export async function verMiPerfil(): Promise<Perfil> {
  const { data } = await Api.get("/usuario/me");
  return data;
}

/** PATCH /api/usuario/me (envía solo el/los campos a modificar) */
export async function editarMiPerfil(partial: Partial<Perfil>): Promise<Perfil> {
  const { data } = await Api.patch<Perfil>("/api/usuario/me", partial);
  return data;
}
