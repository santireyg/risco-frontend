"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LabelList,
} from "recharts";
import { Card, CardBody, CardHeader } from "@heroui/card";

import { formatCompactMoney } from "../../../utils/chart-formatting";

interface BalanceStructureChartProps {
  data: {
    year: string;
    activoCorriente: number;
    activoNoCorriente: number;
    pasivoCorriente: number;
    pasivoNoCorriente: number;
    patrimonioNeto: number;
  }[];
}

const COLORS = {
  activoCorriente: "#60A5FA",
  activoNoCorriente: "#2563EB",
  pasivoCorriente: "#F87171",
  pasivoNoCorriente: "#DC2626",
  patrimonioNeto: "#10B981",
};

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const totalActivo = data.activoCorriente + data.activoNoCorriente;
    const totalPasivo = data.pasivoCorriente + data.pasivoNoCorriente;

    const calcPercent = (val: number, total: number) =>
      total ? Math.round((val / total) * 100) : 0;

    return (
      <div className="bg-white p-3 rounded-lg shadow-xl border border-slate-100 text-xs z-50">
        <p className="font-bold text-gray-800 mb-2 text-sm">
          Estructura patrimonial {label === "2024" ? "Actual" : "Anterior"} (
          {label})
        </p>

        <div className="mb-2">
          <div className="font-bold text-gray-700 mb-1 border-b border-gray-100 pb-1">
            Activo
          </div>
          <div className="flex justify-between gap-4 mb-0.5">
            <span className="text-gray-500">
              Activo corriente ({calcPercent(data.activoCorriente, totalActivo)}
              %)
            </span>
            <span className="font-medium text-gray-900">
              {formatCompactMoney(data.activoCorriente)}
            </span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-gray-500">
              Activo no corriente (
              {calcPercent(data.activoNoCorriente, totalActivo)}%)
            </span>
            <span className="font-medium text-gray-900">
              {formatCompactMoney(data.activoNoCorriente)}
            </span>
          </div>
        </div>

        <div className="mb-2">
          <div className="font-bold text-gray-700 mb-1 border-b border-gray-100 pb-1">
            Pasivo
          </div>
          <div className="flex justify-between gap-4 mb-0.5">
            <span className="text-gray-500">
              Pasivo corriente ({calcPercent(data.pasivoCorriente, totalPasivo)}
              %)
            </span>
            <span className="font-medium text-gray-900">
              {formatCompactMoney(data.pasivoCorriente)}
            </span>
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-gray-500">
              Pasivo no corriente (
              {calcPercent(data.pasivoNoCorriente, totalPasivo)}%)
            </span>
            <span className="font-medium text-gray-900">
              {formatCompactMoney(data.pasivoNoCorriente)}
            </span>
          </div>
        </div>

        <div>
          <div className="font-bold text-gray-700 mb-1 border-b border-gray-100 pb-1">
            Patrimonio Neto
          </div>
          <div className="flex justify-between gap-4">
            <span className="text-gray-500">Patrimonio Neto</span>
            <span className="font-medium text-gray-900">
              {formatCompactMoney(data.patrimonioNeto)}
            </span>
          </div>
        </div>
      </div>
    );
  }

  return null;
};

// Component for rendering label with subscript using tspan
const RenderLabel = (props: any) => {
  const { x, y, width, height, dataKey } = props;

  if (height < 20) return null;

  // Decide content based on dataKey
  let main = "";
  let sub = "";

  switch (dataKey) {
    case "activoCorriente":
      main = "A";
      sub = "C";
      break;
    case "activoNoCorriente":
      main = "A";
      sub = "NC";
      break;
    case "pasivoCorriente":
      main = "P";
      sub = "C";
      break;
    case "pasivoNoCorriente":
      main = "P";
      sub = "NC";
      break;
    case "patrimonioNeto":
      main = "PN";
      sub = "";
      break;
  }

  return (
    <text
      dominantBaseline="middle"
      fill="#fff"
      fontSize={11}
      fontWeight="600"
      textAnchor="middle"
      x={x + width / 2}
      y={y + height / 2}
    >
      {main}
      {sub && (
        <tspan baselineShift="sub" dy={2} fontSize={8} fontWeight="normal">
          {sub}
        </tspan>
      )}
    </text>
  );
};

export default function BalanceStructureChart({
  data,
}: BalanceStructureChartProps) {
  // Sort data 2024 first
  const sortedData = [...data].sort((a, b) => Number(b.year) - Number(a.year));

  return (
    <Card
      className="border border-slate-200 shadow-sm w-full"
      radius="sm"
      shadow="none"
    >
      <CardHeader className="pb-0 pt-4 px-4 flex-col items-start">
        <h3 className="font-bold text-lg text-gray-800">
          Evolución Estructura Patrimonial
        </h3>
        <p className="text-small text-default-500">
          Comparativa Activo vs Pasivo + PN
        </p>
      </CardHeader>
      <CardBody className="overflow-visible pb-4 flex flex-col gap-4">
        <div className="w-full h-[350px]">
          <ResponsiveContainer height="100%" width="100%">
            <BarChart
              data={sortedData}
              margin={{
                top: 20,
                right: 30,
                left: 20,
                bottom: 5,
              }}
            >
              <CartesianGrid
                stroke="#E5E7EB"
                strokeDasharray="3 3"
                vertical={false}
              />
              <XAxis
                axisLine={false}
                dataKey="year"
                tick={{ fill: "#6B7280" }}
                tickLine={false}
              />
              <YAxis
                axisLine={false}
                tick={{ fill: "#6B7280", fontSize: 11 }}
                tickFormatter={formatCompactMoney}
                tickLine={false}
              />
              <Tooltip
                allowEscapeViewBox={{ x: false, y: true }}
                content={<CustomTooltip />}
                cursor={{ fill: "#F3F4F6", opacity: 0.5 }}
              />

              {/* Activo Stack */}
              <Bar
                dataKey="activoNoCorriente"
                fill={COLORS.activoNoCorriente}
                radius={[0, 0, 0, 0]}
                stackId="activo"
              >
                <LabelList
                  content={<RenderLabel dataKey="activoNoCorriente" />}
                />
              </Bar>
              <Bar
                dataKey="activoCorriente"
                fill={COLORS.activoCorriente}
                radius={[4, 4, 0, 0]}
                stackId="activo"
              >
                <LabelList
                  content={<RenderLabel dataKey="activoCorriente" />}
                />
              </Bar>

              {/* Pasivo + PN Stack */}
              <Bar
                dataKey="patrimonioNeto"
                fill={COLORS.patrimonioNeto}
                radius={[0, 0, 0, 0]}
                stackId="pasivo"
              >
                <LabelList content={<RenderLabel dataKey="patrimonioNeto" />} />
              </Bar>
              <Bar
                dataKey="pasivoNoCorriente"
                fill={COLORS.pasivoNoCorriente}
                radius={[0, 0, 0, 0]}
                stackId="pasivo"
              >
                <LabelList
                  content={<RenderLabel dataKey="pasivoNoCorriente" />}
                />
              </Bar>
              <Bar
                dataKey="pasivoCorriente"
                fill={COLORS.pasivoCorriente}
                radius={[4, 4, 0, 0]}
                stackId="pasivo"
              >
                <LabelList
                  content={<RenderLabel dataKey="pasivoCorriente" />}
                />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Custom Legend (Visible via overflow-visible on CardBody) */}
        <div className="mt-4 flex flex-wrap justify-center gap-x-4 gap-y-2 px-2">
          <div className="flex items-center gap-1.5">
            <span
              className="w-2 h-2 rounded-full"
              style={{ background: COLORS.activoCorriente }}
            />
            <span className="text-[10px] text-gray-500 font-medium">
              A<sub className="align-baseline text-[8px]">C</sub> (Activo Cte.)
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span
              className="w-2 h-2 rounded-full"
              style={{ background: COLORS.activoNoCorriente }}
            />
            <span className="text-[10px] text-gray-500 font-medium">
              A<sub className="align-baseline text-[8px]">NC</sub> (Activo No
              Cte.)
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span
              className="w-2 h-2 rounded-full"
              style={{ background: COLORS.pasivoCorriente }}
            />
            <span className="text-[10px] text-gray-500 font-medium">
              P<sub className="align-baseline text-[8px]">C</sub> (Pasivo Cte.)
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span
              className="w-2 h-2 rounded-full"
              style={{ background: COLORS.pasivoNoCorriente }}
            />
            <span className="text-[10px] text-gray-500 font-medium">
              P<sub className="align-baseline text-[8px]">NC</sub> (Pasivo No
              Cte.)
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <span
              className="w-2 h-2 rounded-full"
              style={{ background: COLORS.patrimonioNeto }}
            />
            <span className="text-[10px] text-gray-500 font-medium">
              PN (Patrimonio Neto)
            </span>
          </div>
        </div>
      </CardBody>
    </Card>
  );
}
