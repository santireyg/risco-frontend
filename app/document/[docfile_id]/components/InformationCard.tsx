// ruta: app/documents/[docfile_id]/components/InformationCard.tsx

import React, { useState } from "react";
import { Card, CardHeader, CardBody, CardFooter } from "@heroui/card";
import { Input } from "@heroui/input";
import { Tooltip } from "@heroui/tooltip";
import { Button } from "@heroui/button";
import {
  DocumentMagnifyingGlassIcon,
  ArrowPathIcon,
  PencilIcon,
  FolderArrowDownIcon,
  ArrowUturnLeftIcon,
  ArrowUpOnSquareIcon,
  ArrowDownTrayIcon,
  SparklesIcon,
} from "@heroicons/react/24/outline";
import { useRouter } from "next/navigation";
import { DatePicker } from "@heroui/date-picker";
import { CalendarDate, CalendarDateTime, DateValue, parseDate, ZonedDateTime } from "@internationalized/date";
import { I18nProvider } from "@react-aria/i18n";
import { useDisclosure } from "@heroui/use-disclosure";
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter } from "@heroui/modal";

import { api } from "../../../lib/apiClient"; // Importa tu apiClient

import ExportModal from "./ExportModal";

import StatusChip from "@/components/StatusChip";
import ValidationChip from "@/components/ValidationChip";

interface InformationCardProps {
  document: any;
  isEditing: boolean;
  setIsEditing: (editing: boolean) => void;
  handleSaveChanges: () => void;
  handleCancelEdit: () => void;
  isSaving: boolean;
  editableDocument: any;
  setEditableDocument: (doc: any) => void;
}

const InformationCard: React.FC<InformationCardProps> = ({
  document,
  isEditing,
  setIsEditing,
  handleSaveChanges,
  handleCancelEdit,
  isSaving,
  editableDocument,
  setEditableDocument,
}) => {
  const router = useRouter();
  const [balanceDate, setBalanceDate] = useState<DateValue>(
    editableDocument.balance_date
      ? parseDate(editableDocument.balance_date.split("T")[0])
      : parseDate(new Date().toISOString().split("T")[0])
  );

  const handleBalanceDateChange = (newDate: CalendarDate | CalendarDateTime | ZonedDateTime | null) => {
    if (newDate) {
      setBalanceDate(newDate);
      // Convert CalendarDate to JS Date at midnight UTC
      const jsDate = new Date(Date.UTC(newDate.year, newDate.month - 1, newDate.day, 0, 0, 0, 0));
      // Format as ISO string with timezone offset +00:00
      const isoString = jsDate.toISOString().replace("Z", "+00:00");

      setEditableDocument((prev: any) => ({
        ...prev,
        balance_date: isoString,
      }));
    }
  };

  // Estado para la fecha del período anterior
  const previousPeriodRaw =
    editableDocument.balance_date_previous || editableDocument.balance_data?.informacion_general?.periodo_anterior;
  const [balanceDatePrevious, setBalanceDatePrevious] = useState<DateValue>(
    previousPeriodRaw ? parseDate(previousPeriodRaw.split("T")[0]) : parseDate(new Date().toISOString().split("T")[0])
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const {
    isOpen: isValidationModalOpen,
    onOpen: onValidationModalOpen,
    onOpenChange: onValidationModalOpenChange,
  } = useDisclosure();
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  // Handler para editar la fecha del período anterior
  const handleBalanceDatePreviousChange = (newDate: CalendarDate | CalendarDateTime | ZonedDateTime | null) => {
    if (newDate) {
      setBalanceDatePrevious(newDate);
      const jsDate = new Date(Date.UTC(newDate.year, newDate.month - 1, newDate.day, 0, 0, 0, 0));
      const isoString = jsDate.toISOString().replace("Z", "+00:00");

      setEditableDocument((prev: any) => ({
        ...prev,
        balance_date_previous: isoString,
      }));
    }
  };

  // Handler para editar CUIT
  const handleCompanyCuitChange = (newCuit: string) => {
    setEditableDocument((prev: any) => ({
      ...prev,
      company_info: {
        ...prev.company_info,
        company_cuit: newCuit,
      },
    }));
  };

  // Validación del CUIT
  const validateCuit = (cuit: string) => {
    if (!cuit || cuit.trim() === "") {
      return "El CUIT es obligatorio";
    }
    if (cuit.length !== 11) {
      return "El CUIT debe tener 11 dígitos numéricos, sin guiones ni espacios";
    }
    if (!/^\d{11}$/.test(cuit)) {
      return "El CUIT debe contener solo números";
    }

    return null;
  };

  // Validación de la razón social
  const validateCompanyName = (name: string) => {
    if (!name || name.trim() === "") {
      return "La razón social es obligatoria";
    }

    return null;
  };

  const cuitError = validateCuit(editableDocument?.company_info?.company_cuit || "");
  const companyNameError = validateCompanyName(editableDocument?.company_info?.company_name || "");

  // Función para validar todos los campos antes de guardar
  const validateFormBeforeSave = () => {
    const cuitValidation = validateCuit(editableDocument?.company_info?.company_cuit || "");
    const companyNameValidation = validateCompanyName(editableDocument?.company_info?.company_name || "");

    if (cuitValidation || companyNameValidation) {
      const errors = [];

      if (companyNameValidation) errors.push(companyNameValidation);
      if (cuitValidation) errors.push(cuitValidation);

      setValidationErrors(errors);
      onValidationModalOpen();

      return false;
    }

    return true;
  };

  // Wrapper para el handleSaveChanges que incluye validación
  const handleSaveWithValidation = () => {
    if (validateFormBeforeSave()) {
      handleSaveChanges();
    }
  };
  // Handler para editar nombre empresa
  const handleCompanyNameChange = (newName: string) => {
    setEditableDocument((prev: any) => ({
      ...prev,
      company_info: {
        ...prev.company_info,
        company_name: newName,
      },
    }));
  };

  // const handleNameChange = (newName: string) => {
  //   setEditableDocument((prev: any) => ({
  //     ...prev,
  //     name: newName,
  //   }));
  // };

  // Función para reiniciar la extracción de datos
  const handleReiniciarExtraccion = async () => {
    try {
      setErrorMessage(null);
      await api.post<any>(`extract/${document.id}`);
    } catch (error: any) {
      let msg = "Error al reiniciar la extracción.";

      if (error?.responseBody?.detail) msg = error.responseBody.detail;
      else if (error?.message) msg = error.message;
      setErrorMessage(msg);
    }
  };

  // Función para reiniciar todo el procesamiento del documento
  const handleReiniciarProcesamiento = async () => {
    try {
      setErrorMessage(null);
      await api.post<any>(`recognize_and_extract/${document.id}`);
    } catch (error: any) {
      let msg = "Error al reiniciar el procesamiento.";

      if (error?.responseBody?.detail) msg = error.responseBody.detail;
      else if (error?.message) msg = error.message;
      setErrorMessage(msg);
    }
  };

  // const handleRehacerValidacion = async () => {
  //   try {
  //     setErrorMessage(null);
  //     await api.post<any>(`validate_data/${document.id}`);
  //   } catch (error: any) {
  //     let msg = "Error al efectuar la validación.";

  //     if (error?.responseBody?.detail) msg = error.responseBody.detail;
  //     else if (error?.message) msg = error.message;
  //     setErrorMessage(msg);
  //   }
  // };

  // Función para descargar el PDF
  const handleDownloadPdf = async () => {
    try {
      setErrorMessage(null);

      const response = await api.get<{
        download_url: string;
        filename: string;
        expires_in: number;
      }>(`document/${document.id}/download`);

      // Abrir el PDF en una nueva pestaña
      window.open(response.download_url, "_blank", "noopener,noreferrer");
    } catch (error: any) {
      let msg = "Error al descargar el archivo PDF.";

      if (error?.responseBody?.detail) msg = error.responseBody.detail;
      else if (error?.message) msg = error.message;
      setErrorMessage(msg);
    }
  };

  // Función para generar/abrir el reporte de IA
  const handleReporteIA = async () => {
    const reportStatus = document.report_status;
    const reportId = document.report_id;

    // Si el reporte está finalizado, navegar a la página del reporte
    if (reportStatus === "Finalizado" && reportId) {
      router.push(`/report/${reportId}`);
      return;
    }

    // Si no hay report_status, está vacío o contiene "Error", generar el reporte
    if (!reportStatus || reportStatus === "Error") {
      try {
        setErrorMessage(null);
        await api.post<any>(`generate_report/${document.id}`);
      } catch (error: any) {
        let msg = "Error al generar el reporte.";

        if (error?.responseBody?.detail) msg = error.responseBody.detail;
        else if (error?.message) msg = error.message;
        setErrorMessage(msg);
      }
    }
  };

  const { isOpen, onOpen, onOpenChange } = useDisclosure();

  // Helper para formatear fechas
  const formatDate = (iso: string) => {
    if (!iso) return "-";
    const d = parseDate(iso.slice(0, 10));

    return `${d.day.toString().padStart(2, "0")}/${d.month.toString().padStart(2, "0")}/${d.year}`;
  };

  // Helper para formatear CUIT con guiones
  const formatCuit = (cuit: string) => {
    if (!cuit || cuit.length !== 11) return cuit || "-";

    return `${cuit.slice(0, 2)}-${cuit.slice(2, 10)}-${cuit.slice(10)}`;
  };

  // Datos a exportar para el modal (con valores actual y anterior)
  return (
    <Card isFooterBlurred className="max-w bg-slate-100 border" shadow="none">
      <CardHeader className="pt-5 px-5 border-b-1 border-slate-200 relative">
        <div className="flex flex-row justify-between items-start gap-4 w-full">
          {/* Left: Empresa y archivo */}
          <div className="flex flex-col flex-1 min-w-0">
            {/* Nombre empresa (no editable en header) */}
            <Tooltip
              closeDelay={0}
              content={editableDocument?.company_info?.company_name}
              delay={0}
              isDisabled={
                !editableDocument?.company_info?.company_name || editableDocument?.company_info?.company_name.length <= 30
              }
              placement="top">
              <h2
                className="font-medium leading-none text-lg text-foreground-700 truncate max-w-full cursor-pointer"
                style={{ maxWidth: "100%" }}>
                {editableDocument?.company_info?.company_name || <span className="text-foreground-400">-</span>}
              </h2>
            </Tooltip>
            {/* Nombre archivo debajo, más chico y gris */}
            <div className="flex items-center gap-2 mt-1 min-w-0">
              <span className="text-xs text-slate-500">Archivo:</span>
              <Tooltip
                closeDelay={0}
                content={document.name}
                delay={0}
                isDisabled={!document.name || document.name.length <= 30}
                placement="top">
                <span className="text-slate-500 text-xs truncate max-w-xs block">
                  {document.name || <span className="text-foreground-400">-</span>}
                </span>
              </Tooltip>
            </div>
          </div>
          {/* Right: Chips y Exportar */}
          <div className="flex flex-row border-l items-center gap-6 pl-5">
            <StatusChip errorMessage={document.errorMessage} progress={document.progress} status={document.status} />
            <ValidationChip
              message={document.validation?.message}
              progress={document.progress}
              status={document.validation?.status}
            />
          </div>
        </div>
      </CardHeader>

      <CardBody className="px-5 py-6 text-md text-default-400">
        <div className="grid lg:grid-cols-2 grid-cols-1 gap-x-8 gap-y-6">
          {/* Columna izquierda */}
          <div className="flex flex-col gap-6">
            {/* Empresa */}
            <div className="flex flex-col xl:flex-row xl:items-center xl:gap-x-2 min-w-0">
              <span className="text-foreground-900 text-md whitespace-nowrap mb-1 xl:mb-0">R. Social:</span>
              <div className="min-w-0 flex-1">
                {isEditing ? (
                  <Input
                    isRequired
                    aria-label="Editar nombre empresa"
                    classNames={{
                      inputWrapper: ["bg-white", "shadow-none", "border-1", "pr-2"],
                      input: ["text-md"],
                    }}
                    errorMessage={companyNameError}
                    isInvalid={!!companyNameError}
                    placeholder="Razón social"
                    size="sm"
                    style={{ minWidth: 0 }}
                    value={editableDocument?.company_info?.company_name || ""}
                    onChange={(e) => handleCompanyNameChange(e.target.value)}
                  />
                ) : (
                  <Tooltip
                    closeDelay={0}
                    content={editableDocument?.company_info?.company_name}
                    delay={0}
                    isDisabled={
                      !editableDocument?.company_info?.company_name || editableDocument?.company_info?.company_name.length <= 20
                    }
                    placement="top">
                    <span className="text-foreground-400 text-sm truncate block max-w-full">
                      {editableDocument?.company_info?.company_name || <span className="text-foreground-400">-</span>}
                    </span>
                  </Tooltip>
                )}
              </div>
            </div>
            {/* CUIT */}
            <div className="flex flex-col xl:flex-row xl:items-center xl:gap-x-2 min-w-0">
              <span className="text-foreground-900 text-md whitespace-nowrap mb-1 xl:mb-0">CUIT:</span>
              <div className="min-w-0 flex-1">
                {isEditing ? (
                  <Input
                    isRequired
                    aria-label="Editar CUIT"
                    classNames={{
                      inputWrapper: ["bg-white", "shadow-none", "border-1", "pr-2"],
                      input: ["text-md"],
                    }}
                    errorMessage={cuitError}
                    isInvalid={!!cuitError}
                    maxLength={11}
                    minLength={11}
                    placeholder="CUIT"
                    size="sm"
                    style={{ minWidth: 0 }}
                    type="text"
                    value={editableDocument?.company_info?.company_cuit || ""}
                    onChange={(e) => handleCompanyCuitChange(e.target.value)}
                  />
                ) : (
                  <span className="text-foreground-400 text-md block max-w-full truncate">
                    {formatCuit(editableDocument?.company_info?.company_cuit)}
                  </span>
                )}
              </div>
            </div>
          </div>
          {/* Columna derecha */}
          <div className="flex flex-col gap-6">
            {/* Período actual */}
            <div className="flex flex-col xl:flex-row xl:items-center xl:gap-x-2 min-w-0">
              <span className="text-foreground-900 text-md whitespace-nowrap mb-1 xl:mb-0">Período actual:</span>
              <div className="min-w-0 flex-1">
                {!isEditing ? (
                  (() => {
                    if (!document.balance_date) return <span>-</span>;
                    const d = parseDate(document.balance_date.slice(0, 10));

                    return <span>{`${d.day.toString().padStart(2, "0")}/${d.month.toString().padStart(2, "0")}/${d.year}`}</span>;
                  })()
                ) : (
                  <I18nProvider locale="es-AR">
                    <DatePicker
                      showMonthAndYearPickers
                      calendarWidth={300}
                      className="max-w-[150px]"
                      classNames={{
                        inputWrapper: ["bg-white", "shadow-none", "border-1"],
                      }}
                      size="sm"
                      value={balanceDate}
                      onChange={handleBalanceDateChange}
                    />
                  </I18nProvider>
                )}
              </div>
            </div>
            {/* Período anterior */}
            <div className="flex flex-col xl:flex-row xl:items-center xl:gap-x-2 min-w-0">
              <span className="text-foreground-900 text-md whitespace-nowrap mb-1 xl:mb-0">Período anterior:</span>
              <div className="min-w-0 flex-1">
                {!isEditing ? (
                  (() => {
                    const raw = document.balance_date_previous || document.balance_data?.informacion_general?.periodo_anterior;

                    if (!raw) return <span>-</span>;
                    const d = parseDate(raw.slice(0, 10));

                    return <span>{`${d.day.toString().padStart(2, "0")}/${d.month.toString().padStart(2, "0")}/${d.year}`}</span>;
                  })()
                ) : (
                  <I18nProvider locale="es-AR">
                    <DatePicker
                      showMonthAndYearPickers
                      calendarWidth={300}
                      className="max-w-[150px]"
                      classNames={{
                        inputWrapper: ["bg-white", "shadow-none", "border-1"],
                      }}
                      size="sm"
                      value={balanceDatePrevious}
                      onChange={handleBalanceDatePreviousChange}
                    />
                  </I18nProvider>
                )}
              </div>
            </div>
          </div>
        </div>
      </CardBody>

      <CardFooter className="bg-white/40 px-5 bottom-0 border-t-1 border-slate-200 flex">
        {/* Contenedor de la mitad izquierda */}
        <div className="flex items-center w-1/2">
          {!isEditing ? (
            <div className="flex space-x-2">
              <Tooltip content="Exportar datos a Excel">
                <Button
                  color="primary"
                  startContent={<ArrowUpOnSquareIcon className="h-5 w-5" />}
                  radius="md"
                  size="sm"
                  variant="flat"
                  onPress={onOpen}>
                  Exportar
                </Button>
              </Tooltip>
              <Tooltip content="Editar datos del documento">
                <Button isIconOnly color="primary" radius="md" size="sm" variant="flat" onPress={() => setIsEditing(true)}>
                  <PencilIcon className="h-5 w-5" />
                </Button>
              </Tooltip>
              <Tooltip content="Descargar archivo PDF">
                <Button isIconOnly color="primary" radius="md" size="sm" variant="flat" onPress={handleDownloadPdf}>
                  <ArrowDownTrayIcon className="h-5 w-5" />
                </Button>
              </Tooltip>
            </div>
          ) : (
            <div className="flex space-x-2">
              <Button
                color="primary"
                isLoading={isSaving}
                radius="md"
                size="sm"
                startContent={<FolderArrowDownIcon className="h-5 w-5" />}
                variant="flat"
                onPress={handleSaveWithValidation}>
                Guardar cambios
              </Button>
              <Button
                color="danger"
                radius="md"
                size="sm"
                startContent={<ArrowUturnLeftIcon className="h-5 w-5" />}
                variant="flat"
                onPress={handleCancelEdit}>
                Cancelar
              </Button>
            </div>
          )}
        </div>
        {/* Contenedor de la mitad derecha */}
        <div className="flex items-center justify-end w-1/2 space-x-2">
          <Tooltip content="Rehacer análisis completo del documento">
            <Button isIconOnly color="primary" radius="full" size="md" variant="light" onPress={handleReiniciarProcesamiento}>
              <ArrowPathIcon className="h-5 w-5" />
            </Button>
          </Tooltip>
          <Tooltip content="Rehacer sólo el proceso de extracción de datos">
            <Button isIconOnly color="primary" radius="full" size="md" variant="light" onPress={handleReiniciarExtraccion}>
              <DocumentMagnifyingGlassIcon className="h-5 w-5" />
            </Button>
          </Tooltip>
          <Tooltip
            content={
              document.report_status === "Generando reporte"
                ? "Generando reporte de IA. Esto puede demorar un minuto"
                : document.report_status === "Finalizado"
                  ? "Abrir reporte de IA"
                  : "Ejecutar análisis de reporte de IA"
            }>
            <Button
              color="primary"
              isDisabled={document.report_status === "Generando reporte"}
              radius="md"
              size="sm"
              startContent={<SparklesIcon className="h-5 w-5" />}
              variant="flat"
              onPress={handleReporteIA}>
              {document.report_status === "Finalizado" ? "Ver reporte" : "Crear reporte"}
            </Button>
          </Tooltip>
        </div>
      </CardFooter>

      {/* Mensajes de error */}
      {errorMessage && (
        <div className="px-5 pb-4">
          <div className="bg-danger-50 border border-danger-200 rounded-lg p-3">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 bg-danger-100 rounded-full flex items-center justify-center">
                <span className="text-danger-600 text-sm font-bold">!</span>
              </div>
              <span className="text-danger-700 text-sm">{errorMessage}</span>
            </div>
          </div>
        </div>
      )}

      {/* Modal de validación */}
      <Modal isOpen={isValidationModalOpen} placement="center" size="md" onOpenChange={onValidationModalOpenChange}>
        <ModalContent>
          {(onClose) => (
            <>
              <ModalHeader className="flex flex-col gap-1">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 bg-danger-100 rounded-full flex items-center justify-center">
                    <span className="text-danger-600 text-sm font-bold">!</span>
                  </div>
                  <span className="text-danger-600">Error de validación</span>
                </div>
              </ModalHeader>
              <ModalBody>
                <p className="text-foreground-600 mb-3">No se pueden guardar los cambios debido a los siguientes errores:</p>
                <div className="space-y-2">
                  {validationErrors.map((error, index) => (
                    <div key={index} className="flex items-start gap-2">
                      <span className="text-danger-500 mt-1">•</span>
                      <span className="text-foreground-700">{error}</span>
                    </div>
                  ))}
                </div>
              </ModalBody>
              <ModalFooter>
                <Button color="primary" size="sm" variant="flat" onPress={onClose}>
                  Entendido
                </Button>
              </ModalFooter>
            </>
          )}
        </ModalContent>
      </Modal>

      <ExportModal
        companyCuit={editableDocument?.company_info?.company_cuit || ""}
        companyName={editableDocument?.company_info?.company_name || ""}
        documentId={document.id}
        isOpen={isOpen}
        periodoActual={formatDate(document.balance_date)}
        periodoAnterior={formatDate(
          document.balance_date_previous || document.balance_data?.informacion_general?.periodo_anterior
        )}
        onConfirm={() => {
          /* Acción de confirmación de exportación */
        }}
        onOpenChange={onOpenChange}
      />
    </Card>
  );
};

export default InformationCard;
