// The admin's environment, validated once when the module loads.
//
// next.config.ts imports this file, so a build with a missing or malformed
// variable fails instead of shipping. Do not add `import "server-only"`
// here: next.config.ts runs outside the React server environment, and
// createEnv already throws when client code reads a server variable.
import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export function parseBooleanEnv(value: string | undefined): boolean {
  if (!value) {
    return false;
  }

  const normalized = value.trim().toLowerCase();
  return normalized === "true" || normalized === "1" || normalized === "yes";
}

const skipValidation = parseBooleanEnv(process.env.SKIP_ENV_VALIDATION);

export const env = createEnv({
  server: {
    ADMIN_SESSION_SECRET: z.string().trim().min(1),
  },
  client: {
    NEXT_PUBLIC_ADMIN_SITE_URL: z.string().optional(),
    NEXT_PUBLIC_API_BASE_URL: z.url(),
    NEXT_PUBLIC_PUBLIC_IMAGE_ORIGIN: z.string().optional(),
    NEXT_PUBLIC_APP_ENV: z.string().optional(),
    NEXT_PUBLIC_APP_IS_LOCAL: z.string().optional(),
  },
  shared: {
    NODE_ENV: z.enum(["development", "test", "production"]).optional(),
  },
  experimental__runtimeEnv: {
    NEXT_PUBLIC_ADMIN_SITE_URL: process.env.NEXT_PUBLIC_ADMIN_SITE_URL,
    NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL,
    NEXT_PUBLIC_PUBLIC_IMAGE_ORIGIN: process.env.NEXT_PUBLIC_PUBLIC_IMAGE_ORIGIN,
    NEXT_PUBLIC_APP_ENV: process.env.NEXT_PUBLIC_APP_ENV,
    NEXT_PUBLIC_APP_IS_LOCAL: process.env.NEXT_PUBLIC_APP_IS_LOCAL,
    NODE_ENV: process.env.NODE_ENV,
  },
  emptyStringAsUndefined: true,
  skipValidation,
});

/** True on a production build that is not marked local: URLs must be https. */
export function requiresHttpsUrls(
  values: Pick<typeof env, "NODE_ENV" | "NEXT_PUBLIC_APP_IS_LOCAL">,
): boolean {
  return (
    values.NODE_ENV === "production" &&
    !parseBooleanEnv(values.NEXT_PUBLIC_APP_IS_LOCAL)
  );
}

function isHttpsUrl(value: string | undefined): boolean {
  if (!value) {
    return false;
  }

  try {
    return new URL(value.trim()).protocol === "https:";
  } catch {
    return false;
  }
}

export function assertProductionUrls(values: typeof env): void {
  if (!requiresHttpsUrls(values)) {
    return;
  }

  if (!isHttpsUrl(values.NEXT_PUBLIC_ADMIN_SITE_URL)) {
    throw new Error(
      "NEXT_PUBLIC_ADMIN_SITE_URL must resolve to an absolute https URL in production.",
    );
  }

  if (!isHttpsUrl(values.NEXT_PUBLIC_API_BASE_URL)) {
    throw new Error(
      "NEXT_PUBLIC_API_BASE_URL must resolve to an absolute https URL in production.",
    );
  }
}

if (!skipValidation) {
  assertProductionUrls(env);
}

export const ENV = {
  APP_ENV: env.NEXT_PUBLIC_APP_ENV,
  APP_IS_LOCAL: parseBooleanEnv(env.NEXT_PUBLIC_APP_IS_LOCAL),
  ADMIN_SITE_URL: env.NEXT_PUBLIC_ADMIN_SITE_URL,
  API_BASE_URL: env.NEXT_PUBLIC_API_BASE_URL,
  PUBLIC_IMAGE_ORIGIN: env.NEXT_PUBLIC_PUBLIC_IMAGE_ORIGIN,
  ADMIN_SESSION_SECRET: env.ADMIN_SESSION_SECRET,
} as const;
