import clsx, { ClassValue } from "clsx";

import { KPIStatus } from "../types";

const currencyFormatter = new Intl.NumberFormat("es-AR", {
  style: "currency",
  currency: "ARS",
  maximumFractionDigits: 0,
});

export const formatCurrency = (value: number): string => {
  if (!Number.isFinite(value)) return "-";

  return currencyFormatter.format(value);
};

const currencyCompactFormatter = new Intl.NumberFormat("es-AR", {
  style: "currency",
  currency: "ARS",
  notation: "compact",
  maximumFractionDigits: 1,
});

export const formatCurrencyShort = (value: number): string => {
  if (!Number.isFinite(value)) return "-";

  return currencyCompactFormatter.format(value);
};

export const formatNumber = (value: number, decimals = 2): string => {
  if (!Number.isFinite(value)) return "-";

  return new Intl.NumberFormat("es-AR", {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
};

export const formatPercentage = (value: number, decimals = 1): string => {
  if (!Number.isFinite(value)) return "-";

  return `${value.toFixed(decimals)}%`;
};

export const formatDate = (value: string | Date): string => {
  const date = typeof value === "string" ? new Date(value) : value;

  if (Number.isNaN(date.getTime())) return "-";

  return new Intl.DateTimeFormat("es-AR", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  }).format(date);
};

export const formatPeriod = (period: string): string => {
  if (!period || period.length !== 6) return period;
  const year = period.slice(0, 4);
  const month = Number(period.slice(4, 6)) - 1;
  const date = new Date(Number(year), month);

  return new Intl.DateTimeFormat("es-AR", {
    month: "long",
    year: "numeric",
  }).format(date);
};

export const formatCUIT = (value: string | number): string => {
  const digits = String(value).replace(/\D/g, "");

  if (digits.length !== 11) return value.toString();

  return `${digits.slice(0, 2)}-${digits.slice(2, 10)}-${digits.slice(10)}`;
};

export const formatShortDate = (value?: string | Date | null): string => {
  if (!value) return "—";
  const date = typeof value === "string" ? new Date(value) : value;

  if (Number.isNaN(date.getTime())) return "—";

  return new Intl.DateTimeFormat("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
};

export const formatSituacionLabel = (situacion?: number): string => {
  if (situacion === undefined || situacion === null)
    return "Situación desconocida";
  const labels: Record<number, string> = {
    0: "Sin deuda",
    1: "Normal",
    2: "Con seguimiento especial",
    3: "Con problemas",
    4: "Alto riesgo",
    5: "Irrecuperable",
  };
  const label = labels[situacion];

  return label ? `Situación ${situacion} — ${label}` : `Situación ${situacion}`;
};

export const getKPIStatusColor = (status: KPIStatus): string => {
  const map: Record<KPIStatus, string> = {
    excelente: "text-success",
    admisible: "text-warning",
    deficiente: "text-danger",
  };

  return map[status] ?? "text-gray-500";
};

export const cn = (...inputs: ClassValue[]): string => {
  return clsx(...inputs);
};
