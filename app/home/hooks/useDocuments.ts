// app/home/hooks/useDocuments.ts
"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation"; // <-- Agregado para redirección

import { api, ApiError } from "../../lib/apiClient";
import { logger } from "../../lib/logger";

// Interfaces para los datos de documentos (puedes ajustarlas según tu modelo)
export interface ValidationData {
  status: string;
  message: string[];
}

export interface DocumentItem {
  // Cambié _id por id, asumiendo que el backend ya lo transforma
  id: string;
  name: string;
  status: string;
  upload_date: string;
  uploaded_by: string;
  balance_date: string;
  validation?: ValidationData;
  error_message?: string;
  // Campos que podrías recibir del WebSocket u otros procesos
  progress?: number;
}

export interface DocumentsResponse {
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
  items: DocumentItem[];
}

export function useDocuments(params: {
  q?: string;
  status?: string;
  sort_field?: string;
  sort_order?: string;
  page: number;
  page_size: number;
  validation_status?: string; // <-- Nuevo parámetro
}) {
  const [data, setData] = useState<DocumentsResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const {
    q,
    status,
    sort_field,
    sort_order,
    page,
    page_size,
    validation_status,
  } = params;
  const router = useRouter(); // <-- Agregado para redirección

  const fetchDocuments = async () => {
    setLoading(true);
    setError(null);
    setData(null);
    try {
      // Construir los parámetros de consulta
      const queryParams = new URLSearchParams();

      if (q) queryParams.append("q", q);
      if (status && status !== "all") queryParams.append("status", status);
      if (validation_status && validation_status !== "all")
        queryParams.append("validation_status", validation_status); // <-- Nuevo filtro
      if (sort_field) queryParams.append("sort_field", sort_field);
      if (sort_order) queryParams.append("sort_order", sort_order);
      queryParams.append("page", page.toString());
      queryParams.append("page_size", page_size.toString());

      // Realizar la llamada usando el apiClient centralizado
      // El apiClient ya incluye credentials: 'include' por defecto
      const responseData = await api.get<DocumentsResponse>(
        `documents?${queryParams.toString()}`,
      );

      setData(responseData);
    } catch (err) {
      // Manejo de errores específico del apiClient
      if (err instanceof ApiError) {
        logger.error(
          "API Error fetching documents:",
          err.status,
          err.message,
          err.responseBody,
        );
        if (err.status === 401) {
          // Si es 401, el usuario probablemente necesita iniciar sesión
          setError(
            "No autorizado para ver documentos. Por favor, inicie sesión.",
          );
          router.push("/login?expired=1"); // <-- Redirige al login

          return;
        } else {
          // Otro error de la API
          setError(
            `Error al obtener documentos (${err.status}): ${err.message}`,
          );
        }
      } else {
        // Error de red u otro error inesperado
        logger.error("Error fetching documents:", err);
        setError(
          err instanceof Error ? err.message : "Ocurrió un error desconocido.",
        );
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDocuments();
    // Asegúrate de que todas las variables usadas dentro del efecto estén listadas
  }, [q, status, validation_status, sort_field, sort_order, page, page_size]); // <-- Añadir validation_status

  return { data, loading, error, revalidate: fetchDocuments };
}
