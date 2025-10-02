// app/admin/components/UserFilters.tsx

import React from "react";
import { Input } from "@heroui/input";
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from "@heroui/dropdown";
import { Button } from "@heroui/button";
import {
  MagnifyingGlassIcon,
  XMarkIcon,
  ChevronDownIcon,
} from "@heroicons/react/24/outline";

import { UserFilters as UserFiltersType } from "../../auth/hooks/useUserManagement";

interface UserFiltersProps {
  filters: UserFiltersType;
  onFiltersChange: (filters: UserFiltersType) => void;
  onClearFilters: () => void;
}

const UserFilters: React.FC<UserFiltersProps> = ({
  filters,
  onFiltersChange,
  onClearFilters,
}) => {
  const handleStatusChange = (keys: any) => {
    const selectedKey = Array.from(keys)[0] as string;

    onFiltersChange({ ...filters, status: selectedKey || undefined });
  };

  const handleRoleChange = (keys: any) => {
    const selectedKey = Array.from(keys)[0] as string;

    onFiltersChange({ ...filters, role: selectedKey || undefined });
  };

  const handleSearchChange = (value: string) => {
    onFiltersChange({ ...filters, search: value || undefined });
  };

  const hasActiveFilters = filters.status || filters.role || filters.search;

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <Input
            placeholder="Buscar por nombre, email o username..."
            startContent={
              <MagnifyingGlassIcon className="h-4 w-4 text-default-400" />
            }
            type="text"
            value={filters.search || ""}
            onValueChange={handleSearchChange}
          />
        </div>

        <div className="flex gap-2">
          <div className="min-w-[140px]">
            <Dropdown>
              <DropdownTrigger>
                <Button className="w-full justify-between" variant="bordered">
                  {filters.status
                    ? filters.status === "active"
                      ? "Activos"
                      : filters.status === "inactive"
                        ? "Inactivos"
                        : "Pendientes"
                    : "Estado"}
                  <ChevronDownIcon className="h-4 w-4" />
                </Button>
              </DropdownTrigger>
              <DropdownMenu
                aria-label="Filtrar por estado"
                selectedKeys={filters.status ? [filters.status] : []}
                selectionMode="single"
                onSelectionChange={handleStatusChange}
              >
                <DropdownItem key="active">Activos</DropdownItem>
                <DropdownItem key="inactive">Inactivos</DropdownItem>
                <DropdownItem key="pending_approval">Pendientes</DropdownItem>
              </DropdownMenu>
            </Dropdown>
          </div>

          <div className="min-w-[140px]">
            <Dropdown>
              <DropdownTrigger>
                <Button className="w-full justify-between" variant="bordered">
                  {filters.role
                    ? filters.role === "user"
                      ? "Usuario"
                      : "Admin"
                    : "Rol"}
                  <ChevronDownIcon className="h-4 w-4" />
                </Button>
              </DropdownTrigger>
              <DropdownMenu
                aria-label="Filtrar por rol"
                selectedKeys={filters.role ? [filters.role] : []}
                selectionMode="single"
                onSelectionChange={handleRoleChange}
              >
                <DropdownItem key="user">Usuario</DropdownItem>
                <DropdownItem key="admin">Admin</DropdownItem>
              </DropdownMenu>
            </Dropdown>
          </div>

          {hasActiveFilters && (
            <Button
              isIconOnly
              className="mt-auto"
              color="default"
              variant="light"
              onClick={onClearFilters}
            >
              <XMarkIcon className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2 text-xs">
          <span className="text-foreground-600">Filtros activos:</span>
          {filters.status && (
            <span className="bg-primary-100 text-primary-700 px-2 py-1 rounded">
              Estado: {filters.status}
            </span>
          )}
          {filters.role && (
            <span className="bg-secondary-100 text-secondary-700 px-2 py-1 rounded">
              Rol: {filters.role}
            </span>
          )}
          {filters.search && (
            <span className="bg-default-100 text-default-700 px-2 py-1 rounded">
              Búsqueda: &ldquo;{filters.search}&rdquo;
            </span>
          )}
        </div>
      )}
    </div>
  );
};

export default UserFilters;
