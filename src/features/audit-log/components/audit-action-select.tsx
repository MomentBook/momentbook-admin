"use client";

import { useRouter } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

/** No action filter; a Select item cannot have an empty value. */
const ALL = "all";

export type AuditActionOption = { value: string; label: string; href: string };

/** The action filter. Each choice opens its own URL, built on the server
 * with the other filters kept, so the query is spelled as the links are. */
export function AuditActionSelect({
  value,
  allHref,
  options,
}: {
  value: string | undefined;
  /** The list without an action filter. */
  allHref: string;
  options: AuditActionOption[];
}) {
  const router = useRouter();
  const hrefs = new Map(options.map((option) => [option.value, option.href]));

  return (
    <Select
      value={value ?? ALL}
      onValueChange={(next) => router.push(next === ALL ? allHref : (hrefs.get(next) ?? allHref))}
    >
      <SelectTrigger aria-label="Action" className="min-w-56">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value={ALL}>All actions</SelectItem>
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
