// app/admin/components/UserStatusBadge.tsx

import React from "react";
import { Chip } from "@heroui/chip";

interface UserStatusBadgeProps {
  status: string;
}

const UserStatusBadge: React.FC<UserStatusBadgeProps> = ({ status }) => {
  const getStatusConfig = (status: string) => {
    switch (status) {
      case "active":
        return { color: "success" as const, label: "Activo" };
      case "inactive":
        return { color: "default" as const, label: "Inactivo" };
      case "pending_approval":
        return { color: "warning" as const, label: "Pendiente" };
      default:
        return { color: "default" as const, label: status };
    }
  };

  const { color, label } = getStatusConfig(status);

  return (
    <Chip color={color} size="sm" variant="flat">
      {label}
    </Chip>
  );
};

export default UserStatusBadge;
