import {Link, Navigate} from "react-router-dom";
import TopBar from "./TopBar.tsx";
import {useAuth} from "../context/AuthContext.tsx";
import {useEffect, useState} from "react";
import {Api} from "../lib/Api.ts";


type Counts = {
    users?: number;
    pacientes?: number;
    consultas?: number;
};

export default function AdminDashboard() {
    console.log('Estoy dentro de admin')
    const {isAuth} = useAuth();
    const [counts, setCounts] = useState<Counts>({});
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            if (!isAuth) return;
            try {
                setLoading(true);
                const [u, p, c] = await Promise.all([
                    Api.get<{ count: number }>("/users/count/").catch(() => ({data: {count: 0}} as any)),
                    Api.get<{
                        count?: number;
                        results?: any[]
                    }>("/pacientes/?limit=1").catch(() => ({data: {results: []}} as any)),
                    Api.get<{
                        count?: number;
                        results?: any[]
                    }>("/consultas/?limit=1").catch(() => ({data: {results: []}} as any)),
                ]);
                setCounts({
                    users: u?.data?.count ?? 0,
                    pacientes: p?.data?.count ?? (Array.isArray(p?.data?.results) ? p.data.results.length : 0),
                    consultas: c?.data?.count ?? (Array.isArray(c?.data?.results) ? c.data.results.length : 0),
                });
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [isAuth]);

    if (!isAuth) return <Navigate to="/login" replace/>;

    return (
        <div className="min-h-screen bg-gradient-to-br from-cyan-50 to-white">
            <TopBar/>

            <main className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 py-6 sm:py-10">
                {/* Header */}
                <header
                    className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 sm:gap-4 mb-6 sm:mb-10">
                    <div className="flex items-center gap-3">
                        <img src="/dentist.svg" className="w-7 h-7 sm:w-8 sm:h-8" alt=""/>
                        <h2 className="text-xl sm:text-2xl font-bold text-gray-900">
                            Panel de la Clínica
                        </h2>
                    </div>
                    <span
                        className="self-start sm:self-auto text-xs sm:text-sm px-2.5 sm:px-3 py-1 rounded-full bg-emerald-100 text-emerald-700">
            {loading ? "Sincronizando…" : "Conectado al backend"}
          </span>
                </header>

                {/* KPIs */}
                <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                    {[
                        {label: "Usuarios", value: counts.users ?? 0},
                        {label: "Pacientes", value: counts.pacientes ?? 0},
                        {label: "Consultas", value: counts.consultas ?? 0},
                    ].map((k, i) => (
                        <div
                            key={i}
                            className="bg-white/80 backdrop-blur-sm border border-cyan-100 rounded-2xl p-4 sm:p-6 shadow-sm"
                        >
                            <div className="flex items-center gap-3 sm:gap-4">
                                <div
                                    className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-gradient-to-br from-cyan-400 to-teal-600 grid place-items-center shrink-0">
                                    <img src="/dentist.svg" className="w-5 h-5 sm:w-6 sm:h-6" alt=""/>
                                </div>
                                <div className="min-w-0">
                                    <p className="text-xs sm:text-sm text-gray-500">{k.label}</p>
                                    <p className="text-2xl sm:text-3xl font-bold text-gray-900 truncate">{k.value}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </section>

                {/* Acciones rápidas */}
                <section className="mt-6 sm:mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                    <Link
                        to="/pacientes"
                        className="group bg-white/80 border border-cyan-100 rounded-2xl p-4 sm:p-6 hover:shadow-lg transition"
                    >
                        <div className="flex items-center gap-3 sm:gap-4">
                            <div
                                className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-cyan-100 grid place-items-center shrink-0">
                                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-cyan-700" fill="none" stroke="currentColor"
                                     viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                                </svg>
                            </div>
                            <div className="min-w-0">
                                <p className="font-semibold text-gray-900 text-sm sm:text-base">Gestionar Pacientes</p>
                                <p className="text-xs sm:text-sm text-gray-500">Altas, ediciones, historial</p>
                            </div>
                        </div>
                    </Link>

                    <Link
                        to="/agenda"
                        className="group bg-white/80 border border-cyan-100 rounded-2xl p-4 sm:p-6 hover:shadow-lg transition"
                    >
                        <div className="flex items-center gap-3 sm:gap-4">
                            <div
                                className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-cyan-100 grid place-items-center shrink-0">
                                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-cyan-700" fill="none" stroke="currentColor"
                                     viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                          d="M8 7h8M8 11h8M8 15h6M5 7h.01M5 11h.01M5 15h.01"/>
                                </svg>
                            </div>
                            <div className="min-w-0">
                                <p className="font-semibold text-gray-900 text-sm sm:text-base">Agenda & Consultas</p>
                                <p className="text-xs sm:text-sm text-gray-500">Turnos, estados, pagos</p>
                            </div>
                        </div>
                    </Link>

                    <Link
                        to="/reportes"
                        className="group bg-white/80 border border-cyan-100 rounded-2xl p-4 sm:p-6 hover:shadow-lg transition"
                    >
                        <div className="flex items-center gap-3 sm:gap-4">
                            <div
                                className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-cyan-100 grid place-items-center shrink-0">
                                <svg className="w-5 h-5 sm:w-6 sm:h-6 text-cyan-700" fill="none" stroke="currentColor"
                                     viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                                          d="M11 11V3a1 1 0 012 0v8h3l-4 4-4-4h3zM5 19h14"/>
                                </svg>
                            </div>
                            <div className="min-w-0">
                                <p className="font-semibold text-gray-900 text-sm sm:text-base">Reportes</p>
                                <p className="text-xs sm:text-sm text-gray-500">KPI clínicos y financieros</p>
                            </div>
                        </div>
                    </Link>

                </section>
            </main>

            <footer className="bg-gray-900 text-white py-6 sm:py-10 mt-10 sm:mt-20">
                <div
                    className="mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 text-center text-gray-400 text-xs sm:text-sm">
                    © {new Date().getFullYear()} Clínica Dental. Todos los derechos reservados.
                </div>
            </footer>
        </div>
    );
}