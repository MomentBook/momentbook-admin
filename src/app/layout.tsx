import type { Metadata } from "next";
import "./globals.css";
import { AdminRootDocument } from "@/components/layout/admin-root-document";
import { resolveSiteUrlObject } from "@/lib/navigation/site-url";

export const metadata: Metadata = {
  metadataBase: resolveSiteUrlObject(),
  title: {
    default: "MomentBook Admin",
    template: "%s | MomentBook Admin",
  },
  robots: { index: false, follow: false },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AdminRootDocument>{children}</AdminRootDocument>;
}
