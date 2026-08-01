import Script from "next/script";
import { Manrope, Playfair_Display } from "next/font/google";
import { ThemeProvider } from "next-themes";
import { defaultLanguage, toLocaleTag } from "@/lib/i18n/config";

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
              try {
                const stored = localStorage.getItem('theme');
                let theme = stored;
                if (stored) {
                  try {
                    theme = JSON.parse(stored);
                  } catch (_) {
                    // Legacy Astryx wrote JSON; next-themes writes a raw string.
                    theme = stored;
                  }
                }
                if (theme === 'dark') {
                  document.documentElement.classList.add('dark');
                } else {
                  document.documentElement.classList.remove('dark');
                }
              } catch (_) {
                document.documentElement.classList.remove('dark');
              }
            })();
          `}
        </Script>
      </head>
      <body className={`${manrope.variable} ${playfairDisplay.variable}`}>
        <ThemeProvider
          attribute="class"
          defaultTheme="light"
          enableSystem={false}
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
