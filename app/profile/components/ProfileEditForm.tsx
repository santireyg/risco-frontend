// app/profile/components/ProfileEditForm.tsx

import React, { useState, useEffect } from "react";
import { Input } from "@heroui/input";
import { Button } from "@heroui/button";
import { Card, CardBody, CardHeader } from "@heroui/card";

import { useProfile, type ProfileUpdateData } from "../../auth/hooks/useProfile";

const ProfileEditForm: React.FC = () => {
  const { user, loading, errors, success, updateProfile, clearErrors, clearSuccess } = useProfile();
  const [formData, setFormData] = useState<ProfileUpdateData>({
    first_name: "",
    last_name: "",
    username: "",
    current_password: "",
  });

  useEffect(() => {
    if (user) {
      setFormData({
        first_name: user.first_name,
        last_name: user.last_name,
        username: user.username,
        current_password: "",
      });
    }
  }, [user]);

  const handleInputChange = (field: keyof ProfileUpdateData) => (value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      clearErrors();
    }
    if (success) {
      clearSuccess();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const updated = await updateProfile(formData);

    if (updated) {
      // Opcional: lógica adicional después del éxito
    }
  };

  const hasChanges =
    user &&
    (formData.first_name !== user.first_name || formData.last_name !== user.last_name || formData.username !== user.username);

  return (
    <Card>
      <CardHeader>
        <h2 className="text-xl font-semibold">Editar Perfil</h2>
      </CardHeader>

      <CardBody className="space-y-4">
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input
              isRequired
              errorMessage={errors.first_name}
              isInvalid={!!errors.first_name}
              label="Nombre"
              placeholder="Tu nombre"
              value={formData.first_name}
              onValueChange={handleInputChange("first_name")}
            />

            <Input
              isRequired
              errorMessage={errors.last_name}
              isInvalid={!!errors.last_name}
              label="Apellido"
              placeholder="Tu apellido"
              value={formData.last_name}
              onValueChange={handleInputChange("last_name")}
            />
          </div>

          <Input
            isRequired
            description="3-20 caracteres, solo letras, números y underscore"
            errorMessage={errors.username}
            isInvalid={!!errors.username}
            label="Username"
            placeholder="nombre_usuario"
            value={formData.username}
            onValueChange={handleInputChange("username")}
          />

          {errors.general && (
            <div className="p-3 bg-danger-50 border border-danger-200 rounded-lg text-danger-600 text-sm">{errors.general}</div>
          )}

          {success && (
            <div className="p-3 bg-success-50 border border-success-200 rounded-lg text-success-600 text-sm">{success}</div>
          )}

          <div className="flex justify-end space-x-2">
            <Button
              color="default"
              isDisabled={loading || !hasChanges}
              type="button"
              variant="ghost"
              onClick={() => {
                if (user) {
                  setFormData({
                    first_name: user.first_name,
                    last_name: user.last_name,
                    username: user.username,
                    current_password: "",
                  });
                  clearErrors();
                  clearSuccess();
                }
              }}>
              Cancelar
            </Button>

            <Button color="primary" isDisabled={loading || !hasChanges} isLoading={loading} type="submit">
              {loading ? "Guardando..." : "Guardar Cambios"}
            </Button>
          </div>
        </form>
      </CardBody>
    </Card>
  );
};

export default ProfileEditForm;
