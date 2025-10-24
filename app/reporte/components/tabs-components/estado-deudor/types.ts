export interface BarChartEntry {
  period: string;
  label: string;
  total: number;
  breakdown: Record<string, number>;
  [key: string]: string | number | Record<string, number>;
}
