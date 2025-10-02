// app/admin/components/UserRoleBadge.tsx

import React from "react";
import { Chip } from "@heroui/chip";

interface UserRoleBadgeProps {
  role: string;
}

const UserRoleBadge: React.FC<UserRoleBadgeProps> = ({ role }) => {
  const getRoleConfig = (role: string) => {
    switch (role) {
      case "admin":
        return { color: "secondary" as const, label: "Administrador" };
      case "user":
        return { color: "primary" as const, label: "Usuario" };
      case "superadmin":
        return { color: "danger" as const, label: "Superadmin" };
      default:
        return { color: "default" as const, label: role };
    }
  };

  const { color, label } = getRoleConfig(role);

  return (
    <Chip color={color} size="sm" variant="flat">
      {label}
    </Chip>
  );
};

export default UserRoleBadge;
