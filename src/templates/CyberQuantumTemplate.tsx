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

/* ------------------------------------------------------------------ */
/* KINETIC BESPOKE SHOWROOM                                            */
/* Pure carbon #07080A. Razor-sharp Swiss typography (Heebo, light      */
/* weights, tight metric tracking), a kinetic CSS marquee ticker of     */
/* capabilities, an interactive slider-based quote calculator with      */
/* draggable range sliders, and a slide-over VIP priority callback      */
/* drawer. Monochrome with one electric accent. No glows, no pills.     */
/* ------------------------------------------------------------------ */

const ACCENT = "#cdff3d";

function parsePrice(text?: string): number | null {
  if (!text) return null;
  const digits = text.replace(/[^\d]/g, "");
  const n = digits ? parseInt(digits, 10) : NaN;
  return Number.isFinite(n) && n > 0 ? n : null;
}

export function CyberQuantumTemplate() {
  const { data, editsFor } = useSite();
  const { businessInfo: b, hero, faq, reviews, services, projects = [], benefits = [] } = data;
  const [serviceIdx, setServiceIdx] = useState(0);
  const [scopeLevel, setScopeLevel] = useState(50); // 0..100 → scale 1..3
  const [urgencyLevel, setUrgencyLevel] = useState(25); // 0..100 → ×1..1.6
  const [vipOpen, setVipOpen] = useState(false);

  const base = useMemo(() => parsePrice(services[serviceIdx]?.price), [services, serviceIdx]);
  const scale = 1 + (scopeLevel / 100) * 2; // 1..3
  const hurry = 1 + (urgencyLevel / 100) * 0.6; // 1..1.6
  const low = base ? Math.round((base * scale) / 100) * 100 : null;
  const high = low ? Math.round((low * hurry) / 100) * 100 : null;

  const scopeLabel =
    scopeLevel < 33 ? "נקודתי" : scopeLevel < 66 ? "חדר או אזור" : "היקף מלא";
  const urgencyLabel =
    urgencyLevel < 33 ? "גמיש" : urgencyLevel < 66 ? "שבועות הקרובים" : "מיידי / דחוף";

  const quoteHref = `https://wa.me/${b.whatsapp}?text=${encodeURIComponent(
    [
      `שלום, חישוב מהסלון הקינטי של ${b.name}:`,
      `• שירות: ${services[serviceIdx]?.title ?? ""}`,
      `• היקף בגרירת המדד: ${scopeLabel} (${Math.round(scopeLevel)}%)`,
      `• דחיפות: ${urgencyLabel}`,
      low
        ? `• טווח השקעה צפוי: ${low.toLocaleString("he-IL")}–${high?.toLocaleString("he-IL")} ₪`
        : "• מתעניין בהצעה מותאמת אישית",
      "אשמח להצעה מדויקת.",
    ].join("\n"),
  )}`;

  /* Kinetic capability ticker — duplicated once for a seamless CSS loop */
  const tickerItems = [
    `${b.category}`,
    "ביצוע מדוד עד המולימטר",
    `${b.googleRating.toFixed(1)}★ בגוגל`,
    "לוחות זמנים סגורים",
    "אחריות מסמוכת",
    "עדכוני פרויקט בזמן אמת",
  ];

  return (
    <div
      className="relative min-h-screen pb-24"
      style={{ background: "#07080a", color: "rgba(242,244,246,0.76)" }}
      dir="rtl"
    >
      {/* Faint technical grid plane — static, zero cost */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-0 opacity-[0.28]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)",
          backgroundSize: "56px 56px",
          maskImage: "radial-gradient(75% 60% at 50% 20%, black, transparent 92%)",
          WebkitMaskImage: "radial-gradient(75% 60% at 50% 20%, black, transparent 92%)",
        }}
      />

      {/* ---------- Razor Swiss top chrome ---------- */}
      <header
        className="sticky top-0 z-[9500] flex items-center justify-between border-b px-5 py-3.5 text-[10px] tracking-[0.3em] backdrop-blur md:px-10"
        style={{ background: "rgba(7,8,10,0.88)", borderColor: "rgba(255,255,255,0.08)" }}
        dir="ltr"
      >
        <a href={`tel:${b.phone}`} className="transition-colors hover:text-white" dir="ltr">
          {b.phone}
        </a>
        <code className="text-white/50" dir="ltr" {...editsFor("businessInfo.name")}>
          {b.name.toUpperCase()}
        </code>
        <a
          href="#quote"
          className="transition-colors hover:text-white"
          style={{ color: ACCENT }}
        >
          PRICE —
        </a>
      </header>

      {/* ---------- KINETIC MARQUEE TICKER (pure CSS) ---------- */}
      <div
        className="ticker relative z-10 overflow-hidden border-b py-3"
        style={{ borderColor: "rgba(255,255,255,0.08)" }}
        dir="ltr"
        aria-label="רשימת יכולות נעות"
      >
        <div className="ticker-track items-center gap-0 text-[11px] tracking-[0.28em] text-white/45">
          {[...tickerItems, ...tickerItems].map((t, i) => (
            <span key={i} className="inline-flex items-center whitespace-nowrap">
              <span className="px-6" dir="rtl">{t}</span>
              <span style={{ color: ACCENT }}>—</span>
            </span>
          ))}
        </div>
      </div>

      {/* ---------- Hero — sharp Swiss composition ---------- */}
      <section className="relative z-10 mx-auto max-w-6xl px-6 pb-20 pt-24 md:pt-32">
        <motion.p
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-[11px] font-medium tracking-[0.42em] text-white/35"
          {...editsFor("businessInfo.category")}
        >
          {b.category}
        </motion.p>
        <motion.h1
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          className="mt-6 max-w-4xl text-4xl font-light leading-[1.15] tracking-tight sm:text-5xl md:text-6xl"
          style={{ color: "#f2f4f6" }}
          {...editsFor("hero.headline")}
        >
          <EditorialHeadline text={hero.headline} />
        </motion.h1>

        {/* Asymmetric hero split: statement + CTA pinned opposite */}
        <div className="mt-14 grid items-end gap-10 border-t pt-8 md:grid-cols-[1fr_auto]" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
          <motion.p
            {...fadeUp}
            className="max-w-xl text-[14px] leading-[1.95] text-white/45"
            {...editsFor("hero.subheadline")}
          >
            {hero.subheadline}
          </motion.p>
          <motion.div {...fadeUp} className="flex flex-col items-start gap-3">
            <a
              href={`https://wa.me/${b.whatsapp}`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-8 py-3.5 text-[13px] font-bold tracking-[0.06em] transition-transform duration-200 hover:-translate-y-0.5"
              style={{ background: ACCENT, color: "#07080a" }}
            >
              {hero.ctaText}
            </a>
            <a
              href={`tel:${b.phone}`}
              className="px-3 py-1 text-[12px] text-white/45 transition-colors hover:text-white"
              dir="ltr"
            >
              {b.phone}
            </a>
          </motion.div>
        </div>
      </section>

      {/* ---------- Services — numbered kinetic index (NO icon boxes) ---------- */}
      <section className="relative z-10 border-y" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
        <div className="mx-auto max-w-6xl px-6 py-14">
          <p className="mb-10 text-[10px] tracking-[0.4em] text-white/35" dir="ltr">
            MODULES / 01
          </p>
          <ul role="list">
            {services.map((s, i) => (
              <li
                key={i}
                className="group grid grid-cols-[3.5rem_1fr_auto] items-baseline gap-4 border-b py-6 transition-colors last:border-b-0"
                style={{ borderColor: "rgba(255,255,255,0.07)" }}
                dir="rtl"
              >
                <span className="text-[11px] tracking-[0.3em] text-white/25" dir="ltr">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div>
                  <h3
                    className="text-xl font-medium leading-[1.2] tracking-tight text-white/85 transition-colors group-hover:text-white md:text-2xl"
                    {...editsFor(`services.${i}.title`)}
                  >
                    {s.title}
                  </h3>
                  <p className="mt-1.5 max-w-xl text-[13px] leading-relaxed text-white/35" {...editsFor(`services.${i}.description`)}>
                    {s.description}
                  </p>
                </div>
                <span className="text-[12px] tabular-nums text-white/45" {...editsFor(`services.${i}.price`)}>
                  {s.price}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ---------- Slider-based quote calculator ---------- */}
      <section id="quote" className="relative z-10 mx-auto max-w-6xl px-6 py-20" >
        <div className="grid gap-10 lg:grid-cols-[7fr_5fr]">
          <div>
            <p className="mb-10 text-[10px] tracking-[0.4em] text-white/35" dir="ltr">
              CALCULATOR / 02
            </p>
            <h2
              className="text-2xl font-light leading-[1.15] tracking-tight sm:text-3xl"
              style={{ color: "#f2f4f6" }}
            >
              מדד חי: גררו את הידיות ובנו את הצעת המחיר
            </h2>

            {/* Service pick — sharp radio row */}
            <p className="mb-2.5 mt-9 text-[10px] tracking-[0.3em] text-white/35">01 — שירות</p>
            <div className="flex flex-wrap gap-x-5 gap-y-2" role="radiogroup" aria-label="בחירת שירות">
              {services.map((s, i) => (
                <button
                  key={i}
                  type="button"
                  role="radio"
                  aria-checked={serviceIdx === i}
                  onClick={() => setServiceIdx(i)}
                  className="border-b py-1 text-left text-[13px] transition-colors"
                  style={{
                    borderBottomColor: serviceIdx === i ? ACCENT : "rgba(255,255,255,0.14)",
                    color: serviceIdx === i ? "#f2f4f6" : "rgba(242,244,246,0.42)",
                  }}
                >
                  {s.title}
                </button>
              ))}
            </div>

            {/* Draggable range slider — היקף */}
            <p className="mb-0.5 mt-9 flex items-baseline justify-between text-[10px] tracking-[0.3em] text-white/35">
              <span>02 — היקף</span>
              <span className="text-white/70" dir="ltr">{scopeLabel}</span>
            </p>
            <input
              type="range"
              min={0}
              max={100}
              value={scopeLevel}
              onChange={(e) => setScopeLevel(Number(e.target.value))}
              className="kinetic-range mt-1 w-full"
              style={{ ["--range-accent" as string]: ACCENT }}
              aria-label="היקף הפרויקט"
            />
            <div className="flex justify-between text-[9px] tracking-widest text-white/25" dir="ltr">
              <span>POINT</span><span>ROOM</span><span>FULL SCOPE</span>
            </div>

            {/* Draggable range slider — דחיפות */}
            <p className="mb-0.5 mt-9 flex items-baseline justify-between text-[10px] tracking-[0.3em] text-white/35">
              <span>03 — דחיפות</span>
              <span className="text-white/70" dir="ltr">{urgencyLabel}</span>
            </p>
            <input
              type="range"
              min={0}
              max={100}
              value={urgencyLevel}
              onChange={(e) => setUrgencyLevel(Number(e.target.value))}
              className="kinetic-range mt-1 w-full"
              style={{ ["--range-accent" as string]: ACCENT }}
              aria-label="דחיפות הפרויקט"
            />
            <div className="flex justify-between text-[9px] tracking-widest text-white/25" dir="ltr">
              <span>FLEXIBLE</span><span>NEXT WEEKS</span><span>RUSH</span>
            </div>
          </div>

          {/* Live readout */}
          <aside
            className="flex flex-col justify-between gap-8 p-8"
            style={{ border: "1px solid rgba(255,255,255,0.10)", background: "rgba(255,255,255,0.03)" }}
            aria-live="polite"
            dir="rtl"
          >
            <div>
              <p className="text-[10px] tracking-[0.4em] text-white/35" dir="ltr">LIVE QUOTE</p>
              <p
                className="mt-6 text-5xl font-light leading-none tracking-tight"
                style={{ color: ACCENT }}
                dir="ltr"
              >
                {low ? `₪${low.toLocaleString("he-IL")}` : "—"}
              </p>
              {high && (
                <p className="mt-2 text-[12px] text-white/35" dir="ltr">
                  up to ₪{high.toLocaleString("he-IL")}
                </p>
              )}
              <p className="mt-8 text-[13px] leading-[1.9] text-white/45">
                {services[serviceIdx]?.title} — {scopeLabel}, בדחיפות "
                {urgencyLabel}". הטווח מעודכן לחיים תוך כדי גרירה.
              </p>
            </div>
            <div className="flex flex-col gap-2">
              <a
                href={quoteHref}
                target="_blank"
                rel="noopener noreferrer"
                className="py-3.5 text-center text-[13px] font-bold transition-opacity hover:opacity-85"
                style={{ background: ACCENT, color: "#07080a" }}
              >
                שליחת ההצעה לוואטסאפ —
              </a>
              <button
                type="button"
                onClick={() => setVipOpen(true)}
                className="py-3.5 text-center text-[13px] tracking-[0.06em] transition-colors hover:text-white"
                style={{ border: "1px solid rgba(255,255,255,0.14)", color: "rgba(242,244,246,0.7)" }}
              >
                בעדיפות VIP — שיחה חוזרת
              </button>
            </div>
          </aside>
        </div>
      </section>

      {/* ---------- Benefits — hairline columns ---------- */}
      {benefits.length > 0 && (
        <section className="relative z-10 border-y" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
          <div className="grid md:grid-cols-3" dir="rtl">
            {benefits.slice(0, 3).map((bf, i) => (
              <div
                key={i}
                className="border-t px-8 py-10 md:border-l md:first:border-l-0"
                style={{ borderColor: "rgba(255,255,255,0.08)" }}
              >
                <p className="text-[10px] tracking-[0.3em]" style={{ color: ACCENT }} dir="ltr">
                  ADV/ {String(i + 1).padStart(2, "0")}
                </p>
                <h3 className="mt-3 text-lg font-medium tracking-tight text-white/90" {...editsFor(`benefits.${i}.title`)}>
                  {bf.title}
                </h3>
                <p className="mt-2 text-[13px] leading-[1.85] text-white/40" {...editsFor(`benefits.${i}.description`)}>
                  {bf.description}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ---------- Before/After scan ---------- */}
      <section className="relative z-10 mx-auto max-w-5xl px-6 py-20">
        <p className="mb-8 text-[10px] tracking-[0.4em] text-white/35" dir="ltr">
          SCAN / BEFORE — AFTER
        </p>
        <BeforeAfterSliderInline
          beforeImage={projects[0]?.beforeImage}
          afterImage={projects[0]?.afterImage}
        />
        {projects.slice(1, 3).map((p, i) => (
          <figure
            key={i}
            className="mt-6 grid gap-0 border md:grid-cols-2"
            style={{ borderColor: "rgba(255,255,255,0.08)" }}
            dir="rtl"
          >
            {p.afterImage && (
              <div className="h-56 overflow-hidden border-b md:border-b-0 md:border-l" style={{ borderColor: "rgba(255,255,255,0.08)" }} dir="ltr">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={p.afterImage} alt={p.title} loading="lazy" className="h-full w-full object-cover" style={{ filter: "saturate(0.85)" }} />
              </div>
            )}
            <figcaption className="p-7">
              <span className="text-[10px] tracking-[0.3em] text-white/30" dir="ltr">
                P—{String(i + 2).padStart(3, "0")}
              </span>
              <h3 className="mt-2 text-lg font-medium tracking-tight text-white/85" dir="rtl">{p.title}</h3>
              <p className="mt-2 text-[13px] leading-relaxed text-white/35" dir="rtl">{p.description}</p>
            </figcaption>
          </figure>
        ))}
      </section>

      {/* ---------- Reviews --- monochrome rows ---------- */}
      <section className="relative z-10 border-y" style={{ borderColor: "rgba(255,255,255,0.08)" }}>
        <div className="mx-auto max-w-6xl px-6 py-14">
          <div className="mb-8 flex items-center justify-between">
            <p className="text-[10px] tracking-[0.4em] text-white/35" dir="ltr">FEEDBACK / 03</p>
            <Stars rating={Math.round(b.googleRating)} className="h-3.5 w-3.5" starClass="text-white/70" />
          </div>
          <ul role="list">
            {reviews.slice(0, 3).map((r, i) => (
              <li
                key={i}
                className="flex items-baseline justify-between gap-6 border-b py-5 last:border-b-0"
                style={{ borderColor: "rgba(255,255,255,0.07)" }}
                dir="rtl"
              >
                <div>
                  <p className="text-[13px] font-medium text-white/80" {...editsFor(`reviews.${i}.author`)}>
                    {r.author}
                  </p>
                  <p className="mt-1 text-[13px] leading-relaxed text-white/35" {...editsFor(`reviews.${i}.text`)}>
                    {r.text}
                  </p>
                </div>
                <span className="shrink-0 text-[12px] tabular-nums text-white/40" dir="ltr">
                  {r.rating}.0
                </span>
              </li>
            ))}
          </ul>
        </div>
      </section>

      {/* ---------- FAQ ---------- */}
      <section className="relative z-10 mx-auto max-w-3xl px-6 py-20">
        <h2 className="mb-9 text-center text-2xl font-light tracking-tight sm:text-3xl" style={{ color: "#f2f4f6" }}>
          שאלות מהשדה
        </h2>
        <FaqAccordion
          items={faq}
          classes={{
            card: "border overflow-hidden",
            button: "flex w-full items-center justify-between gap-4 px-6 py-5 text-right text-[13px] text-white/80",
            icon: "h-4 w-4 text-white/30",
            answer: "px-6 pb-5 text-[12px] leading-relaxed text-white/40",
          }}
        />
      </section>

      {/* ---------- Contact footer ---------- */}
      <footer className="relative z-10 mx-auto max-w-6xl px-6 pb-8 text-center" dir="rtl">
        <p className="text-2xl font-light leading-[1.4] tracking-tight text-white/85" {...editsFor("businessInfo.description")}>
          {b.description}
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-x-8 gap-y-2 text-[11px] tracking-[0.18em] text-white/35">
          <span>{b.openingHours}</span>
          <span>{b.address}</span>
          <a href={`tel:${b.phone}`} dir="ltr" className="hover:text-white/80">{b.phone}</a>
        </div>
      </footer>

      {/* ---------- Slide-over VIP priority callback drawer ---------- */}
      <AnimatePresence>
        {vipOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setVipOpen(false)}
              className="fixed inset-0 z-[94000] bg-black/70 backdrop-blur-sm"
            />
            <motion.aside
              initial={{ x: "104%" }}
              animate={{ x: 0 }}
              exit={{ x: "104%" }}
              transition={{ type: "spring", stiffness: 320, damping: 33 }}
              className="fixed inset-y-0 left-0 z-[94100] flex w-full max-w-md flex-col p-8"
              style={{ background: "#0b0c0f", borderRight: "1px solid rgba(255,255,255,0.08)" }}
              role="dialog"
              aria-modal="true"
              aria-label="שיחה חוזרת בעדיפות"
              dir="rtl"
            >
              <div className="mb-8 flex items-center justify-between">
                <p className="text-[10px] tracking-[0.4em]" style={{ color: ACCENT }} dir="ltr">
                  VIP // PRIORITY LINE
                </p>
                <button
                  type="button"
                  onClick={() => setVipOpen(false)}
                  className="p-1 text-white/40 transition hover:text-white"
                  aria-label="סגור"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
              <h3 className="text-2xl font-light leading-[1.3] tracking-tight text-white">
                שיחה חוזרת בעדיפות VIP — בלי תור, בלי המתנה.
              </h3>
              <p className="mt-3 text-[13px] leading-relaxed text-white/40">
                בחרו חלון שנוח לכם ואשרו את ההעדפה — כל הפרטים נשלחים ישירות
                לוואטסאפ של {b.name}.
              </p>
              <div className="mt-9 flex flex-col gap-px" role="radiogroup" aria-label="חלון חזרה" style={{ background: "rgba(255,255,255,0.08)" }}>
                {[
                  { label: "בוקר", range: "08:00–12:00" },
                  { label: "צהריים", range: "12:00–16:00" },
                  { label: "ערב", range: "16:00–20:00" },
                ].map((w, i) => (
                  <a
                    key={w.label}
                    href={`https://wa.me/${b.whatsapp}?text=${encodeURIComponent(`בקשת שיחת עדיפות VIP — חלון: ${w.label} (${w.range}). שלום, אשמח לקבל חזרה מהסטודיו של ${b.name}.`)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => setVipOpen(false)}
                    className="flex items-center justify-between px-5 py-4 text-[13px] transition-colors hover:text-white"
                    style={{ background: "#0b0c0f", color: "rgba(242,244,246,0.7)" }}
                    dir="rtl"
                  >
                    <span className="flex items-baseline gap-3">
                      <span className="text-[10px] tracking-[0.28em] text-white/25" dir="ltr">
                        W{i + 1}
                      </span>
                      {w.label}
                    </span>
                    <span className="text-white/35" dir="ltr">{w.range}</span>
                  </a>
                ))}
              </div>
              <a
                href={`tel:${b.phone}`}
                className="mt-6 block py-4 text-center text-[13px] font-bold transition-opacity hover:opacity-85"
                style={{ background: ACCENT, color: "#07080a" }}
              >
                שיחה ישירה מיידית
              </a>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

/* Thin inline before/after for cyber-quantum using the shared slider */
function BeforeAfterSliderInline({
  beforeImage,
  afterImage,
}: {
  beforeImage?: string;
  afterImage?: string;
}) {
  return (
    <BeforeAfterSlider
      theme={{
        accent: "#cdff3d",
        dark: true,
        pageBg: "#07080a",
        surface: "rgba(255,255,255,0.04)",
        border: "rgba(255,255,255,0.10)",
        headline: "#f2f4f6",
        text: "rgba(242,244,246,0.76)",
        muted: "rgba(242,244,246,0.44)",
        fontSerif: undefined,
      }}
      beforeImage={beforeImage}
      afterImage={afterImage}
      beforeLabel="לפני"
      afterLabel="אחרי"
      caption="גררו את הידית — סריקת ההפרש"
    />
  );
}
