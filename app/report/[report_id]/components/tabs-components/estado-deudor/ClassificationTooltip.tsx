import type { TooltipProps } from "recharts";

import { Chip } from "@heroui/chip";

import { formatPeriod } from "../../../utils/formatting";

import { formatSituacionForChip, getClassificationChipColor } from "./helpers";

interface ClassificationTooltipData {
  period: string;
  classification: number | null;
}

type ClassificationTooltipProps = TooltipProps<number, string> & {
  payload?: Array<{ payload?: ClassificationTooltipData | null }>;
};

const ClassificationTooltip = ({
  active,
  payload,
}: ClassificationTooltipProps) => {
  if (!active || !payload || payload.length === 0) return null;

  const dataPoint = payload[0]?.payload ?? null;

  if (!dataPoint) {
    return null;
  }

  const classification = dataPoint?.classification ?? null;
  const label = dataPoint?.period ? formatPeriod(dataPoint.period) : "";

  return (
    <div className="rounded-lg border border-slate-200 bg-white px-4 py-3 shadow-sm">
      <div className="text-xs font-medium uppercase tracking-wide text-gray-500">
        {label}
      </div>
      <div className="mt-2">
        <Chip
          color={getClassificationChipColor(classification)}
          size="sm"
          variant="flat"
        >
          {formatSituacionForChip(classification)}
        </Chip>
      </div>
    </div>
  );
};

export default ClassificationTooltip;
