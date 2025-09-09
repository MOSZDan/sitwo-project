// src/App.tsx
import { BrowserRouter, Routes, Route } from "react-router-dom";
import RegisterPatientForm from "./pages/RegisterPatientForm";
import Login from "./pages/Login";
import Home from "./pages/Home";  // Importar el nuevo componente Home
import ForgotPassword from "./pages/Forgot-Password.tsx";
import Dashboard from "./pages/Dashboard";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />  {/* Usar el componente Home */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<RegisterPatientForm />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/dashboard" element={<Dashboard/>} />
        <Route path="*" element={<div className="flex justify-center">Error 404</div>} />
      </Routes>
    </BrowserRouter>
  );
}