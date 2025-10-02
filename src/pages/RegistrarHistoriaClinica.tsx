// src/pages/RegistrarHistoriaClinica.tsx
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import TopBar from "../components/TopBar";
import ProtectedRoute from "../components/ProtectedRoute";
import { Api } from "../lib/Api";
import { toast, Toaster } from "react-hot-toast";

type PacienteApi = {
  codusuario: {
    codigo: number;
    nombre: string;
    apellido: string;
    correoelectronico: string;
    telefono?: string;
  };
  carnetidentidad?: string | null;
  fechanacimiento?: string | null;
  direccion?: string | null;
};

type HCECreatePayload = {
  pacientecodigo: number;
  alergias?: string;
  enfermedades?: string;
  motivoconsulta?: string;
  diagnostico?: string;
};

// --- API local (solo crear) ---
async function crearHistoriaClinica(payload: HCECreatePayload) {
  const { data } = await Api.post("/historias-clinicas/", payload);
  return data;
}

export default function RegistrarHistoriaClinica() {
  const navigate = useNavigate();

  // Pacientes para el select
  const [pacientes, setPacientes] = useState<PacienteApi[]>([]);
  const [loadingPacientes, setLoadingPacientes] = useState(true);

  // Form
  const [pacienteId, setPacienteId] = useState<number | "">("");
  const [alergias, setAlergias] = useState("");
  const [enfermedades, setEnfermedades] = useState("");
  const [motivoconsulta, setMotivo] = useState("");
  const [diagnostico, setDiagnostico] = useState("");
  const [submitting, setSubmitting] = useState(false);

  // Cargar pacientes iniciales
  useEffect(() => {
    (async () => {
      try {
        // Este endpoint del backend ya devuelve SOLO pacientes
        const { data } = await Api.get("/pacientes/?limit=1000&ordering=codusuario");
        const list = Array.isArray(data) ? data : (data?.results ?? []);
        setPacientes(list || []);
      } catch {
        setPacientes([]);
        toast.error("No se pudieron cargar pacientes");
      } finally {
        setLoadingPacientes(false);
      }
    })();
  }, []);

  // Opciones del select
  const optionsPacientes = useMemo(
    () =>
      Array.isArray(pacientes)
        ? pacientes.map((p) => ({
            id: p?.codusuario?.codigo,
            label: `${p?.codusuario?.nombre ?? ""} ${p?.codusuario?.apellido ?? ""}`.trim(),
          }))
        : [],
    [pacientes]
  );

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pacienteId) {
      toast.error("Selecciona un paciente");
      return;
    }
    setSubmitting(true);
    try {
      await crearHistoriaClinica({
        pacientecodigo: Number(pacienteId),
        alergias: alergias || undefined,
        enfermedades: enfermedades || undefined,
        motivoconsulta: motivoconsulta || undefined,
        diagnostico: diagnostico || undefined,
      });

      toast.success("Historia clínica registrada");

      // Limpieza del formulario (dejamos el paciente seleccionado)
      setMotivo("");
      setDiagnostico("");
      setAlergias("");
      setEnfermedades("");

      // ✅ Redirigir al AdminDashboard después de un breve delay
      setTimeout(() => navigate("/dashboard"), 700);
    } catch (err: any) {
      const msg =
        err?.response?.data?.detail ||
        err?.response?.data?.non_field_errors?.[0] ||
        "No se pudo registrar la historia";
      toast.error(String(msg));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-cyan-50 to-white">
        <TopBar />
        <Toaster />

        <main className="mx-auto w-full max-w-5xl px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
          <header className="mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl font-semibold text-gray-800">
              Registrar Historia Clínica
            </h1>
            <p className="text-gray-500">
              Completa los datos y asocia la HCE al paciente.
            </p>
          </header>

          {/* Formulario */}
          <form
            onSubmit={onSubmit}
            className="bg-white rounded-2xl shadow p-4 sm:p-6 grid gap-4 sm:gap-5"
          >
            {/* Paciente */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Paciente <span className="text-red-500">*</span>
              </label>
              <select
                value={pacienteId}
                onChange={(e) => setPacienteId(e.target.value ? Number(e.target.value) : "")}
                required
                className="w-full border rounded-lg p-2"
                disabled={loadingPacientes}
              >
                <option value="">Selecciona…</option>
                {optionsPacientes.map((op) => (
                  <option key={op.id} value={op.id}>
                    {op.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Campos clínicos (mismo tamaño/estilo) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Motivo de consulta
                </label>
                <textarea
                  value={motivoconsulta}
                  onChange={(e) => setMotivo(e.target.value)}
                  className="w-full border rounded-lg p-3 h-24 resize-none focus:outline-none focus:ring-2 focus:ring-cyan-200"
                  placeholder="Dolor en molar 26…"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Diagnóstico
                </label>
                <textarea
                  value={diagnostico}
                  onChange={(e) => setDiagnostico(e.target.value)}
                  className="w-full border rounded-lg p-3 h-24 resize-none focus:outline-none focus:ring-2 focus:ring-cyan-200"
                  placeholder="Caries clase II…"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Alergias
                </label>
                <textarea
                  value={alergias}
                  onChange={(e) => setAlergias(e.target.value)}
                  className="w-full border rounded-lg p-3 h-24 resize-none focus:outline-none focus:ring-2 focus:ring-cyan-200"
                  placeholder="Penicilina…"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Enfermedades
                </label>
                <textarea
                  value={enfermedades}
                  onChange={(e) => setEnfermedades(e.target.value)}
                  className="w-full border rounded-lg p-3 h-24 resize-none focus:outline-none focus:ring-2 focus:ring-cyan-200"
                  placeholder="Asma…"
                />
              </div>
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={submitting || !pacienteId}
                className="px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-700 disabled:opacity-60"
              >
                {submitting ? "Guardando…" : "Guardar HCE"}
              </button>

              <button
                type="button"
                onClick={() => navigate("/dashboard")}
                className="px-4 py-2 border rounded-lg"
                disabled={submitting}
              >
                Volver
              </button>
            </div>
          </form>
        </main>
      </div>
    </ProtectedRoute>
  );
}
