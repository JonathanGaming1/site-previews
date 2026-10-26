"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Award, Clock, Compass, Shield } from "lucide-react";
import { useSite } from "@/components/SiteProvider";
import { DynamicIslandNav } from "@/components/DynamicIslandNav";
import { InteractiveQuoteBuilder } from "@/components/InteractiveQuoteBuilder";
import { VipConciergeDrawer } from "@/components/VipConciergeDrawer";
import { FaqAccordion, MobileActionBar, WhatsAppFab } from "@/templates/shared";
import { AvailabilityBadge, ProcessTimeline } from "@/templates/features";
import {
  BenefitsSection,
  ContactSection,
  ProjectsSection,
  ReviewsSection,
  ServicesGrid,
  fadeUp,
} from "@/templates/sections";
import { LUX_THEMES } from "@/templates/theme";

/** Inline SVG film grain (no external asset needed) */
const GRAIN_URI =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.5'/%3E%3C/svg%3E\")";

/**
 * `whisky-obsidian` — a private single-malt whisky club poured through
 * Rolls-Royce Bespoke. Deep smoked obsidian (#080706), liquid amber gold &
 * brushed brass (#c59b27), editorial Frank Ruhl Libre serif, subtle film
 * grain, cursor-following warm spotlight and 3D brass-bordered cards.
 */
export function WhiskyObsidianTemplate() {
  const { data, editsFor } = useSite();
  const theme = LUX_THEMES["whisky-obsidian"];
  const { businessInfo: b, hero, faq } = data;

  // Cursor-following warm candlelight spotlight
  const [pointer, setPointer] = useState({ x: 50, y: 22 });
  useEffect(() => {
    const onMove = (e: PointerEvent) => {
      setPointer({
        x: (e.clientX / window.innerWidth) * 100,
        y: (e.clientY / window.innerHeight) * 100,
      });
    };
    window.addEventListener("pointermove", onMove);
    return () => window.removeEventListener("pointermove", onMove);
  }, []);

  // Brass scroll-progress rail
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    const onScroll = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(max > 0 ? Math.min(1, window.scrollY / max) : 0);
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <div
      className="relative min-h-screen pb-32 md:pb-8"
      style={{ background: theme.pageBg, color: theme.text, ["--mx" as never]: `${pointer.x}%`, ["--my" as never]: `${pointer.y}%` }}
    >
      {/* Brass scroll-progress rail */}
      <div className="fixed inset-x-0 top-0 z-[9600] h-[3px] bg-white/5" dir="ltr">
        <div
          className="h-full transition-[width] duration-100 ease-out"
          style={{
            width: `${progress * 100}%`,
            background: `linear-gradient(90deg, ${theme.accent}, #e2b857)`,
            boxShadow: `0 0 12px ${theme.accent}88`,
          }}
        />
      </div>

      {/* Subtle film grain */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-[9500] opacity-[0.05] mix-blend-overlay"
        style={{ backgroundImage: GRAIN_URI, backgroundSize: "160px 160px" }}
      />

      {/* Warm ambient candlelit spotlight following the cursor */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-[1]"
        style={{
          background: `radial-gradient(560px circle at var(--mx) var(--my), ${theme.accent}1f, transparent 65%)`,
        }}
      />

      <DynamicIslandNav theme={theme} />

      {/* ---------- Hero — decanter lounge ---------- */}
      <header className="relative min-h-[94vh] overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        {hero.backgroundImage && (
          <img
            src={hero.backgroundImage}
            alt=""
            className="absolute inset-0 h-full w-full object-cover opacity-25"
          />
        )}
        <div className="absolute inset-0" style={{ background: `linear-gradient(180deg, ${theme.pageBg}99, ${theme.pageBg}d9 55%, ${theme.pageBg})` }} />
        <div
          aria-hidden="true"
          className="absolute inset-x-0 top-0 h-px"
          style={{ background: `linear-gradient(90deg, transparent, ${theme.accent}88, transparent)` }}
        />

        <div className="relative z-10 mx-auto flex max-w-4xl flex-col items-center px-6 pt-36 text-center md:pt-44">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <AvailabilityBadge theme={theme} />
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: "easeOut" }}
            className="mt-8 text-4xl font-bold leading-[1.18] md:text-6xl"
            style={{ color: theme.headline, fontFamily: theme.fontSerif }}
            {...editsFor("hero.headline")}
          >
            {hero.headline}
          </motion.h1>
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 0.25 }}
            className="mt-6 max-w-2xl text-lg leading-relaxed md:text-xl"
            style={{ color: "rgba(242,232,213,0.62)" }}
            {...editsFor("hero.subheadline")}
          >
            {hero.subheadline}
          </motion.p>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.4 }}
            className="mt-10 flex flex-wrap items-center justify-center gap-4"
          >
            <motion.a
              href={`https://wa.me/${b.whatsapp}`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.96 }}
              className="rounded-full px-9 py-4 text-base font-bold"
              style={{
                background: `linear-gradient(120deg, ${theme.accent}, #e2b857)`,
                color: "#14100a",
                boxShadow: "0 10px 40px rgba(197,155,39,0.35)",
              }}
            >
              {hero.ctaText}
            </motion.a>
            <a
              href={`tel:${b.phone}`}
              className="rounded-full px-9 py-4 text-base font-semibold backdrop-blur transition hover:bg-white/5"
              style={{ border: `1px solid ${theme.accent}4d`, color: theme.headline }}
            >
              {b.phone}
            </a>
          </motion.div>
        </div>
      </header>

      {/* ---------- Services — 3D brass-bordered cards ---------- */}
      <ServicesGrid theme={theme} eyebrow="מחירון הסטודיו" heading="פרויקטים שנבנים סביב הבית שלכם" columns={4} />

      {/* ---------- Live configurator ---------- */}
      <section className="mx-auto max-w-4xl px-6 pb-20">
        <InteractiveQuoteBuilder theme={theme} />
      </section>

      {/* ---------- Before / After ---------- */}
      <ProjectsSection theme={theme} eyebrow="ההפרש שנשאר בעין" heading="לפני ואחרי — מקרוב" />

      {/* ---------- Benefits ---------- */}
      <div
        className="relative z-[2] w-full"
        style={{
          background: `linear-gradient(180deg, ${theme.accent}0d, transparent 55%)`,
          borderTop: `1px solid ${theme.accent}2b`,
          borderBottom: `1px solid ${theme.accent}2b`,
        }}
      >
        <BenefitsSection
          theme={theme}
          heading="למה בחרו בנו"
          eyebrow="היתרונות"
          icons={[Shield, Award, Clock, Compass]}
        />
      </div>

      {/* ---------- Process ---------- */}
      <section className="mx-auto max-w-4xl px-6 py-20">
        <ProcessTimeline theme={theme} />
      </section>

      {/* ---------- Reviews ---------- */}
      <ReviewsSection theme={theme} />

      {/* ---------- FAQ + contact ---------- */}
      <section className="mx-auto max-w-6xl px-6 pb-24 pt-14">
        <motion.h2
          {...fadeUp}
          className="mb-10 text-center text-3xl font-bold md:text-4xl"
          style={{ fontFamily: theme.fontSerif, color: theme.headline }}
        >
          שאלות שנשאלות באווירת הסטודיו
        </motion.h2>
        <FaqAccordion
          items={faq}
          classes={{
            card: "relative rounded-3xl border bg-white/[0.03] backdrop-blur-xl overflow-hidden",
            button: "flex w-full items-center justify-between gap-4 px-6 py-5 text-right text-[#f2e8d5]",
            icon: "h-5 w-5",
            answer: "px-6 pb-5 text-sm leading-relaxed text-[#f2e8d5]/55",
          }}
        />
      </section>

      <ContactSection theme={theme} heading="מוכנים ליוקרה של בסטודיו אמתי" />

      <WhatsAppFab accentColor={theme.accent} />
      <VipConciergeDrawer theme={theme} />
      <MobileActionBar accentColor={theme.accent} variant="dark" />
    </div>
  );
}
