import { useMemo } from "react";

import AnalisisRiesgoIA from "../tabs-components/resumen-ejecutivo/AnalisisRiesgoIA";
import KeyInsights from "../tabs-components/resumen-ejecutivo/KeyInsights";
import CapitalTrabajo from "../tabs-components/resumen-ejecutivo/CapitalTrabajo";
import KPIsFinancieros from "../tabs-components/resumen-ejecutivo/KPIsFinancieros";
import EstadoDeudor from "../tabs-components/resumen-ejecutivo/EstadoDeudor";
import ChequesRechazados from "../tabs-components/resumen-ejecutivo/ChequesRechazados";
import { ReporteDataV2, DebtHistory, ChequesRechazados as ChequesRechazadosType } from "../../types";
import { transformIndicatorsToKPIs } from "../../utils/calculations";
import { formatDate, extractYear, extractDateString } from "../../utils/formatting";

interface ResumenEjecutivoProps {
  reporteData: ReporteDataV2;
  deudasHistoria: DebtHistory;
  chequesRechazados: ChequesRechazadosType;
  isBCRADataMissing?: boolean;
}

export default function ResumenEjecutivo({
  reporteData,
  deudasHistoria,
  chequesRechazados,
  isBCRADataMissing = false,
}: ResumenEjecutivoProps) {
  // Extract years from dates
  const currentYear = useMemo(() => {
    return extractYear(reporteData.statement_data.statement_date, "2024");
  }, [reporteData]);

  const previousYear = useMemo(() => {
    return extractYear(reporteData.statement_data.statement_date_previous, "2023");
  }, [reporteData]);

  // Transform indicators to KPIs
  const kpis = useMemo(() => {
    const allKPIs = transformIndicatorsToKPIs(reporteData.indicators);

    // Filter out Capital de Trabajo and % CT sobre Activo Total as they're shown in the Capital Trabajo section
    return allKPIs.filter((kpi) => kpi.name !== "Capital de Trabajo" && kpi.name !== "% CT sobre Activo Total");
  }, [reporteData.indicators]);

  // Find Capital de Trabajo indicators
  const capitalTrabajoIndicator = reporteData.indicators.find((i) => i.code === "capital_trabajo");
  const ctSobreActivoIndicator = reporteData.indicators.find((i) => i.code === "ct_sobre_activo");
  const rotacionCTIndicator = reporteData.indicators.find((i) => i.code === "rotacion_ct");

  // Calculate percentage variation for Capital de Trabajo
  const calculateVariation = (current: number, previous: number): number => {
    if (previous === 0) return 0;

    return ((current - previous) / Math.abs(previous)) * 100;
  };

  const capitalTrabajoData = {
    value: capitalTrabajoIndicator?.value_current || 0,
    variation: capitalTrabajoIndicator
      ? calculateVariation(capitalTrabajoIndicator.value_current, capitalTrabajoIndicator.value_previous) / 100 // Divide by 100 because formatPercentage expects a decimal (0.25 for 25%)
      : 0,
    workingCapitalTurnover: rotacionCTIndicator?.value_current || 0,
    shareOfAssets: ctSobreActivoIndicator?.value_current || 0,
  };

  const reportDate = formatDate(reporteData.bcra_data.fecha_consulta);
  const statementDateString = extractDateString(reporteData.statement_data.statement_date);
  const statementDate = statementDateString ? formatDate(statementDateString) : "-";

  // Check if there's actual data for Estado Deudor (at least one period with entities)
  const hasEstadoDeudorData =
    !isBCRADataMissing &&
    deudasHistoria.results.periodos.length > 0 &&
    deudasHistoria.results.periodos.some((periodo) => periodo.entidades && periodo.entidades.length > 0);

  // Check if there's actual data for Cheques (at least one causal with entities)
  const hasChequesData =
    !isBCRADataMissing &&
    chequesRechazados.results.causales &&
    chequesRechazados.results.causales.length > 0 &&
    chequesRechazados.results.causales.some((causal) => causal.entidades && causal.entidades.length > 0);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
      {/* Columna Izquierda - 60% */}
      <div className="lg:col-span-7 space-y-6">
        <AnalisisRiesgoIA
          executiveSummary={reporteData.ai_report.executive_summary}
          reasonedAnalysis={reporteData.ai_report.reasoned_analysis}
          reportDate={reportDate}
          statementDate={statementDate}
        />
        <KeyInsights insights={reporteData.ai_report.key_insights} />
      </div>

      {/* Columna Derecha - 40% */}
      <div className="lg:col-span-5 space-y-6">
        <CapitalTrabajo
          currentYear={currentYear}
          data={capitalTrabajoData}
          indicators={reporteData.indicators}
          previousYear={previousYear}
        />
        <KPIsFinancieros currentYear={currentYear} kpis={kpis} previousYear={previousYear} />
        {hasEstadoDeudorData ? (
          <EstadoDeudor data={deudasHistoria} />
        ) : (
          <div className="rounded-lg border border-warning bg-warning/5 p-4">
            <p className="text-sm text-slate-600">No se encontró información de Estado Deudor en el BCRA para este CUIT.</p>
          </div>
        )}
        {hasChequesData ? (
          <ChequesRechazados data={chequesRechazados} />
        ) : (
          <div className="rounded-lg border border-warning bg-warning/5 p-4">
            <p className="text-sm text-slate-600">No se encontró información de Cheques Rechazados en el BCRA para este CUIT.</p>
          </div>
        )}
      </div>
    </div>
  );
}
