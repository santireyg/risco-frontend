// app/home/page.tsx

"use client";

import React, { useContext } from "react";
import { Spinner } from "@heroui/spinner";

import { AuthContext } from "../context/AuthContext";

import DocumentsTable from "./components/DocumentsTable"; // Asegúrate de tener este componente

const Home: React.FC = () => {
  const { user, isLoading } = useContext(AuthContext);

  // Mientras se verifica el token, muestra un spinner
  if (isLoading) {
    return (
      <div className="h-screen w-full flex items-center justify-center">
        <Spinner label="Verificando sesión..." variant="spinner" />
      </div>
    );
  }

  // En caso de no estar autenticado, puedes mostrar un mensaje o redirigir
  if (!user) {
    return (
      <div className="h-screen w-full flex items-center justify-center">
        <p>No estás autenticado. Por favor, inicia sesión.</p>
      </div>
    );
  }

  return (
    <div className="bg-slate-100 min-h-[calc(100vh-5rem-1px)]">
      <div className="container mx-auto p-10">
        <h1 className="text-4xl text-gray-700 mb-4 mt-4">Balances cargados</h1>
        <p className="mb-4 text-gray-500">
          Este es el listado de balances cargados en el sistema.
        </p>
        <DocumentsTable />
      </div>
    </div>
  );
};

export default Home;
