import { Card, CardBody } from "@heroui/card";
import { AlertCircle, AlertTriangle, CheckCircle } from "lucide-react";

import { KeyInsight as KeyInsightType } from "../../../types";

const mockInsights: KeyInsightType[] = [
  {
    type: "positivo",
    title: "Liquidez excepcional",
    description:
      "Cash ratio de 1.61x permite cubrir el pasivo corriente con efectivo disponible.",
  },
  {
    type: "positivo",
    title: "Normalización crediticia sostenida",
    description: "4 meses consecutivos en situación 1 (BCRA).",
  },
  {
    type: "positivo",
    title: "Sin cheques rechazados recientes",
    description: "No se registran cheques rechazados en los últimos 24 meses.",
  },
  {
    type: "positivo",
    title: "Margen operativo saludable",
    description:
      "Margen operativo del 23% demuestra rentabilidad del core business.",
  },
  {
    type: "alerta",
    title: "Caída de ventas netas",
    description:
      "Disminución del 24% en ventas netas ($1,965M → $1,490M) sin explicación operativa clara.",
  },
  {
    type: "alerta",
    title: "Endeudamiento bancario explosivo",
    description:
      "La deuda bancaria se multiplicó por 438 veces en un año; podría responder a reestructuración o cambio de modelo.",
  },
  {
    type: "alerta",
    title: "Baja rotación del capital de trabajo",
    description:
      "Rotación del capital de trabajo de 0,7x (<1,0x) señala recursos ociosos frente a las ventas.",
  },
  {
    type: "alerta",
    title: "Inventarios en fuerte descenso",
    description:
      "Reducción del 57% en inventarios sugiere posible descalce entre compras y ventas.",
  },
  {
    type: "critico",
    title: "Historial reciente de situación 3",
    description:
      "Se registraron seis meses en situación 3 (atrasos 91-180 días) durante 2024-2025.",
  },
  {
    type: "critico",
    title: "Incidentes de cheques rechazados",
    description:
      "31 cheques rechazados entre agosto y octubre 2023, todos regularizados pero relevantes para el riesgo.",
  },
  {
    type: "critico",
    title: "Pasivo no corriente emergente",
    description:
      "Apareció un pasivo no corriente de $892M en 2024; se deben revisar términos y covenants.",
  },
  {
    type: "critico",
    title: "Desconexión entre activos y ventas",
    description:
      "Los activos crecieron 44% mientras las ventas cayeron 24%; podría reflejar un cambio de giro no documentado.",
  },
];

const getInsightIcon = (type: KeyInsightType["type"]) => {
  switch (type) {
    case "critico":
      return <AlertCircle className="w-4 h-4 text-danger" />;
    case "alerta":
      return <AlertTriangle className="w-4 h-4 text-warning" />;
    case "positivo":
      return <CheckCircle className="w-4 h-4 text-success" />;
  }
};

const getInsightBorderColor = (type: KeyInsightType["type"]) => {
  switch (type) {
    case "critico":
      return "border-l-danger/60";
    case "alerta":
      return "border-l-warning/60";
    case "positivo":
      return "border-l-success/60";
  }
};

const getInsightBgColor = (type: KeyInsightType["type"]) => {
  switch (type) {
    case "critico":
      return "bg-danger/5 hover:bg-danger/10";
    case "alerta":
      return "bg-warning/5 hover:bg-warning/10";
    case "positivo":
      return "bg-success/5 hover:bg-success/10";
  }
};

export default function KeyInsights() {
  return (
    <Card
      className="border border-slate-200 shadow-sm"
      radius="sm"
      shadow="none"
    >
      <CardBody className="p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Key Insights</h2>
        <div className="space-y-2.5">
          {mockInsights.map((insight, index) => (
            <div
              key={index}
              className={`flex gap-2.5 p-3 border-l-3 rounded-r transition-colors ${getInsightBorderColor(
                insight.type,
              )} ${getInsightBgColor(insight.type)} border border-gray-100`}
            >
              <div className="flex-shrink-0 mt-0.5">
                {getInsightIcon(insight.type)}
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="text-xs font-semibold text-gray-800 mb-0.5">
                  {insight.title}
                </h3>
                <p className="text-xs text-gray-600 leading-relaxed">
                  {insight.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardBody>
    </Card>
  );
}
