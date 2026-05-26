// Number- & Currency-Formatter — DE-Locale
const eur = new Intl.NumberFormat("de-DE", {
  style: "currency",
  currency: "EUR",
  maximumFractionDigits: 0,
});
const num = new Intl.NumberFormat("de-DE", { maximumFractionDigits: 1 });

export function formatEur(value: number | null | undefined): string {
  if (value == null || Number.isNaN(value)) return "—";
  return eur.format(value);
}

export function formatEurRange(min: number, max: number): string {
  if (min === max) return formatEur(min);
  return `${formatEur(min)} – ${formatEur(max)}`;
}

export function formatSqm(value: number | null | undefined): string {
  if (value == null) return "—";
  return `${num.format(value)} m²`;
}

export function formatSqmRange(min: number, max: number): string {
  if (min === max) return formatSqm(min);
  return `${num.format(min)} – ${num.format(max)} m²`;
}
