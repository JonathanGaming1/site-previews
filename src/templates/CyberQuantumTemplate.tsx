"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Activity, Cpu, Gauge, Signal } from "lucide-react";
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
import { TiltCard3D } from "@/components/TiltCard3D";
import { LUX_THEMES } from "@/templates/theme";

/**
 * `cyber-quantum` — futuristic 3D high-tech luxury in the spirit of
 * Linear / Stripe / Vercel. Deep-space obsidian, holographic aurora mesh
 * lighting, isometric floating cards, interactive telemetry badges and
 * glowing laser borders.
 */
export function CyberQuantumTemplate() {
  const { data, editsFor } = useSite();
  const theme = LUX_THEMES["cyber-quantum"];
  const { businessInfo: b, hero, faq } = data;

  // Cursor-reactive aurora mesh (parallax light)
  const [pointer, setPointer] = useState({ x: 50, y: 30 });
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

  return (
    <div className="relative min-h-screen pb-28 md:pb-10" style={{ background: theme.pageBg, color: theme.text }}>
      {/* Holographic aurora mesh lighting */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-0"
        style={{
          background: `
            radial-gradient(52% 38% at ${pointer.x}% ${pointer.y}%, rgba(110,123,255,0.18), transparent 62%),
            radial-gradient(38% 30% at 14% 12%, rgba(56,232,255,0.10), transparent 60%),
            radial-gradient(42% 34% at 86% 78%, rgba(162,88,255,0.12), transparent 60%)`,
        }}
      />
      {/* Faint grid plane */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-0 opacity-[0.35]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(126,140,255,0.06) 1px, transparent 1px), linear-gradient(90deg, rgba(126,140,255,0.06) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
          maskImage: "radial-gradient(70% 60% at 50% 30%, black, transparent 85%)",
          WebkitMaskImage: "radial-gradient(70% 60% at 50% 30%, black, transparent 85%)",
        }}
      />

      <DynamicIslandNav theme={theme} />

      {/* ---------- Hero — holographic command deck ---------- */}
      <header className="relative z-10 mx-auto flex min-h-[96vh] max-w-6xl flex-col items-center justify-center px-6 pt-28 text-center">
        <AvailabilityBadge theme={theme} />

        <motion.h1
          initial={{ opacity: 0, y: 38 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          className="mt-8 max-w-4xl bg-gradient-to-b from-white via-[#dfe3ff] to-[#8f9bff] bg-clip-text text-4xl font-bold leading-[1.08] tracking-tight text-transparent md:text-6xl"
          {...editsFor("hero.headline")}
        >
          {hero.headline}
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.18 }}
          className="mt-6 max-w-2xl text-lg leading-relaxed md:text-xl"
          style={{ color: theme.muted }}
          {...editsFor("hero.subheadline")}
        >
          {hero.subheadline}
        </motion.p>

        {/* Interactive telemetry badges */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.35 }}
          className="mt-9 flex flex-wrap items-center justify-center gap-3"
        >
          {[
            { icon: Gauge, label: `דיוק מדידה`, value: "±2 מ\"מ" },
            { icon: Signal, label: "זמן תגובה", value: '<15 דק׳' },
            { icon: Cpu, label: "עדכוני פרויקט", value: "מקוונים 24/7" },
            { icon: Activity, label: "פרוטוקול איכות", value: "6 סטנדרטים" },
          ].map((t, i) => (
            <span
              key={i}
              className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-semibold"
              style={{
                border: `1px solid ${theme.border}`,
                background: "rgba(110,123,255,0.07)",
                color: theme.text,
                boxShadow: `0 0 18px rgba(110,123,255,0.10), inset 0 0 22px rgba(110,123,255,0.05)`,
              }}
            >
              <t.icon className="h-3.5 w-3.5" style={{ color: theme.accent }} aria-hidden="true" />
              {t.label}
              <span className="font-bold" style={{ color: theme.accent }}>{t.value}</span>
            </span>
          ))}
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="mt-10 flex flex-wrap items-center justify-center gap-4"
        >
          <motion.a
            href={`https://wa.me/${b.whatsapp}`}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.97 }}
            className="rounded-xl px-9 py-4 text-base font-bold"
            style={{
              background: theme.accent,
              color: "#0a0b14",
              boxShadow: `0 0 34px ${theme.accent}66, 0 10px 40px rgba(0,0,0,0.4)`,
            }}
          >
            {hero.ctaText}
          </motion.a>
          <a
            href={`tel:${b.phone}`}
            className="rounded-xl px-9 py-4 text-base font-semibold backdrop-blur"
            style={{ border: `1px solid ${theme.border}`, color: theme.headline, background: "rgba(255,255,255,0.03)" }}
          >
            {b.phone}
          </a>
        </motion.div>
      </header>

      {/* ---------- Isometric islets — services with laser borders ---------- */}
      <ServicesGrid theme={theme} eyebrow="מודולים של הסטודיו" heading="שירותים שמופעלים בדיוק" columns={4} />

      {/* ---------- Quantum configurator ---------- */}
      <section className="mx-auto max-w-4xl px-6 pb-20">
        <InteractiveQuoteBuilder theme={theme} />
      </section>

      {/* ---------- Before / After scan ---------- */}
      <ProjectsSection theme={theme} eyebrow="סריקת ההפרש" heading="לפני / אחרי — בפוקוס" />

      {/* ---------- Isometric benefits tile ---------- */}
      <div style={{ borderTop: `1px solid ${theme.border}`, borderBottom: `1px solid ${theme.border}`, background: "rgba(110,123,255,0.03)" }}>
        <BenefitsSection theme={theme} heading="תשתית שעובדת בשבילכם" eyebrow="היתרונות" icons={[Gauge, Signal, Cpu, Activity]} />
      </div>

      {/* ---------- Floating isometric mission card ---------- */}
      <section className="mx-auto max-w-4xl px-6 py-20">
        <motion.div {...fadeUp}>
          <TiltCard3D theme={theme} maxTilt={6}>
            <div
              className="flex flex-col items-center gap-6 rounded-[2rem] p-10 text-center md:flex-row md:text-right"
              style={{
                background: theme.surface,
                border: `1px solid ${theme.border}`,
                boxShadow: `0 0 40px rgba(110,123,255,0.10), inset 0 1px 0 rgba(255,255,255,0.08)`,
              }}
            >
              <span
                className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl"
                style={{ background: `${theme.accent}1a`, border: `1px solid ${theme.border}`, color: theme.accent }}
              >
                <Cpu className="h-8 w-8" aria-hidden="true" />
              </span>
              <div>
                <h3 className="text-2xl font-bold" style={{ color: theme.headline }}>
                  סטנדרט ביצוע מדויק — על כל הפנים
                </h3>
                <p className="mt-2 text-sm leading-relaxed md:text-base" style={{ color: theme.muted }}>
                  {data.businessInfo.tagline} — הצוות שלנו מנהל את הפרויקט שלכם עם פרוטוקול איכות
                  מחמיר, עדכונים חיים ולוח התקדמות שקוף לגמרי.
                </p>
              </div>
            </div>
          </TiltCard3D>
        </motion.div>

        <div className="mt-16">
          <ProcessTimeline theme={theme} />
        </div>
      </section>

      {/* ---------- Reviews ---------- */}
      <ReviewsSection theme={theme} />

      {/* ---------- FAQ ---------- */}
      <section className="mx-auto max-w-6xl px-6 pb-10 pt-6">
        <motion.h2
          {...fadeUp}
          className="mb-10 text-center text-3xl font-bold md:text-4xl"
          style={{ color: theme.headline }}
        >
          שאלות מהשטח
        </motion.h2>
        <FaqAccordion
          items={faq}
          classes={{
            card: "rounded-2xl border backdrop-blur-xl overflow-hidden",
            button: "flex w-full items-center justify-between gap-4 px-6 py-5 text-right",
            icon: "h-5 w-5",
            answer: "px-6 pb-5 text-sm leading-relaxed",
          }}
        />
      </section>

      {/* ---------- Contact ---------- */}
      <ContactSection theme={theme} heading="מוכנים לשדרג את המרחב?" />

      <WhatsAppFab accentColor={theme.accent} />
      <VipConciergeDrawer theme={theme} triggerPosition="right" />
      <MobileActionBar accentColor={theme.accent} variant="dark" />
    </div>
  );
}
