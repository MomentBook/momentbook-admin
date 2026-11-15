import { WorkspaceShell } from "@/components/layout/workspace-shell";
import { Skeleton } from "@/components/ui/skeleton";

const ROWS = 8;

/** Shown while a workspace page loads: the pending shell and placeholder rows. */
export default function WorkspaceLoading() {
  return (
    <WorkspaceShell>
      <div className="flex flex-col gap-4" aria-busy="true">
        <span className="sr-only" role="status">
          Loading…
        </span>
        <Skeleton className="h-7 w-48" />
        <Skeleton className="h-4 w-72" />
        <div className="flex flex-col gap-2 pt-2">
          {Array.from({ length: ROWS }, (_, index) => (
            <Skeleton key={index} className="h-10 w-full" />
          ))}
        </div>
      </div>
    </WorkspaceShell>
  );
}
