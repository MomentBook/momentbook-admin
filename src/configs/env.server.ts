function parseBooleanEnv(value: string | undefined): boolean {
    if (!value) {
        return false;
    }

    const normalized = value.trim().toLowerCase();
    return normalized === "true" || normalized === "1" || normalized === "yes";
}


export const ENV = {
    APP_ENV: process.env.NEXT_PUBLIC_APP_ENV as "production" | "development",
    APP_IS_LOCAL: parseBooleanEnv(process.env.NEXT_PUBLIC_APP_IS_LOCAL),
    ADMIN_SITE_URL: process.env.NEXT_PUBLIC_ADMIN_SITE_URL as string,
    API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL as string,
    PUBLIC_IMAGE_ORIGIN: process.env.NEXT_PUBLIC_PUBLIC_IMAGE_ORIGIN as string,
    ADMIN_ALLOWED_EMAIL: process.env.ADMIN_ALLOWED_EMAIL as string,
    ADMIN_SESSION_SECRET: process.env.ADMIN_SESSION_SECRET as string,
} as const;
