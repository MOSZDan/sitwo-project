// src/router.tsx
import { createBrowserRouter } from "react-router-dom";
import { Root } from "./Root";
import Home from "./pages/Home";
import RegisterPatientForm from "./pages/RegisterPatientForm";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import AgendarCita from "./pages/AgendarCita";
import ProtectedRoute from "./components/ProtectedRoute";
import MisCitas from "./pages/MisCitas";
import Agenda from "./pages/Agenda";
import ForgotPassword from "./pages/Forgot-Password";
import ResetPassword from "./pages/ResetPassword";
import GestionRoles from "./pages/GestionRoles";
import Perfil from "./pages/Perfil";            // 👈 NUEVO

export const router = createBrowserRouter([
  {
    path: "/",
    element: <Root />,
    children: [
      { index: true, element: <Home /> },

      // Públicas
      { path: "/login", element: <Login /> },
      { path: "/register", element: <RegisterPatientForm /> },
      { path: "/forgot-password", element: <ForgotPassword /> },
      { path: "/reset-password", element: <ResetPassword /> },

      // Protegidas (requieren sesión)
      {
        path: "/dashboard",
        element: (
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        ),
      },
      {
        path: "/agenda",
        element: (
          <ProtectedRoute>
            <Agenda />
          </ProtectedRoute>
        ),
      },
      {
        path: "/agendar-cita",
        element: (
          <ProtectedRoute>
            <AgendarCita />
          </ProtectedRoute>
        ),
      },
      {
        path: "/mis-citas",
        element: (
          <ProtectedRoute>
            <MisCitas />
          </ProtectedRoute>
        ),
      },

      // Perfil (protegido)
      {
        path: "/perfil",
        element: (
          <ProtectedRoute>
            <Perfil />
          </ProtectedRoute>
        ),
      },

      // Administración (protegida; backend valida si es admin)
      {
        path: "/usuarios",
        element: (
          <ProtectedRoute>
            <GestionRoles />
          </ProtectedRoute>
        ),
      },

      // 404
      {
        path: "*",
        element: <div className="min-h-screen grid place-items-center">404</div>,
      },
    ],
  },
]);
