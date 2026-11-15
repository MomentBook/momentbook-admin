import { defaultLanguage, toLocaleTag } from "@/lib/i18n";

const COUNT_FORMATTER = new Intl.NumberFormat(toLocaleTag(defaultLanguage));

/** A count with its thousands grouped: 1,234,567. */
export function formatCount(value: number): string {
  return COUNT_FORMATTER.format(value);
}
