// app/profile/components/PasswordChangeForm.tsx

import React, { useState } from "react";
import { Input } from "@heroui/input";
import { Button } from "@heroui/button";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";

import {
  useProfile,
  type PasswordChangeData,
} from "../../auth/hooks/useProfile";
import PasswordStrengthIndicator from "../../auth/register/components/PasswordStrengthIndicator";

const PasswordChangeForm: React.FC = () => {
  const {
    passwordLoading,
    errors,
    success,
    changePassword,
    clearErrors,
    clearSuccess,
  } = useProfile();
  const [formData, setFormData] = useState<PasswordChangeData>({
    current_password: "",
    new_password: "",
    confirm_password: "",
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });

  const handleInputChange =
    (field: keyof PasswordChangeData) => (value: string) => {
      setFormData((prev) => ({ ...prev, [field]: value }));
      if (errors[field]) {
        clearErrors();
      }
      if (success) {
        clearSuccess();
      }
    };

  const togglePasswordVisibility = (field: "current" | "new" | "confirm") => {
    setShowPasswords((prev) => ({ ...prev, [field]: !prev[field] }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const updated = await changePassword(formData);

    if (updated) {
      setFormData({
        current_password: "",
        new_password: "",
        confirm_password: "",
      });
    }
  };

  const hasData =
    formData.current_password ||
    formData.new_password ||
    formData.confirm_password;

  return (
    <Card>
      <CardHeader>
        <h2 className="text-xl font-semibold">Cambiar Contraseña</h2>
      </CardHeader>

      <CardBody className="space-y-4">
        <form className="space-y-4" onSubmit={handleSubmit}>
          <Input
            isRequired
            endContent={
              <button
                className="focus:outline-none"
                type="button"
                onClick={() => togglePasswordVisibility("current")}
              >
                {showPasswords.current ? (
                  <EyeSlashIcon className="h-4 w-4 text-default-400" />
                ) : (
                  <EyeIcon className="h-4 w-4 text-default-400" />
                )}
              </button>
            }
            errorMessage={errors.current_password}
            isInvalid={!!errors.current_password}
            label="Contraseña Actual"
            placeholder="Tu contraseña actual"
            type={showPasswords.current ? "text" : "password"}
            value={formData.current_password}
            onValueChange={handleInputChange("current_password")}
          />

          <div>
            <Input
              isRequired
              endContent={
                <button
                  className="focus:outline-none"
                  type="button"
                  onClick={() => togglePasswordVisibility("new")}
                >
                  {showPasswords.new ? (
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
              type={showPasswords.new ? "text" : "password"}
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
                onClick={() => togglePasswordVisibility("confirm")}
              >
                {showPasswords.confirm ? (
                  <EyeSlashIcon className="h-4 w-4 text-default-400" />
                ) : (
                  <EyeIcon className="h-4 w-4 text-default-400" />
                )}
              </button>
            }
            errorMessage={errors.confirm_password}
            isInvalid={!!errors.confirm_password}
            label="Confirmar Nueva Contraseña"
            placeholder="Confirma tu nueva contraseña"
            type={showPasswords.confirm ? "text" : "password"}
            value={formData.confirm_password}
            onValueChange={handleInputChange("confirm_password")}
          />

          {errors.general && (
            <div className="p-3 bg-danger-50 border border-danger-200 rounded-lg text-danger-600 text-sm">
              {errors.general}
            </div>
          )}

          {success && (
            <div className="p-3 bg-success-50 border border-success-200 rounded-lg text-success-600 text-sm">
              {success}
            </div>
          )}

          <div className="flex justify-end space-x-2">
            <Button
              color="default"
              isDisabled={passwordLoading || !hasData}
              type="button"
              variant="ghost"
              onClick={() => {
                setFormData({
                  current_password: "",
                  new_password: "",
                  confirm_password: "",
                });
                clearErrors();
                clearSuccess();
              }}
            >
              Limpiar
            </Button>

            <Button
              color="primary"
              isDisabled={passwordLoading}
              isLoading={passwordLoading}
              type="submit"
            >
              {passwordLoading ? "Cambiando..." : "Cambiar Contraseña"}
            </Button>
          </div>
        </form>
      </CardBody>
    </Card>
  );
};

export default PasswordChangeForm;
