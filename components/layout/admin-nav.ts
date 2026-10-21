import { ClipboardCheck, FileText, Flag, Inbox, type LucideIcon } from "lucide-react";

export type AdminNavKey = "attention" | "reviews" | "reports" | "articles";

export const ADMIN_NAV_ITEMS: ReadonlyArray<{
  key: AdminNavKey;
  label: string;
  href: string;
  icon: LucideIcon;
}> = [
  { key: "attention", label: "Attention", href: "/", icon: Inbox },
  { key: "reviews", label: "Reviews", href: "/reviews", icon: ClipboardCheck },
  { key: "reports", label: "Reports", href: "/reports", icon: Flag },
  { key: "articles", label: "Articles", href: "/articles", icon: FileText },
];
