import React, { useState } from "react";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter } from "@heroui/modal";
import { Button } from "@heroui/button";
import { useDisclosure } from "@heroui/use-disclosure";

import ExportResultModal from "./ExportResultModal";

interface ExportModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  periodoActual: string;
  periodoAnterior: string;
  onConfirm: () => void;
  companyCuit?: string;
  companyName?: string;
  documentId: string;
}

const ExportModal: React.FC<ExportModalProps> = ({
  isOpen,
  onOpenChange,
  periodoActual,
  periodoAnterior,
  onConfirm,
  companyCuit,
  companyName,
  documentId,
}) => {
  const [isLoading, setIsLoading] = useState(false);

  // Estado para el modal de resultado
  const { isOpen: isResultModalOpen, onOpen: onResultModalOpen, onOpenChange: onResultModalOpenChange } = useDisclosure();

  const [exportResult, setExportResult] = useState<{
    isSuccess: boolean;
    message: string;
    errorDetails?: {
      codigo?: number;
      error?: string;
      error_raw?: string;
    };
    exportDetails?: {
      export_id?: string;
      event_type?: string;
      exported_at?: string;
    };
  }>({
    isSuccess: false,
    message: "",
  });

  const handleConfirmExport = async () => {
    setIsLoading(true);

    try {
      // Llamar al endpoint de exportación a Excel
      const backendBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
      const url = `${backendBaseUrl}/export_xlsx/${documentId}`;

      const response = await fetch(url, {
        method: "GET",
        credentials: "include",
        headers: {
          Accept: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        },
      });

      if (!response.ok) {
        // Intentar leer el error como JSON
        let errorMessage = "Error al exportar el documento";
        let errorDetails: any = {};

        try {
          const errorBody = await response.json();

          if (errorBody.detail) {
            if (typeof errorBody.detail === "object") {
              errorMessage = errorBody.detail.message || "Error al exportar el documento";
              errorDetails = {
                codigo: errorBody.detail.codigo,
                error: errorBody.detail.error,
                error_raw: errorBody.detail.error_raw,
              };
            } else {
              errorMessage = typeof errorBody.detail === "string" ? errorBody.detail : JSON.stringify(errorBody.detail);
            }
          }
        } catch {
          errorMessage = `Error ${response.status}: ${response.statusText}`;
        }

        setExportResult({
          isSuccess: false,
          message: errorMessage,
          errorDetails: Object.keys(errorDetails).length > 0 ? errorDetails : undefined,
        });

        onOpenChange(false);
        onResultModalOpen();

        return;
      }

      // Obtener el nombre del archivo desde el header Content-Disposition
      const contentDisposition = response.headers.get("Content-Disposition");
      let filename = `${companyName || "documento"}_${periodoActual}.xlsx`;

      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="?(.+)"?/i);

        if (filenameMatch) {
          filename = filenameMatch[1];
        }
      }

      // Descargar el archivo
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement("a");

      link.href = downloadUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(downloadUrl);

      // Exportación exitosa
      setExportResult({
        isSuccess: true,
        message: "Documento exportado exitosamente a Excel",
        exportDetails: {
          exported_at: new Date().toISOString(),
        },
      });

      // Llamar al callback original
      onConfirm();

      // Cerrar modal de exportación y abrir modal de resultado
      onOpenChange(false);
      onResultModalOpen();
    } catch (error: any) {
      let errorMessage = "Error al exportar el documento";

      if (error?.message) {
        errorMessage = error.message;
      }

      setExportResult({
        isSuccess: false,
        message: errorMessage,
      });

      // Cerrar modal de exportación y abrir modal de resultado
      onOpenChange(false);
      onResultModalOpen();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Modal className="p-3" isOpen={isOpen} size="lg" onOpenChange={onOpenChange}>
        <ModalContent>
          <ModalHeader className="flex flex-col gap-1">Exportar a Excel</ModalHeader>
          <ModalBody>
            <div className="space-y-4">
              <p className="text-sm text-foreground-600">
                Se generará un archivo Excel con los datos financieros del documento analizado.
              </p>

              <div className="bg-default-100 rounded-lg p-4 space-y-3">
                <div className="flex items-start gap-2">
                  <span className="font-semibold text-sm min-w-[120px]">CUIT:</span>
                  {companyCuit ? (
                    <span className="text-sm">{companyCuit}</span>
                  ) : (
                    <span className="text-danger-500 font-semibold text-sm">No se encontró el CUIT.</span>
                  )}
                </div>

                <div className="flex items-start gap-2">
                  <span className="font-semibold text-sm min-w-[120px]">Razón social:</span>
                  <span className="text-sm">{companyName || "No disponible"}</span>
                </div>

                <div className="flex items-start gap-2">
                  <span className="font-semibold text-sm min-w-[120px]">Período actual:</span>
                  <span className="text-sm">{periodoActual}</span>
                </div>

                <div className="flex items-start gap-2">
                  <span className="font-semibold text-sm min-w-[120px]">Período anterior:</span>
                  <span className="text-sm">{periodoAnterior}</span>
                </div>
              </div>

              <div className="bg-primary-50 border-l-4 border-primary rounded-r-lg p-3">
                <p className="text-sm text-foreground-700">
                  <span className="font-semibold">El archivo Excel incluirá:</span>
                </p>
                <ul className="mt-2 space-y-1 text-sm text-foreground-600">
                  <li>• Situación Patrimonial (Balance)</li>
                  <li>• Estado de Resultados</li>
                  <li>• Cuentas Principales</li>
                </ul>
              </div>
            </div>
          </ModalBody>
          <ModalFooter>
            <Button color="primary" isDisabled={!companyCuit || isLoading} isLoading={isLoading} onPress={handleConfirmExport}>
              {isLoading ? "Exportando..." : "Exportar a Excel"}
            </Button>
            <Button color="danger" isDisabled={isLoading} variant="light" onPress={() => onOpenChange(false)}>
              Cancelar
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <ExportResultModal
        companyCuit={companyCuit}
        companyName={companyName}
        errorDetails={exportResult.errorDetails}
        exportDetails={exportResult.exportDetails}
        isOpen={isResultModalOpen}
        isSuccess={exportResult.isSuccess}
        message={exportResult.message}
        periodoActual={periodoActual}
        periodoAnterior={periodoAnterior}
        onOpenChange={onResultModalOpenChange}
      />
    </>
  );
};

export default ExportModal;
