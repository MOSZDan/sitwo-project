import { useEffect, useMemo, useRef, useState } from "react";
import ProtectedRoute from "../components/ProtectedRoute";
import TopBar from "../components/TopBar";
import { Api } from "../lib/Api";
import { Toaster, toast } from "react-hot-toast";
import { descargarPDFConsentimiento } from "../services/consentimientoService";

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

type Consentimiento = {
  id: number;
  paciente: number;
  consulta?: number;
  titulo: string;
  texto_contenido: string;
  fecha_creacion: string;
  fecha_creacion_formateada: string;
  paciente_nombre: string;
  paciente_apellido: string;
  validado_por_nombre?: string;
  validado_por_apellido?: string;
  fecha_validacion?: string;
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
  // consentimientos
  const [consentimientos, setConsentimientos] = useState<Consentimiento[]>([]);
  const [loadingConsentimientos, setLoadingConsentimientos] = useState(false);

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
    setLoadingConsentimientos(true);
    try {
      // Cargar historias y consentimientos concurrentemente
      const [historiasResponse, consentimientosResponse] = await Promise.all([
        Api.get(`/historias-clinicas/?paciente=${id}&page_size=1000`),
        Api.get(`/consentimientos/?paciente=${id}&page_size=1000`)
      ]);
      
      const historiasList = Array.isArray(historiasResponse.data) ? historiasResponse.data : (historiasResponse.data?.results ?? []);
      const consentimientosList = Array.isArray(consentimientosResponse.data) ? consentimientosResponse.data : (consentimientosResponse.data?.results ?? []);
      
      setHistorias(historiasList || []);
      setConsentimientos(consentimientosList || []);
    } catch {
      toast.error("No se pudo obtener el historial clínico o los consentimientos");
      setHistorias([]);
      setConsentimientos([]);
    } finally {
      setLoadingHistorias(false);
      setLoadingConsentimientos(false);
    }
  };

  const handleDescargarPDF = async (consentimientoId: number) => {
    try {
      const pdfBlob = await descargarPDFConsentimiento(consentimientoId);
      const url = window.URL.createObjectURL(pdfBlob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `consentimiento_${consentimientoId}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error al descargar el PDF:", error);
      toast.error("No se pudo descargar el PDF del consentimiento.");
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
            ) : (
              <div className="space-y-8">
                {/* Tabla de Historia Clínica */}
                <div>
                  <h2 className="text-xl font-semibold text-gray-800 mb-4">Historia Clínica</h2>
                  {loadingHistorias ? (
                    <p className="text-gray-500">Cargando historial clínico…</p>
                  ) : historias.length === 0 ? (
                    <p className="text-gray-500">Este paciente no tiene registros clínicos.</p>
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
                </div>

                {/* Tabla de Consentimientos */}
                <div>
                  <h2 className="text-xl font-semibold text-gray-800 mb-4">Consentimientos Firmados</h2>
                  {loadingConsentimientos ? (
                    <p className="text-gray-500">Cargando consentimientos…</p>
                  ) : consentimientos.length === 0 ? (
                    <p className="text-gray-500">Este paciente no tiene consentimientos firmados.</p>
                  ) : (
                    <div className="overflow-auto border rounded-lg bg-white shadow">
                      <table className="min-w-full text-sm">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="text-left p-2">Fecha de Firma</th>
                            <th className="text-left p-2">Título</th>
                            <th className="text-left p-2">Contenido</th>
                            <th className="text-left p-2">Validado Por</th>
                            <th className="text-left p-2">Acciones</th>
                          </tr>
                        </thead>
                        <tbody>
                          {consentimientos.map((c) => (
                            <tr key={c.id} className="border-t">
                              <td className="p-2 whitespace-nowrap">
                                {new Date(c.fecha_creacion).toLocaleString()}
                              </td>
                              <td className="p-2">{c.titulo}</td>
                              <td className="p-2 max-w-xs truncate" title={c.texto_contenido}>
                                {c.texto_contenido.length > 50 
                                  ? `${c.texto_contenido.substring(0, 50)}...` 
                                  : c.texto_contenido}
                              </td>
                              <td className="p-2">
                                {c.fecha_validacion 
                                  ? `${c.validado_por_nombre} ${c.validado_por_apellido}` 
                                  : "No validado"}
                              </td>
                              <td className="p-2">
                                <button
                                  onClick={() => handleDescargarPDF(c.id)}
                                  className="text-blue-600 hover:text-blue-800"
                                  title="Descargar PDF"
                                >
                                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                                  </svg>
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            )}
          </section>
        </main>
      </div>
    </ProtectedRoute>
  );
}
