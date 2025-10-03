// app/admin/components/UsersManagementTable.tsx

import React from "react";
import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
} from "@heroui/table";
import { Button } from "@heroui/button";
import { Chip } from "@heroui/chip";
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from "@heroui/dropdown";
import { Tooltip } from "@heroui/tooltip";
import { User } from "@heroui/user";
import { Pagination } from "@heroui/pagination";
import {
  EllipsisVerticalIcon,
  UserIcon,
  ShieldCheckIcon,
  NoSymbolIcon,
  ArrowPathIcon,
  CogIcon,
  ChevronDownIcon,
  TrashIcon,
} from "@heroicons/react/24/outline";

import { UserProfile } from "../../context/AuthContext";
import { UserAction } from "../../auth/hooks/useUserManagement";
import { useAuth } from "../../context/AuthContext";

import UserStatusBadge from "./UserStatusBadge";

interface UsersManagementTableProps {
  users: UserProfile[];
  onUserAction: (
    user: UserProfile,
    action: UserAction,
    targetRole?: string,
  ) => void;
  actionLoading: string | null;
  pagination: {
    total: number;
    page: number;
    per_page: number;
  };
  onPageChange: (page: number) => void;
}

const UsersManagementTable: React.FC<UsersManagementTableProps> = ({
  users,
  onUserAction,
  actionLoading,
  pagination,
  onPageChange,
}) => {
  const { user: currentUser } = useAuth();

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "admin":
        return <ShieldCheckIcon className="h-4 w-4" />;
      case "superadmin":
        return <CogIcon className="h-4 w-4" />;
      case "user":
      default:
        return <UserIcon className="h-4 w-4" />;
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case "admin":
        return "Administrador";
      case "superadmin":
        return "Superadmin";
      case "user":
      default:
        return "Usuario";
    }
  };

  const canChangeRole = (targetUser: UserProfile, newRole: string) => {
    if (!currentUser) return false;

    // Si el usuario ya tiene ese rol
    if (targetUser.role === newRole) return false;

    // Solo admin y superadmin pueden cambiar roles
    if (currentUser.role === "user") return false;

    // Restricciones para admin
    if (currentUser.role === "admin") {
      // Admin no puede cambiar roles de otros admin a user
      if (targetUser.role === "admin" && newRole === "user") {
        return false;
      }
      // Admin no puede asignar rol admin
      if (newRole === "admin") {
        return false;
      }
      // Admin no puede gestionar superadmin
      if (targetUser.role === "superadmin") {
        return false;
      }
    }

    // Restricciones para superadmin
    if (currentUser.role === "superadmin") {
      // Superadmin no puede cambiar roles de otros superadmin
      if (targetUser.role === "superadmin") {
        return false;
      }
    }

    return true;
  };

  const getTooltipMessage = (targetUser: UserProfile, newRole: string) => {
    if (targetUser.role === newRole) {
      return "El usuario ya posee este rol";
    }

    if (currentUser?.role === "admin") {
      if (targetUser.role === "admin" && newRole === "user") {
        return "No puedes rebajar el rol de otros administradores";
      }
      if (newRole === "admin") {
        return "No tienes permisos para asignar el rol de administrador";
      }
      if (targetUser.role === "superadmin") {
        return "No puedes gestionar usuarios superadmin";
      }
    }

    if (currentUser?.role === "superadmin") {
      if (targetUser.role === "superadmin") {
        return "No puedes cambiar el rol de otros superadmin";
      }
    }

    return "";
  };

  const renderRoleChip = (user: UserProfile) => {
    return (
      <Tooltip content="Cambiar rol" delay={0}>
        <div>
          <Dropdown>
            <DropdownTrigger>
              <Chip
                className="cursor-pointer hover:opacity-80"
                color="default"
                endContent={<ChevronDownIcon className="h-3 w-3" />}
                size="sm"
                startContent={getRoleIcon(user.role)}
                variant="bordered"
              >
                {getRoleLabel(user.role)}
              </Chip>
            </DropdownTrigger>
            <DropdownMenu
              aria-label="Cambiar rol"
              onAction={(key) => {
                if (key === "admin" && canChangeRole(user, "admin")) {
                  onUserAction(user, "change_role", "admin");
                } else if (key === "user" && canChangeRole(user, "user")) {
                  onUserAction(user, "change_role", "user");
                }
              }}
            >
              <DropdownItem
                key="change_role_header"
                className="opacity-100 pointer-events-none"
                textValue="Cambiar rol"
              >
                <span className="text-sm font-medium text-foreground-600">
                  Cambiar rol
                </span>
              </DropdownItem>

              <DropdownItem
                key="admin"
                isDisabled={!canChangeRole(user, "admin")}
                textValue="Administrador"
              >
                <Tooltip
                  content={getTooltipMessage(user, "admin")}
                  delay={0}
                  isDisabled={canChangeRole(user, "admin")}
                >
                  <div className="flex items-center gap-2">
                    <ShieldCheckIcon className="h-4 w-4" />
                    Administrador
                  </div>
                </Tooltip>
              </DropdownItem>

              <DropdownItem
                key="user"
                isDisabled={!canChangeRole(user, "user")}
                textValue="Usuario"
              >
                <Tooltip
                  content={getTooltipMessage(user, "user")}
                  delay={0}
                  isDisabled={canChangeRole(user, "user")}
                >
                  <div className="flex items-center gap-2">
                    <UserIcon className="h-4 w-4" />
                    Usuario
                  </div>
                </Tooltip>
              </DropdownItem>
            </DropdownMenu>
          </Dropdown>
        </div>
      </Tooltip>
    );
  };

  const getActionsForUser = (user: UserProfile) => {
    const actions = [];

    if (user.status === "active") {
      actions.push({
        key: "deactivate",
        label: "Desactivar",
        color: "warning",
      });
    }

    if (user.status === "inactive") {
      actions.push({ key: "activate", label: "Reactivar", color: "success" });
    }

    // Todos los usuarios pueden ser eliminados excepto superadmin
    if (user.role !== "superadmin") {
      actions.push({ key: "delete", label: "Eliminar", color: "danger" });
    }

    return actions;
  };

  const renderActionMenu = (user: UserProfile) => {
    const actions = getActionsForUser(user);

    if (actions.length === 0) {
      return <span className="text-foreground-400 text-sm">Sin acciones</span>;
    }

    return (
      <Dropdown>
        <DropdownTrigger>
          <Button
            isIconOnly
            isDisabled={!!actionLoading}
            size="sm"
            variant="light"
          >
            <EllipsisVerticalIcon className="h-4 w-4" />
          </Button>
        </DropdownTrigger>
        <DropdownMenu
          aria-label="Acciones de usuario"
          onAction={(key) => onUserAction(user, key as UserAction)}
        >
          {actions.map((action) => (
            <DropdownItem
              key={action.key}
              className={action.color === "danger" ? "text-danger" : ""}
              color={action.color as any}
              startContent={
                action.key === "deactivate" ? (
                  <NoSymbolIcon className="h-4 w-4" />
                ) : action.key === "activate" ? (
                  <ArrowPathIcon className="h-4 w-4" />
                ) : action.key === "delete" ? (
                  <TrashIcon className="h-4 w-4" />
                ) : (
                  <UserIcon className="h-4 w-4" />
                )
              }
            >
              {action.label}
            </DropdownItem>
          ))}
        </DropdownMenu>
      </Dropdown>
    );
  };

  if (users.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-foreground-600">No se encontraron usuarios</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 border-2 rounded-xl">
      <Table aria-label="Tabla de usuarios" shadow="none">
        <TableHeader>
          <TableColumn>NOMBRE</TableColumn>
          <TableColumn>EMAIL</TableColumn>
          <TableColumn>USUARIO</TableColumn>
          <TableColumn>ROL</TableColumn>
          <TableColumn>ESTADO</TableColumn>
          <TableColumn>FECHA DE REGISTRO</TableColumn>
          <TableColumn>ACCIONES</TableColumn>
        </TableHeader>
        <TableBody>
          {users.map((user) => (
            <TableRow key={user._id}>
              <TableCell>
                <User
                  avatarProps={{
                    name: `${user.first_name?.[0]?.toUpperCase()}${user.last_name?.[0]?.toUpperCase()}`,
                    size: "sm",
                  }}
                  description={user.email}
                  name={`${user.first_name} ${user.last_name}`}
                />
              </TableCell>

              <TableCell>
                <span className="text-sm">{user.email}</span>
              </TableCell>

              <TableCell>
                <span className="text-sm">@{user.username}</span>
              </TableCell>

              <TableCell>{renderRoleChip(user)}</TableCell>

              <TableCell>
                <UserStatusBadge status={user.status} />
              </TableCell>

              <TableCell>
                {user.created_at && (
                  <span className="text-sm text-foreground-600">
                    {new Date(user.created_at).toLocaleDateString("es-ES")}
                  </span>
                )}
              </TableCell>

              <TableCell>
                {actionLoading === user._id ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary" />
                  </div>
                ) : (
                  renderActionMenu(user)
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {pagination.total > pagination.per_page && (
        <div className="flex justify-center">
          <Pagination
            showControls
            showShadow
            color="primary"
            page={pagination.page}
            total={Math.ceil(pagination.total / pagination.per_page)}
            onChange={onPageChange}
          />
        </div>
      )}
    </div>
  );
};

export default UsersManagementTable;
