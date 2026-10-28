"use client";

/**
 * 04 — KINETIC MONOLITH / NVIDIA OMNIVERSE CORRIDOR
 * ================================================
 * Locked viewport, virtual wheel, zero scrollbar. This world is a dark
 * liquid-chrome corridor: the wheel glides the camera horizontally and
 * diagonally past monolithic slabs, telemetry waveforms respond to the live
 * quote in real time, and chapter 05 is the uplink chamber.
 */

import React, { useMemo, useState } from "react";
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
  livePointer,
  useCameraEngine,
  useCameraRig,
  useSceneTrack,
  type CameraScene,
} from "@/templates/wheel";

const SCENES: CameraScene[] = [
  { code: "01", label: "כניסה" },
  { code: "02", label: "מודולים" },
  { code: "03", label: "טלמטריה" },
  { code: "04", label: "פלט" },
  { code: "05", label: "שידור" },
];

const ACID = "#CDFF3D";
const CHROME = "#E9F1FA";
const CYAN = "#5BE1FF";
const SLAB =
  "relative border border-white/10 bg-gradient-to-b from-white/[0.09] via-white/[0.03] to-transparent backdrop-blur-md";

export function KineticMonolithTemplate() {
  const { data, editsFor } = useSite();
  const info = data.businessInfo;
  const hero = data.hero;
  const services = data.services?.length ? data.services : [];
  const benefits = data.benefits ?? [];
  const reviews = data.reviews ?? [];
  const faq = data.faq ?? [];

  const [scopeIdx, setScopeIdx] = useState(0);
  const [budget, setBudget] = useState(45);
  const [urgency, setUrgency] = useState<"NORMAL" | "PRIORITY" | "CRITICAL">(
    "PRIORITY",
  );
  const [menu, setMenu] = useState(false);

  const engine = useCameraEngine(SCENES.length, { depthMm: 8800 });
  const rig = useCameraRig({ tiltX: 6, tiltY: 12, lightMin: 12, lightMax: 88 });
  const { progress, active, jump } = engine;

  const s1 = useSceneTrack(progress, { sceneIndex: 0, tiltX: 6 });
  const s2 = useSceneTrack(progress, { sceneIndex: 1, tiltX: 8 });
  const s3 = useSceneTrack(progress, { sceneIndex: 2, tiltX: 7 });
  const s4 = useSceneTrack(progress, { sceneIndex: 3, tiltX: 5 });
  const s5 = useSceneTrack(progress, { sceneIndex: 4, tiltX: 4 });

  /* Diagonal glide: the whole world slides sideways as the camera advances. */
  const glide = useTransform(progress, [0, 4], ["16%", "-16%"]);
  const glideSlow = useTransform(progress, [0, 4], ["6%", "-6%"]);
  const glideFast = useTransform(progress, [0, 4], ["30%", "-30%"]);
  const corridorTurn = useTransform(progress, [0, 4], [0, -26]);
  const sheen = useTransform(progress, [0, 4], ["-40%", "140%"]);
  const playhead = useTransform(progress, [0, 4], ["0%", "100%"]);

  const scope = services[scopeIdx];
  const base = parsePrice(scope?.price) ?? 6200;
  const urgencyFactor =
    urgency === "NORMAL" ? 1 : urgency === "PRIORITY" ? 1.14 : 1.3;
  const estimate =
    Math.round((base * (0.75 + budget / 90) * urgencyFactor) / 100) * 100;

  /* Waveform physics: amplitude is a function of the live telemetry values. */
  const bars = useMemo(() => {
    const amplitude = 16 + (budget / 90) * 68;
    return Array.from({ length: 44 }, (_, index) => {
      const wave =
        Math.sin(index * 0.5 + budget * 0.05) * 0.5 +
        Math.sin(index * 1.31) * 0.28;
      return Math.max(6, Math.min(100, Math.round(14 + amplitude * (wave + 0.8))));
    });
  }, [budget]);

  const waNumber = String(info.whatsapp || "").replace(/\D/g, "");
  const specMessage =
    `היי ${info.name}, בניתי טלמטריה למפרט:\n` +
    `• מודול: ${scope?.title ?? "—"}\n` +
    `• תקציב: ${budget} יח'\n` +
    `• עדיפות: ${urgency}\n` +
    `• אומדן: ${formatNis(estimate)}`;

  return (
    <LockedViewport background="#040507" text="#EEF4FA" brandName={info.name}>
      <StageLight
        rig={rig}
        tint="rgba(205,255,61,0.08)"
        accent="rgba(91,225,255,0.05)"
        size={900}
      />
      <MagneticCursor rig={rig} accent={ACID} label="MONOLITH" />

      {/* Chrome corridor walls — receding slabs the camera glides between */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 overflow-hidden"
        style={{ perspective: 1300, transformStyle: "preserve-3d" }}
      >
        <motion.div
          style={{ rotateY: corridorTurn, transformStyle: "preserve-3d" }}
          className="absolute inset-0"
        >
          <div
            className="absolute right-0 top-0 h-full w-[18%] border-l border-white/10 bg-gradient-to-l from-white/[0.07] to-transparent"
            style={{ transform: "translateZ(-180px)" }}
          />
          <motion.div
            aria-hidden="true"
            className="absolute inset-y-0 w-[600px] opacity-30"
            style={{
              x: sheen,
              background: `linear-gradient(100deg, transparent, ${CHROME}22 45%, transparent)`,
            }}
          />
          <div
            className="absolute left-0 top-1/4 h-[52%] w-[14%] border-r border-white/10 bg-gradient-to-r from-white/[0.05] to-transparent"
            style={{ transform: "translateZ(-320px)" }}
          />
        </motion.div>
      </div>

      <header className="fixed inset-x-0 top-0 z-40 flex items-center justify-between px-5 py-6 md:px-12">
        <div className="flex items-center gap-4">
          <span
            className="block h-3 w-3"
            style={{ background: ACID, boxShadow: `0 0 18px ${ACID}` }}
          />
          <span className="font-grotesk text-[11px] uppercase tracking-[0.38em] text-white/75">
            {info.name || "MONOLITH"}
          </span>
        </div>

        <div className="hidden items-center gap-6 md:flex">
          <span className="font-grotesk text-[10px] uppercase tracking-[0.3em] text-white/35">
            {info.address}
          </span>
          <span className="font-grotesk text-[10px] uppercase tracking-[0.3em] text-white/35">
            {info.phone}
          </span>
        </div>

        <button
          type="button"
          onClick={() => setMenu(true)}
          className="font-grotesk text-[10px] uppercase tracking-[0.32em] text-white/70 hover:text-white"
        >
          DECK INDEX
        </button>
      </header>

      <HudScrubber engine={engine} scenes={SCENES} accent={ACID} />
      <ChapterBar
        engine={engine}
        scenes={SCENES}
        accent={ACID}
        hint="סובב גלגלת — המצלמה גולשת בפרוזדור הכרום [GLIDE]"
      />

      <CameraStage rig={rig} perspective={1400} className="relative h-full w-full">
        {/* ---------------- 01 · ENTRY ---------------- */}
        <motion.section
          style={{ ...s1, ...livePointer(active === 0) }}
          className="absolute inset-x-0 top-[9vh] bottom-[9vh] max-h-[82vh] flex items-center justify-center overflow-y-auto px-6 pb-24 pt-20 md:inset-y-0 md:max-h-none md:overflow-visible"
        >
          <motion.div style={{ x: glideSlow }} className="max-w-5xl text-center">
            <span className="font-grotesk text-[10px] uppercase tracking-[0.55em] text-white/40">
              CHAPTER 01 — CORRIDOR ENTRY
            </span>
            <h1
              className="mt-6 font-frank text-[2.6rem] font-light uppercase leading-[0.98] tracking-tight text-white sm:text-7xl md:text-[6.4rem]"
              {...editsFor("hero.headline")}
            >
              {hero.headline || info.name || "MONOLITH"}
            </h1>
            <div className="mx-auto mt-6 h-px w-40" style={{ background: ACID }} />
            <p
              className="mx-auto mt-6 max-w-xl text-sm font-light leading-relaxed text-white/55"
              {...editsFor("hero.subheadline")}
            >
              {hero.subheadline || info.description}
            </p>
            <Magnetic className="mt-8 flex justify-center" strength={0.42}>
              <button
                type="button"
                onClick={() => jump(1)}
                className="px-9 py-4 font-grotesk text-[11px] uppercase tracking-[0.32em] text-black"
                style={{ background: ACID }}
              >
                {hero.ctaText || "כניסה לדק המודולים"}
              </button>
            </Magnetic>
          </motion.div>
        </motion.section>

        {/* ---------------- 02 · MODULES ---------------- */}
        <motion.section
          style={{ ...s2, ...livePointer(active === 1) }}
          className="absolute inset-x-0 top-[9vh] bottom-[9vh] max-h-[82vh] flex flex-col justify-center overflow-y-auto px-6 pb-24 pt-20 md:inset-y-0 md:max-h-none md:overflow-visible md:px-14"
        >
          <motion.div style={{ x: glide }} className="w-full">
            <div className="flex items-end justify-between border-b border-white/10 pb-5">
              <div>
                <span className="font-grotesk text-[10px] uppercase tracking-[0.42em] text-white/40">
                  CHAPTER 02 — MODULE DECK
                </span>
                <h2 className="mt-3 font-frank text-3xl font-light uppercase md:text-5xl">
                  דק המודולים
                </h2>
              </div>
              <span className="hidden font-grotesk text-[10px] uppercase tracking-[0.28em] text-white/35 md:block">
                {services.length || 4} SLABS · GLIDE ACTIVE
              </span>
            </div>

            <div
              className="mt-6 flex gap-5 overflow-x-auto pb-2"
              data-camera-ui="true"
            >
              {(services.length ? services : []).slice(0, 5).map((service, index) => (
                <motion.div
                  key={index}
                  style={{ z: index % 2 === 0 ? 90 : -70, rotateY: counter(index) }}
                  className={`${SLAB} min-w-[248px] flex-1 p-6`}
                >
                  <span
                    className="font-grotesk text-[10px] tracking-[0.34em]"
                    style={{ color: ACID }}
                  >
                    SLAB / {String(index + 1).padStart(2, "0")}
                  </span>
                  <h3
                    className="mt-4 font-frank text-2xl font-light text-white"
                    {...editsFor(`services.${index}.title`)}
                  >
                    {service.title}
                  </h3>
                  <p
                    className="mt-3 text-[11px] leading-relaxed text-white/50"
                    {...editsFor(`services.${index}.description`)}
                  >
                    {service.description}
                  </p>
                  <span className="mt-5 block font-grotesk text-[10px] uppercase tracking-[0.26em] text-white/70">
                    {service.price || "בהתאמה"}
                  </span>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </motion.section>

        {/* ---------------- 03 · TELEMETRY ---------------- */}
        <motion.section
          style={{ ...s3, ...livePointer(active === 2) }}
          data-camera-ui="true"
          className="absolute inset-x-0 top-[9vh] bottom-[9vh] max-h-[82vh] flex flex-col justify-center overflow-y-auto px-6 py-24 md:inset-y-0 md:max-h-none md:px-14"
        >
          <div className="mx-auto grid w-full max-w-6xl gap-6 lg:grid-cols-[1.35fr_1fr]">
            <div className={`${SLAB} p-7 md:p-9`}>
              <span className="font-grotesk text-[10px] uppercase tracking-[0.42em] text-white/40">
                CHAPTER 03 — LIVE TELEMETRY
              </span>
              <h2 className="mt-3 font-frank text-3xl font-light uppercase md:text-4xl">
                טלמטריה חיה
              </h2>

              <div className="mt-7 flex h-28 items-end gap-1">
                {bars.map((height, index) => (
                  <motion.span
                    key={index}
                    animate={{ scaleY: [0.4, 1, 0.62] }}
                    transition={{
                      duration: 2.6,
                      repeat: Infinity,
                      delay: index * 0.03,
                      ease: "easeInOut",
                    }}
                    className="block flex-1 origin-bottom"
                    style={{
                      height: `${height}%`,
                      background: `linear-gradient(180deg, ${index % 7 === 0 ? ACID : CYAN}, transparent)`,
                    }}
                  />
                ))}
              </div>
              <div className="relative mt-2 h-px w-full bg-white/10">
                <motion.span
                  className="absolute -top-1 h-2.5 w-px"
                  style={{ left: playhead, background: ACID }}
                />
              </div>

              <div className="mt-8 space-y-6">
                <div>
                  <span className="font-grotesk text-[10px] uppercase tracking-[0.3em] text-white/45">
                    מודול
                  </span>
                  <div className="mt-3 flex flex-wrap gap-2">
                    {(services.length ? services : []).slice(0, 4).map((service, index) => {
                      const on = scopeIdx === index;
                      return (
                        <button
                          key={index}
                          type="button"
                          onClick={() => setScopeIdx(index)}
                          className={`border px-4 py-2 text-xs transition-all ${
                            on ? "text-black" : "border-white/12 text-white/55 hover:border-white/35"
                          }`}
                          style={on ? { background: ACID, borderColor: ACID } : undefined}
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
                    <span className="font-grotesk text-sm" style={{ color: ACID }}>
                      {budget}
                    </span>
                  </div>
                  <input
                    type="range"
                    min={5}
                    max={90}
                    value={budget}
                    onChange={(event) => setBudget(Number(event.target.value))}
                    className="kinetic-range mt-3"
                    style={{ "--range-accent": ACID } as React.CSSProperties}
                  />
                </div>

                <div className="grid grid-cols-3 gap-2">
                  {(["NORMAL", "PRIORITY", "CRITICAL"] as const).map((level) => {
                    const on = urgency === level;
                    return (
                      <button
                        key={level}
                        type="button"
                        onClick={() => setUrgency(level)}
                        className={`border px-3 py-3 font-grotesk text-[10px] uppercase tracking-[0.18em] transition-all ${
                          on ? "text-black" : "border-white/12 text-white/50"
                        }`}
                        style={on ? { background: ACID, borderColor: ACID } : undefined}
                      >
                        {level}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className={`${SLAB} flex flex-col justify-between p-7 md:p-9`}>
              <div>
                <span className="font-grotesk text-[10px] uppercase tracking-[0.34em] text-white/40">
                  OUTPUT ESTIMATE
                </span>
                <p className="mt-5 font-frank text-5xl font-light text-white">
                  {formatNis(estimate)}
                </p>
                <dl className="mt-7 space-y-3 text-sm">
                  <div className="flex items-center justify-between border-b border-white/10 pb-2">
                    <dt className="text-white/45">מודול</dt>
                    <dd className="text-white/85">{scope?.title ?? "—"}</dd>
                  </div>
                  <div className="flex items-center justify-between border-b border-white/10 pb-2">
                    <dt className="text-white/45">היקף</dt>
                    <dd className="text-white/85">{budget} יח'</dd>
                  </div>
                  <div className="flex items-center justify-between border-b border-white/10 pb-2">
                    <dt className="text-white/45">עדיפות</dt>
                    <dd style={{ color: ACID }}>{urgency}</dd>
                  </div>
                </dl>
              </div>

              <a
                href={waNumber ? waLink(waNumber, specMessage) : undefined}
                target="_blank"
                rel="noreferrer"
                className="mt-8 block py-4 text-center font-grotesk text-[11px] uppercase tracking-[0.3em] text-black"
                style={{ background: ACID }}
              >
                שידור המפרט בוואטסאפ
              </a>
            </div>
          </div>
        </motion.section>

        {/* ---------------- 04 · OUTPUT ---------------- */}
        <motion.section
          style={{ ...s4, ...livePointer(active === 3) }}
          className="absolute inset-x-0 top-[9vh] bottom-[9vh] max-h-[82vh] flex flex-col justify-center overflow-y-auto px-6 pb-24 pt-20 md:inset-y-0 md:max-h-none md:overflow-visible md:px-14"
        >
          <motion.div style={{ x: glideFast }} className="mx-auto w-full max-w-6xl">
            <span className="font-grotesk text-[10px] uppercase tracking-[0.42em] text-white/40">
              CHAPTER 04 — OUTPUT
            </span>
            <h2 className="mt-3 font-frank text-3xl font-light uppercase md:text-5xl">
              מה יוצא מהפרוזדור
            </h2>

            <div className="mt-8 grid gap-4 md:grid-cols-3">
              {(benefits.length
                ? benefits.slice(0, 3)
                : services.slice(0, 3)
              ).map((item, index) => (
                <div key={index} className={`${SLAB} p-6`}>
                  <span
                    className="font-grotesk text-[10px] tracking-[0.32em]"
                    style={{ color: ACID }}
                  >
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <h3
                    className="mt-3 font-frank text-xl font-light text-white"
                    {...editsFor(
                      benefits.length
                        ? `benefits.${index}.title`
                        : `services.${index}.title`,
                    )}
                  >
                    {(item as { title: string }).title}
                  </h3>
                  <p
                    className="mt-2 text-[11px] leading-relaxed text-white/50"
                    {...editsFor(
                      benefits.length
                        ? `benefits.${index}.description`
                        : `services.${index}.description`,
                    )}
                  >
                    {(item as { description?: string }).description}
                  </p>
                </div>
              ))}
            </div>

            <div className="mt-8 flex flex-wrap gap-6 border-t border-white/10 pt-6">
              {reviews.slice(0, 3).map((review, index) => (
                <div key={index} className="max-w-xs">
                  <p className="font-frank text-base font-light text-white/80" {...editsFor(`reviews.${index}.text`)}>
                    “{review.text}”
                  </p>
                  <span className="font-grotesk text-[9px] uppercase tracking-[0.28em]" style={{ color: ACID }}>
                    — {review.author}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        </motion.section>

        {/* ---------------- 05 · UPLINK ---------------- */}
        <motion.section
          style={{ ...s5, ...livePointer(active === 4) }}
          className="absolute inset-x-0 top-[9vh] bottom-[9vh] max-h-[82vh] flex flex-col justify-center overflow-y-auto px-6 py-20 pb-24 md:inset-y-0 md:max-h-none md:px-14"
        >
          <div className="mx-auto grid w-full max-w-6xl gap-6 lg:grid-cols-[1fr_1.05fr]">
            <div className={`${SLAB} p-7 md:p-9`}>
              <span className="font-grotesk text-[10px] uppercase tracking-[0.42em] text-white/40">
                CHAPTER 05 — UPLINK
              </span>
              <h2 className="mt-3 font-frank text-4xl font-light uppercase leading-tight md:text-5xl">
                {hero.ctaText || "פתחו שידור"}
              </h2>

              <div className="mt-7 space-y-3 text-sm text-white/55">
                <p {...editsFor("businessInfo.address")}>{info.address}</p>
                <p {...editsFor("businessInfo.openingHours")}>{info.openingHours}</p>
                <p className="font-grotesk text-xs uppercase tracking-[0.26em]" style={{ color: ACID }}>
                  {info.phone} · {info.googleRating || "4.9"}★
                </p>
              </div>

              <div className="mt-8 flex flex-wrap gap-3">
                <a
                  href={waNumber ? waLink(waNumber, `היי ${info.name}, אשמח לפתוח שידור.`) : undefined}
                  target="_blank"
                  rel="noreferrer"
                  className="px-7 py-3.5 font-grotesk text-[11px] uppercase tracking-[0.3em] text-black"
                  style={{ background: ACID }}
                >
                  שידור בוואטסאפ
                </a>
                {info.phone ? (
                  <a
                    href={`tel:${info.phone}`}
                    className="border border-white/15 px-7 py-3.5 font-grotesk text-[11px] uppercase tracking-[0.3em] text-white/80"
                  >
                    חיוג ישיר
                  </a>
                ) : null}
              </div>
            </div>

            <div
              data-camera-ui="true"
              className={`${SLAB} max-h-[64vh] overflow-y-auto p-7 md:p-9`}
            >
              <span className="font-grotesk text-[10px] uppercase tracking-[0.34em] text-white/40">
                SYSTEM LOG
              </span>
              <h3 className="mt-3 font-frank text-2xl font-light md:text-3xl">
                שאלות מערכת
              </h3>
              <FaqLedger
                items={faq}
                accent={ACID}
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
        accent={ACID}
        brand={info.name || "MONOLITH"}
        footerLeft={info.phone}
        footerRight={info.address}
      />
    </LockedViewport>
  );
}

/** Counter-rotation so a slab always faces the lens while the deck glides. */
function counter(index: number) {
  return index % 2 === 0 ? 6 : -6;
}

export default KineticMonolithTemplate;
