// app/profile/page.tsx

"use client";

import React from "react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Spinner } from "@heroui/spinner";

import { useAuth } from "../context/AuthContext";

import ProfileTabs from "./components/ProfileTabs";

const ProfilePage: React.FC = () => {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push("/login");
    }
  }, [user, isLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <Spinner color="primary" size="lg" />
          <p className="text-foreground-600">Cargando perfil...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null; // El useEffect se encargará de la redirección
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground">Mi Perfil</h1>
            <p className="text-foreground-600 mt-2">
              Gestiona tu información personal y configuración de cuenta
            </p>
          </div>

          <ProfileTabs user={user} />
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
