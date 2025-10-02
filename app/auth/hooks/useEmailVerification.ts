// app/auth/hooks/useEmailVerification.ts

import { useState, useCallback } from "react";

import { api, ApiError } from "../../lib/apiClient";
import { getTokenFromPath, removeTokenFromPath } from "../utils/authHelpers";

export interface EmailVerificationResponse {
  message: string;
  admin_notified: boolean;
}

export interface EmailVerificationResult {
  success: boolean;
  message: string;
  error?: string;
  isExpired?: boolean;
  isAlreadyVerified?: boolean;
  adminNotified?: boolean;
}

export const useEmailVerification = () => {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<EmailVerificationResult | null>(null);

  const verifyEmail = useCallback(
    async (token: string): Promise<EmailVerificationResult> => {
      setLoading(true);
      setResult(null);

      try {
        const response = await api.get<EmailVerificationResponse>(
          `user-registration/verify-email/${token}`,
        );

        const verificationResult: EmailVerificationResult = {
          success: true,
          message: response.message,
          adminNotified: response.admin_notified,
          isAlreadyVerified: response.message.includes("ya ha sido verificado"),
        };

        setResult(verificationResult);

        return verificationResult;
      } catch (error) {
        let verificationResult: EmailVerificationResult = {
          success: false,
          message: "Error al verificar el email",
          error: "Error desconocido",
        };

        if (error instanceof ApiError) {
          const detail = error.responseBody?.detail || "";

          switch (error.status) {
            case 400:
              if (detail.includes("Token de verificación inválido")) {
                verificationResult = {
                  success: false,
                  message: "Enlace de verificación inválido",
                  error:
                    "El enlace de verificación no es válido. Asegúrate de haber copiado la URL completa del email.",
                };
              } else if (detail.includes("token de verificación ha expirado")) {
                verificationResult = {
                  success: false,
                  message: "Enlace de verificación expirado",
                  error:
                    "El enlace de verificación ha expirado. Solicita un nuevo enlace de verificación.",
                  isExpired: true,
                };
              } else {
                verificationResult = {
                  success: false,
                  message: "Error de verificación",
                  error: detail || "Error en la verificación del email",
                };
              }
              break;

            case 500:
              verificationResult = {
                success: false,
                message: "Error del servidor",
                error:
                  "Error interno del servidor. Intenta más tarde o contacta al soporte.",
              };
              break;

            default:
              verificationResult = {
                success: false,
                message: "Error inesperado",
                error: `Error inesperado (${error.status}). Intenta nuevamente.`,
              };
          }
        } else {
          verificationResult = {
            success: false,
            message: "Error de conexión",
            error:
              "Error de conexión. Verifica tu internet e intenta nuevamente.",
          };
        }

        setResult(verificationResult);

        return verificationResult;
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  // Hook para verificar automáticamente si hay un token en la URL
  const verifyFromUrl = () => {
    const token = getTokenFromPath();

    if (token) {
      verifyEmail(token).then(() => {
        // Limpiar token de la URL después de la verificación
        removeTokenFromPath();
      });
    }
  };

  const clearResult = useCallback(() => setResult(null), []);

  return {
    loading,
    result,
    verifyEmail,
    verifyFromUrl,
    clearResult,
  };
};
