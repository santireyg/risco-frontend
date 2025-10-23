"use client";

import { Tabs, Tab } from "@heroui/tabs";
import { Button } from "@heroui/button";
import { Breadcrumbs, BreadcrumbItem } from "@heroui/breadcrumbs";
import { IoMdArrowBack } from "react-icons/io";
import { useRouter } from "next/navigation";
import { ClipboardDocumentListIcon, ChartBarIcon, BuildingLibraryIcon } from "@heroicons/react/24/outline";
import CompanyHeader from "./components/header/CompanyHeader";
import ResumenEjecutivo from "./components/tabs/ResumenEjecutivo";
import PlaceholderTab from "./components/tabs/PlaceholderTab";
import type { ChequesRechazados, DebtHistory, EstadosContables } from "./types";
import { formatDate } from "./utils/formatting";

// Importar datos mock
import estadosContablesData from "./mock-data/datos_estados_contables.json";
import deudasHistoriaData from "./mock-data/deudas_historia.json";
import chequesRechazadosData from "./mock-data/cheques_rechazados.json";

const formatCuit = (cuit?: string | null) => {
  if (!cuit) return null;
  const digits = cuit.replace(/\D/g, "");
  if (digits.length !== 11) return cuit;
  return `${digits.slice(0, 2)}-${digits.slice(2, 10)}-${digits.slice(10)}`;
};

export default function ReportePage() {
  const router = useRouter();

  // Fecha actual del reporte
  const reportDate = formatDate(new Date());
  const estadosContables = estadosContablesData as EstadosContables;
  const deudasHistoria = deudasHistoriaData as DebtHistory;
  const chequesRechazados = chequesRechazadosData as ChequesRechazados;
  const formattedCuit = formatCuit(estadosContables?.company_info?.company_cuit);

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

      <div className="border-t border-slate-200 bg-slate-100 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto items-center pt-8">
          {/* Header de la empresa */}
          <CompanyHeader
            companyInfo={estadosContables.company_info}
            balanceDate={estadosContables.balance_date.$date}
            balanceDatePrevious={estadosContables.balance_date_previous.$date}
            reportDate={reportDate}
          />
        </div>
      </div>

      <div className="border-t border-slate-200">
        <div className="min-h-screen bg-white py-8 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            {/* Navegación de tabs */}
            <Tabs aria-label="Secciones del reporte" defaultSelectedKey="resumen" className="mb-3">
              <Tab
                key="resumen"
                title={
                  <div className="flex items-center justify-center gap-2">
                    <ClipboardDocumentListIcon className="h-4 w-4 ml-2" aria-hidden="true" />
                    <span className="truncate mr-2">Resumen Ejecutivo</span>
                  </div>
                }>
                <ResumenEjecutivo
                  estadosContables={estadosContables}
                  deudasHistoria={deudasHistoria}
                  chequesRechazados={chequesRechazados}
                  reportDate={reportDate}
                />
              </Tab>
              <Tab
                key="financiera"
                title={
                  <div className="flex items-center justify-center gap-2">
                    <ChartBarIcon className="h-4 w-4 ml-2" aria-hidden="true" />
                    <span className="truncate mr-2">Situación Financiera</span>
                  </div>
                }>
                <PlaceholderTab
                  title="Situación Financiera"
                  description="Esta sección contendrá gráficos detallados de evolución financiera, análisis de estados de resultados, ratios adicionales y comparativas temporales."
                />
              </Tab>
              <Tab
                key="deudor"
                title={
                  <div className="flex items-center justify-center gap-2">
                    <BuildingLibraryIcon className="h-4 w-4 ml-2" aria-hidden="true" />
                    <span className="truncate mr-2">Estado Deudor (BCRA)</span>
                  </div>
                }>
                <PlaceholderTab
                  title="Estado Deudor (BCRA)"
                  description="Esta sección contendrá el detalle completo de deudas por entidad, evolución histórica, análisis de situaciones y procesos judiciales."
                />
              </Tab>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}
