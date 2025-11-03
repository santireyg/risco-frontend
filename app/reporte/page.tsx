"use client";

import type { ChequesRechazados, DebtHistory, EstadosContables } from "./types";

import { Tabs, Tab } from "@heroui/tabs";
import { Button } from "@heroui/button";
import { Breadcrumbs, BreadcrumbItem } from "@heroui/breadcrumbs";
import { IoMdArrowBack } from "react-icons/io";
import { useRouter } from "next/navigation";
import {
  ClipboardDocumentListIcon,
  ChartBarIcon,
  BuildingLibraryIcon,
} from "@heroicons/react/24/outline";

import CompanyHeader from "./components/header/CompanyHeader";
import ResumenEjecutivo from "./components/tabs/ResumenEjecutivo";
import PlaceholderTab from "./components/tabs/PlaceholderTab";
import EstadoDeudorBCRATab from "./components/tabs/EstadoDeudorBCRATab";
import { formatDate } from "./utils/formatting";
// Importar datos mock
import estadosContablesData from "./mock-data/datos_estados_contables.json";
import deudasHistoriaData from "./mock-data/deudas_historia.json";
import chequesRechazadosData from "./mock-data/cheques_rechazados.json";
import deudasUltimoPeriodoData from "./mock-data/deudas_ultimo_periodo.json";

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
  const deudasUltimoPeriodo = deudasUltimoPeriodoData as DebtHistory;
  const formattedCuit = formatCuit(
    estadosContables?.company_info?.company_cuit,
  );

  return (
    <div>
      <div className="container mx-auto flex items-center h-14 pl-2">
        <div className="flex items-center gap-4">
          <Button
            className="bg-slate-100 text-slate-500 border"
            radius="md"
            size="sm"
            startContent={<IoMdArrowBack />}
            onPress={() => router.push("/")}
          >
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
            balanceDate={estadosContables.balance_date.$date}
            balanceDatePrevious={estadosContables.balance_date_previous.$date}
            companyInfo={estadosContables.company_info}
            reportDate={reportDate}
          />
        </div>
      </div>

      <div className="border-t border-slate-200">
        <div className="min-h-screen bg-white py-8 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            {/* Navegación de tabs */}
            <Tabs
              aria-label="Secciones del reporte"
              className="mb-3"
              defaultSelectedKey="resumen"
            >
              <Tab
                key="resumen"
                title={
                  <div className="flex items-center justify-center gap-2">
                    <ClipboardDocumentListIcon
                      aria-hidden="true"
                      className="h-4 w-4 ml-2"
                    />
                    <span className="truncate mr-2">Resumen Ejecutivo</span>
                  </div>
                }
              >
                <ResumenEjecutivo
                  chequesRechazados={chequesRechazados}
                  deudasHistoria={deudasHistoria}
                  estadosContables={estadosContables}
                  reportDate={reportDate}
                />
              </Tab>
              <Tab
                key="financiera"
                title={
                  <div className="flex items-center justify-center gap-2">
                    <ChartBarIcon aria-hidden="true" className="h-4 w-4 ml-2" />
                    <span className="truncate mr-2">Situación Financiera</span>
                  </div>
                }
              >
                <PlaceholderTab
                  description="Esta sección contendrá gráficos detallados de evolución financiera, análisis de estados de resultados, ratios adicionales y comparativas temporales."
                  title="Situación Financiera"
                />
              </Tab>
              <Tab
                key="deudor"
                title={
                  <div className="flex items-center justify-center gap-2">
                    <BuildingLibraryIcon
                      aria-hidden="true"
                      className="h-4 w-4 ml-2"
                    />
                    <span className="truncate mr-2">Estado Deudor (BCRA)</span>
                  </div>
                }
              >
                <EstadoDeudorBCRATab
                  chequesRechazados={chequesRechazados}
                  deudasHistoria={deudasHistoria}
                  deudasUltimoPeriodo={deudasUltimoPeriodo}
                  reportDate={reportDate}
                />
              </Tab>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}
