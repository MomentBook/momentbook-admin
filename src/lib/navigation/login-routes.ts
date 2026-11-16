import { createLoader, parseAsString } from "nuqs/server";

/** `/login`: where to go once signed in (checked by `sanitizeAdminPath`),
 * and why the last session ended or that it was signed out. */
export const loadLoginParams = createLoader({
  next: parseAsString,
  error: parseAsString,
  loggedOut: parseAsString,
});
