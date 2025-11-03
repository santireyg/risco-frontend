// app/auth/hooks/useRegistration.ts

import { useState, useCallback } from "react";

import { api, ApiError } from "../../lib/apiClient";
import { logger } from "../../lib/logger";
import {
  validateField,
  validateEmailField,
  validationRules,
} from "../utils/validations";
import { setRateLimitAttempt } from "../utils/authHelpers";
import { SUCCESS_MESSAGES, RATE_LIMIT_KEYS } from "../utils/constants";

export interface RegistrationData {
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  username: string;
}

export interface RegistrationResponse {
  message: string;
  email_sent: boolean;
}

export interface RegistrationErrors {
  email?: string;
  password?: string;
  first_name?: string;
  last_name?: string;
  username?: string;
  general?: string;
}

export interface FieldValidationState {
  isInvalid: boolean;
  errorMessage?: string;
}

export const useRegistration = () => {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errors, setErrors] = useState<RegistrationErrors>({});
  const [fieldValidation, setFieldValidation] = useState<
    Record<keyof Omit<RegistrationData, "general">, FieldValidationState>
  >({
    email: { isInvalid: false },
    password: { isInvalid: false },
    first_name: { isInvalid: false },
    last_name: { isInvalid: false },
    username: { isInvalid: false },
  });

  // Validación individual de campos en tiempo real
  const validateSingleField = useCallback(
    (field: keyof RegistrationData, value: string): FieldValidationState => {
      if (!value.trim()) {
        return { isInvalid: false }; // No mostrar error si está vacío (se maneja con isRequired)
      }

      // Usar validación específica para email
      if (field === "email") {
        const validation = validateEmailField(value);

        return {
          isInvalid: !validation.isValid,
          errorMessage: validation.message,
        };
      }

      const validationRule =
        validationRules[field as keyof typeof validationRules];

      if (!validationRule) {
        return { isInvalid: false };
      }

      const validation = validateField(value, validationRule);

      return {
        isInvalid: !validation.isValid,
        errorMessage: validation.message,
      };
    },
    [],
  );

  // Limpiar errores del servidor cuando el usuario modifica un campo
  const clearFieldError = useCallback(
    (field: keyof RegistrationData) => {
      // Solo limpiar errores del servidor, no validar en tiempo real
      if (errors[field]) {
        setErrors((prev) => ({
          ...prev,
          [field]: undefined,
        }));
      }

      // Limpiar validación visual del campo si existe
      if (fieldValidation[field as keyof typeof fieldValidation]?.isInvalid) {
        setFieldValidation((prev) => ({
          ...prev,
          [field]: { isInvalid: false },
        }));
      }
    },
    [errors, fieldValidation],
  );

  const validateForm = (data: RegistrationData): boolean => {
    const newErrors: RegistrationErrors = {};
    const newFieldValidation: Record<
      keyof Omit<RegistrationData, "general">,
      FieldValidationState
    > = {
      email: { isInvalid: false },
      password: { isInvalid: false },
      first_name: { isInvalid: false },
      last_name: { isInvalid: false },
      username: { isInvalid: false },
    };

    // Validar cada campo
    (Object.keys(data) as Array<keyof RegistrationData>).forEach((field) => {
      if (field === "email") {
        const validation = validateEmailField(data[field]);

        if (!validation.isValid) {
          newErrors[field] = validation.message;
          newFieldValidation[field] = {
            isInvalid: true,
            errorMessage: validation.message,
          };
        }
      } else {
        const validationRule =
          validationRules[field as keyof typeof validationRules];

        if (validationRule) {
          const validation = validateField(data[field], validationRule);

          if (!validation.isValid) {
            newErrors[field] = validation.message;
            newFieldValidation[
              field as keyof Omit<RegistrationData, "general">
            ] = {
              isInvalid: true,
              errorMessage: validation.message,
            };
          }
        }
      }
    });

    setErrors(newErrors);
    setFieldValidation(newFieldValidation);

    return Object.keys(newErrors).length === 0;
  };

  const register = async (data: RegistrationData) => {
    if (!validateForm(data)) {
      return false;
    }

    setLoading(true);
    setErrors({});
    // Limpiar validaciones de campos al enviar
    setFieldValidation({
      email: { isInvalid: false },
      password: { isInvalid: false },
      first_name: { isInvalid: false },
      last_name: { isInvalid: false },
      username: { isInvalid: false },
    });

    try {
      const response = await api.post<RegistrationResponse>(
        "user-registration/register",
        data,
      );

      setRateLimitAttempt(RATE_LIMIT_KEYS.REGISTER);
      setSuccess(true);

      // Log para debugging del email
      if (response?.email_sent === false) {
        logger.warn(
          "Usuario registrado pero no se pudo enviar email de verificación",
        );
      }

      return true;
    } catch (error) {
      if (error instanceof ApiError) {
        const detail = error.responseBody?.detail || "";

        switch (error.status) {
          case 400:
            // Errores específicos de validación del backend
            if (detail.includes("dominio del email no está permitido")) {
              const emailError =
                "El dominio de tu email no está permitido para registro. Contacta al administrador.";

              setErrors({ email: emailError });
              setFieldValidation((prev) => ({
                ...prev,
                email: {
                  isInvalid: true,
                  errorMessage: emailError,
                },
              }));
            } else if (detail.includes("contraseña debe tener")) {
              const passwordError =
                "La contraseña debe tener al menos 8 caracteres, incluir mayúsculas, minúsculas y números.";

              setErrors({ password: passwordError });
              setFieldValidation((prev) => ({
                ...prev,
                password: {
                  isInvalid: true,
                  errorMessage: passwordError,
                },
              }));
            } else if (
              detail.includes("usuario o correo ya están registrados")
            ) {
              // Determinar si es el email o el username el que ya existe
              // Por defecto, mostramos error general pero también marcamos ambos campos
              const errorMessage =
                "El email o nombre de usuario ya están registrados. ¿Ya tienes una cuenta?";

              setErrors({ general: errorMessage });

              // Marcar ambos campos como inválidos ya que no sabemos cuál específicamente
              setFieldValidation((prev) => ({
                ...prev,
                email: {
                  isInvalid: true,
                  errorMessage: "Este email podría estar ya registrado",
                },
                username: {
                  isInvalid: true,
                  errorMessage:
                    "Este nombre de usuario podría estar ya registrado",
                },
              }));
            } else if (detail.includes("Error de validación")) {
              setErrors({
                general: "Datos inválidos. Revisa la información ingresada.",
              });
            } else {
              // Intentar parsear errores específicos del backend si vienen en formato estructurado
              try {
                const backendErrors = error.responseBody?.errors || {};

                if (Object.keys(backendErrors).length > 0) {
                  setErrors(backendErrors);
                  // Actualizar field validation para los errores del backend
                  const newFieldValidation = { ...fieldValidation };

                  Object.entries(backendErrors).forEach(([field, message]) => {
                    if (field in newFieldValidation) {
                      newFieldValidation[
                        field as keyof typeof newFieldValidation
                      ] = {
                        isInvalid: true,
                        errorMessage: message as string,
                      };
                    }
                  });
                  setFieldValidation(newFieldValidation);
                } else {
                  setErrors({ general: detail || "Error de validación." });
                }
              } catch {
                setErrors({ general: detail || "Error de validación." });
              }
            }
            break;

          case 422:
            setErrors({
              general:
                "Los datos enviados no son válidos. Revisa el formulario.",
            });
            break;

          case 429:
            setErrors({
              general:
                "Demasiados intentos de registro. Espera un momento antes de intentar nuevamente.",
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
              general: `Error inesperado (${error.status}). Intenta nuevamente.`,
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

  const clearErrors = () => {
    setErrors({});
    setFieldValidation({
      email: { isInvalid: false },
      password: { isInvalid: false },
      first_name: { isInvalid: false },
      last_name: { isInvalid: false },
      username: { isInvalid: false },
    });
  };

  const resetForm = () => {
    setSuccess(false);
    setErrors({});
    setFieldValidation({
      email: { isInvalid: false },
      password: { isInvalid: false },
      first_name: { isInvalid: false },
      last_name: { isInvalid: false },
      username: { isInvalid: false },
    });
  };

  return {
    loading,
    success,
    errors,
    fieldValidation,
    register,
    clearErrors,
    resetForm,
    clearFieldError,
    validateSingleField,
    successMessage: SUCCESS_MESSAGES.REGISTRATION,
  };
};
