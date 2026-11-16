import { defaultLanguage, toLocaleTag } from "@/lib/i18n";

const COUNT_FORMATTER = new Intl.NumberFormat(toLocaleTag(defaultLanguage));
const PERCENT_FORMATTER = new Intl.NumberFormat(toLocaleTag(defaultLanguage), {
  style: "percent",
  maximumFractionDigits: 1,
});

/** A count with its thousands grouped: 1,234,567. */
export function formatCount(value: number): string {
  return COUNT_FORMATTER.format(value);
}

/** `part` of `whole` as a percentage; a dash when there is nothing to divide by. */
export function formatRate(part: number, whole: number): string {
  return whole > 0 ? PERCENT_FORMATTER.format(part / whole) : "—";
}
