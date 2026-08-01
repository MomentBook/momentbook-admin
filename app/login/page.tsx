import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { buildNoIndexRobots } from "@/lib/seo/public-metadata";
import {
  ADMIN_ROOT_PATH,
  sanitizeAdminPath,
} from "@/lib/admin/paths";
import { getAdminSession } from "@/lib/admin/session";
import { AdminLoginForm } from "./AdminLoginForm";

function readQueryParam(
  value: string | string[] | undefined,
): string | null {
  if (typeof value === "string") {
    return value;
  }

  if (Array.isArray(value) && value.length > 0) {
    return value[0] ?? null;
  }

  return null;
}

function resolveLoginNotice(
  error: string | null,
  loggedOut: boolean,
): { variant: "destructive" | "default"; message: string } | null {
  if (loggedOut) {
    return { variant: "default", message: "Signed out." };
  }

  switch (error) {
    case "missing_fields":
      return { variant: "destructive", message: "Enter email and password." };
    case "invalid_credentials":
      return { variant: "destructive", message: "Invalid password." };
    case "admin_only":
      return { variant: "destructive", message: "This account is not authorized for admin access." };
    case "admin_access_denied":
      return { variant: "destructive", message: "This account no longer has admin access." };
    case "session_expired":
      return { variant: "destructive", message: "Session expired. Sign in again." };
    case "service_unavailable":
      return { variant: "destructive", message: "Service unavailable." };
    default:
      return null;
  }
}

export const metadata: Metadata = {
  title: "Admin Sign In",
  robots: buildNoIndexRobots(),
};

export default async function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const cookieStore = await cookies();
  const session = await getAdminSession(cookieStore);
  const resolvedSearchParams = await searchParams;
  const nextPath =
    sanitizeAdminPath(readQueryParam(resolvedSearchParams.next)) ??
    ADMIN_ROOT_PATH;

  if (session) {
    redirect(nextPath);
  }

  const notice = resolveLoginNotice(
    readQueryParam(resolvedSearchParams.error),
    readQueryParam(resolvedSearchParams.loggedOut) === "1",
  );

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl">Sign in to MomentBook</CardTitle>
          <CardDescription>
            Use the admin account to continue.
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          {notice ? (
            <Alert variant={notice.variant}>
              <AlertDescription>{notice.message}</AlertDescription>
            </Alert>
          ) : null}

          <AdminLoginForm nextPath={nextPath} />
        </CardContent>
      </Card>
    </div>
  );
}
