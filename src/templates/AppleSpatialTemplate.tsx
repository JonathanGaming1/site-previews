"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Shield } from "lucide-react";
import { useSite } from "@/components/SiteProvider";
import { DynamicIslandNav } from "@/components/DynamicIslandNav";
import { InteractiveQuoteBuilder } from "@/components/InteractiveQuoteBuilder";
import { VipConciergeDrawer } from "@/components/VipConciergeDrawer";
import { WhatsAppFab, FaqAccordion } from "@/templates/shared";
import { MobileActionBar } from "@/templates/shared";
import { ProcessTimeline } from "@/templates/features";
import {
  BenefitsSection,
  ContactSection,
  ProjectsSection,
  ReviewsSection,
  ServicesGrid,
} from "@/templates/sections";
import { LUX_THEMES } from "@/templates/theme";

/**
 * `apple-spatial` — inspired by Apple Vision Pro & iPhone 16 Pro Titanium.
 * Frosted spatial-glass layers, brushed titanium hairline borders, a floating
 * 3D bento grid with scroll-driven scale reveals and the Dynamic Island pod.
 */
export function AppleSpatialTemplate() {
  const { data, editsFor } = useSite();
  const theme = LUX_THEMES["apple-spatial"];
  const { businessInfo: b, hero, faq } = data;
  const [scrollScale, setScrollScale] = useState(1);

  // Scroll-driven hero scale reveal (Apple-style parallax recede)
  useEffect(() => {
    const onScroll = () => {
      const p = Math.min(1, window.scrollY / (window.innerHeight * 0.9));
      setScrollScale(1 - p * 0.12);
    };
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div className="relative min-h-screen pb-28 md:pb-10" style={{ background: theme.pageBg, color: theme.text }}>
      {/* Ambient spatial depth field */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-0"
        style={{
          background:
            "radial-gradient(70% 50% at 50% -10%, rgba(64,110,245,0.16), transparent 60%), radial-gradient(50% 40% at 85% 20%, rgba(255,255,255,0.05), transparent 60%), radial-gradient(40% 40% at 10% 60%, rgba(100,220,255,0.07), transparent 60%)",
        }}
      />

      <DynamicIslandNav theme={theme} />

      {/* ---------- Hero — frosted spatial-glass slab ---------- */}
      <header className="relative z-10 flex min-h-[96vh] flex-col items-center justify-center px-6 pt-28">
        <motion.div
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-4xl rounded-[2.5rem] px-6 py-14 text-center backdrop-blur-3xl md:px-14"
          style={{ scale: scrollScale }}
        >
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 rounded-[2.5rem]"
            style={{
              background:
                "linear-gradient(135deg, rgba(255,255,255,0.10), rgba(255,255,255,0.02) 55%)",
              border: "1px solid rgba(255,255,255,0.14)",
              boxShadow:
                "inset 0 1px 0 rgba(255,255,255,0.22), inset 0 -1px 0 rgba(255,255,255,0.05), 0 40px 90px rgba(0,0,0,0.5)",
            }}
          />
          <div className="relative z-10">
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mb-5 inline-block rounded-full border px-4 py-1.5 text-xs font-semibold tracking-wide"
              style={{ borderColor: theme.border, color: theme.muted, background: "rgba(255,255,255,0.05)" }}
            >
              {b.category} • {b.address}
            </motion.p>
            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
              className="mx-auto max-w-3xl text-4xl font-bold leading-[1.1] tracking-tight md:text-6xl"
              style={{ color: theme.headline }}
              {...editsFor("hero.headline")}
            >
              {hero.headline}
            </motion.h1>
            <motion.p
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.9, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
              className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed md:text-xl"
              style={{ color: theme.muted }}
              {...editsFor("hero.subheadline")}
            >
              {hero.subheadline}
            </motion.p>
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.8 }}
              className="mt-10 flex flex-wrap items-center justify-center gap-4"
            >
              <motion.a
                href={`https://wa.me/${b.whatsapp}`}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.97 }}
                className="rounded-full px-9 py-4 text-base font-semibold shadow-2xl"
                style={{
                  background: theme.accent,
                  color: "#ffffff",
                  boxShadow: `0 12px 40px rgba(0,113,227,0.45)`,
                }}
              >
                {hero.ctaText}
              </motion.a>
              <a
                href={`tel:${b.phone}`}
                className="rounded-full px-9 py-4 text-base font-semibold backdrop-blur"
                style={{ border: `1px solid ${theme.border}`, color: theme.headline }}
              >
                {b.phone}
              </a>
            </motion.div>
          </div>
        </motion.div>
      </header>

      {/* ---------- 3D floating bento — services ---------- */}
      <ServicesGrid theme={theme} eyebrow="השירותים של הסטודיו" heading="נבנה בדיוק כמו שדמיינתם" columns={4} />

      {/* ---------- Live configurator ---------- */}
      <section className="mx-auto max-w-4xl px-6 pb-20">
        <InteractiveQuoteBuilder theme={theme} />
      </section>

      {/* ---------- Before / After ---------- */}
      <ProjectsSection theme={theme} eyebrow="השינוי האמיתי" heading="הפרש שנראה מהמסך" />

      {/* ---------- Benefits ---------- */}
      <div className="relative z-10 backdrop-blur-2xl" style={{ background: "rgba(255,255,255,0.03)", borderTop: `1px solid ${theme.border}`, borderBottom: `1px solid ${theme.border}` }}>
        <BenefitsSection theme={theme} heading="הסטנדרט שמבדיל אותנו" eyebrow="היתרונות שלנו" icons={[Shield]} />
      </div>

      {/* ---------- Process ---------- */}
      <section className="mx-auto max-w-4xl px-6 py-20">
        <ProcessTimeline theme={theme} />
      </section>

      {/* ---------- Reviews ---------- */}
      <ReviewsSection theme={theme} />

      {/* ---------- FAQ ---------- */}
      <section className="mx-auto max-w-6xl px-6 py-16">
        <motion.h2
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="mb-10 text-center text-3xl font-bold md:text-4xl"
          style={{ color: theme.headline }}
        >
          שאלות שנשאלות בסטודיו
        </motion.h2>
        <FaqAccordion
          items={faq}
          classes={{
            card: "rounded-3xl border backdrop-blur-2xl overflow-hidden",
            button: "flex w-full items-center justify-between gap-4 px-6 py-5 text-right",
            icon: "h-5 w-5",
            answer: "px-6 pb-5 text-sm leading-relaxed",
          }}
        />
      </section>

      {/* ---------- Contact ---------- */}
      <ContactSection theme={theme} heading="מוכנים להתחיל פרויקט?" />

      <WhatsAppFab accentColor={theme.accent} />
      <VipConciergeDrawer theme={theme} />
      <MobileActionBar accentColor={theme.accent} variant="dark" />
    </div>
  );
}
