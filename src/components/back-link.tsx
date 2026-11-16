import Link from "next/link";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
} from "@/components/ui/breadcrumb";
import { ChevronLeftIcon } from "lucide-react";

/** The way back from a detail page to the list it was opened from, with
 * that list's filters in `href`. */
export function BackLink({ href, label }: { href: string; label: string }) {
  return (
    <Breadcrumb>
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <Link href={href} className="inline-flex items-center gap-1">
              <ChevronLeftIcon className="size-4" />
              {label}
            </Link>
          </BreadcrumbLink>
        </BreadcrumbItem>
      </BreadcrumbList>
    </Breadcrumb>
  );
}
