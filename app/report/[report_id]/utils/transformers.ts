/**
 * Utilidades para transformar datos de la API (formato V2) al formato esperado por los componentes legacy.
 * Extrae la lógica de transformación del page.tsx original para mejor mantenibilidad.
 */

import type { ReporteDataV2 } from "@/app/report/[report_id]/types";

/**
 * Encuentra un item de balance por su código en un array de items V2.
 * @param items Array de items de balance con concepto_code
 * @param code Código del concepto a buscar (ej: "activo_corriente")
 * @returns Objeto con valores actual y anterior (0 si no se encuentra)
 */
export const findBalanceItem = (items: any[], code: string) => {
  const item = items.find((item) => item.concepto_code === code);

  return {
    actual: item?.monto_actual || 0,
    anterior: item?.monto_anterior || 0,
  };
};

/**
 * Mapea items de detalle del formato V2 (monto_actual/anterior) al formato legacy (monto_periodo_actual/anterior).
 * @param items Array de items con estructura V2
 * @returns Array de items con estructura legacy o undefined si no hay items
 */
export const mapDetailItems = (items?: any[]) => {
  if (!items) return undefined;

  return items.map((item) => ({
    concepto: item.concepto,
    monto_periodo_actual: item.monto_actual,
    monto_periodo_anterior: item.monto_anterior,
  }));
};

/**
 * Extrae y transforma los resultados principales del balance del formato V2 array-based
 * al formato legacy flat object esperado por SituacionFinancieraTab.
 *
 * @param balanceItems Array de items con concepto_code del statement_data.balance_data.resultados_principales
 * @returns Objeto plano con todos los campos de balance principales
 */
export const extractBalancePrincipales = (balanceItems: any[]) => {
  const disponibilidades = findBalanceItem(balanceItems, "disponibilidades");
  const bienesCambio = findBalanceItem(balanceItems, "bienes_de_cambio");
  const activoCorriente = findBalanceItem(balanceItems, "activo_corriente");
  const activoNoCorriente = findBalanceItem(
    balanceItems,
    "activo_no_corriente",
  );
  const activoTotal = findBalanceItem(balanceItems, "activo_total");
  const pasivoCorriente = findBalanceItem(balanceItems, "pasivo_corriente");
  const pasivoNoCorriente = findBalanceItem(
    balanceItems,
    "pasivo_no_corriente",
  );
  const pasivoTotal = findBalanceItem(balanceItems, "pasivo_total");
  const patrimonioNeto = findBalanceItem(balanceItems, "patrimonio_neto");

  return {
    disponibilidades_caja_banco_o_equivalentes_actual: disponibilidades.actual,
    disponibilidades_caja_banco_o_equivalentes_anterior:
      disponibilidades.anterior,
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
};

/**
 * Extrae y transforma los resultados principales del estado de resultados del formato V2
 * al formato legacy flat object.
 *
 * @param incomeItems Array de items con concepto_code del statement_data.income_statement_data.resultados_principales
 * @returns Objeto plano con campos de estado de resultados principales
 */
export const extractIncomePrincipales = (incomeItems: any[]) => {
  const ingresosVenta = findBalanceItem(incomeItems, "ingresos_por_venta");
  const resultadosAntesImpuestos = findBalanceItem(
    incomeItems,
    "resultados_antes_de_impuestos",
  );
  const resultadosEjercicio = findBalanceItem(
    incomeItems,
    "resultados_del_ejercicio",
  );

  return {
    ingresos_operativos_empresa_actual: ingresosVenta.actual,
    ingresos_operativos_empresa_anterior: ingresosVenta.anterior,
    resultados_antes_de_impuestos_actual: resultadosAntesImpuestos.actual,
    resultados_antes_de_impuestos_anterior: resultadosAntesImpuestos.anterior,
    resultados_del_ejercicio_actual: resultadosEjercicio.actual,
    resultados_del_ejercicio_anterior: resultadosEjercicio.anterior,
  };
};

/**
 * Construye el objeto de deudas historia en el formato esperado por EstadoDeudorBCRATab,
 * combinando el último período con el historial completo.
 *
 * @param bcraData Datos BCRA del reporte
 * @returns Objeto con status 200 y structure de results con periodos combinados
 */
export const reshapeDeudasHistoria = (bcraData: any) => {
  // Filtrar periodos nulos para evitar errores en producción
  const periodos = [
    bcraData.deudas_ultimo_periodo,
    ...(bcraData.deudas_historia || []),
  ].filter(Boolean);

  return {
    status: 200,
    results: {
      identificacion: parseInt(bcraData.identificacion) || 0,
      denominacion: bcraData.denominacion || "",
      periodos,
    },
  };
};

/**
 * Construye el objeto de deudas del último período en el formato esperado.
 *
 * @param bcraData Datos BCRA del reporte
 * @returns Objeto con status 200 y solo el último período
 */
export const reshapeDeudasUltimoPeriodo = (bcraData: any) => {
  // Filtrar periodos nulos para evitar errores en producción
  const periodos = bcraData.deudas_ultimo_periodo
    ? [bcraData.deudas_ultimo_periodo]
    : [];

  return {
    status: 200,
    results: {
      identificacion: parseInt(bcraData.identificacion) || 0,
      denominacion: bcraData.denominacion || "",
      periodos,
    },
  };
};

/**
 * Construye el objeto de cheques rechazados en el formato esperado.
 *
 * @param bcraData Datos BCRA del reporte
 * @returns Objeto con status 200 y estructura de causales
 */
export const reshapeChequesRechazados = (bcraData: any) => {
  return {
    status: 200,
    results: {
      identificacion: parseInt(bcraData.identificacion) || 0,
      denominacion: bcraData.denominacion || "",
      causales: bcraData.cheques_rechazados || [],
    },
  };
};

/**
 * Formatea un CUIT al formato estándar XX-XXXXXXXX-X.
 *
 * @param cuit CUIT sin formato o null/undefined
 * @returns CUIT formateado o null si no es válido
 */
export const formatCuit = (cuit?: string | null) => {
  if (!cuit) return null;
  const digits = cuit.replace(/\D/g, "");

  if (digits.length !== 11) return cuit;

  return `${digits.slice(0, 2)}-${digits.slice(2, 10)}-${digits.slice(10)}`;
};

/**
 * Verifica si los datos de BCRA están disponibles.
 * Se considera que faltan datos si denominacion es null o los arrays críticos están vacíos.
 *
 * @param bcraData Datos BCRA del reporte
 * @returns true si los datos de BCRA están ausentes o vacíos
 */
export const isBCRADataMissing = (bcraData: any): boolean => {
  if (!bcraData) return true;

  const isDenominacionMissing =
    !bcraData.denominacion || bcraData.denominacion === null;
  const isDeudasEmpty =
    (!bcraData.deudas_ultimo_periodo ||
      Object.keys(bcraData.deudas_ultimo_periodo).length === 0) &&
    (!bcraData.deudas_historia || bcraData.deudas_historia.length === 0);
  const isChequesEmpty =
    !bcraData.cheques_rechazados || bcraData.cheques_rechazados.length === 0;

  return isDenominacionMissing || (isDeudasEmpty && isChequesEmpty);
};

/**
 * Transforma todo el reporte desde el formato API V2 al formato esperado por los componentes.
 * Esta es la función principal que orquesta todas las transformaciones.
 *
 * @param reporteData Datos del reporte desde la API
 * @returns Objeto con todas las estructuras de datos transformadas
 */
export const transformReportData = (reporteData: ReporteDataV2) => {
  const balanceItems =
    reporteData.statement_data?.balance_data?.resultados_principales || [];
  const incomeItems =
    reporteData.statement_data?.income_statement_data?.resultados_principales ||
    [];

  return {
    // Datos BCRA reshapeados
    deudasHistoria: reporteData.bcra_data
      ? reshapeDeudasHistoria(reporteData.bcra_data)
      : {
          status: 200,
          results: { identificacion: 0, denominacion: "", periodos: [] },
        },
    deudasUltimoPeriodo: reporteData.bcra_data
      ? reshapeDeudasUltimoPeriodo(reporteData.bcra_data)
      : {
          status: 200,
          results: { identificacion: 0, denominacion: "", periodos: [] },
        },
    chequesRechazados: reporteData.bcra_data
      ? reshapeChequesRechazados(reporteData.bcra_data)
      : {
          status: 200,
          results: { identificacion: 0, denominacion: "", causales: [] },
        },

    // Estados contables transformados para SituacionFinancieraTab
    estadosContables: {
      balance_date: reporteData.statement_data?.statement_date || null,
      balance_date_previous:
        reporteData.statement_data?.statement_date_previous || null,
      company_info: reporteData.company_info || {},
      balance_data: {
        resultados_principales: extractBalancePrincipales(balanceItems),
        detalles_activo: mapDetailItems(
          reporteData.statement_data?.balance_data?.detalles_activo,
        ),
        detalles_pasivo: mapDetailItems(
          reporteData.statement_data?.balance_data?.detalles_pasivo,
        ),
        detalles_patrimonio_neto: mapDetailItems(
          reporteData.statement_data?.balance_data?.detalles_patrimonio_neto,
        ),
      },
      income_statement_data: {
        resultados_principales: extractIncomePrincipales(incomeItems),
        detalles_estado_resultados: mapDetailItems(
          reporteData.statement_data?.income_statement_data
            ?.detalles_estado_resultados,
        ),
      },
    },

    // CUIT formateado
    formattedCuit: formatCuit(reporteData.company_info?.company_cuit),
  };
};
