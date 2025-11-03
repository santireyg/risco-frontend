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
