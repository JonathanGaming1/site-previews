"use client";

import React, { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { BadgeCheck, Clock, MapPin, Phone, Star, X } from "lucide-react";
import { useSite } from "@/components/SiteProvider";
import { ServiceIcon } from "@/components/ServiceIcon";
import { TiltCard3D } from "@/components/TiltCard3D";
import { BeforeAfterSlider } from "@/components/BeforeAfterSlider";
import { Stars } from "@/templates/shared";
import type { LuxTheme } from "@/lib/luxtheme";
import type { ProjectItem } from "@/types/site";

export const fadeUp = {
  initial: { opacity: 0, y: 28 },
  whileInView: { opacity: 1, y: 0 } as const,
  viewport: { once: true, margin: "-60px" } as const,
  transition: { duration: 0.6, ease: "easeOut" as const },
};

/* ------------------------------------------------------------------ */
/* Services bento — 3D tilt cards for every template                   */
/* ------------------------------------------------------------------ */

export function ServicesGrid({
  theme,
  eyebrow,
  heading,
  columns = 4,
}: {
  theme: LuxTheme;
  eyebrow: string;
  heading: string;
  columns?: 2 | 3 | 4;
}) {
  const { data, editsFor } = useSite();
  const colClass =
    columns === 4
      ? "sm:grid-cols-2 lg:grid-cols-4"
      : columns === 3
        ? "sm:grid-cols-2 lg:grid-cols-3"
        : "sm:grid-cols-2";

  return (
    <section id="services" className="mx-auto w-full max-w-6xl px-6 py-20">
      <motion.div {...fadeUp} className="mb-12 text-center">
        <p className="text-xs font-bold tracking-[0.4em]" style={{ color: theme.accent }}>
          {eyebrow}
        </p>
        <h2
          className="mt-3 text-3xl font-bold md:text-4xl"
          style={{ color: theme.headline, fontFamily: theme.fontSerif }}
          {...editsFor("businessInfo.category")}
        >
          {heading}
        </h2>
      </motion.div>

      <div className={`grid gap-6 ${colClass}`}>
        {data.services.map((s, i) => (
          <motion.div key={i} {...fadeUp} transition={{ ...fadeUp.transition, delay: i * 0.08 }}>
            <TiltCard3D theme={theme} glare={theme.dark ? 0.16 : 0.1}>
              <article
                className="flex h-full flex-col rounded-[1.5rem] p-6"
                style={{
                  background: theme.surface,
                  border: `1px solid ${theme.border}`,
                  backdropFilter: "blur(18px)",
                }}
              >
                <span
                  className="mb-4 flex h-12 w-12 items-center justify-center rounded-2xl"
                  style={{
                    border: `1px solid ${theme.border}`,
                    background: `${theme.accent}14`,
                    color: theme.accent,
                  }}
                >
                  <ServiceIcon name={s.iconName} className="h-6 w-6" />
                </span>
                <h3
                  className="text-lg font-bold"
                  style={{ color: theme.headline }}
                  {...editsFor(`services.${i}.title`)}
                >
                  {s.title}
                </h3>
                <p
                  className="mt-2 flex-1 text-sm leading-relaxed"
                  style={{ color: theme.muted }}
                  {...editsFor(`services.${i}.description`)}
                >
                  {s.description}
                </p>
                {s.price && (
                  <p
                    className="mt-4 text-sm font-bold"
                    style={{ color: theme.accent }}
                    {...editsFor(`services.${i}.price`)}
                  >
                    {s.price}
                  </p>
                )}
              </article>
            </TiltCard3D>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Before / After showcase with project gallery                        */
/* ------------------------------------------------------------------ */

export function ProjectsSection({
  theme,
  eyebrow,
  heading,
}: {
  theme: LuxTheme;
  eyebrow: string;
  heading: string;
}) {
  const { data } = useSite();
  const projects: ProjectItem[] = data.projects ?? [];
  const hero = projects[0];
  const [lightbox, setLightbox] = useState<number | null>(null);

  return (
    <section id="projects" className="mx-auto w-full max-w-5xl px-6 py-16">
      <motion.div {...fadeUp} className="mb-8 text-center">
        <p className="text-xs font-bold tracking-[0.4em]" style={{ color: theme.accent }}>
          {eyebrow}
        </p>
        <h2
          className="mt-3 text-3xl font-bold md:text-4xl"
          style={{ color: theme.headline, fontFamily: theme.fontSerif }}
        >
          {heading}
        </h2>
      </motion.div>

      <div className="mb-8">
        <BeforeAfterSlider
          theme={theme}
          beforeImage={hero?.beforeImage}
          afterImage={hero?.afterImage}
          beforeLabel={hero?.title ? "לפני — עבודה רגילה" : undefined}
          afterLabel={hero?.title ? "אחרי — בסטנדרט שלנו" : undefined}
          caption="גררו את הידית המתכתית וראו את ההפרש בעיניים"
        />
        {hero && (
          <p className="mt-3 text-center text-sm" style={{ color: theme.muted }}>
            <span className="font-bold" style={{ color: theme.headline }}>
              {hero.title}
            </span>{" "}
            — {hero.description}
          </p>
        )}
      </div>

      {projects.length > 1 && (
        <div className="grid gap-5 md:grid-cols-2">
          {projects.slice(1).map((p, i) => (
            <motion.button
              key={i}
              {...fadeUp}
              onClick={() => setLightbox(i + 1)}
              className="overflow-hidden rounded-[1.5rem] text-right"
              style={{ background: theme.surface, border: `1px solid ${theme.border}` }}
            >
              <span className="relative block h-44 overflow-hidden md:h-52">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                {p.afterImage && (
                  <img
                    src={p.afterImage}
                    alt={p.title}
                    className="h-full w-full object-cover transition duration-700 hover:scale-105"
                  />
                )}
              </span>
              <span className="block px-5 py-4">
                <span className="block text-lg font-bold" style={{ color: theme.headline }}>
                  {p.title}
                </span>
                <span className="mt-1 block text-sm" style={{ color: theme.muted }}>
                  {p.description}
                </span>
              </span>
            </motion.button>
          ))}
        </div>
      )}

      <AnimatePresence>
        {lightbox !== null && projects[lightbox] && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setLightbox(null)}
            className="fixed inset-0 z-[98000] flex items-center justify-center bg-black/85 p-4 backdrop-blur"
          >
            <motion.figure
              initial={{ scale: 0.92, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.94, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="max-h-full w-full max-w-3xl overflow-y-auto rounded-[2rem]"
              style={{ background: theme.dark ? theme.pageBg : "#fff" }}
            >
              <div className="relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                {projects[lightbox].afterImage && (
                  <img
                    src={projects[lightbox].afterImage}
                    alt=""
                    className="h-[300px] w-full rounded-t-[2rem] object-cover md:h-[420px]"
                  />
                )}
                <button
                  onClick={() => setLightbox(null)}
                  aria-label="סגור"
                  className="absolute left-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-black/60 text-white"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <figcaption className="px-6 py-5">
                <p className="text-xl font-bold" style={{ color: theme.headline }}>
                  {projects[lightbox].title}
                </p>
                <p className="mt-2 text-sm leading-relaxed" style={{ color: theme.muted }}>
                  {projects[lightbox].description}
                </p>
              </figcaption>
            </motion.figure>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Benefits                                                            */
/* ------------------------------------------------------------------ */

export function BenefitsSection({
  theme,
  icons,
  heading,
  eyebrow,
}: {
  theme: LuxTheme;
  heading: string;
  eyebrow?: string;
  icons?: React.ComponentType<{ className?: string }>[];
}) {
  const { data, editsFor } = useSite();
  const fallback = [MapPin, BadgeCheck, Clock, Star];
  const benefitIcons = icons ?? fallback;

  return (
    <section className="w-full py-20">
      <div className="mx-auto max-w-6xl px-6">
        <motion.h2
          {...fadeUp}
          className="mb-12 text-center text-3xl font-bold md:text-4xl"
          style={{ color: theme.headline, fontFamily: theme.fontSerif }}
        >
          {eyebrow && (
            <span className="mb-3 block text-xs font-bold tracking-[0.4em]" style={{ color: theme.accent }}>
              {eyebrow}
            </span>
          )}
          {heading}
        </motion.h2>
        <div className="grid gap-8 md:grid-cols-2">
          {data.benefits.map((bf, i) => {
            const Icon = benefitIcons[i % benefitIcons.length];
            return (
              <motion.div key={i} {...fadeUp} className="flex items-start gap-4">
                <span
                  className="mt-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-full"
                  style={{ border: `1px solid ${theme.border}`, background: `${theme.accent}12`, color: theme.accent }}
                >
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </span>
                <div>
                  <h3
                    className="text-lg font-semibold"
                    style={{ color: theme.headline }}
                    {...editsFor(`benefits.${i}.title`)}
                  >
                    {bf.title}
                  </h3>
                  <p
                    className="mt-1 text-sm leading-relaxed"
                    style={{ color: theme.muted }}
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
  );
}

/* ------------------------------------------------------------------ */
/* Reviews                                                             */
/* ------------------------------------------------------------------ */

export function ReviewsSection({ theme }: { theme: LuxTheme }) {
  const { data, editsFor } = useSite();
  const b = data.businessInfo;

  return (
    <section id="reviews" className="mx-auto w-full max-w-6xl px-6 py-16">
      <motion.div {...fadeUp} className="mb-12 text-center">
        <span
          className="inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-semibold"
          style={{ border: `1px solid ${theme.border}`, background: theme.surface, color: theme.muted }}
        >
          <BadgeCheck className="h-4 w-4" style={{ color: theme.accent }} aria-hidden="true" />
          ביקורות Google מאומתות
        </span>
        <p className="mt-4 flex items-center justify-center gap-3 text-sm" style={{ color: theme.muted }}>
          <Stars rating={Math.round(b.googleRating)} className="h-4 w-4" starClass="text-[#facc15]" />
          <span className="font-bold" style={{ color: theme.headline }}>
            {b.googleRating.toFixed(1)} / 5
          </span>
          <span>({b.reviewsCount} ביקורות)</span>
        </p>
      </motion.div>

      <div className="grid gap-6 md:grid-cols-3">
        {data.reviews.map((r, i) => (
          <motion.article
            key={i}
            {...fadeUp}
            transition={{ ...fadeUp.transition, delay: i * 0.1 }}
            className="rounded-3xl p-6 backdrop-blur-xl"
            style={{ background: theme.surface, border: `1px solid ${theme.border}` }}
          >
            <div className="flex items-center gap-3">
              <span
                className="flex h-10 w-10 items-center justify-center rounded-full text-sm font-bold"
                style={{ background: theme.accent, color: theme.dark ? "#14100a" : "#fdf9f3" }}
              >
                {r.author.trim()[0]}
              </span>
              <div>
                <p
                  className="flex items-center gap-1 font-semibold"
                  style={{ color: theme.headline }}
                  {...editsFor(`reviews.${i}.author`)}
                >
                  {r.author}
                  <BadgeCheck className="h-4 w-4 text-emerald-400" aria-hidden="true" />
                </p>
                <Stars rating={r.rating} className="h-3 w-3" starClass="text-[#facc15]" />
              </div>
            </div>
            <p
              className="mt-4 text-sm leading-relaxed"
              style={{ color: theme.muted }}
              {...editsFor(`reviews.${i}.text`)}
            >
              {r.text}
            </p>
          </motion.article>
        ))}
      </div>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* Contact footer card                                                 */
/* ------------------------------------------------------------------ */

export function ContactSection({ theme, heading }: { theme: LuxTheme; heading: string }) {
  const { data, editsFor } = useSite();
  const b = data.businessInfo;

  return (
    <section id="contact" className="mx-auto w-full max-w-6xl px-6 pb-28">
      <motion.div
        {...fadeUp}
        className="rounded-3xl p-8 text-center backdrop-blur-xl md:p-12"
        style={{
          border: `1px solid ${theme.border}`,
          background: `linear-gradient(160deg, ${theme.accent}12, ${theme.surface})`,
        }}
      >
        <h2
          className="text-3xl font-bold md:text-4xl"
          style={{ color: theme.headline, fontFamily: theme.fontSerif }}
        >
          {heading}
        </h2>
        <div
          className="mt-6 flex flex-col items-center justify-center gap-3 text-sm md:flex-row md:gap-8"
          style={{ color: theme.muted }}
        >
          <span className="inline-flex items-center gap-2">
            <Clock className="h-4 w-4" style={{ color: theme.accent }} aria-hidden="true" />
            {b.openingHours}
          </span>
          <span className="inline-flex items-center gap-2">
            <MapPin className="h-4 w-4" style={{ color: theme.accent }} aria-hidden="true" />
            {b.address}
          </span>
          <span className="inline-flex items-center gap-2">
            <Phone className="h-4 w-4" style={{ color: theme.accent }} aria-hidden="true" />
            {b.phone}
          </span>
        </div>
        <p
          className="mx-auto mt-8 max-w-2xl text-sm leading-relaxed"
          style={{ color: theme.muted }}
          {...editsFor("businessInfo.description")}
        >
          {b.description}
        </p>
      </motion.div>
    </section>
  );
}
