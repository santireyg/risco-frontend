export interface MongoId {
  $oid: string;
}

export interface MongoDate {
  $date: string;
}

export interface CompanyInfo {
  company_cuit: string;
  company_name: string;
  company_activity: string;
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

export interface EstadosContables {
  _id?: MongoId;
  balance_date: MongoDate;
  balance_date_previous: MongoDate;
  income_statement_data: {
    resultados_principales: IncomeStatementMainResults;
  };
  balance_data: {
    resultados_principales: BalanceMainResults;
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
