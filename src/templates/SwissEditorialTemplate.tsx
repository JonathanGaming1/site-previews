"use client";

import React, { useState } from "react";
import { motion } from "framer-motion";
import { useSite } from "@/components/SiteProvider";
import {
  EditorialHeadline,
  FaqAccordion,
  RatingBars,
  formatNis,
  parsePrice,
  waLink,
} from "@/templates/shared";
import {
  CameraPortal,
  Magnetic,
  Parallax,
  SpecMark,
  SpecularLight,
  TiltStage,
} from "@/templates/motion";

/** Four museum walls unfolding in perspective, plus the blueprint columns. */
const MUSEUM_WALLS = [
  { offset: -39, rotate: 33, z: 0, depth: 30, mark: "WALL / A" },
  { offset: -14, rotate: 12, z: 70, depth: 48, mark: "WALL / B" },
  { offset: 14, rotate: -12, z: 70, depth: 48, mark: "WALL / C" },
  { offset: 39, rotate: -33, z: 0, depth: 30, mark: "WALL / D" },
] as const;

/* ------------------------------------------------------------------ */
/* SWISS / ARCHITECTURAL BLUEPRINT MONOGRAPH                           */
/* Warm travertine #F3EFE6, espresso ink #141311, exposed 1px          */
/* blueprint lines edge-to-edge, magazine cover hero, giant indices    */
/* and a four-column curtain that glides from 15% to 60% on hover.     */
/* ------------------------------------------------------------------ */

const INK = "#141311";
const TRAVERTINE = "#F3EFE6";
const HAIRLINE = "rgba(20,19,17,0.16)";
const HAIRLINE_SOFT = "rgba(20,19,17,0.08)";

export function SwissEditorialTemplate() {
  const { data, editsFor } = useSite();
  const { businessInfo: b, hero, services, faq, reviews, projects = [], benefits = [] } = data;

  const accent = data.theme.accentColor || "#8b6a3e";
  const primary = data.theme.primaryColor || INK;

  const [activeColumn, setActiveColumn] = useState(0);
  const columns = services.length ? services.slice(0, 4) : [];
  const safeColumn = Math.min(
    activeColumn,
    Math.max(columns.length - 1, 0),
  );
  const activeService = columns[safeColumn] ?? columns[0];
  const activePrice = parsePrice(activeService?.price);

  const consultationHref = waLink(
    b.whatsapp,
    [
      `שלום, קראתי את המונוגרפיה של ${b.name}.`,
      `• עמוד: ${activeService?.title ?? ""}`,
      activePrice ? `• הערכת השקעה: ${formatNis(activePrice)}` : "• אשמח להערכה אישית",
      "אשמח לתאם פגישת ייעוץ.",
    ].join("\n"),
  );

  const city = b.address.split(",")[0]?.trim() || b.address;
  const processRows = data.processTimeline?.length
    ? data.processTimeline
    : benefits.slice(0, 4).map((benefit) => ({
        title: benefit.title,
        description: benefit.description,
      }));

  return (
    <div
      className="relative min-h-screen overflow-x-hidden"
      style={{ background: TRAVERTINE, color: "rgba(20,19,17,0.74)" }}
      dir="rtl"
    >
      {/* exposed blueprint grid running edge-to-edge under everything */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-0"
        style={{
          backgroundImage:
            "linear-gradient(to right, rgba(20,19,17,0.13) 1px, transparent 1px), linear-gradient(to bottom, rgba(20,19,17,0.085) 1px, transparent 1px)",
          backgroundSize: "8.333333vw 100%, 100% 96px",
        }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-y-0 left-1/2 z-0 w-px"
        style={{ background: "rgba(20,19,17,0.08)" }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-0"
        style={{
          background:
            "radial-gradient(60% 45% at 72% 14%, rgba(255,255,255,0.5), transparent 70%), radial-gradient(50% 50% at 4% 86%, rgba(139,106,62,0.06), transparent 72%)",
        }}
      />

      {/* Gallery spot that tracks the cursor across the travertine. */}
      <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-[5]">
        <SpecularLight color="rgba(255,255,255,0.5)" size={54} blend="soft-light" />
      </div>

      {/* ---------------- magazine masthead ---------------- */}
      <header
        className="sticky top-0 z-[9500] border-b backdrop-blur-xl"
        style={{ background: "rgba(243,239,230,0.9)", borderColor: HAIRLINE }}
      >
        <div className="mx-auto grid max-w-[1440px] grid-cols-[1fr_auto_1fr] items-center gap-3 px-4 py-3 md:px-8">
          <div className="text-[8.5px] leading-relaxed tracking-[0.24em]" style={{ color: "rgba(20,19,17,0.45)" }} dir="ltr">
            <span className="block">THE MONOGRAPH</span>
            <span className="mt-0.5 block" style={{ color: accent }}>
              ISSUE N° 05 — {new Date().getFullYear()}
            </span>
          </div>

          <a href="#top" className="flex flex-col items-center">
            <span
              className="max-w-[250px] truncate text-lg font-light tracking-[-0.02em] md:text-xl"
              style={{ fontFamily: "'Frank Ruhl Libre', serif", color: INK }}
              {...editsFor("businessInfo.name")}
            >
              {b.name}
            </span>
            <span className="mt-0.5 text-[7.5px] tracking-[0.36em]" style={{ color: accent }}>
              ARCHITECTURAL PRACTICE
            </span>
          </a>

          <div className="justify-self-end text-left" dir="ltr">
            <a
              href={`tel:${b.phone}`}
              className="block text-[9px] tracking-[0.16em] transition hover:opacity-60"
              style={{ color: INK }}
            >
              {b.phone}
            </a>
            <a
              href="#contact"
              className="mt-1 inline-block border-b pb-0.5 text-[8px] tracking-[0.24em]"
              style={{ borderColor: "rgba(20,19,17,0.35)", color: "rgba(20,19,17,0.55)" }}
            >
              תיאום פגישה
            </a>
          </div>
        </div>
        <nav
          className="mx-auto flex max-w-[1440px] items-center justify-between gap-3 border-t px-4 py-2 md:px-8"
          style={{ borderColor: HAIRLINE_SOFT }}
          dir="rtl"
        >
          <span className="hidden text-[7.5px] tracking-[0.24em] md:block" style={{ color: "rgba(20,19,17,0.38)" }}>
            {city} · גיליון אדריכלות פנים
          </span>
          <div className="flex w-full items-center justify-between gap-4 md:w-auto md:justify-end">
            {[
              { href: "#curtain", label: "עבודות", num: "02" },
              { href: "#plates", label: "ארכיון", num: "03" },
              { href: "#process", label: "תהליך", num: "04" },
              { href: "#contact", label: "קשר", num: "05" },
            ].map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="flex items-baseline gap-1.5 text-[8.5px] tracking-[0.14em] transition hover:opacity-60"
                style={{ color: "rgba(20,19,17,0.58)" }}
              >
                <span className="text-[7px]" style={{ color: accent }}>
                  {item.num}
                </span>
                {item.label}
              </a>
            ))}
          </div>
        </nav>
      </header>

      {/* ---------------- magazine cover hero — folding museum portal ----------------
          Scroll unfolds four 3D perspective museum walls and slides the
          blueprint curtains apart, revealing the full-bleed cover photograph
          before the cover grid resolves from inside the gallery. */}
      <section id="top" className="relative z-10">
        <CameraPortal
          heightVh={300}
          perspective={1500}
          zoom={3.3}
          blurOut={18}
          veilColor="rgba(243,239,230,0.94)"
          hint={
            <span className="flex flex-col items-center gap-3">
              <SpecMark style={{ color: accent }}>SCROLL — OPEN THE GALLERY</SpecMark>
              <span className="block h-8 w-px" style={{ background: `linear-gradient(${accent}, transparent)` }} />
            </span>
          }
          scene={
            <div className="absolute inset-0 overflow-hidden">
              {/* full-bleed photograph behind the curtain columns */}
              {hero.backgroundImage ? (
                <TiltStage intensity={6} glareColor="rgba(255,255,255,0.3)" className="absolute inset-0">
                  <div className="relative h-full w-full">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={hero.backgroundImage}
                      alt=""
                      className="h-full w-full object-cover"
                      style={{ filter: "saturate(0.82) contrast(1.06) brightness(1.02)" }}
                    />
                    <div
                      aria-hidden="true"
                      className="absolute inset-0"
                      style={{
                        background:
                          "linear-gradient(180deg, rgba(243,239,230,0.16), rgba(243,239,230,0.42))",
                      }}
                    />
                  </div>
                </TiltStage>
              ) : null}

              {/* the four museum walls unfolding in 3D perspective */}
              <div className="absolute inset-0" style={{ perspective: 1500 }}>
                {MUSEUM_WALLS.map((wall, i) => (
                  <Parallax
                    key={wall.mark}
                    depth={wall.depth}
                    depthZ={wall.z}
                    className="absolute inset-y-0 w-[27%] transition-transform duration-700 ease-out hover:[transform:rotateY(0deg)_translateY(-14px)]"
                    style={{
                      insetInlineStart: `${50 + wall.offset}%`,
                      marginInlineStart: "-13.5%",
                      transform: `rotateY(${wall.rotate}deg)`,
                    }}
                  >
                    <div
                      className="relative h-full w-full border"
                      style={{
                        borderColor: "rgba(20,19,17,0.2)",
                        backgroundImage:
                          "linear-gradient(to right, rgba(20,19,17,0.12) 1px, transparent 1px), linear-gradient(to bottom, rgba(20,19,17,0.07) 1px, transparent 1px)",
                        backgroundSize: "12.5% 100%, 100% 78px",
                        background: "linear-gradient(180deg, rgba(243,239,230,0.97), rgba(243,239,230,0.9))",
                      }}
                    >
                      <div
                        aria-hidden="true"
                        className="absolute inset-0"
                        style={{
                          backgroundImage:
                            "linear-gradient(to right, rgba(20,19,17,0.14) 1px, transparent 1px), linear-gradient(to bottom, rgba(20,19,17,0.08) 1px, transparent 1px)",
                          backgroundSize: "25% 100%, 100% 78px",
                        }}
                      />
                      <div className="absolute inset-x-3 top-4 flex items-center justify-between">
                        <SpecMark style={{ color: accent }}>{wall.mark}</SpecMark>
                        <span
                          className="font-grotesk text-[9px] tracking-[0.2em]"
                          style={{ color: "rgba(20,19,17,0.4)" }}
                          dir="ltr"
                        >
                          {String(i + 1).padStart(2, "0")}/04
                        </span>
                      </div>
                      <div className="absolute inset-x-3 bottom-4">
                        <span
                          aria-hidden="true"
                          className="block h-px w-full"
                          style={{ background: "rgba(20,19,17,0.28)" }}
                        />
                        <p
                          className="mt-2 text-[9px] tracking-[0.18em]"
                          style={{ color: "rgba(20,19,17,0.5)" }}
                          dir="ltr"
                        >
                          TRAVERTINE / {b.tagline.slice(0, 20)}
                        </p>
                      </div>
                    </div>
                  </Parallax>
                ))}
              </div>

              <div className="absolute inset-x-0 bottom-10 text-center">
                <SpecMark style={{ color: accent }}>MONOGRAPH N° 05 — {b.name}</SpecMark>
              </div>
            </div>
          }
          pane={
            <div
              className="h-full w-full"
              style={{
                background:
                  "linear-gradient(90deg, rgba(243,239,230,0.98), rgba(243,239,230,0.8) 62%, rgba(243,239,230,0.12))",
              }}
            />
          }
          interior={
        <div className="mx-auto grid max-w-[1440px] border-b lg:grid-cols-[1.08fr_0.92fr]" style={{ borderColor: HAIRLINE }}>
          <div className="relative px-5 pb-14 pt-12 md:px-10 md:pb-20 md:pt-16">
            {/* vertical architectural running header */}
            <span
              className="absolute bottom-16 left-2 hidden text-[7.5px] tracking-[0.36em] md:block"
              style={{
                writingMode: "vertical-rl",
                transform: "rotate(180deg)",
                color: "rgba(20,19,17,0.35)",
              }}
              dir="ltr"
            >
              SECTION N° 01 — THE COVER / {city.toUpperCase()}
            </span>

            <div className="mr-4 md:mr-8">
              <div className="flex items-end justify-between gap-4 border-b pb-3" style={{ borderColor: HAIRLINE }}>
                <span className="text-[8px] tracking-[0.34em]" style={{ color: accent }} dir="ltr">
                  THE COVER / N° 01
                </span>
                <span
                  className="text-[8.5px] tracking-[0.24em]"
                  style={{ color: "rgba(20,19,17,0.4)" }}
                  {...editsFor("businessInfo.category")}
                >
                  {b.category}
                </span>
              </div>

              <p
                className="mt-6 text-[clamp(4rem,9vw,8rem)] font-light leading-[0.8] tracking-[-0.05em]"
                style={{ fontFamily: "'Frank Ruhl Libre', serif", color: INK }}
                dir="ltr"
              >
                N° <span style={{ color: primary }}>01</span>
              </p>

              <h1
                className="mt-6 max-w-[14ch] text-[clamp(2.4rem,4.7vw,4.4rem)] font-light leading-[1.06] tracking-[-0.04em]"
                style={{ fontFamily: "'Frank Ruhl Libre', serif", color: INK }}
                {...editsFor("hero.headline")}
              >
                <EditorialHeadline text={hero.headline} />
              </h1>

              <p
                className="mt-6 max-w-lg text-[12.5px] leading-[2]"
                style={{ color: "rgba(20,19,17,0.58)" }}
                {...editsFor("hero.subheadline")}
              >
                {hero.subheadline}
              </p>

              <div className="mt-9 flex flex-wrap items-center gap-6">
                <Magnetic strength={0.22}>
                  <a
                    href={consultationHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 border px-6 py-3 text-[10.5px] tracking-[0.16em] transition hover:bg-[rgba(20,19,17,0.04)]"
                    style={{ borderColor: "rgba(20,19,17,0.55)", color: INK }}
                  >
                    {hero.ctaText}
                    <span style={{ color: accent }} aria-hidden="true">←</span>
                  </a>
                </Magnetic>
                <span className="text-[8.5px] tracking-[0.2em]" style={{ color: "rgba(20,19,17,0.38)" }}>
                  {b.openingHours}
                </span>
              </div>

              <div className="mt-10 grid max-w-lg grid-cols-3 border-t pt-4" style={{ borderColor: HAIRLINE }}>
                {[
                  { value: b.googleRating.toFixed(1), label: "דירוג" },
                  { value: String(b.reviewsCount), label: "ביקורות" },
                  { value: city, label: "סטודיו" },
                ].map((stat) => (
                  <div key={stat.label} className="border-l pl-3 first:border-l-0 first:pl-0" style={{ borderColor: HAIRLINE_SOFT }}>
                    <p className="text-xl font-light" style={{ fontFamily: "'Frank Ruhl Libre', serif", color: INK }} dir={stat.label === "סטודיו" ? "rtl" : "ltr"}>
                      {stat.value}
                    </p>
                    <p className="mt-1 text-[7.5px] tracking-[0.2em]" style={{ color: "rgba(20,19,17,0.4)" }}>
                      {stat.label}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* framed curtain photograph */}
          <div className="relative border-t p-4 md:p-6 lg:border-r lg:border-t-0" style={{ borderColor: HAIRLINE }}>
            <div className="h-full border p-2" style={{ borderColor: HAIRLINE }}>
              <div className="relative h-[52vh] overflow-hidden lg:h-full lg:min-h-[600px]">
                {hero.backgroundImage ? (
                  <>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={hero.backgroundImage}
                      alt=""
                      className="h-full w-full object-cover"
                      style={{ filter: "saturate(0.78) contrast(1.04) brightness(1.02)" }}
                    />
                    <div
                      aria-hidden="true"
                      className="absolute inset-0"
                      style={{
                        background:
                          "linear-gradient(180deg, rgba(243,239,230,0.05), rgba(243,239,230,0.22))",
                      }}
                    />
                  </>
                ) : (
                  <div className="flex h-full items-center justify-center" style={{ background: "rgba(20,19,17,0.04)" }}>
                    <span className="text-[8px] tracking-[0.36em]" style={{ color: "rgba(20,19,17,0.4)" }} dir="ltr">
                      COVER PLATE
                    </span>
                  </div>
                )}

                <div className="absolute inset-x-4 top-4 flex items-center justify-between">
                  <span className="border bg-[rgba(243,239,230,0.82)] px-2.5 py-1 text-[7.5px] tracking-[0.26em] backdrop-blur" style={{ borderColor: HAIRLINE, color: INK }} dir="ltr">
                    PLATE 01 / COVER
                  </span>
                  <span className="text-[7.5px] tracking-[0.28em] text-white/75" dir="ltr">
                    {b.name.toUpperCase()}
                  </span>
                </div>

                <div className="absolute inset-x-4 bottom-4 border bg-[rgba(243,239,230,0.9)] p-4 backdrop-blur" style={{ borderColor: HAIRLINE }}>
                  <p className="text-[7.5px] tracking-[0.28em]" style={{ color: accent }} dir="ltr">
                    MATERIAL / LIGHT / PROPORTION
                  </p>
                  <p className="mt-2 text-base font-light" style={{ fontFamily: "'Frank Ruhl Libre', serif", color: INK }}>
                    {b.tagline}
                  </p>
                  <p className="mt-1.5 text-[9.5px] leading-relaxed" style={{ color: "rgba(20,19,17,0.5)" }}>
                    {b.address} · {b.openingHours}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
          }
        />
      </section>

      {/* ---------------- editorial statement ---------------- */}
      <section className="relative z-10 mx-auto max-w-[1440px] border-b px-5 py-14 md:px-10 md:py-20" style={{ borderColor: HAIRLINE }}>
        <div className="grid gap-8 md:grid-cols-[0.7fr_1.3fr]">
          <div>
            <p className="text-[8px] tracking-[0.34em]" style={{ color: accent }} dir="ltr">
              EDITOR'S NOTE / N° 02
            </p>
            <p className="mt-4 text-[8.5px] leading-[2] tracking-[0.14em]" style={{ color: "rgba(20,19,17,0.42)" }}>
              {b.category} · {city}
              <br />
              מונוגרפיה אדריכלית
            </p>
          </div>
          <div className="border-r pr-6 md:pr-10" style={{ borderColor: HAIRLINE }}>
            <p
              className="max-w-4xl text-[clamp(1.4rem,2.5vw,2.2rem)] font-light leading-[1.5] tracking-[-0.02em]"
              style={{ fontFamily: "'Frank Ruhl Libre', serif", color: INK }}
              {...editsFor("businessInfo.description")}
            >
              {b.description}
            </p>
          </div>
        </div>
      </section>

      {/* ---------------- sliding architectural curtain ---------------- */}
      <section id="curtain" className="relative z-10 border-b" style={{ borderColor: HAIRLINE }}>
        <div className="mx-auto flex max-w-[1440px] flex-wrap items-end justify-between gap-3 px-5 py-6 md:px-10">
          <div>
            <p className="text-[8px] tracking-[0.34em]" style={{ color: accent }} dir="ltr">
              PORTFOLIO INDEX / N° 03
            </p>
            <h2
              className="mt-2 text-2xl font-light tracking-[-0.02em] md:text-3xl"
              style={{ fontFamily: "'Frank Ruhl Libre', serif", color: INK }}
            >
              מסך אדריכלי שנפתח
            </h2>
          </div>
          <p className="max-w-sm text-[9.5px] leading-[1.9]" style={{ color: "rgba(20,19,17,0.5)" }}>
            העבירו את העכבר או לחצו על עמודה. הקיר נע מ־15% ל־60% וחושף את
            התצלום, המפרט וההשקעה.
          </p>
        </div>

        <div className="relative flex h-[68vh] min-h-[540px] w-full border-y" style={{ borderColor: HAIRLINE }}>
          {columns.map((service, i) => {
            const isActive = safeColumn === i;
            const image = projects[i]?.afterImage || hero.backgroundImage;
            const price = parsePrice(service.price);
            const href = waLink(
              b.whatsapp,
              [
                `שלום, אשמח לייעוץ לגבי ${service.title} — ${b.name}.`,
                price ? `• הערכת השקעה: ${formatNis(price)}` : "",
                "אשמח לתאם פגישה.",
              ]
                .filter(Boolean)
                .join("\n"),
            );

            return (
              <article
                key={i}
                onMouseEnter={() => setActiveColumn(i)}
                onFocus={() => setActiveColumn(i)}
                onClick={() => setActiveColumn(i)}
                className="group relative min-w-0 shrink-0 cursor-pointer overflow-hidden border-l first:border-l-0"
                style={{
                  // 15% closed → 60% open; the three closed columns shrink
                  // fractionally so the four-wall composition always fits.
                  flexBasis: isActive ? "60%" : "15%",
                  flexShrink: isActive ? 0 : 1,
                  borderColor: HAIRLINE,
                  transition: "flex-basis 800ms cubic-bezier(0.22, 1, 0.36, 1)",
                }}
                aria-expanded={isActive}
              >
                {image ? (
                  <>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={image}
                      alt={service.title}
                      loading="lazy"
                      className="absolute inset-0 h-full w-full object-cover transition-all duration-[900ms]"
                      style={{
                        filter: isActive
                          ? "saturate(0.82) contrast(1.02)"
                          : "saturate(0.25) contrast(0.95) brightness(1.04)",
                        opacity: isActive ? 1 : 0.6,
                        transform: isActive ? "scale(1)" : "scale(1.04)",
                      }}
                    />
                    <div
                      aria-hidden="true"
                      className="absolute inset-0 transition-opacity duration-700"
                      style={{
                        background: isActive
                          ? "linear-gradient(180deg, rgba(20,19,17,0.12) 0%, rgba(20,19,17,0.18) 38%, rgba(20,19,17,0.86) 100%)"
                          : "linear-gradient(180deg, rgba(243,239,230,0.12), rgba(20,19,17,0.55))",
                      }}
                    />
                  </>
                ) : (
                  <div className="absolute inset-0" style={{ background: "rgba(20,19,17,0.08)" }} />
                )}

                {/* index at top */}
                <span
                  className="absolute right-3 top-3 border bg-[rgba(243,239,230,0.85)] px-1.5 py-0.5 text-[8px] tracking-[0.22em] backdrop-blur"
                  style={{ borderColor: HAIRLINE, color: INK }}
                  dir="ltr"
                >
                  {String(i + 1).padStart(2, "0")}
                </span>

                {/* vertical inactive title */}
                <div
                  className="absolute bottom-8 left-4 origin-bottom-left transition-opacity duration-500"
                  style={{
                    transform: "rotate(-90deg)",
                    opacity: isActive ? 0 : 1,
                    pointerEvents: "none",
                    whiteSpace: "nowrap",
                  }}
                >
                  <span className="text-[11px] tracking-[0.14em] text-white/90">
                    {service.title}
                  </span>
                </div>

                {/* active editorial content */}
                <div
                  className="absolute inset-x-0 bottom-0 transition-all duration-700"
                  style={{
                    padding: "clamp(1rem, 2.5vw, 2.5rem)",
                    opacity: isActive ? 1 : 0,
                    transform: isActive ? "translateY(0)" : "translateY(18px)",
                    pointerEvents: isActive ? "auto" : "none",
                  }}
                >
                  <div className="mb-4 flex items-center gap-3">
                    <span className="text-[8px] tracking-[0.3em]" style={{ color: "#f3efe6" }} dir="ltr">
                      SECTION 0{i + 1} / {service.title}
                    </span>
                    <span className="h-px flex-1 bg-white/25" />
                  </div>
                  <h3
                    className="text-[clamp(1.7rem,3vw,3.1rem)] font-light leading-[1.08] tracking-[-0.03em] text-[#f6f2e9]"
                    style={{ fontFamily: "'Frank Ruhl Libre', serif" }}
                    {...editsFor(`services.${i}.title`)}
                  >
                    {service.title}
                  </h3>
                  <div className="mt-4 grid gap-5 md:grid-cols-[1fr_auto] md:items-end">
                    <div>
                      <p
                        className="max-w-xl text-[11.5px] leading-[1.95] text-white/65"
                        {...editsFor(`services.${i}.description`)}
                      >
                        {service.description}
                      </p>
                      <div className="mt-4 flex flex-wrap items-center gap-x-6 gap-y-2 text-[8px] tracking-[0.2em] text-white/42">
                        <span>Timeline · 6—10 שבועות</span>
                        <span>Finish · Bespoke</span>
                        <span>Warranty · 5Y</span>
                      </div>
                    </div>
                    <div className="flex items-end gap-5">
                      <div>
                        <p className="text-[7.5px] tracking-[0.24em] text-white/38">FROM</p>
                        <p
                          className="mt-1 text-xl font-light text-[#f6f2e9]"
                          style={{ fontFamily: "'Frank Ruhl Libre', serif" }}
                          dir="ltr"
                          {...editsFor(`services.${i}.price`)}
                        >
                          {service.price ?? "—"}
                        </p>
                      </div>
                      <a
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(event) => event.stopPropagation()}
                        className="border border-white/40 bg-[rgba(243,239,230,0.1)] px-4 py-2.5 text-[9px] tracking-[0.16em] text-white backdrop-blur transition hover:bg-[rgba(243,239,230,0.2)]"
                      >
                        ייעוץ
                      </a>
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
          {columns.length === 0 && (
            <div className="flex flex-1 items-center justify-center text-[10px] tracking-[0.2em]" style={{ color: "rgba(20,19,17,0.45)" }}>
              הקטלוג מתעדכן בימים אלה.
            </div>
          )}
        </div>
      </section>

      {/* ---------------- project plates ---------------- */}
      {projects.length > 0 && (
        <section id="plates" className="relative z-10 mx-auto max-w-[1440px] px-5 py-14 md:px-10 md:py-20">
          <div className="mb-7 flex items-end justify-between gap-4 border-b pb-3" style={{ borderColor: HAIRLINE }}>
            <div>
              <p className="text-[8px] tracking-[0.34em]" style={{ color: accent }} dir="ltr">
                PLATES / N° 04
              </p>
              <h2 className="mt-2 text-2xl font-light tracking-[-0.02em] md:text-3xl" style={{ fontFamily: "'Frank Ruhl Libre', serif", color: INK }}>
                ארכיון הפרויקטים
              </h2>
            </div>
            <span className="text-[7.5px] tracking-[0.24em]" style={{ color: "rgba(20,19,17,0.38)" }} dir="ltr">
              {String(projects.length).padStart(2, "0")} PLATES
            </span>
          </div>

          <div className="grid gap-6 md:grid-cols-12">
            {projects.slice(0, 3).map((project, i) => (
              <figure
                key={i}
                className={`group ${i === 0 ? "md:col-span-7" : "md:col-span-5"} ${
                  i === 2 ? "md:col-start-4" : ""
                }`}
              >
                <div className="border p-2" style={{ borderColor: HAIRLINE }}>
                  <div className="relative h-[30vh] overflow-hidden md:h-[38vh]">
                    {project.afterImage ? (
                      <>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={project.afterImage}
                          alt={project.title}
                          loading="lazy"
                          className="h-full w-full object-cover transition-transform duration-[1000ms] group-hover:scale-[1.02]"
                          style={{ filter: "saturate(0.8) contrast(1.02)" }}
                        />
                        <span
                          className="absolute right-3 top-3 border bg-[rgba(243,239,230,0.88)] px-2 py-1 text-[7.5px] tracking-[0.24em] backdrop-blur"
                          style={{ borderColor: HAIRLINE, color: INK }}
                          dir="ltr"
                        >
                          PLATE {String(i + 1).padStart(2, "0")}
                        </span>
                      </>
                    ) : (
                      <div className="h-full" style={{ background: "rgba(20,19,17,0.06)" }} />
                    )}
                  </div>
                </div>
                <figcaption className="mt-2 flex items-baseline justify-between gap-4 border-t pt-2" style={{ borderColor: HAIRLINE_SOFT }}>
                  <span className="text-sm font-light" style={{ fontFamily: "'Frank Ruhl Libre', serif", color: INK }}>
                    {project.title}
                  </span>
                  <span className="text-[8px] tracking-[0.16em]" style={{ color: "rgba(20,19,17,0.38)" }}>
                    {city}
                  </span>
                </figcaption>
                <p className="mt-1 text-[10.5px] leading-[1.85]" style={{ color: "rgba(20,19,17,0.5)" }}>
                  {project.description}
                </p>
              </figure>
            ))}
          </div>
        </section>
      )}

      {/* ---------------- process ledger ---------------- */}
      <section id="process" className="relative z-10 border-y" style={{ borderColor: HAIRLINE }}>
        <div className="mx-auto max-w-[1440px] px-5 py-14 md:px-10 md:py-20">
          <div className="mb-7 grid gap-4 md:grid-cols-[0.6fr_1.4fr]">
            <p className="text-[8px] tracking-[0.34em]" style={{ color: accent }} dir="ltr">
              METHOD / N° 05
            </p>
            <h2 className="text-2xl font-light tracking-[-0.02em] md:text-3xl" style={{ fontFamily: "'Frank Ruhl Libre', serif", color: INK }}>
              תהליך עבודה, לפי הסדר.
            </h2>
          </div>
          <div>
            {processRows.slice(0, 4).map((step, i) => (
              <motion.div
                key={`${step.title}-${i}`}
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.55, delay: i * 0.04 }}
                className="grid items-baseline gap-3 border-t py-5 md:grid-cols-[5rem_1fr_1.4fr]"
                style={{ borderColor: HAIRLINE }}
              >
                <span className="text-3xl font-light leading-none" style={{ fontFamily: "'Frank Ruhl Libre', serif", color: accent }} dir="ltr">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <h3 className="text-lg font-light" style={{ fontFamily: "'Frank Ruhl Libre', serif", color: INK }}>
                  {step.title}
                </h3>
                <p className="max-w-2xl text-[11px] leading-[1.95]" style={{ color: "rgba(20,19,17,0.55)" }}>
                  {step.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------- reviews as marginalia ---------------- */}
      <section className="relative z-10 mx-auto max-w-[1440px] px-5 py-14 md:px-10 md:py-20">
        <div className="mb-7 flex items-center justify-between border-b pb-3" style={{ borderColor: HAIRLINE }}>
          <p className="text-[8px] tracking-[0.34em]" style={{ color: accent }} dir="ltr">
            MARGINALIA / N° 06
          </p>
          <span className="flex items-center gap-3 text-[9px]" style={{ color: "rgba(20,19,17,0.5)" }}>
            {b.googleRating.toFixed(1)} / 5
            <RatingBars rating={b.googleRating} color={accent} />
          </span>
        </div>
        <div className="grid gap-8 md:grid-cols-12">
          {reviews.slice(0, 3).map((review, i) => (
            <figure
              key={i}
              className={
                i === 0
                  ? "md:col-span-7 md:border-l md:pl-8"
                  : "md:col-span-5 md:border-l md:pl-8"
              }
              style={{ borderColor: HAIRLINE }}
            >
              <span className="text-[8px] tracking-[0.26em]" style={{ color: accent }} dir="ltr">
                NOTE 0{i + 1}
              </span>
              <blockquote
                className="mt-3 text-[15px] font-light leading-[1.9] md:text-[17px]"
                style={{ fontFamily: "'Frank Ruhl Libre', serif", color: INK }}
                {...editsFor(`reviews.${i}.text`)}
              >
                “{review.text}”
              </blockquote>
              <figcaption className="mt-5 flex items-center justify-between border-t pt-2 text-[8.5px] tracking-[0.2em]" style={{ borderColor: HAIRLINE_SOFT, color: "rgba(20,19,17,0.45)" }}>
                <span {...editsFor(`reviews.${i}.author`)}>{review.author}</span>
                <span dir="ltr">{review.rating}.0 / 5</span>
              </figcaption>
            </figure>
          ))}
        </div>
      </section>

      {/* ---------------- FAQ + consulting ---------------- */}
      <section id="contact" className="relative z-10 border-t" style={{ borderColor: HAIRLINE }}>
        <div className="mx-auto grid max-w-[1440px] gap-0 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="border-b px-5 py-14 md:px-10 lg:border-b-0 lg:border-l" style={{ borderColor: HAIRLINE }}>
            <p className="text-[8px] tracking-[0.34em]" style={{ color: accent }} dir="ltr">
              QUESTIONS / N° 07
            </p>
            <h2 className="mt-3 mb-7 text-2xl font-light md:text-3xl" style={{ fontFamily: "'Frank Ruhl Libre', serif", color: INK }}>
              לפני שמתחילים לשרטט.
            </h2>
            <FaqAccordion
              items={faq}
              classes={{
                card: "border-b",
                button: "flex w-full items-center justify-between gap-4 py-4 text-right text-[11.5px]",
                icon: "h-3.5 w-3.5",
                answer: "pb-4 text-[10.5px] leading-[1.95]",
              }}
            />
          </div>

          <div className="flex flex-col justify-between px-5 py-14 md:px-10">
            <div>
              <p className="text-[8px] tracking-[0.34em]" style={{ color: accent }} dir="ltr">
                THE PRACTICE / CONTACT
              </p>
              <p
                className="mt-4 text-[clamp(1.4rem,2.2vw,2rem)] font-light leading-[1.4] tracking-[-0.02em]"
                style={{ fontFamily: "'Frank Ruhl Libre', serif", color: INK }}
              >
                {b.name}
              </p>
              <dl className="mt-5 space-y-2 text-[10.5px]" style={{ color: "rgba(20,19,17,0.6)" }}>
                <div className="flex gap-3 border-t pt-2" style={{ borderColor: HAIRLINE_SOFT }}>
                  <dt className="w-16 shrink-0 text-[8px] tracking-[0.2em]" style={{ color: "rgba(20,19,17,0.35)" }}>STUDIO</dt>
                  <dd>{b.address}</dd>
                </div>
                <div className="flex gap-3 border-t pt-2" style={{ borderColor: HAIRLINE_SOFT }}>
                  <dt className="w-16 shrink-0 text-[8px] tracking-[0.2em]" style={{ color: "rgba(20,19,17,0.35)" }}>HOURS</dt>
                  <dd>{b.openingHours}</dd>
                </div>
                <div className="flex gap-3 border-t pt-2" style={{ borderColor: HAIRLINE_SOFT }}>
                  <dt className="w-16 shrink-0 text-[8px] tracking-[0.2em]" style={{ color: "rgba(20,19,17,0.35)" }}>PHONE</dt>
                  <dd dir="ltr">{b.phone}</dd>
                </div>
              </dl>
            </div>
            <div className="mt-8">
              <a
                href={consultationHref}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between px-5 py-4 text-[10.5px] tracking-[0.16em] text-[#f3efe6]"
                style={{ background: INK }}
              >
                תיאום פגישת ייעוץ
                <span aria-hidden="true">←</span>
              </a>
              <p className="mt-2 text-[8px] tracking-[0.2em]" style={{ color: "rgba(20,19,17,0.38)" }}>
                ללא התחייבות · מדידה ותכנון ראשוניים
              </p>
            </div>
          </div>
        </div>
      </section>

      <footer className="relative z-10 border-t px-5 py-8 md:px-10" style={{ borderColor: HAIRLINE }}>
        <div className="mx-auto flex max-w-[1440px] flex-wrap items-center justify-between gap-3">
          <span className="text-[7.5px] tracking-[0.34em]" style={{ color: "rgba(20,19,17,0.38)" }} dir="ltr">
            {b.name.toUpperCase()} · ARCHITECTURAL MONOGRAPH · {city.toUpperCase()}
          </span>
          <span className="text-[7.5px] tracking-[0.24em]" style={{ color: "rgba(20,19,17,0.32)" }} dir="ltr">
            N° 05 — {new Date().getFullYear()} / {primary.toUpperCase()}
          </span>
        </div>
      </footer>
    </div>
  );
}
