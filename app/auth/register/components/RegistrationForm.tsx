// app/auth/register/components/RegistrationForm.tsx

import React, { useState } from "react";
import { Input } from "@heroui/input";
import { Button } from "@heroui/button";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Form } from "@heroui/form";
import { Alert } from "@heroui/alert";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";

import {
  type RegistrationData,
  type RegistrationErrors,
  type FieldValidationState,
} from "../../hooks/useRegistration";

import PasswordStrengthIndicator from "./PasswordStrengthIndicator";

interface RegistrationFormProps {
  registrationHook: {
    loading: boolean;
    errors: RegistrationErrors;
    fieldValidation: Record<
      keyof Omit<RegistrationData, "general">,
      FieldValidationState
    >;
    register: (data: RegistrationData) => Promise<boolean>;
    clearErrors: () => void;
    clearFieldError: (field: keyof RegistrationData) => void;
  };
}

const RegistrationForm: React.FC<RegistrationFormProps> = ({
  registrationHook,
}) => {
  const {
    loading,
    errors,
    fieldValidation,
    register,
    clearErrors,
    clearFieldError,
  } = registrationHook;
  const [formData, setFormData] = useState<RegistrationData>({
    email: "",
    password: "",
    first_name: "",
    last_name: "",
    username: "",
  });
  const [showPassword, setShowPassword] = useState(false);

  const handleInputChange =
    (field: keyof RegistrationData) => (value: string) => {
      setFormData((prev) => ({ ...prev, [field]: value }));

      // Solo limpiar errores del servidor, no validar en tiempo real
      clearFieldError(field);
    };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await register(formData);
  };

  // Preparar validationErrors para el Form (solo errores generales)
  const formValidationErrors: Record<string, string> = {};

  if (errors.general) {
    formValidationErrors.general = errors.general;
  }

  return (
    <Card className="max-w-md mx-auto py-3 px-3">
      <CardHeader className="flex flex-col space-y-1 py-4">
        <h1 className="text-2xl font-medium text-foreground-700 text-center">
          Crear cuenta
        </h1>
        <p className="text-foreground-600 text-center text-sm">
          Completa todos los campos para registrarte
        </p>
      </CardHeader>

      <CardBody className="space-y-4">
        <Form
          className="space-y-4 mx-1"
          validationErrors={formValidationErrors}
          onSubmit={handleSubmit}
        >
          <div className="grid grid-cols-2 gap-3 w-full">
            <Input
              isRequired
              errorMessage={fieldValidation.first_name.errorMessage}
              isInvalid={fieldValidation.first_name.isInvalid}
              label="Nombre"
              name="first_name"
              placeholder="Tu nombre"
              value={formData.first_name}
              onValueChange={handleInputChange("first_name")}
            />

            <Input
              isRequired
              errorMessage={fieldValidation.last_name.errorMessage}
              isInvalid={fieldValidation.last_name.isInvalid}
              label="Apellido"
              name="last_name"
              placeholder="Tu apellido"
              value={formData.last_name}
              onValueChange={handleInputChange("last_name")}
            />
          </div>

          <Input
            isRequired
            description="Usa tu email corporativo"
            errorMessage={fieldValidation.email.errorMessage}
            isInvalid={fieldValidation.email.isInvalid}
            label="Email"
            name="email"
            placeholder="usuario@empresa.com"
            type="email"
            value={formData.email}
            onValueChange={handleInputChange("email")}
          />

          <Input
            isRequired
            description="3-20 caracteres"
            errorMessage={fieldValidation.username.errorMessage}
            isInvalid={fieldValidation.username.isInvalid}
            label="Username"
            name="username"
            placeholder="nombre_usuario"
            value={formData.username}
            onValueChange={handleInputChange("username")}
          />

          <div className="w-full">
            <Input
              isRequired
              className="w-full"
              description="Mínimo 8 caracteres, incluye mayúsculas, minúsculas y números"
              endContent={
                <button
                  className="focus:outline-none"
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeSlashIcon className="h-4 w-4 text-default-400" />
                  ) : (
                    <EyeIcon className="h-4 w-4 text-default-400" />
                  )}
                </button>
              }
              errorMessage={fieldValidation.password.errorMessage}
              isInvalid={fieldValidation.password.isInvalid}
              label="Contraseña"
              minLength={8}
              name="password"
              placeholder="Tu contraseña"
              type={showPassword ? "text" : "password"}
              value={formData.password}
              onValueChange={handleInputChange("password")}
            />
            <div className="w-full">
              <PasswordStrengthIndicator password={formData.password} />
            </div>
          </div>

          {/* Mensaje de error general usando Alert - solo para errores no específicos de campos */}
          {errors.general && (
            <Alert
              isClosable
              color="danger"
              description={errors.general}
              title="Error"
              variant="flat"
              onClose={clearErrors}
            />
          )}

          <Button
            className="w-full"
            color="primary"
            isDisabled={loading}
            isLoading={loading}
            type="submit"
          >
            {loading ? "Registrando..." : "Crear cuenta"}
          </Button>
        </Form>

        <div className="text-center pt-4 border-t border-divider">
          <p className="text-sm text-foreground-600">
            ¿Ya tienes cuenta?{" "}
            <a className="text-primary hover:underline" href="/login">
              Inicia sesión
            </a>
          </p>
        </div>
      </CardBody>
    </Card>
  );
};

export default RegistrationForm;
