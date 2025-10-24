import type { TooltipProps } from "recharts";

import { Chip } from "@heroui/chip";

import { formatPeriod } from "../../../utils/formatting";
import { formatSituacionForChip, getClassificationChipColor } from "./helpers";

const ClassificationTooltip = ({ active, payload }: TooltipProps<number, string>) => {
  if (!active || !payload || !payload.length) return null;

  const dataPoint = payload[0].payload as {
    period: string;
    classification: number | null;
  };

  const classification = dataPoint?.classification ?? null;
  const label = dataPoint?.period ? formatPeriod(dataPoint.period) : "";

  return (
    <div className="rounded-lg border border-slate-200 bg-white px-4 py-3 shadow-sm">
      <div className="text-xs font-medium uppercase tracking-wide text-gray-500">{label}</div>
      <div className="mt-2">
        <Chip color={getClassificationChipColor(classification)} size="sm" variant="flat">
          {formatSituacionForChip(classification)}
        </Chip>
      </div>
    </div>
  );
};

export default ClassificationTooltip;
