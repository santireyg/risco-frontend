import type { TooltipProps } from "recharts";

import { formatCurrencyWithThreshold } from "./helpers";

const BankConcentrationTooltip = ({ active, payload }: TooltipProps<number, string>) => {
  if (!active || !payload || !payload.length) return null;

  const dataPoint = payload[0].payload as {
    entidad: string;
    value: number;
    percentage: number;
  };

  return (
    <div className="rounded-lg border border-slate-200 bg-white px-4 py-3 shadow-sm">
      <div className="text-xs font-medium uppercase tracking-wide text-gray-500">{dataPoint.entidad}</div>
      <div className="mt-1 text-sm font-semibold text-gray-900">{formatCurrencyWithThreshold(dataPoint.value)}</div>
      <div className="text-xs text-gray-600 mt-1">{dataPoint.percentage}% del total</div>
    </div>
  );
};

export default BankConcentrationTooltip;
