import type { TooltipProps } from "recharts";

import { formatCurrencyWithThreshold } from "./helpers";

interface BankTooltipData {
  entidad: string;
  value: number;
  percentage: number;
}

type BankTooltipProps = TooltipProps<number, string> & {
  payload?: Array<{ payload?: BankTooltipData | null }>;
};

const BankConcentrationTooltip = ({ active, payload }: BankTooltipProps) => {
  if (!active || !payload || payload.length === 0) {
    return null;
  }

  const dataPoint = payload[0]?.payload ?? null;

  if (!dataPoint) {
    return null;
  }

  return (
    <div className="rounded-lg border border-slate-200 bg-white px-4 py-3 shadow-sm">
      <div className="text-xs font-medium uppercase tracking-wide text-gray-500">
        {dataPoint.entidad}
      </div>
      <div className="mt-1 text-sm font-semibold text-gray-900">
        {formatCurrencyWithThreshold(dataPoint.value)}
      </div>
      <div className="mt-1 text-xs text-gray-600">
        {dataPoint.percentage}% del total
      </div>
    </div>
  );
};

export default BankConcentrationTooltip;
