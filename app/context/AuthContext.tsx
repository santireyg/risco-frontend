// app/context/AuthContext.tsx
"use client";

import React, { createContext, useState, useEffect, useContext, useCallback } from "react";
import { useRouter } from "next/navigation"; // Importa desde 'next/navigation' en App Router

import { api, ApiError } from "../lib/apiClient";
import { logger } from "../lib/logger";

// Define la estructura esperada de los datos del usuario desde /api/me
export interface UserProfile {
  _id: string;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  role: "user" | "admin" | "superadmin";
  status: "active" | "inactive" | "pending_approval";
  created_at?: string;
  last_login?: string;
}

interface AuthContextType {
  user: UserProfile | null; // Almacena el perfil completo del usuario
  // setUser es ahora interno, se maneja al verificar sesión o hacer login
  logout: () => Promise<void>;
  isLoading: boolean; // Indica si se está verificando la sesión inicial
  checkSession: () => Promise<void>; // Función para re-verificar la sesión manualmente si es necesario
  updateUserProfile: (updatedData: Partial<UserProfile>) => void; // Función para actualizar datos del usuario
}

// Valor inicial del contexto
const initialAuthContext: AuthContextType = {
  user: null,
  logout: async () => {},
  isLoading: true,
  checkSession: async () => {},
  updateUserProfile: () => {},
};

export const AuthContext = createContext<AuthContextType>(initialAuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const router = useRouter();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true); // Empieza cargando al inicio

  // Función para verificar la sesión actual llamando a /api/me
  const checkSession = useCallback(async () => {
    // No establecer isLoading a true aquí para evitar parpadeos si se llama manualmente
    // console.log("Checking session...");
    try {
      // Usa el apiClient con opción silent para evitar logs de error 401
      const userData = await api.get<UserProfile>("me", { silent: true });

      // console.log("Session check successful:", userData);
      setUser(userData);
    } catch (error) {
      // console.log("Session check failed:", error);
      setUser(null); // Asegura que el usuario sea null si la sesión no es válida
      if (error instanceof ApiError && error.status === 401) {
        // Es normal no tener sesión, no necesariamente un error a mostrar al usuario
        logger.info("No active session found via /me.");
      } else if (error instanceof Error && error.message.includes("conectar con el servidor")) {
        // Error de conexión con el backend - silenciar en modo silent
        logger.warn("Backend connection failed during session check.");
      } else {
        // Otro tipo de error inesperado
        logger.error("Error checking session:", error);
      }
      // No redirigir automáticamente aquí, podría causar bucles si la página
      // a la que redirige también llama a checkSession. La redirección
      // debería manejarse en las páginas/componentes que requieren autenticación.
    } finally {
      // Solo deja de cargar la primera vez
      if (isLoading) {
        setIsLoading(false);
      }
    }
  }, [isLoading]); // Depende de isLoading para la lógica inicial

  // Efecto para verificar la sesión al montar el proveedor
  useEffect(() => {
    checkSession();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [checkSession]); // Ejecutar solo una vez al montar

  // Función de Logout
  const logout = useCallback(async () => {
    logger.info("Attempting logout...");
    try {
      // Llama al endpoint de logout usando el apiClient
      await api.post("logout", {}); // No necesita cuerpo
      setUser(null); // Limpia el estado del usuario localmente
      logger.info("Logout successful, redirecting to login.");
      router.push("/login"); // Redirige a la página de login
    } catch (error) {
      // Aunque falle la llamada API, limpia el estado local y redirige
      setUser(null);
      logger.error("Error during API logout, but proceeding with local logout:", error);
      router.push("/login"); // Redirige igualmente
    }
  }, [router]);

  // Función para actualizar el perfil del usuario
  const updateUserProfile = useCallback(
    (updatedData: Partial<UserProfile>) => {
      if (user) {
        setUser({ ...user, ...updatedData });
      }
    },
    [user]
  );

  // Valor proporcionado por el contexto
  const value = {
    user,
    logout,
    isLoading,
    checkSession, // Expone checkSession por si se necesita
    updateUserProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

// Hook para consumir el contexto
export const useAuth = () => useContext(AuthContext);
