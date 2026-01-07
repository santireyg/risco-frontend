// path: app/document/[docfile_id]/page.tsx

"use client";

import { useParams, useRouter } from "next/navigation";
import { useState } from "react";
import { Tabs, Tab } from "@heroui/tabs";
import { Breadcrumbs, BreadcrumbItem } from "@heroui/breadcrumbs";
import { ScrollShadow } from "@heroui/scroll-shadow";
import { Button } from "@heroui/button";
import { Skeleton } from "@heroui/skeleton";
import { IoMdArrowBack, IoMdAlert, IoMdInformationCircleOutline } from "react-icons/io";
import { Spinner } from "@heroui/spinner";
import { Panel, Group as PanelGroup, Separator as PanelResizeHandle } from "react-resizable-panels";

import { useDocument, useDocumentSheets } from "./hooks";
import {
  ImageViewer,
  InformationCard,
  BalanceSheetMainResults,
  IncomeStatementMainResults,
  ItemsTable,
  CompanyInfo,
} from "./components";

const formatCuit = (cuit?: string | null) => {
  if (!cuit) return null;
  const digits = cuit.replace(/\D/g, "");

  if (digits.length !== 11) return cuit;

  return `${digits.slice(0, 2)}-${digits.slice(2, 10)}-${digits.slice(10)}`;
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// ⚙️ CONFIGURACIÓN DE PANELES REDIMENSIONABLES
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
const DEFAULT_LEFT_PANEL_SIZE = 45; // Tamaño por defecto del panel izquierdo (%)
const MIN_LEFT_PANEL_SIZE = 500; // Tamaño mínimo del panel izquierdo
const MIN_RIGHT_PANEL_SIZE = 600; // Tamaño mínimo del panel derecho
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

const DocumentsPage: React.FC = () => {
  const { docfile_id } = useParams() as { docfile_id: string };
  const [activeTab, setActiveTab] = useState<string>("balance_sheet");
  const router = useRouter();

  /* ────────── datos ────────── */
  const {
    document,
    editableDocument,
    setEditableDocument,
    loading: loadingDocument,
    error: errorDocument,
    isSaving,
    isEditing,
    setIsEditing,
    handleSaveChanges,
    handleCancelEdit,
  } = useDocument(docfile_id);

  const { documentSheets, currentPage, setCurrentPage } = useDocumentSheets(document, activeTab);

  // Determinar estado de validación y procesamiento
  const validationStatus = document?.validation?.status;
  const docStatus = document?.status;
  // Solo mostrar mensajes si ambos datos existen
  const hasValidationAndStatus =
    validationStatus !== undefined && validationStatus !== null && docStatus !== undefined && docStatus !== null;
  // Prioridad: procesamiento > sin datos
  const isProcesando =
    hasValidationAndStatus &&
    docStatus !== "Exportado" &&
    docStatus !== "Analizado" &&
    docStatus !== "Reporte IA" &&
    docStatus !== "Error";
  const isSinDatos = hasValidationAndStatus && !isProcesando && validationStatus === "Sin datos";
  const formattedCuit = formatCuit(document?.company_info?.company_cuit);

  /* ────────── UI ────────── */
  return (
    <div>
      <div className="container mx-auto flex items-center h-14 pl-2">
        <div className="flex items-center gap-4">
          <Button
            className="bg-slate-100 text-slate-500 border"
            radius="md"
            size="sm"
            startContent={<IoMdArrowBack />}
            onPress={() => router.push("/")}>
            Homepage
          </Button>

          <Breadcrumbs>
            <BreadcrumbItem href="/">Home</BreadcrumbItem>
            <BreadcrumbItem href="/">Document</BreadcrumbItem>
            <BreadcrumbItem>{formattedCuit ?? "Cargando..."}</BreadcrumbItem>
          </Breadcrumbs>
        </div>
      </div>
      <div className="border-t border-slate-200 h-[calc(100vh-8.5rem-2px)]">
        <div className="mx-10 h-full">
          <PanelGroup orientation="horizontal">
            {/* ░░ Panel izquierdo (scroll) ░░ */}
            <Panel defaultSize={DEFAULT_LEFT_PANEL_SIZE} minSize={MIN_LEFT_PANEL_SIZE}>
              <div className="h-full">
                <ScrollShadow className="pl-2 pr-8 pb-5 pt-3 overflow-y-auto max-h-[calc(100vh-8.5rem-2px)]" size={50}>
                  {/* Breadcrumb + Información */}
                  {loadingDocument || !document ? (
                    <Skeleton className="h-4 w-56 mt-2 mb-3 pl-1 rounded-lg" />
                  ) : (
                    <div className="text-slate-400 text-xs truncate max-w-xs block mt-2 mb-3 pl-1">
                      <span>
                        {"Subido por "} {document.uploaded_by}
                      </span>

                      <span>
                        {" el "} {new Date(document.upload_date).toLocaleDateString()}
                      </span>
                    </div>
                  )}

                  <div>
                    {/* Skeleton solo para los datos de la InformationCard */}
                    {loadingDocument || !document ? (
                      <Skeleton className="h-[250px] w-full rounded-[14px]" />
                    ) : (
                      <InformationCard
                        document={document}
                        editableDocument={editableDocument}
                        handleCancelEdit={handleCancelEdit}
                        handleSaveChanges={handleSaveChanges}
                        isEditing={isEditing}
                        isSaving={isSaving}
                        setEditableDocument={setEditableDocument}
                        setIsEditing={setIsEditing}
                      />
                    )}
                  </div>

                  {/* Separador */}
                  <div className="mt-6 pb-5 w-full border-t border-gray-200" />

                  {/* Mensajes especiales según validación/estado */}
                  {isProcesando && (
                    <div className="flex flex-col items-center justify-center py-10 px-12 text-center text-slate-500">
                      <Spinner
                        label="El documento esta siendo procesado o se encuentra en la cola de procesamiento, por favor aguarde."
                        variant="dots"
                      />
                    </div>
                  )}
                  {isSinDatos && (
                    <div className="flex flex-col items-center justify-center py-10 text-center text-slate-600">
                      <IoMdAlert className="mx-auto mb-2 text-yellow-400" size={28} />
                      <span className="text-base font-medium text-medium">No se han identificado las tablas.</span>
                      <span className="mt-2 text-sm">
                        Por favor verifica que el documento cargado sea correcto o vuelve a procesar el archivo.
                      </span>
                    </div>
                  )}
                  {/* Tabs y contenido */}
                  {hasValidationAndStatus && !isSinDatos && !isProcesando && (
                    <>
                      <Tabs
                        fullWidth
                        className="rounded-xl"
                        radius="lg"
                        selectedKey={activeTab}
                        size="md"
                        onSelectionChange={(key) => setActiveTab(key as string)}>
                        <Tab key="balance_sheet" title="Situación patrimonial" />
                        <Tab key="income_statement_sheet" title="Estado de resultados" />
                        <Tab key="company_info" title="Información general" />
                      </Tabs>
                      {/* Contenido de cada tab */}
                      {activeTab === "balance_sheet" && editableDocument?.balance_data?.resultados_principales && (
                        <>
                          <h2 className="text-lg font-light text-foreground-700 mb-4 mt-4 pl-2">Resultados principales</h2>
                          <BalanceSheetMainResults
                            isEditing={isEditing}
                            resultadosPrincipales={editableDocument.balance_data.resultados_principales}
                            setResultadosPrincipales={(newData: any) =>
                              setEditableDocument((prev: any) => ({
                                ...prev,
                                balance_data: {
                                  ...prev.balance_data,
                                  resultados_principales: newData,
                                },
                              }))
                            }
                          />

                          <h2 className="text-lg font-light text-foreground-700 mb-4 mt-6 pl-2">Detalle del Activo</h2>
                          {editableDocument.balance_data.detalles_activo && (
                            <ItemsTable
                              data={editableDocument.balance_data.detalles_activo}
                              isEditing={isEditing}
                              setData={(newData: any) =>
                                setEditableDocument((prev: any) => ({
                                  ...prev,
                                  balance_data: {
                                    ...prev.balance_data,
                                    detalles_activo: newData,
                                  },
                                }))
                              }
                            />
                          )}

                          <h2 className="text-lg font-light text-foreground-700 mb-4 mt-6 pl-2">Detalle del Pasivo</h2>
                          {editableDocument.balance_data.detalles_pasivo && (
                            <ItemsTable
                              data={editableDocument.balance_data.detalles_pasivo}
                              isEditing={isEditing}
                              setData={(newData: any) =>
                                setEditableDocument((prev: any) => ({
                                  ...prev,
                                  balance_data: {
                                    ...prev.balance_data,
                                    detalles_pasivo: newData,
                                  },
                                }))
                              }
                            />
                          )}

                          <h2 className="text-lg font-light text-foreground-700 mb-4 mt-6 pl-2">Detalle del Patrimonio Neto</h2>
                          {editableDocument.balance_data.detalles_patrimonio_neto && (
                            <ItemsTable
                              data={editableDocument.balance_data.detalles_patrimonio_neto}
                              isEditing={isEditing}
                              setData={(newData: any) =>
                                setEditableDocument((prev: any) => ({
                                  ...prev,
                                  balance_data: {
                                    ...prev.balance_data,
                                    detalles_patrimonio_neto: newData,
                                  },
                                }))
                              }
                            />
                          )}
                        </>
                      )}

                      {activeTab === "income_statement_sheet" &&
                        editableDocument?.income_statement_data?.resultados_principales && (
                          <>
                            <h2 className="text-lg font-light text-foreground-700 mb-4 mt-4 pl-2">Resultados principales</h2>
                            <IncomeStatementMainResults
                              isEditing={isEditing}
                              resultadosPrincipales={editableDocument.income_statement_data.resultados_principales}
                              setResultadosPrincipales={(newData: any) =>
                                setEditableDocument((prev: any) => ({
                                  ...prev,
                                  income_statement_data: {
                                    ...prev.income_statement_data,
                                    resultados_principales: newData,
                                  },
                                }))
                              }
                            />

                            <h2 className="text-lg font-light text-foreground-700 mb-4 mt-6 pl-2">
                              Cuadro de Estado de Resultados
                            </h2>
                            {editableDocument.income_statement_data.detalles_estado_resultados && (
                              <ItemsTable
                                data={editableDocument.income_statement_data.detalles_estado_resultados}
                                isEditing={isEditing}
                                setData={(newData: any) =>
                                  setEditableDocument((prev: any) => ({
                                    ...prev,
                                    income_statement_data: {
                                      ...prev.income_statement_data,
                                      detalles_estado_resultados: newData,
                                    },
                                  }))
                                }
                              />
                            )}
                          </>
                        )}
                      {activeTab === "company_info" && (
                        <CompanyInfo
                          document={document}
                          editableDocument={editableDocument}
                          isEditing={isEditing}
                          setEditableDocument={setEditableDocument}
                        />
                      )}
                    </>
                  )}
                </ScrollShadow>
              </div>
            </Panel>

            {/* ░░ Resize Handle ░░ */}
            <PanelResizeHandle className="w-[6px] bg-slate-200 hover:bg-slate-300 transition-colors cursor-col-resize" />

            {/* ░░ Panel derecho (visor imagen) ░░ */}
            <Panel defaultSize={100 - DEFAULT_LEFT_PANEL_SIZE} minSize={MIN_RIGHT_PANEL_SIZE}>
              <div className="h-full bg-[#f7f9ff] pt-2 pb-2 border-r">
                {errorDocument ? (
                  <div className="text-center py-4 text-red-500">{errorDocument}</div>
                ) : isProcesando ? (
                  <div className="flex flex-col items-center justify-center h-full text-slate-500">
                    <Spinner variant="dots" />
                  </div>
                ) : isSinDatos ? (
                  <div className="flex flex-col items-center justify-center h-full text-slate-500 max-w-xs mx-auto text-center">
                    <IoMdInformationCircleOutline className="mb-2 text-blue-400" size={28} />
                    <span className="text-base text-md">
                      No se ha encontrado la Tabla de Estado de Resultados o de Situación Patrimonial.
                    </span>
                  </div>
                ) : documentSheets.length > 0 ? (
                  <ImageViewer currentPage={currentPage} documentSheets={documentSheets} setCurrentPage={setCurrentPage} />
                ) : null}
              </div>
            </Panel>
          </PanelGroup>
        </div>
      </div>
    </div>
  );
};

export default DocumentsPage;
