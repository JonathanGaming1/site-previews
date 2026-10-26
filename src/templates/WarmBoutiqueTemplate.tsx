"use client";

import React from "react";
import { motion } from "framer-motion";
import { BadgeCheck, Clock, Heart, MapPin, Phone } from "lucide-react";
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
 * "warm-boutique" — warm cream/earth tones, editorial layout and
 * atmospheric cards. Ideal for restaurants, cafés and beauty salons.
 */
export function WarmBoutiqueTemplate() {
  const { data, editsFor } = useSite();
  const accent = data.theme.accentColor;
  const { businessInfo: b, hero, services, benefits, reviews, faq } = data;

  return (
    <div className="min-h-screen bg-[#f7f1e8] pb-24 text-[#2a2118] md:pb-6">
      {/* ---------- Editorial header ---------- */}
      <header className="relative overflow-hidden">
        <div className="absolute inset-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={hero.backgroundImage} alt="" className="h-full w-full object-cover opacity-20" />
          <div className="absolute inset-0 bg-gradient-to-b from-[#f7f1e8]/60 via-[#f7f1e8]/80 to-[#f7f1e8]" />
        </div>

        <nav className="relative z-10 mx-auto flex max-w-6xl items-center justify-between px-6 py-7">
          <span className="text-2xl font-bold tracking-tight" style={{ color: accent }}>
            {b.name}
          </span>
          <a
            href={data.checkoutUrl}
            className="rounded-full border border-[#2a2118]/20 px-5 py-2 text-sm font-semibold text-[#2a2118] transition hover:bg-[#2a2118]/5"
          >
            לרכישת האתר
          </a>
        </nav>

        <motion.div
          initial={{ opacity: 0, y: 34 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.85, ease: "easeOut" }}
          className="relative z-10 mx-auto grid max-w-6xl items-center gap-10 px-6 pb-20 pt-10 md:grid-cols-2 md:pt-16"
        >
          <div className="text-center md:text-right">
            <div className="mb-5 flex justify-center md:justify-start">
              <AvailabilityBadge accent={accent} palette={resolvePalette(null, "warm")} />
            </div>
            <p
              className="mb-5 text-sm font-semibold tracking-[0.3em]"
              style={{ color: accent }}
            >
              {b.category.toUpperCase()}
            </p>
            <h1
              className="text-4xl font-extrabold leading-[1.2] tracking-tight md:text-6xl"
              {...editsFor("hero.headline")}
            >
              {hero.headline}
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-[#2a2118]/70 md:mx-0 mx-auto" {...editsFor("hero.subheadline")}>
              {hero.subheadline}
            </p>
            <div className="mt-9 flex flex-wrap items-center justify-center gap-4 md:justify-start">
              <motion.a
                href={`https://wa.me/${b.whatsapp}`}
                whileHover={{ scale: 1.04 }}
                whileTap={{ scale: 0.96 }}
                className="rounded-full px-8 py-4 text-base font-bold text-[#fdf9f3] shadow-xl"
                style={{ background: `linear-gradient(120deg, ${accent}, ${accent}cc)` }}
              >
                {hero.ctaText}
              </motion.a>
              <span className="inline-flex items-center gap-2 text-sm text-[#2a2118]/60">
                <Heart className="h-4 w-4" style={{ color: accent }} aria-hidden="true" />
                {b.tagline}
              </span>
            </div>
            <div className="mt-10 flex items-center justify-center gap-2 text-sm text-[#2a2118]/60 md:justify-start">
              <Stars rating={Math.round(b.googleRating)} starClass="text-amber-500" />
              <span className="font-bold text-[#2a2118]">{b.googleRating.toFixed(1)}</span>
              <span>• {b.reviewsCount} ביקורות</span>
            </div>
          </div>

          <motion.div
            initial={{ opacity: 0, rotate: 2, y: 30 }}
            animate={{ opacity: 1, rotate: -1.5, y: 0 }}
            transition={{ duration: 0.9, delay: 0.15, ease: "easeOut" }}
            className="relative mx-auto w-full max-w-md"
          >
            <div
              className="absolute -inset-4 rounded-[2.5rem] border"
              style={{ borderColor: `${accent}55` }}
              aria-hidden="true"
            />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={hero.backgroundImage}
              alt={b.name}
              className="relative h-[360px] w-full rounded-[2rem] object-cover shadow-2xl md:h-[440px]"
            />
          </motion.div>
        </motion.div>
      </header>

      {/* ---------- Services: editorial atmospheric cards ---------- */}
      <section className="mx-auto max-w-6xl px-6 py-16">
        <motion.div {...fadeUp} className="mb-12 text-center">
          <h2 className="text-3xl font-bold tracking-tight md:text-5xl">
            כל פרט, <span style={{ color: accent }}>לגמרי שלכם</span>
          </h2>
        </motion.div>
        <div className="grid gap-6 md:grid-cols-2">
          {services.map((s, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.55, delay: i * 0.08 }}
              className="relative overflow-hidden rounded-[1.75rem] bg-white/70 p-8 shadow-lg shadow-[#2a2118]/5 ring-1 ring-[#2a2118]/5 backdrop-blur transition hover:shadow-xl"
            >
              <div
                aria-hidden="true"
                className="absolute -left-10 -top-10 h-36 w-36 rounded-full opacity-25 blur-2xl"
                style={{ background: accent }}
              />
              <div className="relative">
                <span
                  className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl"
                  style={{ background: `${accent}1f`, color: accent }}
                >
                  <ServiceIcon name={s.iconName} className="h-6 w-6" />
                </span>
                <h3 className="text-xl font-bold tracking-tight" {...editsFor(`services.${i}.title`)}>
                  {s.title}
                </h3>
                <p className="mt-2.5 max-w-md text-sm leading-relaxed text-[#2a2118]/65" {...editsFor(`services.${i}.description`)}>
                  {s.description}
                </p>
                {s.price && (
                  <p className="mt-5 text-sm font-bold tracking-wide" style={{ color: accent }} {...editsFor(`services.${i}.price`)}>
                    {s.price}
                  </p>
                )}
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* ---------- Live quote estimator ---------- */}
      <section className="mx-auto max-w-4xl px-6 py-16">
        <QuoteEstimator accent={accent} palette={resolvePalette(null, "warm")} />
      </section>

      {/* ---------- Before / After showcase ---------- */}
      <section className="mx-auto max-w-5xl px-6 pb-16">
        <BeforeAfterShowcase accent={accent} palette={resolvePalette(null, "warm")} />
      </section>

      {/* ---------- Process timeline ---------- */}
      <section className="mx-auto max-w-4xl px-6 py-16">
        <ProcessTimeline accent={accent} palette={resolvePalette(null, "warm")} />
      </section>

      {/* ---------- Benefits: editorial numbered list ---------- */}
      <section className="bg-[#efe4d3]/60 py-20">
        <div className="mx-auto max-w-4xl px-6">
          <motion.h2 {...fadeUp} className="mb-12 text-center text-3xl font-bold tracking-tight md:text-4xl">
            החוויה שאנחנו מציעים
          </motion.h2>
          <ol className="relative mx-auto max-w-2xl space-y-8">
            {benefits.map((bf, i) => (
              <motion.li key={i} {...fadeUp} className="flex items-start gap-5">
                <span
                  className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full font-bold text-[#fdf9f3]"
                  style={{ background: accent }}
                >
                  {i + 1}
                </span>
                <div>
                  <h3 className="text-lg font-bold" {...editsFor(`benefits.${i}.title`)}>
                    {bf.title}
                  </h3>
                  <p className="mt-1 text-sm leading-relaxed text-[#2a2118]/65" {...editsFor(`benefits.${i}.description`)}>
                    {bf.description}
                  </p>
                </div>
              </motion.li>
            ))}
          </ol>
        </div>
      </section>

      {/* ---------- Reviews ---------- */}
      <section className="mx-auto max-w-6xl px-6 py-20">
        <motion.div {...fadeUp} className="mb-12 text-center">
          <span className="inline-flex items-center gap-2 rounded-full bg-emerald-100 px-4 py-1.5 text-xs font-semibold text-emerald-800">
            <BadgeCheck className="h-4 w-4" aria-hidden="true" />
            ביקורות Google מאומתות
          </span>
          <h2 className="mt-4 text-3xl font-bold tracking-tight md:text-4xl">
            הלקוחות שלנו, במילים שלהם
          </h2>
        </motion.div>
        <div className="mx-auto grid max-w-4xl gap-6 md:grid-cols-3">
          {reviews.map((r, i) => (
            <motion.figure
              key={i}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: i * 0.1 }}
              className="rounded-3xl bg-white/80 p-6 shadow-md shadow-[#2a2118]/5 ring-1 ring-[#2a2118]/5"
            >
              <Stars rating={r.rating} starClass="text-amber-500" />
              <blockquote className="mt-3 text-sm leading-relaxed text-[#2a2118]/75" {...editsFor(`reviews.${i}.text`)}>
                {r.text}
              </blockquote>
              <figcaption className="mt-4 flex items-center gap-2 font-bold" {...editsFor(`reviews.${i}.author`)}>
                {r.author}
                <BadgeCheck className="h-4 w-4 text-emerald-600" aria-hidden="true" />
              </figcaption>
            </motion.figure>
          ))}
        </div>
      </section>

      {/* ---------- FAQ + closing ---------- */}
      <section className="mx-auto max-w-6xl px-6 pb-24">
        <motion.h2 {...fadeUp} className="mb-10 text-center text-3xl font-bold tracking-tight md:text-4xl">
          שאלות לפני שמתחילים
        </motion.h2>
        <FaqAccordion
          items={faq}
          classes={{
            card: "relative rounded-3xl bg-white/80 ring-1 ring-[#2a2118]/8 shadow-sm",
            button: "flex w-full items-center justify-between gap-4 px-6 py-5 text-right text-[#2a2118] hover:bg-[#f7f1e8]/70",
            icon: "h-5 w-5 text-[#2a2118]/40",
            answer: "px-6 pb-5 text-sm leading-relaxed text-[#2a2118]/65",
          }}
        />

        <motion.div
          {...fadeUp}
          className="mt-16 rounded-[2rem] p-8 text-center shadow-2xl md:p-14"
          style={{ background: `linear-gradient(140deg, ${accent}, ${accent}b3)`, color: "#fdf9f3" }}
        >
          <h2 className="text-3xl font-bold md:text-4xl">נעים מאוד להכיר</h2>
          <div className="mt-6 flex flex-col items-center justify-center gap-3 text-sm md:flex-row md:gap-8">
            <span className="inline-flex items-center gap-2">
              <Clock className="h-4 w-4" aria-hidden="true" />
              {b.openingHours}
            </span>
            <span className="inline-flex items-center gap-2">
              <MapPin className="h-4 w-4" aria-hidden="true" />
              {b.address}
            </span>
            <span className="inline-flex items-center gap-2">
              <Phone className="h-4 w-4" aria-hidden="true" />
              {b.phone}
            </span>
          </div>
          <p className="mx-auto mt-8 max-w-2xl text-sm leading-relaxed opacity-90" {...editsFor("businessInfo.description")}>
            {b.description}
          </p>
        </motion.div>
      </section>

      <WhatsAppFab accentColor={accent} />
      <VipCallbackDrawer accent={accent} palette={resolvePalette(null, "warm")} />
      <MobileActionBar accentColor={accent} variant="warm" />
    </div>
  );
}
