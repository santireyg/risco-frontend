// app/auth/hooks/useResetPassword.ts

import { useState, useEffect } from "react";

import { api, ApiError } from "../../lib/apiClient";
import {
  validateField,
  validationRules,
  validatePasswordMatch,
} from "../utils/validations";
import { getQueryParam } from "../utils/authHelpers";
import { SUCCESS_MESSAGES } from "../utils/constants";

export interface ResetPasswordData {
  new_password: string;
  confirm_password: string;
}

export interface ResetPasswordResponse {
  message: string;
  email_sent: boolean;
}

export interface ResetPasswordErrors {
  new_password?: string;
  confirm_password?: string;
  general?: string;
  token?: string;
}

export const useResetPassword = () => {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errors, setErrors] = useState<ResetPasswordErrors>({});
  const [token, setToken] = useState<string | null>(null);
  const [countdown, setCountdown] = useState(15);

  useEffect(() => {
    const urlToken = getQueryParam("token");

    if (!urlToken) {
      setErrors({ general: "Token de reset no encontrado." });
    } else {
      setToken(urlToken);
    }
  }, []);

  const validateForm = (data: ResetPasswordData): boolean => {
    const newErrors: ResetPasswordErrors = {};

    const passwordValidation = validateField(
      data.new_password,
      validationRules.password,
    );

    if (!passwordValidation.isValid) {
      newErrors.new_password = passwordValidation.message;
    }

    if (!validatePasswordMatch(data.new_password, data.confirm_password)) {
      newErrors.confirm_password = "Las contraseñas no coinciden";
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const resetPassword = async (data: ResetPasswordData) => {
    if (!token) {
      setErrors({
        token:
          "Token de reset no válido o expirado. Solicita un nuevo enlace de recuperación.",
      });

      return false;
    }

    if (!validateForm(data)) {
      return false;
    }

    setLoading(true);
    setErrors({});

    try {
      const response = await api.post<ResetPasswordResponse>(
        `user-registration/reset-password/${token}`,
        {
          new_password: data.new_password,
          confirm_password: data.confirm_password,
        },
      );

      setSuccess(true);

      // Log para debugging del email
      if (response?.email_sent === false) {
        console.warn(
          "Contraseña restablecida pero no se pudo enviar email de confirmación",
        );
      }

      // Iniciar countdown para redirección
      const interval = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            window.location.href = "/login";

            return 0;
          }

          return prev - 1;
        });
      }, 1000);

      return true;
    } catch (apiError) {
      if (apiError instanceof ApiError) {
        // Debug para entender la estructura del error
        console.log("Full API Error:", apiError);
        console.log("Response Body:", apiError.responseBody);

        // Extraer el mensaje de error del backend
        let detail = "";

        if (apiError.responseBody) {
          if (typeof apiError.responseBody === "string") {
            detail = apiError.responseBody;
          } else if (apiError.responseBody.detail) {
            detail = apiError.responseBody.detail;
          } else if (apiError.responseBody.message) {
            detail = apiError.responseBody.message;
          }
        }

        switch (apiError.status) {
          case 400:
            if (detail.includes("Token de reset inválido")) {
              setErrors({
                token:
                  "El enlace de recuperación no es válido. Asegúrate de usar el enlace completo del email.",
              });
            } else if (detail.includes("token de reset ha expirado")) {
              setErrors({
                token:
                  "El enlace de recuperación ha expirado. Solicita un nuevo enlace de recuperación.",
              });
            } else if (detail.includes("contraseñas no coinciden")) {
              setErrors({ confirm_password: "Las contraseñas no coinciden." });
            } else if (detail.includes("contraseña debe tener")) {
              setErrors({
                new_password:
                  "La contraseña debe tener al menos 8 caracteres, incluir mayúsculas, minúsculas y números.",
              });
            } else {
              // Mostrar el mensaje exacto del backend si no coincide con ningún patrón
              setErrors({
                general:
                  detail || "Error de validación. Revisa los datos ingresados.",
              });
            }
            break;

          case 500:
            setErrors({
              general:
                "Error interno del servidor. Intenta más tarde o contacta al soporte.",
            });
            break;

          default:
            setErrors({
              general: `Error inesperado (${apiError.status}). Intenta nuevamente.`,
            });
        }
      } else {
        setErrors({
          general:
            "Error de conexión. Verifica tu internet e intenta nuevamente.",
        });
      }

      return false;
    } finally {
      setLoading(false);
    }
  };

  const clearErrors = () => setErrors({});

  return {
    loading,
    success,
    errors,
    token,
    countdown,
    resetPassword,
    clearErrors,
    successMessage: SUCCESS_MESSAGES.PASSWORD_RESET,
  };
};
