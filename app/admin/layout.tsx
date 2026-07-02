import type { Metadata } from "next";
import { buildNoIndexRobots } from "@/lib/seo/public-metadata";

export const metadata: Metadata = {
  title: {
    default: "MomentBook Admin",
    template: "%s | MomentBook Admin",
  },
  robots: buildNoIndexRobots(),
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
