"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Award, BadgeCheck, Clock, Compass, MapPin, Phone, Shield } from "lucide-react";
import { useSite } from "@/components/SiteProvider";
import { ServiceIcon } from "@/components/ServiceIcon";
import { FaqAccordion, MobileActionBar, Stars, WhatsAppFab, fadeUp } from "@/templates/shared";
import {
  AvailabilityBadge,
  BeforeAfterShowcase,
  ProcessTimeline,
  QuoteEstimator,
  VipCallbackDrawer,
  resolvePalette,
} from "@/templates/features";

/**
 * "luxury-dark" — aged single-malt whisky lounge: deep smoked espresso/obsidian,
 * aged bourbon & brushed brass accents, film-grain texture, a warm ambient
 * spotlight that follows the cursor and a brass scroll-progress rail.
 */
const GRAIN_URI =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='160' height='160'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.5'/%3E%3C/svg%3E\")";

export function LuxuryDarkTemplate() {
  const { data, editsFor } = useSite();
  const accent = data.theme.accentColor || "#c59b27";
  const { businessInfo: b, hero, services, benefits, reviews, faq } = data;
  const palette = resolvePalette(null, "dark");

  // Cursor-following warm ambient spotlight
  const [pointer, setPointer] = useState({ x: 50, y: 25 });
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

  const benefitIcons = [Shield, Award, Clock, Compass] as const;

  return (
    <div
      className="relative min-h-screen bg-[#090807] pb-24 text-[#efe7d8] md:pb-6"
      style={
        {
          "--mx": `${pointer.x}%`,
          "--my": `${pointer.y}%`,
        } as React.CSSProperties
      }
    >
      {/* Brass scroll progress rail */}
      <div className="fixed inset-x-0 top-0 z-[9600] h-[3px] bg-white/5" dir="ltr">
        <div
          className="h-full transition-[width] duration-100 ease-out"
          style={{
            width: `${progress * 100}%`,
            background: `linear-gradient(90deg, ${accent}, #e2b857)`,
            boxShadow: `0 0 12px ${accent}88`,
          }}
        />
      </div>

      {/* Film-grain noise overlay */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-[9500] opacity-[0.05] mix-blend-overlay"
        style={{ backgroundImage: GRAIN_URI, backgroundSize: "160px 160px" }}
      />

      {/* Warm ambient spotlight following the cursor */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-[1]"
        style={{
          background: `radial-gradient(560px circle at var(--mx) var(--my), ${accent}1f, transparent 65%)`,
        }}
      />

      {/* ---------- Hero ---------- */}
      <header className="relative min-h-[94vh] overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={hero.backgroundImage}
          alt=""
          className="absolute inset-0 h-full w-full object-cover opacity-25"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#090807]/60 via-[#090807]/85 to-[#090807]" />
        <div
          aria-hidden="true"
          className="absolute inset-x-0 top-0 h-px"
          style={{ background: `linear-gradient(90deg, transparent, ${accent}88, transparent)` }}
        />

        <nav className="relative z-10 mx-auto flex max-w-6xl items-center justify-between px-6 py-7">
          <span
            className="text-2xl font-bold tracking-wide"
            style={{
              color: accent,
              fontFamily: "'Frank Ruhl Libre', serif",
            }}
          >
            {b.name}
          </span>
          <a
            href={data.checkoutUrl}
            className="hidden rounded-full border px-5 py-2 text-sm font-semibold transition hover:bg-white/5 md:block"
            style={{ borderColor: `${accent}66`, color: accent }}
          >
            לרכישת האתר
          </a>
        </nav>

        <motion.div
          initial={{ opacity: 0, y: 44 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, ease: "easeOut" }}
          className="relative z-10 mx-auto flex max-w-4xl flex-col items-center px-6 pt-14 text-center md:pt-24"
        >
          <AvailabilityBadge accent={accent} palette={palette} />

          <h1
            className="mt-7 text-4xl font-bold leading-[1.18] text-[#f5efe4] md:text-6xl"
            style={{ fontFamily: "'Frank Ruhl Libre', serif" }}
            {...editsFor("hero.headline")}
          >
            {hero.headline}
          </h1>
          <p
            className="mt-6 max-w-2xl text-lg leading-relaxed md:text-xl"
            style={{ color: "rgba(245,239,228,0.65)" }}
            {...editsFor("hero.subheadline")}
          >
            {hero.subheadline}
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <motion.a
              href={`https://wa.me/${b.whatsapp}`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.96 }}
              className="rounded-full px-9 py-4 text-base font-bold shadow-[0_10px_40px_rgba(197,155,39,0.35)]"
              style={{ background: `linear-gradient(120deg, ${accent}, #e2b857)`, color: "#14100a" }}
            >
              {hero.ctaText}
            </motion.a>
            <a
              href={`tel:${b.phone}`}
              className="rounded-full px-9 py-4 text-base font-semibold backdrop-blur transition hover:bg-white/5"
              style={{ border: `1px solid rgba(197,155,39,0.3)`, color: "#efe7d8" }}
            >
              {b.phone}
            </a>
          </div>

          <div className="mt-12 flex items-center gap-3 text-sm" style={{ color: "rgba(245,239,228,0.45)" }}>
            <Stars rating={Math.round(b.googleRating)} starClass="text-[#c59b27]" />
            <span className="font-bold" style={{ color: "#efe7d8" }}>
              {b.googleRating.toFixed(1)}
            </span>
            <span>({b.reviewsCount} ביקורות)</span>
          </div>
        </motion.div>
      </header>

      {/* ---------- Services: brass glass vault ---------- */}
      <section className="relative z-[2] mx-auto max-w-6xl px-6 py-20">
        <motion.div {...fadeUp} className="mb-12 text-center">
          <p className="text-xs font-bold tracking-[0.4em]" style={{ color: accent }}>
            המחירון של הסטודיו
          </p>
          <h2
            className="mt-3 text-3xl font-bold md:text-4xl"
            style={{ fontFamily: "'Frank Ruhl Libre', serif" }}
          >
            פרויקטים שנבנים סביב הבית שלכם
          </h2>
        </motion.div>
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {services.map((s, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.08 }}
              className="rounded-3xl p-6 backdrop-blur-xl transition duration-300 hover:-translate-y-1"
              style={{
                background: "rgba(255,255,255,0.03)",
                border: `1px solid ${accent}33`,
                boxShadow: "0 20px 40px rgba(0,0,0,0.35)",
              }}
            >
              <span
                className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl"
                style={{ border: `1px solid ${accent}44`, background: `${accent}12`, color: accent }}
              >
                <ServiceIcon name={s.iconName} className="h-6 w-6" />
              </span>
              <h3 className="text-lg font-bold text-[#f5efe4]" {...editsFor(`services.${i}.title`)}>
                {s.title}
              </h3>
              <p
                className="mt-2 text-sm leading-relaxed"
                style={{ color: "rgba(245,239,228,0.45)" }}
                {...editsFor(`services.${i}.description`)}
              >
                {s.description}
              </p>
              {s.price && (
                <p className="mt-4 text-sm font-bold" style={{ color: accent }} {...editsFor(`services.${i}.price`)}>
                  {s.price}
                </p>
              )}
            </motion.div>
          ))}
        </div>
      </section>

      {/* ---------- Quote estimator (live) ---------- */}
      <section className="relative z-[2] mx-auto max-w-4xl px-6 pb-20">
        <QuoteEstimator accent={accent} palette={palette} />
      </section>

      {/* ---------- Before / After showcase ---------- */}
      <section className="relative z-[2] mx-auto max-w-5xl px-6 pb-20">
        <BeforeAfterShowcase accent={accent} palette={palette} />
      </section>

      {/* ---------- Benefits ---------- */}
      <section
        className="relative z-[2] py-20"
        style={{
          background: "linear-gradient(180deg, rgba(197,155,39,0.04), transparent 55%)",
          borderTop: `1px solid ${accent}1f`,
          borderBottom: `1px solid ${accent}1f`,
        }}
      >
        <div className="mx-auto max-w-6xl px-6">
          <motion.h2
            {...fadeUp}
            className="mb-12 text-center text-3xl font-bold md:text-4xl"
            style={{ fontFamily: "'Frank Ruhl Libre', serif" }}
          >
            למה בחרו בנו
          </motion.h2>
          <div className="grid gap-8 md:grid-cols-2">
            {benefits.map((bf, i) => {
              const Icon = benefitIcons[i % benefitIcons.length];
              return (
                <motion.div key={i} {...fadeUp} className="flex items-start gap-4">
                  <span
                    className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-full"
                    style={{ border: `1px solid ${accent}44`, background: `${accent}12`, color: accent }}
                  >
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <div>
                    <h3 className="text-lg font-semibold text-[#f5efe4]" {...editsFor(`benefits.${i}.title`)}>
                      {bf.title}
                    </h3>
                    <p
                      className="mt-1 text-sm leading-relaxed"
                      style={{ color: "rgba(245,239,228,0.5)" }}
                      {...editsFor(`benefits.${i}.description`)}
                    >
                      {bf.description}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ---------- Process timeline (illuminates on scroll) ---------- */}
      <section className="relative z-[2] mx-auto max-w-4xl px-6 py-20">
        <ProcessTimeline accent={accent} palette={palette} />
      </section>

      {/* ---------- Reviews ---------- */}
      <section className="relative z-[2] mx-auto max-w-6xl px-6 py-16">
        <motion.div {...fadeUp} className="mb-12 text-center">
          <span
            className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-semibold"
            style={{ border: `1px solid rgba(110,231,183,0.3)`, background: "rgba(16,185,129,0.08)", color: "#6ee7b7" }}
          >
            <BadgeCheck className="h-4 w-4" aria-hidden="true" />
            ביקורות Google מאומתות
          </span>
          <p className="mt-4 text-sm font-semibold" style={{ color: accent }}>
            {b.googleRating.toFixed(1)} / 5 • {b.reviewsCount} ביקורות
          </p>
        </motion.div>
        <div className="grid gap-6 md:grid-cols-3">
          {reviews.map((r, i) => (
            <motion.article
              key={i}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="rounded-3xl p-6 backdrop-blur-xl"
              style={{ background: "rgba(255,255,255,0.03)", border: `1px solid ${accent}2b` }}
            >
              <div className="flex items-center gap-3">
                <span
                  className="flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold"
                  style={{ background: accent, color: "#14100a" }}
                >
                  {r.author.trim()[0]}
                </span>
                <div>
                  <p className="flex items-center gap-1 font-semibold text-[#f5efe4]" {...editsFor(`reviews.${i}.author`)}>
                    {r.author}
                    <BadgeCheck className="h-4 w-4 text-emerald-400" aria-hidden="true" />
                  </p>
                  <Stars rating={r.rating} className="h-3 w-3" starClass="text-[#c59b27]" />
                </div>
              </div>
              <p
                className="mt-4 text-sm leading-relaxed"
                style={{ color: "rgba(245,239,228,0.55)" }}
                {...editsFor(`reviews.${i}.text`)}
              >
                {r.text}
              </p>
            </motion.article>
          ))}
        </div>
      </section>

      {/* ---------- FAQ + contact ---------- */}
      <section className="relative z-[2] mx-auto max-w-6xl px-6 pb-24">
        <motion.h2
          {...fadeUp}
          className="mb-10 text-center text-3xl font-bold md:text-4xl"
          style={{ fontFamily: "'Frank Ruhl Libre', serif" }}
        >
          שאלות שנשאלות באווירת הסטודיו
        </motion.h2>
        <FaqAccordion
          items={faq}
          classes={{
            card: "relative rounded-3xl border border-[#c59b27]/20 bg-white/[0.03] backdrop-blur-xl",
            button: "flex w-full items-center justify-between gap-4 px-6 py-5 text-right text-[#efe7d8]",
            icon: "h-5 w-5",
            answer: "px-6 pb-5 text-sm leading-relaxed text-[#efe7d8]/50",
          }}
        />

        <motion.div
          {...fadeUp}
          className="mt-16 rounded-3xl p-8 text-center backdrop-blur-xl md:p-12"
          style={{
            border: `1px solid ${accent}26`,
            background:
              "linear-gradient(160deg, rgba(197,155,39,0.07), rgba(255,255,255,0.015))",
          }}
        >
          <h2
            className="text-3xl font-bold md:text-4xl"
            style={{ fontFamily: "'Frank Ruhl Libre', serif" }}
          >
            מוכנים ליוקרה של בסטודיו אמתי
          </h2>
          <div className="mt-6 flex flex-col items-center justify-center gap-3 text-sm md:flex-row md:gap-8" style={{ color: "rgba(245,239,228,0.55)" }}>
            <span className="inline-flex items-center gap-2">
              <Clock className="h-4 w-4" style={{ color: accent }} aria-hidden="true" />
              {b.openingHours}
            </span>
            <span className="inline-flex items-center gap-2">
              <MapPin className="h-4 w-4" style={{ color: accent }} aria-hidden="true" />
              {b.address}
            </span>
            <span className="inline-flex items-center gap-2">
              <Phone className="h-4 w-4" style={{ color: accent }} aria-hidden="true" />
              {b.phone}
            </span>
          </div>
          <p
            className="mx-auto mt-8 max-w-2xl text-sm leading-relaxed"
            style={{ color: "rgba(245,239,228,0.45)" }}
            {...editsFor("businessInfo.description")}
          >
            {b.description}
          </p>
        </motion.div>
      </section>

      {/* Floating interactive elements */}
      <WhatsAppFab accentColor={accent} />
      <VipCallbackDrawer accent={accent} palette={palette} />
      <MobileActionBar accentColor={accent} variant="dark" />
    </div>
  );
}
