"use client";

import React from "react";
import { motion } from "framer-motion";
import { BadgeCheck, Clock, MapPin, Phone, Sparkles } from "lucide-react";
import { useSite } from "@/components/SiteProvider";
import { ServiceIcon } from "@/components/ServiceIcon";
import { FaqAccordion, MobileActionBar, Stars, WhatsAppFab, fadeUp } from "@/templates/shared";

/**
 * "luxury-dark" — deep obsidian theme, champagne-gold accents,
 * glassmorphism cards and luxury typography.
 */
export function LuxuryDarkTemplate() {
  const { data, editsFor } = useSite();
  const accent = data.theme.accentColor;
  const { businessInfo: b, hero, services, benefits, reviews, faq } = data;

  return (
    <div className="min-h-screen bg-[#0a0a0e] pb-24 text-gray-100 md:pb-6">
      {/* ---------- Hero ---------- */}
      <header className="relative min-h-[92vh] overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={hero.backgroundImage}
          alt=""
          className="absolute inset-0 h-full w-full object-cover opacity-30"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-[#0a0a0e]/70 via-[#0a0a0e]/85 to-[#0a0a0e]" />

        <nav className="relative z-10 mx-auto flex max-w-6xl items-center justify-between px-6 py-6">
          <span className="text-xl font-bold tracking-wide" style={{ color: accent }}>
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
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: "easeOut" }}
          className="relative z-10 mx-auto flex max-w-4xl flex-col items-center px-6 pt-16 text-center md:pt-24"
        >
          <span
            className="mb-6 rounded-full border bg-white/5 px-4 py-1.5 text-xs font-medium tracking-widest backdrop-blur"
            style={{ borderColor: `${accent}55`, color: accent }}
          >
            {b.category} • {b.address}
          </span>
          <h1
            className="text-4xl font-extrabold leading-[1.15] text-white md:text-6xl"
            {...editsFor("hero.headline")}
          >
            {hero.headline}
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-relaxed text-gray-300 md:text-xl" {...editsFor("hero.subheadline")}>
            {hero.subheadline}
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
            <motion.a
              href={`https://wa.me/${b.whatsapp}`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.96 }}
              className="rounded-full px-8 py-4 text-base font-bold text-gray-950 shadow-[0_10px_40px_rgba(212,175,55,0.35)]"
              style={{ background: `linear-gradient(135deg,${accent},#f4e6b8)` }}
            >
              {hero.ctaText}
            </motion.a>
            <a
              href={`tel:${b.phone}`}
              className="rounded-full border border-white/15 px-8 py-4 text-base font-semibold text-white backdrop-blur transition hover:bg-white/5"
            >
              {b.phone}
            </a>
          </div>

          <div className="mt-12 flex items-center gap-3 text-sm text-gray-400">
            <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white/10 text-[11px] font-bold" aria-hidden="true">G</span>
            <Stars rating={Math.round(b.googleRating)} />
            <span>
              {b.googleRating.toFixed(1)} ({b.reviewsCount} ביקורות)
            </span>
          </div>
        </motion.div>
      </header>

      {/* ---------- Services ---------- */}
      <section className="mx-auto max-w-6xl px-6 py-20">
        <motion.div {...fadeUp} className="mb-12 text-center">
          <p className="text-sm font-semibold tracking-widest" style={{ color: accent }}>
            השירותים שלנו
          </p>
          <h2 className="mt-2 text-3xl font-bold text-white md:text-4xl">
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
              className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur-xl transition hover:border-white/25 hover:bg-white/[0.07]"
            >
              <span
                className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl border"
                style={{ borderColor: `${accent}44`, background: `${accent}14`, color: accent }}
              >
                <ServiceIcon name={s.iconName} className="h-6 w-6" />
              </span>
              <h3 className="text-lg font-bold text-white" {...editsFor(`services.${i}.title`)}>
                {s.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-gray-400" {...editsFor(`services.${i}.description`)}>
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

      {/* ---------- Benefits ---------- */}
      <section className="border-y border-white/5 bg-[#0d0d12] py-20">
        <div className="mx-auto max-w-6xl px-6">
          <motion.h2 {...fadeUp} className="mb-12 text-center text-3xl font-bold md:text-4xl">
            למה בחרו בנו <span style={{ color: accent }}>?</span>
          </motion.h2>
          <div className="grid gap-8 md:grid-cols-2">
            {benefits.map((bf, i) => (
              <motion.div key={i} {...fadeUp} className="flex items-start gap-4">
                <span
                  className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border"
                  style={{ borderColor: `${accent}44`, background: `${accent}12`, color: accent }}
                >
                  <Sparkles className="h-5 w-5" aria-hidden="true" />
                </span>
                <div>
                  <h3 className="text-lg font-semibold text-white" {...editsFor(`benefits.${i}.title`)}>
                    {bf.title}
                  </h3>
                  <p className="mt-1 text-sm leading-relaxed text-gray-400" {...editsFor(`benefits.${i}.description`)}>
                    {bf.description}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- Reviews ---------- */}
      <section className="mx-auto max-w-6xl px-6 py-20">
        <motion.div {...fadeUp} className="mb-12 text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-4 py-1.5 text-xs font-semibold text-emerald-300">
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
              className="rounded-3xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur-xl"
            >
              <div className="flex items-center gap-3">
                <span
                  className="flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold text-gray-950"
                  style={{ background: accent }}
                >
                  {r.author.trim()[0]}
                </span>
                <div>
                  <p className="flex items-center gap-1 font-semibold text-white" {...editsFor(`reviews.${i}.author`)}>
                    {r.author}
                    <BadgeCheck className="h-4 w-4 text-emerald-400" aria-hidden="true" />
                  </p>
                  <Stars rating={r.rating} className="h-3 w-3" />
                </div>
              </div>
              <p className="mt-4 text-sm leading-relaxed text-gray-300" {...editsFor(`reviews.${i}.text`)}>
                {r.text}
              </p>
            </motion.article>
          ))}
        </div>
      </section>

      {/* ---------- FAQ + contact ---------- */}
      <section className="mx-auto max-w-6xl px-6 pb-24">
        <motion.h2 {...fadeUp} className="mb-10 text-center text-3xl font-bold md:text-4xl">
          שאלות נפוצות
        </motion.h2>
        <FaqAccordion
          items={faq}
          classes={{
            card: "relative rounded-3xl border border-white/10 bg-white/[0.04] backdrop-blur-xl",
            button: "flex w-full items-center justify-between gap-4 px-6 py-5 text-right text-gray-200",
            icon: "h-5 w-5",
            answer: "px-6 pb-5 text-sm leading-relaxed text-gray-400",
          }}
        />

        <motion.div
          {...fadeUp}
          className="mt-16 rounded-3xl border p-8 text-center backdrop-blur-xl md:p-12"
          style={{ borderColor: `${accent}33`, background: "linear-gradient(160deg,rgba(255,255,255,0.05),rgba(255,255,255,0.01))" }}
        >
          <h2 className="text-3xl font-bold text-white md:text-4xl">
            מוכנים להתחיל <span style={{ color: accent }}>?</span>
          </h2>
          <div className="mt-6 flex flex-col items-center justify-center gap-3 text-sm text-gray-300 md:flex-row md:gap-8">
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
          <p className="mt-8 max-w-2xl mx-auto text-sm leading-relaxed text-gray-400" {...editsFor("businessInfo.description")}>
            {b.description}
          </p>
        </motion.div>
      </section>

      <WhatsAppFab accentColor={accent} />
      <MobileActionBar accentColor={accent} variant="dark" />
    </div>
  );
}
