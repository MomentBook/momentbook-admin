import type { NextConfig } from "next";

function parseBooleanEnv(value: string | undefined): boolean {
  if (!value) {
    return false;
  }

  const normalized = value.trim().toLowerCase();
  return normalized === "true" || normalized === "1" || normalized === "yes";
}

function shouldRequireHttpsOrigins(): boolean {
  if (process.env.NODE_ENV !== "production") {
    return false;
  }

  return !parseBooleanEnv(process.env.NEXT_PUBLIC_APP_IS_LOCAL);
}

function readOrigin(value: string | undefined): string | null {
  if (!value) {
    return null;
  }

  try {
    const parsed = new URL(value.trim());

    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return null;
    }

    if (shouldRequireHttpsOrigins() && parsed.protocol !== "https:") {
      return null;
    }

    return parsed.origin;
  } catch {
    return null;
  }
}

function buildConnectSrc(): string[] {
  const values = ["'self'"];
  const apiOrigin = readOrigin(process.env.NEXT_PUBLIC_API_BASE_URL);

  if (apiOrigin) {
    values.push(apiOrigin);
  }

  if (process.env.NODE_ENV !== "production") {
    values.push("http://localhost:3001", "http://127.0.0.1:3001");
  }

  return values;
}

function buildImgSrc(): string[] {
  const values = ["'self'", "data:", "blob:", "https:"];

  if (process.env.NODE_ENV !== "production") {
    values.push("http://localhost:3001", "http://127.0.0.1:3001");
  }

  return values;
}

if (
  shouldRequireHttpsOrigins() &&
  !readOrigin(process.env.NEXT_PUBLIC_ADMIN_SITE_URL)
) {
  throw new Error(
    "NEXT_PUBLIC_ADMIN_SITE_URL must resolve to an absolute https URL in production.",
  );
}

const nextConfig: NextConfig = {
  poweredByHeader: false,
  images: {
    unoptimized: true,
  },
  async headers() {
    const csp = [
      "default-src 'self'",
      `connect-src ${buildConnectSrc().join(" ")}`,
      `img-src ${buildImgSrc().join(" ")}`,
      "font-src 'self' data:",
      "style-src 'self' 'unsafe-inline'",
      "script-src 'self' 'unsafe-inline'",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
    ].join("; ");

    return [
      {
        source: "/:path*",
        headers: [
          {
            key: "Content-Security-Policy",
            value: csp,
          },
          {
            key: "Referrer-Policy",
            value: "strict-origin-when-cross-origin",
          },
          {
            key: "X-Content-Type-Options",
            value: "nosniff",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
