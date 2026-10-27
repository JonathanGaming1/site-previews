"use client";

import React, { useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { useSite } from "@/components/SiteProvider";
import {
  EditorialHeadline,
  FaqAccordion,
  RatingBars,
  formatNis,
  parsePrice,
  waLink,
} from "@/templates/shared";

/* ------------------------------------------------------------------ */
/* KINETIC / MONOLITH                                                  */
/* Carbon #090A0D, liquid chrome, oversized kinetic Hebrew type, a     */
/* capability ticker, a waveform package modulator and a horizontal    */
/* gliding monolith deck with precision deck controls.                 */
/* ------------------------------------------------------------------ */

const CHROME =
  "linear-gradient(168deg, #ffffff 0%, #b9bfca 22%, #5a606b 44%, #eef2f7 58%, #7d838f 78%, #3b4049 100%)";

const NAV = [
  { href: "#showroom", label: "שירותים", code: "01" },
  { href: "#modulator", label: "מחשבון גל", code: "02" },
  { href: "#process", label: "תהליך", code: "03" },
  { href: "#work", label: "עבודות", code: "04" },
  { href: "#contact", label: "יצירת קשר", code: "05" },
];

function ChromeText({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <span
      className={className}
      style={{
        background: CHROME,
        WebkitBackgroundClip: "text",
        backgroundClip: "text",
        color: "transparent",
      }}
    >
      {children}
    </span>
  );
}

export function KineticMonolithTemplate() {
  const { data, editsFor } = useSite();
  const { businessInfo: b, hero, services, faq, reviews, projects = [], benefits = [] } = data;

  const accent = data.theme.accentColor || "#c8ff4d";
  const primary = data.theme.primaryColor || "#f2f4f6";

  const [menuOpen, setMenuOpen] = useState(false);
  const [serviceIdx, setServiceIdx] = useState(0);
  const [amplitude, setAmplitude] = useState(46);
  const [deckIndex, setDeckIndex] = useState(0);
  const deckRef = useRef<HTMLDivElement | null>(null);

  const deckItems = useMemo(
    () =>
      services.map((service, i) => ({
        ...service,
        image: projects[i]?.afterImage ?? hero.backgroundImage,
        project: projects[i],
      })),
    [hero.backgroundImage, projects, services],
  );

  const base = parsePrice(services[serviceIdx]?.price) ?? 9000;
  const multiplier = 0.72 + (amplitude / 100) * 2.35;
  const estimate = Math.round((base * multiplier) / 100) * 100;
  const range = Math.round((estimate * 1.18) / 100) * 100;
  const tier =
    amplitude < 30 ? "POINT" : amplitude < 68 ? "ROOM" : "FULL SYSTEM";
  const tierHe =
    amplitude < 30 ? "נקודתי" : amplitude < 68 ? "חדר שלם" : "מערכת מלאה";

  const waveBars = useMemo(() => {
    const bars = 40;
    return Array.from({ length: bars }, (_, i) => {
      const phase = (i / (bars - 1)) * Math.PI * 2;
      const envelope = Math.sin((i / (bars - 1)) * Math.PI);
      const frequency = 2 + amplitude / 14;
      const wave =
        Math.sin(phase * frequency + amplitude / 16) * 0.62 +
        Math.sin(phase * (frequency * 1.7) + amplitude / 7) * 0.26;
      return 5 + Math.abs(wave) * envelope * (12 + amplitude * 0.9);
    });
  }, [amplitude]);

  const packageHref = waLink(
    b.whatsapp,
    [
      `שלום, בניתי חבילה במחשבון הגל של ${b.name}.`,
      `• שירות: ${services[serviceIdx]?.title ?? ""}`,
      `• פרופיל: ${tier} / ${tierHe}`,
      `• עוצמת גל: ${amplitude}%`,
      `• הערכת השקעה: ${formatNis(estimate)}–${formatNis(range)}`,
      "אשמח לפרטים מדויקים.",
    ].join("\n"),
  );

  const scrollDeck = (nextIndex: number) => {
    const items = deckRef.current?.querySelectorAll<HTMLElement>("[data-deck-item]");
    if (!items?.length) return;
    const clamped = (nextIndex + items.length) % items.length;
    setDeckIndex(clamped);
    items[clamped]?.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
      inline: "center",
    });
  };

  const tickerItems = [
    b.category,
    "LIQUID CHROME FINISH",
    `${b.googleRating.toFixed(1)} / 5`,
    "MONOLITHIC PRECISION",
    b.address.split(",")[0] || b.address,
    "BUILT TO OUTLAST",
  ];

  return (
    <div
      className="relative min-h-screen overflow-x-hidden pb-20 lg:pl-12"
      style={{ background: "#090A0D", color: "rgba(242,244,246,0.72)" }}
      dir="rtl"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-0"
        style={{
          background:
            "radial-gradient(55% 42% at 76% 0%, rgba(190,205,230,0.10), transparent 68%), radial-gradient(40% 40% at 4% 70%, rgba(200,255,77,0.045), transparent 70%)",
        }}
      />

      {/* ---------------- technical status strip ---------------- */}
      <div className="fixed inset-x-0 top-0 z-[9510] flex h-8 items-center justify-between border-b border-white/10 bg-[#090A0D]/90 px-3 text-[7.5px] tracking-[0.26em] text-white/30 backdrop-blur-xl">
        <span dir="ltr">TLV 32.0853 / 34.7818</span>
        <span className="hidden sm:block" dir="ltr">
          LIQUID CHROME SYSTEMS / MMXXVI
        </span>
        <button
          type="button"
          onClick={() => setMenuOpen(true)}
          className="flex items-center gap-2 text-white/55 transition hover:text-white"
          aria-haspopup="dialog"
          aria-expanded={menuOpen}
        >
          אינדקס
          <span aria-hidden="true">+</span>
        </button>
      </div>

      {/* ---------------- vertical monolith rail ---------------- */}
      <aside className="fixed bottom-0 left-0 top-8 z-[9400] hidden w-12 flex-col items-center justify-between border-r border-white/[0.09] bg-[#090A0D]/65 py-5 backdrop-blur lg:flex">
        <span
          className="text-[8px] tracking-[0.4em] text-white/25"
          style={{ writingMode: "vertical-rl" }}
          dir="ltr"
        >
          MONOLITH / 01
        </span>
        <div className="flex flex-col items-center gap-4">
          {NAV.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="group relative flex h-4 w-4 items-center justify-center"
              aria-label={item.label}
              title={item.label}
            >
              <span className="h-1 w-1 bg-white/20 transition group-hover:bg-white/70" />
              <span
                className="pointer-events-none absolute left-6 whitespace-nowrap text-[8px] tracking-[0.2em] text-white/0 transition group-hover:text-white/50"
                dir="rtl"
              >
                {item.label}
              </span>
            </a>
          ))}
        </div>
        <span className="text-[8px] tracking-[0.3em] text-white/20" dir="ltr">
          40.7
        </span>
      </aside>

      {/* ---------------- full-screen slab index ---------------- */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100000] flex flex-col bg-[#090A0D]"
            role="dialog"
            aria-modal="true"
            aria-label="אינדקס אתר"
          >
            <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
              <span className="text-[8.5px] tracking-[0.34em] text-white/35" dir="ltr">
                SYSTEM INDEX / {b.name.toUpperCase()}
              </span>
              <button
                type="button"
                onClick={() => setMenuOpen(false)}
                className="flex h-9 w-9 items-center justify-center border border-white/15 text-white/60 transition hover:text-white"
                aria-label="סגור אינדקס"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </div>
            <nav className="grid flex-1 grid-rows-5">
              {NAV.map((item, i) => (
                <a
                  key={item.href}
                  href={item.href}
                  onClick={() => setMenuOpen(false)}
                  className="group relative flex items-center justify-between overflow-hidden border-b border-white/[0.07] px-5 md:px-10"
                >
                  <span className="relative z-10 flex items-baseline gap-5">
                    <span className="text-[9px] tracking-[0.3em] text-white/25" dir="ltr">
                      {item.code}
                    </span>
                    <span className="text-3xl font-light text-white/62 transition-colors group-hover:text-white md:text-6xl">
                      {item.label}
                    </span>
                  </span>
                  <span className="relative z-10 text-white/20 transition group-hover:text-white/60" aria-hidden="true">
                    ←
                  </span>
                  <span
                    aria-hidden="true"
                    className="absolute inset-y-0 right-0 w-0 transition-[width] duration-500 group-hover:w-full"
                    style={{ background: "rgba(255,255,255,0.035)" }}
                  />
                  <span className="absolute left-5 top-1/2 -translate-y-1/2 text-[16vw] font-light leading-none text-white/[0.015] md:text-[9vw]">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                </a>
              ))}
            </nav>
            <div className="flex items-center justify-between px-5 py-4 text-[8px] tracking-[0.24em] text-white/25" dir="ltr">
              <span>{b.phone}</span>
              <span>KINETIC MONOLITH</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ---------------- hero monolith ---------------- */}
      <section id="top" className="relative z-10 min-h-[92vh] overflow-hidden pt-24 md:pt-28">
        {/* monolith slabs */}
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 z-0">
          <span className="absolute bottom-0 right-[8%] top-[12%] w-[16vw] border-x border-white/[0.05] bg-gradient-to-b from-white/[0.035] to-transparent" />
          <span className="absolute bottom-0 right-[27%] top-[26%] w-[7vw] border-x border-white/[0.04] bg-gradient-to-b from-white/[0.02] to-transparent" />
          <span className="absolute bottom-0 left-[6%] top-[34%] w-[4vw] border-x border-white/[0.03]" />
          <span className="absolute inset-x-0 top-[26%] h-px bg-white/[0.04]" />
          <span className="absolute inset-x-0 bottom-[18%] h-px bg-white/[0.04]" />
        </div>

        <div className="relative mx-auto grid max-w-7xl items-center gap-10 px-5 md:px-8 lg:grid-cols-[1.35fr_0.65fr]">
          <div>
            <div className="mb-7 flex items-center gap-4">
              <span className="text-[8.5px] tracking-[0.36em]" style={{ color: accent }} dir="ltr">
                MONOLITH / N° 01
              </span>
              <span className="h-px w-16 bg-white/15" />
              <span
                className="text-[9px] tracking-[0.3em] text-white/30"
                {...editsFor("businessInfo.category")}
              >
                {b.category}
              </span>
            </div>

            <h1
              className="text-[clamp(3rem,7vw,6.5rem)] font-light leading-[0.98] tracking-[-0.045em]"
              style={{ color: "#f2f4f6" }}
              {...editsFor("hero.headline")}
            >
              <EditorialHeadline text={hero.headline} />
            </h1>

            <div className="mt-9 grid max-w-2xl gap-7 border-t border-white/10 pt-6 sm:grid-cols-[1fr_auto]">
              <p
                className="max-w-md text-[12.5px] leading-[2] text-white/36"
                {...editsFor("hero.subheadline")}
              >
                {hero.subheadline}
              </p>
              <div className="flex flex-col items-start gap-3">
                <a
                  href="#showroom"
                  className="group flex items-center gap-4 px-6 py-3 text-[11px] font-bold tracking-[0.1em] text-[#090A0D]"
                  style={{ background: accent }}
                >
                  {hero.ctaText}
                  <span className="transition-transform group-hover:-translate-x-1" aria-hidden="true">
                    ←
                  </span>
                </a>
                <a
                  href={`tel:${b.phone}`}
                  className="text-[10px] tracking-[0.16em] text-white/35 transition hover:text-white/75"
                  dir="ltr"
                >
                  {b.phone}
                </a>
              </div>
            </div>
          </div>

          {/* vertical hero slab */}
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="relative mx-auto w-full max-w-[300px] lg:max-w-none"
          >
            <div className="relative border border-white/12 p-1.5">
              <div className="relative h-[50vh] overflow-hidden md:h-[62vh]">
                {hero.backgroundImage ? (
                  <>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={hero.backgroundImage}
                      alt=""
                      className="h-full w-full object-cover"
                      style={{ filter: "saturate(0.45) contrast(1.12) brightness(0.8)" }}
                    />
                    <div
                      aria-hidden="true"
                      className="absolute inset-0"
                      style={{
                        background:
                          "linear-gradient(180deg, rgba(9,10,13,0.1), rgba(9,10,13,0.82))",
                      }}
                    />
                  </>
                ) : (
                  <div className="flex h-full items-center justify-center bg-white/[0.03]">
                    <span className="text-[9px] tracking-[0.4em] text-white/25" dir="ltr">
                      MONOLITH
                    </span>
                  </div>
                )}
                <ChromeText className="absolute right-3 top-3 text-[10vw] font-light leading-none tracking-tighter md:text-[5vw]">
                  01
                </ChromeText>
                <div className="absolute inset-x-3 bottom-3 border-t border-white/15 pt-3">
                  <p className="text-[8px] tracking-[0.3em] text-white/35" dir="ltr">
                    ACOUSTIC SCULPTURE
                  </p>
                  <p className="mt-1 text-sm font-light text-white/80">{b.name}</p>
                  <p className="mt-1 text-[9.5px] text-white/32">{b.tagline.slice(0, 48)}</p>
                </div>
              </div>
            </div>
            <div className="mt-2 flex items-center justify-between text-[7.5px] tracking-[0.24em] text-white/22" dir="ltr">
              <span>CARBON / {primary.toUpperCase()}</span>
              <span>Ø {String(b.reviewsCount).padStart(3, "0")}</span>
            </div>
          </motion.div>
        </div>

        {/* capability ticker */}
        <div className="relative z-10 mt-14 overflow-hidden border-y border-white/[0.08] py-2.5 ticker">
          <div className="ticker-track items-center text-[9px] tracking-[0.3em] text-white/32">
            {[...tickerItems, ...tickerItems].map((item, i) => (
              <span key={i} className="inline-flex items-center whitespace-nowrap">
                <span className="px-6">{item}</span>
                <span style={{ color: primary }}>—</span>
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------- horizontal gliding deck ---------------- */}
      <section id="showroom" className="relative z-10 py-20 md:py-28">
        <div className="mx-auto mb-7 flex max-w-7xl flex-wrap items-end justify-between gap-4 px-5 md:px-8">
          <div>
            <p className="text-[8.5px] tracking-[0.36em]" style={{ color: accent }} dir="ltr">
              SHOWROOM DECK / N° 02
            </p>
            <h2
              className="mt-3 text-[clamp(2rem,4vw,3.4rem)] font-light leading-[1.05] tracking-[-0.035em]"
              style={{ color: "#f2f4f6" }}
            >
              מודולים שנעים
              <br />
              על פס אחד.
            </h2>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => scrollDeck(deckIndex + 1)}
              className="flex h-10 w-10 items-center justify-center border border-white/15 text-white/55 transition hover:border-white/40 hover:text-white"
              aria-label="הקודם"
            >
              →
            </button>
            <button
              type="button"
              onClick={() => scrollDeck(deckIndex - 1)}
              className="flex h-10 w-10 items-center justify-center border border-white/15 text-white/55 transition hover:border-white/40 hover:text-white"
              aria-label="הבא"
            >
              ←
            </button>
            <span className="mr-2 text-[9px] tracking-[0.24em] text-white/28" dir="ltr">
              {String(deckIndex + 1).padStart(2, "0")} / {String(deckItems.length).padStart(2, "0")}
            </span>
          </div>
        </div>

        <div
          ref={deckRef}
          className="flex snap-x snap-mandatory gap-4 overflow-x-auto px-5 pb-5 md:px-[max(1.25rem,calc((100vw-80rem)/2+2rem))]"
          style={{ scrollbarWidth: "thin", scrollbarColor: "rgba(255,255,255,0.16) transparent" }}
          dir="rtl"
        >
          {deckItems.map((item, i) => (
            <article
              key={i}
              data-deck-item
              className="group relative min-w-[84vw] shrink-0 snap-center border border-white/10 md:min-w-[440px]"
            >
              <div className="relative h-[52vh] overflow-hidden md:h-[60vh]">
                {item.image ? (
                  <>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={item.image}
                      alt={item.title}
                      loading="lazy"
                      className="h-full w-full object-cover transition-transform duration-[1200ms] group-hover:scale-[1.03]"
                      style={{ filter: "saturate(0.4) contrast(1.1) brightness(0.82)" }}
                    />
                    <div
                      aria-hidden="true"
                      className="absolute inset-0"
                      style={{
                        background:
                          "linear-gradient(180deg, rgba(9,10,13,0.15), rgba(9,10,13,0.9))",
                      }}
                    />
                  </>
                ) : (
                  <div className="h-full bg-white/[0.03]" />
                )}

                <ChromeText className="absolute right-4 top-3 text-6xl font-light leading-none md:text-8xl">
                  {String(i + 1).padStart(2, "0")}
                </ChromeText>

                <div className="absolute inset-x-4 bottom-4">
                  <h3
                    className="text-2xl font-light leading-[1.2] text-white/90"
                    {...editsFor(`services.${i}.title`)}
                  >
                    {item.title}
                  </h3>
                  <div className="mt-3 flex items-end justify-between gap-4 border-t border-white/15 pt-3">
                    <p
                      className="max-w-[70%] text-[11px] leading-[1.8] text-white/42"
                      {...editsFor(`services.${i}.description`)}
                    >
                      {item.description}
                    </p>
                    <span
                      className="shrink-0 text-[11px] text-white/60"
                      {...editsFor(`services.${i}.price`)}
                    >
                      {item.price}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex items-center justify-between px-4 py-3 text-[7.5px] tracking-[0.24em] text-white/22" dir="ltr">
                <span>MODULE / {String(i + 1).padStart(2, "0")}</span>
                <span>{item.project?.title ?? "MONOLITH SERIES"}</span>
              </div>
            </article>
          ))}
        </div>

        {/* deck progress */}
        <div className="mx-auto mt-3 flex max-w-7xl gap-1.5 px-5 md:px-8">
          {deckItems.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => scrollDeck(i)}
              aria-label={`מודול ${i + 1}`}
              className="h-px flex-1 transition-colors"
              style={{ background: i === deckIndex ? accent : "rgba(255,255,255,0.12)" }}
            />
          ))}
        </div>
      </section>

      {/* ---------------- waveform modulator ---------------- */}
      <section id="modulator" className="relative z-10 border-y border-white/[0.08]">
        <div className="mx-auto max-w-7xl px-5 py-20 md:px-8 md:py-28">
          <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-[8.5px] tracking-[0.36em]" style={{ color: accent }} dir="ltr">
                WAVE MODULATOR / N° 03
              </p>
              <h2
                className="mt-3 text-[clamp(2rem,4vw,3.4rem)] font-light leading-[1.05] tracking-[-0.035em]"
                style={{ color: "#f2f4f6" }}
              >
                גררו את הגל.
                <br />
                החבילה מתכווננת.
              </h2>
            </div>
            <p className="max-w-sm text-[11px] leading-[1.95] text-white/34">
              כל תנועה של הידית מעצבת מחדש את צורת הגל ומחשבת את היקף הפרויקט
              וההשקעה בזמן אמת.
            </p>
          </div>

          <div className="grid gap-8 lg:grid-cols-[1.4fr_0.8fr]">
            <div className="border border-white/10 bg-white/[0.02] p-5 md:p-7">
              {/* live waveform */}
              <div className="relative h-[220px] overflow-hidden border border-white/[0.07] bg-[#07080b] px-2 py-3">
                <div
                  aria-hidden="true"
                  className="absolute inset-0 opacity-30"
                  style={{
                    backgroundImage:
                      "linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)",
                    backgroundSize: "40px 30px",
                  }}
                />
                <svg viewBox="0 0 560 180" className="relative h-full w-full" role="img" aria-label="גל acoustic חי">
                  <defs>
                    <linearGradient id="waveChrome" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0" stopColor={accent} stopOpacity="0.95" />
                      <stop offset="1" stopColor={accent} stopOpacity="0.16" />
                    </linearGradient>
                  </defs>
                  <line x1="0" y1="90" x2="560" y2="90" stroke="rgba(255,255,255,0.08)" strokeDasharray="2 6" />
                  {waveBars.map((height, i) => (
                    <motion.rect
                      key={i}
                      x={8 + i * 13.6}
                      width={6}
                      initial={false}
                      animate={{ height, y: 90 - height / 2 }}
                      transition={{ type: "spring", stiffness: 170, damping: 20 }}
                      fill={i % 6 === 0 ? accent : "url(#waveChrome)"}
                      opacity={i % 6 === 0 ? 1 : 0.65}
                    />
                  ))}
                </svg>
                <div className="absolute right-3 top-2 flex items-center gap-2 text-[7.5px] tracking-[0.28em] text-white/25" dir="ltr">
                  <span className="h-1.5 w-1.5 animate-pulse rounded-full" style={{ background: accent }} />
                  LIVE SIGNAL
                </div>
                <div className="absolute bottom-2 left-3 text-[7.5px] tracking-[0.24em] text-white/20" dir="ltr">
                  40 BANDS / 20Hz—20kHz
                </div>
              </div>

              <div className="mt-6">
                <div className="flex items-baseline justify-between">
                  <span className="text-[8.5px] tracking-[0.3em] text-white/32">01 / עוצמת היקף</span>
                  <span className="text-[11px] tabular-nums" style={{ color: accent }} dir="ltr">
                    {amplitude}% · {tier}
                  </span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={100}
                  value={amplitude}
                  onChange={(event) => setAmplitude(Number(event.target.value))}
                  className="kinetic-range mt-2 w-full"
                  style={{ ["--range-accent" as string]: accent }}
                  aria-label="עוצמת הגל והיקף הפרויקט"
                />
                <div className="mt-0 flex justify-between text-[7.5px] tracking-[0.2em] text-white/22" dir="ltr">
                  <span>POINT</span>
                  <span>ROOM</span>
                  <span>FULL SYSTEM</span>
                </div>
              </div>

              <div className="mt-7 border-t border-white/[0.08] pt-4">
                <p className="text-[8.5px] tracking-[0.28em] text-white/28">02 / מודול</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {services.map((service, i) => (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setServiceIdx(i)}
                      aria-pressed={serviceIdx === i}
                      className="border px-3 py-1.5 text-[10px] transition-colors"
                      style={{
                        borderColor:
                          serviceIdx === i ? accent : "rgba(255,255,255,0.12)",
                        color: serviceIdx === i ? "#f2f4f6" : "rgba(242,244,246,0.42)",
                      }}
                    >
                      {service.title}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <aside className="flex flex-col justify-between border border-white/10 bg-white/[0.025] p-6 md:p-8" aria-live="polite">
              <div>
                <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
                  <span className="text-[8.5px] tracking-[0.3em] text-white/28" dir="ltr">
                    PACKAGE ESTIMATE
                  </span>
                  <span className="text-[8px] tracking-[0.2em]" style={{ color: accent }}>
                    {tier}
                  </span>
                </div>
                <p className="mt-5 text-[8.5px] tracking-[0.26em] text-white/25">PROJECTED INVESTMENT</p>
                <p className="mt-2 text-[clamp(2rem,3.2vw,2.9rem)] font-light leading-none tracking-tight" style={{ color: "#f2f4f6" }} dir="ltr">
                  {formatNis(estimate)}
                </p>
                <p className="mt-1 text-[11px] text-white/28" dir="ltr">
                  up to {formatNis(range)}
                </p>
                <dl className="mt-7 space-y-3 border-t border-white/[0.08] pt-4 text-[10.5px]">
                  <div className="flex items-center justify-between gap-3">
                    <dt className="text-white/28">מודול</dt>
                    <dd className="text-white/72">{services[serviceIdx]?.title}</dd>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <dt className="text-white/28">פרופיל</dt>
                    <dd className="text-white/72">{tierHe}</dd>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <dt className="text-white/28">רזולוציה</dt>
                    <dd className="text-white/72" dir="ltr">
                      {Math.round(60 + amplitude * 1.8)} dpi
                    </dd>
                  </div>
                </dl>
              </div>
              <a
                href={packageHref}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-8 flex items-center justify-between px-5 py-3.5 text-[11px] font-bold text-[#090A0D]"
                style={{ background: accent }}
              >
                שליחת החבילה לוואטסאפ
                <span aria-hidden="true">←</span>
              </a>
            </aside>
          </div>
        </div>
      </section>

      {/* ---------------- monolithic process slabs ---------------- */}
      <section id="process" className="relative z-10 mx-auto max-w-7xl px-5 py-20 md:px-8 md:py-28">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-[8.5px] tracking-[0.36em]" style={{ color: accent }} dir="ltr">
              SYSTEM PHASES / N° 04
            </p>
            <h2 className="mt-3 text-[clamp(2rem,4vw,3.4rem)] font-light leading-[1.05] tracking-[-0.035em]" style={{ color: "#f2f4f6" }}>
              שלבים כמונוליתים.
            </h2>
          </div>
          <span className="text-[8px] tracking-[0.28em] text-white/22" dir="ltr">
            {benefits.length} ADVANTAGES / 4 PHASES
          </span>
        </div>

        <div className="grid gap-px bg-white/[0.08] md:grid-cols-4">
          {(data.processTimeline?.length
            ? data.processTimeline
            : benefits.slice(0, 4).map((benefit) => ({
                title: benefit.title,
                description: benefit.description,
              }))
          )
            .slice(0, 4)
            .map((phase, i) => (
              <article
                key={`${phase.title}-${i}`}
                className={`group relative flex min-h-[360px] flex-col justify-between bg-[#090A0D] p-6 md:min-h-[440px] md:p-7 ${
                  i === 1 ? "md:mt-10" : i === 3 ? "md:-mt-6" : ""
                }`}
              >
                <ChromeText className="text-5xl font-light leading-none">
                  {String(i + 1).padStart(2, "0")}
                </ChromeText>
                <div>
                  <p className="mb-4 h-px w-10" style={{ background: accent }} />
                  <h3 className="text-xl font-light leading-[1.25]" style={{ color: "#f2f4f6" }}>
                    {phase.title}
                  </h3>
                  <p className="mt-3 text-[11.5px] leading-[1.95] text-white/36">
                    {phase.description}
                  </p>
                </div>
                <span className="mt-8 text-[7.5px] tracking-[0.3em] text-white/20" dir="ltr">
                  PHASE / {String(i + 1).padStart(2, "0")}
                </span>
              </article>
            ))}
        </div>
      </section>

      {/* ---------------- work chrome strips ---------------- */}
      {projects.length > 0 && (
        <section id="work" className="relative z-10 border-y border-white/[0.08]">
          <div className="mx-auto max-w-7xl px-5 py-16 md:px-8 md:py-20">
            <div className="mb-7 flex items-end justify-between">
              <h2 className="text-2xl font-light tracking-tight md:text-4xl" style={{ color: "#f2f4f6" }}>
                ארכיון מודולים
              </h2>
              <span className="text-[8px] tracking-[0.3em] text-white/22" dir="ltr">
                FIELD RECORDS / {String(projects.length).padStart(2, "0")}
              </span>
            </div>
            <div className="grid gap-4 md:grid-cols-12">
              {projects.slice(0, 3).map((project, i) => (
                <figure
                  key={i}
                  className={`group relative border border-white/10 ${
                    i === 0 ? "md:col-span-7" : "md:col-span-5"
                  }`}
                >
                  <div className="relative h-[30vh] overflow-hidden md:h-[38vh]">
                    {project.afterImage && (
                      <>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={project.afterImage}
                          alt={project.title}
                          loading="lazy"
                          className="h-full w-full object-cover transition-transform duration-[1200ms] group-hover:scale-[1.03]"
                          style={{ filter: "saturate(0.45) contrast(1.08) brightness(0.85)" }}
                        />
                        <div
                          aria-hidden="true"
                          className="absolute inset-0"
                          style={{
                            background:
                              "linear-gradient(180deg, transparent 50%, rgba(9,10,13,0.85))",
                          }}
                        />
                      </>
                    )}
                    <figcaption className="absolute inset-x-4 bottom-4 flex items-end justify-between gap-3">
                      <span className="text-lg font-light text-white/88">{project.title}</span>
                      <span className="text-[7.5px] tracking-[0.26em] text-white/28" dir="ltr">
                        R—{String(i + 1).padStart(3, "0")}
                      </span>
                    </figcaption>
                  </div>
                  <p className="px-4 py-3 text-[10.5px] leading-relaxed text-white/32">
                    {project.description}
                  </p>
                </figure>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ---------------- reviews ledger ---------------- */}
      <section className="relative z-10 mx-auto max-w-7xl px-5 py-16 md:px-8 md:py-20">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <span className="text-[8.5px] tracking-[0.36em]" style={{ color: accent }} dir="ltr">
            SIGNAL FEEDBACK / N° 05
          </span>
          <span className="flex items-center gap-3 text-[10px] text-white/35">
            {b.googleRating.toFixed(1)} / 5
            <RatingBars rating={b.googleRating} color={accent} />
          </span>
        </div>
        <ul>
          {reviews.slice(0, 3).map((review, i) => (
            <li
              key={i}
              className="grid grid-cols-[2.5rem_1fr_auto] items-baseline gap-4 border-t border-white/[0.08] py-5"
            >
              <span className="text-[8px] tracking-[0.24em] text-white/22" dir="ltr">
                {String(i + 1).padStart(2, "0")}
              </span>
              <div>
                <p className="text-[12px] font-medium text-white/75" {...editsFor(`reviews.${i}.author`)}>
                  {review.author}
                </p>
                <p className="mt-1 max-w-2xl text-[11.5px] leading-[1.9] text-white/34" {...editsFor(`reviews.${i}.text`)}>
                  {review.text}
                </p>
              </div>
              <span className="text-[9px] tabular-nums text-white/30" dir="ltr">
                {review.rating}.0
              </span>
            </li>
          ))}
        </ul>
      </section>

      {/* ---------------- FAQ + contact slab ---------------- */}
      <section className="relative z-10 mx-auto max-w-7xl px-5 pb-20 md:px-8">
        <div className="grid gap-10 lg:grid-cols-[1fr_1.15fr]">
          <div>
            <p className="text-[8.5px] tracking-[0.36em]" style={{ color: accent }} dir="ltr">
              CONSOLE / N° 06
            </p>
            <h2 className="mt-3 text-2xl font-light leading-[1.2] md:text-3xl" style={{ color: "#f2f4f6" }}>
              שאלות מהשטח.
            </h2>
            <div className="mt-6">
              <FaqAccordion
                items={faq}
                classes={{
                  card: "border-b border-white/[0.08]",
                  button:
                    "flex w-full items-center justify-between gap-4 py-4 text-right text-[11.5px] text-white/72",
                  icon: "h-3.5 w-3.5 text-white/30",
                  answer: "pb-4 text-[11px] leading-[1.9] text-white/36",
                }}
              />
            </div>
          </div>

          <div id="contact" className="relative flex flex-col justify-between overflow-hidden border border-white/12 bg-white/[0.025] p-7 md:p-10">
            <ChromeText className="pointer-events-none absolute -left-4 -top-10 text-[10rem] font-light leading-none opacity-[0.05]">
              05
            </ChromeText>
            <div>
              <p className="text-[8.5px] tracking-[0.3em] text-white/28">CONTACT / MONOLITH</p>
              <h2 className="mt-4 text-[clamp(1.7rem,3vw,2.6rem)] font-light leading-[1.15] tracking-[-0.03em]" style={{ color: "#f2f4f6" }}>
                {b.description}
              </h2>
              <div className="mt-6 flex flex-wrap gap-x-6 gap-y-2 text-[10px] tracking-[0.14em] text-white/32">
                <span>{b.address}</span>
                <span>{b.openingHours}</span>
                <a href={`tel:${b.phone}`} dir="ltr" className="hover:text-white/75">
                  {b.phone}
                </a>
              </div>
            </div>
            <div className="mt-8 flex flex-wrap gap-2">
              <a
                href={packageHref}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-1 items-center justify-between px-5 py-3.5 text-[11px] font-bold text-[#090A0D]"
                style={{ background: accent }}
              >
                וואטסאפ ישיר
                <span aria-hidden="true">←</span>
              </a>
              <a
                href={`tel:${b.phone}`}
                className="border border-white/15 px-5 py-3.5 text-[11px] text-white/60 transition hover:text-white"
              >
                שיחה
              </a>
            </div>
          </div>
        </div>
      </section>

      <footer className="relative z-10 border-t border-white/[0.08] px-5 py-7 text-center text-[7.5px] tracking-[0.34em] text-white/18" dir="ltr">
        {b.name.toUpperCase()} · KINETIC MONOLITH SYSTEM · {b.address.toUpperCase()}
      </footer>
    </div>
  );
}
