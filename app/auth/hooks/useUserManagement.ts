// app/auth/hooks/useUserManagement.ts

import { useState, useEffect, useCallback } from "react";

import { api, ApiError } from "../../lib/apiClient";
import { logger } from "../../lib/logger";
import { UserProfile } from "../../context/AuthContext";

export interface UsersResponse {
  users: UserProfile[];
  pagination: {
    current_page: number;
    total_pages: number;
    total_users: number;
    page_size: number;
    has_next: boolean;
    has_prev: boolean;
  };
  filters: {
    status?: string;
    role?: string;
  };
}

export interface UserActionResponse {
  message: string;
  username: string;
  email_sent?: boolean;
  action?: string;
  details?: string;
  reason?: string;
  revoked_by?: string;
}

export interface UserFilters {
  status?: string;
  role?: string;
  search?: string;
  page?: number;
}

export type UserAction =
  | "approve"
  | "reject"
  | "deactivate"
  | "activate"
  | "change_role"
  | "delete";

export const useUserManagement = () => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [pendingUsers, setPendingUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [pagination, setPagination] = useState({
    current_page: 1,
    total_pages: 1,
    total_users: 0,
    page_size: 20,
    has_next: false,
    has_prev: false,
  });

  const fetchUsers = useCallback(async (filters: UserFilters = {}) => {
    setLoading(true);
    setError(null);

    try {
      const queryParams = new URLSearchParams();

      queryParams.append("page", (filters.page || 1).toString());
      queryParams.append("limit", "20");

      if (filters.status) queryParams.append("status", filters.status);
      if (filters.role) queryParams.append("role", filters.role);

      const response = await api.get<UsersResponse>(
        `admin/users?${queryParams.toString()}`,
      );

      setUsers(response.users || []);
      setPagination(
        response.pagination || {
          current_page: 1,
          total_pages: 1,
          total_users: 0,
          page_size: 20,
          has_next: false,
          has_prev: false,
        },
      );
    } catch (apiError) {
      if (apiError instanceof ApiError) {
        switch (apiError.status) {
          case 403:
            setError("No tienes permisos para ver los usuarios registrados.");
            break;
          case 429:
            setError(
              "Demasiadas consultas. Espera un momento antes de intentar nuevamente.",
            );
            break;
          case 500:
            setError("Error interno del servidor. Intenta más tarde.");
            break;
          default:
            setError(
              `Error inesperado (${apiError.status}). Intenta nuevamente.`,
            );
        }
      } else {
        setError(
          "Error de conexión. Verifica tu internet e intenta nuevamente.",
        );
      }
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchPendingUsers = useCallback(async () => {
    try {
      const response = await api.get<UserProfile[]>(`admin/pending-users`);

      setPendingUsers(response || []);
    } catch (apiError) {
      if (apiError instanceof ApiError) {
        switch (apiError.status) {
          case 403:
            setError("No tienes permisos para ver usuarios pendientes.");
            logger.error("No tienes permisos para ver usuarios pendientes.");
            break;
          case 500:
            setError("Error del servidor al cargar usuarios pendientes.");
            logger.error("Error del servidor al cargar usuarios pendientes.");
            break;
          default:
            setError(
              `Error cargando usuarios pendientes (${apiError.status}). Intenta nuevamente.`,
            );
            logger.error("Error cargando usuarios pendientes:", apiError);
        }
      } else {
        setError(
          "Error de conexión al cargar usuarios pendientes. Verifica tu internet e intenta nuevamente.",
        );
        logger.error(
          "Error de conexión al cargar usuarios pendientes:",
          apiError,
        );
      }
    }
  }, []);

  const performUserAction = async (
    userId: string,
    action: UserAction,
    newRole?: string,
    reason?: string,
  ) => {
    setActionLoading(userId);
    setError(null);
    setSuccess(null);

    try {
      let response: UserActionResponse;
      let successMessage = "";

      switch (action) {
        case "approve":
          response = await api.post<UserActionResponse>(
            `admin/approve-user/${userId}`,
            {},
          );
          successMessage = `Usuario ${response.username} aprobado exitosamente`;
          if (response.email_sent === false) {
            successMessage += " (no se pudo enviar email de bienvenida)";
          }
          break;

        case "reject":
          const rejectFormData = new FormData();

          if (reason) {
            rejectFormData.append("reason", reason);
          }
          response = await api.post<UserActionResponse>(
            `admin/reject-user/${userId}`,
            rejectFormData,
          );
          successMessage = `Usuario ${response.username} rechazado`;
          if (reason) {
            successMessage += ` - Razón: ${reason}`;
          }
          break;

        case "deactivate":
          const deactivateFormData = new FormData();

          deactivateFormData.append("action", "deactivate");
          response = await api.put<UserActionResponse>(
            `admin/manage-user/${userId}`,
            deactivateFormData,
          );
          successMessage = `Usuario ${response.username} desactivado exitosamente`;
          if (response.email_sent === false) {
            successMessage += " (no se pudo enviar notificación por email)";
          }
          break;

        case "activate":
          const activateFormData = new FormData();

          activateFormData.append("action", "activate");
          response = await api.put<UserActionResponse>(
            `admin/manage-user/${userId}`,
            activateFormData,
          );
          successMessage = `Usuario ${response.username} activado exitosamente`;
          if (response.email_sent === false) {
            successMessage += " (no se pudo enviar notificación por email)";
          }
          break;

        case "change_role":
          if (!newRole) throw new Error("Nuevo rol requerido");
          const changeRoleFormData = new FormData();

          changeRoleFormData.append("action", "change_role");
          changeRoleFormData.append("new_role", newRole);
          response = await api.put<UserActionResponse>(
            `admin/manage-user/${userId}`,
            changeRoleFormData,
          );
          successMessage = `Rol de ${response.username} cambiado exitosamente`;
          if (response.details) {
            successMessage += ` (${response.details})`;
          }
          if (response.email_sent === false) {
            successMessage += " (no se pudo enviar notificación por email)";
          }
          break;

        case "delete":
          const deleteFormData = new FormData();

          deleteFormData.append("action", "delete");
          if (reason) {
            deleteFormData.append("reason", reason);
          }
          response = await api.put<UserActionResponse>(
            `admin/manage-user/${userId}`,
            deleteFormData,
          );
          successMessage = `Usuario ${response.username} eliminado exitosamente`;
          if (response.reason) {
            successMessage += ` - Razón: ${response.reason}`;
          }
          if (response.email_sent === false) {
            successMessage += " (no se pudo enviar notificación por email)";
          }
          break;

        default:
          throw new Error("Acción no válida");
      }

      setSuccess(successMessage);

      // Refrescar listas sin usar las funciones memorizadas para evitar bucles
      const refreshUsers = async () => {
        try {
          const queryParams = new URLSearchParams();

          queryParams.append("page", "1");
          queryParams.append("limit", "20");
          // Removido el filtro de status para traer todos los usuarios

          const response = await api.get<UsersResponse>(
            `admin/users?${queryParams.toString()}`,
          );

          setUsers(response.users || []);
          setPagination(
            response.pagination || {
              current_page: 1,
              total_pages: 1,
              total_users: 0,
              page_size: 20,
              has_next: false,
              has_prev: false,
            },
          );
        } catch (error) {
          setError(
            "No se pudo refrescar la lista de usuarios. Intenta nuevamente.",
          );
          logger.error("Error refrescando usuarios:", error);
        }
      };

      const refreshPendingUsers = async () => {
        try {
          const response = await api.get<UserProfile[]>(`admin/pending-users`);

          setPendingUsers(response || []);
        } catch (error) {
          setError(
            "No se pudo refrescar la lista de usuarios pendientes. Intenta nuevamente.",
          );
          logger.error("Error refrescando usuarios pendientes:", error);
        }
      };

      await Promise.all([refreshUsers(), refreshPendingUsers()]);

      return true;
    } catch (apiError) {
      if (apiError instanceof ApiError) {
        const detail = apiError.responseBody?.detail || "";

        switch (apiError.status) {
          case 400:
            if (detail.includes("ID de usuario inválido")) {
              setError("ID de usuario inválido.");
            } else if (detail.includes("ya está")) {
              setError(detail); // "El usuario ya está activo/desactivado", etc.
            } else if (detail.includes("Acción inválida")) {
              setError("Acción no válida.");
            } else if (detail.includes("rol")) {
              setError(detail); // Errores relacionados con roles
            } else {
              setError(detail || "Datos inválidos para la acción.");
            }
            break;

          case 403:
            setError("No tienes permisos para realizar esta acción.");
            break;

          case 404:
            if (detail.includes("Usuario pendiente no encontrado")) {
              setError(
                "Usuario pendiente no encontrado. Es posible que ya haya sido procesado.",
              );
            } else {
              setError("Usuario no encontrado.");
            }
            break;

          case 429:
            setError(
              "Demasiadas acciones. Espera un momento antes de intentar nuevamente.",
            );
            break;

          case 500:
            setError(
              "Error interno del servidor. Intenta más tarde o contacta al soporte.",
            );
            break;

          default:
            setError(
              `Error inesperado (${apiError.status}). Intenta nuevamente.`,
            );
        }
      } else {
        setError(
          "Error de conexión. Verifica tu internet e intenta nuevamente.",
        );
      }

      return false;
    } finally {
      setActionLoading(null);
    }
  };

  const clearMessages = () => {
    setError(null);
    setSuccess(null);
  };

  // Cargar datos iniciales
  useEffect(() => {
    fetchUsers(); // Sin filtro de status para traer todos los usuarios
    fetchPendingUsers();
  }, []);

  return {
    users,
    pendingUsers,
    loading,
    actionLoading,
    error,
    success,
    pagination,
    fetchUsers,
    fetchPendingUsers,
    performUserAction,
    clearMessages,
  };
};
