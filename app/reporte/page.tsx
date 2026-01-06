"use client";

import type { ReporteDataV2 } from "./types";

import { Tabs, Tab } from "@heroui/tabs";
import { Button } from "@heroui/button";
import { Breadcrumbs, BreadcrumbItem } from "@heroui/breadcrumbs";
import { IoMdArrowBack } from "react-icons/io";
import { useRouter } from "next/navigation";
import { ClipboardDocumentListIcon, ChartBarIcon, BuildingLibraryIcon } from "@heroicons/react/24/outline";

import CompanyHeader from "./components/header/CompanyHeader";
import ResumenEjecutivo from "./components/tabs/ResumenEjecutivo";
import EstadoDeudorBCRATab from "./components/tabs/EstadoDeudorBCRATab";
import SituacionFinancieraTab from "./components/tabs/SituacionFinancieraTab";
import { formatDate } from "./utils/formatting";
// Import mock_data_v2
import reporteDataV2 from "./mock-data/mock_data_v2.json";

const formatCuit = (cuit?: string | null) => {
  if (!cuit) return null;
  const digits = cuit.replace(/\D/g, "");

  if (digits.length !== 11) return cuit;

  return `${digits.slice(0, 2)}-${digits.slice(2, 10)}-${digits.slice(10)}`;
};

// Helper function to find balance item by code
const findBalanceItem = (items: any[], code: string) => {
  const item = items.find((item) => item.concepto_code === code);

  return {
    actual: item?.monto_actual || 0,
    anterior: item?.monto_anterior || 0,
  };
};

// Helper function to map detail items from V2 to legacy format
const mapDetailItems = (items?: any[]) => {
  if (!items) return undefined;

  return items.map((item) => ({
    concepto: item.concepto,
    monto_periodo_actual: item.monto_actual,
    monto_periodo_anterior: item.monto_anterior,
  }));
};

export default function ReportePage() {
  const router = useRouter();

  const reporteData = reporteDataV2 as unknown as ReporteDataV2;

  // Build data structures from reporteData.bcra_data
  const deudasHistoria = {
    status: 200,
    results: {
      identificacion: parseInt(reporteData.bcra_data.identificacion),
      denominacion: reporteData.bcra_data.denominacion,
      periodos: [reporteData.bcra_data.deudas_ultimo_periodo, ...reporteData.bcra_data.deudas_historia],
    },
  };

  const deudasUltimoPeriodo = {
    status: 200,
    results: {
      identificacion: parseInt(reporteData.bcra_data.identificacion),
      denominacion: reporteData.bcra_data.denominacion,
      periodos: [reporteData.bcra_data.deudas_ultimo_periodo],
    },
  };

  const chequesRechazados = {
    status: 200,
    results: {
      identificacion: parseInt(reporteData.bcra_data.identificacion),
      denominacion: reporteData.bcra_data.denominacion,
      causales: reporteData.bcra_data.cheques_rechazados,
    },
  };

  const formattedCuit = formatCuit(reporteData?.company_info?.company_cuit);

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
            balanceDate={reporteData.statement_data.statement_date.$date}
            balanceDatePrevious={reporteData.statement_data.statement_date_previous.$date}
            companyInfo={reporteData.company_info}
            reportDate={formatDate(reporteData.bcra_data.fecha_consulta)}
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
                <ResumenEjecutivo
                  chequesRechazados={chequesRechazados}
                  deudasHistoria={deudasHistoria}
                  reporteData={reporteData}
                />
              </Tab>
              <Tab
                key="financiera"
                title={
                  <div className="flex items-center justify-center gap-2">
                    <ChartBarIcon aria-hidden="true" className="h-4 w-4 ml-2" />
                    <span className="truncate mr-2">Situación Financiera</span>
                  </div>
                }>
                <SituacionFinancieraTab
                  estadosContables={{
                    balance_date: reporteData.statement_data.statement_date,
                    balance_date_previous: reporteData.statement_data.statement_date_previous,
                    company_info: reporteData.company_info,
                    balance_data: {
                      resultados_principales: (() => {
                        const balanceItems = reporteData.statement_data.balance_data.resultados_principales;
                        const disponibilidades = findBalanceItem(balanceItems, "disponibilidades");
                        const bienesCambio = findBalanceItem(balanceItems, "bienes_de_cambio");
                        const activoCorriente = findBalanceItem(balanceItems, "activo_corriente");
                        const activoNoCorriente = findBalanceItem(balanceItems, "activo_no_corriente");
                        const activoTotal = findBalanceItem(balanceItems, "activo_total");
                        const pasivoCorriente = findBalanceItem(balanceItems, "pasivo_corriente");
                        const pasivoNoCorriente = findBalanceItem(balanceItems, "pasivo_no_corriente");
                        const pasivoTotal = findBalanceItem(balanceItems, "pasivo_total");
                        const patrimonioNeto = findBalanceItem(balanceItems, "patrimonio_neto");

                        return {
                          disponibilidades_caja_banco_o_equivalentes_actual: disponibilidades.actual,
                          disponibilidades_caja_banco_o_equivalentes_anterior: disponibilidades.anterior,
                          bienes_de_cambio_o_equivalentes_actual: bienesCambio.actual,
                          bienes_de_cambio_o_equivalentes_anterior: bienesCambio.anterior,
                          activo_corriente_actual: activoCorriente.actual,
                          activo_corriente_anterior: activoCorriente.anterior,
                          activo_no_corriente_actual: activoNoCorriente.actual,
                          activo_no_corriente_anterior: activoNoCorriente.anterior,
                          activo_total_actual: activoTotal.actual,
                          activo_total_anterior: activoTotal.anterior,
                          pasivo_corriente_actual: pasivoCorriente.actual,
                          pasivo_corriente_anterior: pasivoCorriente.anterior,
                          pasivo_no_corriente_actual: pasivoNoCorriente.actual,
                          pasivo_no_corriente_anterior: pasivoNoCorriente.anterior,
                          pasivo_total_actual: pasivoTotal.actual,
                          pasivo_total_anterior: pasivoTotal.anterior,
                          patrimonio_neto_actual: patrimonioNeto.actual,
                          patrimonio_neto_anterior: patrimonioNeto.anterior,
                        };
                      })(),
                      detalles_activo: mapDetailItems(reporteData.statement_data.balance_data.detalles_activo),
                      detalles_pasivo: mapDetailItems(reporteData.statement_data.balance_data.detalles_pasivo),
                      detalles_patrimonio_neto: mapDetailItems(reporteData.statement_data.balance_data.detalles_patrimonio_neto),
                    },
                    income_statement_data: {
                      resultados_principales: (() => {
                        const incomeItems = reporteData.statement_data.income_statement_data.resultados_principales;
                        const ingresosVenta = findBalanceItem(incomeItems, "ingresos_por_venta");
                        const resultadosAntesImpuestos = findBalanceItem(incomeItems, "resultados_antes_de_impuestos");
                        const resultadosEjercicio = findBalanceItem(incomeItems, "resultados_del_ejercicio");

                        return {
                          ingresos_operativos_empresa_actual: ingresosVenta.actual,
                          ingresos_operativos_empresa_anterior: ingresosVenta.anterior,
                          resultados_antes_de_impuestos_actual: resultadosAntesImpuestos.actual,
                          resultados_antes_de_impuestos_anterior: resultadosAntesImpuestos.anterior,
                          resultados_del_ejercicio_actual: resultadosEjercicio.actual,
                          resultados_del_ejercicio_anterior: resultadosEjercicio.anterior,
                        };
                      })(),
                      detalles_estado_resultados: mapDetailItems(
                        reporteData.statement_data.income_statement_data.detalles_estado_resultados
                      ),
                    },
                  }}
                  indicators={reporteData.indicators}
                />
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
                  reportDate={formatDate(reporteData.bcra_data.fecha_consulta)}
                />
              </Tab>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}
