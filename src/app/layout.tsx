import type { Metadata } from "next";
import { AnalyticsBootstrap } from "@/components/ViewTracker";
import "./globals.css";

export const metadata: Metadata = {
  title: "העסק שלך | אתר הדגמה",
  description:
    "אתר דמו יוקרתי לעסק שלך — עיצוב, תוכן ומיתוג שנבנו בהתאמה אישית. הופק אוטומטית על ידי הסוכנות.",
  robots: { index: false, follow: false },
  icons: {
    icon: [{ url: "/favicon.svg", type: "image/svg+xml" }],
  },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="he" dir="rtl">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        {/* Premium editorial stack: ultra-thin high-contrast serifs for
            headlines (Cormorant Garamond, Frank Ruhl Libre), a razored Hebrew
            sans for body copy (Assistant), a geometric display face for
            numerals/marks (Space Grotesk) and a single bold Hebrew display
            (Secular One). No blocky 800/900 faces — light weights only. */}
        <link
          href="https://fonts.googleapis.com/css2?family=Assistant:wght@200;300;400;600&family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;0,600;1,300;1,400&family=Frank+Ruhl+Libre:wght@200;300;400;500;600&family=Heebo:wght@200;300;400;500;600&family=Secular+One&family=Space+Grotesk:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="antialiased">
        {children}
        {/* PostHog is initialized on every route, including /checkout. */}
        <AnalyticsBootstrap />
      </body>
    </html>
  );
}
