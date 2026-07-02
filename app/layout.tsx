import type { Metadata } from "next";
import "@/app/globals.scss";
import { AdminRootDocument } from "@/app/AdminRootDocument";
import { resolveSiteUrlObject } from "@/lib/site-url";
import { buildNoIndexRobots } from "@/lib/seo/public-metadata";

export const metadata: Metadata = {
  metadataBase: resolveSiteUrlObject(),
  title: {
    default: "MomentBook Admin",
    template: "%s | MomentBook Admin",
  },
  robots: buildNoIndexRobots(),
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <AdminRootDocument>{children}</AdminRootDocument>;
}
