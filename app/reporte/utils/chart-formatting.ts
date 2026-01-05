export const formatCompactMoney = (value: number) => {
  if (value === 0) return "$0";
  const absValue = Math.abs(value);
  const sign = value < 0 ? "-" : "";
  
  if (absValue >= 1_000_000) {
    // 1.5M, 100M
    return `${sign}$${(absValue / 1_000_000).toLocaleString("en-US", { maximumFractionDigits: 1 }).replace(/\.0$/, '')}M`;
  }
  if (absValue >= 1_000) {
    // 1.5k, 100k
    return `${sign}$${(absValue / 1_000).toLocaleString("en-US", { maximumFractionDigits: 1 }).replace(/\.0$/, '')}k`;
  }
  return `${sign}$${absValue.toLocaleString("en-US")}`;
};

export const formatPercentInt = (value: number) => {
  return `${Math.round(value)}%`;
};

export const formatMoneyInt = (value: number) => {
  return `$${Math.round(value).toLocaleString("en-US")}`;
};
