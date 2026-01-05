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
import { formatMoneyInt, formatPercentInt, formatCompactMoney } from "../../../utils/chart-formatting";

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
        variation = ((item.yearCurrent - item.yearPrevious) / Math.abs(item.yearPrevious)) * 100;
    }

    // Determine vertical position offset based on text length to avoid collision if needed, or keeping it fixed.
    
    return (
        <g transform={`translate(${x},${y})`}>
            <text x={0} y={0} dy={16} textAnchor="middle" fill="#4B5563" fontWeight={500} fontSize={12}>
                {payload.value}
            </text>
            {item && (
                <g transform={`translate(${payload.value.length * 3 + 12}, 6)`}>
                    <rect x={0} y={0} width={34} height={16} rx={4} fill="#F3F4F6" />
                    <text x={17} y={11} textAnchor="middle" fontSize={9} fill="#6B7280" fontWeight={600}>
                         {variation > 0 ? "+" : ""}{formatPercentInt(variation)}
                    </text>
                </g>
            )}
        </g>
    );
};


export default function IncomeStatementChart({
  data,
  previousLabel,
  currentLabel
}: IncomeStatementChartProps) {
  return (
    <Card className="border border-slate-200 shadow-sm h-full" shadow="none" radius="sm">
      <CardHeader className="pb-0 pt-4 px-4 flex-col items-start bg-white rounded-t-lg">
        <h3 className="font-bold text-lg text-gray-800">Evolución Resultados Económicos</h3>
        <p className="text-small text-default-500">Comparativa 2024 vs 2023</p>
      </CardHeader>
      <CardBody className="overflow-hidden pb-4 bg-white rounded-b-lg">
        <div className="h-[350px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              data={data}
              margin={{
                top: 20,
                right: 30,
                left: 20,
                bottom: 20,
              }}
              barGap={8}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
              <XAxis 
                dataKey="metric" 
                axisLine={false} 
                tickLine={false} 
                interval={0}
                tick={<CustomTick data={data} />}
              />
              <YAxis 
                tickFormatter={formatCompactMoney} 
                axisLine={false} 
                tickLine={false}
                tick={{fill: '#6B7280', fontSize: 11}}
              />
              <Tooltip 
                formatter={(value: number | undefined) => formatMoneyInt(value ?? 0)}
                cursor={{ fill: '#F3F4F6' }}
                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
              />
              <Legend 
                wrapperStyle={{ paddingTop: '10px', fontSize: '11px' }} 
                iconType="circle" 
                iconSize={6}
              />
              
              <Bar dataKey="yearCurrent" name={currentLabel} fill="#0EA5E9" radius={[4, 4, 0, 0]} maxBarSize={60} />
              <Bar dataKey="yearPrevious" name={previousLabel} fill="#9CA3AF" radius={[4, 4, 0, 0]} maxBarSize={60} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardBody>
    </Card>
  );
}
