import { createLoader, parseAsString } from "nuqs/server";
import { flashParams, parseAsPage } from "./params";

/** `/users`: the search and filters as the URL spells them (the page checks
 * them with the user model, so it can say when a search was ignored), the
 * page, and `error=user_not_found` from an action on a user that is gone. */
export const loadUsersParams = createLoader({
  q: parseAsString,
  status: parseAsString,
  role: parseAsString,
  page: parseAsPage,
  ...flashParams,
});

/** `/users/<userId>`: the banner an action on the account left. */
export const loadUserDetailParams = createLoader({
  ...flashParams,
  revokedSessions: parseAsString,
  userStatus: parseAsString,
});
