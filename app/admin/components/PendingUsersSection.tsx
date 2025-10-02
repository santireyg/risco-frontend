// app/admin/components/PendingUsersSection.tsx

import React from "react";
import { Accordion, AccordionItem } from "@heroui/accordion";
import { Button } from "@heroui/button";
import { Chip } from "@heroui/chip";
import {
  CheckIcon,
  XMarkIcon,
  CheckCircleIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";

import { UserProfile } from "../../context/AuthContext";
import { UserAction } from "../../auth/hooks/useUserManagement";

interface PendingUsersSectionProps {
  pendingUsers: UserProfile[];
  onUserAction: (user: UserProfile, action: UserAction) => void;
  actionLoading: string | null;
}

const PendingUsersSection: React.FC<PendingUsersSectionProps> = ({
  pendingUsers,
  onUserAction,
  actionLoading,
}) => {
  const hasPendingUsers = pendingUsers.length > 0;

  return (
    <Accordion
      defaultExpandedKeys={hasPendingUsers ? ["pending"] : []}
      variant="bordered"
    >
      <AccordionItem
        key="pending"
        aria-label="Solicitudes pendientes"
        startContent={
          hasPendingUsers ? (
            <ClockIcon className="h-7 w-7 text-warning" />
          ) : (
            <CheckCircleIcon className="h-7 w-7 text-primary" />
          )
        }
        subtitle={
          hasPendingUsers
            ? `Tienes ${pendingUsers.length} solicitude${pendingUsers.length !== 1 ? "s" : ""} de nuevos usuarios pendientes de aprobación`
            : "No hay solicitudes de usuarios pendientes de aprobación"
        }
        title={
          hasPendingUsers ? "Solicitudes Pendientes" : "No hay solicitudes"
        }
      >
        {hasPendingUsers ? (
          <div className="space-y-4">
            {pendingUsers.map((user) => (
              <div
                key={user._id}
                className="border border-divider rounded-lg p-4 bg-default-50"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium">
                        {user.first_name} {user.last_name}
                      </h3>
                      <Chip color="warning" size="sm" variant="flat">
                        Pendiente
                      </Chip>
                    </div>
                    <p className="text-sm text-foreground-600 mt-1">
                      @{user.username} • {user.email}
                    </p>
                    {user.created_at && (
                      <p className="text-xs text-foreground-500 mt-1">
                        Registrado el{" "}
                        {new Date(user.created_at).toLocaleDateString("es-ES")}
                      </p>
                    )}
                  </div>

                  <div className="flex gap-2">
                    <Button
                      color="success"
                      isDisabled={!!actionLoading}
                      isLoading={actionLoading === user._id}
                      size="sm"
                      startContent={<CheckIcon className="h-4 w-4" />}
                      variant="flat"
                      onClick={() => onUserAction(user, "approve")}
                    >
                      Aprobar
                    </Button>

                    <Button
                      color="danger"
                      isDisabled={!!actionLoading}
                      isLoading={actionLoading === user._id}
                      size="sm"
                      startContent={<XMarkIcon className="h-4 w-4" />}
                      variant="flat"
                      onClick={() => onUserAction(user, "reject")}
                    >
                      Rechazar
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <p className="text-foreground-600">
              Aquí verás los usuarios que hayan solicitado acceso a la
              plataforma
            </p>
          </div>
        )}
      </AccordionItem>
    </Accordion>
  );
};

export default PendingUsersSection;
