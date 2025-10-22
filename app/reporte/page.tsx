"use client";

import { Tabs, Tab } from "@heroui/tabs";
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

export default function ReportePage() {
  // Fecha actual del reporte
  const reportDate = formatDate(new Date());
  const estadosContables = estadosContablesData as EstadosContables;
  const deudasHistoria = deudasHistoriaData as DebtHistory;
  const chequesRechazados = chequesRechazadosData as ChequesRechazados;

  return (
    <div className="min-h-screen bg-white py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header de la empresa */}
        <CompanyHeader
          companyInfo={estadosContables.company_info}
          balanceDate={estadosContables.balance_date.$date}
          balanceDatePrevious={estadosContables.balance_date_previous.$date}
          reportDate={reportDate}
        />

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
  );
}
