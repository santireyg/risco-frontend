import AnalisisRiesgoIA from "../tabs-components/resumen-ejecutivo/AnalisisRiesgoIA";
import KeyInsights from "../tabs-components/resumen-ejecutivo/KeyInsights";
import CapitalTrabajo from "../tabs-components/resumen-ejecutivo/CapitalTrabajo";
import KPIsFinancieros from "../tabs-components/resumen-ejecutivo/KPIsFinancieros";
import EstadoDeudor from "../tabs-components/resumen-ejecutivo/EstadoDeudor";
import ChequesRechazados from "../tabs-components/resumen-ejecutivo/ChequesRechazados";
import { ReporteDataV2, DebtHistory, ChequesRechazados as ChequesRechazadosType } from "../../types";
import { calculateCapitalTrabajo, calculateAllKPIs } from "../../utils/calculations";
import { formatDate } from "../../utils/formatting";

interface ResumenEjecutivoProps {
  reporteData: ReporteDataV2;
  deudasHistoria: DebtHistory;
  chequesRechazados: ChequesRechazadosType;
}

export default function ResumenEjecutivo({ reporteData, deudasHistoria, chequesRechazados }: ResumenEjecutivoProps) {
  // Convert ReporteDataV2 structure to EstadosContables structure for calculations
  const estadosContables = {
    balance_date: reporteData.statement_data.statement_date,
    balance_date_previous: reporteData.statement_data.statement_date_previous,
    company_info: reporteData.company_info,
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
      detalles_estado_resultados: reporteData.statement_data.income_statement_data.detalles_estado_resultados?.map((item) => ({
        concepto: item.concepto,
        monto_periodo_actual: item.monto_actual,
        monto_periodo_anterior: item.monto_anterior,
      })),
    },
    balance_data: {
      resultados_principales: {
        disponibilidades_caja_banco_o_equivalentes_actual:
          reporteData.statement_data.balance_data.resultados_principales.find((item) => item.concepto_code === "disponibilidades")
            ?.monto_actual || 0,
        disponibilidades_caja_banco_o_equivalentes_anterior:
          reporteData.statement_data.balance_data.resultados_principales.find((item) => item.concepto_code === "disponibilidades")
            ?.monto_anterior || 0,
        bienes_de_cambio_o_equivalentes_actual:
          reporteData.statement_data.balance_data.resultados_principales.find((item) => item.concepto_code === "bienes_de_cambio")
            ?.monto_actual || 0,
        bienes_de_cambio_o_equivalentes_anterior:
          reporteData.statement_data.balance_data.resultados_principales.find((item) => item.concepto_code === "bienes_de_cambio")
            ?.monto_anterior || 0,
        activo_corriente_actual:
          reporteData.statement_data.balance_data.resultados_principales.find((item) => item.concepto_code === "activo_corriente")
            ?.monto_actual || 0,
        activo_corriente_anterior:
          reporteData.statement_data.balance_data.resultados_principales.find((item) => item.concepto_code === "activo_corriente")
            ?.monto_anterior || 0,
        activo_no_corriente_actual:
          reporteData.statement_data.balance_data.resultados_principales.find(
            (item) => item.concepto_code === "activo_no_corriente"
          )?.monto_actual || 0,
        activo_no_corriente_anterior:
          reporteData.statement_data.balance_data.resultados_principales.find(
            (item) => item.concepto_code === "activo_no_corriente"
          )?.monto_anterior || 0,
        activo_total_actual:
          reporteData.statement_data.balance_data.resultados_principales.find((item) => item.concepto_code === "activo_total")
            ?.monto_actual || 0,
        activo_total_anterior:
          reporteData.statement_data.balance_data.resultados_principales.find((item) => item.concepto_code === "activo_total")
            ?.monto_anterior || 0,
        pasivo_corriente_actual:
          reporteData.statement_data.balance_data.resultados_principales.find((item) => item.concepto_code === "pasivo_corriente")
            ?.monto_actual || 0,
        pasivo_corriente_anterior:
          reporteData.statement_data.balance_data.resultados_principales.find((item) => item.concepto_code === "pasivo_corriente")
            ?.monto_anterior || 0,
        pasivo_no_corriente_actual:
          reporteData.statement_data.balance_data.resultados_principales.find(
            (item) => item.concepto_code === "pasivo_no_corriente"
          )?.monto_actual || 0,
        pasivo_no_corriente_anterior:
          reporteData.statement_data.balance_data.resultados_principales.find(
            (item) => item.concepto_code === "pasivo_no_corriente"
          )?.monto_anterior || 0,
        pasivo_total_actual:
          reporteData.statement_data.balance_data.resultados_principales.find((item) => item.concepto_code === "pasivo_total")
            ?.monto_actual || 0,
        pasivo_total_anterior:
          reporteData.statement_data.balance_data.resultados_principales.find((item) => item.concepto_code === "pasivo_total")
            ?.monto_anterior || 0,
        patrimonio_neto_actual:
          reporteData.statement_data.balance_data.resultados_principales.find((item) => item.concepto_code === "patrimonio_neto")
            ?.monto_actual || 0,
        patrimonio_neto_anterior:
          reporteData.statement_data.balance_data.resultados_principales.find((item) => item.concepto_code === "patrimonio_neto")
            ?.monto_anterior || 0,
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
  };

  const capitalTrabajo = calculateCapitalTrabajo(estadosContables);
  const kpis = calculateAllKPIs(estadosContables);

  const reportDate = formatDate(reporteData.bcra_data.fecha_consulta);
  const statementDate = formatDate(reporteData.statement_data.statement_date.$date);

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
        <CapitalTrabajo data={capitalTrabajo} />
        <KPIsFinancieros kpis={kpis} />
        <EstadoDeudor data={deudasHistoria} />
        <ChequesRechazados data={chequesRechazados} />
      </div>
    </div>
  );
}
