"use client";

import React, { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, MessageCircle, Phone, X } from "lucide-react";
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

/** The orbiting constellation: each island sits at its own Z depth, so the
 * cursor parallax separates them into a real spatial volume. */
const ORBIT_ISLANDS = [
  { start: "6%", top: "12%", w: 232, h: 132, z: 150, depth: 46, tilt: 20, label: "VIEW 01" },
  { start: "62%", top: "6%", w: 178, h: 178, z: 260, depth: 74, tilt: 30, label: "MESH" },
  { start: "16%", top: "58%", w: 300, h: 108, z: 90, depth: 28, tilt: 14, label: "VOLUME" },
  { start: "70%", top: "62%", w: 196, h: 148, z: 200, depth: 58, tilt: 24, label: "LENS" },
] as const;

/* ------------------------------------------------------------------ */
/* SPATIAL / VISIONOS FLOATING ISLANDS                                 */
/* Titanium void #07080C. No flat full-width sections: the page is a   */
/* constellation of levitating glass islands, a morphing Dynamic       */
/* Island, expandable service pods and a pinned split hardware stage.  */
/* ------------------------------------------------------------------ */

const GLASS =
  "rounded-[32px] border border-white/[0.12] bg-white/[0.04] backdrop-blur-3xl shadow-[inset_0_1px_1px_rgba(255,255,255,0.25),0_36px_90px_-28px_rgba(0,0,0,0.95)]";

const NAV_ITEMS = [
  { href: "#pods", label: "שירותים" },
  { href: "#showcase", label: "מוצר" },
  { href: "#work", label: "עבודות" },
  { href: "#voices", label: "ביקורות" },
  { href: "#contact", label: "צור קשר" },
];

export function AppleSpatialTemplate() {
  const { data, editsFor } = useSite();
  const { businessInfo: b, hero, services, faq, reviews, projects = [], benefits = [] } = data;

  const accent = data.theme.accentColor || "#7aa2ff";
  const primary = data.theme.primaryColor || "#f5f5f7";
  const city = b.address.split(",")[0]?.trim() || b.address;

  const [expanded, setExpanded] = useState(false);
  const [pinned, setPinned] = useState(false);
  const [openPod, setOpenPod] = useState<number | null>(null);
  const [podTab, setPodTab] = useState<"spec" | "price">("spec");
  const [activeShot, setActiveShot] = useState(0);

  const heroHref = waLink(
    b.whatsapp,
    `שלום ${b.name}, אשמח לשמוע פרטים ולתאם שיחה.`,
  );

  const scrollTo = (href: string) => {
    setExpanded(false);
    setPinned(false);
    document.querySelector(href)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const openPodData = openPod !== null ? services[openPod] : null;
  const openPodPrice = parsePrice(openPodData?.price);

  const spotlight = projects[activeShot] ?? projects[0];
  const stats = [
    { value: b.googleRating.toFixed(1), label: "דירוג לקוחות", suffix: "/5" },
    { value: String(b.reviewsCount), label: "ביקורות מאומתות", suffix: "" },
    { value: "24/7", label: "מענה אישי", suffix: "" },
  ];

  return (
    <div
      className="relative min-h-screen overflow-x-hidden text-white/80"
      style={{ background: "#07080C" }}
      dir="rtl"
    >
      {/* Titanium ambient canvas */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-0"
        style={{
          background:
            "radial-gradient(55% 40% at 76% -8%, rgba(106,132,206,0.19), transparent 68%), radial-gradient(50% 45% at 8% 22%, rgba(255,255,255,0.055), transparent 70%), radial-gradient(40% 40% at 50% 105%, rgba(86,94,120,0.12), transparent 70%)",
        }}
      />
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-0 opacity-[0.055]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.6) 1px, transparent 1px)",
          backgroundSize: "92px 92px",
          maskImage: "radial-gradient(80% 70% at 50% 30%, black, transparent 90%)",
          WebkitMaskImage: "radial-gradient(80% 70% at 50% 30%, black, transparent 90%)",
        }}
      />

      {/* Spatial key light — follows the cursor across the whole void. */}
      <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-[5]">
        <SpecularLight color="rgba(122,162,255,0.14)" size={52} />
      </div>

      {/* ---------------- Dynamic Island navigation ---------------- */}
      <div className="pointer-events-none fixed inset-x-0 top-3 z-[9700] flex justify-center px-3">
        <motion.div
          layout
          onMouseEnter={() => setExpanded(true)}
          onMouseLeave={() => {
            if (!pinned) setExpanded(false);
          }}
          onClick={() => {
            setPinned((value) => !value);
            setExpanded(true);
          }}
          initial={{ y: -64, opacity: 0 }}
          animate={{
            y: 0,
            opacity: 1,
            width: expanded ? "min(660px, 94vw)" : "min(236px, 74vw)",
          }}
          transition={{ type: "spring", stiffness: 330, damping: 30 }}
          className="pointer-events-auto cursor-pointer overflow-hidden border border-white/[0.14] bg-[#111318]/70 shadow-[0_18px_50px_rgba(0,0,0,0.55),inset_0_1px_0_rgba(255,255,255,0.14)] backdrop-blur-2xl"
          style={{ borderRadius: 30 }}
          role="button"
          aria-expanded={expanded}
          aria-label="ניווט מרחבי"
        >
          <motion.div layout className="flex items-center justify-between gap-3 px-5 py-3">
            <span className="flex items-center gap-2 text-[12px] font-semibold text-white/90">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#30d158] opacity-60" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-[#30d158]" />
              </span>
              {expanded ? `פתוח כעת ב${city} • זמינות מיידית` : "פתוח כעת"}
            </span>
            <ChevronDown
              className={`h-4 w-4 shrink-0 text-white/45 transition-transform ${expanded ? "rotate-180" : ""}`}
              aria-hidden="true"
            />
          </motion.div>

          <AnimatePresence initial={false}>
            {expanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              >
                <div className="border-t border-white/[0.08] px-5 pb-4 pt-3">
                  <div className="mb-3 flex items-center justify-between rounded-2xl bg-white/[0.05] px-4 py-3">
                    <span className="text-[11px] text-white/50">{b.openingHours}</span>
                    <span className="text-[11px] font-semibold" style={{ color: accent }}>
                      {b.category}
                    </span>
                  </div>
                  <nav className="grid grid-cols-5 gap-1.5">
                    {NAV_ITEMS.map((item) => (
                      <button
                        key={item.href}
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation();
                          scrollTo(item.href);
                        }}
                        className="rounded-xl bg-white/[0.05] px-1 py-2.5 text-[10.5px] font-medium text-white/65 transition hover:bg-white/[0.12] hover:text-white"
                      >
                        {item.label}
                      </button>
                    ))}
                  </nav>
                  <div className="mt-2.5 flex gap-2">
                    <a
                      href={heroHref}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(event) => event.stopPropagation()}
                      className="flex flex-1 items-center justify-center gap-1.5 rounded-2xl py-2.5 text-[12px] font-bold text-[#07080C]"
                      style={{ background: accent }}
                    >
                      <MessageCircle className="h-3.5 w-3.5" aria-hidden="true" />
                      וואטסאפ מיידי
                    </a>
                    <a
                      href={`tel:${b.phone}`}
                      onClick={(event) => event.stopPropagation()}
                      className="flex flex-1 items-center justify-center gap-1.5 rounded-2xl bg-white/[0.07] py-2.5 text-[12px] font-semibold text-white/80"
                    >
                      <Phone className="h-3.5 w-3.5" aria-hidden="true" />
                      {b.phone}
                    </a>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* ---------------- hero constellation — orbiting 3D island portal ----------------
          Levitating frosted-glass islands orbit and tilt in Z-space as the
          cursor moves. Scrolling drives a keynote-style camera flight through
          the constellation: the glass layers separate, the holographic mesh
          passes the lens, and the hero island assembles from inside. */}
      <section id="top" className="relative z-10">
        <CameraPortal
          heightVh={320}
          perspective={1300}
          zoom={3.5}
          blurOut={26}
          veilColor="rgba(7,8,12,0.93)"
          hint={
            <span className="flex flex-col items-center gap-3">
              <SpecMark className="text-white/35">SCROLL TO ENTER SPACE</SpecMark>
              <span className="block h-10 w-px bg-gradient-to-b from-white/50 to-transparent" />
            </span>
          }
          scene={
            <div className="absolute inset-0 overflow-hidden">
              {/* interactive holographic mesh floor */}
              <Parallax depth={26} className="absolute inset-0">
                <div
                  aria-hidden="true"
                  className="absolute inset-x-0 bottom-0 h-[62%] opacity-60"
                  style={{
                    backgroundImage:
                      "linear-gradient(rgba(122,162,255,0.34) 1px, transparent 1px), linear-gradient(90deg, rgba(122,162,255,0.34) 1px, transparent 1px)",
                    backgroundSize: "72px 72px",
                    transform: "perspective(600px) rotateX(66deg)",
                    transformOrigin: "bottom",
                    maskImage: "linear-gradient(to top, black, transparent)",
                    WebkitMaskImage: "linear-gradient(to top, black, transparent)",
                  }}
                />
                <div
                  aria-hidden="true"
                  className="absolute inset-0 animate-breathe"
                  style={{
                    background:
                      "radial-gradient(42% 34% at 50% 46%, rgba(122,162,255,0.22), transparent 72%)",
                  }}
                />
              </Parallax>

              {/* the orbiting island constellation */}
              {ORBIT_ISLANDS.map((island, i) => (
                <Parallax
                  key={island.label}
                  depth={island.depth}
                  depthZ={island.z}
                  className="absolute"
                  style={{
                    insetInlineStart: island.start,
                    top: island.top,
                    width: island.w,
                    height: island.h,
                  }}
                >
                  <TiltStage
                    intensity={island.tilt}
                    glareColor="rgba(255,255,255,0.22)"
                    className="h-full w-full"
                  >
                    <div
                      className={`${GLASS} flex h-full w-full flex-col justify-between p-4`}
                      style={{ animation: `floaty ${7 + i * 1.4}s ease-in-out infinite` }}
                    >
                      <SpecMark className="text-white/40">{island.label}</SpecMark>
                      <span
                        aria-hidden="true"
                        className="block h-px w-full"
                        style={{
                          background:
                            "linear-gradient(90deg, transparent, rgba(255,255,255,0.55), transparent)",
                        }}
                      />
                      <div className="flex items-end justify-between">
                        <span className="font-grotesk text-xl font-light text-white/70" dir="ltr">
                          {String(island.z).padStart(3, "0")}
                        </span>
                        <span className="text-[8px] tracking-[0.3em] text-white/30" dir="ltr">
                          Z-DEPTH
                        </span>
                      </div>
                    </div>
                  </TiltStage>
                </Parallax>
              ))}

              {/* pinned center stage: the Dynamic Island command pod */}
              <div className="pointer-events-none absolute inset-x-0 top-24 flex justify-center md:top-28">
                <Magnetic strength={0.2} maxPull={16}>
                  <div className="pointer-events-auto flex items-center gap-3 rounded-full border border-white/[0.14] bg-[#111318]/70 px-5 py-2.5 backdrop-blur-2xl">
                    <span className="relative flex h-2 w-2">
                      <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#30d158] opacity-60" />
                      <span className="relative inline-flex h-2 w-2 rounded-full bg-[#30d158]" />
                    </span>
                    <SpecMark className="text-white/70">SPATIAL / {b.name}</SpecMark>
                  </div>
                </Magnetic>
              </div>
            </div>
          }
          interior={
        <div className="relative mx-auto grid max-w-7xl gap-5 px-4 pb-16 pt-32 md:grid-cols-12 md:pt-40">
          <motion.div
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: [0.16, 1, 0.3, 1] }}
            className={`${GLASS} relative z-10 p-7 md:col-span-8 md:p-11`}
          >
            <div className="flex items-center justify-between gap-4">
              <p
                className="text-[9.5px] tracking-[0.38em] text-white/36"
                {...editsFor("businessInfo.category")}
              >
                {b.category}
              </p>
              <span className="text-[9px] tracking-[0.24em] text-white/22" dir="ltr">
                SPATIAL / 01
              </span>
            </div>
            <h1
              className="mt-7 max-w-4xl text-[clamp(2.4rem,5.6vw,4.8rem)] font-light leading-[1.08] tracking-[-0.03em] text-[#f5f5f7]"
              {...editsFor("hero.headline")}
            >
              <EditorialHeadline text={hero.headline} />
            </h1>
            <p
              className="mt-6 max-w-xl text-[13.5px] leading-[1.95] text-white/48"
              {...editsFor("hero.subheadline")}
            >
              {hero.subheadline}
            </p>
            <div className="mt-9 flex flex-wrap items-center gap-3">
              <Magnetic strength={0.3}>
                <a
                  href={heroHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="rounded-full px-7 py-3 text-[13px] font-bold text-[#07080C] transition-transform hover:scale-[1.02]"
                  style={{
                    background: accent,
                    boxShadow: `0 12px 38px color-mix(in srgb, ${accent} 30%, transparent)`,
                  }}
                >
                  {hero.ctaText}
                </a>
              </Magnetic>
              <a
                href={`tel:${b.phone}`}
                dir="ltr"
                className="rounded-full border border-white/[0.14] bg-white/[0.04] px-6 py-3 text-[12px] font-medium text-white/70 transition hover:bg-white/[0.09]"
              >
                {b.phone}
              </a>
            </div>
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-10 top-0 h-px"
              style={{
                background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.5), transparent)",
              }}
            />
          </motion.div>

          {/* floating stat island */}
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, delay: 0.12 }}
            className={`${GLASS} p-5 md:col-span-4`}
            style={{ animation: "slow-drift 9s ease-in-out infinite" }}
          >
            <p className="text-[9px] tracking-[0.3em] text-white/32" dir="ltr">
              LIVE REPUTATION
            </p>
            <div className="mt-5 flex items-end justify-between">
              <span className="text-5xl font-light tracking-tight text-[#f5f5f7]" dir="ltr">
                {b.googleRating.toFixed(1)}
                <span className="text-xl text-white/25">/5</span>
              </span>
              <RatingBars rating={b.googleRating} color={accent} className="mb-1.5" />
            </div>
            <p className="mt-3 text-[10.5px] text-white/35">
              {b.reviewsCount} ביקורות Google מאומתות
            </p>
            <div className="mt-5 grid grid-cols-2 gap-2 border-t border-white/[0.08] pt-4">
              <div>
                <p className="text-[8.5px] tracking-[0.22em] text-white/25">CITY</p>
                <p className="mt-1 text-[11px] text-white/70">{city}</p>
              </div>
              <div>
                <p className="text-[8.5px] tracking-[0.22em] text-white/25">STATUS</p>
                <p className="mt-1 text-[11px]" style={{ color: accent }}>
                  פנויים לפרויקט
                </p>
              </div>
            </div>
          </motion.div>

          {/* floating photograph island */}
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.1, delay: 0.08 }}
            className={`${GLASS} relative overflow-hidden p-2 md:col-span-7 md:row-start-2`}
          >
            {hero.backgroundImage ? (
              <div className="relative h-[38vh] overflow-hidden rounded-[26px] md:h-[48vh]">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={hero.backgroundImage}
                  alt=""
                  className="h-full w-full object-cover"
                  style={{ filter: "saturate(0.78) contrast(1.04)", transform: "scale(1.01)" }}
                />
                <div
                  aria-hidden="true"
                  className="absolute inset-0"
                  style={{
                    background:
                      "linear-gradient(180deg, rgba(7,8,12,0.05) 0%, rgba(7,8,12,0.55) 100%)",
                  }}
                />
                <div className="absolute inset-x-4 bottom-4 flex items-end justify-between gap-3">
                  <div>
                    <p className="text-[8.5px] tracking-[0.32em] text-white/45" dir="ltr">
                      TITANIUM SERIES
                    </p>
                    <p className="mt-1 text-lg font-light text-white/90">{b.name}</p>
                  </div>
                  <span className="rounded-full border border-white/20 bg-black/25 px-3 py-1 text-[9px] tracking-[0.15em] text-white/65 backdrop-blur">
                    {b.tagline.slice(0, 34)}
                  </span>
                </div>
              </div>
            ) : (
              <div className="flex h-[38vh] items-center justify-center md:h-[48vh]">
                <span className="text-[10px] tracking-[0.4em] text-white/30" dir="ltr">
                  SPATIAL PREVIEW
                </span>
              </div>
            )}
          </motion.div>

          {/* small floating category island */}
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.25 }}
            className={`${GLASS} flex flex-col justify-between p-6 md:col-span-5 md:row-start-2`}
          >
            <div>
              <p className="text-[9px] tracking-[0.34em] text-white/30" dir="ltr">
                THE STUDIO
              </p>
              <p
                className="mt-4 text-[15px] font-light leading-[1.85] text-white/70"
                {...editsFor("businessInfo.description")}
              >
                {b.description}
              </p>
            </div>
            <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-2 border-t border-white/[0.08] pt-4 text-[10px] tracking-[0.12em] text-white/32">
              <span>{b.address}</span>
              <span>{b.openingHours}</span>
            </div>
          </motion.div>

          {/* floating metrics strip island */}
          <div className={`${GLASS} grid grid-cols-3 gap-px overflow-hidden md:col-span-12`}>
            {stats.map((stat, i) => (
              <div key={i} className="bg-white/[0.015] px-5 py-5 text-center md:px-8 md:py-6">
                <p className="text-2xl font-light text-[#f5f5f7] md:text-3xl" dir="ltr">
                  {stat.value}
                  <span className="text-sm text-white/25">{stat.suffix}</span>
                </p>
                <p className="mt-1 text-[9.5px] tracking-[0.16em] text-white/32">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
          }
        />
      </section>

      {/* ---------------- expandable spatial service pods ---------------- */}
      <section id="pods" className="relative z-10 mx-auto max-w-7xl px-4 py-20">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4 px-1">
          <div>
            <p className="text-[9px] tracking-[0.38em] text-white/30" dir="ltr">
              SPATIAL PODS / 02
            </p>
            <h2 className="mt-3 text-3xl font-light tracking-tight text-[#f5f5f7] md:text-4xl">
              שירותים כאיי זכוכית
            </h2>
          </div>
          <p className="max-w-xs text-[11.5px] leading-relaxed text-white/35">
            לחצו על אי כדי לפתוח אותו למצב מיקוד מרחבי — מפרט, השקעה ותיאום.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-6">
          {services.map((service, i) => {
            const isOpen = openPod === i;
            const spans = ["md:col-span-4", "md:col-span-2", "md:col-span-2", "md:col-span-4"];
            return (
              <motion.article
                key={i}
                layout
                onClick={() => {
                  setOpenPod(isOpen ? null : i);
                  setPodTab("spec");
                }}
                className={`${GLASS} group cursor-pointer overflow-hidden p-6 transition-colors hover:border-white/25 md:p-7 ${
                  spans[i % spans.length]
                } ${isOpen ? "md:col-span-6" : ""}`}
                transition={{ type: "spring", stiffness: 280, damping: 28 }}
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <span className="text-[9px] tracking-[0.3em]" style={{ color: accent }} dir="ltr">
                      POD {String(i + 1).padStart(2, "0")}
                    </span>
                    <h3
                      className="mt-3 text-xl font-light leading-[1.25] text-[#f5f5f7] md:text-2xl"
                      {...editsFor(`services.${i}.title`)}
                    >
                      {service.title}
                    </h3>
                  </div>
                  <span
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/15 bg-white/[0.04] text-white/55 transition group-hover:border-white/30 group-hover:text-white"
                    aria-hidden="true"
                  >
                    {isOpen ? "−" : "+"}
                  </span>
                </div>

                <AnimatePresence initial={false}>
                  {isOpen ? (
                    <motion.div
                      key="open"
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      exit={{ opacity: 0, height: 0 }}
                      className="mt-5 border-t border-white/[0.08] pt-5"
                    >
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation();
                            setPodTab("spec");
                          }}
                          className={`rounded-full px-4 py-1.5 text-[10.5px] transition ${
                            podTab === "spec"
                              ? "bg-white/15 text-white"
                              : "bg-white/[0.04] text-white/45"
                          }`}
                        >
                          מפרט
                        </button>
                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation();
                            setPodTab("price");
                          }}
                          className={`rounded-full px-4 py-1.5 text-[10.5px] transition ${
                            podTab === "price"
                              ? "bg-white/15 text-white"
                              : "bg-white/[0.04] text-white/45"
                          }`}
                        >
                          השקעה
                        </button>
                      </div>
                      {podTab === "spec" ? (
                        <p
                          className="mt-4 max-w-2xl text-[12.5px] leading-[1.95] text-white/50"
                          {...editsFor(`services.${i}.description`)}
                        >
                          {service.description}
                        </p>
                      ) : (
                        <div className="mt-4 flex flex-wrap items-baseline gap-3">
                          <span
                            className="text-2xl font-light text-[#f5f5f7]"
                            {...editsFor(`services.${i}.price`)}
                          >
                            {service.price ?? "בהתאמה אישית"}
                          </span>
                          {parsePrice(service.price) && (
                            <span className="text-[10px] text-white/30">
                              לפני התאמות היקף
                            </span>
                          )}
                        </div>
                      )}
                      <a
                        href={waLink(
                          b.whatsapp,
                          `שלום ${b.name}, אשמח לפרטים על ${service.title}.`,
                        )}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={(event) => event.stopPropagation()}
                        className="mt-5 inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-[11.5px] font-bold text-[#07080C]"
                        style={{ background: accent }}
                      >
                        פתיחת שיחה מרחבית
                        <span aria-hidden="true">←</span>
                      </a>
                    </motion.div>
                  ) : (
                    <motion.p
                      key="closed"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="mt-4 line-clamp-2 max-w-lg text-[11.5px] leading-[1.85] text-white/38"
                    >
                      {service.description}
                    </motion.p>
                  )}
                </AnimatePresence>

                {!isOpen && (
                  <div className="mt-5 flex items-center justify-between border-t border-white/[0.07] pt-4">
                    <span className="text-[10.5px] text-white/40">{service.price}</span>
                    <span className="text-[8.5px] tracking-[0.24em] text-white/22" dir="ltr">
                      TAP TO FOCUS
                    </span>
                  </div>
                )}
              </motion.article>
            );
          })}
        </div>
      </section>

      {/* ---------------- pinned split hardware showcase ---------------- */}
      <section id="showcase" className="relative z-10 mx-auto max-w-7xl px-4 py-20">
        <div className="mb-8 flex items-end justify-between gap-4 px-1">
          <div>
            <p className="text-[9px] tracking-[0.38em] text-white/30" dir="ltr">
              PINNED SHOWCASE / 03
            </p>
            <h2 className="mt-3 text-3xl font-light tracking-tight text-[#f5f5f7] md:text-4xl">
              המוצר נשאר. המפרט נע.
            </h2>
          </div>
          <span className="hidden text-[10px] tracking-[0.2em] text-white/25 sm:block" dir="ltr">
            SCROLL TO SPEC
          </span>
        </div>

        <div className="grid gap-5 lg:grid-cols-2">
          <div className="lg:sticky lg:top-28 lg:self-start">
            <div className={`${GLASS} overflow-hidden p-2.5`}>
              <div className="relative h-[52vh] overflow-hidden rounded-[26px] md:h-[66vh]">
                {spotlight?.afterImage || hero.backgroundImage ? (
                  <>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={spotlight?.afterImage || hero.backgroundImage}
                      alt={spotlight?.title ?? ""}
                      className="h-full w-full object-cover"
                      style={{ filter: "saturate(0.76) contrast(1.05)" }}
                    />
                    <div
                      aria-hidden="true"
                      className="absolute inset-0"
                      style={{
                        background:
                          "linear-gradient(180deg, rgba(7,8,12,0.08), rgba(7,8,12,0.75))",
                      }}
                    />
                  </>
                ) : (
                  <div className="flex h-full items-center justify-center bg-white/[0.03]">
                    <span className="text-[10px] tracking-[0.4em] text-white/25" dir="ltr">
                      DEVICE VIEW
                    </span>
                  </div>
                )}

                <div className="absolute inset-x-4 top-4 flex items-center justify-between">
                  <span className="rounded-full border border-white/15 bg-black/25 px-3 py-1 text-[8.5px] tracking-[0.24em] text-white/60 backdrop-blur">
                    SPATIAL VIEW
                  </span>
                  <span className="rounded-full border border-white/15 bg-black/25 px-3 py-1 text-[8.5px] tracking-[0.24em] text-white/60 backdrop-blur" dir="ltr">
                    {String(activeShot + 1).padStart(2, "0")} / {String(Math.max(projects.length, 1)).padStart(2, "0")}
                  </span>
                </div>

                <div className="absolute inset-x-4 bottom-4">
                  <p className="text-[9px] tracking-[0.3em] text-white/40" dir="ltr">
                    LIVE PREVIEW
                  </p>
                  <p className="mt-1 text-xl font-light text-white/90">
                    {spotlight?.title ?? b.name}
                  </p>
                  <div className="mt-3 flex gap-1.5">
                    {Array.from({ length: Math.max(projects.length, 1) }).map((_, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setActiveShot(i)}
                        aria-label={`תצוגה ${i + 1}`}
                        className="h-1 flex-1 transition-colors"
                        style={{
                          background:
                            i === activeShot
                              ? accent
                              : "rgba(255,255,255,0.16)",
                        }}
                      />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            {[
              {
                kicker: "MATERIAL",
                title: services[0]?.title ?? "חומרים",
                body: services[0]?.description ?? "חומרים נבחרים, בגימור מדויק.",
                metric: "01",
              },
              {
                kicker: "PRECISION",
                title: services[1]?.title ?? "ביצוע",
                body: services[1]?.description ?? "ביצוע מדויק עד הפרט האחרון.",
                metric: "02",
              },
              {
                kicker: "DELIVERY",
                title: services[2]?.title ?? "מסירה",
                body: services[2]?.description ?? "מסירה מסודרת, בזמן, עם אחריות.",
                metric: "03",
              },
            ].map((spec, i) => (
              <motion.div
                key={spec.metric}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.6, delay: i * 0.06 }}
                className={`${GLASS} p-6 md:p-7`}
              >
                <div className="flex items-start justify-between gap-4">
                  <span className="text-[8.5px] tracking-[0.34em]" style={{ color: accent }} dir="ltr">
                    {spec.kicker}
                  </span>
                  <span className="text-3xl font-light leading-none text-white/12" dir="ltr">
                    {spec.metric}
                  </span>
                </div>
                <h3 className="mt-4 text-xl font-light text-[#f5f5f7]">{spec.title}</h3>
                <p className="mt-2.5 text-[12px] leading-[1.95] text-white/42">{spec.body}</p>
              </motion.div>
            ))}

            {benefits.slice(0, 2).map((benefit, i) => (
              <div
                key={i}
                className={`${GLASS} flex items-start gap-4 p-6 md:p-7`}
              >
                <span
                  className="mt-1 h-2 w-2 shrink-0 rounded-full"
                  style={{ background: accent }}
                  aria-hidden="true"
                />
                <div>
                  <h3 className="text-[15px] font-medium text-white/80">{benefit.title}</h3>
                  <p className="mt-1.5 text-[11.5px] leading-[1.9] text-white/38">
                    {benefit.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------- work islands ---------------- */}
      {projects.length > 0 && (
        <section id="work" className="relative z-10 mx-auto max-w-7xl px-4 py-20">
          <div className="mb-8 flex items-end justify-between gap-4 px-1">
            <div>
              <p className="text-[9px] tracking-[0.38em] text-white/30" dir="ltr">
                FIELD WORK / 04
              </p>
              <h2 className="mt-3 text-3xl font-light tracking-tight text-[#f5f5f7] md:text-4xl">
                מרחבים שנבנו.
              </h2>
            </div>
            <span className="text-[10px] tracking-[0.2em] text-white/25" dir="ltr">
              SELECTED / {String(projects.length).padStart(2, "0")}
            </span>
          </div>
          <div className="grid gap-4 md:grid-cols-12">
            {projects.slice(0, 3).map((project, i) => (
              <article
                key={i}
                className={`${GLASS} overflow-hidden p-2 ${
                  i === 0 ? "md:col-span-7" : "md:col-span-5"
                }`}
              >
                <div className="relative h-[32vh] overflow-hidden rounded-[24px] md:h-[42vh]">
                  {project.afterImage && (
                    <>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={project.afterImage}
                        alt={project.title}
                        loading="lazy"
                        className="h-full w-full object-cover"
                        style={{ filter: "saturate(0.78)" }}
                      />
                      <div
                        aria-hidden="true"
                        className="absolute inset-0"
                        style={{
                          background:
                            "linear-gradient(180deg, transparent 45%, rgba(7,8,12,0.82))",
                        }}
                      />
                    </>
                  )}
                  <div className="absolute inset-x-4 bottom-4">
                    <p className="text-[8.5px] tracking-[0.3em] text-white/40" dir="ltr">
                      CASE {String(i + 1).padStart(2, "0")}
                    </p>
                    <h3 className="mt-1 text-lg font-light text-white/90">{project.title}</h3>
                  </div>
                </div>
                {project.description && (
                  <p className="px-4 py-4 text-[11.5px] leading-[1.85] text-white/38">
                    {project.description}
                  </p>
                )}
              </article>
            ))}
          </div>
        </section>
      )}

      {/* ---------------- reviews as floating voices ---------------- */}
      <section id="voices" className="relative z-10 mx-auto max-w-7xl px-4 py-20">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-4 px-1">
          <div>
            <p className="text-[9px] tracking-[0.38em] text-white/30" dir="ltr">
              CLIENT VOICES / 05
            </p>
            <h2 className="mt-3 text-3xl font-light tracking-tight text-[#f5f5f7] md:text-4xl">
              מה שנשאר אחרי.
            </h2>
          </div>
          <span className="flex items-center gap-3 text-[11px] text-white/45">
            {b.googleRating.toFixed(1)} / 5
            <RatingBars rating={b.googleRating} color={accent} />
          </span>
        </div>

        <div className="grid gap-4 md:grid-cols-12">
          {reviews.slice(0, 3).map((review, i) => (
            <figure
              key={i}
              className={`${GLASS} flex flex-col justify-between p-7 ${
                i === 0 ? "md:col-span-5 md:row-span-2" : "md:col-span-7"
              }`}
            >
              <div>
                <span className="text-[8.5px] tracking-[0.3em] text-white/25" dir="ltr">
                  VERIFIED {String(i + 1).padStart(2, "0")}
                </span>
                <blockquote
                  className={`mt-4 font-light leading-[1.85] text-white/70 ${
                    i === 0 ? "text-[17px] md:text-[19px]" : "text-[13.5px]"
                  }`}
                  {...editsFor(`reviews.${i}.text`)}
                >
                  “{review.text}”
                </blockquote>
              </div>
              <figcaption className="mt-6 flex items-center justify-between border-t border-white/[0.08] pt-4 text-[10px] tracking-[0.18em] text-white/35">
                <span {...editsFor(`reviews.${i}.author`)}>{review.author}</span>
                <span dir="ltr">{review.rating}.0 / 5</span>
              </figcaption>
            </figure>
          ))}
        </div>
      </section>

      {/* ---------------- FAQ + contact islands ---------------- */}
      <section className="relative z-10 mx-auto max-w-7xl px-4 pb-20 pt-10">
        <div className="grid gap-4 lg:grid-cols-[1.2fr_1fr]">
          <div className={`${GLASS} p-7 md:p-9`}>
            <p className="text-[9px] tracking-[0.38em] text-white/30" dir="ltr">
              FAQ / 06
            </p>
            <h2 className="mt-3 text-2xl font-light text-[#f5f5f7] md:text-3xl">
              שאלות מרחביות
            </h2>
            <div className="mt-6">
              <FaqAccordion
                items={faq}
                classes={{
                  card: "border-b border-white/[0.08]",
                  button:
                    "flex w-full items-center justify-between gap-4 py-4 text-right text-[12.5px] text-white/78",
                  icon: "h-4 w-4 text-white/30",
                  answer: "pb-4 text-[11.5px] leading-[1.9] text-white/38",
                }}
              />
            </div>
          </div>

          <div id="contact" className={`${GLASS} relative overflow-hidden p-7 md:p-9`}>
            <div
              aria-hidden="true"
              className="pointer-events-none absolute -left-16 -top-20 h-52 w-52 rounded-full"
              style={{ background: `radial-gradient(circle, color-mix(in srgb, ${accent} 22%, transparent), transparent 70%)` }}
            />
            <p className="text-[9px] tracking-[0.38em] text-white/30" dir="ltr">
              CONTACT / 07
            </p>
            <h2 className="mt-3 text-2xl font-light leading-[1.25] text-[#f5f5f7] md:text-3xl">
              פותחים חלון
              <br />
              שיחה חדש.
            </h2>
            <p className="mt-4 text-[12px] leading-[1.9] text-white/42">
              {b.openingHours} · {b.address}
            </p>
            <div className="mt-7 flex flex-col gap-2.5">
              <a
                href={heroHref}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-center gap-2 rounded-full py-3.5 text-[13px] font-bold text-[#07080C]"
                style={{ background: accent }}
              >
                <MessageCircle className="h-4 w-4" aria-hidden="true" />
                וואטסאפ ישיר
              </a>
              <a
                href={`tel:${b.phone}`}
                className="flex items-center justify-center gap-2 rounded-full border border-white/[0.14] bg-white/[0.04] py-3.5 text-[13px] font-medium text-white/75"
                dir="ltr"
              >
                <Phone className="h-4 w-4" aria-hidden="true" />
                {b.phone}
              </a>
            </div>
            <div className="mt-6 flex items-center justify-between border-t border-white/[0.08] pt-4 text-[9px] tracking-[0.2em] text-white/25">
              <span>{b.name}</span>
              <span dir="ltr">PRIMARY COLOR {primary.toUpperCase()}</span>
            </div>
          </div>
        </div>
      </section>

      <footer className="relative z-10 px-6 pb-10 text-center">
        <p className="text-[8px] tracking-[0.4em] text-white/18" dir="ltr">
          SPATIAL COMPUTING EXPERIENCE — {b.name.toUpperCase()}
        </p>
      </footer>

      {/* dismiss helper for screen readers / touch users */}
      {openPod !== null && (
        <button
          type="button"
          onClick={() => setOpenPod(null)}
          className="fixed bottom-24 left-4 z-[9600] flex h-9 items-center gap-2 rounded-full border border-white/15 bg-[#0b0d12]/90 px-4 text-[10px] text-white/60 backdrop-blur"
        >
          <X className="h-3 w-3" aria-hidden="true" />
          סגירת מיקוד
        </button>
      )}
      {openPod !== null && openPodPrice !== null && (
        <span className="sr-only">{formatNis(openPodPrice)}</span>
      )}
    </div>
  );
}
