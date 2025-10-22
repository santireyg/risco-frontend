import { Card, CardBody } from "@heroui/card";
import { Chip } from "@heroui/chip";
import { Tooltip } from "@heroui/tooltip";
import { TrendingUp, TrendingDown, Wallet } from "lucide-react";
import { CapitalTrabajo as CapitalTrabajoType } from "../../types";
import { formatCurrency, formatNumber, formatPercentage } from "../../utils/formatting";

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

export default function CapitalTrabajo({ data }: CapitalTrabajoProps) {
  const { value, variation, ctnVentas, shareOfAssets } = data;
  const isPositiveVariation = variation >= 0;
  const variationLabel = `${isPositiveVariation ? "+" : ""}${formatPercentage(variation, 1)}`;

  const status = ctnVentas >= 20 ? "excelente" : ctnVentas >= 10 ? "admisible" : "deficiente";
  const statusConfig: Record<
    typeof status,
    {
      label: string;
      color: "success" | "warning" | "danger";
      description: string;
      dotClass: string;
    }
  > = {
    excelente: {
      label: "Excelente",
      color: "success",
      description: "Situación sólida",
      dotClass: "bg-green-500",
    },
    admisible: {
      label: "Admisible",
      color: "warning",
      description: "Posición aceptable",
      dotClass: "bg-amber-500",
    },
    deficiente: {
      label: "Deficiente",
      color: "danger",
      description: "Necesita atención",
      dotClass: "bg-red-500",
    },
  };

  return (
    <Card shadow="sm" className="bg-slate-50 border border-slate-100">
      <CardBody className="relative p-6">
        <div>
          <div className="flex items-start justify-between text-lg text-slate-500">
            <span>Capital de trabajo</span>
            <Wallet className="h-8 w-8 text-slate-400" />
          </div>

          <div className="mt-2 flex flex-wrap items-end">
            <span className="text-4xl font-semibold text-slate-900">{formatCapitalValue(value)}</span>
            <Tooltip placement="bottom" content={<div className="text-xs max-w-[200px]">vs. período anterior</div>}>
              <Chip
                variant="light"
                color={isPositiveVariation ? "success" : "danger"}
                size="sm"
                className="px-3 py-1 font-semibold">
                <span className="inline-flex items-center gap-1">
                  {isPositiveVariation ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
                  {variationLabel}
                </span>
              </Chip>
            </Tooltip>
          </div>

          <div className="mt-3 flex flex-wrap items-center gap-2">
            <Tooltip
              placement="bottom"
              size="md"
              content={<div>Participación del capital de trabajo sobre el activo total informado en los estados contables.</div>}>
              <Chip
                size="sm"
                variant="dot"
                radius="sm"
                color="success"
                className="border border-slate-300 bg-white text-slate-700">
                CT = {formatPercentage(shareOfAssets, 0)} del Activo total
              </Chip>
            </Tooltip>

            <Tooltip
              placement="bottom"
              radius="sm"
              shadow="sm"
              content={
                <div>
                  <p>
                    <strong>Capital de trabajo neto sobre ventas.</strong>
                  </p>
                  <p>Relación entre el capital de trabajo y la facturación anual.</p>
                </div>
              }>
              <Chip
                size="sm"
                variant="dot"
                radius="sm"
                color="success"
                className="border border-slate-300 bg-white text-slate-700">
                CTN/ventas = {formatPercentage(ctnVentas, 1)}
              </Chip>
            </Tooltip>
          </div>
        </div>
      </CardBody>
    </Card>
  );
}
