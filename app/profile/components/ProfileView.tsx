// app/profile/components/ProfileView.tsx

import React from "react";
import { Card, CardBody, CardHeader } from "@heroui/card";
import { Chip } from "@heroui/chip";

import { UserProfile } from "../../context/AuthContext";

interface ProfileViewProps {
  user: UserProfile;
}

const ProfileView: React.FC<ProfileViewProps> = ({ user }) => {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "success";
      case "inactive":
        return "danger";
      case "pending_approval":
        return "warning";
      default:
        return "default";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "active":
        return "Activo";
      case "inactive":
        return "Inactivo";
      case "pending_approval":
        return "Pendiente de aprobación";
      default:
        return status;
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case "admin":
        return "Administrador";
      case "user":
        return "Usuario";
      case "superadmin":
        return "Super Usuario";
      default:
        return role;
    }
  };

  return (
    <Card>
      <CardHeader>
        <h2 className="text-xl font-semibold">Información del Perfil</h2>
      </CardHeader>

      <CardBody className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <span className="text-sm font-medium text-foreground-600">Nombre</span>
            <p className="text-foreground mt-1">{user.first_name}</p>
          </div>

          <div>
            <span className="text-sm font-medium text-foreground-600">Apellido</span>
            <p className="text-foreground mt-1">{user.last_name}</p>
          </div>

          <div>
            <span className="text-sm font-medium text-foreground-600">Username</span>
            <p className="text-foreground mt-1">@{user.username}</p>
          </div>

          <div>
            <span className="text-sm font-medium text-foreground-600">Email</span>
            <p className="text-foreground mt-1">{user.email}</p>
          </div>

          <div>
            <span className="text-sm font-medium text-foreground-600">Estado</span>
            <div className="mt-1">
              <Chip color={getStatusColor(user.status)} size="sm" variant="flat">
                {getStatusLabel(user.status)}
              </Chip>
            </div>
          </div>

          <div>
            <span className="text-sm font-medium text-foreground-600">Rol</span>
            <div className="mt-1">
              <Chip color="primary" size="sm" variant="flat">
                {getRoleLabel(user.role)}
              </Chip>
            </div>
          </div>
        </div>

        {user.created_at && (
          <div className="pt-4 border-t border-divider">
            <span className="text-sm font-medium text-foreground-600">Fecha de registro</span>
            <p className="text-foreground-500 text-sm mt-1">
              {new Date(user.created_at).toLocaleDateString("es-ES", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </p>
          </div>
        )}
      </CardBody>
    </Card>
  );
};

export default ProfileView;
