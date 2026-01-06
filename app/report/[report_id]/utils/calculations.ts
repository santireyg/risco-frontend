import { KPI, KPIStatus, IndicatorV2 } from "../types";

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

/**
 * Transform indicators from API/JSON format to KPI format for display
 */
export const transformIndicatorsToKPIs = (indicators: IndicatorV2[]): KPI[] => {
  const classificationToStatus = (classification: string): KPIStatus => {
    const lower = classification.toLowerCase();

    if (lower === "excelente") return "excelente";
    if (lower === "admisible") return "admisible";

    return "deficiente";
  };

  return indicators.map((indicator) => ({
    name: indicator.name,
    value: indicator.value_current,
    comparison: {
      value: indicator.value_previous,
      trend: getTrend(
        indicator.value_current,
        indicator.value_previous,
        // Inverse trend for debt ratios (lower is better)
        indicator.code === "endeudamiento" || indicator.code === "rotacion_ct",
      ),
    },
    status: classificationToStatus(indicator.classification_current),
    criteria: indicator.criteria,
    description: indicator.description,
    formula: indicator.formula,
  }));
};
