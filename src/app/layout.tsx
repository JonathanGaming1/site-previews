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
        {/* Editorial weights only — no ultra-thick blocky faces (900/800) */}
        <link
          href="https://fonts.googleapis.com/css2?family=Frank+Ruhl+Libre:wght@300;400;500&family=Heebo:wght@300;400;500;700&display=swap"
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
