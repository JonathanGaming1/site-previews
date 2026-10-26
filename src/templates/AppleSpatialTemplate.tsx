"use client";

import React, { useMemo } from "react";
import { motion } from "framer-motion";
import { useSite } from "@/components/SiteProvider";
import { DynamicIslandNav } from "@/components/DynamicIslandNav";
import { BeforeAfterSlider } from "@/components/BeforeAfterSlider";
import { TiltCard3D } from "@/components/TiltCard3D";
import {
  EditorialHeadline,
  FaqAccordion,
  fadeUp,
  Stars,
} from "@/templates/shared";

/* ------------------------------------------------------------------ */
/* TITANIUM PRO STICKY SPLIT-SCREEN                                    */
/* Deep anodized titanium #0B0C0E with brushed metallic hairlines       */
/* (1px rgba(255,255,255,0.10)). Apple-hardware storytelling: the       */
/* right column stays pinned while the left scrolls through precision  */
/* chapters, plus a bento spec matrix with big typographic metrics,    */
/* an interactive before/after slider and the Dynamic Island pod.      */
/* ------------------------------------------------------------------ */

interface Chapter {
  index: string;
  kicker: string;
  title: string;
  body: string;
}

function parsePrice(text?: string): number | null {
  if (!text) return null;
  const digits = text.replace(/[^\d]/g, "");
  const n = digits ? parseInt(digits, 10) : NaN;
  return Number.isFinite(n) && n > 0 ? n : null;
}

export function AppleSpatialTemplate() {
  const { data, editsFor } = useSite();
  const { businessInfo: b, hero, faq, reviews, services, projects = [], benefits = [] } = data;

  const chapters = useMemo<Chapter[]>(
    () => [
      {
        index: "01",
        kicker: b.category,
        title: services[0]?.title ?? "החזון",
        body:
          services[0]?.description ??
          "הסטודיו מתכנן ובונה עד פרט המילימטר האחרון, בהתאמה אישית לבית ולצורך שלך.",
      },
      {
        index: "02",
        kicker: "תהליך",
        title: services[1]?.title ?? "ביצוע מדויק",
        body:
          services[1]?.description ??
          "מדידה, ייצור והתקנה בסטנדרט אחיד — עם לוחות זמנים סגורים ועדכונים שוטפים.",
      },
      {
        index: "03",
        kicker: "סטנדרט",
        title: services[2]?.title ?? "גימור ואחריות",
        body:
          services[2]?.description ??
          "כל פרויקט נמסר עם אחריות אמיתית, בדיקת איכות סופית וקבלה מסודרת.",
      },
      ...(services.length > 3
        ? [
            {
              index: "04",
              kicker: "השלמות",
              title: services[3].title,
              body: services[3].description,
            },
          ]
        : []),
    ],
    [b.category, services],
  );

  const base = parsePrice(services[0]?.price);
  const quoteHref = `https://wa.me/${b.whatsapp}?text=${encodeURIComponent(
    `שלום, הגעתי מהדף של ${b.name}. אשמח לקבל הצעת מחיר ומפרט עבור ${services[0]?.title ?? ""}.`,
  )}`;

  /* Bento typographic metrics from real business data */
  const metrics = [
    { big: `${b.googleRating.toFixed(1)}★`, small: `${b.reviewsCount} ביקורות Google` },
    { big: "100%", small: "חומרים מובחרים בכל פרויקט, ללא פשרות" },
    { big: "24/7", small: "מענה שוטף לכל שאלה לאורך הפרויקט" },
  ];

  return (
    <div
      className="relative min-h-screen pb-24"
      style={{ background: "#0b0c0e", color: "rgba(245,245,247,0.78)" }}
    >
      {/* Brushed-metal ambient sheen — static gradients only, no JS */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-0"
        style={{
          background:
            "radial-gradient(60% 40% at 78% -8%, rgba(120,140,180,0.10), transparent 62%), radial-gradient(45% 35% at 10% 30%, rgba(255,255,255,0.04), transparent 60%)",
        }}
      />

      {/* Floating Dynamic Island status bar */}
      <DynamicIslandNav theme={{
        accent: "#0071e3",
        dark: true,
        pageBg: "#0b0c0e",
        surface: "rgba(255,255,255,0.045)",
        border: "rgba(255,255,255,0.10)",
        headline: "#f5f5f7",
        text: "rgba(245,245,247,0.78)",
        muted: "rgba(245,245,247,0.46)",
        fontSerif: undefined,
      }} />

      {/* ---------- Full-bleed titanium hero ---------- */}
      <header className="relative z-10 flex min-h-[92vh] flex-col items-center justify-center px-6 pt-28 text-center">
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-[11px] font-medium tracking-[0.4em]"
          style={{ color: "rgba(245,245,247,0.35)" }}
          {...editsFor("businessInfo.category")}
        >
          {b.category}
        </motion.p>
        <motion.h1
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
          className="mt-6 max-w-4xl text-4xl font-light leading-[1.15] tracking-tight sm:text-5xl md:text-6xl"
          style={{ color: "#f5f5f7" }}
          {...editsFor("hero.headline")}
        >
          <EditorialHeadline text={hero.headline} />
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.9, delay: 0.16 }}
          className="mx-auto mt-6 max-w-2xl text-base leading-relaxed sm:text-lg"
          style={{ color: "rgba(245,245,247,0.48)" }}
          {...editsFor("hero.subheadline")}
        >
          {hero.subheadline}
        </motion.p>
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-10 flex flex-wrap items-center justify-center gap-4"
        >
          <a
            href={`https://wa.me/${b.whatsapp}`}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full px-8 py-3.5 text-[15px] font-semibold text-white"
            style={{ background: "#0071e3", boxShadow: "0 8px 30px rgba(0,113,227,0.35)" }}
          >
            {hero.ctaText}
          </a>
          <a
            href={`tel:${b.phone}`}
            className="rounded-full px-8 py-3.5 text-[15px] font-medium"
            style={{ border: "1px solid rgba(255,255,255,0.18)", color: "#f5f5f7", background: "rgba(255,255,255,0.04)" }}
            dir="ltr"
          >
            {b.phone}
          </a>
        </motion.div>
      </header>

      {/* ---------- STICKY SPLIT-SCREEN STORYTELLING ---------- */}
      <section className="relative z-10 mx-auto max-w-7xl border-y px-0" style={{ borderColor: "rgba(255,255,255,0.10)" }}>
        <div className="grid lg:grid-cols-2">
          {/* LEFT (visual in RTL order becomes right) — the pinned column.
              In an RTL page, the first grid column renders on the right:
              `lg:sticky` keeps it pinned while the sibling scrolls. */}
          <div className="hidden lg:block">
            <div className="sticky top-0 flex h-screen flex-col justify-center border-l p-12" style={{ borderColor: "rgba(255,255,255,0.10)" }} dir="ltr">
              {hero.backgroundImage ? (
                <div className="relative overflow-hidden" style={{ border: "1px solid rgba(255,255,255,0.10)", borderRadius: 18 }}>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={hero.backgroundImage}
                    alt=""
                    className="h-[56vh] w-full object-cover"
                    style={{ filter: "saturate(0.9) contrast(1.04)" }}
                  />
                  <div
                    className="absolute inset-0"
                    style={{
                      background:
                        "linear-gradient(200deg, rgba(11,12,14,0.2), transparent 45%), linear-gradient(0deg, rgba(11,12,14,0.6), transparent 40%)",
                    }}
                  />
                  <div className="absolute bottom-5 right-6" dir="rtl">
                    <p className="text-[10px] tracking-[0.34em] text-white/60" dir="ltr">TITANIUM PRO</p>
                    <p className="mt-1 text-lg font-light text-white" dir="rtl">{b.name}</p>
                  </div>
                </div>
              ) : (
                <div
                  className="flex h-[56vh] items-center justify-center"
                  style={{ border: "1px solid rgba(255,255,255,0.10)", borderRadius: 18 }}
                >
                  <p className="text-[11px] tracking-[0.34em] text-white/40" dir="ltr">PRECISION STUDIO</p>
                </div>
              )}

              {/* mini metric strip under the pinned visual */}
              <div className="mt-6 grid grid-cols-3 gap-px" style={{ background: "rgba(255,255,255,0.10)", borderRadius: 12, overflow: "hidden" }} dir="ltr">
                {metrics.map((m, i) => (
                  <div key={i} className="bg-[#0d0e11] px-4 py-5">
                    <p className="text-2xl font-light text-[#f5f5f7]" dir="ltr">{m.big}</p>
                    <p className="mt-1 text-[10px] leading-snug text-white/40" dir="rtl">{m.small}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* SCROLLING CHAPTERS */}
          <div dir="rtl">
            {chapters.map((c, i) => (
              <div
                key={c.index}
                className="flex min-h-[62vh] flex-col justify-center border-b p-8 md:p-12 lg:min-h-[100vh] lg:border-l last:border-b-0"
                style={{ borderColor: "rgba(255,255,255,0.10)" }}
              >
                <motion.div {...fadeUp}>
                  <p className="flex items-baseline gap-4 text-[10px] tracking-[0.34em] text-white/35" dir="ltr">
                    <span style={{ color: "#0071e3" }}>{c.index}</span>
                    <span>{c.kicker}</span>
                  </p>
                  <h2
                    className="mt-5 text-3xl font-light leading-[1.15] md:text-4xl"
                    style={{ color: "#f5f5f7" }}
                  >
                    {c.title}
                  </h2>
                  <p className="mt-5 max-w-md text-[15px] leading-[1.9] text-white/50">
                    {c.body}
                  </p>
                  <div className="mt-8 h-px w-14 bg-white/15" />
                </motion.div>
              </div>
            ))}
          </div>
        </div>

        {/* Mobile pinned visual (no sticky on small screens) */}
        {hero.backgroundImage && (
          <div className="border-t px-6 py-10 lg:hidden" style={{ borderColor: "rgba(255,255,255,0.10)" }}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={hero.backgroundImage}
              alt=""
              className="h-[44vh] w-full rounded-2xl object-cover"
              style={{ border: "1px solid rgba(255,255,255,0.10)", filter: "saturate(0.9)" }}
            />
            <div className="mt-4 grid grid-cols-3 gap-2" dir="ltr">
              {metrics.map((m, i) => (
                <div key={i} className="rounded-xl bg-[rgba(255,255,255,0.04)] px-3 py-4 text-center">
                  <p className="text-xl font-light text-[#f5f5f7]" dir="ltr">{m.big}</p>
                  <p className="mt-1 text-[9px] text-white/40" dir="rtl">{m.small}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </section>

      {/* ---------- BENTO SPEC MATRIX with tilt 3D cards ---------- */}
      <section className="relative z-10 mx-auto max-w-7xl px-6 py-20">
        <p className="mb-10 text-[10px] tracking-[0.4em] text-white/35" dir="ltr" {...editsFor("businessInfo.category")}>
          SPEC MATRIX
        </p>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4" dir="rtl">
          {[
            <SpecCell
              key="prc"
              big={`${b.googleRating.toFixed(1)}★`}
              small={`${b.reviewsCount} ביקורות מאומתות`}
              title="דיוק ביצוע"
            />,
            <SpecCell
              key="mat"
              big="100%"
              small="חומרים מובחרים בכל פרויקט"
              title="איכות חומרים"
            />,
            <SpecCell
              key="sup"
              big="24/7"
              small="מעקב פרויקט ומענה שוטף"
              title="תמיכה חיה"
            />,
            <SpecCell
              key="urn"
              big={base ? `${(base / 1000).toFixed(0)}K` : "ל.מ."}
              small={'החל מ-ש"ח — הצעה מדויקת לאחר מדידה'}
              title="השקעה החל מ"
            />,
          ].map((cell, i) => (
            <TiltCard3D key={i} maxTilt={6} glare={0.1}>
              <div
                className="h-full"
                style={{
                  border: "1px solid rgba(255,255,255,0.10)",
                  borderRadius: 16,
                  background: "rgba(255,255,255,0.035)",
                }}
              >
                {cell}
              </div>
            </TiltCard3D>
          ))}
        </div>
      </section>

      {/* ---------- Benefits — hairline columns ---------- */}
      {benefits.length > 0 && (
        <section className="relative z-10 border-y" style={{ borderColor: "rgba(255,255,255,0.10)" }} dir="rtl">
          <div className="grid md:grid-cols-3">
            {benefits.slice(0, 3).map((bf, i) => (
              <div
                key={i}
                className="border-t px-8 py-10 md:border-l md:first:border-l-0"
                style={{ borderColor: "rgba(255,255,255,0.10)" }}
                dir="ltr"
              >
                <p className="text-[10px] tracking-[0.3em] text-white/30" dir="ltr">
                  {String(i + 1).padStart(2, "0")}
                </p>
                <h3 className="mt-3 text-lg font-medium" style={{ color: "#f5f5f7" }} dir="rtl" {...editsFor(`benefits.${i}.title`)}>
                  {bf.title}
                </h3>
                <p className="mt-2 text-[13px] leading-[1.85] text-white/45" dir="rtl" {...editsFor(`benefits.${i}.description`)}>
                  {bf.description}
                </p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* ---------- Before/After ---------- */}
      <section className="relative z-10 mx-auto max-w-5xl px-6 py-20">
        <p className="mb-8 text-[10px] tracking-[0.4em] text-white/35" dir="ltr">BEFORE / AFTER</p>
        <BeforeAfterSlider
          theme={{
            accent: "#0071e3",
            dark: true,
            pageBg: "#0b0c0e",
            surface: "rgba(255,255,255,0.045)",
            border: "rgba(255,255,255,0.10)",
            headline: "#f5f5f7",
            text: "rgba(245,245,247,0.78)",
            muted: "rgba(245,245,247,0.46)",
            fontSerif: undefined,
          }}
          beforeImage={projects[0]?.beforeImage}
          afterImage={projects[0]?.afterImage}
          beforeLabel="לפני"
          afterLabel="אחרי"
          caption="גררו את הידית וראו את ההפרש בעין"
        />
        {projects[0] && (
          <p className="mt-4 text-center text-[13px] text-white/40" dir="rtl">
            {projects[0].title} — {projects[0].description}
          </p>
        )}
      </section>

      {/* ---------- Reviews ---------- */}
      <section className="relative z-10 mx-auto max-w-6xl px-6 pb-20">
        <div className="mb-8 flex items-center justify-between">
          <p className="text-[10px] tracking-[0.4em] text-white/35" dir="ltr">Verified Reviews</p>
          <Stars rating={Math.round(b.googleRating)} className="h-3.5 w-3.5" starClass="text-[#fbbf24]" />
        </div>
        <div className="grid gap-4 md:grid-cols-3" dir="rtl">
          {reviews.slice(0, 3).map((r, i) => (
            <figure
              key={i}
              className="rounded-2xl p-7"
              style={{ border: "1px solid rgba(255,255,255,0.10)", background: "rgba(255,255,255,0.03)" }}
            >
              <Stars rating={r.rating} className="h-3 w-3" starClass="text-[#fbbf24]" />
              <blockquote className="mt-4 text-[14px] leading-[1.85] text-white/60" {...editsFor(`reviews.${i}.text`)}>
                {r.text}
              </blockquote>
              <figcaption className="mt-5 text-[11px] tracking-wider text-white/35" {...editsFor(`reviews.${i}.author`)}>
                {r.author}
              </figcaption>
            </figure>
          ))}
        </div>
      </section>

      {/* ---------- FAQ + closing ---------- */}
      <section className="relative z-10 mx-auto max-w-3xl px-6 pb-16">
        <h2 className="mb-9 text-center text-2xl font-light sm:text-3xl" style={{ color: "#f5f5f7" }}>
          שאלות שנשאלות בסטודיו
        </h2>
        <FaqAccordion
          items={faq}
          classes={{
            card: "overflow-hidden rounded-2xl",
            button: "flex w-full items-center justify-between gap-4 px-6 py-5 text-right text-[13px] text-white/80",
            icon: "h-4 w-4 text-white/30",
            answer: "px-6 pb-5 text-[12px] leading-relaxed text-white/45",
          }}
        />
      </section>

      <footer
        className="relative z-10 mx-auto max-w-5xl px-6 pb-10 text-center"
        style={{ color: "#f5f5f7" }}
        dir="rtl"
      >
        <a
          href={quoteHref}
          target="_blank"
          rel="noopener noreferrer"
          className="mx-auto block max-w-sm rounded-full py-4 text-center text-[15px] font-semibold text-white"
          style={{ background: "#0071e3", boxShadow: "0 8px 30px rgba(0,113,227,0.35)" }}
        >
          שירת הצעת מחיר מהסטודיו
        </a>
        <p className="mt-8 text-[11px] tracking-[0.2em] text-white/30">
          {b.openingHours} · {b.address} · <span dir="ltr">{b.phone}</span>
        </p>
      </footer>
    </div>
  );
}

/* Bento spec cell — big typographic metric, no icon boxes */
function SpecCell({
  big,
  small,
  title,
}: {
  big: string;
  small: string;
  title: string;
}) {
  return (
    <div className="flex h-full flex-col p-6" dir="rtl">
      <p className="text-[10px] tracking-[0.3em] text-white/35">{title}</p>
      <p
        className="mt-4 text-4xl font-light leading-none tracking-tight"
        style={{ color: "#f5f5f7" }}
        dir="ltr"
      >
        {big}
      </p>
      <p className="mt-3 text-[11px] leading-snug text-white/40">{small}</p>
    </div>
  );
}
