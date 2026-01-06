"use client";

import { useContext } from "react";
import { useParams, useRouter } from "next/navigation";
import { Tabs, Tab } from "@heroui/tabs";
import { Button } from "@heroui/button";
import { Breadcrumbs, BreadcrumbItem } from "@heroui/breadcrumbs";
import { Spinner } from "@heroui/spinner";
import { IoMdArrowBack } from "react-icons/io";
import { ClipboardDocumentListIcon, ChartBarIcon, BuildingLibraryIcon } from "@heroicons/react/24/outline";

import { AuthContext } from "../../context/AuthContext";

import CompanyHeader from "./components/header/CompanyHeader";
import ResumenEjecutivo from "./components/tabs/ResumenEjecutivo";
import EstadoDeudorBCRATab from "./components/tabs/EstadoDeudorBCRATab";
import SituacionFinancieraTab from "./components/tabs/SituacionFinancieraTab";
import { formatDate } from "./utils/formatting";
import { useReport } from "./hooks/useReport";
import { transformReportData } from "./utils/transformers";

import StatusMessage from "@/components/StatusMessage";

export default function ReportPage() {
  const router = useRouter();
  const { report_id } = useParams() as { report_id: string };
  const { user, isLoading: authLoading } = useContext(AuthContext);

  const { report, loading, error } = useReport(report_id);

  // Authentication check
  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner label="Verificando sesión..." size="lg" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <p className="text-lg text-gray-600">No estás autenticado. Por favor, inicia sesión.</p>
        <Button color="primary" onPress={() => router.push("/login")}>
          Ir a Login
        </Button>
      </div>
    );
  }

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Spinner label="Cargando reporte..." size="lg" />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4 px-4">
        <div className="max-w-2xl w-full">
          <h2 className="text-xl font-semibold mb-4 text-center">Error al cargar el reporte</h2>
          <StatusMessage message={error} type="error" />
        </div>
        <div className="flex gap-2">
          <Button color="default" onPress={() => router.push("/home")}>
            Volver al inicio
          </Button>
          <Button color="primary" onPress={() => window.location.reload()}>
            Reintentar
          </Button>
        </div>
      </div>
    );
  }

  // No data state
  if (!report) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen gap-4">
        <p className="text-lg text-gray-600">No se encontraron datos del reporte.</p>
        <Button color="default" onPress={() => router.push("/home")}>
          Volver al inicio
        </Button>
      </div>
    );
  }

  // Transform API data to component format
  const { deudasHistoria, deudasUltimoPeriodo, chequesRechazados, estadosContables, formattedCuit } = transformReportData(report);

  return (
    <div>
      <div className="container mx-auto flex items-center h-14 pl-2">
        <div className="flex items-center gap-4">
          <Button
            className="bg-slate-100 text-slate-500 border"
            radius="md"
            size="sm"
            startContent={<IoMdArrowBack />}
            onPress={() => router.push("/home")}>
            Homepage
          </Button>

          <Breadcrumbs>
            <BreadcrumbItem href="/home">Home</BreadcrumbItem>
            {report.docfile_id && <BreadcrumbItem href={`/document/${report.docfile_id}`}>Documento</BreadcrumbItem>}
            <BreadcrumbItem>{formattedCuit ?? "Cargando..."}</BreadcrumbItem>
          </Breadcrumbs>
        </div>
      </div>

      <div className="border-t border-slate-200 bg-slate-100 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto items-center pt-8">
          {/* Header de la empresa */}
          <CompanyHeader
            balanceDate={report.statement_data.statement_date.$date}
            balanceDatePrevious={report.statement_data.statement_date_previous.$date}
            companyInfo={report.company_info}
            reportDate={formatDate(report.bcra_data.fecha_consulta)}
          />
        </div>
      </div>

      <div className="border-t border-slate-200">
        <div className="min-h-screen bg-white py-8 px-4 sm:px-6 lg:px-8">
          <div className="max-w-7xl mx-auto">
            {/* Navegación de tabs */}
            <Tabs aria-label="Secciones del reporte" className="mb-3" defaultSelectedKey="resumen">
              <Tab
                key="resumen"
                title={
                  <div className="flex items-center justify-center gap-2">
                    <ClipboardDocumentListIcon aria-hidden="true" className="h-4 w-4 ml-2" />
                    <span className="truncate mr-2">Resumen Ejecutivo</span>
                  </div>
                }>
                <ResumenEjecutivo chequesRechazados={chequesRechazados} deudasHistoria={deudasHistoria} reporteData={report} />
              </Tab>
              <Tab
                key="financiera"
                title={
                  <div className="flex items-center justify-center gap-2">
                    <ChartBarIcon aria-hidden="true" className="h-4 w-4 ml-2" />
                    <span className="truncate mr-2">Situación Financiera</span>
                  </div>
                }>
                <SituacionFinancieraTab estadosContables={estadosContables} indicators={report.indicators} />
              </Tab>
              <Tab
                key="deudor"
                title={
                  <div className="flex items-center justify-center gap-2">
                    <BuildingLibraryIcon aria-hidden="true" className="h-4 w-4 ml-2" />
                    <span className="truncate mr-2">Estado Deudor (BCRA)</span>
                  </div>
                }>
                <EstadoDeudorBCRATab
                  chequesRechazados={chequesRechazados}
                  deudasHistoria={deudasHistoria}
                  deudasUltimoPeriodo={deudasUltimoPeriodo}
                  reportDate={formatDate(report.bcra_data.fecha_consulta)}
                />
              </Tab>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}
