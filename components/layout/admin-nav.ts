import {
  ChartColumn,
  ClipboardCheck,
  FileText,
  Flag,
  Inbox,
  MessageSquare,
  ScrollText,
  Users,
  type LucideIcon,
} from "lucide-react";

export type AdminNavKey =
  | "attention"
  | "reviews"
  | "reports"
  | "comments"
  | "users"
  | "articles"
  | "metrics"
  | "audit";

export const ADMIN_NAV_ITEMS: ReadonlyArray<{
  key: AdminNavKey;
  label: string;
  href: string;
  icon: LucideIcon;
}> = [
  { key: "attention", label: "Attention", href: "/", icon: Inbox },
  { key: "reviews", label: "Reviews", href: "/reviews", icon: ClipboardCheck },
  { key: "reports", label: "Reports", href: "/reports", icon: Flag },
  { key: "comments", label: "Comments", href: "/comments", icon: MessageSquare },
  { key: "users", label: "Users", href: "/users", icon: Users },
  { key: "articles", label: "Articles", href: "/articles", icon: FileText },
  { key: "metrics", label: "Metrics", href: "/metrics", icon: ChartColumn },
  { key: "audit", label: "Audit log", href: "/audit-log", icon: ScrollText },
];
