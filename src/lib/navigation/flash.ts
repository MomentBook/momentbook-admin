/** The banner a page shows for the `mutation` or `error` an action left in
 * its URL. */
export type FlashTone = "default" | "error" | "success";
export type Flash = { tone: FlashTone; message: string };

export type FlashQuery = {
  mutation?: string | null;
  error?: string | null;
  message?: string | null;
};

/** A banner's copy: its sentence, or a function of the whole query that
 * returns the sentence, a banner of another tone, or `null` for none. */
export type FlashCopy<Q> = string | ((query: Q) => string | Flash | null);

export type FlashMessages<Q> = {
  /** By `mutation` value; a sentence is a success banner. */
  mutations?: Readonly<Record<string, FlashCopy<Q>>>;
  /** By `error` value; a sentence is an error banner. */
  errors?: Readonly<Record<string, FlashCopy<Q>>>;
};

function pick<Q>(
  query: Q,
  code: string | null | undefined,
  table: Readonly<Record<string, FlashCopy<Q>>> | undefined,
  tone: FlashTone,
): Flash | null {
  if (!code || !table || !Object.hasOwn(table, code)) {
    return null;
  }

  const copy = table[code];
  const value = typeof copy === "function" ? copy(query) : copy;

  if (!value) {
    return null;
  }

  return typeof value === "string" ? { tone, message: value } : value;
}

/** The mutation's banner, else the error's, else `null`. The table decides
 * which query keys its copy may read. */
export function resolveFlash<Q extends FlashQuery>(
  query: NoInfer<Q>,
  messages: FlashMessages<Q>,
): Flash | null {
  return (
    pick(query, query.mutation, messages.mutations, "success") ??
    pick(query, query.error, messages.errors, "error")
  );
}
