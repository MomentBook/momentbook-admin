import Link from "next/link";
import { Button } from "@/components/ui/button";

/** Any URL the admin has no page for. */
export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-svh max-w-md flex-col items-center justify-center gap-3 p-6 text-center">
      <h1 className="text-base font-medium">Page not found.</h1>
      <p className="text-sm text-muted-foreground">There is no admin page at this address.</p>
      <Button variant="outline" asChild>
        <Link href="/">Attention</Link>
      </Button>
    </div>
  );
}
