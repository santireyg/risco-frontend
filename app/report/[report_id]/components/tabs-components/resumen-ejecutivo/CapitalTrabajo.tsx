"use client";

import { Card, CardBody } from "@heroui/card";
import { Chip } from "@heroui/chip";
import { Tooltip } from "@heroui/tooltip";
import { TrendingUp, TrendingDown } from "lucide-react";
import { LiaWalletSolid } from "react-icons/lia";

import {
  CapitalTrabajo as CapitalTrabajoType,
  KPIStatus,
  IndicatorV2,
} from "../../../types";
import {
  formatCurrency,
  formatNumber,
  formatPercentage,
} from "../../../utils/formatting";

interface CapitalTrabajoProps {
  data: CapitalTrabajoType;
  indicators: IndicatorV2[];
  currentYear: string;
  previousYear: string;
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

const getMetricStatus = (classification: string): KPIStatus => {
  const lower = classification.toLowerCase();

  if (lower === "excelente") return "excelente";
  if (lower === "admisible") return "admisible";

  return "deficiente";
};

export default function CapitalTrabajo({
  data,
  indicators,
  currentYear,
  previousYear,
}: CapitalTrabajoProps) {
  const { value, variation, workingCapitalTurnover, shareOfAssets } = data;
  const isPositiveVariation = variation >= 0;
  const variationLabel = `${isPositiveVariation ? "+" : ""}${formatPercentage(variation, 1)}`;

  // Get indicators data
  const ctSobreActivoIndicator = indicators.find(
    (i) => i.code === "ct_sobre_activo",
  );
  const rotacionCTIndicator = indicators.find((i) => i.code === "rotacion_ct");

  const shareOfAssetsStatus = getMetricStatus(
    ctSobreActivoIndicator?.classification_current || "deficiente",
  );
  const workingCapitalTurnoverStatus = getMetricStatus(
    rotacionCTIndicator?.classification_current || "deficiente",
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
          </div>

          {/* Metrics with hover info - Both in same row */}
          <div className="mt-4 grid grid-cols-2 gap-2">
            {/* CT sobre Activo Total */}
            {ctSobreActivoIndicator && (
              <Tooltip
                showArrow
                classNames={{
                  content: "w-80 p-0",
                }}
                content={
                  <div className="p-4 space-y-3">
                    <div>
                      <h4 className="text-sm font-bold text-gray-900 mb-1">
                        {ctSobreActivoIndicator.name}
                      </h4>
                    </div>

                    {/* Values Row */}
                    <div className="grid grid-cols-2 gap-2">
                      <div className="flex flex-col gap-1 text-xs bg-gray-50 p-2 rounded border border-gray-100">
                        <span className="text-gray-500">
                          Actual ({currentYear})
                        </span>
                        <span className="font-semibold text-gray-900">
                          {formatPercentage(
                            ctSobreActivoIndicator.value_current,
                            2,
                          )}
                        </span>
                      </div>
                      <div className="flex flex-col gap-1 text-xs bg-gray-50 p-2 rounded border border-gray-100">
                        <span className="text-gray-500">
                          Anterior ({previousYear})
                        </span>
                        <span className="font-semibold text-gray-700">
                          {formatPercentage(
                            ctSobreActivoIndicator.value_previous,
                            2,
                          )}
                        </span>
                      </div>
                    </div>

                    {/* Description */}
                    <div>
                      <h5 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">
                        ¿Qué mide este ratio?
                      </h5>
                      <p className="text-xs text-gray-700">
                        {ctSobreActivoIndicator.description}
                      </p>
                    </div>

                    {/* Formula */}
                    <div>
                      <h5 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">
                        Fórmula de cálculo
                      </h5>
                      <code className="text-xs bg-gray-50 px-2 py-1 rounded border border-gray-200 text-gray-600 font-mono block">
                        {ctSobreActivoIndicator.formula}
                      </code>
                    </div>

                    {/* Criteria */}
                    <div>
                      <h5 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5">
                        Criterios de Clasificación
                      </h5>
                      <div className="flex flex-col gap-1.5">
                        <div className="flex items-center justify-between gap-2 text-xs bg-red-50 border border-red-100 px-2 py-1 rounded text-red-800">
                          <span className="font-bold">Deficiente:</span>
                          <span>
                            {ctSobreActivoIndicator.criteria.deficiente}
                          </span>
                        </div>
                        <div className="flex items-center justify-between gap-2 text-xs bg-yellow-50 border border-yellow-100 px-2 py-1 rounded text-yellow-800">
                          <span className="font-bold">Admisible:</span>
                          <span>
                            {ctSobreActivoIndicator.criteria.admisible}
                          </span>
                        </div>
                        <div className="flex items-center justify-between gap-2 text-xs bg-green-50 border border-green-100 px-2 py-1 rounded text-green-800">
                          <span className="font-bold">Excelente:</span>
                          <span>
                            {ctSobreActivoIndicator.criteria.excelente}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                }
                placement="bottom"
              >
                <div className="cursor-help w-full">
                  <Chip
                    className="border border-slate-300 bg-white text-slate-700 w-full justify-center"
                    color={STATUS_CONFIG[shareOfAssetsStatus].color}
                    radius="sm"
                    size="md"
                    variant="dot"
                  >
                    <span className="flex items-center gap-2 py-1">
                      <span className="text-xs">
                        CT / Activo = {formatPercentage(shareOfAssets, 0)}
                      </span>
                      <span
                        className={`text-[10px] font-semibold ${STATUS_CONFIG[shareOfAssetsStatus].textClass}`}
                      >
                        ({STATUS_CONFIG[shareOfAssetsStatus].label})
                      </span>
                    </span>
                  </Chip>
                </div>
              </Tooltip>
            )}

            {/* Rotación CT */}
            {rotacionCTIndicator && (
              <Tooltip
                showArrow
                classNames={{
                  content: "w-80 p-0",
                }}
                content={
                  <div className="p-4 space-y-3">
                    <div>
                      <h4 className="text-sm font-bold text-gray-900 mb-1">
                        {rotacionCTIndicator.name}
                      </h4>
                    </div>

                    {/* Values Row */}
                    <div className="grid grid-cols-2 gap-2">
                      <div className="flex flex-col gap-1 text-xs bg-gray-50 p-2 rounded border border-gray-100">
                        <span className="text-gray-500">
                          Actual ({currentYear})
                        </span>
                        <span className="font-semibold text-gray-900">
                          {formatNumber(rotacionCTIndicator.value_current, 2)}x
                        </span>
                      </div>
                      <div className="flex flex-col gap-1 text-xs bg-gray-50 p-2 rounded border border-gray-100">
                        <span className="text-gray-500">
                          Anterior ({previousYear})
                        </span>
                        <span className="font-semibold text-gray-700">
                          {formatNumber(rotacionCTIndicator.value_previous, 2)}x
                        </span>
                      </div>
                    </div>

                    {/* Description */}
                    <div>
                      <h5 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">
                        ¿Qué mide este ratio?
                      </h5>
                      <p className="text-xs text-gray-700">
                        {rotacionCTIndicator.description}
                      </p>
                    </div>

                    {/* Formula */}
                    <div>
                      <h5 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">
                        Fórmula de cálculo
                      </h5>
                      <code className="text-xs bg-gray-50 px-2 py-1 rounded border border-gray-200 text-gray-600 font-mono block">
                        {rotacionCTIndicator.formula}
                      </code>
                    </div>

                    {/* Criteria */}
                    <div>
                      <h5 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5">
                        Criterios de Clasificación
                      </h5>
                      <div className="flex flex-col gap-1.5">
                        <div className="flex items-center justify-between gap-2 text-xs bg-red-50 border border-red-100 px-2 py-1 rounded text-red-800">
                          <span className="font-bold">Deficiente:</span>
                          <span>{rotacionCTIndicator.criteria.deficiente}</span>
                        </div>
                        <div className="flex items-center justify-between gap-2 text-xs bg-yellow-50 border border-yellow-100 px-2 py-1 rounded text-yellow-800">
                          <span className="font-bold">Admisible:</span>
                          <span>{rotacionCTIndicator.criteria.admisible}</span>
                        </div>
                        <div className="flex items-center justify-between gap-2 text-xs bg-green-50 border border-green-100 px-2 py-1 rounded text-green-800">
                          <span className="font-bold">Excelente:</span>
                          <span>{rotacionCTIndicator.criteria.excelente}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                }
                placement="bottom"
              >
                <div className="cursor-help w-full">
                  <Chip
                    className="border border-slate-300 bg-white text-slate-700 w-full justify-center"
                    color={STATUS_CONFIG[workingCapitalTurnoverStatus].color}
                    radius="sm"
                    size="md"
                    variant="dot"
                  >
                    <span className="flex items-center gap-2 py-1">
                      <span className="text-xs">
                        Rotación CT ={" "}
                        {formatTurnover(workingCapitalTurnover, 1)}
                      </span>
                      <span
                        className={`text-[10px] font-semibold ${STATUS_CONFIG[workingCapitalTurnoverStatus].textClass}`}
                      >
                        ({STATUS_CONFIG[workingCapitalTurnoverStatus].label})
                      </span>
                    </span>
                  </Chip>
                </div>
              </Tooltip>
            )}
          </div>
        </div>
      </CardBody>
    </Card>
  );
}
