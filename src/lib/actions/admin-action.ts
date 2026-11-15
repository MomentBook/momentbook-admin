import "server-only";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { isBackendApiError } from "@/lib/api/client";
import { clearAdminSession, requireAdminActionSession } from "@/lib/auth/session";
import type { AdminSession } from "@/lib/auth/session-schema";
import { buildAdminLoginHref, sanitizeAdminPath, withAdminQuery } from "@/lib/navigation/paths";

/** Query entries set on the page an action lands on. An empty value removes
 * the key, so a banner from an earlier action does not linger. */
export type QueryEntries = Record<string, string | null | undefined>;

/** Where an action sends the admin. */
export type ActionOutcome = {
  /** The page to land on; the form's return path when left out. */
  path?: string;
  query: QueryEntries;
};

/** An API refusal, as `isBackendApiError` reads it. */
export type ApiRefusal = { message: string; statusCode: number; errorCode?: string };

export type AdminActionOptions<I> = {
  formData: FormData;
  /** The form field naming the page to return to. Default: `returnTo`. */
  returnField?: string;
  /** The page to return to when that field is missing or not an admin path. */
  fallbackPath: string;
  /** Reads the form before the session is asked for. A failed read returns
   * with `error=<code>`: the first issue's message when it is an error code
   * (`snake_case`), `invalid_input` otherwise. */
  fields: z.ZodType<I>;
  /** Banner messages some input error codes carry. */
  inputMessages?: Readonly<Record<string, string>>;
  /** The query for a failed read, in place of `error=<code>`: for forms whose
   * checks speak in sentences. */
  onInvalid?: (error: z.ZodError) => QueryEntries;
  /** The query keys every outcome owns, in the order the URL lists them; a key
   * an outcome does not set is removed. Default: `mutation`, `error`,
   * `message`. */
  baseQuery?: (formData: FormData) => QueryEntries;
  /** The request. It returns where to land and must not redirect itself: the
   * runner catches what it throws. */
  run: (input: I, session: AdminSession) => Promise<ActionOutcome>;
  /** The error code of a failed request. */
  failure: string;
  /** What a 403 means. `sign-out` (default): this admin lost access, so the
   * session ends. `banner`: the API refused the target (the users endpoints,
   * ADR 0011), which shows like any other refusal. */
  onAccessDenied?: "sign-out" | "banner";
  /** A refusal's own outcome (a 404, an `errorCode`); `undefined` leaves it to
   * the failure banner. A 401, and a 403 that signs out, never get here. */
  onApiError?: (error: ApiRefusal, input: I) => ActionOutcome | undefined;
  /** Whether the failure banner carries the API's message. Default: true. */
  showApiMessage?: boolean;
};

const DEFAULT_BASE_QUERY: QueryEntries = { mutation: null, error: null, message: null };
const ERROR_CODE = /^[a-z][a-z0-9_]*$/;

/** A form field's trimmed text; "" when it is missing or a file. */
export function readFormText(formData: FormData, name: string): string {
  const value = formData.get(name);
  return typeof value === "string" ? value.trim() : "";
}

/** A text field as the actions read it: trimmed, "" when missing. */
export const formText = z
  .string()
  .optional()
  .transform((value) => value?.trim() ?? "");

/** A trimmed text field, `undefined` when blank. */
export const optionalText = formText.transform((value) => value || undefined);

/** A trimmed text field that must not be blank; a blank one fails with `code`. */
export function requiredText(code: string) {
  return formText.pipe(z.string().min(1, code));
}

/** Each field's first text value, as `FormData.get` reads it; files are left
 * out, so they read as missing. */
function readFormFields(formData: FormData): Record<string, string> {
  const fields: Record<string, string> = {};

  for (const name of new Set(formData.keys())) {
    const value = formData.get(name);

    if (typeof value === "string") {
      fields[name] = value;
    }
  }

  return fields;
}

function readIssueCode(error: z.ZodError): string {
  const message = error.issues[0]?.message;
  return message && ERROR_CODE.test(message) ? message : "invalid_input";
}

/** `{ error, message }`, with `message` only when there is one: an action
 * whose query has no message key keeps whatever the page already carried. */
function failureQuery(error: string, message: string | null | undefined): QueryEntries {
  return message ? { error, message } : { error };
}

/**
 * Runs a form's server action and redirects. Every action ends here: it
 * reads the form, asks for the session (refreshing it on the spot), runs the
 * request and lands on the return path with a mutation or an error in the
 * query. A 401 ends the session and goes to login, and so does a 403 unless
 * `onAccessDenied` is `banner`.
 */
export async function runAdminAction<I>(options: AdminActionOptions<I>): Promise<never> {
  const cookieStore = await cookies();
  const returnPath =
    sanitizeAdminPath(readFormText(options.formData, options.returnField ?? "returnTo")) ??
    options.fallbackPath;
  const baseQuery = options.baseQuery?.(options.formData) ?? DEFAULT_BASE_QUERY;
  const land = (outcome: ActionOutcome): never =>
    redirect(withAdminQuery(outcome.path ?? returnPath, { ...baseQuery, ...outcome.query }));

  const parsed = options.fields.safeParse(readFormFields(options.formData));

  if (!parsed.success) {
    if (options.onInvalid) {
      return land({ query: options.onInvalid(parsed.error) });
    }

    const code = readIssueCode(parsed.error);
    return land({ query: failureQuery(code, options.inputMessages?.[code]) });
  }

  const input = parsed.data;
  const session = await requireAdminActionSession(cookieStore, returnPath);
  let outcome: ActionOutcome;

  try {
    outcome = await options.run(input, session);
  } catch (error) {
    if (!isBackendApiError(error)) {
      return land({ query: failureQuery(options.failure, null) });
    }

    if (error.statusCode === 401) {
      await clearAdminSession(cookieStore);
      return redirect(buildAdminLoginHref({ next: returnPath, error: "session_expired" }));
    }

    if (error.statusCode === 403 && options.onAccessDenied !== "banner") {
      await clearAdminSession(cookieStore);
      return redirect(buildAdminLoginHref({ next: returnPath, error: "admin_access_denied" }));
    }

    const mapped = options.onApiError?.(error, input);

    if (mapped) {
      return land(mapped);
    }

    const message = options.showApiMessage === false ? null : error.message;
    return land({ query: failureQuery(options.failure, message) });
  }

  return land(outcome);
}
