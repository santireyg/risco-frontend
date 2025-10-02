// app/auth/hooks/useForgotPassword.ts

import { useState } from "react";

import { api, ApiError } from "../../lib/apiClient";
import { validateField, validationRules } from "../utils/validations";
import { setRateLimitAttempt } from "../utils/authHelpers";
import { SUCCESS_MESSAGES, RATE_LIMIT_KEYS } from "../utils/constants";

export interface ForgotPasswordResponse {
  message: string;
}

export const useForgotPassword = () => {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendResetEmail = async (email: string) => {
    const emailValidation = validateField(email, validationRules.email);

    if (!emailValidation.isValid) {
      setError(emailValidation.message || "Email inválido");

      return false;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await api.post<ForgotPasswordResponse>(
        "user-registration/forgot-password",
        { email },
      );

      setRateLimitAttempt(RATE_LIMIT_KEYS.FORGOT_PASSWORD);
      setSuccess(true);

      // Nota: El backend siempre retorna el mismo mensaje por seguridad
      // No debemos mostrar si el email existe o no
      console.log("Reset password response:", response.message);

      return true;
    } catch (apiError) {
      if (apiError instanceof ApiError) {
        switch (apiError.status) {
          case 429:
            setError(
              "Demasiados intentos de recuperación. Espera un momento antes de intentar nuevamente.",
            );
            break;
          case 500:
            setError(
              "Error interno del servidor. Intenta más tarde o contacta al soporte.",
            );
            break;
          default:
            // Mantener mensaje genérico para no revelar información sobre usuarios
            setError("Error al procesar la solicitud. Intenta nuevamente.");
        }
      } else {
        setError(
          "Error de conexión. Verifica tu internet e intenta nuevamente.",
        );
      }

      return false;
    } finally {
      setLoading(false);
    }
  };

  const clearError = () => setError(null);
  const resetForm = () => {
    setSuccess(false);
    setError(null);
  };

  return {
    loading,
    success,
    error,
    sendResetEmail,
    clearError,
    resetForm,
    successMessage: SUCCESS_MESSAGES.PASSWORD_RESET_SENT,
  };
};
