import Script from "next/script";
import { Manrope, Playfair_Display } from "next/font/google";
import { defaultLanguage, toLocaleTag } from "@/lib/i18n/config";
import { AdminThemeProvider } from "@/app/AdminThemeProvider";

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

export function AdminRootDocument({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang={toLocaleTag(defaultLanguage)} suppressHydrationWarning>
      <head>
        <Script id="theme-script" strategy="beforeInteractive">
          {`
            (function() {
              const stored = localStorage.getItem('theme');
              let themeValue = stored;
              if (stored) {
                try {
                  themeValue = JSON.parse(stored);
                } catch (error) {
                  themeValue = stored;
                }
              }
              const theme = (themeValue === 'light' || themeValue === 'dark') ? themeValue : 'light';
              document.documentElement.setAttribute('data-theme', theme);
            })();
          `}
        </Script>
      </head>
      <body className={`${manrope.variable} ${playfairDisplay.variable}`}>
        <AdminThemeProvider>{children}</AdminThemeProvider>
      </body>
    </html>
  );
}
