// src/App.tsx
import { BrowserRouter, Routes, Route } from "react-router-dom";
import RegisterPatientForm from "./pages/RegisterPatientForm";
import Login from "./pages/Login";  // Importar el componente Login

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<div className="flex justify-center">Home</div>} />
        <Route path="/login" element={<Login />} /> {/* Agregar la ruta de login */}
        <Route path="/register" element={<RegisterPatientForm />} />
        <Route path="*" element={<div className="flex justify-center">Error 404</div>} />
      </Routes>
    </BrowserRouter>
  );
}
