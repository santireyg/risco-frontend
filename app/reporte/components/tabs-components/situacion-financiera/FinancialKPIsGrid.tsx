"use client";

import { useState } from "react";
import { Card, CardBody } from "@heroui/card";
import {
  Briefcase,
  Percent,
  Repeat,
  Activity,
  Droplets,
  Wallet,
  PieChart,
  TrendingUpDown,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

import { KPI } from "../../../types";
import { formatNumber, formatPercentage } from "../../../utils/formatting";
import { formatCompactMoney } from "../../../utils/chart-formatting";

interface FinancialKPIsGridProps {
  kpis: KPI[];
  currentYear: string;
  previousYear: string;
}

const getIcon = (name: string) => {
  const icons: Record<string, any> = {
    "Capital de Trabajo": Briefcase,
    "% CT sobre Activo Total": Percent,
    "Rotación del Capital de Trabajo": Repeat,
    "Liquidez Corriente": Activity,
    "Prueba Ácida": Droplets,
    "Cash Ratio": Wallet,
    Endeudamiento: PieChart,
    "Margen Operativo": TrendingUpDown,
  };
  const Icon = icons[name] || Activity;

  return <Icon className="w-5 h-5 text-gray-500" />;
};

const getStatusLabel = (status: string) => {
  switch (status) {
    case "excelente":
      return "Excelente";
    case "admisible":
      return "Admisible";
    case "deficiente":
      return "Deficiente";
    default:
      return status;
  }
};

export default function FinancialKPIsGrid({ kpis, previousYear }: FinancialKPIsGridProps) {
  const [expandedKPI, setExpandedKPI] = useState<string | null>(null);

  const toggleKPI = (name: string) => {
    if (expandedKPI === name) {
      setExpandedKPI(null);
    } else {
      setExpandedKPI(name);
    }
  };

  return (
    <div className="flex flex-col gap-3">
      {kpis.map((kpi) => {
        const isPercentageKPI = kpi.name.includes("%") || kpi.name.includes("Endeudamiento") || kpi.name.includes("Margen");

        const isExpanded = expandedKPI === kpi.name;

        return (
          <Card
            key={kpi.name}
            isPressable
            className={`border transition-all duration-300 bg-white group ${isExpanded ? "border-primary-500 ring-1 ring-primary-100 shadow-md" : "border-slate-200 shadow-none hover:border-primary-200"}`}
            radius="sm"
            shadow="none"
            onPress={() => toggleKPI(kpi.name)}>
            <CardBody className="p-0">
              {/* Main Row */}
              <div className="p-4 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3 flex-1">
                  <div
                    className={`p-2 rounded-lg ${isExpanded ? "bg-primary-50 text-primary-600" : "bg-gray-50 text-gray-500 group-hover:bg-blue-50 group-hover:text-blue-500"} transition-colors`}>
                    {getIcon(kpi.name)}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold text-gray-700">{kpi.name}</span>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <div className="text-right">
                    <div className="text-lg font-semibold text-gray-900">
                      {kpi.name === "Capital de Trabajo"
                        ? formatCompactMoney(kpi.value)
                        : isPercentageKPI
                          ? formatPercentage(kpi.value, 1)
                          : formatNumber(kpi.value, 2)}
                    </div>
                  </div>

                  <div
                    className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wide
                            ${
                              kpi.status === "excelente"
                                ? "bg-green-50 text-green-700 border border-green-100"
                                : kpi.status === "admisible"
                                  ? "bg-yellow-50 text-yellow-700 border border-yellow-100"
                                  : "bg-red-50 text-red-700 border border-red-100"
                            }
                        `}>
                    {getStatusLabel(kpi.status)}
                  </div>

                  <div className="text-gray-400">
                    {isExpanded ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                  </div>
                </div>
              </div>

              {/* Expanded Details */}
              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    animate={{ height: "auto", opacity: 1 }}
                    className="overflow-hidden"
                    exit={{ height: 0, opacity: 0 }}
                    initial={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}>
                    <div className="border-t border-gray-100 bg-gray-50/50 p-5 space-y-6">
                      {/* Values Row - Actual and Previous side by side */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="flex items-center gap-2 text-sm bg-white p-3 rounded-lg border border-gray-100">
                          <span className="text-gray-500">Actual (2024):</span>
                          <span className="font-semibold text-gray-900">
                            {kpi.name === "Capital de Trabajo"
                              ? formatNumber(kpi.value, 0)
                              : isPercentageKPI
                                ? formatPercentage(kpi.value, 2)
                                : formatNumber(kpi.value, 2)}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm bg-white p-3 rounded-lg border border-gray-100">
                          <span className="text-gray-500">Anterior ({previousYear}):</span>
                          <span className="font-semibold text-gray-700">
                            {kpi.name === "Capital de Trabajo"
                              ? formatNumber(kpi.comparison.value, 0)
                              : isPercentageKPI
                                ? formatPercentage(kpi.comparison.value, 2)
                                : formatNumber(kpi.comparison.value, 2)}
                          </span>
                        </div>
                      </div>

                      {/* Sections Stacked */}
                      <div className="space-y-4">
                        <div>
                          <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">
                            ¿Qué mide este ratio?
                          </h4>
                          <p className="text-sm text-gray-700 leading-relaxed max-w-2xl">{kpi.description}</p>
                        </div>

                        <div>
                          <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Fórmula de cálculo</h4>
                          <code className="text-xs bg-white px-2 py-1 rounded border border-gray-200 text-gray-600 font-mono">
                            {kpi.formula}
                          </code>
                        </div>

                        <div>
                          <h4 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">
                            Criterios de Clasificación
                          </h4>
                          <div className="flex flex-col sm:flex-row gap-3">
                            <div className="flex items-center gap-2 text-xs bg-red-50 border border-red-100 px-3 py-1.5 rounded-md text-red-800">
                              <span>Def.:</span> {kpi.criteria.deficiente}
                            </div>
                            <div className="flex items-center gap-2 text-xs bg-yellow-50 border border-yellow-100 px-3 py-1.5 rounded-md text-yellow-800">
                              <span className="font-bold">Adm.:</span> {kpi.criteria.admisible}
                            </div>
                            <div className="flex items-center gap-2 text-xs bg-green-50 border border-green-100 px-3 py-1.5 rounded-md text-green-800">
                              <span className="font-bold">Exc.:</span> {kpi.criteria.excelente}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </CardBody>
          </Card>
        );
      })}
    </div>
  );
}
