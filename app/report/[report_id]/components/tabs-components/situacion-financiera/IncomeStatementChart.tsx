"use client";

import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Card, CardBody, CardHeader } from "@heroui/card";

import {
  formatMoneyInt,
  formatPercentInt,
  formatCompactMoney,
} from "../../../utils/chart-formatting";

interface IncomeStatementChartProps {
  data: {
    metric: string;
    yearPrevious: number;
    yearCurrent: number;
  }[];
  previousLabel: string;
  currentLabel: string;
}

const CustomTick = ({ x, y, payload, data }: any) => {
  const item = data.find((d: any) => d.metric === payload.value);
  let variation = 0;

  if (item && item.yearPrevious !== 0) {
    variation =
      ((item.yearCurrent - item.yearPrevious) / Math.abs(item.yearPrevious)) *
      100;
  }

  // Determine vertical position offset based on text length to avoid collision if needed, or keeping it fixed.

  return (
    <g transform={`translate(${x},${y})`}>
      <text
        dy={16}
        fill="#4B5563"
        fontSize={12}
        fontWeight={500}
        textAnchor="middle"
        x={0}
        y={0}
      >
        {payload.value}
      </text>
      {item && (
        <g transform={`translate(${payload.value.length * 3 + 12}, 6)`}>
          <rect fill="#F3F4F6" height={16} rx={4} width={34} x={0} y={0} />
          <text
            fill="#6B7280"
            fontSize={9}
            fontWeight={600}
            textAnchor="middle"
            x={17}
            y={11}
          >
            {variation > 0 ? "+" : ""}
            {formatPercentInt(variation)}
          </text>
        </g>
      )}
    </g>
  );
};

export default function IncomeStatementChart({
  data,
  previousLabel,
  currentLabel,
}: IncomeStatementChartProps) {
  return (
    <Card
      className="border border-slate-200 shadow-sm h-full"
      radius="sm"
      shadow="none"
    >
      <CardHeader className="pb-0 pt-4 px-4 flex-col items-start bg-white rounded-t-lg">
        <h3 className="font-bold text-lg text-gray-800">
          Evolución Resultados Económicos
        </h3>
        <p className="text-small text-default-500">Comparativa 2024 vs 2023</p>
      </CardHeader>
      <CardBody className="overflow-hidden pb-4 bg-white rounded-b-lg">
        <div className="h-[350px] w-full">
          <ResponsiveContainer height="100%" width="100%">
            <BarChart
              barGap={8}
              data={data}
              margin={{
                top: 20,
                right: 30,
                left: 20,
                bottom: 20,
              }}
            >
              <CartesianGrid
                stroke="#E5E7EB"
                strokeDasharray="3 3"
                vertical={false}
              />
              <XAxis
                axisLine={false}
                dataKey="metric"
                interval={0}
                tick={<CustomTick data={data} />}
                tickLine={false}
              />
              <YAxis
                axisLine={false}
                tick={{ fill: "#6B7280", fontSize: 11 }}
                tickFormatter={formatCompactMoney}
                tickLine={false}
              />
              <Tooltip
                contentStyle={{
                  borderRadius: "8px",
                  border: "none",
                  boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                }}
                cursor={{ fill: "#F3F4F6" }}
                formatter={(value) => formatMoneyInt(Number(value) ?? 0)}
              />
              <Legend
                iconSize={6}
                iconType="circle"
                wrapperStyle={{ paddingTop: "10px", fontSize: "11px" }}
              />

              <Bar
                dataKey="yearCurrent"
                fill="#0EA5E9"
                maxBarSize={60}
                name={currentLabel}
                radius={[4, 4, 0, 0]}
              />
              <Bar
                dataKey="yearPrevious"
                fill="#9CA3AF"
                maxBarSize={60}
                name={previousLabel}
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardBody>
    </Card>
  );
}
