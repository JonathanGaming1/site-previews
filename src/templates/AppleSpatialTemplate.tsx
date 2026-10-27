"use client";

/**
 * 02 — APPLE SPATIAL / NVIDIA OMNIVERSE
 * =====================================
 * Same locked-viewport virtual wheel as Forge, a completely different world:
 * a dark VisionOS + Omniverse void where the wheel flies the camera through
 * orbiting frosted-glass islands floating at independent Z depths above an
 * animated holographic mesh floor. Chapter 02 orbits the whole ring in Z-space;
 * chapter 03 is an immersive estimate console; chapter 04 a light-beam
 * comparator; chapter 05 the connection chamber.
 */

import React, { useState } from "react";
import { motion, useTransform } from "framer-motion";
import { useSite } from "@/components/SiteProvider";
import { Magnetic } from "@/templates/motion";
import { formatNis, parsePrice, waLink } from "@/templates/shared";
import {
  CameraStage,
  ChapterBar,
  FaqLedger,
  HudScrubber,
  LockedViewport,
  MagneticCursor,
  SceneMenu,
  StageLight,
  StageSplit,
  livePointer,
  useCameraEngine,
  useCameraRig,
  useSceneTrack,
  type CameraScene,
} from "@/templates/wheel";

const SCENES: CameraScene[] = [
  { code: "01", label: "מרחב" },
  { code: "02", label: "ארכיטקטורה" },
  { code: "03", label: "סביבה" },
  { code: "04", label: "טבילה" },
  { code: "05", label: "חיבור" },
];

const ACCENT = "#8FC7FF";
const ACCENT_2 = "#6FE3FF";
const GLASS =
  "border border-white/12 bg-white/[0.055] backdrop-blur-2xl shadow-[inset_0_1px_0_0_rgba(255,255,255,0.14)]";

const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1600&q=85";

export function AppleSpatialTemplate() {
  const { data, editsFor } = useSite();
  const info = data.businessInfo;
  const hero = data.hero;
  const services = data.services?.length ? data.services : [];
  const benefits = data.benefits ?? [];
  const reviews = data.reviews ?? [];
  const faq = data.faq ?? [];
  const timeline = data.processTimeline ?? [];
  const project = data.projects?.[0];

  const [scopeIdx, setScopeIdx] = useState(0);
  const [area, setArea] = useState(40);
  const [quality, setQuality] = useState<"ESSENTIAL" | "STUDIO" | "OMNIVERSE">(
    "STUDIO",
  );
  const [menu, setMenu] = useState(false);

  const engine = useCameraEngine(SCENES.length, {
    sensitivity: 0.00018,
    depthMm: 6200,
  });
  const rig = useCameraRig({ tiltX: 6, tiltY: 9, lightMin: 12, lightMax: 88 });
  const { progress, active, jump } = engine;

  /* One dolly track per chapter — the camera flies through each in turn. */
  const s1 = useSceneTrack(progress, {
    enter: -0.06,
    peak: 0,
    exit: 0.3,
    fromScale: 0.72,
    zoom: 1.9,
    depth: 520,
    tiltX: 6,
    blur: 0,
  });
  const s2 = useSceneTrack(progress, {
    enter: 0.16,
    peak: 0.28,
    exit: 0.5,
    fromScale: 0.5,
    zoom: 2,
    depth: 700,
    tiltX: 8,
    blur: 0,
  });
  const s3 = useSceneTrack(progress, {
    enter: 0.44,
    peak: 0.56,
    exit: 0.74,
    fromScale: 0.55,
    zoom: 1.9,
    depth: 620,
    tiltX: 7,
    blur: 24,
  });
  const s4 = useSceneTrack(progress, {
    enter: 0.66,
    peak: 0.78,
    exit: 0.92,
    fromScale: 0.6,
    zoom: 1.8,
    depth: 560,
    tiltX: 5,
    blur: 20,
  });
  const s5 = useSceneTrack(progress, {
    enter: 0.84,
    peak: 0.95,
    exit: 1.12,
    fromScale: 0.62,
    zoom: 1.6,
    depth: 520,
    tiltX: 4,
    blur: 18,
    opacityRange: [0.84, 0.95, 1.12],
    opacityValues: [0, 1, 1],
  });

  /* Orbiting island ring — the ring turns in Z-space as the camera advances. */
  const ringY = useTransform(progress, [0.14, 0.56], [0, 56]);
  const counterY = useTransform(ringY, (value) => -value);
  const floorDrift = useTransform(progress, [0, 1], [0, -180]);
  const glareSweep = useTransform(progress, [0, 1], ["18%", "82%"]);

  const scopedService = services[scopeIdx];
  const basePrice = parsePrice(scopedService?.price) ?? 4900;
  const qualityFactor =
    quality === "ESSENTIAL" ? 0.85 : quality === "STUDIO" ? 1 : 1.28;
  const estimate = Math.round(
    (basePrice * (0.7 + area / 60) * qualityFactor) / 100,
  ) * 100;

  const heroImage = hero.backgroundImage || FALLBACK_IMAGE;
  const waNumber = String(info.whatsapp || "").replace(/\D/g, "");
  const estimateMessage =
    `היי ${info.name}, בניתי הערכה במרחב התלת-ממדי:\n` +
    `• תחום: ${scopedService?.title ?? "—"}\n` +
    `• היקף: ${area} יח'\n` +
    `• חבילה: ${quality}\n` +
    `• הערכה: ${formatNis(estimate)}`;

  const signalBars = Array.from({ length: 26 }, (_, index) => {
    const wave = Math.sin(index * 0.62) * 0.5 + 0.5;
    const scaled = 12 + wave * (18 + (area / 60) * 62) * qualityFactor;
    return Math.max(8, Math.min(100, Math.round(scaled)));
  });

  return (
    <LockedViewport background="#05060A" text="#EDF2FA">
      <StageLight
        rig={rig}
        tint="rgba(143,199,255,0.10)"
        accent="rgba(111,227,255,0.05)"
        size={880}
      />
      <MagneticCursor rig={rig} accent={ACCENT} label="SPATIAL" />

      {/* Holographic mesh floor — recedes with the camera */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-[-40%] bottom-[-18%] h-[62vh]"
        style={{ perspective: 900, transformStyle: "preserve-3d" }}
      >
        <motion.div
          style={{ rotateX: 74, y: floorDrift }}
          className="h-full w-full opacity-[0.5]"
        >
          <div
            className="h-full w-full"
            style={{
              backgroundImage:
                "linear-gradient(rgba(143,199,255,0.18) 1px, transparent 1px), linear-gradient(90deg, rgba(143,199,255,0.14) 1px, transparent 1px)",
              backgroundSize: "72px 72px",
              maskImage:
                "radial-gradient(ellipse 60% 70% at 50% 0%, #000 10%, transparent 78%)",
              WebkitMaskImage:
                "radial-gradient(ellipse 60% 70% at 50% 0%, #000 22%, transparent 78%)",
            }}
          />
        </motion.div>
      </div>

      {/* Glass command header */}
      <header className="fixed inset-x-0 top-0 z-40 flex items-center justify-between px-5 py-5 md:px-12">
        <div className="flex items-center gap-3">
          <span
            className="h-2.5 w-2.5 rounded-full"
            style={{
              background: `linear-gradient(140deg, ${ACCENT_2}, ${ACCENT})`,
              boxShadow: `0 0 20px ${ACCENT}`,
            }}
          />
          <span className="font-grotesk text-[11px] uppercase tracking-[0.34em] text-white/70">
            {info.name || "SPATIAL"}
          </span>
        </div>

        <div className="hidden items-center gap-5 md:flex">
          <span className="font-grotesk text-[10px] uppercase tracking-[0.3em] text-white/35">
            {info.phone}
          </span>
          <span className="font-grotesk text-[10px] uppercase tracking-[0.3em] text-white/35">
            {info.address}
          </span>
        </div>

        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setMenu(true)}
            className="font-grotesk text-[10px] uppercase tracking-[0.3em] text-white/60 hover:text-white"
          >
            SPATIAL MAP
          </button>
          <button
            type="button"
            onClick={() => jump(SCENES.length - 1)}
            className={`rounded-full px-5 py-2.5 font-grotesk text-[10px] uppercase tracking-[0.28em] text-white transition-colors ${GLASS}`}
          >
            תיאום מרחב
          </button>
        </div>
      </header>

      <HudScrubber engine={engine} scenes={SCENES} accent={ACCENT} />
      <ChapterBar
        engine={engine}
        scenes={SCENES}
        accent={ACCENT}
        hint="סובב גלגלת — המצלמה טסה בין האיים [OMNIVERSE]"
      />

      <CameraStage rig={rig} perspective={1500} className="relative h-full w-full">
        {/* ---------------- 01 · SPATIAL ---------------- */}
        <motion.section
          style={{ ...s1, ...livePointer(active === 0) }}
          className="absolute inset-0 flex flex-col items-center justify-center px-6 pb-24 pt-20"
        >
          <span className="font-grotesk text-[10px] uppercase tracking-[0.5em] text-white/40">
            CHAPTER 01 — SPATIAL FIELD
          </span>
          <h1
            className="mt-5 max-w-4xl text-center font-frank text-4xl font-light leading-[1.08] tracking-tight text-white sm:text-6xl md:text-[4.6rem]"
            {...editsFor("hero.headline")}
          >
            {hero.headline || info.tagline || "המרחב שמתאים את עצמו אליכם"}
          </h1>

          <div
            className="relative mt-8 h-[30vh] w-full max-w-4xl"
            style={{ perspective: 1500, transformStyle: "preserve-3d" }}
          >
            <div
              className={`relative h-full w-full overflow-hidden rounded-[26px] ${GLASS}`}
              style={{ transform: "translateZ(70px)" }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={heroImage}
                alt={info.name}
                className="h-full w-full object-cover opacity-85"
              />
              <motion.span
                aria-hidden="true"
                className="pointer-events-none absolute inset-0"
                style={{
                  background: useTransform(
                    glareSweep,
                    (value) =>
                      `linear-gradient(100deg, transparent ${Number(value) - 18}%, rgba(255,255,255,0.22) ${value}%, transparent ${Number(value) + 18}%)`,
                  ),
                }}
              />
              <span className="absolute bottom-4 right-5 font-grotesk text-[10px] uppercase tracking-[0.3em] text-white/70">
                {info.category}
              </span>
            </div>

            {/* Levitating satellites at independent depths */}
            <div
              className={`absolute -right-4 top-6 hidden rounded-2xl px-4 py-3 md:block ${GLASS}`}
              style={{ transform: "translateZ(210px)" }}
            >
              <span className="block font-grotesk text-[9px] uppercase tracking-[0.28em] text-white/45">
                RATING
              </span>
              <span className="font-frank text-2xl font-light text-white">
                {info.googleRating || "4.9"}★
              </span>
            </div>
            <div
              className={`absolute -left-6 bottom-10 hidden rounded-2xl px-4 py-3 md:block ${GLASS}`}
              style={{ transform: "translateZ(150px)" }}
            >
              <span className="block font-grotesk text-[9px] uppercase tracking-[0.28em] text-white/45">
                REVIEWS
              </span>
              <span className="font-frank text-2xl font-light text-white">
                {info.reviewsCount || reviews.length || 120}+
              </span>
            </div>
          </div>

          <p
            className="mt-8 max-w-xl text-center text-sm font-light leading-relaxed text-white/55"
            {...editsFor("hero.subheadline")}
          >
            {hero.subheadline || info.description}
          </p>

          <Magnetic className="mt-7" strength={0.4}>
            <button
              type="button"
              onClick={() => jump(1)}
              className="rounded-full px-9 py-4 font-grotesk text-[11px] uppercase tracking-[0.3em] text-black"
              style={{ background: ACCENT, boxShadow: `0 24px 70px -24px ${ACCENT}` }}
            >
              {hero.ctaText || "כניסה לשכבת הארכיטקטורה"}
            </button>
          </Magnetic>
        </motion.section>

        {/* ---------------- 02 · ARCHITECTURE ---------------- */}
        <motion.section
          style={{ ...s2, ...livePointer(active === 1) }}
          className="absolute inset-0 flex flex-col justify-center px-6 pb-24 pt-20 md:px-16"
        >
          <div className="mx-auto w-full max-w-6xl">
            <div className="flex items-end justify-between border-b border-white/10 pb-5">
              <div>
                <span className="font-grotesk text-[10px] uppercase tracking-[0.42em] text-white/40">
                  CHAPTER 02 — ORBITING ARCHITECTURE
                </span>
                <h2 className="mt-3 font-frank text-3xl font-light md:text-5xl">
                  יכולות שמרחפות סביבכם
                </h2>
              </div>
              <span className="hidden font-grotesk text-[10px] uppercase tracking-[0.28em] text-white/35 md:block">
                {services.length || 5} ISLANDS · Z-DEPTH LIVE
              </span>
            </div>

            <div
              className="relative mt-6 h-[44vh] w-full"
              style={{ perspective: 1700, transformStyle: "preserve-3d" }}
            >
              <motion.div
                style={{ rotateY: ringY, transformStyle: "preserve-3d" }}
                className="absolute inset-0"
              >
                {(services.length ? services : Array.from({ length: 4 })).map(
                  (service, index) => {
                    const total = services.length || 4;
                    const angle = (index / total) * Math.PI * 2;
                    const left = 50 + Math.sin(angle) * 30;
                    const top = 50 + Math.cos(angle) * 24;
                    const depth = index % 2 === 0 ? 220 : -140;
                    const item = service as {
                      title?: string;
                      description?: string;
                      price?: string;
                    };
                    return (
                      <div
                        key={index}
                        className="absolute -translate-x-1/2 -translate-y-1/2"
                        style={{ left: `${left}%`, top: `${top}%` }}
                      >
                        <motion.div
                          style={{ z: depth, rotateY: counterY }}
                          className={`w-[210px] rounded-3xl p-5 md:w-[252px] ${GLASS}`}
                        >
                          <span className="font-grotesk text-[9px] uppercase tracking-[0.3em] text-white/40">
                            ISLAND {String(index + 1).padStart(2, "0")}
                          </span>
                          <h3
                            className="mt-3 font-frank text-xl font-light text-white md:text-2xl"
                            {...editsFor(`services.${index}.title`)}
                          >
                            {item.title}
                          </h3>
                          <p
                            className="mt-2 text-[11px] font-light leading-relaxed text-white/50"
                            {...editsFor(`services.${index}.description`)}
                          >
                            {item.description}
                          </p>
                          <span
                            className="mt-4 block font-grotesk text-[10px] uppercase tracking-[0.24em]"
                            style={{ color: ACCENT }}
                          >
                            {item.price || "בהתאמה"}
                          </span>
                        </motion.div>
                      </div>
                    );
                  },
                )}
              </motion.div>
            </div>
          </div>
        </motion.section>

        {/* ---------------- 03 · ENVIRONMENT ---------------- */}
        <motion.section
          style={{ ...s3, ...livePointer(active === 2) }}
          data-camera-ui="true"
          className="absolute inset-0 flex flex-col justify-center overflow-y-auto px-6 py-24 md:px-16"
        >
          <div className="mx-auto grid w-full max-w-6xl gap-6 lg:grid-cols-[1.35fr_1fr]">
            <div className={`rounded-[28px] p-7 md:p-9 ${GLASS}`}>
              <span className="font-grotesk text-[10px] uppercase tracking-[0.42em] text-white/40">
                CHAPTER 03 — IMMERSIVE CONSOLE
              </span>
              <h2 className="mt-3 font-frank text-3xl font-light md:text-4xl">
                כווננו את המרחב שלכם
              </h2>

              <div className="mt-7 space-y-5">
                <div>
                  <span className="font-grotesk text-[10px] uppercase tracking-[0.3em] text-white/45">
                    תחום התמחות
                  </span>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {(services.length ? services : []).slice(0, 5).map((service, index) => {
                      const on = scopeIdx === index;
                      return (
                        <button
                          key={index}
                          type="button"
                          onClick={() => setScopeIdx(index)}
                          className={`rounded-full border px-4 py-2 text-xs transition-all ${
                            on
                              ? "text-black"
                              : "border-white/12 text-white/55 hover:border-white/35"
                          }`}
                          style={on ? { background: ACCENT, borderColor: ACCENT } : undefined}
                        >
                          {service.title}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-grotesk text-[10px] uppercase tracking-[0.3em] text-white/45">
                      היקף / יחידות
                    </span>
                    <span className="font-grotesk text-sm" style={{ color: ACCENT }}>
                      {area}
                    </span>
                  </div>
                  <input
                    type="range"
                    min={5}
                    max={120}
                    value={area}
                    onChange={(event) => setArea(Number(event.target.value))}
                    className="kinetic-range mt-3"
                    style={{ "--range-accent": ACCENT } as React.CSSProperties}
                  />
                </div>

                <div>
                  <span className="font-grotesk text-[10px] uppercase tracking-[0.3em] text-white/45">
                    חבילת מרחב
                  </span>
                  <div className="mt-3 grid grid-cols-3 gap-2">
                    {(["ESSENTIAL", "STUDIO", "OMNIVERSE"] as const).map((tier) => {
                      const on = quality === tier;
                      return (
                        <button
                          key={tier}
                          type="button"
                          onClick={() => setQuality(tier)}
                          className={`rounded-2xl border px-3 py-3 font-grotesk text-[10px] uppercase tracking-[0.18em] transition-all ${
                            on ? "text-white" : "border-white/12 text-white/45"
                          }`}
                          style={on ? { borderColor: ACCENT, background: "rgba(143,199,255,0.12)" } : undefined}
                        >
                          {tier}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="flex h-24 items-end gap-1.5">
                  {signalBars.map((height, index) => (
                    <motion.span
                      key={index}
                      initial={{ scaleY: 0.3 }}
                      animate={{ scaleY: [0.35, 1, 0.55] }}
                      transition={{
                        duration: 3.4,
                        repeat: Infinity,
                        delay: index * 0.045,
                        ease: "easeInOut",
                      }}
                      className="block flex-1 origin-bottom rounded-full"
                      style={{
                        height: `${height}%`,
                        background: `linear-gradient(180deg, ${ACCENT_2}, ${ACCENT}22)`,
                      }}
                    />
                  ))}
                </div>
              </div>
            </div>

            <div className={`flex flex-col justify-between rounded-[28px] p-7 md:p-9 ${GLASS}`}>
              <div>
                <span className="font-grotesk text-[10px] uppercase tracking-[0.34em] text-white/40">
                  SPATIAL ESTIMATE
                </span>
                <p className="mt-5 font-frank text-5xl font-light text-white">
                  {formatNis(estimate)}
                </p>
                <dl className="mt-7 space-y-3 text-sm">
                  <div className="flex items-center justify-between border-b border-white/10 pb-2">
                    <dt className="text-white/45">תחום</dt>
                    <dd className="text-white/85">
                      {scopedService?.title ?? "—"}
                    </dd>
                  </div>
                  <div className="flex items-center justify-between border-b border-white/10 pb-2">
                    <dt className="text-white/45">היקף</dt>
                    <dd className="text-white/85">{area} יח'</dd>
                  </div>
                  <div className="flex items-center justify-between border-b border-white/10 pb-2">
                    <dt className="text-white/45">חבילה</dt>
                    <dd style={{ color: ACCENT }}>{quality}</dd>
                  </div>
                </dl>

                <ul className="mt-6 space-y-2">
                  {benefits.slice(0, 3).map((benefit, index) => (
                    <li key={index} className="flex items-start gap-3 text-xs text-white/55">
                      <span className="mt-1.5 h-1 w-1 shrink-0 rounded-full" style={{ background: ACCENT }} />
                      <span {...editsFor(`benefits.${index}.title`)}>{benefit.title}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <a
                href={waNumber ? waLink(waNumber, estimateMessage) : undefined}
                target="_blank"
                rel="noreferrer"
                className="mt-8 block rounded-full py-4 text-center font-grotesk text-[11px] uppercase tracking-[0.28em] text-black"
                style={{ background: ACCENT }}
              >
                שליחת הערכה לוואטסאפ
              </a>
            </div>
          </div>
        </motion.section>

        {/* ---------------- 04 · IMMERSION ---------------- */}
        <motion.section
          style={{ ...s4, ...livePointer(active === 3) }}
          className="absolute inset-0 flex flex-col justify-center px-6 pb-24 pt-20 md:px-16"
        >
          <div className="mx-auto w-full max-w-5xl">
            <div className="flex items-end justify-between pb-5">
              <div>
                <span className="font-grotesk text-[10px] uppercase tracking-[0.42em] text-white/40">
                  CHAPTER 04 — IMMERSION
                </span>
                <h2 className="mt-3 font-frank text-3xl font-light md:text-5xl">
                  ההבדל נמדד בעיניים
                </h2>
              </div>
              <span className="hidden font-grotesk text-[10px] uppercase tracking-[0.28em] text-white/35 md:block">
                {project?.title || "ARCHIVE"}
              </span>
            </div>

            <StageSplit
              beforeImage={project?.beforeImage || heroImage}
              afterImage={project?.afterImage || project?.beforeImage || heroImage}
              beforeLabel="סטנדרט שוק"
              afterLabel="סטנדרט מרחבי"
              caption="גררו את אלומת האור כדי לנוע בין שני המצבים"
              accent={ACCENT}
              className="mt-4"
            />

            {timeline.length > 0 && (
              <div className="mt-7 grid gap-3 md:grid-cols-4">
                {timeline.slice(0, 4).map((step, index) => (
                  <div
                    key={index}
                    className={`rounded-2xl px-4 py-3 ${GLASS}`}
                    style={{ transform: `translateZ(${index * 12}px)` }}
                  >
                    <span className="font-grotesk text-[9px] uppercase tracking-[0.3em]" style={{ color: ACCENT }}>
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <p className="mt-2 text-xs text-white/75" {...editsFor(`processTimeline.${index}.title`)}>
                      {step.title}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </motion.section>

        {/* ---------------- 05 · CONNECT ---------------- */}
        <motion.section
          style={{ ...s5, ...livePointer(active === 4) }}
          className="absolute inset-0 flex flex-col justify-center px-6 py-20 pb-24 md:px-16"
        >
          <div className="mx-auto grid w-full max-w-6xl gap-6 lg:grid-cols-[1fr_1.1fr]">
            <div className={`rounded-[28px] p-7 md:p-9 ${GLASS}`}>
              <span className="font-grotesk text-[10px] uppercase tracking-[0.42em] text-white/40">
                CHAPTER 05 — CONNECTION CHAMBER
              </span>
              <h2 className="mt-3 font-frank text-4xl font-light leading-tight md:text-5xl">
                {hero.ctaText || "פותחים מרחב חדש"}
              </h2>

              <div className="mt-7 space-y-3 text-sm text-white/55">
                <p {...editsFor("businessInfo.address")}>{info.address}</p>
                <p {...editsFor("businessInfo.openingHours")}>{info.openingHours}</p>
                <p className="font-grotesk text-xs uppercase tracking-[0.24em]" style={{ color: ACCENT }}>
                  {info.phone} · דירוג {info.googleRating || "4.9"}★
                </p>
              </div>

              <div className="mt-8 flex flex-wrap gap-3">
                <a
                  href={waNumber ? waLink(waNumber, `היי ${info.name}, אשמח לשיחת מרחב.`) : undefined}
                  target="_blank"
                  rel="noreferrer"
                  className="rounded-full px-7 py-3.5 font-grotesk text-[11px] uppercase tracking-[0.26em] text-black"
                  style={{ background: ACCENT }}
                >
                  שיחת מרחב בוואטסאפ
                </a>
                {info.phone ? (
                  <a
                    href={`tel:${info.phone}`}
                    className={`rounded-full px-7 py-3.5 font-grotesk text-[11px] uppercase tracking-[0.26em] text-white ${GLASS}`}
                  >
                    חיוג ישיר
                  </a>
                ) : null}
              </div>

              <div className="mt-8 space-y-4">
                {reviews.slice(0, 2).map((review, index) => (
                  <div key={index} className="border-t border-white/10 pt-4">
                    <p className="font-frank text-lg font-light text-white/85" {...editsFor(`reviews.${index}.text`)}>
                      “{review.text}”
                    </p>
                    <span className="font-grotesk text-[9px] uppercase tracking-[0.28em]" style={{ color: ACCENT }}>
                      — {review.author}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div
              data-camera-ui="true"
              className={`max-h-[64vh] overflow-y-auto rounded-[28px] p-7 md:p-9 ${GLASS}`}
            >
              <span className="font-grotesk text-[10px] uppercase tracking-[0.34em] text-white/40">
                OPEN QUESTIONS
              </span>
              <h3 className="mt-3 font-frank text-2xl font-light md:text-3xl">
                שאלות נפוצות
              </h3>
              <FaqLedger
                items={faq}
                accent={ACCENT}
                className="mt-5"
                questionClassName="font-frank text-base font-light text-white md:text-xl"
                answerClassName="text-xs leading-relaxed text-white/55"
              />
            </div>
          </div>
        </motion.section>
      </CameraStage>

      <SceneMenu
        open={menu}
        onClose={() => setMenu(false)}
        scenes={SCENES}
        engine={engine}
        accent={ACCENT}
        brand={info.name || "SPATIAL"}
        footerLeft={info.phone}
        footerRight={info.address}
      />
    </LockedViewport>
  );
}

export default AppleSpatialTemplate;
