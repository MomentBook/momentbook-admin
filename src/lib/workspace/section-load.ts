import "server-only";

import { isBackendApiError } from "@/lib/api/client";

/**
 * Loads a secondary page section: a failing endpoint gives `null`, so the
 * section can say "Could not load" instead of taking the page down. 401/403
 * still reject, so they reach the page's session handling.
 */
export async function orNull<T>(promise: Promise<T>): Promise<T | null> {
  try {
    return await promise;
  } catch (error) {
    if (isBackendApiError(error) && (error.statusCode === 401 || error.statusCode === 403)) {
      throw error;
    }

    return null;
  }
}
