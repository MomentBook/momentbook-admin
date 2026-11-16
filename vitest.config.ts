import { fileURLToPath } from "node:url";
import { defineConfig } from "vitest/config";

export default defineConfig({
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src/", import.meta.url)),
      "server-only": fileURLToPath(
        new URL("./scripts/__tests__/helpers/empty-module.ts", import.meta.url),
      ),
    },
  },
  test: {
    environment: "node",
    // Tests run without the real environment; src/lib/env.ts is checked by
    // its own test, which turns validation back on.
    env: { SKIP_ENV_VALIDATION: "true" },
  },
});
