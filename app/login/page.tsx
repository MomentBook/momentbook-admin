import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Card } from "@astryxdesign/core/Card";
import { Center } from "@astryxdesign/core/Center";
import { VStack } from "@astryxdesign/core/VStack";
import { Heading } from "@astryxdesign/core/Heading";
import { Text } from "@astryxdesign/core/Text";
import { Banner } from "@astryxdesign/core/Banner";
import { buildNoIndexRobots } from "@/lib/seo/public-metadata";
import {
  ADMIN_ROOT_PATH,
  sanitizeAdminPath,
} from "@/lib/admin/paths";
import { getAdminSession } from "@/lib/admin/session";
import { ADMIN_ALLOWED_EMAIL } from "@/lib/admin/config";
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
): { status: "error" | "success"; message: string } | null {
  if (loggedOut) {
    return { status: "success", message: "Signed out." };
  }

  switch (error) {
    case "missing_fields":
      return { status: "error", message: "Enter email and password." };
    case "invalid_credentials":
      return { status: "error", message: "Invalid password." };
    case "admin_only":
      return { status: "error", message: `Only ${ADMIN_ALLOWED_EMAIL} can sign in.` };
    case "admin_access_denied":
      return { status: "error", message: "This account no longer has admin access." };
    case "session_expired":
      return { status: "error", message: "Session expired. Sign in again." };
    case "service_unavailable":
      return { status: "error", message: "Service unavailable." };
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
    <Center height="100vh">
      <Card maxWidth="32rem" padding={4}>
        <VStack gap={4}>
          <VStack gap={1}>
            <Heading level={1}>Sign in to MomentBook</Heading>
            <Text type="body" color="secondary">
              Use the admin account to continue.
            </Text>
          </VStack>

          {notice ? (
            <Banner
              status={notice.status}
              title={notice.message}
            />
          ) : null}

          <AdminLoginForm
            nextPath={nextPath}
            allowedEmail={ADMIN_ALLOWED_EMAIL}
          />
        </VStack>
      </Card>
    </Center>
  );
}
