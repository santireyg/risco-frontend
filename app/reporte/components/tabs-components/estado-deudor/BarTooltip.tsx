import type { TooltipProps } from "recharts";
import type { BarChartEntry } from "./types";

import { formatPeriod } from "../../../utils/formatting";

import { formatCurrencyWithThreshold } from "./helpers";

type BarTooltipEntry = {
  value?: number | string;
  name?: string;
  color?: string;
  payload?: (BarChartEntry & { label?: string }) | null;
};

interface BarTooltipProps extends TooltipProps<number, string> {
  mode: "total" | "detalle";
  payload?: BarTooltipEntry[];
}

const BarTooltip = ({ active, payload, mode }: BarTooltipProps) => {
  if (!active || !payload || payload.length === 0) {
    return null;
  }

  const dataPoint = payload[0]?.payload ?? null;

  if (!dataPoint) {
    return null;
  }

  const periodLabel = dataPoint.period
    ? formatPeriod(dataPoint.period)
    : (payload[0]?.payload?.label ?? "");
  const total = Number(dataPoint.total ?? 0);

  return (
    <div className="rounded-lg border border-slate-200 bg-white px-4 py-3 shadow-sm">
      <div className="text-xs font-medium uppercase tracking-wide text-gray-500">
        {periodLabel}
      </div>
      <div className="text-sm font-semibold text-gray-900 mt-1">
        {formatCurrencyWithThreshold(total)}
      </div>
      {mode === "detalle" && (
        <div className="mt-2 space-y-1">
          {payload
            .filter((entry) => Number(entry.value ?? 0) > 0)
            .map((entry) => {
              const value = Number(entry.value ?? 0);
              const percent = total > 0 ? Math.round((value / total) * 100) : 0;

              return (
                <div
                  key={entry.name}
                  className="flex items-center justify-between text-xs text-gray-600"
                >
                  <span className="flex items-center gap-2">
                    <span
                      className="inline-block h-2 w-2 rounded-full"
                      style={{ backgroundColor: entry.color ?? "#2563EB" }}
                    />
                    {entry.name}
                  </span>
                  <span className="font-medium text-gray-900">
                    {formatCurrencyWithThreshold(value)} · {percent}%
                  </span>
                </div>
              );
            })}
        </div>
      )}
    </div>
  );
};

export default BarTooltip;
