import { Card, CardBody } from "@heroui/card";
import { Chip } from "@heroui/chip";
import { Building, AlertCircle } from "lucide-react";
import {
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { DebtHistory } from "../../../types";
import { formatCurrency, formatPeriod } from "../../../utils/formatting";

interface EstadoDeudorProps {
  data: DebtHistory;
}

export default function EstadoDeudor({ data }: EstadoDeudorProps) {
  const periodos = data.results.periodos ?? [];
  const latestPeriod = periodos[0];

  const buildPeriodSequence = (
    startPeriod: string,
    months: number,
  ): string[] => {
    const periods: string[] = [];
    let year = Number(startPeriod.slice(0, 4));
    let month = Number(startPeriod.slice(4, 6)) - 1;

    for (let i = 0; i < months; i += 1) {
      const formattedMonth = String(month + 1).padStart(2, "0");

      periods.push(`${year}${formattedMonth}`);
      month -= 1;
      if (month < 0) {
        month = 11;
        year -= 1;
      }
    }

    return periods;
  };

  const periodLookup = new Map(
    periodos.map((periodo) => [periodo.periodo, periodo]),
  );

  // Calcular deuda total actual
  const deudaTotal = latestPeriod.entidades.reduce(
    (sum, ent) => sum + ent.monto,
    0,
  );

  // Cantidad de entidades
  const cantidadEntidades = latestPeriod.entidades.filter(
    (ent) => ent.monto > 0,
  ).length;

  // Situación general (peor situación)
  const situacionGeneral = Math.max(
    ...latestPeriod.entidades.map((ent) => ent.situacion),
  );

  const getSituacionChip = (sit: number) => {
    if (sit === 0)
      return {
        chip: "Situación 0",
        description: "Sin deuda",
        color: "default" as const,
      };
    if (sit === 1)
      return {
        chip: "Situación 1",
        description: "En situación normal",
        color: "success" as const,
      };
    if (sit === 2)
      return {
        chip: "Situación 2",
        description: "Con seguimiento especial",
        color: "warning" as const,
      };
    if (sit === 3)
      return {
        chip: "Situación 3",
        description: "Con problemas",
        color: "warning" as const,
      };
    if (sit === 4)
      return {
        chip: "Situación 4",
        description: "Con alto riesgo de insolvencia",
        color: "danger" as const,
      };
    if (sit === 5)
      return {
        chip: "Situación 5",
        description: "Irrecuperable",
        color: "danger" as const,
      };
    if (sit === 6)
      return {
        chip: "Situación 6",
        description: "Irrecuperable por disposición técnica",
        color: "danger" as const,
      };

    return {
      chip: `Situación ${sit}`,
      description: "Crítico",
      color: "danger" as const,
    };
  };

  const situacion = getSituacionChip(situacionGeneral);

  // Datos para el chart (últimos 12 períodos)
  const chartPeriods = latestPeriod
    ? buildPeriodSequence(latestPeriod.periodo, 12)
    : [];

  const chartData = chartPeriods
    .slice()
    .reverse()
    .map((periodo) => {
      const periodoData = periodLookup.get(periodo);
      const monto = periodoData
        ? periodoData.entidades.reduce((sum, ent) => sum + ent.monto, 0)
        : 0;

      return {
        periodo,
        periodoFormat: formatPeriod(periodo).substring(0, 3),
        monto,
      };
    });

  return (
    <Card
      className="border border-slate-200 shadow-sm"
      radius="sm"
      shadow="none"
    >
      <CardBody className="p-6">
        <div className="flex items-center gap-2 mb-4">
          <Building className="w-5 h-5 text-primary" />
          <h3 className="text-xl font-bold text-gray-900">
            Estado Deudor (BCRA)
          </h3>
        </div>

        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <div className="text-xs text-gray-600 mb-1">Deuda Total</div>
            <div className="text-2xl font-bold text-gray-900 mb-2">
              {formatCurrency(deudaTotal)}
            </div>
            <div className="text-xs text-gray-500">
              Entidades: {cantidadEntidades}
            </div>
          </div>
          <div className="flex flex-col items-end">
            <Chip
              color={situacion.color}
              size="md"
              startContent={
                situacionGeneral > 1 ? (
                  <AlertCircle className="w-3.5 h-3.5" />
                ) : null
              }
              variant="flat"
            >
              {situacion.chip}
            </Chip>
            <div className="text-xs text-gray-600 mt-1">
              {situacion.description}
            </div>
          </div>
        </div>

        <div>
          <div className="text-xs text-gray-600 mb-3">
            Evolución últimos 12 meses
          </div>
          <ResponsiveContainer height={120} width="100%">
            <LineChart data={chartData}>
              <XAxis
                axisLine={false}
                dataKey="periodoFormat"
                tick={{ fontSize: 10 }}
                tickLine={false}
              />
              <YAxis
                axisLine={false}
                orientation="right"
                tick={{ fontSize: 10 }}
                tickFormatter={(value: number) =>
                  `$${(value / 1000).toFixed(0)}K`
                }
                tickLine={false}
                width={70}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: "white",
                  border: "1px solid #e5e7eb",
                  borderRadius: "8px",
                  fontSize: "12px",
                }}
                formatter={(value: number) => [formatCurrency(value), "Deuda"]}
                labelFormatter={(label: string) =>
                  chartData.find((d) => d.periodoFormat === label)?.periodo
                    ? formatPeriod(
                        chartData.find((d) => d.periodoFormat === label)!
                          .periodo,
                      )
                    : label
                }
              />
              <Line
                activeDot={{ r: 5 }}
                dataKey="monto"
                dot={{ fill: "#3B82F6", r: 3 }}
                stroke="#3B82F6"
                strokeWidth={2.5}
                type="monotone"
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardBody>
    </Card>
  );
}
