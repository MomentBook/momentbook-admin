import type { Metadata } from "next";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { FlashBanner } from "@/components/flash-banner";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getStoredAdminSession } from "@/lib/auth/session";
import { loadLoginParams } from "@/lib/navigation/login-routes";
import { ADMIN_ROOT_PATH, sanitizeAdminPath } from "@/lib/navigation/paths";
import { LoginForm } from "@/features/auth/components/login-form";
import { resolveLoginNotice } from "@/features/auth/flash";

export const metadata: Metadata = {
  title: "Admin Sign In",
};

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const query = loadLoginParams(await searchParams);
  const nextPath = sanitizeAdminPath(query.next) ?? ADMIN_ROOT_PATH;
  const session = await getStoredAdminSession(await cookies());

  if (session) {
    redirect(nextPath);
  }

  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="gap-1">
          <CardTitle className="text-2xl">Sign in to MomentBook</CardTitle>
          <CardDescription>Use the admin account to continue.</CardDescription>
        </CardHeader>

        <CardContent className="flex flex-col gap-4">
          <FlashBanner flash={resolveLoginNotice(query)} />
          <LoginForm nextPath={nextPath} />
        </CardContent>
      </Card>
    </div>
  );
}
