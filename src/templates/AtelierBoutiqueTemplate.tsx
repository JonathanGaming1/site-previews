"use client";

import React, { useEffect, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Feather, Leaf, ScrollText, Sun } from "lucide-react";
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

/**
 * `atelier-boutique` — ultra-luxury architectural flagship in the spirit of
 * Hermès / Aesop. Warm travertine stone surfaces, espresso bronze ink,
 * smooth parallax image curtains and a magazine-grade editorial layout.
 */
export function AtelierBoutiqueTemplate() {
  const { data, editsFor } = useSite();
  const theme = LUX_THEMES["atelier-boutique"];
  const { businessInfo: b, hero, faq } = data;

  const { scrollY } = useScroll();
  const curtainY = useTransform(scrollY, [0, 800], [0, 160]);
  const curtainScale = useTransform(scrollY, [0, 800], [1, 1.12]);
  const headlineY = useTransform(scrollY, [0, 600], [0, 60]);

  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <div className="relative min-h-screen pb-28 md:pb-10" style={{ background: theme.pageBg, color: theme.text }}>
      <DynamicIslandNav theme={theme} />

      {/* ---------- Hero — travertine curtain with parallax ---------- */}
      <header className="relative min-h-[100vh] overflow-hidden">
        {hero.backgroundImage && (
          <motion.div className="absolute inset-0" style={{ y: curtainY, scale: curtainScale }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={hero.backgroundImage}
              alt=""
              className="h-full w-full object-cover opacity-40"
            />
          </motion.div>
        )}
        <div
          aria-hidden="true"
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(180deg, rgba(237,228,211,0.55), rgba(237,228,211,0.86) 55%, rgba(237,228,211,1))",
          }}
        />
        {/* Arch curtain edge */}
        <div
          aria-hidden="true"
          className="absolute inset-x-0 bottom-0 h-16"
          style={{
            background: theme.pageBg,
            borderRadius: "50% 50% 0 0 / 100% 100% 0 0",
          }}
        />

        <div className="relative z-10 mx-auto flex min-h-[100vh] max-w-5xl flex-col items-center justify-center px-6 pt-28 text-center">
          <AvailabilityBadge theme={theme} />

          <motion.h1
            style={{ y: mounted ? headlineY : undefined }}
            className="mt-8 max-w-4xl text-4xl font-bold leading-[1.14] tracking-tight md:text-6xl lg:text-7xl"
            {...editsFor("hero.headline")}
          >
            <span style={{ color: theme.headline, fontFamily: theme.fontSerif }}>{hero.headline}</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.2 }}
            className="mt-6 max-w-2xl text-lg leading-relaxed md:text-xl"
            style={{ color: theme.muted }}
            {...editsFor("hero.subheadline")}
          >
            {hero.subheadline}
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.35 }}
            className="mt-10 flex flex-wrap items-center justify-center gap-4"
          >
            <motion.a
              href={`https://wa.me/${b.whatsapp}`}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              className="rounded-full px-10 py-4 text-base font-bold shadow-xl"
              style={{ background: theme.accent, color: "#fdf9f3" }}
            >
              {hero.ctaText}
            </motion.a>
            <a
              href={`tel:${b.phone}`}
              className="rounded-full px-10 py-4 text-base font-semibold"
              style={{ border: `1px solid ${theme.border}`, color: theme.headline, background: theme.surface }}
            >
              {b.phone}
            </a>
          </motion.div>
        </div>
      </header>

      {/* ---------- Editorial band — tagline statement ---------- */}
      <section className="mx-auto max-w-4xl px-6 py-16 text-center">
        <motion.blockquote {...fadeUp}>
          <Feather className="mx-auto mb-4 h-5 w-5" style={{ color: theme.accent }} aria-hidden="true" />
          <p
            className="text-2xl font-medium leading-snug md:text-3xl"
            style={{ color: theme.headline, fontFamily: theme.fontSerif }}
          >
            “{b.tagline}”
          </p>
          <cite className="mt-4 block text-sm not-italic" style={{ color: theme.muted }}>
            — {b.name}, {b.category}
          </cite>
        </motion.blockquote>
      </section>

      {/* ---------- Services — magazine grid ---------- */}
      <ServicesGrid theme={theme} eyebrow="קטלוג האטלייה" heading="מה אנחנו יוצרים בשבילכם" columns={2} />

      {/* ---------- Live configurator ---------- */}
      <section className="mx-auto max-w-4xl px-6 pb-20">
        <InteractiveQuoteBuilder theme={theme} />
      </section>

      {/* ---------- Before / After ---------- */}
      <ProjectsSection theme={theme} eyebrow="עבודות שנעשו באטלייה" heading="השינוי שמרגישים מיד" />

      {/* ---------- Benefits — travertine band ---------- */}
      <div
        className="w-full"
        style={{
          background: "linear-gradient(180deg, rgba(139,106,62,0.07), transparent 70%)",
          borderTop: `1px solid ${theme.border}`,
          borderBottom: `1px solid ${theme.border}`,
        }}
      >
        <BenefitsSection theme={theme} heading="הסטנדרט של האטלייה" eyebrow="החומרה והרוח" icons={[Leaf, Sun, ScrollText, Feather]} />
      </div>

      {/* ---------- Process ---------- */}
      <section className="mx-auto max-w-4xl px-6 py-20">
        <ProcessTimeline theme={theme} />
      </section>

      {/* ---------- Reviews ---------- */}
      <ReviewsSection theme={theme} />

      {/* ---------- FAQ ---------- */}
      <section className="mx-auto max-w-6xl px-6 pb-10">
        <motion.h2
          {...fadeUp}
          className="mb-10 text-center text-3xl font-bold md:text-4xl"
          style={{ color: theme.headline, fontFamily: theme.fontSerif }}
        >
          שאלות של לקוחות האטלייה
        </motion.h2>
        <FaqAccordion
          items={faq}
          classes={{
            card: "rounded-2xl border overflow-hidden backdrop-blur",
            button: "flex w-full items-center justify-between gap-4 px-6 py-5 text-right",
            icon: "h-5 w-5",
            answer: "px-6 pb-5 text-sm leading-relaxed",
          }}
        />
      </section>

      {/* ---------- Contact ---------- */}
      <ContactSection theme={theme} heading="בואו לבקר באטלייה" />

      <WhatsAppFab accentColor={theme.accent} />
      <VipConciergeDrawer theme={theme} />
      <MobileActionBar accentColor={theme.accent} variant="warm" />
    </div>
  );
}
