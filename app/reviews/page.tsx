import { redirect } from "next/navigation";
import {
  buildAdminWorkspaceHref,
} from "@/lib/admin/paths";

function readQueryParam(value: string | string[] | undefined): string | null {
  if (typeof value === "string") {
    return value;
  }

  if (Array.isArray(value) && value.length > 0) {
    return value[0] ?? null;
  }

  return null;
}

export default async function AdminReviewsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const resolvedSearchParams = await searchParams;
  redirect(
    buildAdminWorkspaceHref("reviews", {
      page: readQueryParam(resolvedSearchParams.page),
      status: readQueryParam(resolvedSearchParams.status),
      targetPublicId: readQueryParam(resolvedSearchParams.targetPublicId),
      mutation: readQueryParam(resolvedSearchParams.mutation),
      reviewStatus: readQueryParam(resolvedSearchParams.reviewStatus),
      error: readQueryParam(resolvedSearchParams.error),
    }),
  );
}
