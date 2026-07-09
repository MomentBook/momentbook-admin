import { defineTheme } from "@astryxdesign/core/theme";
import { neutralTheme } from "@astryxdesign/theme-neutral";

/**
 * MomentBook Admin custom theme.
 *
 * Extends the neutral theme with MomentBook brand colours. The neutral theme
 * provides all foundational tokens (spacing, radius, typography, base colours);
 * we override only the brand accent, status colours, and admin surface tokens.
 *
 * Light mode: warm charcoal accent on a warm-neutral background.
 * Dark mode: cyan accent on deep teal-black background.
 */
export const momentbookTheme = defineTheme({
  name: "momentbook-admin",
  extends: neutralTheme,
  tokens: {
    // --- Brand accent (primary interactive colour) ---
    "--color-accent": ["#5f5e62", "#66d4ec"],

    // --- Status colours (MomentBook palette) ---
    "--color-success": ["#2d8e7f", "#7bd8c8"],
    "--color-warning": ["#8a7753", "#d7c49b"],
    "--color-error": ["#a35e66", "#e0a8af"],

    // --- Admin surface tokens (glass aesthetic) ---
    "--color-background-body": [
      "#fcfcfb",
      "#0e1b21",
    ],
    "--color-background-surface": [
      "rgba(255, 255, 255, 0.88)",
      "rgba(26, 38, 46, 0.62)",
    ],
    "--color-background-muted": [
      "rgba(248, 249, 249, 0.94)",
      "rgba(20, 32, 39, 0.8)",
    ],

    // --- Border tokens (glass edge) ---
    "--color-border": [
      "rgba(175, 182, 186, 0.54)",
      "rgba(109, 150, 152, 0.44)",
    ],
  },
});
