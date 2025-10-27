import { Card, CardBody } from "@heroui/card";
import { Chip } from "@heroui/chip";
import { Tooltip } from "@heroui/tooltip";
import { TrendingUp, TrendingDown } from "lucide-react";
import { LiaWalletSolid } from "react-icons/lia";

import {
  CapitalTrabajo as CapitalTrabajoType,
  KPIStatus,
} from "../../../types";
import {
  formatCurrency,
  formatNumber,
  formatPercentage,
} from "../../../utils/formatting";

interface CapitalTrabajoProps {
  data: CapitalTrabajoType;
}

const currencySymbol =
  new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  })
    .formatToParts(0)
    .find((part) => part.type === "currency")?.value ?? "$";

const formatCapitalValue = (value: number): string => {
  if (!Number.isFinite(value)) return "-";

  const absValue = Math.abs(value);
  const sign = value < 0 ? "-" : "";

  if (absValue >= 1_000_000) {
    const decimals = absValue >= 10_000_000 ? 0 : 1;

    return `${sign}${currencySymbol}${formatNumber(absValue / 1_000_000, decimals)}M`;
  }

  if (absValue >= 1_000) {
    const decimals = absValue >= 100_000 ? 0 : 1;

    return `${sign}${currencySymbol}${formatNumber(absValue / 1_000, decimals)}k`;
  }

  return formatCurrency(value);
};

const formatTurnover = (value: number, decimals = 1): string => {
  if (!Number.isFinite(value)) return "-";

  return `${formatNumber(value, decimals)}x`;
};

type StatusColor = "success" | "warning" | "danger";

const STATUS_CONFIG: Record<
  KPIStatus,
  {
    label: string;
    color: StatusColor;
    textClass: string;
  }
> = {
  excelente: {
    label: "Excelente",
    color: "success",
    textClass: "text-green-600",
  },
  admisible: {
    label: "Admisible",
    color: "warning",
    textClass: "text-amber-600",
  },
  deficiente: {
    label: "Deficiente",
    color: "danger",
    textClass: "text-red-600",
  },
};

const STATUS_ORDER: KPIStatus[] = [
  "excelente",
  "admisible",
  "deficiente",
];

const SHARE_OF_ASSETS_THRESHOLDS: [number, number] = [5, 25];
const WORKING_CAPITAL_TURNOVER_THRESHOLDS: [number, number] = [1, 1.5];

const getMetricStatus = (
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

const buildCriteriaLabels = (
  thresholds: [number, number],
  {
    inverse = false,
    formatter = (value: number) => formatPercentage(value, 0),
  }: {
    inverse?: boolean;
    formatter?: (value: number) => string;
  } = {},
): Record<KPIStatus, string> => {
  const [low, high] = thresholds;
  const formattedLow = formatter(low);
  const formattedHigh = formatter(high);

  if (inverse) {
    return {
      excelente: `<= ${formattedLow}`,
      admisible: `${formattedLow} - ${formattedHigh}`,
      deficiente: `> ${formattedHigh}`,
    };
  }

  return {
    excelente: `>= ${formattedHigh}`,
    admisible: `${formattedLow} - ${formattedHigh}`,
    deficiente: `< ${formattedLow}`,
  };
};

interface MetricTooltipContentProps {
  title: string;
  description: string;
  criteria: Record<KPIStatus, string>;
  status: KPIStatus;
}

const MetricTooltipContent = ({
  title,
  description,
  criteria,
  status,
}: MetricTooltipContentProps) => {
  return (
    <div className="max-w-[240px] text-xs text-slate-600">
      <p className="text-sm font-semibold text-slate-900">{title}</p>
      <p className="mt-1">{description}</p>
      <div className="mt-2 rounded-md bg-slate-100 px-2 py-1 text-[11px] font-medium text-slate-700">
        Estado actual:
        <span
          className={`ml-1 font-semibold ${STATUS_CONFIG[status].textClass}`}
        >
          {STATUS_CONFIG[status].label}
        </span>
      </div>
      <div className="mt-2">
        <p className="font-semibold text-slate-800">Criterios:</p>
        <ul className="mt-1 space-y-1 text-[11px]">
          {STATUS_ORDER.map((statusKey) => (
            <li
              key={statusKey}
              className="flex items-center justify-between gap-2"
            >
              <span
                className={`font-medium ${STATUS_CONFIG[statusKey].textClass}`}
              >
                {STATUS_CONFIG[statusKey].label}
              </span>
              <span>{criteria[statusKey]}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default function CapitalTrabajo({ data }: CapitalTrabajoProps) {
  const { value, variation, workingCapitalTurnover, shareOfAssets } = data;
  const isPositiveVariation = variation >= 0;
  const variationLabel = `${isPositiveVariation ? "+" : ""}${formatPercentage(variation, 1)}`;
  const shareOfAssetsStatus = getMetricStatus(
    shareOfAssets,
    SHARE_OF_ASSETS_THRESHOLDS,
  );
  const workingCapitalTurnoverStatus = getMetricStatus(
    workingCapitalTurnover,
    WORKING_CAPITAL_TURNOVER_THRESHOLDS,
  );
  const shareOfAssetsCriteria = buildCriteriaLabels(
    SHARE_OF_ASSETS_THRESHOLDS,
  );
  const workingCapitalTurnoverCriteria = buildCriteriaLabels(
    WORKING_CAPITAL_TURNOVER_THRESHOLDS,
    {
      formatter: (value) => formatTurnover(value, 1),
    },
  );

  return (
    <Card
      className="bg-slate-50  border border-slate-200 shadow-sm"
      radius="sm"
      shadow="none"
    >
      <CardBody className="relative p-6">
        <div>
          <div className="flex items-start justify-between font-light text-lg text-slate-500">
            <span>Capital de trabajo</span>
            <LiaWalletSolid className="h-8 w-8 text-slate-300" />
          </div>

          <div className="mt-2 flex flex-wrap items-end">
            <span className="text-4xl font-medium text-slate-900">
              {formatCapitalValue(value)}
            </span>
            <Tooltip
              content={
                <div className="text-xs max-w-[200px]">
                  vs. período anterior
                </div>
              }
              placement="bottom"
            >
              <Chip
                className="px-3 py-1 font-semibold"
                color={isPositiveVariation ? "success" : "danger"}
                size="sm"
                variant="light"
              >
                <span className="inline-flex items-center gap-1">
                  {isPositiveVariation ? (
                    <TrendingUp className="h-3.5 w-3.5" />
                  ) : (
                    <TrendingDown className="h-3.5 w-3.5" />
                  )}
                  {variationLabel}
                </span>
              </Chip>
            </Tooltip>
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <Tooltip
              content={
                <MetricTooltipContent
                  criteria={shareOfAssetsCriteria}
                  description="Porcentaje del activo total financiado con capital de trabajo."
                  status={shareOfAssetsStatus}
                  title="Capital de trabajo sobre activo total"
                />
              }
              placement="bottom"
              radius="sm"
              shadow="sm"
            >
              <Chip
                className="border border-slate-300 bg-white text-slate-700"
                color={STATUS_CONFIG[shareOfAssetsStatus].color}
                radius="sm"
                size="sm"
                variant="dot"
              >
                <span className="flex items-center gap-1">
                  <span>
                    CT = {formatPercentage(shareOfAssets, 0)} del Activo total
                  </span>
                  <span
                    className={`text-xs font-semibold ${STATUS_CONFIG[shareOfAssetsStatus].textClass}`}
                  >
                    ({STATUS_CONFIG[shareOfAssetsStatus].label})
                  </span>
                </span>
              </Chip>
            </Tooltip>

            <Tooltip
              content={
                <MetricTooltipContent
                  criteria={workingCapitalTurnoverCriteria}
                  description="Mide cuántas veces las ventas netas cubren el capital de trabajo neto durante el último ejercicio."
                  status={workingCapitalTurnoverStatus}
                  title="Rotación del capital de trabajo"
                />
              }
              placement="bottom"
              radius="sm"
              shadow="sm"
            >
              <Chip
                className="border border-slate-300 bg-white text-slate-700"
                color={STATUS_CONFIG[workingCapitalTurnoverStatus].color}
                radius="sm"
                size="sm"
                variant="dot"
              >
                <span className="flex items-center gap-1">
                  <span>
                    Rotación CT = {formatTurnover(workingCapitalTurnover, 1)}
                  </span>
                  <span
                    className={`text-xs font-semibold ${STATUS_CONFIG[workingCapitalTurnoverStatus].textClass}`}
                  >
                    ({STATUS_CONFIG[workingCapitalTurnoverStatus].label})
                  </span>
                </span>
              </Chip>
            </Tooltip>
          </div>
        </div>
      </CardBody>
    </Card>
  );
}
