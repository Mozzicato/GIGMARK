export function formatMoney(amount: number, currency: string = "NGN") {
  return `${currency} ${Math.round(amount).toLocaleString()}`;
}

export function formatCompactMoney(amount: number, currency: string = "NGN") {
  if (amount >= 1_000_000) {
    return `${currency} ${(amount / 1_000_000).toFixed(amount >= 10_000_000 ? 0 : 1)}M`;
  }

  if (amount >= 1_000) {
    return `${currency} ${(amount / 1_000).toFixed(amount >= 100_000 ? 0 : 1)}K`;
  }

  return formatMoney(amount, currency);
}

export function titleCase(value: string) {
  return value
    .split(/[\s_-]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

export function formatDate(timestamp: number | null | undefined) {
  if (!timestamp) return "In progress";

  return new Intl.DateTimeFormat("en-NG", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(timestamp));
}

export function average(values: number[]) {
  if (values.length === 0) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}
