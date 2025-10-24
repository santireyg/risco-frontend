import { Card, CardBody } from "@heroui/card";
import { AlertCircle, AlertTriangle, CheckCircle } from "lucide-react";

import { KeyInsight as KeyInsightType } from "../../../types";

const mockInsights: KeyInsightType[] = [
  {
    type: "critico",
    title: "7 cheques sin fondos por $4.8M en 2023",
    description:
      "Regularizados en 2024, pero evidencian problemas históricos de flujo de caja",
  },
  {
    type: "critico",
    title: "Caída de ingresos operativos -24.2% interanual",
    description:
      "Reducción de $475M en ventas requiere análisis de causas y perspectivas",
  },
  {
    type: "alerta",
    title: "Incremento significativo de deuda BAPRO",
    description: "Nueva deuda de $942K en contexto de caída de ingresos",
  },
  {
    type: "alerta",
    title: "Endeudamiento en 33% del activo total",
    description: "Ratio admisible pero con incremento de pasivo no corriente",
  },
  {
    type: "positivo",
    title: "Excelente posición de liquidez corriente 4.5x",
    description:
      "Disponibilidades de $1.034M permiten cubrir ampliamente obligaciones",
  },
  {
    type: "positivo",
    title: "Capital de trabajo sólido de $2.283M",
    description:
      "Representa 153% de ventas anuales, muy por encima del estándar",
  },
  {
    type: "positivo",
    title: "Deudas BCRA en situación 1 (normal)",
    description: "Sin atrasos ni refinanciaciones en último período reportado",
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
