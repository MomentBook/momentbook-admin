import type { ReactNode } from "react";
import { Alert, AlertTitle } from "@/components/ui/alert";
import type { Flash } from "@/lib/navigation/flash";

/** The banner an action leaves on the page it returns to. A success and a
 * notice look the same; an error is destructive. `action` sits beside the
 * sentence (Undo after a review decision). */
export function FlashBanner({ flash, action }: { flash: Flash | null; action?: ReactNode }) {
  if (!flash) {
    return null;
  }

  const title = <AlertTitle className="line-clamp-none">{flash.message}</AlertTitle>;

  return (
    <Alert variant={flash.tone === "error" ? "destructive" : "default"}>
      {action ? (
        <div className="col-start-2 flex flex-wrap items-center justify-between gap-3">
          {title}
          {action}
        </div>
      ) : (
        title
      )}
    </Alert>
  );
}
