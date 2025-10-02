import { useState, useEffect } from 'react';
import { Api, cancelarCita} from '../lib/Api';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import TopBar from '../components/TopBar';
import { ReprogramarCitaModal } from '../components/ReprogramarCitaModal';


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
  const [notification, setNotification] = useState<{type: 'success' | 'info' | 'warning', message: string} | null>(null);
  
  // Estados para el modal de reprogramación
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [citaParaReprogramar, setCitaParaReprogramar] = useState<Consulta | null>(null);

  useEffect(() => {
    const fetchCitas = async () => {
      if (!user) {
        setError('Debes iniciar sesión para ver tus citas.');
        setLoading(false);
        return;
      }
      try {
        const response = await Api.get(`/consultas/?codpaciente=${user.codigo}`);
        // Ordenamos las citas por fecha para mostrar las más recientes primero
        const citasOrdenadas = (response.data.results || []).sort((a: Consulta, b: Consulta) => 
          new Date(b.fecha).getTime() - new Date(a.fecha).getTime()
        );
        setCitas(citasOrdenadas);
      } catch (err) {
        setError('Error al cargar las citas.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchCitas();
  }, [user]);

  // Función para refrescar las citas (útil después de reprogramar)
  const refreshCitas = async () => {
    if (!user) return;
    try {
      const response = await Api.get(`/consultas/?codpaciente=${user.codigo}`);
      const citasOrdenadas = (response.data.results || []).sort((a: Consulta, b: Consulta) => 
        new Date(b.fecha).getTime() - new Date(a.fecha).getTime()
      );
      const citasAnteriores = citas.length;
      setCitas(citasOrdenadas);
      
      // Mostrar notificación si se eliminaron citas
      if (citasAnteriores > citasOrdenadas.length) {
        setNotification({
          type: 'info',
          message: `Se eliminaron ${citasAnteriores - citasOrdenadas.length} citas vencidas automáticamente.`
        });
        setTimeout(() => setNotification(null), 5000);
      }
    } catch (err) {
      console.error('Error al refrescar citas:', err);
    }
  };

  // Función para cancelar una cita
  const handleCancelarCita = async (citaId: number) => {
    const motivo = prompt('¿Por qué deseas cancelar esta cita? (opcional)');
    if (motivo !== null) { // El usuario no canceló el prompt
      try {
        await cancelarCita(citaId, motivo || '');
        // Eliminar la cita de la lista local
        setCitas(citas.filter(cita => cita.id !== citaId));
        alert('Cita cancelada exitosamente.');
      } catch (err: any) {
        if (err.response?.status === 400) {
          alert('Esta cita ya ha sido cancelada o no se puede cancelar.');
        } else if (err.response?.status === 403) {
          alert('No tienes permisos para cancelar esta cita.');
        } else {
          alert('Error al cancelar la cita. Por favor, inténtalo de nuevo.');
        }
        console.error(err);
      }
    }
  };

  // Función para reprogramar una cita
  const handleReprogramarCita = (citaId: number) => {
    const citaSeleccionada = citas.find(c => c.id === citaId) || null;
    setCitaParaReprogramar(citaSeleccionada);
    setIsModalOpen(true);
  };

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
      
      {/* Notificación */}
      {notification && (
        <div className="fixed top-4 right-4 z-50 max-w-sm">
          <div className={`p-4 rounded-lg shadow-lg ${
            notification.type === 'success' ? 'bg-green-50 border border-green-200' :
            notification.type === 'warning' ? 'bg-yellow-50 border border-yellow-200' :
            'bg-blue-50 border border-blue-200'
          }`}>
            <div className="flex items-center">
              <svg className={`w-5 h-5 mr-2 ${
                notification.type === 'success' ? 'text-green-600' :
                notification.type === 'warning' ? 'text-yellow-600' :
                'text-blue-600'
              }`} fill="currentColor" viewBox="0 0 20 20">
                {notification.type === 'success' ? (
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                ) : notification.type === 'warning' ? (
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                ) : (
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                )}
              </svg>
              <p className={`text-sm font-medium ${
                notification.type === 'success' ? 'text-green-800' :
                notification.type === 'warning' ? 'text-yellow-800' :
                'text-blue-800'
              }`}>
                {notification.message}
              </p>
              <button
                onClick={() => setNotification(null)}
                className="ml-2 text-gray-400 hover:text-gray-600"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      )}
      
      <main className="mx-auto w-full max-w-5xl px-4 py-8 sm:py-12">
        <header className="mb-8 md:mb-10 text-center">
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Mis Citas Agendadas</h1>
          <p className="mt-2 text-md text-gray-600">Revisa los detalles de tus próximas visitas a la clínica.</p>
          {citas.length > 0 && (
            <button
              onClick={refreshCitas}
              className="mt-4 inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-cyan-500"
            >
              <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Actualizar lista
            </button>
          )}
        </header>

        {citas.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-8 text-center max-w-lg mx-auto">
            <div className="mb-6">
              <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No tienes citas agendadas</h3>
              <p className="text-gray-600 mb-4">
                No tienes ninguna cita agendada en este momento. 
                Las citas vencidas se eliminan automáticamente del sistema.
              </p>
            </div>
            <div className="space-y-3">
              <Link
                to="/agendar-cita"
                className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-cyan-600 hover:bg-cyan-700 transition-colors"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Agendar nueva cita
              </Link>
              <button
                onClick={refreshCitas}
                className="block mx-auto text-sm text-gray-500 hover:text-gray-700 underline"
              >
                Actualizar lista
              </button>
            </div>
          </div>
        ) : (
           <div className="bg-white rounded-2xl shadow-lg overflow-x-auto">
             <table className="min-w-full divide-y divide-gray-200">
               <thead className="bg-gray-50">
                 <tr>
                   <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Fecha</th>
                   <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Hora</th>
                   <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Odontólogo</th>
                   <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Motivo</th>
                   <th scope="col" className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase">Estado</th>
                   <th scope="col" className="px-6 py-4 text-center text-xs font-medium text-gray-500 uppercase">Acciones</th>
                 </tr>
               </thead>
               <tbody className="bg-white divide-y divide-gray-200">
                 {citas.map((cita) => {
                   // Verificar si la cita es modificable (no cancelada ni finalizada)
                   const isModificable = !['cancelada', 'finalizada'].includes(cita.idestadoconsulta.estado.toLowerCase());
                   
                   return (
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
                       <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                         {isModificable ? (
                           <div className="flex justify-center space-x-3">
                             <button
                               onClick={() => handleReprogramarCita(cita.id)}
                               className="text-cyan-600 hover:text-cyan-900 font-medium"
                               title="Reprogramar cita"
                             >
                               Reprogramar
                             </button>
                             <button
                               onClick={() => handleCancelarCita(cita.id)}
                               className="text-red-600 hover:text-red-900 font-medium"
                               title="Cancelar cita"
                             >
                               Cancelar
                             </button>
                           </div>
                         ) : (
                           <span className="text-gray-400">—</span>
                         )}
                       </td>
                     </tr>
                   );
                 })}
               </tbody>
             </table>
           </div>
        )}
      </main>
      
      {/* Modal de reprogramación */}
      {isModalOpen && (
        <ReprogramarCitaModal
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setCitaParaReprogramar(null);
          }}
          cita={citaParaReprogramar as any}
          onCitaReprogramada={(citaActualizada: any) => {
            // Actualizar la cita en la lista local
            setCitas(prev => prev.map(c => c.id === citaActualizada.id ? {
              ...c,
              fecha: citaActualizada.fecha,
              idhorario: citaActualizada.idhorario
            } : c));
          }}
        />
      )}
    </div>
  );
};

export default MisCitas;