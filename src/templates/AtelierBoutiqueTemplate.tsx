"use client";

import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useSite } from "@/components/SiteProvider";
import {
  EditorialHeadline,
  FaqAccordion,
  fadeUp,
  Stars,
} from "@/templates/shared";

/* ------------------------------------------------------------------ */
/* SWISS ARCHITECTURAL GRID                                            */
/* Warm alabaster stone #F2EFE9 with deep charcoal ink #141413. The     */
/* entire page is divided into asymmetric architectural cells divided  */
/* by exposed 1px hairlines (rgba(20,20,19,0.15)) — Pentagram-grade     */
/* editorial grid design. Giant index numerals, hover-reveal service    */
/* table rows and a tabular blueprint cost estimator.                  */
/* ------------------------------------------------------------------ */

const INK = "#141413";
const HAIRLINE = "rgba(20,20,19,0.15)";
const HAIRLINE_SOFT = "rgba(20,20,19,0.08)";

const SCOPE_OPTIONS = [
  { label: "ביצוע נקודתי", multiplicand: 1 },
  { label: "חדר שלם", multiplicand: 2.4 },
  { label: "בית מלא", multiplicand: 4.2 },
] as const;

function parsePrice(text?: string): number | null {
  if (!text) return null;
  const digits = text.replace(/[^\d]/g, "");
  const n = digits ? parseInt(digits, 10) : NaN;
  return Number.isFinite(n) && n > 0 ? n : null;
}

export function AtelierBoutiqueTemplate() {
  const { data, editsFor } = useSite();
  const { businessInfo: b, hero, faq, reviews, services, projects = [] } = data;

  /* Hover-reveal service index: tap selects (touch), :hover expands via CSS */
  const [activeRow, setActiveRow] = useState<number>(0);

  /* Blueprint cost estimator */
  const [estimatorRow, setEstimatorRow] = useState(0);
  const [scopeIdx, setScopeIdx] = useState(1);
  const pressed = useMemo(
    () => services.map((s) => parsePrice(s.price)),
    [services],
  );
  const estBase = pressed[estimatorRow] ?? null;
  const estimate = estBase ? Math.round((estBase * SCOPE_OPTIONS[scopeIdx].multiplicand) / 100) * 100 : null;
  const estimatorHref = `https://wa.me/${b.whatsapp}?text=${encodeURIComponent(
    [
      `שלום, חישוב מהדף האדריכלי של ${b.name}:`,
      `• קטגוריה: ${services[estimatorRow]?.title ?? ""}`,
      `• היקף: ${SCOPE_OPTIONS[scopeIdx].label}`,
      estimate
        ? `• הערכת השקעה: ${estimate.toLocaleString("he-IL")} ₪`
        : "• מתעניין בהצעת מחיר מותאמת אישית",
      "אשמח לדף מדויק לאחר מדידה.",
    ].join("\n"),
  )}`;

  return (
    <div
      className="relative min-h-screen pb-24"
      style={{ background: "#F2EFE9", color: "rgba(20,20,19,0.76)" }}
    >
      {/* ---------- Architectural top bar (3 hairline columns) ---------- */}
      <header
        className="sticky top-0 z-[9500] grid grid-cols-3 border-b backdrop-blur"
        style={{ background: "rgba(242,239,233,0.92)", borderColor: HAIRLINE }}
        dir="rtl"
      >
        <div className="border-l px-5 py-3.5 text-[10px] tracking-[0.28em]" style={{ borderColor: HAIRLINE }}>
          <a href={`tel:${b.phone}`} dir="ltr" className="transition hover:opacity-60">
            {b.phone}
          </a>
        </div>
        <div className="flex items-center justify-center gap-2 py-3.5 text-[10px] tracking-[0.28em]" style={{ color: INK }}>
          <span
            className="inline-flex h-5 w-5 items-center justify-center text-[11px] font-medium"
            style={{ transform: "skewX(-6deg)", color: "#141413" }}
          >
            {(b.name || "S").trim().charAt(0)}
          </span>
          <span {...editsFor("businessInfo.name")} className="hidden sm:inline" style={{ color: "rgba(20,20,19,0.6)" }}>
            {b.name}
          </span>
        </div>
        <div
          className="flex items-center justify-center gap-4 border-r px-5 py-3.5 text-[10px] tracking-[0.22em] text-center"
          style={{ borderColor: HAIRLINE }}
          dir="ltr"
        >
          <a href="#services" className="transition hover:opacity-60">SERVICES</a>
          <a href="#contact" className="hidden transition hover:opacity-60 sm:inline">CONTACT</a>
        </div>
      </header>

      {/* ---------- Hero — asymmetric split cells with exposed hairlines ---------- */}
      <section className="relative grid border-b lg:grid-cols-[5fr_7fr]" style={{ borderColor: HAIRLINE }}>
        {/* currentIndex numblocks */}
        <div
          className="pointer-events-none absolute top-4 left-4 z-10 text-left"
          dir="ltr"
          aria-hidden="true"
        >
          <p className="text-[64px] font-light leading-none text-[rgba(20,20,19,0.12)]" style={{ fontFamily: "'Frank Ruhl Libre', serif" }}>
            01
          </p>
          <p className="text-[10px] tracking-[0.4em] text-[rgba(20,20,19,0.35)]">/ STUDIO</p>
        </div>

        {/* photo curtain — vertical column */}
        <div
          className="relative flex min-h-[52vh] items-end border-b lg:min-h-[86vh] lg:border-b-0 lg:border-l"
          style={{ borderColor: HAIRLINE }}
          dir="ltr"
        >
          {hero.backgroundImage && (
            <div className="absolute inset-0 overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={hero.backgroundImage}
                alt=""
                className="h-full w-full object-cover"
                style={{ filter: "saturate(0.82) contrast(1.02)" }}
              />
              <div
                className="absolute inset-0"
                style={{ background: "linear-gradient(180deg, rgba(242,239,233,0.15), rgba(242,239,233,0.55) 92%)" }}
              />
            </div>
          )}
          <div className="relative z-10 w-full p-8 text-left" dir="rtl">
            <p className="text-[10px] tracking-[0.3em] text-[rgba(20,20,19,0.55)]">
              {b.address}
            </p>
          </div>
        </div>

        {/* sharp editorial typography */}
        <div className="flex flex-col justify-center px-8 py-14 md:px-14" dir="rtl">
          <motion.div {...fadeUp}>
            <p className="text-[11px] tracking-[0.4em] text-[rgba(20,20,19,0.45)]" {...editsFor("businessInfo.category")}>
              {b.category}
            </p>
            <h1
              className="mt-6 text-4xl font-light leading-[1.15] md:text-6xl"
              style={{ fontFamily: "'Frank Ruhl Libre', serif", letterSpacing: "-0.02em", color: INK }}
              {...editsFor("hero.headline")}
            >
              <EditorialHeadline text={hero.headline} />
            </h1>
            <p className="mt-7 max-w-xl text-[15px] leading-[1.9] text-[rgba(20,20,19,0.55)]" {...editsFor("hero.subheadline")}>
              {hero.subheadline}
            </p>
            <div className="mt-10 flex flex-wrap items-center gap-8 text-[12px] tracking-[0.16em]">
              <a
                href={`https://wa.me/${b.whatsapp}`}
                target="_blank"
                rel="noopener noreferrer"
                className="border-b pb-1.5 transition-opacity duration-300 hover:opacity-60"
                style={{ borderColor: "rgba(20,20,19,0.5)", color: INK }}
              >
                {hero.ctaText}
              </a>
              <span className="text-[rgba(20,20,19,0.3)]">{b.openingHours}</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ---------- Statement quote — single grid band ---------- */}
      <section className="border-b px-6 py-16 text-center md:px-16" style={{ borderColor: HAIRLINE }} dir="rtl">
        <p
          className="mx-auto max-w-3xl text-xl font-light leading-[1.6] md:text-2xl"
          style={{ fontFamily: "'Frank Ruhl Libre', serif", color: INK }}
        >
          “{b.tagline}”
        </p>
        <p className="mt-4 text-[11px] tracking-[0.3em] text-[rgba(20,20,19,0.4)]">
          {b.name} — {b.category}
        </p>
      </section>

      {/* ---------- Hover-reveal architectural service index ---------- */}
      <section id="services" dir="rtl">
        <div className="flex items-center justify-between px-6 py-5 md:px-10" dir="rtl">
          <p className="text-[10px] tracking-[0.4em] text-[rgba(20,20,19,0.4)]" {...editsFor("businessInfo.category")}>
            קטלוג השירותים
          </p>
          <p className="text-[10px] tracking-[0.4em] text-[rgba(20,20,19,0.3)]" dir="ltr">INDEX 02</p>
        </div>
        <ul>
          {services.map((s, i) => (
            <ServiceIndexRow
              key={i}
              index={String(i + 1).padStart(2, "0")}
              active={activeRow === i}
              onEnter={() => setActiveRow(i)}
              onToggle={() => setActiveRow(activeRow === i ? -1 : i)}
              title={
                <span {...editsFor(`services.${i}.title`)}>
                  {s.title}
                </span>
              }
              description={
                <span {...editsFor(`services.${i}.description`)}>
                  {s.description}
                </span>
              }
              price={
                <span {...editsFor(`services.${i}.price`)}>
                  {s.price}
                </span>
              }
              image={projects[i]?.afterImage}
            />
          ))}
        </ul>
      </section>

      {/* ---------- Blueprint cost estimator — tabular grid ---------- */}
      <section className="border-y" style={{ borderColor: HAIRLINE }} dir="rtl">
        <div className="grid lg:grid-cols-[4fr_6fr]">
          <div className="border-b p-8 md:p-10 lg:border-b-0 lg:border-l" style={{ borderColor: HAIRLINE }}>
            <p className="text-[10px] tracking-[0.4em] text-[rgba(20,20,19,0.4)]" dir="ltr">ESTIMATOR 03</p>
            <h2
              className="mt-4 text-3xl font-light leading-[1.15] md:text-4xl"
              style={{ fontFamily: "'Frank Ruhl Libre', serif", color: INK }}
            >
              מחשבון הדף האדריכלי
            </h2>
            <p className="mt-4 max-w-sm text-[14px] leading-[1.85] text-[rgba(20,20,19,0.55)]">
              קבעו את קטגוריית העבודה והיקף הפרויקט — הדף מסכם בזמן אמת את היקף
              ההשקעה הצפוי, ומייצא את הנתונים לוואטסאפ בלחיצה אחת.
            </p>
          </div>

          <div className="p-8 md:p-10">
            {/* service pick */}
            <p className="mb-3 text-[10px] tracking-[0.32em] text-[rgba(20,20,19,0.4)]">קטגוריית עבודה</p>
            <div className="flex flex-col gap-0" role="radiogroup" aria-label="קטגוריית עבודה">
              {services.map((s, i) => (
                <button
                  key={i}
                  type="button"
                  role="radio"
                  aria-checked={estimatorRow === i}
                  onClick={() => setEstimatorRow(i)}
                  className="flex items-center justify-between border-b px-1 py-2.5 text-right text-[13px] transition-colors"
                  style={{
                    borderBottomColor: estimatorRow === i ? "rgba(20,20,19,0.6)" : HAIRLINE_SOFT,
                    color: estimatorRow === i ? INK : "rgba(20,20,19,0.45)",
                  }}
                >
                  <span className="flex items-baseline gap-3">
                    <span className="text-[10px] tracking-[0.24em] text-[rgba(20,20,19,0.3)]" dir="ltr">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    {s.title}
                  </span>
                  <span className="text-[11px] text-[rgba(20,20,19,0.4)]">{s.price}</span>
                </button>
              ))}
            </div>

            {/* scope pick */}
            <p className="mb-3 mt-8 text-[10px] tracking-[0.32em] text-[rgba(20,20,19,0.4)]">היקף הפרויקט</p>
            <div className="flex border-y" style={{ borderColor: HAIRLINE }} role="radiogroup" aria-label="היקף הפרויקט" dir="ltr">
              {SCOPE_OPTIONS.map((sc, i) => (
                <button
                  key={sc.label}
                  type="button"
                  role="radio"
                  aria-checked={scopeIdx === i}
                  onClick={() => setScopeIdx(i)}
                  className="flex-1 border-r px-3 py-4 text-center text-[12px] transition-colors"
                  style={{
                    borderColor: HAIRLINE,
                    background: scopeIdx === i ? INK : "transparent",
                    color: scopeIdx === i ? "#F2EFE9" : "rgba(20,20,19,0.5)",
                  }}
                  dir="rtl"
                >
                  {sc.label}
                </button>
              ))}
            </div>

            {/* result */}
            <div className="mt-9 flex items-baseline justify-between" style={{ color: INK }}>
              <p className="text-[10px] tracking-[0.32em] text-[rgba(20,20,19,0.4)]">הערכת השקעה כוללת</p>
              <p className="text-4xl font-light tabular-nums" style={{ fontFamily: "'Frank Ruhl Libre', serif" }} dir="ltr">
                {estimate ? `${estimate.toLocaleString("he-IL")} ₪` : "—"}
              </p>
            </div>

            <div className="mt-7 flex flex-wrap gap-3">
              <a
                href={estimatorHref}
                target="_blank"
                rel="noopener noreferrer"
                className="px-7 py-3 text-[12px] tracking-[0.14em] transition-opacity hover:opacity-80"
                style={{ background: INK, color: "#F2EFE9", borderRadius: 0 }}
              >
                ייצוא מפרט לוואטסאפ
              </a>
              <a
                href={`tel:${b.phone}`}
                className="px-7 py-3 text-[12px] tracking-[0.14em] transition hover:opacity-60"
                style={{ border: `1px solid ${HAIRLINE}`, color: INK }}
              >
                שיחת ייעוץ
              </a>
            </div>
            <p className="mt-4 text-[10px] leading-relaxed text-[rgba(20,20,19,0.35)]">
              ההערכה בגבולות הנמדדים בשדה. המחיר הסופי נקבע אחרי מדידה — ללא התחייבות.
            </p>
          </div>
        </div>
      </section>

      {/* ---------- Reviews — hairline cells ---------- */}
      <section className="border-b" style={{ borderColor: HAIRLINE }}>
        <div className="flex items-center justify-between px-6 py-5 md:px-10" dir="rtl">
          <p className="text-[10px] tracking-[0.4em] text-[rgba(20,20,19,0.4)]">המלצות לקוחות</p>
          <Stars rating={Math.round(b.googleRating)} className="h-3.5 w-3.5" starClass="text-[#8b6a3e]" />
        </div>
        <div className="grid md:grid-cols-3" dir="rtl">
          {reviews.slice(0, 3).map((r, i) => (
            <figure
              key={i}
              className="border-t p-8 md:border-l md:first:border-l-0"
              style={{ borderColor: HAIRLINE }}
              dir="ltr"
            >
              <div className="flex items-center gap-2 text-[rgba(20,20,19,0.5)]">
                <Stars rating={r.rating} className="h-3 w-3" starClass="text-[#8b6a3e]" />
              </div>
              <blockquote
                className="mt-4 text-[14px] font-light leading-[1.85] text-[rgba(20,20,19,0.7)]"
                style={{ fontFamily: "'Frank Ruhl Libre', serif" }}
                {...editsFor(`reviews.${i}.text`)}
              >
                {r.text}
              </blockquote>
              <figcaption className="mt-5 text-[10px] tracking-[0.24em] text-[rgba(20,20,19,0.4)]" {...editsFor(`reviews.${i}.author`)}>
                {r.author}
              </figcaption>
            </figure>
          ))}
        </div>
      </section>

      {/* ---------- FAQ ---------- */}
      <section className="mx-auto max-w-3xl px-6 py-20" dir="rtl">
        <h2
          className="mb-10 text-center text-2xl font-light leading-[1.15] md:text-3xl"
          style={{ fontFamily: "'Frank Ruhl Libre', serif", color: INK }}
        >
          שאלות אשר נשאלות
        </h2>
        <FaqAccordion
          items={faq}
          classes={{
            card: "border overflow-hidden",
            button: "flex w-full items-center justify-between gap-4 px-6 py-5 text-right text-[13px]",
            icon: "h-4 w-4 text-[rgba(20,20,19,0.35)]",
            answer: "px-6 pb-5 text-[12px] leading-relaxed text-[rgba(20,20,19,0.55)]",
          }}
        />
      </section>

      {/* ---------- Architectural footer contact ---------- */}
      <footer id="contact" className="border-t" style={{ borderColor: HAIRLINE }}>
        <div className="grid md:grid-cols-3" dir="rtl">
          <div className="border-b p-8 md:border-b-0 md:border-l" style={{ borderColor: HAIRLINE }}>
            <p className="text-[10px] tracking-[0.4em] text-[rgba(20,20,19,0.35)]" dir="ltr">STUDIO 04 / CONTACT</p>
            <p
              className="mt-4 text-xl font-light leading-[1.5]"
              style={{ fontFamily: "'Frank Ruhl Libre', serif", color: INK }}
              {...editsFor("businessInfo.description")}
            >
              {b.description}
            </p>
          </div>
          <div className="border-b p-8 md:border-b-0 md:border-l" style={{ borderColor: HAIRLINE }}>
            <p className="text-[10px] tracking-[0.32em] text-[rgba(20,20,19,0.35)]">פרטי התקשרות</p>
            <ul className="mt-4 space-y-2 text-[13px] text-[rgba(20,20,19,0.7)]">
              <li>{b.phone}</li>
              <li>{b.address}</li>
              <li>{b.openingHours}</li>
            </ul>
          </div>
          <div className="flex items-end p-8">
            <a
              href={`https://wa.me/${b.whatsapp}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full px-6 py-4 text-center text-[12px] tracking-[0.14em] transition-opacity hover:opacity-80"
              style={{ background: INK, color: "#F2EFE9" }}
            >
              תיאום בוואטסאפ
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Service index row — CSS :hover expansion (desktop) + tap (touch).   */
/* Spec + preview image are revealed inside the row itself.            */
/* ------------------------------------------------------------------ */

function ServiceIndexRow({
  index,
  active,
  onEnter,
  onToggle,
  title,
  description,
  price,
  image,
}: {
  index: string;
  active: boolean;
  onEnter: () => void;
  onToggle: () => void;
  title: React.ReactNode;
  description?: React.ReactNode;
  price?: React.ReactNode;
  image?: string;
}) {
  return (
    <li
      className="group border-t"
      style={{ borderColor: HAIRLINE }}
      onMouseEnter={onEnter}
      dir="rtl"
    >
      {/* Row summary: architectural table row */}
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={active}
        className={`grid w-full grid-cols-[3.5rem_1fr_auto] items-baseline gap-4 px-6 py-7 text-right transition-colors md:px-10 ${
          active ? "bg-[rgba(20,20,19,0.035)]" : "bg-transparent group-hover:bg-[rgba(20,20,19,0.02)]"
        }`}
      >
        <span className="text-[11px] tracking-[0.3em] text-[rgba(20,20,19,0.35)]" dir="ltr">
          {index}
        </span>
        <span
          className="text-xl font-light leading-[1.15] transition-colors md:text-2xl"
          style={{ fontFamily: "'Frank Ruhl Libre', serif", color: active ? INK : "rgba(20,20,19,0.72)" }}
        >
          {title}
        </span>
        <span className="text-[12px] tabular-nums text-[rgba(20,20,19,0.5)]">{price}</span>
      </button>

      {/* Expansion — instant reveal on hover via grid-template-rows */}
      <div
        className="grid transition-[grid-template-rows] duration-500 ease-[cubic-bezier(0.22,1,0.36,1)]"
        style={{ gridTemplateRows: active ? "1fr" : "0fr" }}
        dir="ltr"
      >
        <div className="overflow-hidden">
          <div
            className="grid gap-0 border-t px-0 md:grid-cols-[3.5rem_1fr_1fr]"
            style={{ borderColor: HAIRLINE }}
          >
            <span className="hidden md:block" />
            <div className="px-6 pb-8 pt-5 md:px-10" dir="rtl">
              <p className="text-[10px] tracking-[0.32em] text-[rgba(20,20,19,0.4)]">מפרט</p>
              <p className="mt-3 text-[14px] leading-[1.85] text-[rgba(20,20,19,0.65)]">
                {description}
              </p>
            </div>
            <div className="px-6 pb-8 pt-5 md:px-10" dir="rtl">
              {image && (
                <div
                  className="h-40 w-full overflow-hidden border md:h-52"
                  style={{ borderColor: HAIRLINE }}
                  dir="ltr"
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={image} alt="" loading="lazy" className="h-full w-full object-cover" style={{ filter: "saturate(0.8)" }} />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </li>
  );
}
