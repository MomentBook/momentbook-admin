import { type Language, toLocaleTag } from "@/lib/i18n/config";

type NextFetchInit = RequestInit & {
    next?: {
        revalidate?: number;
    };
};

const LOCAL_HOSTS = new Set(["127.0.0.1", "localhost"]);

function isLocalHost(hostname: string): boolean {
    return LOCAL_HOSTS.has(hostname.toLowerCase());
}

function parseBooleanEnv(value: string | undefined): boolean {
    if (!value) {
        return false;
    }

    const normalized = value.trim().toLowerCase();
    return normalized === "true" || normalized === "1" || normalized === "yes";
}

function normalizeBaseUrl(value: string): string {
    return value.replace(/\/+$/, "");
}

function shouldUseLocalApiFallbacks(): boolean {
    return parseBooleanEnv(process.env.NEXT_PUBLIC_APP_IS_LOCAL);
}

function readSiteHostname(): string | null {
    const siteUrl = process.env.NEXT_PUBLIC_ADMIN_SITE_URL;

    if (!siteUrl) {
        return null;
    }

    try {
        return new URL(siteUrl).hostname;
    } catch {
        return null;
    }
}

export function appendPublicApiLanguage(
    params: URLSearchParams,
    lang?: Language,
): void {
    if (!lang) {
        return;
    }

    params.set("lang", toLocaleTag(lang));
}

export function getPublicApiBaseCandidates(): string[] {
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL;
    if (!baseUrl) {
        return [];
    }

    const normalized = normalizeBaseUrl(baseUrl.trim());
    if (!normalized) {
        return [];
    }

    const candidates: string[] = [normalized];

    if (!shouldUseLocalApiFallbacks()) {
        return candidates;
    }

    try {
        const parsed = new URL(normalized);
        const siteHostname = readSiteHostname();

        if (!isLocalHost(parsed.hostname)) {
            const localhost = new URL(parsed.toString());
            localhost.hostname = "127.0.0.1";
            candidates.push(normalizeBaseUrl(localhost.toString()));
        }

        if (siteHostname && !isLocalHost(siteHostname) && parsed.hostname !== siteHostname) {
            const siteHostUrl = new URL(parsed.toString());
            siteHostUrl.hostname = siteHostname;
            candidates.push(normalizeBaseUrl(siteHostUrl.toString()));
        }
    } catch {
        return [normalized];
    }

    return [...new Set(candidates)];
}

async function fetchWithRetry(
    url: string,
    init: NextFetchInit,
    attempts: number,
): Promise<Response | null> {
    for (let attempt = 1; attempt <= attempts; attempt += 1) {
        try {
            const response = await fetch(url, init);

            if (response.status >= 500 && attempt < attempts) {
                continue;
            }

            return response;
        } catch {
            if (attempt === attempts) {
                return null;
            }
        }
    }

    return null;
}

export async function fetchPublicApi(
    path: string,
    init: NextFetchInit,
    options?: {
        attemptsPerBase?: number;
    },
): Promise<Response | null> {
    const bases = getPublicApiBaseCandidates();
    if (bases.length === 0) {
        return null;
    }

    const attemptsPerBase = Math.max(
        1,
        options?.attemptsPerBase ?? (shouldUseLocalApiFallbacks() ? 2 : 1),
    );

    for (const base of bases) {
        const response = await fetchWithRetry(
            `${base}${path}`,
            init,
            attemptsPerBase,
        );

        if (response) {
            return response;
        }
    }

    return null;
}
