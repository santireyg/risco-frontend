// app/report/[report_id]/hooks/useReport.ts
import type { ReporteDataV2 } from "../types";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

import { api, ApiError } from "@/app/lib/apiClient";
import { logger } from "@/app/lib/logger";

interface UseReportReturn {
  report: ReporteDataV2 | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Hook para obtener los datos de un reporte por su ID desde la API.
 * Maneja autenticación, estados de carga y errores.
 *
 * @param report_id - ID del reporte a obtener
 * @returns Datos del reporte, estados de loading/error y función refetch
 */
export function useReport(report_id: string): UseReportReturn {
  const [report, setReport] = useState<ReporteDataV2 | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const fetchReport = async () => {
    setLoading(true);
    setError(null);

    try {
      logger.info(`Fetching report with ID: ${report_id}`);
      const data = await api.get<ReporteDataV2>(`report/${report_id}`);

      logger.debug("Report data received:", data);
      setReport(data);
    } catch (err: any) {
      logger.error("Error fetching report:", err);

      if (err instanceof ApiError) {
        if (err.status === 401) {
          setError(
            "No autorizado para ver el reporte. Por favor, inicie sesión.",
          );
          router.push("/login?expired=1");

          return;
        } else if (err.status === 404) {
          setError(
            "Reporte no encontrado. Es posible que haya sido eliminado o no tengas acceso.",
          );
        } else if (err.status === 400) {
          setError("ID de reporte inválido.");
        } else {
          setError(`Error al cargar el reporte: ${err.message}`);
        }
      } else {
        setError(
          "Error de red al cargar el reporte. Por favor, verifica tu conexión.",
        );
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (report_id) {
      fetchReport();
    }
  }, [report_id]);

  return {
    report,
    loading,
    error,
    refetch: fetchReport,
  };
}
