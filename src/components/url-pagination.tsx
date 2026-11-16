import type { ReactNode } from "react";
import Link from "next/link";
import { ChevronLeftIcon, ChevronRightIcon } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Pagination, PaginationContent, PaginationItem } from "@/components/ui/pagination";
import { cn } from "@/lib/utils";

function PageLink({ href, children }: { href: string | null; children: ReactNode }) {
  const className = buttonVariants({ variant: "outline", size: "sm" });

  return href ? (
    <Link href={href} className={className}>
      {children}
    </Link>
  ) : (
    <span aria-disabled="true" className={cn(className, "pointer-events-none opacity-50")}>
      {children}
    </span>
  );
}

/** Previous and next for a list the server pages, with where the list
 * stands between them. Nothing when there is one page. `hrefFor` builds a
 * page's URL with the list's filters. */
export function UrlPagination({
  page,
  pages,
  hrefFor,
}: {
  page: number;
  pages: number;
  hrefFor: (page: number) => string;
}) {
  if (pages <= 1) {
    return null;
  }

  const previous = page > 1 ? Math.min(page - 1, pages) : null;
  const next = page < pages ? page + 1 : null;

  return (
    <Pagination>
      <PaginationContent className="w-full justify-between gap-2">
        <PaginationItem>
          <PageLink href={previous ? hrefFor(previous) : null}>
            <ChevronLeftIcon />
            Previous
          </PageLink>
        </PaginationItem>
        <PaginationItem className="text-xs text-muted-foreground">
          Page {page} of {pages}
        </PaginationItem>
        <PaginationItem>
          <PageLink href={next ? hrefFor(next) : null}>
            Next
            <ChevronRightIcon />
          </PageLink>
        </PaginationItem>
      </PaginationContent>
    </Pagination>
  );
}
