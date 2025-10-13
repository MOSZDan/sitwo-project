import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import TopBar from "../components/TopBar";
import { Api } from "../lib/Api";
import { useAuth } from "../context/AuthContext";

// Ajusta esta ruta si tu router usa otra (por ejemplo: "/politicasnoshow")
const POLITICAS_ROUTE = "/politicanoshow";

// … (la interfaz Consulta se queda igual)
interface Consulta {
  id: number;
  fecha: string;
  codpaciente: { codusuario: { nombre: string; apellido: string } };
  cododontologo: { codusuario: { nombre: string; apellido: string } };
  idhorario: { hora: string };
  idtipoconsulta: { nombreconsulta: string };
  idestadoconsulta: { id: number; estado: string };
}

const Agenda = () => {
  const [citas, setCitas] = useState<Consulta[]>([]);
  const [loading, setLoading] = useState(true);

  // Traemos el usuario para controlar visibilidad (admin=1, recepcionista=3)
  const auth = (useAuth?.() as any) || {};
  const { user } = auth;

  const rolId: number = useMemo(() => {
    const raw = (user?.idtipousuario ?? user?.usuario?.idtipousuario) as number | undefined;
    return Number(raw || 0);
  }, [user]);

  const canManagePolicies = rolId === 1 || rolId === 3;

  useEffect(() => {
    const fetchCitas = async () => {
      try {
        const response = await Api.get("/consultas/");
        const citasRecibidas = response.data.results || [];
        setCitas(citasRecibidas);
        console.log("Datos de las citas cargadas:", citasRecibidas);
      } catch (err) {
        console.error("Error al cargar las citas:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchCitas();
  }, []);

  const handleConfirmarCita = async (citaId: number) => {
    const idEstadoConfirmada = 2;
    try {
      await Api.patch(`/consultas/${citaId}/`, {
        idestadoconsulta: idEstadoConfirmada,
      });
      setCitas((citasActuales) =>
        citasActuales.map((cita) =>
          cita.id === citaId
            ? {
                ...cita,
                idestadoconsulta: {
                  ...cita.idestadoconsulta,
                  id: idEstadoConfirmada,
                  estado: "Confirmada",
                },
              }
            : cita
        )
      );
    } catch (error) {
      console.error("Error al confirmar la cita:", error);
      alert("No se pudo confirmar la cita.");
    }
  };

  const getStatusBadgeClass = (estado: string) => {
    switch (estado?.toLowerCase()) {
      case "agendada":
        return "bg-blue-100 text-blue-800";
      case "confirmada":
        return "bg-green-100 text-green-800";
      case "cancelada":
        return "bg-red-100 text-red-800";
      case "finalizada":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-yellow-100 text-yellow-800";
    }
  };

  if (loading) return <div className="p-6 text-gray-700">Cargando agenda...</div>;

  return (
    <div className="min-h-screen bg-gray-50">
      <TopBar />
      <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:py-12">
        <header className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Agenda de la Clínica</h1>
        </header>

        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">
                    Paciente
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">
                    Fecha y Hora
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">
                    Odontólogo
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">
                    Estado
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {citas.map((cita) => (
                  <tr key={cita.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {cita.codpaciente.codusuario.nombre} {cita.codpaciente.codusuario.apellido}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {cita.fecha} a las {cita.idhorario.hora}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {cita.cododontologo.codusuario.nombre} {cita.cododontologo.codusuario.apellido}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span
                        className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(
                          cita.idestadoconsulta.estado
                        )}`}
                      >
                        {cita.idestadoconsulta.estado}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      {cita.idestadoconsulta.id == 1 && (
                        <button
                          onClick={() => handleConfirmarCita(cita.id)}
                          className="text-green-600 hover:text-green-900"
                        >
                          Confirmar
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* CTA Políticas No-Show: solo Admin (1) y Recepcionista (3) */}
        {canManagePolicies && (
          <section className="mt-8">
            <div className="rounded-2xl border border-cyan-200 bg-white shadow-sm">
              <div className="p-6 sm:p-8">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <h2 className="text-xl font-bold text-gray-900">
                      Políticas de No‑Show
                    </h2>
                    <p className="mt-1 text-sm text-gray-600 max-w-2xl">
                      Configura multas y bloqueos automáticos para estados como “Atrasado”,
                      “No asistió” u otros. Administra todas tus políticas desde una sola
                      pantalla.
                    </p>
                  </div>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Link
                      to={POLITICAS_ROUTE}
                      className="inline-flex justify-center rounded-lg bg-cyan-600 px-4 py-2 text-white text-sm font-semibold hover:bg-cyan-700"
                    >
                      Ver políticas
                    </Link>
                    <Link
                      to={`${POLITICAS_ROUTE}`}
                      className="inline-flex justify-center rounded-lg border border-cyan-300 px-4 py-2 text-sm font-semibold text-cyan-700 hover:bg-cyan-50"
                    >
                      Crear nueva
                    </Link>
                  </div>
                </div>

                {/* Tips breves y responsive */}
                <div className="mt-5 grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="rounded-lg bg-cyan-50 border border-cyan-100 p-4">
                    <p className="text-sm text-cyan-900">
                      Define el estado objetivo y el monto de la multa.
                    </p>
                  </div>
                  <div className="rounded-lg bg-cyan-50 border border-cyan-100 p-4">
                    <p className="text-sm text-cyan-900">
                      Activa bloqueo temporal (ej. 2 días) para evitar nuevos turnos.
                    </p>
                  </div>
                  <div className="rounded-lg bg-cyan-50 border border-cyan-100 p-4">
                    <p className="text-sm text-cyan-900">
                      Los cambios se aplican automáticamente al cambiar el estado de la cita.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}
      </main>
    </div>
  );
};

export default Agenda;