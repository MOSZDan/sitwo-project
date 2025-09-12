import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import TopBar from "./TopBar";

const PacienteDashboard = () => {
    const { user } = useAuth();

    return (
        <div className="min-h-screen bg-gray-50">
            <TopBar />
            <main className="mx-auto w-full max-w-7xl px-4 py-8 sm:py-12">
                {/* --- Encabezado de Bienvenida --- */}
                <header className="mb-8 md:mb-12">
                    <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                        Bienvenido a tu Portal del Paciente
                    </h1>
                    {user && (
                         <p className="mt-2 text-md text-gray-600">
                            Hola, <span className="font-semibold">{user.nombre} {user.apellido}</span>.
                         </p>
                    )}
                </header>

                {/* --- Tarjetas de Acción --- */}
                <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* Tarjeta para Agendar Cita */}
                    <Link
                        to="/agendar-cita"
                        className="group block rounded-2xl bg-white p-6 shadow-lg border border-transparent hover:border-cyan-500 hover:shadow-cyan-100 transition-all duration-300"
                    >
                        <div className="flex items-center gap-4">
                            <div className="rounded-xl bg-cyan-100 p-3 text-cyan-600">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-gray-800">Agendar Nueva Cita</h3>
                                <p className="mt-1 text-sm text-gray-500">Encuentra un horario disponible.</p>
                            </div>
                        </div>
                    </Link>

                    {/* Tarjeta para Ver Mis Citas */}
                    <Link
                        to="/mis-citas"
                        className="group block rounded-2xl bg-white p-6 shadow-lg border border-transparent hover:border-cyan-500 hover:shadow-cyan-100 transition-all duration-300"
                    >
                        <div className="flex items-center gap-4">
                            <div className="rounded-xl bg-cyan-100 p-3 text-cyan-600">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold text-gray-800">Ver Mis Citas</h3>
                                <p className="mt-1 text-sm text-gray-500">Revisa tus próximas visitas.</p>
                            </div>
                        </div>
                    </Link>

                    {/* Puedes añadir más tarjetas aquí en el futuro, como "Ver Historial" o "Pagos" */}

                </section>
            </main>
        </div>
    );
};

export default PacienteDashboard;