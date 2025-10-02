// ruta: app/document/[docfile_id]/components/types.ts

export interface DocumentSheet {
  _id: string;
  name: string;
  number: number;
  image_path: string;
  recognized_info: {
    is_balance_sheet: boolean;
    is_income_statement_sheet: boolean;
    is_appendix: boolean;
    original_orientation_degrees: number;
  };
  rotation_degrees: number;
}

// Interfaces for financial data structures matching backend models

export interface BalanceItem {
  concepto_code: string;
  concepto?: string;
  monto_actual: number;
  monto_anterior: number;
}

export interface IncomeStatementItem {
  concepto_code: string;
  concepto?: string;
  monto_actual: number;
  monto_anterior: number;
}

export interface SheetItem {
  concepto: string;
  monto_actual: number;
  monto_anterior: number;
}

export interface DocumentGeneralInformation {
  empresa: string;
  periodo_actual: string;
  periodo_anterior?: string;
}

export interface BalanceData {
  informacion_general: DocumentGeneralInformation;
  resultados_principales: BalanceItem[];
  detalles_activo: SheetItem[];
  detalles_pasivo: SheetItem[];
  detalles_patrimonio_neto: SheetItem[];
}

export interface IncomeStatementData {
  informacion_general: DocumentGeneralInformation;
  resultados_principales: IncomeStatementItem[];
  detalles_estado_resultados: SheetItem[];
}
