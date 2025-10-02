// app/admin/page.tsx

"use client";

import React, { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Alert } from "@heroui/alert";
import { Spinner } from "@heroui/spinner";
import { IoMdArrowBack } from "react-icons/io";
import { Button } from "@heroui/button";
import { Breadcrumbs, BreadcrumbItem } from "@heroui/breadcrumbs";
import { useDisclosure } from "@heroui/use-disclosure";

import { useAuth } from "../context/AuthContext";
import {
  useUserManagement,
  type UserAction,
} from "../auth/hooks/useUserManagement";
import { UserProfile } from "../context/AuthContext";

import PendingUsersSection from "./components/PendingUsersSection";
import UsersManagementTable from "./components/UsersManagementTable";
import UserActionModal from "./components/UserActionModal";

const AdminPage: React.FC = () => {
  const { user, isLoading } = useAuth();
  const router = useRouter();
  const {
    users,
    pendingUsers,
    loading,
    actionLoading,
    error,
    success,
    pagination,
    fetchUsers,
    performUserAction,
    clearMessages,
  } = useUserManagement();

  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const [selectedAction, setSelectedAction] = useState<UserAction | null>(null);
  const [selectedRole, setSelectedRole] = useState<string>("user");
  const { isOpen, onOpen, onClose } = useDisclosure();

  // Verificar permisos de admin
  useEffect(() => {
    if (
      !isLoading &&
      (!user || (user.role !== "admin" && user.role !== "superadmin"))
    ) {
      router.push("/");
    }
  }, [user, isLoading, router]);

  // Recargar datos al montar el componente
  useEffect(() => {
    fetchUsers(); // Sin filtro de status para traer todos los usuarios
  }, []);

  const handlePageChange = useCallback(
    (page: number) => {
      fetchUsers({ page }); // Sin filtro de status para traer todos los usuarios
    },
    [fetchUsers],
  );

  const handleUserAction = useCallback(
    (user: UserProfile, action: UserAction, targetRole?: string) => {
      setSelectedUser(user);
      setSelectedAction(action);
      if (targetRole) {
        setSelectedRole(targetRole);
      }
      onOpen();
    },
    [onOpen],
  );

  const handleConfirmAction = useCallback(
    async (action: UserAction, newRole?: string) => {
      if (selectedUser) {
        const roleToUse =
          action === "change_role" ? newRole || selectedRole : newRole;
        const success = await performUserAction(
          selectedUser._id,
          action,
          roleToUse,
        );

        if (success) {
          onClose();
          setSelectedUser(null);
          setSelectedAction(null);
          setSelectedRole("user");
        }
      }
    },
    [selectedUser, selectedRole, performUserAction, onClose],
  );

  const handleCloseModal = useCallback(() => {
    onClose();
    setSelectedUser(null);
    setSelectedAction(null);
    setSelectedRole("user");
  }, [onClose]);

  // Loading inicial
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <Spinner color="primary" size="lg" />
          <p className="text-foreground-600">Verificando permisos...</p>
        </div>
      </div>
    );
  }

  // Usuario sin permisos
  if (!user || (user.role !== "admin" && user.role !== "superadmin")) {
    return null; // El useEffect se encargará de la redirección
  }

  return (
    <div className="">
      {/* Barra fija debajo de la navbar */}
      <div className="fixed top-20 left-0 right-0 z-40 bg-white border-b border-t border-slate-200">
        <div className="container mx-auto flex items-center h-14 pl-2">
          <div className="flex items-center gap-4 ">
            <Button
              className="bg-slate-100 text-slate-500 border"
              radius="md"
              size="sm"
              startContent={<IoMdArrowBack />}
              onPress={() => router.push("/")}
            >
              Homepage
            </Button>
            <Breadcrumbs size="md">
              <BreadcrumbItem href="/">Home </BreadcrumbItem>
              <BreadcrumbItem href="/admin">
                Panel de administradores
              </BreadcrumbItem>
            </Breadcrumbs>
          </div>
        </div>
      </div>

      {/* Contenido principal con padding-top para compensar la barra fija */}
      <div className="min-h-[calc(100vh-5rem-1px)] bg-slate-100 flex items-start justify-center border-t border-slate-200 pb-12 pt-12">
        <div className="mx-auto w-full max-w-[1500px] px-8 pt-12">
          <div className="max-w-full mx-auto bg-white rounded-2xl shadow-sm p-10 space-y-8 border-1 border-slate-200">
            {/* Header */}
            <div>
              <h1 className="text-3xl font-medium text-foreground">
                Panel de administradores
              </h1>
              <p className="text-foreground-600 mt-2">
                Gestiona usuarios y solicitudes de acceso al sistema
              </p>
            </div>

            {/* Mensajes de feedback */}
            {error && (
              <Alert color="danger" onClose={clearMessages}>
                {error}
              </Alert>
            )}

            {success && (
              <Alert color="success" onClose={clearMessages}>
                {success}
              </Alert>
            )}

            {/* Solicitudes pendientes */}
            <PendingUsersSection
              actionLoading={actionLoading}
              pendingUsers={pendingUsers}
              onUserAction={handleUserAction}
            />

            {/* Gestión de usuarios */}
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-medium text-foreground">
                  Gestión de Usuarios
                </h2>
                <p className="text-foreground-600 mb-4 text-sm">
                  Aquí puedes ver y gestionar los usuarios registrados en el
                  sistema
                </p>
              </div>

              {loading ? (
                <div className="flex justify-center py-8">
                  <Spinner color="primary" size="lg" />
                </div>
              ) : (
                <UsersManagementTable
                  actionLoading={actionLoading}
                  pagination={{
                    total: pagination.total_users,
                    page: pagination.current_page,
                    per_page: pagination.page_size,
                  }}
                  users={users}
                  onPageChange={handlePageChange}
                  onUserAction={handleUserAction}
                />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Modal de confirmación */}
      <UserActionModal
        action={selectedAction}
        isLoading={!!actionLoading}
        isOpen={isOpen}
        selectedRole={selectedRole}
        user={selectedUser}
        onClose={handleCloseModal}
        onConfirm={handleConfirmAction}
      />
    </div>
  );
};

export default AdminPage;
