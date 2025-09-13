// src/router.tsx

import {createBrowserRouter} from "react-router-dom";
import Home from "./pages/Home";
// 1. Importa todos los componentes que necesitarás
import {Root} from "./Root"; // El layout que acabamos de crear
import RegisterPatientForm from "./pages/RegisterPatientForm";
import Login from "./pages/Login"; // Asumo que tienes una página de Login
import Dashboard from "./pages/Dashboard";
import AgendarCita from './pages/AgendarCita';
import ProtectedRoute from "./components/ProtectedRoute"; // El componente para proteger rutas
//import Pacientes from "./pages/Pacientes";
//import Consultas from "./pages/AgendarCita";
//import Reportes from "./pages/Reportes";
import MisCitas from './pages/MisCitas';
import Agenda from './pages/Agenda';
import ForgotPassword from './pages/Forgot-Password';
import ResetPassword from './pages/ResetPassword';

export const router = createBrowserRouter([
    {
        // 2. La ruta raíz ahora renderiza nuestro componente Root
        path: "/",
        element: <Root/>,
        // 3. Todas las demás rutas se convierten en "hijas" de Root
        children: [
            {
                index: true,
                // 👇 2. CAMBIA ESTA LÍNEA
                element: <Home/>, // Antes era un <div>, ahora es tu componente
            },
            {
                path: "/agenda",
                element: (
                    <ProtectedRoute>
                        <Agenda/>
                    </ProtectedRoute>
                ),
            },
            {
                path: "/mis-citas",
                element: (
                    <ProtectedRoute>
                        <MisCitas/>
                    </ProtectedRoute>
                ),
            },
            {
                path: "/login",
                element: <Login/>,
            },
            {
                path: "/register",
                element: <RegisterPatientForm/>,
            },
            // --- Rutas Protegidas ---
            {
                path: "/dashboard",
                element: (
                    <ProtectedRoute>
                        <Dashboard/>
                    </ProtectedRoute>
                ),
            },
            {
                path: "/agendar-cita",
                element: (
                    <ProtectedRoute>
                        <AgendarCita/>
                    </ProtectedRoute>
                ),
            },
            {
                path: "/forgot-password",
                element: (
                    <ForgotPassword/>
                ),
            },
            {
                path: "/reset-password",
                element: <ResetPassword />,
            },
            // --- Página 404 ---
            {
                path: "*",
                element: <div className="min-h-screen grid place-items-center">404</div>,
            },


        ],
    },
]);