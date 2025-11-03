// app/auth/hooks/useProfile.ts

import { useState } from "react";

import { api, ApiError } from "../../lib/apiClient";
import {
  validateField,
  validationRules,
  validatePasswordMatch,
} from "../utils/validations";
import { useAuth } from "../../context/AuthContext";

export interface ProfileUpdateData {
  first_name: string;
  last_name: string;
  username: string;
  current_password: string; // Requerido por el backend
}

export interface ProfileUpdateResponse {
  message: string;
  changes: string[];
  email_sent: boolean;
}

export interface PasswordChangeData {
  current_password: string;
  new_password: string;
  confirm_password: string;
}

export interface PasswordChangeResponse {
  message: string;
  email_sent: boolean;
}

export interface ProfileErrors {
  first_name?: string;
  last_name?: string;
  username?: string;
  current_password?: string;
  new_password?: string;
  confirm_password?: string;
  general?: string;
}

export const useProfile = () => {
  const { user, updateUserProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [errors, setErrors] = useState<ProfileErrors>({});
  const [success, setSuccess] = useState<string | null>(null);

  const validateProfileForm = (data: ProfileUpdateData): boolean => {
    const newErrors: ProfileErrors = {};

    if (!data.current_password.trim()) {
      newErrors.current_password =
        "La contraseña actual es requerida para confirmar cambios";
    }

    const firstNameValidation = validateField(
      data.first_name,
      validationRules.names,
    );

    if (!firstNameValidation.isValid) {
      newErrors.first_name = firstNameValidation.message;
    }

    const lastNameValidation = validateField(
      data.last_name,
      validationRules.names,
    );

    if (!lastNameValidation.isValid) {
      newErrors.last_name = lastNameValidation.message;
    }

    const usernameValidation = validateField(
      data.username,
      validationRules.username,
    );

    if (!usernameValidation.isValid) {
      newErrors.username = usernameValidation.message;
    }

    setErrors(newErrors);

    return Object.keys(newErrors).length === 0;
  };

  const validatePasswordForm = (data: PasswordChangeData): boolean => {
    const newErrors: ProfileErrors = {};

    if (!data.current_password.trim()) {
      newErrors.current_password = "La contraseña actual es requerida";
    }

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

  const updateProfile = async (data: ProfileUpdateData) => {
    if (!validateProfileForm(data)) {
      return false;
    }

    setLoading(true);
    setErrors({});
    setSuccess(null);

    try {
      const response = await api.put<ProfileUpdateResponse>(
        "user-registration/update-profile",
        data,
      );

      // Actualizar el usuario en el contexto sin current_password
      const updateData = (({
        current_password: _unusedCurrentPassword,
        ...rest
      }: ProfileUpdateData) => rest)(data);

      updateUserProfile(updateData);

      let successMessage = response.message;

      if (response.changes && response.changes.length > 0) {
        successMessage += `\n\nCambios realizados:\n• ${response.changes.join("\n• ")}`;
      }
      if (response.email_sent === false) {
        successMessage += "\n\n⚠️ No se pudo enviar la notificación por email.";
      }

      setSuccess(successMessage);

      return true;
    } catch (apiError) {
      if (apiError instanceof ApiError) {
        const detail = apiError.responseBody?.detail || "";

        switch (apiError.status) {
          case 400:
            if (detail.includes("Contraseña actual incorrecta")) {
              setErrors({
                current_password: "La contraseña actual es incorrecta.",
              });
            } else if (detail.includes("nombre de usuario ya está en uso")) {
              setErrors({ username: "El nombre de usuario ya está en uso." });
            } else if (detail.includes("No se detectaron cambios")) {
              setErrors({ general: "No se detectaron cambios en el perfil." });
            } else {
              // Errores de validación del backend
              const backendErrors = apiError.responseBody?.errors || {};

              setErrors(
                Object.keys(backendErrors).length > 0
                  ? backendErrors
                  : { general: detail || "Error de validación." },
              );
            }
            break;

          case 429:
            setErrors({
              general:
                "Demasiadas actualizaciones. Espera un momento antes de intentar nuevamente.",
            });
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

  const changePassword = async (data: PasswordChangeData) => {
    if (!validatePasswordForm(data)) {
      return false;
    }

    setPasswordLoading(true);
    setErrors({});
    setSuccess(null);

    try {
      const response = await api.put<PasswordChangeResponse>(
        "user-registration/change-password",
        data,
      );

      let successMessage = response.message;

      if (response.email_sent === false) {
        successMessage += "\n\n⚠️ No se pudo enviar la confirmación por email.";
      }

      setSuccess(successMessage);

      return true;
    } catch (apiError) {
      if (apiError instanceof ApiError) {
        const detail = apiError.responseBody?.detail || "";

        switch (apiError.status) {
          case 400:
            if (detail.includes("Contraseña actual incorrecta")) {
              setErrors({
                current_password: "La contraseña actual es incorrecta.",
              });
            } else if (detail.includes("contraseñas nuevas no coinciden")) {
              setErrors({
                confirm_password: "Las contraseñas nuevas no coinciden.",
              });
            } else if (detail.includes("contraseña debe tener")) {
              setErrors({
                new_password:
                  "La nueva contraseña debe tener al menos 8 caracteres, incluir mayúsculas, minúsculas y números.",
              });
            } else {
              setErrors({
                general: detail || "Error en los datos proporcionados.",
              });
            }
            break;

          case 429:
            setErrors({
              general:
                "Demasiados intentos de cambio de contraseña. Espera un momento antes de intentar nuevamente.",
            });
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
      setPasswordLoading(false);
    }
  };

  const clearErrors = () => setErrors({});
  const clearSuccess = () => setSuccess(null);

  return {
    user,
    loading,
    passwordLoading,
    errors,
    success,
    updateProfile,
    changePassword,
    clearErrors,
    clearSuccess,
  };
};
