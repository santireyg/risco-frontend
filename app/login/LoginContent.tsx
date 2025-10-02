// app/login/LoginContent.tsx
"use client";

import React, { useState, FormEvent } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

import { Alert } from "@heroui/alert";
import { Button } from "@heroui/button";

import { api, ApiError } from "../lib/apiClient";
import { useAuth } from "../context/AuthContext";

const LoginContent: React.FC = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  // Llama a checkSession desde useAuth para actualizar el contexto
  const { checkSession } = useAuth();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null); // Estado para mensajes de error
  const [isLoggingIn, setIsLoggingIn] = useState(false); // Estado para deshabilitar botón

  // Revisa si la URL tiene el parámetro ?expired=1
  const sessionExpired = searchParams.get("expired") === "1";

  const handleLogin = async (e: FormEvent) => {
    e.preventDefault(); // Previene el envío tradicional del formulario
    setError(null); // Limpia errores anteriores
    setIsLoggingIn(true); // Deshabilita botón

    try {
      // 1. Prepara el cuerpo para 'application/x-www-form-urlencoded'
      const loginBody = new URLSearchParams();

      loginBody.append("username", username);
      loginBody.append("password", password);

      // 2. Llama al endpoint de login usando el apiClient
      // El apiClient se encarga de 'credentials: include' y manejo básico
      await api.post<{ message: string }>("login", loginBody); // Espera un { message: "..." }

      // 3. Si el login fue exitoso (no lanzó error), la cookie HttpOnly DEBERÍA estar establecida.
      //    Ahora, verifica la sesión y actualiza el estado global llamando a checkSession.
      await checkSession(); // checkSession llama a /api/me y actualiza el contexto

      console.log("Login successful, redirecting to home...");
      // 4. Redirige a la página principal
      router.push("/home");
    } catch (error) {
      console.error("Login failed:", error);
      setIsLoggingIn(false); // Habilita el botón de nuevo

      // Manejo de errores específico
      if (error instanceof ApiError) {
        if (error.status === 400 || error.status === 404) {
          // Errores comunes de login (usuario no encontrado, contraseña incorrecta)
          const detail =
            error.responseBody?.detail || "Los datos enviados son inválidos. Verifique usuario y contraseña e intente de nuevo.";

          setError(detail);
        } else if (error.status === 401) {
          setError("Usuario o contraseña incorrectos.");
        } else if (error.status === 403) {
          // Cuenta no activada u otro forbidden
          const detail = error.responseBody?.detail || "Tu cuenta no está activa. Espera aprobación de un administrador.";

          setError(detail);
        } else if (error.status === 410) {
          // Cuenta eliminada (deleted)
          const detail = error.responseBody?.detail || "Esta cuenta ha sido eliminada y ya no está disponible.";

          setError(detail);
        } else if (error.status === 429) {
          // Rate limit alcanzado
          const detail = error.responseBody?.detail || "Demasiados intentos fallidos. Intenta nuevamente en unos minutos.";

          setError(detail);
        } else {
          // Otro error de la API
          setError(`Error del servidor (${error.status}): ${error.message}`);
        }
      } else {
        // Error de red u otro
        setError("Error de conexión. Por favor, intente de nuevo más tarde.");
      }
    }
    // No necesitas habilitar el botón aquí si la redirección es exitosa
    // setIsLoggingIn(false); // Solo se habilita si hay error
  };

  return (
    <div className="h-[calc(100vh-5rem-1px)] bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100 flex flex-col items-center justify-center px-4 py-8">
      {/* Card principal que contiene todo */}
      <div className="bg-white p-10 rounded-2xl shadow-xl w-full max-w-lg border border-gray-100">
        {/* Header con bienvenida, logo y título */}
        <div className="text-center mb-8 mt-6">
          <div className="flex justify-center mb-6">
            <Image alt="Integrity IA Logo" height={60} src="/integrity-logo.svg" width={300} />
          </div>

          <h1 className="text-xl font-medium text-gray-800">Bienvenido</h1>

          <p className="text-lg font-light text-gray-500 mb-6">IA analítica en Caución</p>

          {/* Divisor */}
          <div className="border-t border-gray-200" />
        </div>

        <form aria-busy={isLoggingIn} onSubmit={handleLogin}>
          {/* Muestra alerta si la sesión expiró */}
          {sessionExpired &&
            !error && ( // No mostrar si ya hay otro error
              <div className="mb-6">
                <Alert
                  color="warning"
                  description="Su sesión ha expirado. Por favor, inicie sesión nuevamente."
                  variant="faded"
                />
              </div>
            )}

          {/* Muestra alerta de error si existe */}
          {error && (
            <div className="mb-6">
              <Alert color="danger" description={error} variant="faded" />
            </div>
          )}

          <h2 className="text-xl font-medium mb-4 text-left text-gray-600">Iniciar Sesión</h2>

          <div className="mb-4">
            <label className="block text-gray-700 mb-2 font-medium" htmlFor="username">
              Usuario
            </label>
            <input
              required
              autoComplete="username"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
              disabled={isLoggingIn}
              id="username"
              placeholder="Ingrese su usuario"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </div>

          <div className="mb-6">
            <label className="block text-gray-700 mb-2 font-medium" htmlFor="password">
              Contraseña
            </label>
            <input
              required
              autoComplete="current-password"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
              disabled={isLoggingIn}
              id="password"
              placeholder="Ingrese su contraseña"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          <Button
            fullWidth
            className="text-md py-3 font-semibold mb-6"
            color="primary"
            disabled={isLoggingIn}
            isLoading={isLoggingIn}
            size="lg"
            type="submit"
            variant="solid">
            {isLoggingIn ? "Iniciando sesión..." : "Iniciar sesión"}
          </Button>
        </form>

        {/* Enlaces discretos al mismo nivel */}
        <div className="flex justify-between items-center text-sm text-gray-500">
          <Link className="hover:text-gray-700 transition-colors duration-200" href="/auth/forgot-password">
            ¿Olvidaste tu contraseña?
          </Link>

          <div className="text-center">
            <span className="mr-1">¿No tienes una cuenta?</span>
            <Link className="text-blue-600 hover:text-blue-800 font-medium transition-colors duration-200" href="/auth/register">
              Registrarse
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginContent;
