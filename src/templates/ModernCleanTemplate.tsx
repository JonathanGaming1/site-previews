"use client";

import React from "react";
import { motion } from "framer-motion";
import { ArrowLeft, BadgeCheck, Clock, MapPin, Phone, Zap } from "lucide-react";
import { useSite } from "@/components/SiteProvider";
import { ServiceIcon } from "@/components/ServiceIcon";
import {
  AvailabilityBadge,
  BeforeAfterShowcase,
  ProcessTimeline,
  QuoteEstimator,
  VipCallbackDrawer,
  resolvePalette,
} from "@/templates/features";
import { FaqAccordion, MobileActionBar, Stars, WhatsAppFab, fadeUp } from "@/templates/shared";

/**
 * "modern-clean" — crisp Apple/Stripe-style light aesthetic,
 * bento-product grid, soft shadows, floating glass navbar.
 */
export function ModernCleanTemplate() {
  const { data, editsFor } = useSite();
  const accent = data.theme.accentColor;
  const { businessInfo: b, hero, services, benefits, reviews, faq } = data;

  return (
    <div className="min-h-screen bg-white pb-24 text-gray-900 md:pb-6">
      {/* ---------- Floating navbar ---------- */}
      <motion.nav
        initial={{ y: -70, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="fixed inset-x-0 top-4 z-[8000] mx-auto flex max-w-5xl items-center justify-between rounded-2xl border border-gray-200/70 bg-white/80 px-5 py-3 shadow-lg shadow-gray-900/5 backdrop-blur-xl"
      >
        <span className="text-lg font-bold tracking-tight" style={{ color: accent }}>
          {b.name}
        </span>
        <div className="flex items-center gap-3">
          <a
            href={`tel:${b.phone}`}
            className="hidden text-sm font-medium text-gray-600 transition hover:text-gray-900 sm:block"
          >
            {b.phone}
          </a>
          <a
            href={data.checkoutUrl}
            className="rounded-xl bg-gray-900 px-4 py-2 text-sm font-semibold text-white shadow-md transition hover:bg-gray-800"
          >
            לרכישת האתר
          </a>
        </div>
      </motion.nav>

      {/* ---------- Hero ---------- */}
      <header className="relative overflow-hidden pt-36">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-40 left-1/2 h-[480px] w-[760px] -translate-x-1/2 rounded-full opacity-25 blur-3xl"
          style={{ background: `radial-gradient(closest-side, ${accent}, transparent)` }}
        />
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="relative mx-auto max-w-4xl px-6 text-center"
        >
          <AvailabilityBadge accent={accent} palette={resolvePalette(null, "light")} />
          <span className="mt-4 mb-5 inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-gray-50 px-4 py-1.5 text-xs font-semibold text-gray-600">
            <Zap className="h-3.5 w-3.5" style={{ color: accent }} aria-hidden="true" />
            {b.category}
          </span>
          <h1 className="text-4xl font-extrabold leading-tight tracking-tight text-gray-900 md:text-6xl" {...editsFor("hero.headline")}>
            {hero.headline}
          </h1>
          <p className="mx-auto mt-5 max-w-2xl text-lg leading-relaxed text-gray-500" {...editsFor("hero.subheadline")}>
            {hero.subheadline}
          </p>
          <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
            <motion.a
              href={`https://wa.me/${b.whatsapp}`}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              className="inline-flex items-center gap-2 rounded-2xl bg-gray-900 px-7 py-3.5 text-base font-semibold text-white shadow-xl shadow-gray-900/15 transition hover:bg-gray-800"
            >
              {hero.ctaText}
              <ArrowLeft className="h-4 w-4" aria-hidden="true" />
            </motion.a>
          </div>
          <div className="mt-8 flex items-center justify-center gap-2 text-sm text-gray-500">
            <Stars rating={Math.round(b.googleRating)} />
            <span className="font-semibold text-gray-800">{b.googleRating.toFixed(1)}</span>
            <span>• {b.reviewsCount} ביקורות ב-Google</span>
          </div>
        </motion.div>

        {/* Hero visual */}
        <motion.div
          initial={{ opacity: 0, y: 60, scale: 0.97 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
          className="relative mx-auto mt-14 max-w-5xl px-6"
        >
          <div className="relative overflow-hidden rounded-[2rem] border border-gray-200/80 shadow-2xl shadow-gray-900/10">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={hero.backgroundImage} alt={b.name} className="h-[320px] w-full object-cover md:h-[440px]" />
            <div className="absolute inset-0 bg-gradient-to-t from-white/70 via-transparent to-transparent" />
          </div>
        </motion.div>
      </header>

      {/* ---------- Services: bento grid ---------- */}
      <section className="mx-auto max-w-6xl px-6 py-20">
        <motion.div {...fadeUp} className="mb-12 text-center">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 md:text-4xl">
            הכל במקום אחד
          </h2>
          <p className="mt-3 text-gray-500">שירותים שנבדקו על ידי לקוחות אמיתיים</p>
        </motion.div>
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {services.map((s, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45, delay: i * 0.07 }}
              className={`group rounded-3xl border border-gray-200/80 bg-gray-50/60 p-6 transition hover:-translate-y-1 hover:bg-white hover:shadow-xl hover:shadow-gray-900/8 ${i === 0 ? "sm:col-span-2" : ""}`}
            >
              <span
                className="mb-4 flex h-11 w-11 items-center justify-center rounded-2xl text-white shadow-md"
                style={{ background: accent }}
              >
                <ServiceIcon name={s.iconName} className="h-5 w-5" />
              </span>
              <h3 className="text-lg font-bold tracking-tight text-gray-900" {...editsFor(`services.${i}.title`)}>
                {s.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-gray-500" {...editsFor(`services.${i}.description`)}>
                {s.description}
              </p>
              {s.price && (
                <span
                  className="mt-4 inline-block rounded-full px-3 py-1 text-xs font-bold"
                  style={{ background: `${accent}1a`, color: accent }}
                  {...editsFor(`services.${i}.price`)}
                >
                  {s.price}
                </span>
              )}
            </motion.div>
          ))}
        </div>
      </section>

      {/* ---------- Live quote estimator ---------- */}
      <section className="mx-auto max-w-4xl px-6 py-16">
        <QuoteEstimator accent={accent} palette={resolvePalette(null, "light")} />
      </section>

      {/* ---------- Before / After showcase ---------- */}
      <section className="mx-auto max-w-5xl px-6 pb-16">
        <BeforeAfterShowcase accent={accent} palette={resolvePalette(null, "light")} />
      </section>

      {/* ---------- Process timeline ---------- */}
      <section className="mx-auto max-w-4xl px-6 py-16">
        <ProcessTimeline accent={accent} palette={resolvePalette(null, "light")} />
      </section>

      {/* ---------- Benefits strip ---------- */}
      <section className="bg-gray-50/80 py-20" dir="rtl">
        <div className="mx-auto max-w-6xl px-6">
          <motion.h2 {...fadeUp} className="mb-12 text-center text-3xl font-bold tracking-tight md:text-4xl">
            למה אנחנו <span style={{ color: accent }}>שונים</span>
          </motion.h2>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {benefits.map((bf, i) => (
              <motion.div key={i} {...fadeUp} className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-gray-200/70">
                <span className="text-sm font-bold text-gray-400">0{i + 1}</span>
                <h3 className="mt-2 text-base font-bold text-gray-900" {...editsFor(`benefits.${i}.title`)}>
                  {bf.title}
                </h3>
                <p className="mt-1.5 text-sm leading-relaxed text-gray-500" {...editsFor(`benefits.${i}.description`)}>
                  {bf.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------- Reviews ---------- */}
      <section className="mx-auto max-w-6xl px-6 py-20">
        <motion.div {...fadeUp} className="mb-12 text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-1.5 text-xs font-semibold text-emerald-700">
            <BadgeCheck className="h-4 w-4" aria-hidden="true" />
            ביקורות מאומתות ב-Google
          </span>
          <h2 className="mt-4 text-3xl font-bold tracking-tight md:text-4xl">
            לקוחות מדברים בעד עצמם
          </h2>
        </motion.div>
        <div className="grid gap-5 md:grid-cols-3">
          {reviews.map((r, i) => (
            <motion.article
              key={i}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.45, delay: i * 0.1 }}
              className="rounded-3xl border border-gray-200/80 bg-white p-6 shadow-sm"
            >
              <Stars rating={r.rating} className="h-4 w-4" />
              <p className="mt-3 text-sm leading-relaxed text-gray-600" {...editsFor(`reviews.${i}.text`)}>
                {r.text}
              </p>
              <p className="mt-4 flex items-center gap-2 font-semibold text-gray-900" {...editsFor(`reviews.${i}.author`)}>
                {r.author}
                <BadgeCheck className="h-4 w-4 text-emerald-500" aria-hidden="true" />
              </p>
            </motion.article>
          ))}
        </div>
      </section>

      {/* ---------- FAQ + contact card ---------- */}
      <section className="mx-auto max-w-6xl px-6 pb-24">
        <motion.h2 {...fadeUp} className="mb-10 text-center text-3xl font-bold tracking-tight md:text-4xl">
          שאלות נפוצות
        </motion.h2>
        <FaqAccordion
          items={faq}
          classes={{
            card: "relative rounded-2xl border border-gray-200/80 bg-white shadow-sm",
            button: "flex w-full items-center justify-between gap-4 px-6 py-5 text-right text-gray-900 hover:bg-gray-50/60",
            icon: "h-5 w-5 text-gray-400",
            answer: "px-6 pb-5 text-sm leading-relaxed text-gray-500",
          }}
        />

        <motion.div
          {...fadeUp}
          className="mt-16 rounded-[2rem] p-8 text-center text-gray-900 shadow-2xl md:p-12"
          style={{ background: `linear-gradient(150deg, ${accent}14, #ffffff 45%)`, border: `1px solid ${accent}33` }}
        >
          <h2 className="text-3xl font-bold tracking-tight md:text-4xl">מוכנים להתחיל?</h2>
          <div className="mt-6 flex flex-col items-center justify-center gap-3 text-sm text-gray-600 md:flex-row md:gap-8">
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
          <p className="mx-auto mt-8 max-w-2xl text-sm leading-relaxed text-gray-500" {...editsFor("businessInfo.description")}>
            {b.description}
          </p>
        </motion.div>
      </section>

      <WhatsAppFab accentColor={accent} />
      <VipCallbackDrawer accent={accent} palette={resolvePalette(null, "light")} />
      <MobileActionBar accentColor={accent} variant="light" />
    </div>
  );
}
