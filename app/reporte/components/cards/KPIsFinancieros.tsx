"use client";

import { useState } from "react";
import { Card, CardBody } from "@heroui/card";
import {
  TrendingUp,
  TrendingDown,
  Minus,
  Activity,
  Droplets,
  Wallet,
  PieChart,
  TrendingUpDown,
} from "lucide-react";

import { KPI } from "../../types";
import {
  formatNumber,
  formatPercentage,
  getKPIStatusColor,
  cn,
} from "../../utils/formatting";

interface KPIsFinancierosProps {
  kpis: KPI[];
}

const getIcon = (name: string) => {
  const icons: Record<string, any> = {
    "Liquidez Corriente": Activity,
    "Prueba Ácida": Droplets,
    "Cash Ratio": Wallet,
    Endeudamiento: PieChart,
    "Margen Operativo": TrendingUpDown,
  };
  const Icon = icons[name] || Activity;

  return <Icon className="w-5 h-5 text-gray-400" />;
};

const getTrendIcon = (trend: "up" | "down" | "neutral") => {
  if (trend === "up") return <TrendingUp className="w-4 h-4 text-success" />;
  if (trend === "down") return <TrendingDown className="w-4 h-4 text-danger" />;

  return <Minus className="w-4 h-4 text-gray-400" />;
};

const getStatusText = (status: string) => {
  const texts: Record<string, string> = {
    excelente: "Excelente",
    admisible: "Admisible",
    deficiente: "Deficiente",
  };

  return texts[status] || status;
};

const getDotColor = (status: string) => {
  const colors: Record<string, string> = {
    excelente: "bg-success",
    admisible: "bg-warning",
    deficiente: "bg-danger",
  };

  return colors[status] || "bg-gray-400";
};

export default function KPIsFinancieros({ kpis }: KPIsFinancierosProps) {
  const [expandedKPI, setExpandedKPI] = useState<string | null>(null);

  const calcularVariacion = (actual: number, anterior: number) => {
    return anterior !== 0 ? ((actual - anterior) / anterior) * 100 : 0;
  };

  return (
    <Card
      className="border border-slate-200 shadow-sm"
      radius="sm"
      shadow="none"
    >
      <CardBody className="p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4">
          KPIs Financieros
        </h3>
        <div className="space-y-3">
          {kpis.map((kpi) => {
            const variacion = calcularVariacion(
              kpi.value,
              kpi.comparison.value,
            );
            const isPercentageKPI =
              kpi.name.includes("Endeudamiento") || kpi.name.includes("Margen");
            const isExpanded = expandedKPI === kpi.name;

            return (
              <div
                key={kpi.name}
                className={cn(
                  "rounded-lg border border-gray-200 bg-white transition-all",
                  isExpanded
                    ? "border-primary/30 shadow-md"
                    : "hover:border-primary/50 hover:shadow-md",
                )}
              >
                <button
                  className={cn(
                    "flex w-full items-center gap-4 p-4 text-left",
                    isExpanded ? "border-b border-primary/30 bg-primary/5" : "",
                  )}
                  type="button"
                  onClick={() => setExpandedKPI(isExpanded ? null : kpi.name)}
                >
                  <div className="flex-shrink-0">{getIcon(kpi.name)}</div>

                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-gray-900 mb-1">
                      {kpi.name}
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-lg font-bold text-gray-900">
                        {isPercentageKPI
                          ? formatPercentage(kpi.value)
                          : formatNumber(kpi.value)}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <span
                          className={cn(
                            "w-2 h-2 rounded-full",
                            getDotColor(kpi.status),
                          )}
                        />
                        <span
                          className={cn(
                            "text-xs font-medium",
                            getKPIStatusColor(kpi.status),
                          )}
                        >
                          {getStatusText(kpi.status)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex-shrink-0 flex items-center gap-2">
                    {getTrendIcon(kpi.comparison.trend)}
                  </div>
                </button>
                {isExpanded && (
                  <div className="px-4 pb-4 text-xs text-gray-600">
                    <div className="pt-3">
                      <div className="flex items-baseline gap-2">
                        <span className="text-base font-bold text-primary">
                          {isPercentageKPI
                            ? formatPercentage(kpi.value, 0)
                            : formatNumber(kpi.value, 2)}
                        </span>
                        <span
                          className={cn(
                            "text-xs font-semibold",
                            variacion >= 0 ? "text-success" : "text-danger",
                          )}
                        >
                          {variacion >= 0 ? "+" : ""}
                          {formatPercentage(variacion, 0)}
                        </span>
                      </div>
                      <div className="mt-1 text-[11px] text-gray-500">
                        Anterior:{" "}
                        {isPercentageKPI
                          ? formatPercentage(kpi.comparison.value, 0)
                          : formatNumber(kpi.comparison.value, 2)}
                      </div>
                    </div>

                    <div className="mt-3">
                      <div className="text-[11px] font-semibold text-gray-700 mb-1.5 uppercase tracking-wide">
                        Criterios
                      </div>
                      <div className="flex gap-2 text-[11px]">
                        <div className="flex-1 rounded bg-danger/10 p-1.5 text-center">
                          <div className="font-semibold text-danger flex items-center justify-between gap-1">
                            <span>Deficiente</span>
                            <span>{kpi.criteria.deficiente}</span>
                          </div>
                        </div>
                        <div className="flex-1 rounded bg-warning/10 p-1.5 text-center">
                          <div className="font-semibold text-warning flex items-center justify-between gap-1">
                            <span>Admisible</span>
                            <span>{kpi.criteria.admisible}</span>
                          </div>
                        </div>
                        <div className="flex-1 rounded bg-success/10 p-1.5 text-center">
                          <div className="font-semibold text-success flex items-center justify-between gap-1">
                            <span>Excelente</span>
                            <span>{kpi.criteria.excelente}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-3">
                      <div className="text-[11px] font-semibold text-gray-700 mb-1 uppercase tracking-wide">
                        Descripción
                      </div>
                      <div>{kpi.description}</div>
                    </div>

                    <div className="mt-3">
                      <div className="text-[11px] font-semibold text-gray-700 mb-1 uppercase tracking-wide">
                        Fórmula de cálculo
                      </div>
                      <div className="font-mono bg-gray-50 p-2 rounded text-gray-700">
                        {kpi.formula}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </CardBody>
    </Card>
  );
}
