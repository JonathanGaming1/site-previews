"use client";

import React, { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { useSite } from "@/components/SiteProvider";
import { BeforeAfterSlider } from "@/components/BeforeAfterSlider";
import {
  EditorialHeadline,
  FaqAccordion,
  RatingBars,
  formatNis,
  parsePrice,
  waLink,
} from "@/templates/shared";
import type { LuxTheme } from "@/lib/luxtheme";
import {
  CameraPortal,
  Magnetic,
  Parallax,
  SpecMark,
  SpecularLight,
  TiltStage,
} from "@/templates/motion";

/* ------------------------------------------------------------------ */
/* FORGE / DARK LUXURY ATELIER                                         */
/* Obsidian #030303, British bespoke workshop restraint, a 3-point    */
/* header, a masked studio photograph dissolving into the page, and a */
/* three-stage specification commission desk.                          */
/* ------------------------------------------------------------------ */

const FINISHES = [
  {
    code: "01",
    name: "Bespoke",
    he: "בספוק",
    multiplier: 1,
    detail: "תפירה מלאה למידות, חומרים נבחרים וגימור יד.",
  },
  {
    code: "02",
    name: "Signature",
    he: "סיגנצ'ור",
    multiplier: 1.42,
    detail: "שכבת גימור שנייה, מבחר חומרים מורחב ונגיעות אישיות.",
  },
  {
    code: "03",
    name: "Reserve",
    he: "ריזרב",
    multiplier: 1.95,
    detail: "רזרבה מלאה של הסטודיו: עדיפות, פיקוח צמוד וליווי אישי.",
  },
] as const;

const SCHEDULES = [
  { name: "Flexible", he: "גמיש", months: 0, note: "הסטודיו קובע תאריך בנוחות העבודה" },
  { name: "Season", he: "העונה הקרובה", months: 1, note: "פתיחה בתור בעונה הנוכחית" },
  { name: "Priority", he: "עדיפות", months: 2, note: "מקום קדמי בתור הסטודיו" },
] as const;

const NAV_ITEMS = [
  { href: "#atelier", label: "הסטודיו" },
  { href: "#commission", label: "בניית מפרט" },
  { href: "#work", label: "עבודות" },
  { href: "#clients", label: "לקוחות" },
  { href: "#contact", label: "יצירת קשר" },
];

export function ForgeAutomotiveTemplate() {
  const { data, editsFor } = useSite();
  const { businessInfo: b, hero, services, faq, reviews, projects = [], benefits = [] } = data;

  const accent = data.theme.accentColor || "#c59b27";
  const primary = data.theme.primaryColor || "#f4efe6";

  const [menuOpen, setMenuOpen] = useState(false);
  const [serviceIdx, setServiceIdx] = useState(0);
  const [finishIdx, setFinishIdx] = useState(1);
  const [scheduleIdx, setScheduleIdx] = useState(0);

  const base = useMemo(
    () => parsePrice(services[serviceIdx]?.price) ?? 12000,
    [services, serviceIdx],
  );
  const finish = FINISHES[finishIdx];
  const schedule = SCHEDULES[scheduleIdx];
  const low = Math.round((base * finish.multiplier) / 100) * 100;
  const high = Math.round((low * (1 + schedule.months * 0.08)) / 100) * 100;
  const reference = `${String(serviceIdx + 1).padStart(2, "0")}·${finish.code}·${String(
    scheduleIdx + 1,
  ).padStart(2, "0")}`;

  const dispatchHref = waLink(
    b.whatsapp,
    [
      `שלום, הגעתי לסטודיו של ${b.name}.`,
      `• שירות: ${services[serviceIdx]?.title ?? ""}`,
      `• רמת גימור: ${finish.name} / ${finish.he}`,
      `• לוח זמנים: ${schedule.he}`,
      `• מפרט: ${reference}`,
      `• טווח השקעה צפוי: ${formatNis(low)}–${formatNis(high)}`,
      "אשמח לתאם מדידה ופגישת אטלייה.",
    ].join("\n"),
  );

  const theme: LuxTheme = {
    accent,
    dark: true,
    pageBg: "#030303",
    surface: "rgba(255,255,255,0.035)",
    border: "rgba(255,255,255,0.09)",
    headline: "#f4efe6",
    text: "rgba(244,239,230,0.72)",
    muted: "rgba(244,239,230,0.42)",
    fontSerif: "'Frank Ruhl Libre', serif",
  };

  const monogram = (b.name || "F").trim().charAt(0);
  const city = b.address.split(",")[0]?.trim() || b.address;

  return (
    <div
      className="relative min-h-screen overflow-x-hidden pb-24"
      style={{ background: "#030303", color: theme.text }}
      dir="rtl"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-0"
        style={{
          background:
            "radial-gradient(60% 45% at 50% -10%, rgba(197,155,39,0.07), transparent 65%), radial-gradient(50% 50% at 100% 100%, rgba(255,255,255,0.025), transparent 70%)",
        }}
      />

      {/* Cursor-tracked studio rim light — the whole showroom relights as the
          mouse moves, on top of the static ambient gradient above. */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-[5]"
      >
        <SpecularLight
          color={`color-mix(in srgb, ${accent} 13%, transparent)`}
          size={56}
        />
      </div>

      {/* ---------------- 3-point atelier header ---------------- */}
      <header className="fixed inset-x-0 top-0 z-[9600] border-b border-white/[0.07] bg-[#030303]/85 backdrop-blur-xl">
        <div className="mx-auto grid max-w-7xl grid-cols-[1fr_auto_1fr] items-center px-5 py-3.5 md:px-8">
          <div className="flex items-center gap-4 text-[10px] tracking-[0.24em] text-white/40" dir="ltr">
            <a
              href={waLink(b.whatsapp, `שלום ${b.name}, אשמח לפרטים.`)}
              target="_blank"
              rel="noopener noreferrer"
              className="transition hover:text-white/90"
            >
              WHATSAPP
            </a>
            <a
              href={`tel:${b.phone}`}
              className="hidden transition hover:text-white/90 sm:inline"
              dir="ltr"
            >
              {b.phone}
            </a>
          </div>

          <a href="#top" className="flex items-center justify-center gap-3">
            <span
              className="flex h-8 w-8 items-center justify-center border text-[13px]"
              style={{
                borderColor: `color-mix(in srgb, ${accent} 55%, transparent)`,
                color: accent,
                transform: "skewX(-9deg)",
                fontFamily: "'Frank Ruhl Libre', serif",
              }}
            >
              <span style={{ transform: "skewX(9deg)" }}>{monogram}</span>
            </span>
            <span
              className="hidden max-w-[220px] truncate text-[10px] tracking-[0.3em] text-white/75 sm:inline"
              {...editsFor("businessInfo.name")}
            >
              {b.name}
            </span>
          </a>

          <div className="justify-self-end" dir="ltr">
            <button
              type="button"
              onClick={() => setMenuOpen(true)}
              aria-haspopup="dialog"
              aria-expanded={menuOpen}
              className="group flex items-center gap-3 text-[10px] tracking-[0.28em] text-white/55 transition hover:text-white"
            >
              <span>ניווט</span>
              <span aria-hidden="true" style={{ color: accent }}>
                =
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* ---------------- full-screen velvet menu ---------------- */}
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
            <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-6 py-6">
              <span className="text-[10px] tracking-[0.32em] text-white/35">
                {b.name.toUpperCase()} / ATELIER INDEX
              </span>
              <button
                type="button"
                onClick={() => setMenuOpen(false)}
                className="flex h-10 w-10 items-center justify-center border border-white/12 text-white/70 transition hover:border-white/35 hover:text-white"
                aria-label="סגור תפריט"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
            <nav className="mx-auto flex w-full max-w-7xl flex-1 flex-col justify-center px-6">
              {NAV_ITEMS.map((item, i) => (
                <motion.a
                  key={item.href}
                  href={item.href}
                  onClick={() => setMenuOpen(false)}
                  initial={{ opacity: 0, y: 22 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.06 * i + 0.08, duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
                  className="group grid grid-cols-[3.2rem_1fr_auto] items-baseline gap-5 border-b border-white/[0.06] py-5 md:py-6"
                >
                  <span className="text-[10px] tracking-[0.3em] text-white/25" dir="ltr">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span
                    className="text-3xl font-light text-white/65 transition-colors duration-500 group-hover:text-white md:text-5xl"
                    style={{ fontFamily: "'Frank Ruhl Libre', serif", letterSpacing: "-0.015em" }}
                  >
                    {item.label}
                  </span>
                  <span className="text-white/20 transition group-hover:text-white/60" aria-hidden="true">
                    ←
                  </span>
                </motion.a>
              ))}
            </nav>
            <div className="mx-auto flex w-full max-w-7xl flex-wrap items-end justify-between gap-3 px-6 pb-10 text-[10px] tracking-[0.2em] text-white/30">
              <span>{b.address}</span>
              <a href={`tel:${b.phone}`} dir="ltr" className="hover:text-white/70">
                {b.phone}
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ---------------- hero: 3D camera portal into the showroom ----------------
          The wheel does not scroll flat panels away — the camera dollies INTO
          the centerpiece (the photograph scales, recedes and blurs past the
          lens), two velvet panels part ways, and the headline resolves from
          inside the car itself. */}
      <section id="top" className="relative z-10 overflow-hidden">
        <CameraPortal
          heightVh={320}
          perspective={1400}
          zoom={3.9}
          blurOut={24}
          veilColor="rgba(3,3,3,0.95)"
          hint={
            <span className="flex flex-col items-center gap-3 text-white/30">
              <SpecMark className="text-white/30">SCROLL — ENTER THE SHOWROOM</SpecMark>
              <span
                aria-hidden="true"
                className="block h-10 w-px"
                style={{ background: `linear-gradient(${accent}, transparent)` }}
              />
            </span>
          }
          scene={
            <div className="absolute inset-0">
              {/* multi-depth parallax: the gold bloom trails behind the car */}
              <Parallax depth={34} className="absolute inset-0">
                <div
                  aria-hidden="true"
                  className="absolute inset-0"
                  style={{
                    background:
                      "radial-gradient(46% 38% at 50% 52%, color-mix(in srgb, " +
                      accent +
                      " 16%, transparent), transparent 72%)",
                  }}
                />
              </Parallax>

              {hero.backgroundImage ? (
                <Parallax depth={12} className="absolute inset-0">
                  <TiltStage
                    intensity={7}
                    glareColor={`color-mix(in srgb, ${accent} 30%, transparent)`}
                    className="absolute inset-0"
                  >
                    <div className="relative h-full w-full">
                      {/* The photograph has no frame: a radial + linear mask
                          melts it straight into the #030303 showroom floor. */}
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={hero.backgroundImage}
                        alt=""
                        className="h-full w-full object-cover"
                        style={{
                          filter: "saturate(0.72) contrast(1.08) brightness(0.88)",
                          maskImage:
                            "radial-gradient(ellipse 74% 66% at 50% 50%, black 40%, transparent 100%)",
                          WebkitMaskImage:
                            "radial-gradient(ellipse 74% 66% at 50% 50%, black 40%, transparent 100%)",
                        }}
                      />
                    </div>
                  </TiltStage>
                </Parallax>
              ) : (
                <div className="flex h-full items-center justify-center">
                  <SpecMark className="text-white/25">FORGE / SHOWROOM</SpecMark>
                </div>
              )}

              {/* Always-visible marque so the stage is never an empty plate */}
              <div className="absolute inset-x-0 top-28 flex flex-col items-center gap-4 text-center">
                <SpecMark className="text-white/32">{b.category}</SpecMark>
                <p
                  className="text-2xl font-light tracking-[-0.02em] text-white/70 md:text-3xl"
                  style={{ fontFamily: "'Frank Ruhl Libre', serif" }}
                >
                  {b.name}
                </p>
              </div>
            </div>
          }
          pane={
            <div
              className="h-full w-full"
              style={{
                background:
                  "linear-gradient(90deg, rgba(3,3,3,0.97), rgba(3,3,3,0.76) 62%, rgba(3,3,3,0.1))",
              }}
            >
              <div
                className="h-full w-full opacity-70"
                style={{
                  backgroundImage:
                    "repeating-linear-gradient(90deg, rgba(255,255,255,0.05) 0 1px, transparent 1px 38px)",
                  maskImage: "linear-gradient(90deg, black, transparent)",
                  WebkitMaskImage: "linear-gradient(90deg, black, transparent)",
                }}
              />
            </div>
          }
          interior={
            <div className="flex h-full w-full items-center justify-center px-6">
              <div className="max-w-3xl text-center">
                <SpecMark style={{ color: accent }}>ATELIER INTERIOR</SpecMark>

                <h1
                  className="mt-7 text-[clamp(2.6rem,5.6vw,5.1rem)] font-light leading-[1.1] tracking-editorial"
                  style={{ fontFamily: "'Frank Ruhl Libre', serif", color: primary }}
                  {...editsFor("hero.headline")}
                >
                  <EditorialHeadline text={hero.headline} />
                </h1>

                <p
                  className="mx-auto mt-7 max-w-xl text-[12.5px] leading-[2] text-white/42"
                  {...editsFor("hero.subheadline")}
                >
                  {hero.subheadline}
                </p>

                <div className="mt-9 flex justify-center">
                  <Magnetic strength={0.26}>
                    <a
                      href="#commission"
                      className="group inline-flex items-center gap-3 border px-8 py-4 text-[11px] tracking-[0.22em] text-white/80 transition hover:bg-white/[0.04] hover:text-white"
                      style={{ borderColor: `color-mix(in srgb, ${accent} 55%, transparent)` }}
                    >
                      {hero.ctaText}
                      <span
                        aria-hidden="true"
                        className="transition-transform group-hover:-translate-x-1"
                        style={{ color: accent }}
                      >
                        ←
                      </span>
                    </a>
                  </Magnetic>
                </div>

                <div className="mt-12 grid grid-cols-3 gap-px border-t border-white/[0.08] pt-6 text-left">
                  {[
                    { mark: "FINISH", value: "BESPOKE" },
                    { mark: "LEAD TIME", value: `${SCHEDULES[scheduleIdx].months + 4}W` },
                    { mark: "STUDIO", value: city },
                  ].map((spec) => (
                    <div key={spec.mark} className="px-2">
                      <SpecMark className="text-white/26">{spec.mark}</SpecMark>
                      <p
                        className="mt-2 truncate text-lg font-light text-white/70"
                        dir="ltr"
                        style={{ fontFamily: "'Space Grotesk', sans-serif" }}
                      >
                        {spec.value}
                      </p>
                    </div>
                  ))}
                </div>

                <p className="mt-7 text-[10px] leading-[2.1] tracking-[0.16em] text-white/32">
                  {city} — עבודת יד, בקצב של אטלייה.
                  <br />
                  {b.openingHours}
                </p>
              </div>
            </div>
          }
        />
      </section>

      {/* ---------------- services — ledger rows ---------------- */}
      <section id="atelier" className="relative z-10 mx-auto max-w-6xl px-6 py-24 md:py-32">
        <div className="mb-3 flex items-end justify-between border-b border-white/[0.08] pb-4">
          <span className="text-[9px] tracking-[0.4em] text-white/28" dir="ltr">
            ATELIER / 01
          </span>
          <h2
            className="text-2xl font-light md:text-3xl"
            style={{ fontFamily: "'Frank Ruhl Libre', serif", color: primary }}
          >
            מה נרקם בסטודיו
          </h2>
        </div>
        <ul>
          {services.map((service, i) => (
            <li
              key={i}
              className="group grid grid-cols-[2.8rem_1fr] items-baseline gap-4 border-b border-white/[0.06] py-7 md:grid-cols-[4rem_1fr_auto]"
            >
              <span className="text-[10px] tracking-[0.3em] text-white/22" dir="ltr">
                {String(i + 1).padStart(2, "0")}
              </span>
              <div>
                <h3
                  className="text-xl font-light leading-[1.2] text-white/82 transition-colors group-hover:text-white md:text-2xl"
                  style={{ fontFamily: "'Frank Ruhl Libre', serif" }}
                  {...editsFor(`services.${i}.title`)}
                >
                  {service.title}
                </h3>
                <p
                  className="mt-2 max-w-lg text-[12.5px] leading-[1.9] text-white/34"
                  {...editsFor(`services.${i}.description`)}
                >
                  {service.description}
                </p>
              </div>
              <span
                className="col-start-2 mt-2 text-[11px] tracking-[0.1em] text-white/45 md:col-start-auto md:mt-0"
                {...editsFor(`services.${i}.price`)}
              >
                {service.price}
              </span>
            </li>
          ))}
        </ul>
      </section>

      {/* ---------------- 3-stage bespoke commission desk ---------------- */}
      <section id="commission" className="relative z-10 border-y border-white/[0.08]">
        <div className="mx-auto max-w-6xl px-6 py-20 md:py-28">
          <div className="mb-10 flex flex-wrap items-end justify-between gap-3 border-b border-white/[0.08] pb-4">
            <span className="text-[9px] tracking-[0.4em] text-white/28" dir="ltr">
              COMMISSION / 02
            </span>
            <h2
              className="text-2xl font-light md:text-3xl"
              style={{ fontFamily: "'Frank Ruhl Libre', serif", color: primary }}
            >
              הרכבת מפרט אישי
            </h2>
          </div>

          <div className="grid gap-px bg-white/[0.08] md:grid-cols-3">
            {/* Stage 01 */}
            <div className="bg-[#030303] p-5 md:p-6">
              <p className="text-[9px] tracking-[0.34em]" dir="ltr" style={{ color: accent }}>
                STAGE 01 / SERVICE
              </p>
              <h3 className="mb-5 mt-1.5 text-lg font-light" style={{ fontFamily: "'Frank Ruhl Libre', serif", color: primary }}>
                בחירת שירות
              </h3>
              <div role="radiogroup" aria-label="בחירת שירות">
                {services.map((service, i) => {
                  const active = serviceIdx === i;
                  return (
                    <button
                      key={i}
                      type="button"
                      role="radio"
                      aria-checked={active}
                      onClick={() => setServiceIdx(i)}
                      className="flex w-full items-baseline justify-between gap-3 border-b px-1 py-3 text-right transition-colors"
                      style={{
                        borderColor: active
                          ? `color-mix(in srgb, ${accent} 60%, transparent)`
                          : "rgba(255,255,255,0.07)",
                        color: active ? "#f4efe6" : "rgba(244,239,230,0.44)",
                      }}
                    >
                      <span className="text-[12.5px]">{service.title}</span>
                      <span
                        className="text-[8px] tracking-[0.28em]"
                        style={{ color: active ? accent : "rgba(255,255,255,0.2)" }}
                        dir="ltr"
                      >
                        {String(i + 1).padStart(2, "0")}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Stage 02 */}
            <div className="bg-[#030303] p-5 md:p-6">
              <p className="text-[9px] tracking-[0.34em]" dir="ltr" style={{ color: accent }}>
                STAGE 02 / FINISH
              </p>
              <h3 className="mb-5 mt-1.5 text-lg font-light" style={{ fontFamily: "'Frank Ruhl Libre', serif", color: primary }}>
                רמת גימור וחומרים
              </h3>
              <div role="radiogroup" aria-label="רמת גימור">
                {FINISHES.map((option, i) => {
                  const active = finishIdx === i;
                  return (
                    <button
                      key={option.name}
                      type="button"
                      role="radio"
                      aria-checked={active}
                      onClick={() => setFinishIdx(i)}
                      className="flex w-full flex-col items-start border-b px-1 py-2.5 text-right transition-colors"
                      style={{
                        borderColor: active
                          ? `color-mix(in srgb, ${accent} 60%, transparent)`
                          : "rgba(255,255,255,0.07)",
                      }}
                    >
                      <span className="flex w-full items-baseline justify-between gap-2">
                        <span className="text-[12.5px]" style={{ color: active ? "#f4efe6" : "rgba(244,239,230,0.44)" }}>
                          {option.name}
                          <span className="mr-2 text-[10px] text-white/30">{option.he}</span>
                        </span>
                        <span className="text-[8px] tracking-[0.28em]" style={{ color: active ? accent : "rgba(255,255,255,0.2)" }} dir="ltr">
                          {option.code}
                        </span>
                      </span>
                      <span className="mt-0.5 text-[9.5px] leading-relaxed text-white/25">
                        {option.detail}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Stage 03 */}
            <div className="bg-[#030303] p-5 md:p-6">
              <p className="text-[9px] tracking-[0.34em]" dir="ltr" style={{ color: accent }}>
                STAGE 03 / TIMELINE
              </p>
              <h3 className="mb-5 mt-1.5 text-lg font-light" style={{ fontFamily: "'Frank Ruhl Libre', serif", color: primary }}>
                לוחות זמנים
              </h3>
              <div role="radiogroup" aria-label="לוח זמנים">
                {SCHEDULES.map((option, i) => {
                  const active = scheduleIdx === i;
                  return (
                    <button
                      key={option.name}
                      type="button"
                      role="radio"
                      aria-checked={active}
                      onClick={() => setScheduleIdx(i)}
                      className="flex w-full flex-col items-start border-b px-1 py-3 text-right transition-colors"
                      style={{
                        borderColor: active
                          ? `color-mix(in srgb, ${accent} 60%, transparent)`
                          : "rgba(255,255,255,0.07)",
                      }}
                    >
                      <span className="flex w-full items-baseline justify-between gap-2">
                        <span className="text-[12.5px]" style={{ color: active ? "#f4efe6" : "rgba(244,239,230,0.44)" }}>
                          {option.he}
                        </span>
                        <span className="text-[8px] tracking-[0.24em] text-white/25" dir="ltr">
                          {option.name.toUpperCase()}
                        </span>
                      </span>
                      <span className="mt-0.5 text-[9.5px] text-white/25">{option.note}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* live telemetry sheet */}
          <div className="mt-px grid border border-white/[0.09] md:grid-cols-[1.5fr_1fr]">
            <div className="p-6 md:p-8" aria-live="polite">
              <div className="flex items-center justify-between border-b border-white/[0.07] pb-3">
                <span className="text-[9px] tracking-[0.36em] text-white/30" dir="ltr">
                  LIVE SPECIFICATION / {reference}
                </span>
                <span className="inline-flex items-center gap-2 text-[9px] tracking-[0.22em] text-white/35">
                  <span className="h-1.5 w-1.5 rounded-full" style={{ background: accent }} />
                  OPEN
                </span>
              </div>
              <dl className="mt-5 grid gap-4 sm:grid-cols-3">
                <div>
                  <dt className="text-[8.5px] tracking-[0.28em] text-white/25">SERVICE</dt>
                  <dd className="mt-1 text-[13px] text-white/82">{services[serviceIdx]?.title}</dd>
                </div>
                <div>
                  <dt className="text-[8.5px] tracking-[0.28em] text-white/25">FINISH</dt>
                  <dd className="mt-1 text-[13px] text-white/82">
                    {finish.name} <span className="text-white/35">/ {finish.he}</span>
                  </dd>
                </div>
                <div>
                  <dt className="text-[8.5px] tracking-[0.28em] text-white/25">TIMELINE</dt>
                  <dd className="mt-1 text-[13px] text-white/82">{schedule.he}</dd>
                </div>
              </dl>
              <div className="mt-6 flex flex-wrap items-end justify-between gap-4 border-t border-white/[0.07] pt-5">
                <div>
                  <p className="text-[8.5px] tracking-[0.3em] text-white/25">ESTIMATED COMMISSION</p>
                  <p
                    className="mt-1 text-3xl font-light tracking-tight md:text-4xl"
                    style={{ fontFamily: "'Frank Ruhl Libre', serif", color: primary }}
                    dir="ltr"
                  >
                    {formatNis(low)}
                    <span className="text-white/28"> — {formatNis(high)}</span>
                  </p>
                </div>
                <p className="max-w-[230px] text-[9.5px] leading-relaxed text-white/25">
                  הערכה מבוססת על המפרט שנבחר. המחיר הסופי נקבע לאחר מדידה בסטודיו.
                </p>
              </div>
            </div>
            <div className="flex flex-col justify-between gap-4 border-t border-white/[0.09] bg-white/[0.02] p-6 md:border-r md:border-t-0 md:p-8">
              <div>
                <p className="text-[9px] tracking-[0.3em] text-white/28">ATELIER DISPATCH</p>
                <p className="mt-2 text-[12px] leading-[1.9] text-white/42">
                  המפרט נשלח ישירות לוואטסאפ הסטודיו, עם כל שלוש הבחירות והערכת ההשקעה.
                </p>
              </div>
              <a
                href={dispatchHref}
                target="_blank"
                rel="noopener noreferrer"
                className="group flex items-center justify-between border px-5 py-3.5 text-[11px] tracking-[0.16em] transition-colors"
                style={{
                  borderColor: `color-mix(in srgb, ${accent} 55%, transparent)`,
                  color: primary,
                }}
              >
                שליחת המפרט לסטודיו
                <span
                  className="transition-transform group-hover:-translate-x-1"
                  style={{ color: accent }}
                  aria-hidden="true"
                >
                  ←
                </span>
              </a>
            </div>
          </div>

          {/* draggable studio split comparison */}
          <div className="mt-16 grid gap-8 lg:grid-cols-[1fr_2fr]">
            <div>
              <p className="text-[9px] tracking-[0.36em] text-white/28" dir="ltr">
                STUDIO SPLIT / 03
              </p>
              <h3
                className="mt-3 text-2xl font-light leading-[1.25] md:text-3xl"
                style={{ fontFamily: "'Frank Ruhl Libre', serif", color: primary }}
              >
                לפני שהסטודיו נגע.
                <br />
                אחרי.
              </h3>
              <p className="mt-4 max-w-xs text-[11.5px] leading-[1.9] text-white/34">
                גררו את הידית לאורך התצלום. אותו חדר, אותה אור — מלאכה אחרת.
              </p>
            </div>
            <BeforeAfterSlider
              theme={theme}
              beforeImage={projects[0]?.beforeImage}
              afterImage={projects[0]?.afterImage}
              beforeLabel="לפני"
              afterLabel="אחרי"
              caption=""
            />
          </div>
        </div>
      </section>

      {/* ---------------- process — vertical ledger ---------------- */}
      <section id="work" className="relative z-10 mx-auto max-w-6xl px-6 py-24 md:py-32">
        <div className="grid gap-10 lg:grid-cols-[1fr_2fr]">
          <div className="lg:sticky lg:top-28 lg:self-start">
            <p className="text-[9px] tracking-[0.4em] text-white/28" dir="ltr">
              METHOD / 04
            </p>
            <h2
              className="mt-4 text-3xl font-light leading-[1.2] md:text-4xl"
              style={{ fontFamily: "'Frank Ruhl Libre', serif", color: primary }}
            >
              סדר עבודה
              <br />
              של אטלייה.
            </h2>
            <p className="mt-5 max-w-xs text-[12px] leading-[1.9] text-white/34">
              {b.description}
            </p>
          </div>
          <div>
            {(data.processTimeline?.length
              ? data.processTimeline
              : (services.length ? services : benefits).slice(0, 4).map((item, i) => ({
                  title: item.title,
                  description: item.description,
                }))
            )
              .slice(0, 4)
              .map((step, i) => (
                <motion.div
                  key={`${step.title}-${i}`}
                  initial={{ opacity: 0, y: 18 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-80px" }}
                  transition={{ duration: 0.6, delay: i * 0.05 }}
                  className="grid grid-cols-[3rem_1fr] gap-4 border-t border-white/[0.08] py-7"
                >
                  <span
                    className="text-[10px] tracking-[0.24em]"
                    style={{ color: accent }}
                    dir="ltr"
                  >
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <div>
                    <h3 className="text-lg font-light text-white/85" style={{ fontFamily: "'Frank Ruhl Libre', serif" }}>
                      {step.title}
                    </h3>
                    <p className="mt-1.5 max-w-xl text-[12px] leading-[1.9] text-white/34">
                      {step.description}
                    </p>
                  </div>
                </motion.div>
              ))}
          </div>
        </div>
      </section>

      {/* ---------------- projects — cinematic strip ---------------- */}
      {projects.length > 0 && (
        <section className="relative z-10 border-y border-white/[0.08] py-16">
          <div className="mx-auto mb-8 flex max-w-6xl items-end justify-between px-6">
            <span className="text-[9px] tracking-[0.4em] text-white/28" dir="ltr">
              COMMISSIONED / 05
            </span>
            <h2 className="text-2xl font-light md:text-3xl" style={{ fontFamily: "'Frank Ruhl Libre', serif", color: primary }}>
              ארכיון העבודות
            </h2>
          </div>
          <div className="flex snap-x snap-mandatory gap-4 overflow-x-auto px-6 pb-4 md:px-[max(1.5rem,calc((100vw-72rem)/2+1.5rem))]">
            {projects.map((project, i) => (
              <figure
                key={i}
                className="min-w-[84vw] shrink-0 snap-center border border-white/[0.08] md:min-w-[520px]"
              >
                {project.afterImage && (
                  <div className="relative h-[34vh] overflow-hidden md:h-[46vh]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={project.afterImage}
                      alt={project.title}
                      loading="lazy"
                      className="h-full w-full object-cover"
                      style={{ filter: "saturate(0.8) brightness(0.9)" }}
                    />
                    <div
                      aria-hidden="true"
                      className="absolute inset-0"
                      style={{
                        background:
                          "linear-gradient(180deg, transparent 50%, rgba(3,3,3,0.8) 100%)",
                      }}
                    />
                  </div>
                )}
                <figcaption className="flex items-baseline justify-between gap-4 px-4 py-4">
                  <span className="text-base font-light text-white/85" style={{ fontFamily: "'Frank Ruhl Libre', serif" }}>
                    {project.title}
                  </span>
                  <span className="text-[9px] tracking-[0.3em] text-white/25" dir="ltr">
                    NO. {String(i + 1).padStart(3, "0")}
                  </span>
                </figcaption>
                {project.description && (
                  <p className="px-4 pb-5 text-[11.5px] leading-relaxed text-white/35">
                    {project.description}
                  </p>
                )}
              </figure>
            ))}
          </div>
        </section>
      )}

      {/* ---------------- clients — quote wall ---------------- */}
      <section id="clients" className="relative z-10 mx-auto max-w-6xl px-6 py-24 md:py-32">
        <div className="mb-8 flex items-center justify-between border-b border-white/[0.08] pb-4">
          <span className="text-[9px] tracking-[0.4em] text-white/28" dir="ltr">
            CLIENT BOOK / 06
          </span>
          <span className="flex items-center gap-3 text-[11px] text-white/45">
            {b.googleRating.toFixed(1)} / 5
            <RatingBars rating={b.googleRating} color={accent} />
          </span>
        </div>
        <div className="grid gap-px bg-white/[0.07] md:grid-cols-3">
          {reviews.slice(0, 3).map((review, i) => (
            <figure key={i} className="flex flex-col justify-between bg-[#030303] p-7 md:p-8">
              <blockquote
                className="text-[15px] font-light leading-[1.85] text-white/72 md:text-base"
                style={{ fontFamily: "'Frank Ruhl Libre', serif" }}
                {...editsFor(`reviews.${i}.text`)}
              >
                “{review.text}”
              </blockquote>
              <figcaption className="mt-8 flex items-center justify-between text-[10px] tracking-[0.2em] text-white/35">
                <span {...editsFor(`reviews.${i}.author`)}>{review.author}</span>
                <span className="text-white/22" dir="ltr">
                  {review.rating}.0
                </span>
              </figcaption>
            </figure>
          ))}
        </div>
      </section>

      {/* ---------------- FAQ + contact ---------------- */}
      <section className="relative z-10 mx-auto max-w-5xl px-6 pb-20">
        <div className="grid gap-10 lg:grid-cols-[1fr_1.4fr]">
          <div>
            <p className="text-[9px] tracking-[0.4em] text-white/28" dir="ltr">
              ENQUIRIES / 07
            </p>
            <h2
              className="mt-4 text-2xl font-light leading-[1.25] md:text-3xl"
              style={{ fontFamily: "'Frank Ruhl Libre', serif", color: primary }}
            >
              שאלות לפני
              <br />
              שמתחילים.
            </h2>
          </div>
          <FaqAccordion
            items={faq}
            classes={{
              card: "border-b border-white/[0.07]",
              button:
                "flex w-full items-center justify-between gap-4 py-5 text-right text-[12.5px] text-white/78",
              icon: "h-4 w-4 text-white/30",
              answer: "pb-5 text-[11.5px] leading-[1.9] text-white/38",
            }}
          />
        </div>
      </section>

      <footer id="contact" className="relative z-10 border-t border-white/[0.07] px-6 py-16 text-center">
        <p
          className="mx-auto max-w-4xl text-[clamp(1.8rem,4vw,3.2rem)] font-light leading-[1.3]"
          style={{ fontFamily: "'Frank Ruhl Libre', serif", color: primary }}
          {...editsFor("businessInfo.description")}
        >
          {b.description}
        </p>
        <div className="mx-auto mt-10 flex max-w-3xl flex-wrap items-center justify-center gap-x-8 gap-y-3 text-[10px] tracking-[0.2em] text-white/35">
          <span>{b.address}</span>
          <span>{b.openingHours}</span>
          <a href={`tel:${b.phone}`} dir="ltr" className="transition hover:text-white/80">
            {b.phone}
          </a>
          <a
            href={waLink(b.whatsapp, `שלום ${b.name}, אשמח לתאם פגישה באטלייה.`)}
            target="_blank"
            rel="noopener noreferrer"
            className="border-b pb-1 transition hover:text-white/80"
            style={{ borderColor: `color-mix(in srgb, ${accent} 50%, transparent)` }}
          >
            וואטסאפ
          </a>
        </div>
        <p className="mt-10 text-[8px] tracking-[0.38em] text-white/16" dir="ltr">
          {b.name.toUpperCase()} — BESPOKE ATELIER
        </p>
      </footer>
    </div>
  );
}
