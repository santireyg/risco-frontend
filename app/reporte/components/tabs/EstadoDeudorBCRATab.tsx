"use client";

import type { TooltipProps } from "recharts";

import React, { useMemo, useState } from "react";
import { Card, CardBody } from "@heroui/card";
import { Chip } from "@heroui/chip";
import { Button } from "@heroui/button";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import {
  ChevronUpDownIcon,
  ChevronUpIcon,
  ChevronDownIcon,
} from "@heroicons/react/24/outline";

import {
  ChequesRechazados,
  DebtHistory,
  DebtPeriod,
  DebtEntity,
} from "../../types";
import {
  formatCurrency,
  formatPeriod,
  formatShortDate,
  formatSituacionLabel,
  cn,
} from "../../utils/formatting";

type ChipColor =
  | "default"
  | "primary"
  | "secondary"
  | "success"
  | "warning"
  | "danger";

type SortDirection = "asc" | "desc";

type DebtSortKey = "entidad" | "situacion" | "monto" | "diasAtraso";

type ChequeSortKey =
  | "fechaRechazo"
  | "nroCheque"
  | "causal"
  | "entidad"
  | "monto"
  | "fechaPago"
  | "fechaPagoMulta"
  | "estadoMulta";

interface EstadoDeudorBCRATabProps {
  deudasHistoria: DebtHistory;
  deudasUltimoPeriodo: DebtHistory;
  chequesRechazados: ChequesRechazados;
  reportDate: string;
}

interface DebtRow {
  entidad: string;
  situacion: number;
  monto: number;
  diasAtraso: number | null | undefined;
  fechaSit1?: string | null;
  observaciones: { label: string; color: ChipColor }[];
}

interface ChequeRow {
  id: string;
  fechaRechazo: string;
  nroCheque: number;
  causal: string;
  entidad: string;
  monto: number;
  fechaPago: string | null;
  fechaPagoMulta: string | null;
  estadoMulta: string;
}

interface BarChartEntry {
  period: string;
  label: string;
  total: number;
  breakdown: Record<string, number>;
  [key: string]: string | number | Record<string, number>;
}

const stackedPalette = ["#2563EB", "#0EA5E9", "#10B981", "#F59E0B", "#F472B6"];
const donutPalette = [
  "#2563EB",
  "#F97316",
  "#10B981",
  "#A855F7",
  "#F43F5E",
  "#14B8A6",
];

const observationConfig = [
  {
    key: "refinanciaciones",
    label: "Refinanciaciones",
    color: "warning" as ChipColor,
  },
  {
    key: "recategorizacionOblig",
    label: "Recategorización obligatoria",
    color: "warning" as ChipColor,
  },
  {
    key: "situacionJuridica",
    label: "Situación jurídica",
    color: "danger" as ChipColor,
  },
  {
    key: "irrecDisposicionTecnica",
    label: "Irrecup. disp. técnica",
    color: "danger" as ChipColor,
  },
  { key: "enRevision", label: "En revisión", color: "primary" as ChipColor },
  {
    key: "procesoJud",
    label: "Proceso judicial",
    color: "danger" as ChipColor,
  },
] as const;

const titleCase = (value: string): string => {
  if (!value) return value;

  return value
    .toLowerCase()
    .split(" ")
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(" ");
};

const formatEntidadCheque = (entidad: number | string): string => {
  if (typeof entidad === "string") return entidad;
  if (Number.isFinite(entidad)) return `Entidad ${entidad}`;

  return "Entidad desconocida";
};

const getSituacionChipColor = (situacion?: number): ChipColor => {
  if (situacion === undefined || situacion === null) return "default";
  if (situacion <= 0) return "default";
  if (situacion === 1) return "success";
  if (situacion === 2) return "warning";

  return "danger";
};

const getEstadoMultaChipColor = (estado: string): ChipColor => {
  const normalized = estado.toLowerCase();

  if (normalized === "pagada") return "success";
  if (normalized === "impaga") return "danger";

  return "warning";
};

const getRiskColor = (average: number | null): string => {
  if (average === null) return "#2563EB";
  if (average < 1.5) return "#22C55E";
  if (average <= 2.5) return "#FACC15";

  return "#EF4444";
};

const formatEstadoMulta = (estado: string | null): string => {
  if (!estado) return "Pagada";

  return titleCase(estado);
};

const buildDebtRows = (period?: DebtPeriod | null): DebtRow[] => {
  if (!period) return [];

  return (period.entidades ?? []).map((entidad) => {
    const observations = observationConfig
      .filter(({ key }) => Boolean(entidad[key as keyof DebtEntity]))
      .map(({ label, color }) => ({ label, color }));

    return {
      entidad: entidad.entidad,
      situacion: entidad.situacion,
      monto: entidad.monto,
      diasAtraso: entidad.diasAtrasoPago,
      fechaSit1: entidad.fechaSit1,
      observaciones: observations,
    };
  });
};

const buildChequeRows = (cheques: ChequesRechazados): ChequeRow[] => {
  const causales = cheques?.results?.causales ?? [];
  const rows: ChequeRow[] = [];

  causales.forEach((causal) => {
    causal.entidades.forEach((entidad) => {
      entidad.detalle.forEach((detalle) => {
        rows.push({
          id: `${detalle.nroCheque}-${detalle.fechaRechazo}`,
          fechaRechazo: detalle.fechaRechazo,
          nroCheque: detalle.nroCheque,
          causal: titleCase(causal.causal),
          entidad: formatEntidadCheque(entidad.entidad),
          monto: detalle.monto,
          fechaPago: detalle.fechaPago,
          fechaPagoMulta: detalle.fechaPagoMulta,
          estadoMulta: formatEstadoMulta(detalle.estadoMulta),
        });
      });
    });
  });

  return rows;
};

const sortDebtRows = (
  rows: DebtRow[],
  sort: { column: DebtSortKey; direction: SortDirection },
): DebtRow[] => {
  const sorted = [...rows].sort((a, b) => {
    const factor = sort.direction === "asc" ? 1 : -1;

    if (sort.column === "entidad") {
      return a.entidad.localeCompare(b.entidad, "es") * factor;
    }

    if (sort.column === "situacion") {
      return (a.situacion - b.situacion) * factor;
    }

    if (sort.column === "monto") {
      return (a.monto - b.monto) * factor;
    }

    const getDias = (value: number | null | undefined) => {
      if (value === null || value === undefined)
        return sort.direction === "asc"
          ? Number.POSITIVE_INFINITY
          : Number.NEGATIVE_INFINITY;

      return value;
    };

    return (getDias(a.diasAtraso) - getDias(b.diasAtraso)) * factor;
  });

  return sorted;
};

const sortChequeRows = (
  rows: ChequeRow[],
  sort: { column: ChequeSortKey; direction: SortDirection },
): ChequeRow[] => {
  const sorted = [...rows].sort((a, b) => {
    const factor = sort.direction === "asc" ? 1 : -1;

    switch (sort.column) {
      case "fechaRechazo":
        return (
          (new Date(a.fechaRechazo).getTime() -
            new Date(b.fechaRechazo).getTime()) *
          factor
        );
      case "fechaPago":
        return (
          ((a.fechaPago ? new Date(a.fechaPago).getTime() : 0) -
            (b.fechaPago ? new Date(b.fechaPago).getTime() : 0)) *
          factor
        );
      case "fechaPagoMulta":
        return (
          ((a.fechaPagoMulta ? new Date(a.fechaPagoMulta).getTime() : 0) -
            (b.fechaPagoMulta ? new Date(b.fechaPagoMulta).getTime() : 0)) *
          factor
        );
      case "monto":
        return (a.monto - b.monto) * factor;
      case "nroCheque":
        return (a.nroCheque - b.nroCheque) * factor;
      case "entidad":
        return a.entidad.localeCompare(b.entidad, "es") * factor;
      case "causal":
        return a.causal.localeCompare(b.causal, "es") * factor;
      case "estadoMulta":
        return a.estadoMulta.localeCompare(b.estadoMulta, "es") * factor;
      default:
        return 0;
    }
  });

  return sorted;
};

const BarTooltip = ({
  active,
  payload,
  mode,
}: TooltipProps<number, string> & { mode: "total" | "detalle" }) => {
  if (!active || !payload || !payload.length) return null;

  const dataPoint = payload[0].payload as BarChartEntry | undefined;

  if (!dataPoint) return null;

  const periodLabel = dataPoint.period
    ? formatPeriod(dataPoint.period)
    : (payload[0].payload?.label ?? "");

  return (
    <div className="rounded-lg border border-slate-200 bg-white px-4 py-3 shadow-sm">
      <div className="text-xs font-medium uppercase tracking-wide text-gray-500">
        {periodLabel}
      </div>
      <div className="text-sm font-semibold text-gray-900 mt-1">
        {formatCurrency(dataPoint.total ?? 0)}
      </div>
      {mode === "detalle" && (
        <div className="mt-2 space-y-1">
          {payload
            .filter((entry) => Number(entry.value) > 0)
            .map((entry) => (
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
                  {formatCurrency(Number(entry.value ?? 0))}
                </span>
              </div>
            ))}
        </div>
      )}
    </div>
  );
};

interface SortState {
  column: string;
  direction: SortDirection;
}

interface SortHeaderProps<T extends string> {
  column: T;
  current: SortState;
  label: string;
  onChange: (column: T) => void;
}

function SortHeader<T extends string>({
  column,
  current,
  label,
  onChange,
}: SortHeaderProps<T>) {
  const isActive = current.column === column;
  const Icon = !isActive
    ? ChevronUpDownIcon
    : current.direction === "asc"
      ? ChevronUpIcon
      : ChevronDownIcon;

  return (
    <button
      className={cn(
        "inline-flex items-center gap-1 text-left font-medium text-xs uppercase tracking-wide text-slate-500",
        "hover:text-slate-700 transition-colors",
      )}
      type="button"
      onClick={() => onChange(column)}
    >
      <span>{label}</span>
      <Icon className="h-3.5 w-3.5" />
    </button>
  );
}

const EstadoDeudorBCRATab: React.FC<EstadoDeudorBCRATabProps> = ({
  deudasHistoria,
  deudasUltimoPeriodo,
  chequesRechazados,
  reportDate,
}) => {
  const [debtSort, setDebtSort] = useState<{
    column: DebtSortKey;
    direction: SortDirection;
  }>({
    column: "monto",
    direction: "desc",
  });
  const [chequeSort, setChequeSort] = useState<{
    column: ChequeSortKey;
    direction: SortDirection;
  }>({
    column: "fechaRechazo",
    direction: "desc",
  });
  const [barMode, setBarMode] = useState<"total" | "detalle">("total");

  const latestPeriod = useMemo(() => {
    const periods = deudasUltimoPeriodo?.results?.periodos ?? [];

    if (!periods.length) return null;

    return [...periods].sort((a, b) => b.periodo.localeCompare(a.periodo))[0];
  }, [deudasUltimoPeriodo]);

  const debtRows = useMemo(
    () => sortDebtRows(buildDebtRows(latestPeriod), debtSort),
    [latestPeriod, debtSort],
  );

  const chequeRows = useMemo(
    () => sortChequeRows(buildChequeRows(chequesRechazados), chequeSort),
    [chequesRechazados, chequeSort],
  );

  const debtPeriods = useMemo(() => {
    const periods = deudasHistoria?.results?.periodos ?? [];
    const sorted = [...periods].sort((a, b) =>
      a.periodo.localeCompare(b.periodo),
    );

    return sorted.slice(-12);
  }, [deudasHistoria]);

  const riskTrendData = useMemo(() => {
    return debtPeriods.map((period) => {
      const entidades = period.entidades ?? [];
      const totalMonto = entidades.reduce(
        (sum, ent) => sum + (ent.monto ?? 0),
        0,
      );
      const weightedSituacion =
        totalMonto > 0
          ? entidades.reduce(
              (sum, ent) => sum + (ent.monto ?? 0) * (ent.situacion ?? 0),
              0,
            ) / totalMonto
          : entidades.length
            ? entidades.reduce((sum, ent) => sum + (ent.situacion ?? 0), 0) /
              entidades.length
            : null;

      return {
        period: period.periodo,
        label: formatPeriod(period.periodo),
        risk:
          weightedSituacion !== null && Number.isFinite(weightedSituacion)
            ? Number(weightedSituacion.toFixed(2))
            : null,
      };
    });
  }, [debtPeriods]);

  const hasRiskData = useMemo(
    () => riskTrendData.some((entry) => entry.risk !== null),
    [riskTrendData],
  );

  const riskAverage = useMemo(() => {
    const values = riskTrendData
      .map((entry) => entry.risk)
      .filter((value): value is number => value !== null);

    if (!values.length) return null;

    return values.reduce((sum, value) => sum + value, 0) / values.length;
  }, [riskTrendData]);

  const lineColor = getRiskColor(riskAverage);

  const barChartData = useMemo(() => {
    const totalsByEntity = new Map<string, number>();

    debtPeriods.forEach((period) => {
      period.entidades?.forEach((ent) => {
        const current = totalsByEntity.get(ent.entidad) ?? 0;

        totalsByEntity.set(ent.entidad, current + (ent.monto ?? 0));
      });
    });

    const sortedEntities = Array.from(totalsByEntity.entries()).sort(
      (a, b) => b[1] - a[1],
    );
    const topEntities = sortedEntities.slice(0, 4).map(([entity]) => entity);
    const hasOther = sortedEntities.length > 4;
    const entityKeys = hasOther ? [...topEntities, "Otras"] : topEntities;

    const chartData: BarChartEntry[] = debtPeriods.map((period) => {
      const entry: BarChartEntry = {
        period: period.periodo,
        label: formatPeriod(period.periodo),
        total:
          period.entidades?.reduce((sum, ent) => sum + (ent.monto ?? 0), 0) ??
          0,
        breakdown: {},
      };

      const breakdown: Record<string, number> = {};
      let otherAccumulator = 0;

      period.entidades?.forEach((ent) => {
        if (topEntities.includes(ent.entidad)) {
          breakdown[ent.entidad] =
            (breakdown[ent.entidad] ?? 0) + (ent.monto ?? 0);
        } else {
          otherAccumulator += ent.monto ?? 0;
        }
      });

      if (hasOther) {
        breakdown.Otras = otherAccumulator;
      }

      entityKeys.forEach((key) => {
        entry[key] = breakdown[key] ?? 0;
      });

      entry.breakdown = breakdown;

      return entry;
    });

    return { chartData, entityKeys };
  }, [debtPeriods]);

  const { chartData: barChartEntries, entityKeys: barEntityKeys } =
    barChartData;

  const hasBarData = useMemo(
    () => barChartEntries.some((entry) => entry.total > 0),
    [barChartEntries],
  );

  const donutData = useMemo(() => {
    const causales = chequesRechazados?.results?.causales ?? [];
    const entries = causales.map((causal) => {
      const total = causal.entidades.reduce(
        (sum, entidad) =>
          sum +
          entidad.detalle.reduce(
            (acc, detalle) => acc + (detalle.monto ?? 0),
            0,
          ),
        0,
      );

      return { causal: titleCase(causal.causal), total };
    });

    const totalMonto = entries.reduce((sum, entry) => sum + entry.total, 0);

    return entries.map((entry, index) => ({
      ...entry,
      color: donutPalette[index % donutPalette.length],
      percentage: totalMonto
        ? Number(((entry.total / totalMonto) * 100).toFixed(1))
        : 0,
    }));
  }, [chequesRechazados]);

  const hasDonutData = useMemo(
    () => donutData.some((entry) => entry.total > 0),
    [donutData],
  );

  const chequeSummary = useMemo(() => {
    const rows = chequeRows;
    const totalMonto = rows.reduce((sum, row) => sum + row.monto, 0);
    const sinLevantar = rows.filter((row) => !row.fechaPago);
    const montoPendiente = sinLevantar.reduce((sum, row) => sum + row.monto, 0);

    return {
      totalCheques: rows.length,
      totalMonto,
      sinLevantar: sinLevantar.length,
      montoPendiente,
    };
  }, [chequeRows]);

  const totalDeudaActual = useMemo(() => {
    if (!latestPeriod) return 0;

    return (
      latestPeriod.entidades?.reduce((sum, ent) => sum + (ent.monto ?? 0), 0) ??
      0
    );
  }, [latestPeriod]);

  const entidadesInformantes = useMemo(() => {
    if (!latestPeriod) return 0;

    return (
      latestPeriod.entidades?.filter((ent) => (ent.monto ?? 0) > 0).length ?? 0
    );
  }, [latestPeriod]);

  const situacionGeneral = useMemo(() => {
    if (!latestPeriod) return undefined;
    const situaciones =
      latestPeriod.entidades?.map((ent) => ent.situacion ?? 0) ?? [];

    if (!situaciones.length) return undefined;

    return Math.max(...situaciones);
  }, [latestPeriod]);

  const handleDebtSortChange = (column: DebtSortKey) => {
    setDebtSort((prev) => {
      const nextDirection =
        prev.column === column
          ? prev.direction === "asc"
            ? "desc"
            : "asc"
          : column === "entidad"
            ? "asc"
            : "desc";

      return { column, direction: nextDirection };
    });
  };

  const handleChequeSortChange = (column: ChequeSortKey) => {
    setChequeSort((prev) => {
      const nextDirection =
        prev.column === column
          ? prev.direction === "asc"
            ? "desc"
            : "asc"
          : column === "causal" || column === "entidad"
            ? "asc"
            : "desc";

      return { column, direction: nextDirection };
    });
  };

  const unpaidCount = chequeSummary.sinLevantar;

  return (
    <div className="space-y-10">
      <section>
        <div className="mb-6">
          <h2 className="text-2xl font-semibold text-gray-900">
            Situación actual general
          </h2>
          <p className="text-sm text-gray-600">
            Información consolidada al {reportDate}.
          </p>
        </div>
        <div className="grid gap-6 lg:grid-cols-3">
          <Card
            className="border border-slate-200 shadow-sm lg:col-span-2"
            radius="lg"
            shadow="none"
          >
            <CardBody className="p-6 space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Estado actual
                </h3>
                <p className="text-sm text-gray-500">
                  Informado por las entidades al BCRA a la fecha de creación del
                  reporte
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  Último período:{" "}
                  {latestPeriod ? formatPeriod(latestPeriod.periodo) : "—"}
                </p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="border border-slate-200 rounded-lg p-4">
                  <div className="text-xs uppercase tracking-wide text-gray-500 mb-2">
                    Clasificación
                  </div>
                  <Chip
                    className="font-medium"
                    color={getSituacionChipColor(situacionGeneral)}
                    size="md"
                    variant="flat"
                  >
                    {formatSituacionLabel(situacionGeneral ?? undefined)}
                  </Chip>
                </div>
                <div className="border border-slate-200 rounded-lg p-4">
                  <div className="text-xs uppercase tracking-wide text-gray-500 mb-1">
                    Deuda actual total
                  </div>
                  <div className="text-2xl font-semibold text-gray-900">
                    {formatCurrency(totalDeudaActual)}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    ARS reportados por el sistema financiero
                  </p>
                </div>
                <div className="border border-slate-200 rounded-lg p-4">
                  <div className="text-xs uppercase tracking-wide text-gray-500 mb-1">
                    Entidades informantes
                  </div>
                  <div className="text-2xl font-semibold text-gray-900">
                    {entidadesInformantes}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Con montos registrados en el último período
                  </p>
                </div>
              </div>
            </CardBody>
          </Card>

          <Card
            className="border border-slate-200 shadow-sm"
            radius="lg"
            shadow="none"
          >
            <CardBody className="p-6 space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Cheques rechazados
                </h3>
                <p className="text-sm text-gray-500">
                  Datos acumulados informados por el BCRA
                </p>
              </div>
              <div className="space-y-3">
                <div>
                  <div className="text-xs uppercase tracking-wide text-gray-500">
                    Cantidad total
                  </div>
                  <div className="text-xl font-semibold text-gray-900">
                    {chequeSummary.totalCheques}
                  </div>
                </div>
                <div>
                  <div className="text-xs uppercase tracking-wide text-gray-500">
                    Monto total rechazado
                  </div>
                  <div className="text-xl font-semibold text-gray-900">
                    {formatCurrency(chequeSummary.totalMonto)}
                  </div>
                </div>
                <div>
                  <div className="text-xs uppercase tracking-wide text-gray-500">
                    Sin levantar
                  </div>
                  <div className="text-xl font-semibold text-gray-900">
                    {chequeSummary.sinLevantar}
                  </div>
                </div>
                <div>
                  <div className="text-xs uppercase tracking-wide text-gray-500">
                    Monto pendiente
                  </div>
                  <div className="text-xl font-semibold text-gray-900">
                    {formatCurrency(chequeSummary.montoPendiente)}
                  </div>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>
      </section>

      <section>
        <div className="mb-6">
          <h2 className="text-2xl font-semibold text-gray-900">
            Evolución de riesgo y deuda
          </h2>
        </div>
        <div className="grid gap-6 lg:grid-cols-2">
          <Card
            className="border border-slate-200 shadow-sm"
            radius="lg"
            shadow="none"
          >
            <CardBody className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Tendencia de riesgo
                  </h3>
                  <p className="text-xs text-gray-500">
                    Escala de 0 (sin riesgo) a 5 (riesgo máximo)
                  </p>
                </div>
              </div>
              {hasRiskData ? (
                <div className="h-72">
                  <ResponsiveContainer>
                    <LineChart data={riskTrendData}>
                      <CartesianGrid
                        stroke="#E2E8F0"
                        strokeDasharray="3 3"
                        vertical={false}
                      />
                      <XAxis
                        dataKey="label"
                        stroke="#94A3B8"
                        tick={{ fontSize: 11 }}
                      />
                      <YAxis
                        domain={[0, 5]}
                        stroke="#94A3B8"
                        tick={{ fontSize: 11 }}
                        ticks={[0, 1, 2, 3, 4, 5]}
                      />
                      <Tooltip
                        formatter={(value: number | null) =>
                          value !== null ? value.toFixed(2) : "—"
                        }
                        labelFormatter={(label: string, payload) => {
                          const period = payload?.[0]?.payload?.period;

                          return period ? formatPeriod(period) : label;
                        }}
                      />
                      <Line
                        activeDot={{ r: 5 }}
                        dataKey="risk"
                        dot={{ r: 4, strokeWidth: 1, fill: lineColor }}
                        stroke={lineColor}
                        strokeWidth={2.5}
                        type="monotone"
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="flex h-72 items-center justify-center text-sm text-gray-500">
                  Sin datos disponibles.
                </div>
              )}
            </CardBody>
          </Card>

          <Card
            className="border border-slate-200 shadow-sm"
            radius="lg"
            shadow="none"
          >
            <CardBody className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    Evolución del monto total
                  </h3>
                  <p className="text-xs text-gray-500">
                    Suma de montos informados por las entidades (ARS)
                  </p>
                </div>
                <div className="flex gap-2 bg-slate-100 rounded-lg p-1">
                  <Button
                    color="primary"
                    size="sm"
                    variant={barMode === "total" ? "solid" : "light"}
                    onPress={() => setBarMode("total")}
                  >
                    Total
                  </Button>
                  <Button
                    color="primary"
                    size="sm"
                    variant={barMode === "detalle" ? "solid" : "light"}
                    onPress={() => setBarMode("detalle")}
                  >
                    Por entidad
                  </Button>
                </div>
              </div>
              {hasBarData ? (
                <div className="h-72">
                  <ResponsiveContainer>
                    <BarChart data={barChartEntries}>
                      <CartesianGrid
                        stroke="#E2E8F0"
                        strokeDasharray="3 3"
                        vertical={false}
                      />
                      <XAxis
                        dataKey="label"
                        stroke="#94A3B8"
                        tick={{ fontSize: 11 }}
                      />
                      <YAxis
                        stroke="#94A3B8"
                        tick={{ fontSize: 11 }}
                        tickFormatter={(value: number) =>
                          `$${(value / 1000).toFixed(0)}K`
                        }
                      />
                      <Tooltip
                        content={(props) => (
                          <BarTooltip {...props} mode={barMode} />
                        )}
                      />
                      {barMode === "total" ? (
                        <Bar
                          dataKey="total"
                          fill="#2563EB"
                          radius={[6, 6, 0, 0]}
                        />
                      ) : (
                        barEntityKeys.map((key, index) => (
                          <Bar
                            key={key}
                            dataKey={key}
                            fill={stackedPalette[index % stackedPalette.length]}
                            radius={
                              index === barEntityKeys.length - 1
                                ? [6, 6, 0, 0]
                                : undefined
                            }
                            stackId="entidades"
                          />
                        ))
                      )}
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="flex h-72 items-center justify-center text-sm text-gray-500">
                  Sin movimientos registrados.
                </div>
              )}
            </CardBody>
          </Card>
        </div>
      </section>

      <section>
        <div className="mb-4">
          <h2 className="text-2xl font-semibold text-gray-900">
            Detalle por entidad — último período
          </h2>
          <p className="text-sm text-gray-600">
            Clasificación, días de atraso y observaciones
          </p>
        </div>

        <Card
          className="border border-slate-200 shadow-sm"
          radius="lg"
          shadow="none"
        >
          <CardBody className="p-0">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-4 py-3 text-left">
                      <SortHeader
                        column="entidad"
                        current={debtSort}
                        label="Entidad"
                        onChange={handleDebtSortChange}
                      />
                    </th>
                    <th className="px-4 py-3 text-left">
                      <SortHeader
                        column="situacion"
                        current={debtSort}
                        label="Situación"
                        onChange={handleDebtSortChange}
                      />
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-500">
                      Situación 1 desde
                    </th>
                    <th className="px-4 py-3 text-left">
                      <SortHeader
                        column="monto"
                        current={debtSort}
                        label="Monto (ARS)"
                        onChange={handleDebtSortChange}
                      />
                    </th>
                    <th className="px-4 py-3 text-left">
                      <SortHeader
                        column="diasAtraso"
                        current={debtSort}
                        label="Días de atraso"
                        onChange={handleDebtSortChange}
                      />
                    </th>
                    <th className="px-4 py-3 text-left text-xs font-medium uppercase tracking-wide text-slate-500">
                      Observaciones
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {debtRows.length === 0 ? (
                    <tr>
                      <td
                        className="px-4 py-6 text-center text-sm text-gray-500"
                        colSpan={6}
                      >
                        Sin movimientos registrados para el período
                        seleccionado.
                      </td>
                    </tr>
                  ) : (
                    debtRows.map((row) => (
                      <tr
                        key={row.entidad}
                        className="hover:bg-slate-50 transition-colors"
                      >
                        <td className="px-4 py-3 text-sm text-gray-900">
                          {row.entidad}
                        </td>
                        <td className="px-4 py-3">
                          <Chip
                            color={getSituacionChipColor(row.situacion)}
                            size="sm"
                            variant="flat"
                          >
                            {formatSituacionLabel(row.situacion)}
                          </Chip>
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {row.fechaSit1 ? formatShortDate(row.fechaSit1) : "—"}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-900">
                          {formatCurrency(row.monto)}
                        </td>
                        <td className="px-4 py-3 text-sm text-gray-600">
                          {row.diasAtraso ?? "—"}
                        </td>
                        <td className="px-4 py-3">
                          {row.observaciones.length === 0 ? (
                            <span className="text-sm text-gray-500">—</span>
                          ) : (
                            <div className="flex flex-wrap gap-2">
                              {row.observaciones.map((obs) => (
                                <Chip
                                  key={`${row.entidad}-${obs.label}`}
                                  color={obs.color}
                                  size="sm"
                                  variant="flat"
                                >
                                  {obs.label}
                                </Chip>
                              ))}
                            </div>
                          )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardBody>
        </Card>
      </section>

      <section>
        <div className="mb-4">
          <h2 className="text-2xl font-semibold text-gray-900">
            Detalle de cheques rechazados
          </h2>
          <p className="text-sm text-gray-600">
            Incluye estado de multa y levantamiento
          </p>
        </div>
        <div className="grid gap-6 lg:grid-cols-3">
          <Card
            className="border border-slate-200 shadow-sm lg:col-span-1"
            radius="lg"
            shadow="none"
          >
            <CardBody className="p-6 space-y-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Distribución por causal
                </h3>
                <p className="text-xs text-gray-500">
                  Participación de cada motivo de rechazo
                </p>
              </div>
              {hasDonutData ? (
                <>
                  <div className="h-64">
                    <ResponsiveContainer>
                      <PieChart>
                        <Pie
                          data={donutData}
                          dataKey="total"
                          innerRadius={60}
                          nameKey="causal"
                          outerRadius={90}
                          paddingAngle={4}
                        >
                          {donutData.map((entry) => (
                            <Cell
                              key={entry.causal}
                              fill={entry.color}
                              stroke="white"
                              strokeWidth={1}
                            />
                          ))}
                        </Pie>
                        <Tooltip
                          formatter={(value: number) => formatCurrency(value)}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="space-y-2">
                    {donutData.map((entry) => (
                      <div
                        key={entry.causal}
                        className="flex items-center justify-between text-sm"
                      >
                        <div className="flex items-center gap-2 text-gray-600">
                          <span
                            className="inline-block h-2.5 w-2.5 rounded-full"
                            style={{ backgroundColor: entry.color }}
                          />
                          <span>{entry.causal}</span>
                        </div>
                        <span className="font-medium text-gray-900">
                          {entry.percentage}%
                        </span>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="flex h-64 items-center justify-center text-sm text-gray-500">
                  Sin rechazos registrados.
                </div>
              )}
              <div>
                <Chip
                  color={unpaidCount === 0 ? "success" : "danger"}
                  variant="flat"
                >
                  {unpaidCount === 0
                    ? "Todos pagados"
                    : `${unpaidCount} cheques sin pagar`}
                </Chip>
              </div>
            </CardBody>
          </Card>

          <Card
            className="border border-slate-200 shadow-sm lg:col-span-2"
            radius="lg"
            shadow="none"
          >
            <CardBody className="p-0">
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-slate-200">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-4 py-3 text-left">
                        <SortHeader
                          column="fechaRechazo"
                          current={chequeSort}
                          label="Fecha de rechazo"
                          onChange={handleChequeSortChange}
                        />
                      </th>
                      <th className="px-4 py-3 text-left">
                        <SortHeader
                          column="nroCheque"
                          current={chequeSort}
                          label="N° cheque"
                          onChange={handleChequeSortChange}
                        />
                      </th>
                      <th className="px-4 py-3 text-left">
                        <SortHeader
                          column="causal"
                          current={chequeSort}
                          label="Causal"
                          onChange={handleChequeSortChange}
                        />
                      </th>
                      <th className="px-4 py-3 text-left">
                        <SortHeader
                          column="entidad"
                          current={chequeSort}
                          label="Entidad"
                          onChange={handleChequeSortChange}
                        />
                      </th>
                      <th className="px-4 py-3 text-left">
                        <SortHeader
                          column="monto"
                          current={chequeSort}
                          label="Monto (ARS)"
                          onChange={handleChequeSortChange}
                        />
                      </th>
                      <th className="px-4 py-3 text-left">
                        <SortHeader
                          column="fechaPago"
                          current={chequeSort}
                          label="Fecha pago cheque"
                          onChange={handleChequeSortChange}
                        />
                      </th>
                      <th className="px-4 py-3 text-left">
                        <SortHeader
                          column="fechaPagoMulta"
                          current={chequeSort}
                          label="Fecha pago multa"
                          onChange={handleChequeSortChange}
                        />
                      </th>
                      <th className="px-4 py-3 text-left">
                        <SortHeader
                          column="estadoMulta"
                          current={chequeSort}
                          label="Estado multa"
                          onChange={handleChequeSortChange}
                        />
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {chequeRows.length === 0 ? (
                      <tr>
                        <td
                          className="px-4 py-6 text-center text-sm text-gray-500"
                          colSpan={8}
                        >
                          No se registran cheques rechazados.
                        </td>
                      </tr>
                    ) : (
                      chequeRows.map((row) => (
                        <tr
                          key={row.id}
                          className="hover:bg-slate-50 transition-colors"
                        >
                          <td className="px-4 py-3 text-sm text-gray-600">
                            {formatShortDate(row.fechaRechazo)}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900">
                            {row.nroCheque}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600">
                            {row.causal}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600">
                            {row.entidad}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900">
                            {formatCurrency(row.monto)}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600">
                            {row.fechaPago
                              ? formatShortDate(row.fechaPago)
                              : "—"}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-600">
                            {row.fechaPagoMulta
                              ? formatShortDate(row.fechaPagoMulta)
                              : "—"}
                          </td>
                          <td className="px-4 py-3">
                            <Chip
                              color={getEstadoMultaChipColor(row.estadoMulta)}
                              size="sm"
                              variant="flat"
                            >
                              {row.estadoMulta}
                            </Chip>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </CardBody>
          </Card>
        </div>
      </section>
    </div>
  );
};

export default EstadoDeudorBCRATab;
