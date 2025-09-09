// src/App.tsx
import { Routes, Route } from "react-router-dom";
import RegisterPatientForm from "./pages/RegisterPatientForm";
import Login from "./pages/Login";
import Home from "./pages/Home";
import ForgotPassword from "./pages/Forgot-Password"; // ojo: quité el ".tsx"
import Dashboard from "./pages/Dashboard";
import ResetPassword from "./pages/ResetPassword";

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<RegisterPatientForm />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route
        path="*"
        element={<div className="flex justify-center">Error 404</div>}
      />
    </Routes>
  );
}
