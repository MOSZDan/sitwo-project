// src/pages/Login.tsx
import React, { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import LoginBackend, {
  type LoginPayload,
  type LoginSuccess,
  type LoginError,
} from "../components/LoginBackend";
import { useAuth } from "../context/AuthContext";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [loginPayload, setLoginPayload] = useState<LoginPayload | null>(null);
  const navigate = useNavigate();
  const { adoptToken } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Evitar múltiples submissions
    if (isLoading) {
      console.log("Ya procesando, ignorando submit");
      return;
    }

    setIsLoading(true);
    setMessage("");
    setLoginPayload({ email: email.trim(), password });
  };

  const handleLoginResult = useCallback(
      async (
          result:
              | { ok: true; data: LoginSuccess }
              | { ok: false; error: LoginError }
      ) => {
        console.log("=== HANDLE LOGIN RESULT ===");
        console.log("Result:", result);

        setIsLoading(false);
        setLoginPayload(null);

        if (result.ok) {
          const { data } = result;
          console.log("Data completa:", data);

          // Verificar que tenemos los datos necesarios
          if (!data.user || !data.usuario) {
            console.error("Datos incompletos del servidor");
            setMessage("Error: Datos incompletos del servidor");
            return;
          }

          try {
            const enrichedUsuario: any = {
              ...data.usuario,
              nombres: data.usuario?.nombre ?? data.usuario?.nombre,
              apellidos: data.usuario?.apellido ?? data.usuario?.apellido,
            };

            localStorage.setItem(
                "user_data",
                JSON.stringify({ user: data.user, usuario: enrichedUsuario })
            );

            setMessage("¡Bienvenido! Redirigiendo...");

            // ✅ CORREGIR: Pasar AMBOS user y usuario
            console.log("Llamando adoptToken con:", { user: data.user, usuario: data.usuario });
            await adoptToken(data.token, {
              user: data.user,
              usuario: data.usuario  // ← ESTO FALTABA
            });

            console.log("Navegando al dashboard...");
            navigate("/dashboard", { replace: true });

          } catch (error) {
            console.error("Error procesando login:", error);
            setMessage("Error procesando los datos de login");
          }
        } else {
          // ... manejo de errores existente
        }
      },
      [navigate, adoptToken]
  );

  return (
      <>
        <LoginBackend payload={loginPayload} onDone={handleLoginResult} />

        <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-blue-50 to-cyan-100 flex items-center justify-center p-4">
          {/* Background Pattern */}
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_80%,_rgba(120,119,198,0.1),_transparent_50%)] pointer-events-none"></div>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,_rgba(34,211,238,0.1),_transparent_50%)] pointer-events-none"></div>

          <div className="relative w-full max-w-md">
            {/* Main Card */}
            <div className="bg-white/70 backdrop-blur-sm p-8 md:p-10 rounded-3xl shadow-2xl border border-white/50">
              {/* Header */}
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-cyan-400 to-cyan-600 rounded-2xl mb-4 shadow-lg">
                  <img src="/dentist.svg" alt="Dentista" className="w-10 h-10" />
                </div>
                <h2 className="text-3xl font-bold text-gray-800 mb-2">
                  Clínica Dental
                </h2>
                <p className="text-gray-600">Ingresa a tu cuenta profesional</p>
              </div>

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label
                      htmlFor="email"
                      className="block text-sm font-semibold text-gray-700 mb-2"
                  >
                    Correo Electrónico
                  </label>
                  <div className="relative">
                    <input
                        type="email"
                        id="email"
                        placeholder="doctor@clinica.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-4 py-3 pl-12 bg-white/80 border-2 border-cyan-200 rounded-xl focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-200 transition-all duration-200 placeholder-gray-400"
                        required
                        disabled={isLoading}
                    />
                    <svg
                        className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-cyan-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                      <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                      />
                    </svg>
                  </div>
                </div>

                <div>
                  <label
                      htmlFor="password"
                      className="block text-sm font-semibold text-gray-700 mb-2"
                  >
                    Contraseña
                  </label>
                  <div className="relative">
                    <input
                        type="password"
                        id="password"
                        placeholder="••••••••"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full px-4 py-3 pl-12 bg-white/80 border-2 border-cyan-200 rounded-xl focus:outline-none focus:border-cyan-400 focus:ring-2 focus:ring-cyan-200 transition-all duration-200 placeholder-gray-400"
                        required
                        disabled={isLoading}
                    />
                    <svg
                        className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-cyan-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                      <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                      />
                    </svg>
                  </div>
                </div>

                <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-gradient-to-r from-cyan-400 to-cyan-600 text-white font-semibold py-3 px-6 rounded-xl hover:from-cyan-500 hover:to-cyan-700 focus:outline-none focus:ring-2 focus:ring-cyan-300 focus:ring-offset-2 transform transition-all duration-200 hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg"
                >
                  {isLoading ? (
                      <div className="flex items-center justify-center space-x-2">
                        <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                          <circle
                              className="opacity-25"
                              cx="12"
                              cy="12"
                              r="10"
                              stroke="currentColor"
                              strokeWidth="4"
                          ></circle>
                          <path
                              className="opacity-75"
                              fill="currentColor"
                              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                          ></path>
                        </svg>
                        <span>Iniciando sesión...</span>
                      </div>
                  ) : (
                      "Iniciar Sesión"
                  )}
                </button>
              </form>

              {/* Message */}
              {message && (
                  <div
                      className={`mt-6 p-4 rounded-xl text-center font-medium ${
                          message.includes("Bienvenido") || message.includes("exitoso")
                              ? "bg-green-50 text-green-700 border border-green-200"
                              : "bg-red-50 text-red-700 border border-red-200"
                      }`}
                  >
                    {message}
                  </div>
              )}

              {/* Footer Links */}
              <div className="mt-8 text-center space-y-3">
                <button
                    type="button"
                    className="text-sm text-cyan-600 hover:text-cyan-800 transition-colors font-medium"
                    onClick={() => navigate("/forgot-password")}
                    disabled={isLoading}
                >
                  ¿Olvidaste tu contraseña?
                </button>

                <div className="flex items-center justify-center space-x-2 text-sm text-gray-500">
                  <span>¿No tienes cuenta?</span>
                  <button
                      type="button"
                      className="text-cyan-600 hover:text-cyan-800 transition-colors font-medium"
                      onClick={() => navigate("/register")}
                      disabled={isLoading}
                  >
                    Regístrate aquí
                  </button>
                </div>
              </div>
            </div>

            {/* Bottom Text */}
            <div className="text-center mt-6">
              <p className="text-sm text-gray-500">
                Sistema de Gestión Dental • Versión 2.0
              </p>
            </div>
          </div>
        </div>
      </>
  );
};

export default Login;