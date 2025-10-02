// path: components/ProcessingChip.tsx

import React from "react";
import { Chip } from "@heroui/chip";
import { Tooltip } from "@heroui/tooltip";
import { FiClock, FiFileText } from "react-icons/fi";

interface ProcessingTime {
  upload_convert?: number | null;
  recognize?: number | null;
  extract?: number | null;
  validation?: number | null;
  total?: number | null;
}

interface ProcessingChipProps {
  processingTime?: ProcessingTime;
  pageCount?: number;
}

const ProcessingChip: React.FC<ProcessingChipProps> = ({
  processingTime,
  pageCount,
}) => {
  // Formatear tiempo de mm:ss
  const formatTime = (seconds?: number | null): string => {
    if (!seconds || seconds < 0) return "0:00";
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);

    return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
  };

  // Calcular segundos por página
  const getSecondsPerPage = (): number => {
    if (
      !processingTime?.total ||
      processingTime.total === null ||
      !pageCount ||
      pageCount === 0
    )
      return 0;

    return processingTime.total / pageCount;
  };

  const totalTime = processingTime?.total || 0;
  const pages = pageCount || 0;
  const secondsPerPage = getSecondsPerPage();

  // Calcular tiempo de análisis (extracción + validación)
  const getAnalysisTime = (): number => {
    const extractTime = processingTime?.extract || 0;
    const validationTime = processingTime?.validation || 0;

    return extractTime + validationTime;
  };

  const analysisTime = getAnalysisTime();

  // Contenido del tooltip
  const tooltipContent = (
    <div className="p-4 max-w-sm min-w-[230px]">
      <div className="text-sm font-semibold text-gray-800 mb-4">
        Detalles de Procesamiento
      </div>

      {/* Información de páginas */}
      <div className="space-y-2 mb-4">
        <div className="flex justify-between items-center">
          <span className="text-xs text-gray-700">📄 Total de páginas:</span>
          <span className="text-xs font-mono text-gray-800">{pages}</span>
        </div>
        <div className="h-px bg-gray-200 my-3" />
      </div>

      {/* Desglose por etapas */}
      <div className="space-y-2 mb-4">
        <div className="text-xs font-medium text-gray-600 mb-2">
          Tiempo por etapa:
        </div>

        <div className="flex justify-between items-center">
          <span className="text-xs text-gray-700 flex items-center">
            ⬆️ Carga y conversión:
          </span>
          <span className="text-xs font-mono text-gray-800">
            {formatTime(processingTime?.upload_convert)}
          </span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-xs text-gray-700 flex items-center">
            🔎 Reconocimiento:
          </span>
          <span className="text-xs font-mono text-gray-800">
            {formatTime(processingTime?.recognize)}
          </span>
        </div>

        <div className="flex justify-between items-center">
          <span className="text-xs text-gray-700 flex items-center">
            📊 Análisis y validación:
          </span>
          <span className="text-xs font-mono text-gray-800">
            {formatTime(analysisTime)}
          </span>
        </div>

        <div className="h-px bg-gray-200 my-3" />

        <div className="flex justify-between items-center font-semibold">
          <span className="text-xs text-gray-800">⏱️ Tiempo total:</span>
          <span className="text-xs font-mono text-gray-900">
            {formatTime(totalTime)}
          </span>
        </div>
      </div>

      {/* KPI destacado - Promedio */}
      <div className="bg-blue-50 border border-blue-200 rounded-xl p-2 flex justify-center">
        <div className="flex justify-between items-center">
          <span className="text-xs font-medium text-blue-700">⚡ Promedio</span>
          <span className="text-xs font-medium text-blue-700">
            {secondsPerPage > 0
              ? `: ${secondsPerPage.toFixed(1)} seg/pág`
              : ": N/A"}
          </span>
        </div>
      </div>
    </div>
  );

  // Si no hay datos, no mostrar nada
  if (!totalTime && !pages) {
    return null;
  }

  return (
    <Tooltip
      showArrow
      className="max-w-none"
      closeDelay={0}
      content={tooltipContent}
      placement="top"
    >
      <div className="flex gap-1 items-center cursor-help">
        {/* Chip de tiempo */}
        {totalTime > 0 && (
          <Chip
            classNames={{
              base: "bg-gray-50 border hover:bg-gray-50 transition-colors",
              content: "text-gray-700 px-1",
            }}
            color="default"
            radius="sm"
            size="sm"
            startContent={<FiClock className="w-2.5 h-2.5 text-gray-400" />}
            variant="flat"
          >
            {formatTime(totalTime)}
          </Chip>
        )}

        {/* Chip de páginas */}
        {pages > 0 && (
          <Chip
            classNames={{
              base: "bg-gray-50 border hover:bg-gray-50 transition-colors",
              content: "text-gray-700 px-1",
            }}
            color="default"
            radius="sm"
            size="sm"
            startContent={<FiFileText className="w-2.5 h-2.5 text-gray-400" />}
            variant="flat"
          >
            {pages}
          </Chip>
        )}
      </div>
    </Tooltip>
  );
};

export default ProcessingChip;
