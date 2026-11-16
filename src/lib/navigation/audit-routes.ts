import { createLoader, parseAsString } from "nuqs/server";
import { parseAsPage, parseAsUuid } from "./params";

/** `/audit-log`: the filters as the URL spells them (the audit model checks
 * `action` and `targetType`; a non-UUID admin or user id is dropped, the API
 * answers 400) and the page. */
export const loadAuditLogParams = createLoader({
  action: parseAsString,
  actorId: parseAsUuid,
  subjectUserId: parseAsUuid,
  targetType: parseAsString,
  targetId: parseAsString,
  page: parseAsPage,
});
