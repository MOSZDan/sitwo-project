// src/components/RegisterPatientForm.tsx
import { useCallback, useMemo, useState } from "react";
import RegisterPatientBackend from "../components/RegisterPatientBackend";
import { Toaster, toast } from "react-hot-toast";
import Logo from "../assets/logo.png";

import type {
  RegisterPatientPayload,
  RegisterSuccess,
  RegisterError,
} from "../components/RegisterPatientBackend";

export default function RegisterPatientForm(): JSX.Element {
  const [sending, setSending] = useState<boolean>(false);
  const [payload, setPayload] = useState<RegisterPatientPayload | null>(null);

  const defaultDate = useMemo<string>(() => {
    const d = new Date();
    d.setFullYear(d.getFullYear() - 18);
    return d.toISOString().slice(0, 10);
  }, []);

  const onDone = useCallback(
    (result: { ok: true; data: RegisterSuccess } | { ok: false; error: RegisterError }) => {
      setSending(false);

      if (result.ok) {
        toast.dismiss();
        toast.success(result.data.message || "Cuenta creada correctamente.");
        (document.getElementById("form-register-patient") as HTMLFormElement | null)?.reset();
      } else {
        const detail = result.error.detail || "No se pudo crear la cuenta.";
        const fieldMsg = result.error.fields
          ? " " +
            Object.entries(result.error.fields)
              .map(([k, v]) => `${k}: ${v}`)
              .join(" • ")
          : "";
        toast.dismiss();
        toast.error(detail + fieldMsg);
      }

      setPayload(null);
    },
    []
  );

  function handleSubmit(e: React.FormEvent<HTMLFormElement>): void {
    e.preventDefault();

    const f = new FormData(e.currentTarget);

    const p: RegisterPatientPayload = {
      email: String(f.get("email") ?? "").trim(),
      password: String(f.get("password") ?? ""),
      nombre: String(f.get("nombre") ?? "").trim(),
      apellido: String(f.get("apellido") ?? "").trim(),
      telefono: String(f.get("telefono") ?? "").trim(),
      sexo: String(f.get("sexo") ?? "").trim(), // "M" o "F"
      direccion: String(f.get("direccion") ?? "").trim(),
      fechanacimiento: String(f.get("fechanacimiento") ?? ""),
      carnetidentidad: String(f.get("carnetidentidad") ?? "").trim(),
    };

    if (!p.email || !p.password || !p.sexo || !p.direccion || !p.fechanacimiento || !p.carnetidentidad) {
      toast.error("Completa todos los campos obligatorios.");
      return;
    }

    // Toast de “procesando”
    toast.loading("Creando cuenta…");
    setSending(true);
    setPayload(p);
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 to-cyan-50 flex items-center justify-center p-4">
      {/* Toaster local a este componente */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3500,
          style: { fontSize: "0.9rem" },
        }}
      />

      <div className="w-full max-w-xl bg-white rounded-2xl shadow-xl ring-1 ring-black/5">
        {/* Encabezado */}
        <div className="px-6 pt-5 pb-2 md:px-8 md:pt-2">
          <div className="flex flex-col items-center text-center">
            <img
              src={Logo}
              alt="Logo de la clínica"
              className="h-25 w-auto select-none"
              loading="eager"
              decoding="async"
              draggable={false}
            />
            <div>
              <h1 className="text-2xl font-bold">Registro de Paciente</h1>
              <p className="text-sm text-gray-500">Crea tu cuenta para usar el sistema odontológico</p>
            </div>
          </div>
        </div>

        {/* Contenido */}
        <div className="px-6 pb-6 md:px-8 md:pb-8">
          <form id="form-register-patient" onSubmit={handleSubmit} className="space-y-5 max-w-md mx-auto">
            {/* Credenciales */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm mb-1">Email *</label>
                <input
                  name="email"
                  type="email"
                  required
                  className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-500"
                  placeholder="tu@correo.com"
                />
              </div>
              <div>
                <label className="block text-sm mb-1">Contraseña *</label>
                <input
                  name="password"
                  type="password"
                  required
                  minLength={8}
                  className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-500"
                  placeholder="Digita tu contraseña"
                />
              </div>
            </div>

            {/* Datos personales (opcionales) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm mb-1">Nombre</label>
                <input
                  name="nombre"
                  className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>
              <div>
                <label className="block text-sm mb-1">Apellido</label>
                <input
                  name="apellido"
                  className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm mb-1">Teléfono</label>
              <input
                name="telefono"
                type="tel"
                className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-500"
                placeholder="+591 7xx xxx xx"
              />
            </div>

            {/* Requeridos paciente */}
            <div>
              <label className="block text-sm mb-1">Sexo *</label>
              <select
                name="sexo"
                required
                defaultValue=""
                className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-500 bg-white"
              >
                <option value="" disabled>Selecciona…</option>
                <option value="M">Masculino</option>
                <option value="F">Femenino</option>
              </select>
            </div>

            <div>
              <label className="block text-sm mb-1">Dirección *</label>
              <input
                name="direccion"
                required
                className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-500"
                placeholder="Introduce tu dirección"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm mb-1">Fecha de nacimiento *</label>
                <input
                  name="fechanacimiento"
                  type="date"
                  required
                  defaultValue={defaultDate}
                  className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>
              <div>
                <label className="block text-sm mb-1">Carnet de identidad *</label>
                <input
                  name="carnetidentidad"
                  required
                  className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-sky-500"
                  placeholder="1234567"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={sending}
              className="block mx-auto px-6 py-2.5 rounded-lg bg-sky-600 hover:bg-sky-700 text-white font-medium disabled:opacity-50 transition cursor-pointer"
            >
              {sending ? (
                <span className="inline-flex items-center gap-2">
                  <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Registrando…
                </span>
              ) : (
                "Crear cuenta"
              )}
            </button>
          </form>
        </div>
      </div>

      {/* backend “headless” */}
      <RegisterPatientBackend payload={payload} onDone={onDone} />
    </div>
  );
}
