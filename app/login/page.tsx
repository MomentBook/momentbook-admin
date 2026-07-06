import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import styles from "./login.module.scss";
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
): { tone: "default" | "error" | "success"; message: string } | null {
  if (loggedOut) {
    return {
      tone: "success",
      message: "Signed out.",
    };
  }

  switch (error) {
    case "missing_fields":
      return {
        tone: "error",
        message: "Enter email and password.",
      };
    case "invalid_credentials":
      return {
        tone: "error",
        message: "Invalid password.",
      };
    case "admin_only":
      return {
        tone: "error",
        message: `Only ${ADMIN_ALLOWED_EMAIL} can sign in.`,
      };
    case "admin_access_denied":
      return {
        tone: "error",
        message: "This account no longer has admin access.",
      };
    case "session_expired":
      return {
        tone: "default",
        message: "Session expired. Sign in again.",
      };
    case "service_unavailable":
      return {
        tone: "error",
        message: "Service unavailable.",
      };
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
    <main className={styles.page}>
      <section className={styles.card}>
        <div className={styles.brand}>
          <span className={styles.eyebrow}>MomentBook Admin</span>
          <div className={styles.logoRow}>
            <span className={styles.logoMark}>M</span>
            <span className={styles.brandName}>MomentBook</span>
          </div>
        </div>

        <div className={styles.heading}>
          <h1 className={styles.title}>Sign in</h1>
          <p className={styles.body}>Use the admin account to continue.</p>
        </div>

        {notice ? (
          <p
            className={[
              styles.notice,
              notice.tone === "error"
                ? styles.noticeError
                : notice.tone === "success"
                  ? styles.noticeSuccess
                  : "",
            ].join(" ")}
          >
            {notice.message}
          </p>
        ) : null}

        <AdminLoginForm nextPath={nextPath} allowedEmail={ADMIN_ALLOWED_EMAIL} />
      </section>
    </main>
  );
}
