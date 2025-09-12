import { useState, useEffect } from 'react';
import { Api } from '../lib/Api';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import TopBar from '../components/TopBar'; // Asumiendo que quieres el TopBar aquí también


// Definimos la estructura de cómo se ve una Cita que viene de la API
interface Consulta {
  id: number;
  fecha: string;
  cododontologo: {
    codusuario: {
      nombre: string;
      apellido: string;
    };
  };
  idhorario: {
    hora: string;
  };
  idtipoconsulta: {
    nombreconsulta: string;
  };
  idestadoconsulta: {
    estado: string;
  };
}

const MisCitas = () => {
  const { user } = useAuth();
  const [citas, setCitas] = useState<Consulta[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchCitas = async () => {
      if (!user) {
        setError('Debes iniciar sesión para ver tus citas.');
        setLoading(false);
        return;
      }
      try {
        const response = await Api.get(`/consultas/?codpaciente=${user.codigo}`);
        setCitas(response.data.results || []);
      } catch (err) {
        setError('Error al cargar las citas.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchCitas();
  }, [user]);

  const getStatusBadgeClass = (estado: string) => {
    switch (estado.toLowerCase()) {
      case 'agendada': return 'bg-blue-100 text-blue-800';
      case 'confirmada': return 'bg-green-100 text-green-800';
      case 'cancelada': return 'bg-red-100 text-red-800';
      case 'finalizada': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <p className="text-lg text-gray-700">Cargando tus citas...</p>
    </div>
  );
  if (error) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <p className="text-lg text-red-600">{error}</p>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      <TopBar />
      <main className="mx-auto w-full max-w-5xl px-4 py-8 sm:py-12">
        <header className="mb-8 md:mb-10 text-center">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Mis Citas Agendadas</h1>
          <p className="mt-2 text-md text-gray-600">Revisa los detalles de tus próximas visitas a la clínica.</p>
        </header>

        {citas.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center max-w-lg mx-auto">
            <p className="text-lg text-gray-700 mb-4">No tienes ninguna cita agendada todavía.</p>
            <Link
              to="/agendar-cita"
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-cyan-600 hover:bg-cyan-700"
            >
              Agendar mi primera cita
            </Link>
          </div>
        ) : (
          <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Fecha</th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Hora</th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Odontólogo</th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Motivo</th>
                  <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {citas.map((cita) => (
                  <tr key={cita.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{cita.fecha}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{cita.idhorario.hora}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{cita.cododontologo.codusuario.nombre} {cita.cododontologo.codusuario.apellido}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{cita.idtipoconsulta.nombreconsulta}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(cita.idestadoconsulta.estado)}`}>
                        {cita.idestadoconsulta.estado}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
};

export default MisCitas;