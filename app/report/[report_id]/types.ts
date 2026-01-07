export interface MongoId {
  $oid: string;
}

export interface MongoDate {
  $date: string;
}

export interface CompanyInfo {
  company_cuit: string;
  company_name: string;
  company_activity: string | null;
  company_address: string;
}

export interface IncomeStatementMainResults {
  ingresos_operativos_empresa_actual: number;
  ingresos_operativos_empresa_anterior: number;
  resultados_antes_de_impuestos_actual: number;
  resultados_antes_de_impuestos_anterior: number;
  resultados_del_ejercicio_actual: number;
  resultados_del_ejercicio_anterior: number;
}

export interface BalanceMainResults {
  disponibilidades_caja_banco_o_equivalentes_actual: number;
  disponibilidades_caja_banco_o_equivalentes_anterior: number;
  bienes_de_cambio_o_equivalentes_actual: number;
  bienes_de_cambio_o_equivalentes_anterior: number;
  activo_corriente_actual: number;
  activo_corriente_anterior: number;
  activo_no_corriente_actual: number;
  activo_no_corriente_anterior: number;
  activo_total_actual: number;
  activo_total_anterior: number;
  pasivo_corriente_actual: number;
  pasivo_corriente_anterior: number;
  pasivo_no_corriente_actual: number;
  pasivo_no_corriente_anterior: number;
  pasivo_total_actual: number;
  pasivo_total_anterior: number;
  patrimonio_neto_actual: number;
  patrimonio_neto_anterior: number;
}

export interface FinancialDetailItem {
  concepto: string;
  monto_periodo_actual: number;
  monto_periodo_anterior: number;
}

export interface EstadosContables {
  _id?: MongoId;
  balance_date: MongoDate;
  balance_date_previous: MongoDate;
  income_statement_data: {
    resultados_principales: IncomeStatementMainResults;
    detalles_estado_resultados?: FinancialDetailItem[];
  };
  balance_data: {
    resultados_principales: BalanceMainResults;
    detalles_activo?: FinancialDetailItem[];
    detalles_pasivo?: FinancialDetailItem[];
    detalles_patrimonio_neto?: FinancialDetailItem[];
  };
  company_info: CompanyInfo;
}

export type KPITrend = "up" | "down" | "neutral";

export interface KPICriteria {
  deficiente: string;
  admisible: string;
  excelente: string;
}

export type KPIStatus = "excelente" | "admisible" | "deficiente";

export interface KPIComparison {
  value: number;
  trend: KPITrend;
}

export interface KPI {
  name: string;
  value: number;
  comparison: KPIComparison;
  status: KPIStatus;
  criteria: KPICriteria;
  description: string;
  formula: string;
}

export interface KeyInsight {
  type: "critico" | "alerta" | "positivo";
  title: string;
  description: string;
}

export interface CapitalTrabajo {
  value: number;
  variation: number;
  workingCapitalTurnover: number;
  shareOfAssets: number;
}

export interface DebtEntity {
  entidad: string;
  situacion: number;
  monto: number;
  enRevision: boolean;
  procesoJud: boolean;
  fechaSit1?: string | null;
  diasAtrasoPago?: number | null;
  refinanciaciones?: boolean;
  recategorizacionOblig?: boolean;
  situacionJuridica?: boolean;
  irrecDisposicionTecnica?: boolean;
}

export interface DebtPeriod {
  periodo: string;
  entidades: DebtEntity[];
}

export interface DebtHistoryResults {
  identificacion: number;
  denominacion: string;
  periodos: DebtPeriod[];
}

export interface DebtHistory {
  status: number;
  results: DebtHistoryResults;
}

export interface ChequeDetalle {
  nroCheque: number;
  fechaRechazo: string;
  monto: number;
  fechaPago: string | null;
  fechaPagoMulta: string | null;
  estadoMulta: string | null;
  ctaPersonal: boolean;
  denomJuridica: string | null;
  enRevision: boolean;
  procesoJud: boolean;
}

export interface ChequeEntidadDetalle {
  entidad: number | string;
  detalle: ChequeDetalle[];
}

export interface ChequeCausal {
  causal: string;
  entidades: ChequeEntidadDetalle[];
}

export interface ChequesRechazadosResults {
  identificacion: number;
  denominacion: string;
  causales: ChequeCausal[];
}

export interface ChequesRechazados {
  status: number;
  results: ChequesRechazadosResults;
}

// New types for mock_data_v2.json structure

export interface AIKeyInsights {
  strengths: string[];
  watchouts: string[];
  red_flags: string[];
}

export interface AIReport {
  reasoned_analysis: string;
  executive_summary: string;
  key_insights: AIKeyInsights;
}

export interface BalanceDataV2Item {
  concepto_code?: string;
  concepto: string;
  monto_actual: number;
  monto_anterior: number;
}

export interface IncomeStatementDataV2Item {
  concepto_code?: string;
  concepto: string;
  monto_actual: number;
  monto_anterior: number;
}

export interface StatementDataV2 {
  statement_date: string;
  statement_date_previous: string;
  balance_data: {
    resultados_principales: BalanceDataV2Item[];
    detalles_activo?: BalanceDataV2Item[];
    detalles_pasivo?: BalanceDataV2Item[];
    detalles_patrimonio_neto?: BalanceDataV2Item[];
  };
  income_statement_data: {
    resultados_principales: IncomeStatementDataV2Item[];
    detalles_estado_resultados?: IncomeStatementDataV2Item[];
  };
}

export interface BCRADebtEntityV2 {
  entidad: string;
  situacion: number;
  fechaSit1?: string | null;
  monto: number;
  diasAtrasoPago?: number | null;
  refinanciaciones?: boolean;
  recategorizacionOblig?: boolean;
  situacionJuridica?: boolean;
  irrecDisposicionTecnica?: boolean;
  enRevision: boolean;
  procesoJud: boolean;
}

export interface BCRADebtPeriodV2 {
  periodo: string;
  entidades: BCRADebtEntityV2[];
}

export interface BCRAChequeDetalleV2 {
  nroCheque: number;
  fechaRechazo: string;
  monto: number;
  fechaPago: string | null;
  fechaPagoMulta: string | null;
  estadoMulta: string | null;
  ctaPersonal: boolean;
  denomJuridica: string | null;
  enRevision: boolean;
  procesoJud: boolean;
}

export interface BCRAChequeEntidadV2 {
  entidad: number | string;
  detalle: BCRAChequeDetalleV2[];
}

export interface BCRAChequeCausalV2 {
  causal: string;
  entidades: BCRAChequeEntidadV2[];
}

export interface BCRADataV2 {
  identificacion: string;
  denominacion: string;
  fecha_consulta: string;
  deudas_ultimo_periodo: {
    periodo: string;
    entidades: BCRADebtEntityV2[];
  };
  deudas_historia: BCRADebtPeriodV2[];
  cheques_rechazados: BCRAChequeCausalV2[];
}

export interface IndicatorV2 {
  code: string;
  name: string;
  description: string;
  formula: string;
  criteria: {
    deficiente: string;
    admisible: string;
    excelente: string;
  };
  value_current: number;
  value_previous: number;
  variation: number;
  classification_current: string;
  classification_previous: string;
}

export interface ReporteDataV2 {
  _id: MongoId;
  tenant_id: string;
  docfile_id: string;
  status: string;
  company_name: string;
  company_cuit: string;
  company_info: CompanyInfo;
  created_at: string;
  created_by: {
    user_id: string;
    name: string;
    tenant_id: string;
  };
  statement_data: StatementDataV2;
  indicators: IndicatorV2[];
  bcra_data: BCRADataV2;
  ai_report: AIReport;
  error_message: string | null;
}
