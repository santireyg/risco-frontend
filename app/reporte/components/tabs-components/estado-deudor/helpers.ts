import {
  formatCurrency,
  formatCurrencyShort,
  formatSituacionChip,
  formatSituacionDescription,
} from "../../../utils/formatting";

export type ChipColor =
  | "default"
  | "primary"
  | "secondary"
  | "success"
  | "warning"
  | "danger";

export const getSituacionChipColor = (situacion?: number): ChipColor => {
  if (situacion === undefined || situacion === null) return "default";
  if (situacion <= 0) return "default";
  if (situacion === 1) return "success";
  if (situacion === 2) return "warning";

  return "danger";
};

export const getEstadoMultaChipColor = (estado: string): ChipColor => {
  const normalized = estado.toLowerCase();

  if (normalized === "pagada") return "success";
  if (normalized === "impaga") return "danger";

  return "warning";
};

export const getClassificationChipColor = (
  situacion?: number | null,
): ChipColor => {
  if (situacion === null || situacion === undefined) return "default";
  if (situacion <= 1) return "success";
  if (situacion <= 3) return "warning";

  return "danger";
};

export const normalizeSituacionLabel = (label: string): string => {
  return label.replace("—", "-");
};

export const formatSituacionForChip = (situacion?: number | null): string => {
  if (situacion === null || situacion === undefined) return "Sin registro";

  return formatSituacionChip(situacion);
};

export const formatSituacionDescriptionText = (
  situacion?: number | null,
): string => {
  if (situacion === null || situacion === undefined)
    return "Situación desconocida";

  return formatSituacionDescription(situacion);
};

export const formatCurrencyWithThreshold = (value: number): string => {
  return Math.abs(value) >= 100000
    ? formatCurrencyShort(value)
    : formatCurrency(value);
};
