import React from "react";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter } from "@heroui/modal";
import { Button } from "@heroui/button";
import { Alert } from "@heroui/alert";

interface ExportResultModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
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
  companyCuit?: string;
  companyName?: string;
  periodoActual?: string;
  periodoAnterior?: string;
}

const ExportResultModal: React.FC<ExportResultModalProps> = ({
  isOpen,
  onOpenChange,
  isSuccess,
  message,
  errorDetails,
  exportDetails,
  companyCuit,
  companyName,
  periodoActual,
  periodoAnterior,
}) => {
  // Formatear CUIT con guiones
  const formatCuit = (cuit: string) => {
    if (!cuit || cuit.length !== 11) return cuit || "No disponible";

    return `${cuit.slice(0, 2)}-${cuit.slice(2, 10)}-${cuit.slice(10)}`;
  };

  // Formatear la fecha de exportación si está disponible
  const formatExportDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleString("es-AR");
    } catch {
      return dateString;
    }
  };

  // Construir la información del balance para la descripción con texto xs
  const buildBalanceInfoJSX = () => {
    const balanceInfo = [];

    if (companyCuit) {
      balanceInfo.push(`• CUIT: ${formatCuit(companyCuit)}`);
    }

    if (companyName) {
      balanceInfo.push(`• Empresa: ${companyName}`);
    }

    if (periodoActual) {
      balanceInfo.push(`• Período actual: ${periodoActual}`);
    }

    if (periodoAnterior) {
      balanceInfo.push(`• Período anterior: ${periodoAnterior}`);
    }

    return balanceInfo.length > 0 ? <div className="text-xs whitespace-pre-line">{balanceInfo.join("\n")}</div> : null;
  };

  // Construir descripción para alert de error con tamaños de texto diferenciados
  const buildErrorDescription = () => {
    const errorText = errorDetails?.error;
    const balanceInfo = buildBalanceInfoJSX();

    if (errorText && balanceInfo) {
      return (
        <div>
          <div className="text-md">{errorText}</div>
          <div className="mt-2">{balanceInfo}</div>
        </div>
      );
    } else if (errorText) {
      return <div className="text-md">{errorText}</div>;
    } else if (balanceInfo) {
      return balanceInfo;
    }

    return null;
  };

  return (
    <Modal isOpen={isOpen} placement="center" size="md" onOpenChange={onOpenChange}>
      <ModalContent>
        {(onClose) => (
          <>
            <ModalHeader className="flex flex-col gap-1 border-b text-center mb-2">
              <span className={isSuccess ? "text-success-600 font-medium" : "text-danger-500 font-medium"}>
                {isSuccess ? "Exportación exitosa" : "Error en la exportación"}
              </span>
            </ModalHeader>

            <ModalBody>
              <div className="space-y-4">
                {/* Alert principal */}
                {isSuccess ? (
                  <Alert
                    color="success"
                    description={buildBalanceInfoJSX()}
                    radius="md"
                    title={<span className="text-md">{message}</span>}
                    variant="flat"
                  />
                ) : (
                  <Alert
                    color="danger"
                    description={buildErrorDescription()}
                    radius="md"
                    variant="flat"
                    // title={message}
                  />
                )}

                {/* Detalles de exportación exitosa */}
                {isSuccess && exportDetails && (
                  <div className="space-y-1 pl-5 text-gray-400">
                    {exportDetails.export_id && (
                      <div className="text-xs">
                        <span className="font-medium text-slate-800">• ID de exportación:</span> {exportDetails.export_id}
                      </div>
                    )}
                    {exportDetails.event_type && (
                      <div className="text-xs">
                        <span className="font-medium text-slate-800">• Tipo de evento:</span> {exportDetails.event_type}
                      </div>
                    )}
                    {exportDetails.exported_at && (
                      <div className="text-xs">
                        <span className="font-medium text-slate-800">• Exportado el:</span>{" "}
                        {formatExportDate(exportDetails.exported_at)}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </ModalBody>

            <ModalFooter>
              <Button color="primary" size="sm" onPress={onClose}>
                Cerrar
              </Button>
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
};

export default ExportResultModal;
