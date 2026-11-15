"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

/**
 * A workspace page that threw something other than an API error (those render
 * inside the shell). `retry` fetches the page again; the digest matches the
 * server log.
 */
export default function WorkspaceErrorBoundary({
  error,
  retry,
}: {
  error: unknown;
  retry: () => void;
}) {
  const digest =
    error instanceof Error && "digest" in error && typeof error.digest === "string"
      ? error.digest
      : null;

  return (
    <div
      role="alert"
      className="mx-auto flex min-h-svh max-w-md flex-col items-center justify-center gap-3 p-6 text-center"
    >
      <h1 className="text-base font-medium">Something went wrong.</h1>
      <p className="text-sm text-muted-foreground">
        This page could not be shown. Try again, or go back to the attention list.
      </p>
      {digest ? <p className="text-xs text-muted-foreground">Reference {digest}</p> : null}
      <div className="flex gap-2 pt-2">
        <Button type="button" onClick={() => retry()}>
          Try again
        </Button>
        <Button variant="outline" asChild>
          <Link href="/">Attention</Link>
        </Button>
      </div>
    </div>
  );
}
