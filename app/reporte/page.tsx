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

export default function ReportePage() {
  const router = useRouter();

  const reporteData = reporteDataV2 as unknown as ReporteDataV2;

  // Build deudasHistoria from reporteData.bcra_data
  const deudasHistoria = {
    status: 200,
    results: {
      identificacion: parseInt(reporteData.bcra_data.identificacion),
      denominacion: reporteData.bcra_data.denominacion,
      periodos: [reporteData.bcra_data.deudas_ultimo_periodo, ...reporteData.bcra_data.deudas_historia].map((periodo) => ({
        periodo: periodo.periodo,
        entidades: periodo.entidades.map((entidad) => ({
          entidad: entidad.entidad,
          situacion: entidad.situacion,
          monto: entidad.monto,
          enRevision: entidad.enRevision,
          procesoJud: entidad.procesoJud,
          fechaSit1: entidad.fechaSit1,
          diasAtrasoPago: entidad.diasAtrasoPago,
          refinanciaciones: entidad.refinanciaciones,
          recategorizacionOblig: entidad.recategorizacionOblig,
          situacionJuridica: entidad.situacionJuridica,
          irrecDisposicionTecnica: entidad.irrecDisposicionTecnica,
        })),
      })),
    },
  };

  // Build deudasUltimoPeriodo from reporteData.bcra_data
  const deudasUltimoPeriodo = {
    status: 200,
    results: {
      identificacion: parseInt(reporteData.bcra_data.identificacion),
      denominacion: reporteData.bcra_data.denominacion,
      periodos: [
        {
          periodo: reporteData.bcra_data.deudas_ultimo_periodo.periodo,
          entidades: reporteData.bcra_data.deudas_ultimo_periodo.entidades.map((entidad) => ({
            entidad: entidad.entidad,
            situacion: entidad.situacion,
            monto: entidad.monto,
            enRevision: entidad.enRevision,
            procesoJud: entidad.procesoJud,
            fechaSit1: entidad.fechaSit1,
            diasAtrasoPago: entidad.diasAtrasoPago,
            refinanciaciones: entidad.refinanciaciones,
            recategorizacionOblig: entidad.recategorizacionOblig,
            situacionJuridica: entidad.situacionJuridica,
            irrecDisposicionTecnica: entidad.irrecDisposicionTecnica,
          })),
        },
      ],
    },
  };

  // Build chequesRechazados from reporteData.bcra_data
  const chequesRechazados = {
    status: 200,
    results: {
      identificacion: parseInt(reporteData.bcra_data.identificacion),
      denominacion: reporteData.bcra_data.denominacion,
      causales: reporteData.bcra_data.cheques_rechazados.map((cheque) => ({
        causal: cheque.causal,
        entidades: cheque.entidades.map((ent) => ({
          entidad: ent.entidad,
          detalle: ent.detalle.map((det) => ({
            nroCheque: det.nroCheque,
            fechaRechazo: det.fechaRechazo,
            monto: det.monto,
            fechaPago: det.fechaPago,
            fechaPagoMulta: det.fechaPagoMulta,
            estadoMulta: det.estadoMulta,
            ctaPersonal: det.ctaPersonal,
            denomJuridica: det.denomJuridica,
            enRevision: det.enRevision,
            procesoJud: det.procesoJud,
          })),
        })),
      })),
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
                      resultados_principales: {
                        disponibilidades_caja_banco_o_equivalentes_actual:
                          reporteData.statement_data.balance_data.resultados_principales.find(
                            (item) => item.concepto_code === "disponibilidades"
                          )?.monto_actual || 0,
                        disponibilidades_caja_banco_o_equivalentes_anterior:
                          reporteData.statement_data.balance_data.resultados_principales.find(
                            (item) => item.concepto_code === "disponibilidades"
                          )?.monto_anterior || 0,
                        bienes_de_cambio_o_equivalentes_actual:
                          reporteData.statement_data.balance_data.resultados_principales.find(
                            (item) => item.concepto_code === "bienes_de_cambio"
                          )?.monto_actual || 0,
                        bienes_de_cambio_o_equivalentes_anterior:
                          reporteData.statement_data.balance_data.resultados_principales.find(
                            (item) => item.concepto_code === "bienes_de_cambio"
                          )?.monto_anterior || 0,
                        activo_corriente_actual:
                          reporteData.statement_data.balance_data.resultados_principales.find(
                            (item) => item.concepto_code === "activo_corriente"
                          )?.monto_actual || 0,
                        activo_corriente_anterior:
                          reporteData.statement_data.balance_data.resultados_principales.find(
                            (item) => item.concepto_code === "activo_corriente"
                          )?.monto_anterior || 0,
                        activo_no_corriente_actual:
                          reporteData.statement_data.balance_data.resultados_principales.find(
                            (item) => item.concepto_code === "activo_no_corriente"
                          )?.monto_actual || 0,
                        activo_no_corriente_anterior:
                          reporteData.statement_data.balance_data.resultados_principales.find(
                            (item) => item.concepto_code === "activo_no_corriente"
                          )?.monto_anterior || 0,
                        activo_total_actual:
                          reporteData.statement_data.balance_data.resultados_principales.find(
                            (item) => item.concepto_code === "activo_total"
                          )?.monto_actual || 0,
                        activo_total_anterior:
                          reporteData.statement_data.balance_data.resultados_principales.find(
                            (item) => item.concepto_code === "activo_total"
                          )?.monto_anterior || 0,
                        pasivo_corriente_actual:
                          reporteData.statement_data.balance_data.resultados_principales.find(
                            (item) => item.concepto_code === "pasivo_corriente"
                          )?.monto_actual || 0,
                        pasivo_corriente_anterior:
                          reporteData.statement_data.balance_data.resultados_principales.find(
                            (item) => item.concepto_code === "pasivo_corriente"
                          )?.monto_anterior || 0,
                        pasivo_no_corriente_actual:
                          reporteData.statement_data.balance_data.resultados_principales.find(
                            (item) => item.concepto_code === "pasivo_no_corriente"
                          )?.monto_actual || 0,
                        pasivo_no_corriente_anterior:
                          reporteData.statement_data.balance_data.resultados_principales.find(
                            (item) => item.concepto_code === "pasivo_no_corriente"
                          )?.monto_anterior || 0,
                        pasivo_total_actual:
                          reporteData.statement_data.balance_data.resultados_principales.find(
                            (item) => item.concepto_code === "pasivo_total"
                          )?.monto_actual || 0,
                        pasivo_total_anterior:
                          reporteData.statement_data.balance_data.resultados_principales.find(
                            (item) => item.concepto_code === "pasivo_total"
                          )?.monto_anterior || 0,
                        patrimonio_neto_actual:
                          reporteData.statement_data.balance_data.resultados_principales.find(
                            (item) => item.concepto_code === "patrimonio_neto"
                          )?.monto_actual || 0,
                        patrimonio_neto_anterior:
                          reporteData.statement_data.balance_data.resultados_principales.find(
                            (item) => item.concepto_code === "patrimonio_neto"
                          )?.monto_anterior || 0,
                      },
                      detalles_activo: reporteData.statement_data.balance_data.detalles_activo?.map((item) => ({
                        concepto: item.concepto,
                        monto_periodo_actual: item.monto_actual,
                        monto_periodo_anterior: item.monto_anterior,
                      })),
                      detalles_pasivo: reporteData.statement_data.balance_data.detalles_pasivo?.map((item) => ({
                        concepto: item.concepto,
                        monto_periodo_actual: item.monto_actual,
                        monto_periodo_anterior: item.monto_anterior,
                      })),
                      detalles_patrimonio_neto: reporteData.statement_data.balance_data.detalles_patrimonio_neto?.map((item) => ({
                        concepto: item.concepto,
                        monto_periodo_actual: item.monto_actual,
                        monto_periodo_anterior: item.monto_anterior,
                      })),
                    },
                    income_statement_data: {
                      resultados_principales: {
                        ingresos_operativos_empresa_actual:
                          reporteData.statement_data.income_statement_data.resultados_principales.find(
                            (item) => item.concepto_code === "ingresos_por_venta"
                          )?.monto_actual || 0,
                        ingresos_operativos_empresa_anterior:
                          reporteData.statement_data.income_statement_data.resultados_principales.find(
                            (item) => item.concepto_code === "ingresos_por_venta"
                          )?.monto_anterior || 0,
                        resultados_antes_de_impuestos_actual:
                          reporteData.statement_data.income_statement_data.resultados_principales.find(
                            (item) => item.concepto_code === "resultados_antes_de_impuestos"
                          )?.monto_actual || 0,
                        resultados_antes_de_impuestos_anterior:
                          reporteData.statement_data.income_statement_data.resultados_principales.find(
                            (item) => item.concepto_code === "resultados_antes_de_impuestos"
                          )?.monto_anterior || 0,
                        resultados_del_ejercicio_actual:
                          reporteData.statement_data.income_statement_data.resultados_principales.find(
                            (item) => item.concepto_code === "resultados_del_ejercicio"
                          )?.monto_actual || 0,
                        resultados_del_ejercicio_anterior:
                          reporteData.statement_data.income_statement_data.resultados_principales.find(
                            (item) => item.concepto_code === "resultados_del_ejercicio"
                          )?.monto_anterior || 0,
                      },
                      detalles_estado_resultados:
                        reporteData.statement_data.income_statement_data.detalles_estado_resultados?.map((item) => ({
                          concepto: item.concepto,
                          monto_periodo_actual: item.monto_actual,
                          monto_periodo_anterior: item.monto_anterior,
                        })),
                    },
                  }}
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
