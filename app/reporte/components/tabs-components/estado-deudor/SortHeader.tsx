import { ChevronUpDownIcon, ChevronUpIcon, ChevronDownIcon } from "@heroicons/react/24/outline";

import { cn } from "../../../utils/formatting";

export interface SortState<T extends string> {
  column: T;
  direction: "asc" | "desc";
}

interface SortHeaderProps<T extends string> {
  column: T;
  current: SortState<T>;
  label: string;
  onChange: (column: T) => void;
}

function SortHeader<T extends string>({ column, current, label, onChange }: SortHeaderProps<T>) {
  const isActive = current.column === column;
  const Icon = !isActive ? ChevronUpDownIcon : current.direction === "asc" ? ChevronUpIcon : ChevronDownIcon;

  return (
    <button
      className={cn(
        "inline-flex items-center gap-1 text-left font-medium text-xs uppercase tracking-wide text-slate-500",
        "hover:text-slate-700 transition-colors"
      )}
      type="button"
      onClick={() => onChange(column)}>
      <span>{label}</span>
      <Icon className="h-3.5 w-3.5" />
    </button>
  );
}

export default SortHeader;
