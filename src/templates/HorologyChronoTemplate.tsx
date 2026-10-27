"use client";

/**
 * 03 — SWISS CHRONOGRAPH MECHANICAL VAULT
 * =======================================
 * Locked viewport, virtual wheel, zero scrollbar. This world is a dark obsidian
 * and brushed-gold mechanical vault: chapter 01 frames a giant chronograph dial
 * the camera flies straight through its centre; chapter 02 rotates interlocking
 * gears past the lens; chapter 03 is a live calibre configurator; chapters 04/05
 * close in the heritage hall and the atelier.
 */

import React, { useState } from "react";
import { motion, useTransform, type MotionValue } from "framer-motion";
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
  livePointer,
  useCameraEngine,
  useCameraRig,
  useSceneTrack,
  type CameraScene,
} from "@/templates/wheel";

const SCENES: CameraScene[] = [
  { code: "01", label: "מנגנון" },
  { code: "02", label: "סיבוכים" },
  { code: "03", label: "כיול" },
  { code: "04", label: "מורשת" },
  { code: "05", label: "אטלייה" },
];

const GOLD = "#C9A227";
const CHAMPAGNE = "#E7D7A8";
const PANEL =
  "border border-[#C9A227]/22 bg-[#0b0a09]/80 backdrop-blur-xl shadow-[inset_0_1px_0_0_rgba(231,215,168,0.12)]";

const CASES = [
  {
    id: "OBSIDIAN",
    label: "אובסידיאן שחור",
    swatch: "linear-gradient(150deg,#1c1c20,#08080a)",
  },
  {
    id: "BRUSHED GOLD",
    label: "זהב מוברש",
    swatch: `linear-gradient(150deg,${CHAMPAGNE},#8a6d2c)`,
  },
  {
    id: "DARK TITANIUM",
    label: "טיטניום כהה",
    swatch: "linear-gradient(150deg,#70747d,#2b2e33)",
  },
];

const MOVEMENTS = [
  { id: "MANUAL", label: "מנגנון ידני", reserve: 48, factor: 0.92 },
  { id: "CHRONOGRAPH", label: "כרונוגרף אוטומטי", reserve: 72, factor: 1 },
  { id: "TOURBILLON", label: "טורביון", reserve: 96, factor: 1.34 },
];

const STRAPS = ["עור תנין", "זהב מוברש", "גומי משיי"];

/** A real toothed gear: teeth, rim, hub and a 60-step split-seconds scale. */
function GearDial({
  rot,
  teeth,
  size,
  color,
  opacity = 1,
  ticks = true,
}: {
  rot: MotionValue<number>;
  teeth: number;
  size: number;
  color: string;
  opacity?: number;
  ticks?: boolean;
}) {
  const center = size / 2;
  const toothWidth = size * 0.06;

  return (
    <motion.div
      aria-hidden="true"
      style={{ rotate: rot }}
      className="pointer-events-none"
    >
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {Array.from({ length: teeth }).map((_, index) => (
          <rect
            key={index}
            x={center - toothWidth / 2}
            y={size * 0.02}
            width={toothWidth}
            height={size * 0.1}
            fill={color}
            opacity={opacity * 0.85}
            transform={`rotate(${(index * 360) / teeth} ${center} ${center})`}
          />
        ))}
        <circle
          cx={center}
          cy={center}
          r={size * 0.42}
          fill="none"
          stroke={color}
          strokeOpacity={opacity * 0.55}
          strokeWidth="1.4"
        />
        <circle
          cx={center}
          cy={center}
          r={size * 0.34}
          fill="none"
          stroke={color}
          strokeOpacity={opacity * 0.2}
        />
        <circle
          cx={center}
          cy={center}
          r={size * 0.1}
          fill="none"
          stroke={color}
          strokeOpacity={opacity * 0.6}
          strokeWidth="1.4"
        />
        {ticks
          ? Array.from({ length: 60 }).map((_, index) =>
              index % 5 === 0 ? (
                <line
                  key={index}
                  x1={center}
                  y1={size * 0.08}
                  x2={center}
                  y2={size * 0.15}
                  stroke={color}
                  strokeOpacity={opacity * 0.4}
                  transform={`rotate(${index * 6} ${center} ${center})`}
                />
              ) : null,
            )
          : null}
      </svg>
    </motion.div>
  );
}

export function HorologyChronoTemplate() {
  const { data, editsFor } = useSite();
  const info = data.businessInfo;
  const hero = data.hero;
  const services = data.services?.length ? data.services : [];
  const reviews = data.reviews ?? [];
  const faq = data.faq ?? [];
  const timeline = data.processTimeline ?? [];
  const benefits = data.benefits ?? [];

  const [caseIdx, setCaseIdx] = useState(1);
  const [movementIdx, setMovementIdx] = useState(1);
  const [strapIdx, setStrapIdx] = useState(0);
  const [serviceIdx, setServiceIdx] = useState(0);
  const [menu, setMenu] = useState(false);

  const engine = useCameraEngine(SCENES.length, {
    sensitivity: 0.00044,
    depthMm: 7200,
  });
  const rig = useCameraRig({ tiltX: 8, tiltY: 11, lightMin: 14, lightMax: 86 });
  const { progress, active, jump } = engine;

  const s1 = useSceneTrack(progress, {
    enter: -0.06,
    peak: 0,
    exit: 0.32,
    fromScale: 0.78,
    zoom: 2.6,
    depth: 600,
    tiltX: 7,
    blur: 0,
  });
  const s2 = useSceneTrack(progress, {
    enter: 0.17,
    peak: 0.3,
    exit: 0.52,
    fromScale: 0.52,
    zoom: 2.1,
    depth: 720,
    tiltX: 9,
    blur: 0,
  });
  const s3 = useSceneTrack(progress, {
    enter: 0.45,
    peak: 0.57,
    exit: 0.75,
    fromScale: 0.56,
    zoom: 1.95,
    depth: 640,
    tiltX: 7,
    blur: 26,
  });
  const s4 = useSceneTrack(progress, {
    enter: 0.67,
    peak: 0.79,
    exit: 0.93,
    fromScale: 0.6,
    zoom: 1.85,
    depth: 580,
    tiltX: 5,
    blur: 22,
  });
  const s5 = useSceneTrack(progress, {
    enter: 0.85,
    peak: 0.96,
    exit: 1.12,
    fromScale: 0.64,
    zoom: 1.6,
    depth: 540,
    tiltX: 4,
    blur: 18,
    opacityRange: [0.85, 0.96, 1.12],
    opacityValues: [0, 1, 1],
  });

  /* The movement: rotation is driven by camera depth, so gears advance
     while the camera flies forward instead of looping on a timer. */
  const dialRot = useTransform(progress, [0, 1], [0, 300]);
  const gearARot = useTransform(progress, [0, 1], [0, 260]);
  const gearBRot = useTransform(progress, [0, 1], [0, -196]);
  const gearCRot = useTransform(progress, [0, 1], [0, 148]);
  const ringY = useTransform(progress, [0.15, 0.56], [0, 42]);
  const counterY = useTransform(ringY, (value) => -value);
  const slideX = useTransform(progress, [0.62, 1], ["9%", "-9%"]);

  const chosenCase = CASES[caseIdx];
  const chosenMovement = MOVEMENTS[movementIdx];
  const base = parsePrice(services[serviceIdx]?.price) ?? 12800;
  const estimate =
    Math.round((base * chosenMovement.factor * (1 + caseIdx * 0.06)) / 100) * 100;

  const waNumber = String(info.whatsapp || "").replace(/\D/g, "");
  const specMessage =
    `היי ${info.name}, בניתי מפרט כיול:\n` +
    `• שירות: ${services[serviceIdx]?.title ?? "—"}\n` +
    `• מנגנון: ${chosenMovement.label} (${chosenMovement.reserve} שעות)\n` +
    `• מארז: ${chosenCase.label}\n` +
    `• רצועה: ${STRAPS[strapIdx]}\n` +
    `• אומדן: ${formatNis(estimate)}`;

  return (
    <LockedViewport background="#07070A" text="#F3EFE6">
      <StageLight
        rig={rig}
        tint="rgba(201,162,39,0.10)"
        accent="rgba(231,215,168,0.045)"
        size={820}
      />
      <MagneticCursor rig={rig} accent={GOLD} label="ATELIER" />

      <header className="fixed inset-x-0 top-0 z-40 flex items-center justify-between px-5 py-6 md:px-12">
        <div className="flex items-baseline gap-4">
          <span className="font-grotesk text-[11px] uppercase tracking-[0.42em]" style={{ color: CHAMPAGNE }}>
            {info.name || "CHRONO"}
          </span>
          <span className="hidden font-grotesk text-[10px] uppercase tracking-[0.3em] text-white/35 md:block">
            GENÈVE · {info.address}
          </span>
        </div>

        <button
          type="button"
          onClick={() => setMenu(true)}
          className="font-grotesk text-[10px] uppercase tracking-[0.34em] text-white/70 hover:text-white"
        >
          COMPLICATIONS
        </button>
      </header>

      <HudScrubber engine={engine} scenes={SCENES} accent={GOLD} />
      <ChapterBar
        engine={engine}
        scenes={SCENES}
        accent={GOLD}
        hint="סובב גלגלת — המצלמה עוברת דרך לב הלוח [CHRONO]"
      />

      <CameraStage rig={rig} perspective={1500} className="relative h-full w-full">
        {/* ---------------- 01 · MOVEMENT ---------------- */}
        <motion.section
          style={{ ...s1, ...livePointer(active === 0) }}
          className="absolute inset-0 flex items-center justify-center px-6"
        >
          <div className="absolute inset-0 flex items-center justify-center opacity-45">
            <GearDial rot={dialRot} teeth={120} size={820} color={GOLD} opacity={0.5} />
          </div>
          <div className="absolute inset-0 flex items-center justify-center opacity-25">
            <GearDial rot={gearBRot} teeth={64} size={430} color={CHAMPAGNE} opacity={0.6} />
          </div>

          <div className="relative z-10 max-w-3xl text-center">
            <span className="font-grotesk text-[10px] uppercase tracking-[0.55em] text-white/40">
              CHAPTER 01 — THE MOVEMENT
            </span>
            <h1
              className="mt-6 font-frank text-4xl font-light leading-[1.06] tracking-tight text-white sm:text-6xl md:text-[5rem]"
              {...editsFor("hero.headline")}
            >
              {hero.headline || info.tagline || "זמן הוא סיבוך מושלם"}
            </h1>
            <p
              className="mx-auto mt-6 max-w-lg text-sm font-light leading-relaxed text-white/55"
              {...editsFor("hero.subheadline")}
            >
              {hero.subheadline || info.description}
            </p>
            <Magnetic className="mt-8 flex justify-center" strength={0.36}>
              <button
                type="button"
                onClick={() => jump(2)}
                className="border px-9 py-4 font-grotesk text-[11px] uppercase tracking-[0.3em] transition-colors"
                style={{ borderColor: GOLD, color: CHAMPAGNE }}
              >
                {hero.ctaText || "פתיחת מפרט כיול"}
              </button>
            </Magnetic>
          </div>
        </motion.section>

        {/* ---------------- 02 · COMPLICATIONS ---------------- */}
        <motion.section
          style={{ ...s2, ...livePointer(active === 1) }}
          className="absolute inset-0 flex flex-col justify-center px-6 md:px-16"
        >
          <div className="mx-auto w-full max-w-6xl">
            <div className="flex items-end justify-between border-b border-white/10 pb-5">
              <div>
                <span className="font-grotesk text-[10px] uppercase tracking-[0.42em] text-white/40">
                  CHAPTER 02 — COMPLICATIONS
                </span>
                <h2 className="mt-3 font-frank text-3xl font-light md:text-5xl">
                  סיבוכים ומלאכות יד
                </h2>
              </div>
              <span className="hidden font-grotesk text-[10px] uppercase tracking-[0.28em] text-white/35 md:block">
                {services.length || 4} COMPLICATIONS
              </span>
            </div>

            <div className="mt-7 grid gap-5 lg:grid-cols-[1fr_1.25fr]">
              <div className="relative flex items-center justify-center" style={{ perspective: 1400, transformStyle: "preserve-3d" }}>
                <GearDial rot={gearARot} teeth={44} size={300} color={CHAMPAGNE} opacity={0.85} />
                <div className="absolute">
                  <GearDial rot={gearCRot} teeth={26} size={150} color={GOLD} opacity={0.9} ticks={false} />
                </div>
              </div>

              <motion.div
                style={{ rotateY: ringY, transformStyle: "preserve-3d" }}
                className="grid gap-3 md:grid-cols-2"
              >
                {(services.length ? services : []).slice(0, 4).map((service, index) => (
                  <motion.div
                    key={index}
                    style={{ rotateY: counterY, z: index % 2 === 0 ? 120 : -60 }}
                    className={`${PANEL} p-5`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-grotesk text-[9px] uppercase tracking-[0.3em] text-white/35">
                        N° {String(index + 1).padStart(2, "0")}
                      </span>
                      <span className="font-grotesk text-[11px]" style={{ color: GOLD }}>
                        {service.price || "בהתאמה"}
                      </span>
                    </div>
                    <h3
                      className="mt-3 font-frank text-xl font-light text-white md:text-2xl"
                      {...editsFor(`services.${index}.title`)}
                    >
                      {service.title}
                    </h3>
                    <p
                      className="mt-2 text-[11px] leading-relaxed text-white/50"
                      {...editsFor(`services.${index}.description`)}
                    >
                      {service.description}
                    </p>
                  </motion.div>
                ))}
              </motion.div>
            </div>
          </div>
        </motion.section>

        {/* ---------------- 03 · CALIBRE CONFIGURATOR ---------------- */}
        <motion.section
          style={{ ...s3, ...livePointer(active === 2) }}
          data-camera-ui="true"
          className="absolute inset-0 flex flex-col justify-center overflow-y-auto px-6 py-24 md:px-16"
        >
          <div className="mx-auto grid w-full max-w-6xl gap-6 lg:grid-cols-[1.3fr_1fr]">
            <div className={`${PANEL} p-7 md:p-9`}>
              <span className="font-grotesk text-[10px] uppercase tracking-[0.42em] text-white/40">
                CHAPTER 03 — CALIBRE CONFIGURATOR
              </span>
              <h2 className="mt-3 font-frank text-3xl font-light md:text-4xl">
                הרכיבו את המנגנון
              </h2>

              <div className="mt-7 space-y-6">
                <div>
                  <span className="font-grotesk text-[10px] uppercase tracking-[0.3em] text-white/45">
                    שירות / סיבוך
                  </span>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {(services.length ? services : []).slice(0, 4).map((service, index) => {
                      const on = serviceIdx === index;
                      return (
                        <button
                          key={index}
                          type="button"
                          onClick={() => setServiceIdx(index)}
                          className={`border px-4 py-2 text-xs transition-all ${
                            on ? "text-white" : "border-white/12 text-white/50 hover:border-white/35"
                          }`}
                          style={on ? { borderColor: GOLD, background: "rgba(201,162,39,0.14)" } : undefined}
                        >
                          {service.title}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <span className="font-grotesk text-[10px] uppercase tracking-[0.3em] text-white/45">
                    מארז
                  </span>
                  <div className="mt-3 flex gap-4">
                    {CASES.map((item, index) => {
                      const on = caseIdx === index;
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => setCaseIdx(index)}
                          className="flex flex-col items-center gap-2"
                        >
                          <span
                            className="block h-12 w-12 rounded-full transition-all"
                            style={{
                              background: item.swatch,
                              boxShadow: on
                                ? `0 0 0 2px ${GOLD}, 0 0 26px -6px ${GOLD}`
                                : "0 0 0 1px rgba(255,255,255,0.14)",
                            }}
                          />
                          <span
                            className={`font-grotesk text-[9px] uppercase tracking-[0.2em] ${
                              on ? "text-white" : "text-white/45"
                            }`}
                          >
                            {item.id}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <span className="font-grotesk text-[10px] uppercase tracking-[0.3em] text-white/45">
                    מנגנון
                  </span>
                  <div className="mt-3 grid gap-2 md:grid-cols-3">
                    {MOVEMENTS.map((item, index) => {
                      const on = movementIdx === index;
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => setMovementIdx(index)}
                          className={`border px-4 py-3 text-right text-xs transition-all ${
                            on ? "text-white" : "border-white/12 text-white/50"
                          }`}
                          style={on ? { borderColor: GOLD, background: "rgba(201,162,39,0.12)" } : undefined}
                        >
                          <span className="block font-grotesk text-[10px] tracking-[0.18em]">
                            {item.label}
                          </span>
                          <span className="mt-1 block text-[10px] text-white/40">
                            {item.reserve} שעות רזרבה
                          </span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div>
                  <span className="font-grotesk text-[10px] uppercase tracking-[0.3em] text-white/45">
                    רצועה
                  </span>
                  <div className="mt-3 flex gap-2">
                    {STRAPS.map((strap, index) => {
                      const on = strapIdx === index;
                      return (
                        <button
                          key={strap}
                          type="button"
                          onClick={() => setStrapIdx(index)}
                          className={`border px-4 py-2 text-xs transition-all ${
                            on ? "text-white" : "border-white/12 text-white/50"
                          }`}
                          style={on ? { borderColor: GOLD, background: "rgba(201,162,39,0.12)" } : undefined}
                        >
                          {strap}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>

            <div className={`${PANEL} flex flex-col justify-between p-7 md:p-9`}>
              <div className="flex items-start justify-between">
                <div>
                  <span className="font-grotesk text-[10px] uppercase tracking-[0.34em] text-white/40">
                    CALIBRE SPEC
                  </span>
                  <p className="mt-4 font-frank text-4xl font-light text-white">
                    {formatNis(estimate)}
                  </p>
                </div>
                <div className="opacity-70">
                  <GearDial rot={dialRot} teeth={36} size={110} color={GOLD} ticks={false} />
                </div>
              </div>

              <dl className="mt-7 space-y-3 text-sm">
                <div className="flex items-center justify-between border-b border-white/10 pb-2">
                  <dt className="text-white/45">מארז</dt>
                  <dd className="text-white/85">{chosenCase.label}</dd>
                </div>
                <div className="flex items-center justify-between border-b border-white/10 pb-2">
                  <dt className="text-white/45">מנגנון</dt>
                  <dd style={{ color: CHAMPAGNE }}>{chosenMovement.label}</dd>
                </div>
                <div className="flex items-center justify-between border-b border-white/10 pb-2">
                  <dt className="text-white/45">רצועה</dt>
                  <dd className="text-white/85">{STRAPS[strapIdx]}</dd>
                </div>
              </dl>

              <a
                href={waNumber ? waLink(waNumber, specMessage) : undefined}
                target="_blank"
                rel="noreferrer"
                className="mt-8 block border py-4 text-center font-grotesk text-[11px] uppercase tracking-[0.3em]"
                style={{ borderColor: GOLD, background: "rgba(201,162,39,0.16)", color: CHAMPAGNE }}
              >
                שליחת מפרט לאטלייה
              </a>
            </div>
          </div>
        </motion.section>

        {/* ---------------- 04 · HERITAGE ---------------- */}
        <motion.section
          style={{ ...s4, ...livePointer(active === 3) }}
          className="absolute inset-0 flex flex-col justify-center px-6 md:px-16"
        >
          <motion.div style={{ x: slideX }} className="mx-auto w-full max-w-6xl">
            <span className="font-grotesk text-[10px] uppercase tracking-[0.42em] text-white/40">
              CHAPTER 04 — HERITAGE
            </span>
            <h2 className="mt-3 font-frank text-3xl font-light md:text-5xl">
              ארבעה עשורים של דיוק
            </h2>

            <div className="mt-8 grid gap-4 md:grid-cols-3">
              {(timeline.length
                ? timeline.slice(0, 3)
                : benefits.slice(0, 3)
              ).map((step, index) => (
                <div key={index} className={`${PANEL} p-6`}>
                  <span className="font-grotesk text-[10px] tracking-[0.3em]" style={{ color: GOLD }}>
                    {String(index + 1).padStart(2, "0")} / 04
                  </span>
                  <h3
                    className="mt-3 font-frank text-xl font-light text-white"
                    {...editsFor(
                      timeline.length
                        ? `processTimeline.${index}.title`
                        : `benefits.${index}.title`,
                    )}
                  >
                    {(step as { title: string }).title}
                  </h3>
                  <p className="mt-2 text-[11px] leading-relaxed text-white/50">
                    {(step as { description?: string }).description}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-9 grid gap-6 md:grid-cols-[1.4fr_1fr]">
              <div className="flex gap-6">
                {reviews.slice(0, 2).map((review, index) => (
                  <div key={index} className="max-w-xs border-t border-[#C9A227]/40 pt-4">
                    <p className="font-frank text-lg font-light text-white/85" {...editsFor(`reviews.${index}.text`)}>
                      “{review.text}”
                    </p>
                    <span className="font-grotesk text-[9px] uppercase tracking-[0.28em]" style={{ color: GOLD }}>
                      — {review.author}
                    </span>
                  </div>
                ))}
              </div>
              <div className="text-left">
                <span className="font-grotesk text-[10px] uppercase tracking-[0.3em] text-white/40">
                  RATING
                </span>
                <p className="font-frank text-5xl font-light text-white">
                  {info.googleRating || "4.9"}
                  <span style={{ color: GOLD }}>★</span>
                </p>
                <span className="font-grotesk text-[10px] uppercase tracking-[0.24em] text-white/40">
                  {info.reviewsCount || reviews.length || 0} ביקורות מאומתות
                </span>
              </div>
            </div>
          </motion.div>
        </motion.section>

        {/* ---------------- 05 · ATELIER ---------------- */}
        <motion.section
          style={{ ...s5, ...livePointer(active === 4) }}
          className="absolute inset-0 flex flex-col justify-center px-6 py-20 md:px-16"
        >
          <div className="mx-auto grid w-full max-w-6xl gap-6 lg:grid-cols-[1fr_1.05fr]">
            <div className={`${PANEL} p-7 md:p-9`}>
              <span className="font-grotesk text-[10px] uppercase tracking-[0.42em] text-white/40">
                CHAPTER 05 — THE ATELIER
              </span>
              <h2 className="mt-3 font-frank text-4xl font-light leading-tight md:text-5xl">
                {hero.ctaText || "קביעת פגישה פרטית"}
              </h2>

              <div className="mt-7 space-y-3 text-sm text-white/55">
                <p {...editsFor("businessInfo.address")}>{info.address}</p>
                <p {...editsFor("businessInfo.openingHours")}>{info.openingHours}</p>
                <p className="font-grotesk text-xs uppercase tracking-[0.24em]" style={{ color: CHAMPAGNE }}>
                  {info.phone}
                </p>
              </div>

              <div className="mt-8 flex flex-wrap gap-3">
                <a
                  href={waNumber ? waLink(waNumber, `היי ${info.name}, אשמח לפגישה באטלייה.`) : undefined}
                  target="_blank"
                  rel="noreferrer"
                  className="border px-7 py-3.5 font-grotesk text-[11px] uppercase tracking-[0.28em]"
                  style={{ borderColor: GOLD, background: "rgba(201,162,39,0.16)", color: CHAMPAGNE }}
                >
                  פגישה בוואטסאפ
                </a>
                {info.phone ? (
                  <a
                    href={`tel:${info.phone}`}
                    className="border border-white/15 px-7 py-3.5 font-grotesk text-[11px] uppercase tracking-[0.28em] text-white/80"
                  >
                    חיוג ישיר
                  </a>
                ) : null}
              </div>
            </div>

            <div
              data-camera-ui="true"
              className={`${PANEL} max-h-[64vh] overflow-y-auto p-7 md:p-9`}
            >
              <span className="font-grotesk text-[10px] uppercase tracking-[0.34em] text-white/40">
                SERVICE LEDGER
              </span>
              <h3 className="mt-3 font-frank text-2xl font-light md:text-3xl">
                שאלות האטלייה
              </h3>
              <FaqLedger
                items={faq}
                accent={GOLD}
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
        accent={GOLD}
        brand={info.name || "CHRONO"}
        footerLeft={info.phone}
        footerRight={info.address}
      />
    </LockedViewport>
  );
}

export default HorologyChronoTemplate;
