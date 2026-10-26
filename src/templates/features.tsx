"use client";

import React from "react";
import { motion } from "framer-motion";
import { Compass, MapPin, Wrench } from "lucide-react";
import { useSite } from "@/components/SiteProvider";
import type { LuxTheme } from "@/lib/luxtheme";
import type { TimelineStep } from "@/types/site";

/* ------------------------------------------------------------------ */
/* Availability badge — live "open for projects" chip                  */
/* ------------------------------------------------------------------ */

export function AvailabilityBadge({ theme }: { theme: LuxTheme }) {
  const { data } = useSite();
  const city = data.businessInfo.address.split(",")[0]?.trim() || "העיר שלך";
  return (
    <span
      className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-bold backdrop-blur"
      style={{
        border: `1px solid ${theme.accent}55`,
        background: `${theme.accent}14`,
        color: theme.accent,
      }}
    >
      <span className="relative flex h-2.5 w-2.5">
        <span
          className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-60"
          style={{ background: theme.accent }}
        />
        <span className="relative inline-flex h-2.5 w-2.5 rounded-full" style={{ background: theme.accent }} />
      </span>
      <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
      זמינות לקבלת פרויקטים חדשים ב{city}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* Animated process timeline (illuminates on scroll)                   */
/* ------------------------------------------------------------------ */

export function ProcessTimeline({ theme, steps }: { theme: LuxTheme; steps?: TimelineStep[] }) {
  const { data } = useSite();
  const timeline =
    steps ??
    data.processTimeline ?? [
      { title: "שיחת היכרות", description: "שיחה קצרה שבה אנחנו מקשיבים לחזון שלך — בלי התחייבות." },
      { title: "מדידה ותכנון", description: "מדידה מקצועית בבית שלך, תוכנית מדויקת והצעת מחיר שקופה." },
      { title: "ייצור בסטודיו", description: "עבודה בהתאמה אישית, עם עדכוני התקדמות שוטפים." },
      { title: "התקנה וליווי", description: "התקנה נקייה, קבלה מלאה ואחריות ארוכת טווח." },
    ];

  return (
    <section>
      <div className="mb-9 flex items-center justify-center gap-3">
        <span
          className="flex h-11 w-11 items-center justify-center rounded-2xl"
          style={{ background: `${theme.accent}1f`, color: theme.accent }}
        >
          <Compass className="h-5 w-5" aria-hidden="true" />
        </span>
        <h3 className="text-xl font-bold md:text-2xl" style={{ color: theme.headline }}>
          איך עובדים איתנו
        </h3>
      </div>

      <ol className="relative mx-auto max-w-2xl">
        {timeline.map((step, i) => (
          <motion.li
            key={i}
            initial={{ opacity: 0.25 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6 }}
            className="relative flex items-start gap-5 pb-10 last:pb-0"
          >
            {i < timeline.length - 1 && (
              <span
                className="absolute right-[18px] top-12 h-[calc(100%-2.5rem)] w-[2px]"
                style={{ background: `linear-gradient(to bottom, ${theme.accent}88, ${theme.accent}22)` }}
                aria-hidden="true"
              />
            )}
            <span
              className="relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full font-bold shadow-lg"
              style={{
                background: `${theme.accent}1f`,
                border: `1px solid ${theme.accent}`,
                color: theme.accent,
              }}
            >
              <Wrench className="h-4 w-4" aria-hidden="true" />
            </span>
            <div>
              <h4 className="text-lg font-bold" style={{ color: theme.headline }}>
                פרק {i + 1} — {step.title}
              </h4>
              <p className="mt-1 text-sm leading-relaxed" style={{ color: theme.muted }}>
                {step.description}
              </p>
            </div>
          </motion.li>
        ))}
      </ol>
    </section>
  );
}
