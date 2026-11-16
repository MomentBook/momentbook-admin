import { createLoader, parseAsString } from "nuqs/server";

/** `/metrics`: the window (`?days=`, checked by the metrics model: 7, 30 or
 * 90, else 30). */
export const loadMetricsParams = createLoader({
  days: parseAsString,
});
