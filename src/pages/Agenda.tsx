import {useState, useEffect} from 'react';
import {Api} from '../lib/Api';
import TopBar from '../components/TopBar';

// ... (la interfaz Consulta se queda igual)
interface Consulta {
    id: number;
    fecha: string;
    codpaciente: { codusuario: { nombre: string, apellido: string } };
    cododontologo: { codusuario: { nombre: string, apellido: string } };
    idhorario: { hora: string };
    idtipoconsulta: { nombreconsulta: string };
    idestadoconsulta: { id: number, estado: string };
}


const Agenda = () => {
    const [citas, setCitas] = useState<Consulta[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchCitas = async () => {
            try {
                const response = await Api.get('/consultas/');
                const citasRecibidas = response.data.results || [];
                setCitas(response.data.results || []);
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
            setCitas(citasActuales =>
                citasActuales.map(cita =>
                    cita.id === citaId
                        ? {
                            ...cita,
                            idestadoconsulta: {...cita.idestadoconsulta, id: idEstadoConfirmada, estado: 'Confirmada'}
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
            case 'agendada':
                return 'bg-blue-100 text-blue-800';
            case 'confirmada':
                return 'bg-green-100 text-green-800';
            case 'cancelada':
                return 'bg-red-100 text-red-800';
            case 'finalizada':
                return 'bg-gray-100 text-gray-800';
            default:
                return 'bg-yellow-100 text-yellow-800';
        }
    };

    if (loading) return <div>Cargando agenda...</div>;

    return (
        <div className="min-h-screen bg-gray-50">
            <TopBar/>
            <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:py-12">
                <header className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Agenda de la Clínica</h1>
                </header>
                <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Paciente</th>
                            <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Fecha y
                                Hora
                            </th>
                            <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Odontólogo</th>
                            <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                            <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Acciones</th>
                        </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                        {citas.map((cita) => (
                            <tr key={cita.id} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{cita.codpaciente.codusuario.nombre} {cita.codpaciente.codusuario.apellido}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{cita.fecha} a
                                    las {cita.idhorario.hora}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{cita.cododontologo.codusuario.nombre} {cita.cododontologo.codusuario.apellido}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span
                        className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(cita.idestadoconsulta.estado)}`}>
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
            </main>
        </div>
    );
};

export default Agenda;