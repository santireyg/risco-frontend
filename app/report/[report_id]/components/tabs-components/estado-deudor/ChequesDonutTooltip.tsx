import type { TooltipProps } from "recharts";

import { formatCurrencyWithThreshold } from "./helpers";

interface ChequesDonutTooltipData {
  causal: string;
  amount: number;
  count: number;
}

type ChequesDonutTooltipProps = TooltipProps<number, string> & {
  payload?: Array<{ payload?: ChequesDonutTooltipData | null }>;
};

const ChequesDonutTooltip = ({ active, payload }: ChequesDonutTooltipProps) => {
  if (!active || !payload || payload.length === 0) return null;

  const dataPoint = payload[0]?.payload ?? null;

  if (!dataPoint) {
    return null;
  }

  return (
    <div className="rounded-lg border border-slate-200 bg-white px-4 py-3 shadow-sm">
      <div className="text-xs font-medium uppercase tracking-wide text-gray-500">
        {dataPoint.causal}
      </div>
      <div className="mt-1 text-sm text-gray-900">
        {dataPoint.count} {dataPoint.count === 1 ? "cheque" : "cheques"}
      </div>
      <div className="text-xs text-gray-600 mt-1">
        Monto total: {formatCurrencyWithThreshold(dataPoint.amount)}
      </div>
    </div>
  );
};

export default ChequesDonutTooltip;
