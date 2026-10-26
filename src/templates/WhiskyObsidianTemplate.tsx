"use client";

import React, { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { useSite } from "@/components/SiteProvider";
import { BeforeAfterSlider } from "@/components/BeforeAfterSlider";
import {
  EditorialHeadline,
  FaqAccordion,
  fadeUp,
  Stars,
} from "@/templates/shared";
import type { LuxTheme } from "@/lib/luxtheme";

/* ------------------------------------------------------------------ */
/* FORGE ATELIER                                                       */
/* Modelled on Awwwards-grade automotive studio sites (12 Studio's      */
/* "Forge"): pitch black #030303, extreme negative space, thin          */
/* editorial serif, photographs that dissolve into the black via a      */
/* CSS radial mask, and a horizontal automotive spec configurator.      */
/* ------------------------------------------------------------------ */

const FINISH_LEVELS = [
  { label: "סטנדרט", multiplier: 1, hint: "גימור תעשייתי מוקפד" },
  { label: "פרימיום", multiplier: 1.65, hint: "חומרים יוקרתיים ונגיעות אישיות" },
  { label: "בספוק מלא", multiplier: 2.4, hint: "עיצוב סטודיו מקצה לקצה" },
] as const;

const SCHEDULES = [
  { label: "גמיש", hint: "הסטודיו מציע תאריך בנוחות העבודה" },
  { label: "תוך חודש", hint: "מתחילים בשבועות הקרובים" },
  { label: "דחוף", hint: "עדיפות קדימה בתור של הסטודיו" },
] as const;

function parsePrice(text?: string): number | null {
  if (!text) return null;
  const digits = text.replace(/[^\d]/g, "");
  const n = digits ? parseInt(digits, 10) : NaN;
  return Number.isFinite(n) && n > 0 ? n : null;
}

function stageLabel(idx: number, total: number): string {
  return `STAGE ${String(idx).padStart(2, "0")} / ${String(total).padStart(2, "0")}`;
}

export function WhiskyObsidianTemplate() {
  const { data, editsFor } = useSite();
  const theme: LuxTheme = {
    accent: "#c59b27",
    dark: true,
    pageBg: "#030303",
    surface: "rgba(255,255,255,0.035)",
    border: "rgba(255,255,255,0.08)",
    headline: "#f4efe6",
    text: "rgba(244,239,230,0.72)",
    muted: "rgba(244,239,230,0.42)",
    fontSerif: "'Frank Ruhl Libre', serif",
  };
  const { businessInfo: b, hero, faq, projects = [], reviews, services } = data;
  const [menuOpen, setMenuOpen] = useState(false);

  /* ----- 3-Stage Spec Configurator state (click handlers only) ----- */
  const [serviceIdx, setServiceIdx] = useState(0);
  const [finishIdx, setFinishIdx] = useState(1);
  const [scheduleIdx, setScheduleIdx] = useState(0);

  const base = useMemo(() => parsePrice(services[serviceIdx]?.price), [services, serviceIdx]);
  const finish = FINISH_LEVELS[finishIdx];
  const schedule = SCHEDULES[scheduleIdx];
  const low = base ? Math.round((base * finish.multiplier) / 100) * 100 : null;
  const high = low ? Math.round((low * (scheduleIdx === 2 ? 1.25 : scheduleIdx === 1 ? 1.1 : 1)) / 100) * 100 : null;

  const specLines = [
    `שלום, המפרט מהסטודיו של ${b.name}:`,
    `• שירות: ${services[serviceIdx]?.title ?? ""}`,
    `• רמת גימור והיקף: ${finish.label}`,
    `• לוח זמנים: ${schedule.label}`,
    low
      ? `• טווח השקעה צפוי: ${low.toLocaleString("he-IL")}–${high?.toLocaleString("he-IL")} ₪`
      : "• מתעניין בהצעת מחיר מותאמת אישית",
  ];
  const specHref = `https://wa.me/${b.whatsapp}?text=${encodeURIComponent(
    `${specLines.join("\n")}\nאשמח לקבל הצעה מדויקת.`,
  )}`;

  const monogram = (b.name || "N").trim().charAt(0);
  const navItems = [
    { href: "#services", label: "שירותים" },
    { href: "#spec", label: "מפרט והצעה" },
    { href: "#showroom", label: "גלריה" },
    { href: "#beforeafter", label: "לפני ואחרי" },
    { href: "#reviews", label: "ביקורות" },
    { href: "#contact", label: "צור קשר" },
  ];

  return (
    <div
      className="relative min-h-screen pb-24"
      style={{ background: "#030303", color: theme.text }}
    >
      {/* ---------------- 3-point minimalist header ---------------- */}
      <header className="fixed inset-x-0 top-0 z-[9600] border-b border-white/[0.06] bg-[#030303]/85 backdrop-blur">
        <div className="mx-auto grid max-w-6xl grid-cols-[1fr_auto_1fr] items-center gap-2 px-5 py-3.5 text-[11px] tracking-[0.18em] md:px-8">
          {/* left: subtle contact links */}
          <div className="flex items-center gap-5" dir="ltr">
            <a
              href={`https://wa.me/${b.whatsapp}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-white/40 transition-colors duration-300 hover:text-white/90"
            >
              WhatsApp
            </a>
            <a
              href={`tel:${b.phone}`}
              className="hidden text-white/40 transition-colors duration-300 hover:text-white/90 sm:inline"
              dir="ltr"
            >
              {b.phone}
            </a>
          </div>

          {/* center: geometric monogram + business name */}
          <a href="#" className="flex items-center gap-3 justify-self-center">
            <span
              className="flex h-8 w-8 items-center justify-center border text-sm font-medium"
              style={{ borderColor: "rgba(197,155,39,0.55)", color: theme.accent, transform: "skewX(-8deg)" }}
            >
              <span style={{ transform: "skewX(8deg)" }}>{monogram}</span>
            </span>
            <span
              className="hidden text-[10px] font-medium tracking-[0.32em] text-white/70 sm:inline"
              {...editsFor("businessInfo.name")}
            >
              {b.name}
            </span>
          </a>

          {/* right: minimal full-screen menu trigger */}
          <div className="justify-self-end" dir="ltr">
            <button
              type="button"
              onClick={() => setMenuOpen(true)}
              className="group flex items-center gap-3 text-white/55 transition-colors duration-300 hover:text-white"
              aria-haspopup="dialog"
              aria-expanded={menuOpen}
            >
              <span className="tracking-[0.28em]">ניווט</span>
              <span className="relative block h-[9px] w-5">
                <span className="absolute inset-x-0 top-0 h-px bg-current transition-all duration-300 group-hover:bg-white" />
                <span className="absolute inset-x-0 top-1/2 h-px bg-current transition-all duration-300 group-hover:bg-white" />
                <span className="absolute inset-x-0 bottom-0 h-px bg-current transition-all duration-300 group-hover:w-2/3" />
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* ---------------- full-screen cinematic overlay menu ---------------- */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35 }}
            className="fixed inset-0 z-[100000] flex flex-col bg-[#030303]"
            role="dialog"
            aria-modal="true"
            aria-label="תפריט ניווט"
          >
            <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-6">
              <span className="text-[10px] tracking-[0.32em] text-white/40">{b.name}</span>
              <button
                type="button"
                onClick={() => setMenuOpen(false)}
                className="flex h-10 w-10 items-center justify-center border border-white/10 text-white/70 transition hover:border-white/30 hover:text-white"
                aria-label="סגור תפריט"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <nav className="mx-auto flex w-full max-w-6xl flex-1 flex-col justify-center px-6">
              {navItems.map((item, i) => (
                <motion.a
                  key={item.href}
                  href={item.href}
                  onClick={() => setMenuOpen(false)}
                  initial={{ opacity: 0, y: 26 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.08 * i + 0.1, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                  className="group flex items-baseline gap-6 border-b border-white/[0.06] py-5 md:py-7"
                  dir="rtl"
                >
                  <span className="w-10 text-[10px] tracking-[0.3em] text-white/25" dir="ltr">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span
                    className="text-3xl font-extralight leading-[1.15] text-white/70 transition-colors duration-500 group-hover:text-white md:text-5xl"
                    style={{ fontFamily: "'Frank Ruhl Libre', serif", letterSpacing: "-0.01em" }}
                  >
                    {item.label}
                  </span>
                </motion.a>
              ))}
            </nav>
            <div className="mx-auto flex w-full max-w-6xl flex-col gap-1 px-6 pb-10 text-[11px] tracking-[0.18em] text-white/30" dir="ltr">
              <a href={`tel:${b.phone}`} className="transition hover:text-white/70">{b.phone}</a>
              <span>{b.address}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ---------------- Hero: black negative space + masked image ---------------- */}
      <section className="relative overflow-hidden">
        <div className="mx-auto flex max-w-6xl flex-col items-center px-6 pb-6 pt-36 text-center md:pt-48">
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1 }}
            className="text-[10px] font-medium tracking-[0.42em] text-white/35"
            {...editsFor("businessInfo.category")}
          >
            {b.category}
          </motion.p>

          <motion.h1
            initial={{ opacity: 0, y: 34 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.05, ease: [0.22, 1, 0.36, 1] }}
            className="mt-7 text-4xl font-extralight leading-[1.15] text-[#f4efe6] md:text-6xl lg:text-7xl"
            style={{ fontFamily: "'Frank Ruhl Libre', serif", letterSpacing: "-0.02em" }}
          >
            <EditorialHeadline text={hero.headline} />
          </motion.h1>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.35 }}
            className="mt-10 flex flex-wrap items-center justify-center gap-6 text-[12px] tracking-[0.2em] text-white/55"
          >
            <a
              href={`https://wa.me/${b.whatsapp}`}
              target="_blank"
              rel="noopener noreferrer"
              className="border-b border-white/25 pb-1.5 transition-colors duration-300 hover:border-white/80 hover:text-white"
            >
              {hero.ctaText}
            </a>
            <span className="text-white/20">/</span>
            <a
              href={`tel:${b.phone}`}
              className="border-b border-white/25 pb-1.5 transition-colors duration-300 hover:border-white/80 hover:text-white"
              dir="ltr"
            >
              {b.phone}
            </a>
          </motion.div>
        </div>

        {/* Wide dramatic studio image — CSS radial mask dissolves the edges
            of the photograph into the #030303 background seamlessly. */}
        {hero.backgroundImage && (
          <motion.div
            initial={{ opacity: 0, scale: 1.04 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.4, delay: 0.25, ease: [0.22, 1, 0.36, 1] }}
            className="relative mx-auto max-w-6xl px-4 pb-4 md:px-6"
          >
            <div className="relative h-[46vh] w-full md:h-[68vh]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={hero.backgroundImage}
                alt=""
                className="h-full w-full object-cover"
                style={{
                  maskImage:
                    "radial-gradient(ellipse 72% 62% at 50% 42%, black 46%, transparent 76%), linear-gradient(to bottom, transparent 0, black 12%, black 86%, transparent 100%), radial-gradient(ellipse 60% 55% at 50% 45%, black 40%, transparent 72%)",
                  WebkitMaskImage:
                    "radial-gradient(ellipse 72% 62% at 50% 42%, black 46%, transparent 76%)",
                }}
              />
            </div>
          </motion.div>
        )}

        {/* tiny understated 1-line subtitle */}
        <div className="mx-auto max-w-3xl px-6 pt-10 text-center">
          <motion.p
            {...fadeUp}
            className="text-[11px] leading-[2] tracking-[0.14em] text-white/40"
            {...editsFor("hero.subheadline")}
          >
            {hero.subheadline}
          </motion.p>
          <motion.div {...fadeUp} className="mx-auto mt-8 h-px w-10 bg-white/15" />
        </div>
      </section>

      {/* ---------- Services — numbered editorial index rows ---------- */}
      <section id="services" className="mx-auto max-w-6xl px-6 py-24 md:py-32">
        <div className="mb-12 flex items-end justify-between border-b border-white/[0.08] pb-4" dir="rtl">
          <span className="text-[10px] tracking-[0.36em] text-white/30" dir="ltr">01 / SERVICES</span>
          <h2
            className="text-2xl font-light text-[#f4efe6] md:text-3xl"
            style={{ fontFamily: "'Frank Ruhl Libre', serif" }}
          >
            השירותים של הסטודיו
          </h2>
        </div>
        <ul dir="rtl">
          {services.map((s, i) => (
            <li
              key={i}
              className="group grid grid-cols-[3rem_1fr_auto] items-baseline gap-4 border-b border-white/[0.06] py-7"
            >
              <span className="text-[10px] tracking-[0.3em] text-white/25" dir="ltr">
                {String(i + 1).padStart(2, "0")}
              </span>
              <div>
                <h3
                  className="text-xl font-light leading-[1.15] text-white/85 transition-colors duration-300 group-hover:text-white md:text-2xl"
                  style={{ fontFamily: "'Frank Ruhl Libre', serif" }}
                  {...editsFor(`services.${i}.title`)}
                >
                  {s.title}
                </h3>
                <p className="mt-1.5 max-w-xl text-[13px] leading-relaxed text-white/35" {...editsFor(`services.${i}.description`)}>
                  {s.description}
                </p>
              </div>
              <span className="text-[11px] tracking-[0.12em] text-white/45" {...editsFor(`services.${i}.price`)}>
                {s.price}
              </span>
            </li>
          ))}
        </ul>
      </section>

      {/* ---------- 3-Stage horizontal Spec Configurator ---------- */}
      <section id="spec" className="mx-auto max-w-6xl px-6 pb-24 md:pb-32">
        <div className="mb-12 flex items-end justify-between border-b border-white/[0.08] pb-4" dir="rtl">
          <span className="text-[10px] tracking-[0.36em] text-white/30" dir="ltr">02 / CONFIGURATOR</span>
          <h2
            className="text-2xl font-light text-[#f4efe6] md:text-3xl"
            style={{ fontFamily: "'Frank Ruhl Libre', serif" }}
          >
            בניית מפרט והצעת מחיר
          </h2>
        </div>

        <div className="grid gap-10 lg:grid-cols-[1fr_20rem]">
          {/* Stage columns — automotive style */}
          <div className="grid gap-px bg-white/[0.08] sm:grid-cols-3" dir="rtl">
            {/* STAGE 01 בחירת שירות */}
            <div className="flex flex-col bg-[#030303] p-6">
              <p className="text-[10px] tracking-[0.34em]" dir="ltr" style={{ color: theme.accent }}>
                {stageLabel(1, 3)}
              </p>
              <h3 className="mt-1.5 mb-6 text-lg font-light text-white/80" style={{ fontFamily: "'Frank Ruhl Libre', serif" }}>
                בחירת שירות
              </h3>
              <div className="flex flex-col gap-1" role="radiogroup" aria-label="בחירת שירות">
                {services.map((s, i) => (
                  <button
                    key={i}
                    type="button"
                    role="radio"
                    aria-checked={serviceIdx === i}
                    onClick={() => setServiceIdx(i)}
                    className={`flex items-baseline justify-between border-b px-1 py-3 text-right text-[13px] transition-colors duration-200 ${
                      serviceIdx === i
                        ? "border-[#c59b27]/60 text-white"
                        : "border-white/[0.07] text-white/45 hover:border-white/25 hover:text-white/80"
                    }`}
                  >
                    <span>{s.title}</span>
                    {serviceIdx === i && <span className="text-[9px] tracking-[0.3em]" dir="ltr" style={{ color: theme.accent }}>✓</span>}
                  </button>
                ))}
              </div>
            </div>

            {/* STAGE 02 רמת גימור והיקף */}
            <div className="flex flex-col bg-[#030303] p-6">
              <p className="text-[10px] tracking-[0.34em]" dir="ltr" style={{ color: theme.accent }}>
                {stageLabel(2, 3)}
              </p>
              <h3 className="mt-1.5 mb-6 text-lg font-light text-white/80" style={{ fontFamily: "'Frank Ruhl Libre', serif" }}>
                רמת גימור והיקף
              </h3>
              <div className="flex flex-col gap-1" role="radiogroup" aria-label="רמת גימור והיקף">
                {FINISH_LEVELS.map((f, i) => (
                  <button
                    key={f.label}
                    type="button"
                    role="radio"
                    aria-checked={finishIdx === i}
                    onClick={() => setFinishIdx(i)}
                    className={`flex flex-col items-start border-b px-1 py-3 text-right transition-colors duration-200 ${
                      finishIdx === i
                        ? "border-[#c59b27]/60"
                        : "border-white/[0.07] hover:border-white/25"
                    }`}
                  >
                    <span className={`text-[13px] ${finishIdx === i ? "text-white" : "text-white/45"}`}>{f.label}</span>
                    <span className="text-[10px] text-white/25">{f.hint}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* STAGE 03 לוח זמנים */}
            <div className="flex flex-col bg-[#030303] p-6">
              <p className="text-[10px] tracking-[0.34em]" dir="ltr" style={{ color: theme.accent }}>
                {stageLabel(3, 3)}
              </p>
              <h3 className="mt-1.5 mb-6 text-lg font-light text-white/80" style={{ fontFamily: "'Frank Ruhl Libre', serif" }}>
                לוח זמנים
              </h3>
              <div className="flex flex-col gap-1" role="radiogroup" aria-label="לוח זמנים">
                {SCHEDULES.map((sc, i) => (
                  <button
                    key={sc.label}
                    type="button"
                    role="radio"
                    aria-checked={scheduleIdx === i}
                    onClick={() => setScheduleIdx(i)}
                    className={`flex items-center justify-between border-b px-1 py-3 text-right transition-colors duration-200 ${
                      scheduleIdx === i
                        ? "border-[#c59b27]/60"
                        : "border-white/[0.07] hover:border-white/25"
                    }`}
                  >
                    <span className={`text-[13px] ${scheduleIdx === i ? "text-white" : "text-white/45"}`}>{sc.label}</span>
                    {scheduleIdx === i && <span className="text-[9px] tracking-[0.3em]" dir="ltr" style={{ color: theme.accent }}>✓</span>}
                  </button>
                ))}
              </div>
              <p className="mt-6 text-[10px] leading-relaxed text-white/25">{schedule.hint}</p>
            </div>
          </div>

          {/* Live spec sheet summary */}
          <aside className="flex flex-col border border-white/[0.08] p-6" aria-live="polite" dir="rtl">
            <p className="text-[10px] tracking-[0.34em] text-white/30" dir="ltr">LIVE SPEC SHEET</p>
            <h3 className="mt-1.5 mb-6 text-lg font-light text-white/80" style={{ fontFamily: "'Frank Ruhl Libre', serif" }}>                דף המפרט החי
            </h3>
            <dl className="flex-1 space-y-4 text-[13px]">
              <div>
                <dt className="text-[10px] tracking-[0.24em] text-white/25">שירות</dt>
                <dd className="mt-1 text-white/85">{services[serviceIdx]?.title}</dd>
              </div>
              <div>
                <dt className="text-[10px] tracking-[0.24em] text-white/25">גימור והיקף</dt>
                <dd className="mt-1 text-white/85">{finish.label}</dd>
              </div>
              <div>
                <dt className="text-[10px] tracking-[0.24em] text-white/25">לוח זמנים</dt>
                <dd className="mt-1 text-white/85">{schedule.label}</dd>
              </div>
              <div className="border-t border-white/[0.08] pt-4">
                <dt className="text-[10px] tracking-[0.24em] text-white/25">טווח השקעה צפוי</dt>
                <dd className="mt-1 text-2xl font-light text-[#f4efe6]" dir="ltr" style={{ fontFamily: "'Frank Ruhl Libre', serif" }}>
                  {low ? (
                    <>₪{low.toLocaleString("he-IL")}<span className="text-white/30"> — ₪{high?.toLocaleString("he-IL")}</span></>
                  ) : (
                    "בהתאמה אישית"
                  )}
                </dd>
              </div>
            </dl>
            <a
              href={specHref}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-8 block w-full border py-3.5 text-center text-[12px] tracking-[0.2em] transition-all duration-300 hover:bg-[#c59b27] hover:text-[#030303]"
              style={{ borderColor: "rgba(197,155,39,0.55)", color: "#f4efe6" }}
            >
              שליחת המפרט בוואטסאפ
            </a>
          </aside>
        </div>
      </section>

      {/* ---------- Horizontal Showroom Gallery ---------- */}
      <section id="showroom" className="mx-auto md:px-6 md:pb-24">
        <div className="mx-auto mb-12 flex max-w-6xl items-end justify-between border-b border-white/[0.08] px-0 pb-4 md:px-0" dir="rtl">
          <span className="text-[10px] tracking-[0.36em] text-white/30" dir="ltr">03 / SHOWROOM</span>
          <h2 className="text-2xl font-light text-[#f4efe6] md:text-3xl" style={{ fontFamily: "'Frank Ruhl Libre', serif" }}>
            אולם התצוגה
          </h2>
        </div>
        <div
          className="flex snap-x snap-mandatory gap-5 overflow-x-auto px-6 pb-6 md:px-[max(1.5rem,calc((100vw-72rem)/2+1.5rem))]"
          style={{ scrollbarWidth: "thin", scrollbarColor: "rgba(255,255,255,0.18) transparent" }}
        >
          {projects.map((p, i) => (
            <article
              key={i}
              className="min-w-[82vw] max-w-[86vw] shrink-0 snap-center border p-1 md:min-w-[560px] md:max-w-[560px]"
              style={{ borderColor: "rgba(255,255,255,0.08)" }}
            >
              {p.afterImage && (
                <div className="relative h-[38vh] w-full overflow-hidden md:h-[52vh]">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={p.afterImage} alt={p.title} loading="lazy" className="h-full w-full object-cover" />
                  <div
                    className="absolute inset-0"
                    style={{
                      background: "linear-gradient(180deg, transparent 55%, rgba(3,3,3,0.75) 100%)",
                    }}
                  />
                </div>
              )}
              <div className="flex items-baseline justify-between px-4 py-4" dir="rtl">
                <h3 className="text-lg font-light text-white/90" style={{ fontFamily: "'Frank Ruhl Libre', serif" }}>
                  {p.title}
                </h3>
                <span className="text-[10px] tracking-[0.3em] text-white/25" dir="ltr">
                  NO. {String(i + 1).padStart(3, "0")}
                </span>
              </div>
              {p.description && (
                <p className="px-4 pb-5 text-[12px] leading-relaxed text-white/40">
                  {p.description}
                </p>
              )}
            </article>
          ))}
          {projects.length === 0 && (
            <article className="min-w-[82vw] border border-white/[0.08] p-10 text-white/30" dir="rtl">
              הגלריה מתמלאת כעת — בקרוב פרויקטים של הסטודיו.
            </article>
          )}
        </div>
      </section>

      {/* ---------- Draggable Before/After ---------- */}
      <section id="beforeafter" className="mx-auto max-w-6xl px-6 pb-24 md:pb-32">
        <div className="mb-12 flex items-end justify-between border-b border-white/[0.08] pb-4" dir="rtl">
          <span className="text-[10px] tracking-[0.36em] text-white/30" dir="ltr">04 / COMPARISON</span>
          <h2 className="text-2xl font-light text-[#f4efe6] md:text-3xl" style={{ fontFamily: "'Frank Ruhl Libre', serif" }}>
            לפני ואחרי — בגרירה
          </h2>
        </div>
        <BeforeAfterSlider
          theme={theme}
          beforeImage={projects[0]?.beforeImage}
          afterImage={projects[0]?.afterImage}
          beforeLabel="לפני — עבודה רגילה"
          afterLabel="אחרי — בסטנדרט הסטודיו"
          caption=""
        />
      </section>

      {/* ---------- Reviews — monumental quotes ---------- */}
      <section id="reviews" className="mx-auto max-w-6xl px-6 pb-24 md:pb-32">
        <div className="mb-12 flex items-end justify-between border-b border-white/[0.08] pb-4" dir="rtl">
          <span className="text-[10px] tracking-[0.36em] text-white/30" dir="ltr">05 / CLIENTS</span>
          <Stars rating={Math.round(b.googleRating)} className="h-3.5 w-3.5" starClass="text-[#c59b27]" />
        </div>
        <div className="grid gap-px bg-white/[0.06] md:grid-cols-3">
          {reviews.slice(0, 3).map((r, i) => (
            <figure key={i} className="flex flex-col justify-between bg-[#030303] p-8" dir="rtl">
              <blockquote
                className="text-[15px] font-light leading-[1.8] text-white/70"
                style={{ fontFamily: "'Frank Ruhl Libre', serif" }}
              >
                {r.text}
              </blockquote>
              <figcaption className="mt-8 flex items-center justify-between text-[11px] tracking-[0.18em] text-white/35">
                <span {...editsFor(`reviews.${i}.author`)}>{r.author}</span>
                <span className="text-white/25" dir="ltr">{r.rating}.0 / 5.0</span>
              </figcaption>
            </figure>
          ))}
        </div>
      </section>

      {/* ---------- FAQ + Contact ---------- */}
      <section className="mx-auto max-w-3xl px-6 pb-20">
        <h2
          className="mb-10 text-center text-2xl font-light text-[#f4efe6] md:text-3xl"
          style={{ fontFamily: "'Frank Ruhl Libre', serif" }}
        >
          שאלות שנשאלות בסטודיו
        </h2>
        <FaqAccordion
          items={faq}
          classes={{
            card: "border border-white/[0.07] overflow-hidden",
            button: "flex w-full items-center justify-between gap-4 px-6 py-5 text-right text-[13px] text-white/80",
            icon: "h-4 w-4 text-white/30",
            answer: "px-6 pb-5 text-[12px] leading-relaxed text-white/40",
          }}
        />
      </section>

      <footer id="contact" className="border-t border-white/[0.06] py-16 text-center" dir="rtl">
        <p
          className="text-2xl font-light text-[#f4efe6] md:text-3xl"
          style={{ fontFamily: "'Frank Ruhl Libre', serif" }}
          {...editsFor("businessInfo.description")}
        >
          {b.description}
        </p>
        <div className="mt-10 flex flex-wrap items-center justify-center gap-x-8 gap-y-2 text-[11px] tracking-[0.18em] text-white/40">
          <span>{b.openingHours}</span>
          <span>{b.address}</span>
          <a href={`tel:${b.phone}`} dir="ltr" className="hover:text-white/80">{b.phone}</a>
        </div>
      </footer>
    </div>
  );
}
