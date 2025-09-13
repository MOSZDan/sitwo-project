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
    "/usuarios/",
    { params: q ? { search: q } : undefined }
  );
  return Array.isArray(data) ? data : (data.results ?? []);
}

export async function listarTiposUsuario(): Promise<TipoUsuario[]> {
  const { data } = await Api.get<ArrOrPaginated<TipoUsuario>>("/tipos-usuario/");
  return Array.isArray(data) ? data : (data.results ?? []);
}

export async function cambiarRolPorCodigo(
  codigo: number,
  idtipousuario: number
): Promise<void> {
  await Api.patch(`/usuarios/${codigo}/`, { idtipousuario });
}

