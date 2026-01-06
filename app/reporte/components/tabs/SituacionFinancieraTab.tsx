"use client";

import { useMemo } from "react";
import { Accordion, AccordionItem } from "@heroui/accordion";

import { EstadosContables, IndicatorV2 } from "../../types";
import { transformIndicatorsToKPIs } from "../../utils/calculations";
import FinancialKPIsGrid from "../tabs-components/situacion-financiera/FinancialKPIsGrid";
import BalanceStructureChart from "../tabs-components/situacion-financiera/BalanceStructureChart";
import IncomeStatementChart from "../tabs-components/situacion-financiera/IncomeStatementChart";
import IncomeStatementTable from "../tabs-components/situacion-financiera/IncomeStatementTable";
import BalanceDetailTable from "../tabs-components/situacion-financiera/BalanceDetailTable";

interface SituacionFinancieraTabProps {
  estadosContables: EstadosContables;
  indicators: IndicatorV2[];
}

export default function SituacionFinancieraTab({
  estadosContables,
  indicators,
}: SituacionFinancieraTabProps) {
  const kpis = useMemo(
    () => transformIndicatorsToKPIs(indicators),
    [indicators],
  );

  // Extract years from dates
  const currentYear = useMemo(() => {
    const date = estadosContables.balance_date?.$date;

    return date ? new Date(date).getFullYear().toString() : "N/A";
  }, [estadosContables]);

  const previousYear = useMemo(() => {
    const date = estadosContables.balance_date_previous?.$date;

    return date ? new Date(date).getFullYear().toString() : "N/A";
  }, [estadosContables]);

  const balanceData = useMemo(() => {
    const balance = estadosContables.balance_data.resultados_principales;

    return [
      {
        year: previousYear,
        activoCorriente: balance.activo_corriente_anterior,
        activoNoCorriente: balance.activo_no_corriente_anterior,
        pasivoCorriente: balance.pasivo_corriente_anterior,
        pasivoNoCorriente: balance.pasivo_no_corriente_anterior,
        patrimonioNeto: balance.patrimonio_neto_anterior,
      },
      {
        year: currentYear,
        activoCorriente: balance.activo_corriente_actual,
        activoNoCorriente: balance.activo_no_corriente_actual,
        pasivoCorriente: balance.pasivo_corriente_actual,
        pasivoNoCorriente: balance.pasivo_no_corriente_actual,
        patrimonioNeto: balance.patrimonio_neto_actual,
      },
    ];
  }, [estadosContables, currentYear, previousYear]);

  const incomeData = useMemo(() => {
    const income =
      estadosContables.income_statement_data.resultados_principales;

    // Map data for Income Chart.
    // Ensure we send 2024 as current and 2023 as previous.
    // The component will handle rendering order.
    return [
      {
        metric: "Ventas",
        yearPrevious: income.ingresos_operativos_empresa_anterior,
        yearCurrent: income.ingresos_operativos_empresa_actual,
      },
      {
        metric: "Res. Operativo",
        yearPrevious: income.resultados_antes_de_impuestos_anterior, // Using proxy as per previous step
        yearCurrent: income.resultados_antes_de_impuestos_actual,
      },
      {
        metric: "Res. Neto",
        yearPrevious: income.resultados_del_ejercicio_anterior,
        yearCurrent: income.resultados_del_ejercicio_actual,
      },
    ];
  }, [estadosContables]);

  // Extract details
  const { details_activo, details_pasivo, details_patrimonio_neto } =
    useMemo(() => {
      return {
        details_activo: estadosContables.balance_data.detalles_activo || [],
        details_pasivo: estadosContables.balance_data.detalles_pasivo || [],
        details_patrimonio_neto:
          estadosContables.balance_data.detalles_patrimonio_neto || [],
      };
    }, [estadosContables]);

  const { detalles_estado_resultados } = estadosContables.income_statement_data;
  const companyName =
    estadosContables.company_info.company_name || "la empresa";

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* 1. Header Section (Cleaned up) */}
      <div className="py-2">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Diagnóstico Financiero
        </h2>
        <p className="text-gray-500 text-lg leading-relaxed max-w-4xl">
          Presentamos un análisis detallado de la situación económica y
          patrimonial de{" "}
          <span className="font-semibold text-gray-800">{companyName}</span>,
          contrastando los resultados del ejercicio {currentYear} frente al
          periodo anterior.
        </p>
      </div>

      {/* 2. Main Dashboard Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        {/* Left Column: Charts (Occupies adequate space, e.g., 7 cols) */}
        <div className="xl:col-span-7 flex flex-col gap-6">
          <div>
            <BalanceStructureChart data={balanceData} />
          </div>
          <div>
            <IncomeStatementChart
              currentLabel={currentYear}
              data={incomeData}
              previousLabel={previousYear}
            />
          </div>
        </div>

        {/* Right Column: KPIs Grid (Occupies remaining space, e.g., 5 cols) */}
        <div className="xl:col-span-5">
          <div className="bg-gray-50/50 rounded-xl p-6 border border-gray-100 h-full">
            <h3 className="font-bold text-lg text-gray-800 mb-4 px-1">
              Ratios e Indicadores Clave
            </h3>
            <FinancialKPIsGrid
              currentYear={currentYear}
              kpis={kpis}
              previousYear={previousYear}
            />
          </div>
        </div>
      </div>

      {/* 3. Detailed Data Tables Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 pt-4">
        <div className="lg:col-span-2 space-y-8">
          <section>
            <h3 className="font-bold text-xl text-gray-900 mb-4 px-1">
              Estado de Resultados
            </h3>
            {detalles_estado_resultados && (
              <IncomeStatementTable items={detalles_estado_resultados} />
            )}
          </section>

          <section>
            <h3 className="font-bold text-xl text-gray-900 mb-4 px-1">
              Detalles del activo, pasivo y patrimonio neto
            </h3>
            <Accordion
              className="border border-gray-100 rounded-lg shadow-sm"
              defaultExpandedKeys={["activo"]}
              itemClasses={{
                title: "font-medium text-slay-800",
                trigger: "py-4 px-6",
                content: "px-5 pb-4",
              }}
              variant="light"
            >
              <AccordionItem key="activo" aria-label="Activo" title="Activo">
                <BalanceDetailTable items={details_activo} />
              </AccordionItem>
              <AccordionItem key="pasivo" aria-label="Pasivo" title="Pasivo">
                <BalanceDetailTable items={details_pasivo} />
              </AccordionItem>
              <AccordionItem
                key="patrimonio"
                aria-label="Patrimonio Neto"
                title="Patrimonio Neto"
              >
                <BalanceDetailTable items={details_patrimonio_neto} />
              </AccordionItem>
            </Accordion>
          </section>
        </div>
      </div>
    </div>
  );
}
