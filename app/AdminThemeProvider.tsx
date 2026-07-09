"use client";

import { Theme } from "@astryxdesign/core";
import { momentbookTheme } from "@/lib/theme/momentbook-theme";

/**
 * Client-side theme provider that wraps the app in an Astryx <Theme>.
 *
 * Uses runtime style injection (defineTheme source import).
 * For production SSR builds, switch to the /built subpath after running
 * `npx astryx theme build lib/theme/momentbook-theme.ts`.
 */
export function AdminThemeProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return <Theme theme={momentbookTheme}>{children}</Theme>;
}
