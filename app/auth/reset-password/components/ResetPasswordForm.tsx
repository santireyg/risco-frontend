// app/auth/reset-password/components/ResetPasswordForm.tsx

import React, { useState } from "react";
import { Input } from "@heroui/input";
import { Button } from "@heroui/button";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";

import {
  useResetPassword,
  type ResetPasswordData,
} from "../../hooks/useResetPassword";
import PasswordStrengthIndicator from "../../register/components/PasswordStrengthIndicator";

import ResetSuccessMessage from "./ResetSuccessMessage";

const ResetPasswordForm: React.FC = () => {
  const {
    loading,
    errors,
    token,
    success,
    successMessage,
    countdown,
    resetPassword,
    clearErrors,
  } = useResetPassword();
  const [formData, setFormData] = useState<ResetPasswordData>({
    new_password: "",
    confirm_password: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleInputChange =
    (field: keyof ResetPasswordData) => (value: string) => {
      setFormData((prev) => ({ ...prev, [field]: value }));
      if (errors[field]) {
        clearErrors();
      }
    };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await resetPassword(formData);
  };

  if (success) {
    return (
      <ResetSuccessMessage countdown={countdown} message={successMessage} />
    );
  }

  if (!token) {
    return (
      <Card className="max-w-md mx-auto">
        <CardBody className="text-center p-4">
          <div className="space-y-4">
            <h2 className="text-xl font-semibold text-danger">
              Token no válido
            </h2>
            <p className="text-foreground-600">
              El enlace de recuperación no es válido o ha expirado.
            </p>
            <Button
              as="a"
              color="primary"
              href="/auth/forgot-password"
              variant="ghost"
            >
              Solicitar nuevo enlace
            </Button>
          </div>
        </CardBody>
      </Card>
    );
  }

  return (
    <Card className="max-w-md mx-auto p-4">
      <CardHeader className="flex flex-col space-y-1 pb-4">
        <h1 className="text-2xl font-bold text-center">Nueva Contraseña</h1>
        <p className="text-foreground-600 text-center text-sm">
          Ingresa tu nueva contraseña para completar la recuperación
        </p>
      </CardHeader>

      <CardBody className="space-y-4">
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <Input
              isRequired
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
              errorMessage={errors.new_password}
              isInvalid={!!errors.new_password}
              label="Nueva Contraseña"
              placeholder="Tu nueva contraseña"
              type={showPassword ? "text" : "password"}
              value={formData.new_password}
              onValueChange={handleInputChange("new_password")}
            />
            <PasswordStrengthIndicator password={formData.new_password} />
          </div>

          <Input
            isRequired
            endContent={
              <button
                className="focus:outline-none"
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? (
                  <EyeSlashIcon className="h-4 w-4 text-default-400" />
                ) : (
                  <EyeIcon className="h-4 w-4 text-default-400" />
                )}
              </button>
            }
            errorMessage={errors.confirm_password}
            isInvalid={!!errors.confirm_password}
            label="Confirmar Contraseña"
            placeholder="Confirma tu nueva contraseña"
            type={showConfirmPassword ? "text" : "password"}
            value={formData.confirm_password}
            onValueChange={handleInputChange("confirm_password")}
          />

          {errors.general && (
            <div className="p-3 bg-danger-50 border border-danger-200 rounded-lg text-danger-600 text-sm">
              {errors.general}
            </div>
          )}

          {errors.token && (
            <div className="p-3 bg-danger-50 border border-danger-200 rounded-lg text-danger-600 text-sm">
              <div className="font-semibold mb-1">Error de Token</div>
              <div>{errors.token}</div>
              <div className="mt-2">
                <Button
                  as="a"
                  color="danger"
                  href="/auth/forgot-password"
                  size="sm"
                  variant="ghost"
                >
                  Solicitar nuevo enlace
                </Button>
              </div>
            </div>
          )}

          <Button
            className="w-full"
            color="primary"
            isDisabled={loading}
            isLoading={loading}
            type="submit"
          >
            {loading ? "Actualizando..." : "Actualizar Contraseña"}
          </Button>
        </form>

        <div className="text-center pt-4 border-t border-divider">
          <a className="text-primary hover:underline text-sm" href="/login">
            Volver al inicio de sesión
          </a>
        </div>
      </CardBody>
    </Card>
  );
};

export default ResetPasswordForm;
