// src/pages/Perfil.tsx
import React, { useEffect, useMemo, useState } from "react";
import { verMiPerfil, editarMiPerfil, type Perfil } from "../services/Usuarios";

type FieldKey =
  | "nombre"
  | "apellido"
  | "correoelectronico"
  | "sexo"
  | "telefono"
  | "recibir_notificaciones";

const LABELS: Record<FieldKey, string> = {
  nombre: "Nombre",
  apellido: "Apellido",
  correoelectronico: "Correo electrónico",
  sexo: "Sexo",
  telefono: "Teléfono",
  recibir_notificaciones: "Recibir notificaciones",
};

const Pencil = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" width={16} height={16} {...props}>
    <path
      d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04a1 1 0 0 0 0-1.41l-2.34-2.34a1 1 0 0 0-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"
      fill="currentColor"
    />
  </svg>
);

export default function Perfil() {
  const [perfil, setPerfil] = useState<Perfil | null>(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const [editing, setEditing] = useState<null | { key: FieldKey; current: any }>(null);
  const [newValue, setNewValue] = useState<any>("");

  useEffect(() => {
    (async () => {
      try {
        const data = await verMiPerfil();
        setPerfil(data);
      } catch (e: any) {
        setErrorMsg(e?.message || "Error al cargar el perfil");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const fields: FieldKey[] = useMemo(
    () => ["nombre", "apellido", "correoelectronico", "sexo", "telefono", "recibir_notificaciones"],
    []
  );

  const openEdit = (key: FieldKey) => {
    if (!perfil) return;
    setEditing({ key, current: (perfil as any)[key] });
    setNewValue((perfil as any)[key] ?? (key === "recibir_notificaciones" ? false : ""));
  };

  const closeEdit = () => {
    setEditing(null);
    setNewValue("");
  };

  const confirmEdit = async () => {
    if (!editing) return;
    try {
      const payload: any = {};
      if (editing.key === "recibir_notificaciones") {
        payload[editing.key] = Boolean(newValue);
      } else if (editing.key === "sexo") {
        payload[editing.key] = newValue === "" ? null : newValue; // "M" | "F" | null
      } else {
        payload[editing.key] = newValue;
      }
      const updated = await editarMiPerfil(payload);
      setPerfil(updated);
      closeEdit();
    } catch (e: any) {
      alert(e?.message || "No se pudo actualizar");
    }
  };

  const pretty = (key: FieldKey, val: any) => {
    if (key === "recibir_notificaciones") return val ? "Sí" : "No";
    if (key === "sexo") return val || "—";
    return val ?? "—";
  };

  if (loading) return <div style={{ padding: 24 }}>Cargando…</div>;
  if (errorMsg) return <div style={{ padding: 24, color: "crimson" }}>{errorMsg}</div>;
  if (!perfil) return <div style={{ padding: 24 }}>Sin datos.</div>;

  return (
    <div style={{ maxWidth: 720, margin: "24px auto", padding: 16 }}>
      <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>Mi perfil</h1>
      <p style={{ color: "#6b7280", marginBottom: 20 }}>
        Código: <b>{perfil.codigo}</b> · Rol ID: <b>{perfil.idtipousuario}</b>
      </p>

      <div style={{ border: "1px solid #e5e7eb", borderRadius: 12, overflow: "hidden" }}>
        {fields.map((key, i) => (
          <div
            key={key}
            style={{
              display: "grid",
              gridTemplateColumns: "220px 1fr 32px",
              gap: 12,
              padding: "14px 16px",
              alignItems: "center",
              background: i % 2 ? "#fff" : "#fafafa",
              borderBottom: "1px solid #f1f5f9",
            }}
          >
            <div style={{ fontWeight: 600 }}>{LABELS[key]}</div>
            <div>{pretty(key, (perfil as any)[key])}</div>
            <button
              onClick={() => openEdit(key)}
              title="Editar"
              style={{
                width: 28, height: 28, display: "inline-flex", alignItems: "center", justifyContent: "center",
                borderRadius: 6, border: "1px solid #e5e7eb", background: "#fff", cursor: "pointer",
              }}
            >
              <Pencil />
            </button>
          </div>
        ))}
      </div>

      {/* Modal */}
      {editing && (
        <div
          onClick={closeEdit}
          style={{
            position: "fixed", inset: 0, background: "rgba(0,0,0,0.35)",
            display: "flex", alignItems: "center", justifyContent: "center", zIndex: 50,
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: "min(96vw, 520px)", background: "#fff", borderRadius: 12,
              boxShadow: "0 10px 15px -3px rgba(0,0,0,0.1), 0 4px 6px -2px rgba(0,0,0,0.05)",
              padding: 20,
            }}
          >
            <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 12 }}>
              Editar {LABELS[editing.key]}
            </h2>

            <div style={{ marginBottom: 10, color: "#6b7280" }}>
              Valor actual: <b>{pretty(editing.key, editing.current)}</b>
            </div>

            {editing.key === "recibir_notificaciones" ? (
              <label style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <input
                  type="checkbox"
                  checked={Boolean(newValue)}
                  onChange={(e) => setNewValue(e.target.checked)}
                />
                Activar
              </label>
            ) : editing.key === "sexo" ? (
              <select
                value={newValue ?? ""}
                onChange={(e) => setNewValue(e.target.value || null)}
                style={{ width: "100%", border: "1px solid #d1d5db", borderRadius: 8, padding: "10px 12px" }}
              >
                <option value="">— Sin especificar —</option>
                <option value="M">M</option>
                <option value="F">F</option>
              </select>
            ) : (
              <input
                type={editing.key === "correoelectronico" ? "email" : "text"}
                value={newValue ?? ""}
                onChange={(e) => setNewValue(e.target.value)}
                placeholder={`Nuevo ${LABELS[editing.key].toLowerCase()}`}
                style={{ width: "100%", border: "1px solid #d1d5db", borderRadius: 8, padding: "10px 12px" }}
              />
            )}

            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end", marginTop: 16 }}>
              <button
                onClick={closeEdit}
                style={{ padding: "10px 14px", borderRadius: 8, border: "1px solid #e5e7eb", background: "#fff" }}
              >
                Cancelar
              </button>
              <button
                onClick={confirmEdit}
                style={{ padding: "10px 14px", borderRadius: 8, border: "1px solid #2563eb", background: "#2563eb", color: "#fff" }}
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
