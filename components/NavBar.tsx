// ruta: components/NavBar.tsx

"use client";

import React, { useContext } from "react";
import Image from "next/image";
import { Navbar, NavbarBrand, NavbarContent, NavbarItem } from "@heroui/navbar";
import { Button } from "@heroui/button";
import { Link } from "@heroui/link";
import { Tooltip } from "@heroui/tooltip";
import { useRouter } from "next/navigation";
import { UsersIcon } from "@heroicons/react/24/outline";

import { AuthContext } from "../app/context/AuthContext";

const NavBar: React.FC = () => {
  const { user, logout } = useContext(AuthContext);
  const router = useRouter();

  const handleLogout = () => {
    // Limpia el estado de la tabla antes de cerrar sesión
    if (typeof window !== "undefined") {
      sessionStorage.removeItem("documentsTableState");
    }
    logout();
    router.push("/login");
  };

  return (
    <Navbar isBordered height="5rem" maxWidth="2xl">
      <NavbarBrand>
        <Link href="/home">
          <Image alt="Logo" className="h-14 mr-2" height={56} src="/integrity-logo.svg" width={200} />
        </Link>
      </NavbarBrand>

      <NavbarContent justify="end">
        {user?.first_name ? (
          <>
            <NavbarItem className="hidden lg:flex">
              <span>Bienvenido, {user.first_name}</span>
            </NavbarItem>
            {(user.role === "admin" || user.role === "superadmin") && (
              <NavbarItem>
                <Tooltip content="Ir al panel de administradores" delay={0}>
                  <Button isIconOnly color="default" variant="bordered" onPress={() => router.push("/admin")}>
                    <UsersIcon className="h-5 w-5" />
                  </Button>
                </Tooltip>
              </NavbarItem>
            )}
            <NavbarItem>
              <Button color="default" variant="bordered" onPress={handleLogout}>
                Cerrar Sesión
              </Button>
            </NavbarItem>
          </>
        ) : (
          <NavbarItem>
            <Button as={Link} color="primary" href="/login" variant="flat">
              Iniciar Sesión
            </Button>
          </NavbarItem>
        )}
      </NavbarContent>
    </Navbar>
  );
};

export default NavBar;
