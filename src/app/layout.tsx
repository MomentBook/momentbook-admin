import type { Metadata } from "next";
import { Manrope, Playfair_Display } from "next/font/google";
import { ThemeProvider } from "next-themes";
import "./globals.css";
import { defaultLanguage, toLocaleTag } from "@/lib/i18n";
import { resolveSiteUrlObject } from "@/lib/navigation/site-url";

const manrope = Manrope({
  variable: "--font-rounded",
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
});

const playfairDisplay = Playfair_Display({
  variable: "--font-editorial",
  subsets: ["latin", "latin-ext"],
  style: ["normal", "italic"],
  weight: ["500", "600", "700", "800"],
  display: "swap",
});

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
  // next-themes sets the class before the first paint; the operator's OS
  // setting picks light or dark.
  return (
    <html lang={toLocaleTag(defaultLanguage)} suppressHydrationWarning>
      <body className={`${manrope.variable} ${playfairDisplay.variable}`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
