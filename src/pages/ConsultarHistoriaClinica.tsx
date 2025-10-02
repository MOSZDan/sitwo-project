import { useEffect, useMemo, useRef, useState } from "react";
import ProtectedRoute from "../components/ProtectedRoute";
import TopBar from "../components/TopBar";
import { Api } from "../lib/Api";
import { Toaster, toast } from "react-hot-toast";

type PacienteApi = {
  codusuario: {
    codigo: number;
    nombre: string;
    apellido: string;
  };
};

type HCEItem = {
  id: number;
  pacientecodigo: number;
  episodio: number;
  fecha: string; // ISO
  alergias?: string | null;
  enfermedades?: string | null;
  motivoconsulta?: string | null;
  diagnostico?: string | null;
  updated_at?: string | null;
};

export default function ConsultarHistoriaClinica() {
  // pacientes
  const [pacientes, setPacientes] = useState<PacienteApi[]>([]);
  const [loadingPacientes, setLoadingPacientes] = useState(true);

  // búsqueda
  const [query] = useState("");
  const debounceRef = useRef<number | null>(null);

  // selección
  const [pacienteId, setPacienteId] = useState<number | "">("");

  // historias
  const [historias, setHistorias] = useState<HCEItem[]>([]);
  const [loadingHistorias, setLoadingHistorias] = useState(false);

  // cargar pacientes iniciales
  useEffect(() => {
    (async () => {
      try {
        const { data } = await Api.get("/pacientes/?page_size=100");
        const list = Array.isArray(data) ? data : (data?.results ?? []);
        setPacientes(list || []);
      } catch {
        toast.error("No se pudieron cargar pacientes");
      } finally {
        setLoadingPacientes(false);
      }
    })();
  }, []);

  // búsqueda en servidor (fallback: no rompe si no está activo)
  useEffect(() => {
    if (debounceRef.current) window.clearTimeout(debounceRef.current);
    debounceRef.current = window.setTimeout(async () => {
      const q = query.trim();
      if (q.length < 2) return;
      try {
        const { data } = await Api.get(`/pacientes/?search=${encodeURIComponent(q)}&page_size=100`);
        const list = Array.isArray(data) ? data : (data?.results ?? []);
        if (!Array.isArray(list) || list.length === 0) {
          // fallback: filtrar lo ya cargado
          setPacientes((prev) =>
            prev.filter((p) => {
              const full = `${p?.codusuario?.nombre ?? ""} ${p?.codusuario?.apellido ?? ""}`.toLowerCase();
              return full.includes(q.toLowerCase());
            })
          );
        } else {
          setPacientes(list);
        }
      } catch {
        // ignorar error de búsqueda
      }
    }, 350);
    return () => {
      if (debounceRef.current) window.clearTimeout(debounceRef.current);
    };
  }, [query]);

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

  // cargar historias al seleccionar
  const cargarHistorias = async (id: number) => {
    setLoadingHistorias(true);
    try {
      const { data } = await Api.get(`/historias-clinicas/?paciente=${id}&page_size=1000`);
      const list = Array.isArray(data) ? data : (data?.results ?? []);
      setHistorias(list || []);
    } catch {
      toast.error("No se pudo obtener el historial clínico");
      setHistorias([]);
    } finally {
      setLoadingHistorias(false);
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-cyan-50 to-white">
        <TopBar />
        <Toaster />

        <main className="mx-auto w-full max-w-6xl px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
          <header className="mb-6 sm:mb-8">
            <h1 className="text-2xl sm:text-3xl font-semibold text-gray-800">
              Consultar Historia Clínica
            </h1>
            <p className="text-gray-500">
              Selecciona al paciente para ver sus episodios de Historia Clínica (HCE).
            </p>
          </header>

          {/* Filtros */}
          <section className="bg-white rounded-2xl shadow p-4 sm:p-6 grid gap-4 sm:gap-5">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Paciente
              </label>
              <select
                value={pacienteId}
                onChange={(e) => {
                  const v = e.target.value ? Number(e.target.value) : "";
                  setPacienteId(v);
                  if (v) cargarHistorias(v);
                }}
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
          </section>

          {/* Resultados */}
          <section className="mt-8">
            {!pacienteId ? (
              <p className="text-gray-500">Selecciona un paciente para ver su historial.</p>
            ) : loadingHistorias ? (
              <p className="text-gray-500">Cargando historial…</p>
            ) : historias.length === 0 ? (
              <p className="text-gray-500">Este paciente no tiene registros.</p>
            ) : (
              <div className="overflow-auto border rounded-lg bg-white shadow">
                <table className="min-w-full text-sm">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="text-left p-2">Fecha</th>
                      <th className="text-left p-2">Episodio</th>
                      <th className="text-left p-2">Motivo de consulta</th>
                      <th className="text-left p-2">Diagnóstico</th>
                      <th className="text-left p-2">Alergias</th>
                      <th className="text-left p-2">Enfermedades</th>
                    </tr>
                  </thead>
                  <tbody>
                    {historias.map((h) => (
                      <tr key={h.id} className="border-t">
                        <td className="p-2 whitespace-nowrap">
                          {new Date(h.fecha).toLocaleString()}
                        </td>
                        <td className="p-2">{h.episodio}</td>
                        <td className="p-2">{h.motivoconsulta || "-"}</td>
                        <td className="p-2">{h.diagnostico || "-"}</td>
                        <td className="p-2">{h.alergias || "-"}</td>
                        <td className="p-2">{h.enfermedades || "-"}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        </main>
      </div>
    </ProtectedRoute>
  );
}
