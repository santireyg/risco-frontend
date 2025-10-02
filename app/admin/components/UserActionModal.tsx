// app/admin/components/UserActionModal.tsx

import React, { useState, useEffect } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@heroui/modal";
import { Button } from "@heroui/button";
import { Chip } from "@heroui/chip";
import {
  ExclamationTriangleIcon,
  ShieldCheckIcon,
  UserIcon,
  CogIcon,
} from "@heroicons/react/24/outline";

import { UserProfile } from "../../context/AuthContext";
import { UserAction } from "../../auth/hooks/useUserManagement";

interface UserActionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (action: UserAction, newRole?: string) => void;
  user: UserProfile | null;
  action: UserAction | null;
  isLoading: boolean;
  selectedRole?: string;
}

const UserActionModal: React.FC<UserActionModalProps> = ({
  isOpen,
  onClose,
  onConfirm,
  user,
  action,
  isLoading,
  selectedRole: propSelectedRole,
}) => {
  const [selectedRole, setSelectedRole] = useState<string>("user");

  useEffect(() => {
    if (propSelectedRole) {
      setSelectedRole(propSelectedRole);
    }
  }, [propSelectedRole]);

  const getActionDetails = (action: UserAction | null) => {
    switch (action) {
      case "approve":
        return {
          title: "Aprobar Usuario",
          message: "¿Estás seguro de que quieres aprobar este usuario?",
          color: "success" as const,
          confirmText: "Aprobar",
        };
      case "reject":
        return {
          title: "Rechazar Usuario",
          message:
            "¿Estás seguro de que quieres rechazar este usuario? Esta acción no se puede deshacer.",
          color: "danger" as const,
          confirmText: "Rechazar",
        };
      case "deactivate":
        return {
          title: "Desactivar Usuario",
          message: "¿Estás seguro de que quieres desactivar este usuario?",
          color: "warning" as const,
          confirmText: "Desactivar",
        };
      case "activate":
        return {
          title: "Activar Usuario",
          message: "¿Estás seguro de que quieres activar este usuario?",
          color: "success" as const,
          confirmText: "Activar",
        };
      case "change_role":
        return {
          title: "Cambiar Rol",
          message: `¿Estás seguro de que quieres cambiar el rol de este usuario a ${selectedRole === "user" ? "Usuario" : "Administrador"}?`,
          color: "primary" as const,
          confirmText: "Cambiar Rol",
        };
      case "delete":
        return {
          title: "Eliminar Usuario",
          message:
            "¿Estás seguro de que quieres eliminar este usuario? Esta acción no se puede deshacer.",
          color: "danger" as const,
          confirmText: "Eliminar Usuario",
        };
      default:
        return {
          title: "Confirmar Acción",
          message: "¿Estás seguro de que quieres realizar esta acción?",
          color: "default" as const,
          confirmText: "Confirmar",
        };
    }
  };

  const { title, message, color, confirmText } = getActionDetails(action);
  const isDestructive = ["reject", "delete"].includes(action || "");

  const handleConfirm = () => {
    if (action === "change_role") {
      onConfirm(action, selectedRole);
    } else {
      onConfirm(action!, undefined);
    }
  };

  return (
    <Modal isOpen={isOpen} placement="center" onClose={onClose}>
      <ModalContent>
        <ModalHeader className="flex gap-1">
          {isDestructive && (
            <ExclamationTriangleIcon className="h-5 w-5 text-warning" />
          )}
          {title}
        </ModalHeader>

        <ModalBody>
          {user && (
            <div className="space-y-3">
              <div className="bg-default-100 p-3 rounded-lg">
                <p className="text-sm font-medium">Usuario seleccionado:</p>
                <p className="text-sm">
                  {user.first_name} {user.last_name}
                </p>
                <p className="text-xs text-foreground-600">{user.email}</p>
              </div>

              <p className="text-foreground-700">{message}</p>

              {action === "change_role" && (
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium text-foreground-600">
                    Nuevo rol:
                  </span>
                  <Chip
                    color="default"
                    size="sm"
                    startContent={
                      selectedRole === "admin" ? (
                        <ShieldCheckIcon className="h-4 w-4" />
                      ) : selectedRole === "superadmin" ? (
                        <CogIcon className="h-4 w-4" />
                      ) : (
                        <UserIcon className="h-4 w-4" />
                      )
                    }
                    variant="bordered"
                  >
                    {selectedRole === "user"
                      ? "Usuario"
                      : selectedRole === "admin"
                        ? "Administrador"
                        : "Superadmin"}
                  </Chip>
                </div>
              )}

              {isDestructive && (
                <div className="bg-danger-50 border border-danger-200 p-3 rounded-lg">
                  <p className="text-xs text-danger-700">
                    <strong>Advertencia:</strong> Esta acción no se puede
                    deshacer.
                  </p>
                </div>
              )}
            </div>
          )}
        </ModalBody>

        <ModalFooter>
          <Button
            color="default"
            isDisabled={isLoading}
            variant="light"
            onPress={onClose}
          >
            Cancelar
          </Button>
          <Button
            color={color}
            isDisabled={isLoading}
            isLoading={isLoading}
            onPress={handleConfirm}
          >
            {isLoading ? "Procesando..." : confirmText}
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default UserActionModal;
