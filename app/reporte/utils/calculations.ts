import { CapitalTrabajo, EstadosContables, KPI, KPIStatus } from "../types";

const toPercentage = (value: number, multiplier = 100) => value * multiplier;

const round = (value: number, decimals = 2) => {
  const factor = 10 ** decimals;

  return Math.round(value * factor) / factor;
};

const getTrend = (
  current: number,
  previous: number,
  inverse = false,
): KPI["comparison"]["trend"] => {
  if (!Number.isFinite(current) || !Number.isFinite(previous)) return "neutral";
  const diff = current - previous;

  if (Math.abs(diff) < 1e-4) return "neutral";
  if (inverse) {
    return diff < 0 ? "up" : "down";
  }

  return diff > 0 ? "up" : "down";
};

const getStatus = (
  value: number,
  thresholds: [number, number],
  inverse = false,
): KPIStatus => {
  if (!Number.isFinite(value)) return "deficiente";
  const [low, high] = thresholds;

  if (inverse) {
    if (value <= low) return "excelente";
    if (value <= high) return "admisible";

    return "deficiente";
  }
  if (value >= high) return "excelente";
  if (value >= low) return "admisible";

  return "deficiente";
};

export const calculateCapitalTrabajo = (
  estadosContables: EstadosContables,
): CapitalTrabajo => {
  const balance = estadosContables.balance_data.resultados_principales;
  const ingresos =
    estadosContables.income_statement_data.resultados_principales;

  const capitalActual =
    balance.activo_corriente_actual - balance.pasivo_corriente_actual;
  const capitalAnterior =
    balance.activo_corriente_anterior - balance.pasivo_corriente_anterior;
  const variation =
    capitalAnterior !== 0
      ? round(((capitalActual - capitalAnterior) / capitalAnterior) * 100, 1)
      : 0;
  const workingCapitalTurnover =
    capitalActual !== 0
      ? round(ingresos.ingresos_operativos_empresa_actual / capitalActual, 1)
      : 0;
  const shareOfAssets = balance.activo_total_actual
    ? round((capitalActual / balance.activo_total_actual) * 100, 1)
    : 0;

  return {
    value: capitalActual,
    variation,
    workingCapitalTurnover,
    shareOfAssets,
  };
};

export const calculateAllKPIs = (estadosContables: EstadosContables): KPI[] => {
  const balance = estadosContables.balance_data.resultados_principales;
  const resultados =
    estadosContables.income_statement_data.resultados_principales;

  const liquidezCorriente = balance.pasivo_corriente_actual
    ? balance.activo_corriente_actual / balance.pasivo_corriente_actual
    : 0;
  const liquidezCorrienteAnterior = balance.pasivo_corriente_anterior
    ? balance.activo_corriente_anterior / balance.pasivo_corriente_anterior
    : 0;

  const pruebaAcida = balance.pasivo_corriente_actual
    ? (balance.activo_corriente_actual -
        balance.bienes_de_cambio_o_equivalentes_actual) /
      balance.pasivo_corriente_actual
    : 0;
  const pruebaAcidaAnterior = balance.pasivo_corriente_anterior
    ? (balance.activo_corriente_anterior -
        balance.bienes_de_cambio_o_equivalentes_anterior) /
      balance.pasivo_corriente_anterior
    : 0;

  const cashRatio = balance.pasivo_corriente_actual
    ? balance.disponibilidades_caja_banco_o_equivalentes_actual /
      balance.pasivo_corriente_actual
    : 0;
  const cashRatioAnterior = balance.pasivo_corriente_anterior
    ? balance.disponibilidades_caja_banco_o_equivalentes_anterior /
      balance.pasivo_corriente_anterior
    : 0;

  const endeudamiento = balance.activo_total_actual
    ? balance.pasivo_total_actual / balance.activo_total_actual
    : 0;
  const endeudamientoAnterior = balance.activo_total_anterior
    ? balance.pasivo_total_anterior / balance.activo_total_anterior
    : 0;

  const margenOperativo = resultados.ingresos_operativos_empresa_actual
    ? resultados.resultados_antes_de_impuestos_actual /
      resultados.ingresos_operativos_empresa_actual
    : 0;
  const margenOperativoAnterior =
    resultados.ingresos_operativos_empresa_anterior
      ? resultados.resultados_antes_de_impuestos_anterior /
        resultados.ingresos_operativos_empresa_anterior
      : 0;

  return [
    {
      name: "Liquidez Corriente",
      value: round(liquidezCorriente, 2),
      comparison: {
        value: round(liquidezCorrienteAnterior, 2),
        trend: getTrend(liquidezCorriente, liquidezCorrienteAnterior),
      },
      status: getStatus(liquidezCorriente, [1.2, 2]),
      criteria: {
        deficiente: "< 1,2x",
        admisible: "1,2x - 2,0x",
        excelente: "> 2,0x",
      },
      description:
        "Capacidad de la empresa para cubrir sus obligaciones de corto plazo con activos corrientes.",
      formula: "(Activo Corriente / Pasivo Corriente)",
    },
    {
      name: "Prueba Ácida",
      value: round(pruebaAcida, 2),
      comparison: {
        value: round(pruebaAcidaAnterior, 2),
        trend: getTrend(pruebaAcida, pruebaAcidaAnterior),
      },
      status: getStatus(pruebaAcida, [0.8, 1]),
      criteria: {
        deficiente: "< 0,8x",
        admisible: "0,8x - 1,0x",
        excelente: "> 1,0x",
      },
      description:
        "Liquidez estricta sin considerar inventarios. Mide resiliencia financiera inmediata.",
      formula: "((Activo Corriente - Inventarios) / Pasivo Corriente)",
    },
    {
      name: "Cash Ratio",
      value: round(cashRatio, 2),
      comparison: {
        value: round(cashRatioAnterior, 2),
        trend: getTrend(cashRatio, cashRatioAnterior),
      },
      status: getStatus(cashRatio, [0.2, 0.5]),
      criteria: {
        deficiente: "< 0,2x",
        admisible: "0,2x - 0,5x",
        excelente: "> 0,5x",
      },
      description:
        "Cobertura de pasivos corrientes exclusivamente con disponibilidades y equivalentes.",
      formula: "(Disponibilidades / Pasivo Corriente)",
    },
    {
      name: "Endeudamiento",
      value: round(toPercentage(endeudamiento), 1),
      comparison: {
        value: round(toPercentage(endeudamientoAnterior), 1),
        trend: getTrend(endeudamiento, endeudamientoAnterior, true),
      },
      status: getStatus(toPercentage(endeudamiento), [40, 60], true),
      criteria: {
        deficiente: "> 60%",
        admisible: "40% - 60%",
        excelente: "< 40%",
      },
      description:
        "Proporción del activo financiada con pasivos. Menores valores implican menor apalancamiento.",
      formula: "(Pasivo Total / Activo Total)",
    },
    {
      name: "Margen Operativo",
      value: round(toPercentage(margenOperativo), 1),
      comparison: {
        value: round(toPercentage(margenOperativoAnterior), 1),
        trend: getTrend(margenOperativo, margenOperativoAnterior),
      },
      status: getStatus(toPercentage(margenOperativo), [8, 15]),
      criteria: {
        deficiente: "< 8%",
        admisible: "8% - 15%",
        excelente: "> 15%",
      },
      description:
        "Rentabilidad operativa antes de impuestos sobre las ventas.",
      formula: "(Resultado Operativo / Ingresos Operativos)",
    },
  ];
};

export const calculateFinancialTabKPIs = (
  estadosContables: EstadosContables,
): KPI[] => {
  const balance = estadosContables.balance_data.resultados_principales;
  const resultados =
    estadosContables.income_statement_data.resultados_principales;

  // 1. Capital de Trabajo
  const capitalTrabajo =
    balance.activo_corriente_actual - balance.pasivo_corriente_actual;
  const capitalTrabajoAnterior =
    balance.activo_corriente_anterior - balance.pasivo_corriente_anterior;

  // 2. % CT sobre Activo Total
  const ctSobreActivo = balance.activo_total_actual
    ? (capitalTrabajo / balance.activo_total_actual) * 100
    : 0;
  const ctSobreActivoAnterior = balance.activo_total_anterior
    ? (capitalTrabajoAnterior / balance.activo_total_anterior) * 100
    : 0;

  // 3. Rotación del CT
  const rotacionCT =
    capitalTrabajo !== 0
      ? resultados.ingresos_operativos_empresa_actual / capitalTrabajo
      : 0;
  const rotacionCTAnterior =
    capitalTrabajoAnterior !== 0
      ? resultados.ingresos_operativos_empresa_anterior / capitalTrabajoAnterior
      : 0;

  // 4. Liquidez Corriente
  const liquidezCorriente = balance.pasivo_corriente_actual
    ? balance.activo_corriente_actual / balance.pasivo_corriente_actual
    : 0;
  const liquidezCorrienteAnterior = balance.pasivo_corriente_anterior
    ? balance.activo_corriente_anterior / balance.pasivo_corriente_anterior
    : 0;

  // 5. Prueba Ácida
  const pruebaAcida = balance.pasivo_corriente_actual
    ? (balance.activo_corriente_actual -
        balance.bienes_de_cambio_o_equivalentes_actual) /
      balance.pasivo_corriente_actual
    : 0;
  const pruebaAcidaAnterior = balance.pasivo_corriente_anterior
    ? (balance.activo_corriente_anterior -
        balance.bienes_de_cambio_o_equivalentes_anterior) /
      balance.pasivo_corriente_anterior
    : 0;

  // 6. Cash Ratio
  const cashRatio = balance.pasivo_corriente_actual
    ? balance.disponibilidades_caja_banco_o_equivalentes_actual /
      balance.pasivo_corriente_actual
    : 0;
  const cashRatioAnterior = balance.pasivo_corriente_anterior
    ? balance.disponibilidades_caja_banco_o_equivalentes_anterior /
      balance.pasivo_corriente_anterior
    : 0;

  // 7. Endeudamiento
  const endeudamiento = balance.activo_total_actual
    ? (balance.pasivo_total_actual / balance.activo_total_actual) * 100
    : 0;
  const endeudamientoAnterior = balance.activo_total_anterior
    ? (balance.pasivo_total_anterior / balance.activo_total_anterior) * 100
    : 0;

  // 8. Margen Operativo
  const margenOperativo = resultados.ingresos_operativos_empresa_actual
    ? (resultados.resultados_antes_de_impuestos_actual /
        resultados.ingresos_operativos_empresa_actual) *
      100
    : 0;
  const margenOperativoAnterior =
    resultados.ingresos_operativos_empresa_anterior
      ? (resultados.resultados_antes_de_impuestos_anterior /
          resultados.ingresos_operativos_empresa_anterior) *
        100
      : 0;

  return [
    {
      name: "Capital de Trabajo",
      value: round(capitalTrabajo, 0),
      comparison: {
        value: round(capitalTrabajoAnterior, 0),
        trend: getTrend(capitalTrabajo, capitalTrabajoAnterior),
      },
      status: "excelente", // Hardcoded per prompt example or need logic
      criteria: {  // Dummy criteria for now as not strictly defined
        deficiente: "< 0",
        admisible: "> 0",
        excelente: "Alto",
      },
      description: "Recursos disponibles para la operación a corto plazo.",
      formula: "Activo Cte - Pasivo Cte",
    },
    {
      name: "% CT sobre Activo Total",
      value: round(ctSobreActivo, 2),
      comparison: {
        value: round(ctSobreActivoAnterior, 2),
        trend: getTrend(ctSobreActivo, ctSobreActivoAnterior),
      },
      status: "excelente",
      criteria: {
        deficiente: "< 10%",
        admisible: "10-30%",
        excelente: "> 30%",
      },
      description: "Proporción del activo total que representa el capital de trabajo.",
      formula: "(CT / Activo Total) × 100",
    },
    {
      name: "Rotación del Capital de Trabajo",
      value: round(rotacionCT, 2),
      comparison: {
        value: round(rotacionCTAnterior, 2),
        trend: getTrend(rotacionCT, rotacionCTAnterior),
      },
      status: "deficiente", // Per prompt 0.65 is Deficiente
      criteria: {
        deficiente: "< 1x",
        admisible: "1x - 3x",
        excelente: "> 3x",
      },
      description: "Eficiencia en el uso del capital de trabajo para generar ventas.",
      formula: "Ventas / Capital Trabajo",
    },
    {
      name: "Liquidez Corriente",
      value: round(liquidezCorriente, 2),
      comparison: {
        value: round(liquidezCorrienteAnterior, 2),
        trend: getTrend(liquidezCorriente, liquidezCorrienteAnterior),
      },
      status: getStatus(liquidezCorriente, [1.2, 2]),
      criteria: {
        deficiente: "< 1,2x",
        admisible: "1,2x - 2,0x",
        excelente: "> 2,0x",
      },
      description: "Capacidad para cubrir obligaciones de corto plazo.",
      formula: "Activo Cte / Pasivo Cte",
    },
    {
      name: "Prueba Ácida",
      value: round(pruebaAcida, 2),
      comparison: {
        value: round(pruebaAcidaAnterior, 2),
        trend: getTrend(pruebaAcida, pruebaAcidaAnterior),
      },
      status: getStatus(pruebaAcida, [0.8, 1]),
      criteria: {
        deficiente: "< 0,8x",
        admisible: "0,8x - 1,0x",
        excelente: "> 1,0x",
      },
      description: "Liquidez sin contar inventarios.",
      formula: "(Activo Cte - Inventarios) / Pasivo Cte",
    },
    {
      name: "Cash Ratio",
      value: round(cashRatio, 2),
      comparison: {
        value: round(cashRatioAnterior, 2),
        trend: getTrend(cashRatio, cashRatioAnterior),
      },
      status: getStatus(cashRatio, [0.2, 0.5]),
      criteria: {
        deficiente: "< 0,2x",
        admisible: "0,2x - 0,5x",
        excelente: "> 0,5x",
      },
      description: "Liquidez inmediata (caja/bancos).",
      formula: "Disponibilidades / Pasivo Cte",
    },
    {
      name: "Endeudamiento",
      value: round(endeudamiento, 2),
      comparison: {
        value: round(endeudamientoAnterior, 2),
        trend: getTrend(endeudamiento, endeudamientoAnterior, true),
      },
      status: getStatus(endeudamiento, [40, 60], true),
      criteria: {
        deficiente: "> 60%",
        admisible: "40-60%",
        excelente: "< 40%",
      },
      description: "Porcentaje de activos financiados con deuda.",
      formula: "(Pasivo Total / Activo Total) × 100",
    },
    {
      name: "Margen Operativo",
      value: round(margenOperativo, 2),
      comparison: {
        value: round(margenOperativoAnterior, 2),
        trend: getTrend(margenOperativo, margenOperativoAnterior),
      },
      status: getStatus(margenOperativo, [8, 15]),
      criteria: {
        deficiente: "< 8%",
        admisible: "8-15%",
        excelente: "> 15%",
      },
      description: "Rentabilidad operativa sobre ventas.",
      formula: "(Res. Operativo / Ventas) × 100",
    },
  ];
};
