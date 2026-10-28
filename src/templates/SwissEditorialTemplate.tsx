"use client";

/**
 * 05 — BRUTALIST ARCHITECTURAL MUSEUM
 * ===================================
 * Locked viewport, virtual wheel, zero scrollbar. This world is a dark
 * brutalist gallery: the wheel drives the camera through a magazine-cover
 * gallery, unfolding perspective museum walls, sliding architectural curtains
 * and, finally, the colophon chamber. No icons, no flat scrolling, no
 * conventional section stack.
 */

import React, { useState } from "react";
import { motion, useTransform } from "framer-motion";
import { useSite } from "@/components/SiteProvider";
import { Magnetic } from "@/templates/motion";
import { waLink } from "@/templates/shared";
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
  { code: "01", label: "שער" },
  { code: "02", label: "כפולה" },
  { code: "03", label: "אינדקס" },
  { code: "04", label: "ארכיון" },
  { code: "05", label: "קולופון" },
];

const BRASS = "#C8A27A";
const PAPER = "#EDE7DC";
const WALL =
  "border border-white/10 bg-[#0c0b09]/78 backdrop-blur-xl shadow-[inset_0_1px_0_0_rgba(237,231,220,0.08)]";

export function SwissEditorialTemplate() {
  const { data, editsFor } = useSite();
  const info = data.businessInfo;
  const hero = data.hero;
  const services = data.services?.length ? data.services : [];
  const benefits = data.benefits ?? [];
  const reviews = data.reviews ?? [];
  const faq = data.faq ?? [];
  const timeline = data.processTimeline ?? [];
  const project = data.projects?.[0];

  const [menu, setMenu] = useState(false);
  const [plateIdx, setPlateIdx] = useState(0);

  const engine = useCameraEngine(SCENES.length, { depthMm: 5400 });
  const rig = useCameraRig({ tiltX: 5, tiltY: 8, lightMin: 16, lightMax: 84 });
  const { progress, active, jump } = engine;

  const s1 = useSceneTrack(progress, { sceneIndex: 0, tiltX: 5 });
  const s2 = useSceneTrack(progress, { sceneIndex: 1, tiltX: 7 });
  const s3 = useSceneTrack(progress, { sceneIndex: 2, tiltX: 6 });
  const s4 = useSceneTrack(progress, { sceneIndex: 3, tiltX: 5 });
  const s5 = useSceneTrack(progress, { sceneIndex: 4, tiltX: 4 });

  /* Sliding architectural curtains part as the camera moves in. */
  const curtainLeft = useTransform(progress, [0, 0.72], ["0%", "-104%"]);
  const curtainRight = useTransform(progress, [0, 0.72], ["0%", "104%"]);
  /* Unfolding museum walls: each plate folds out of the wall plane. */
  const foldA = useTransform(progress, [0.56, 1.32], [76, 0]);
  const foldB = useTransform(progress, [0.72, 1.48], [76, 0]);
  const foldC = useTransform(progress, [0.88, 1.64], [76, 0]);
  const foldD = useTransform(progress, [1.04, 1.8], [76, 0]);
  const folds = [foldA, foldB, foldC, foldD];
  const wallTurn = useTransform(progress, [0, 4], [0, -20]);
  const archiveSlide = useTransform(progress, [2.4, 4], ["8%", "-8%"]);
  const editorialRule = useTransform(progress, [0, 4], ["0%", "100%"]);

  const heroImage = hero.backgroundImage || "";
  const waNumber = String(info.whatsapp || "").replace(/\D/g, "");
  const activePlate = services[plateIdx];

  return (
    <LockedViewport background="#070706" text={PAPER} brandName={info.name}>
      <StageLight
        rig={rig}
        tint="rgba(200,162,122,0.09)"
        accent="rgba(237,231,220,0.03)"
        size={840}
      />
      <MagneticCursor rig={rig} accent={BRASS} label="GALLERY" />

      {/* Brutalist grid wall behind the whole gallery */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 opacity-[0.22]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(237,231,220,0.14) 1px, transparent 1px), linear-gradient(90deg, rgba(237,231,220,0.1) 1px, transparent 1px)",
          backgroundSize: "96px 96px",
        }}
      />

      <header className="fixed inset-x-0 top-0 z-40 flex items-end justify-between px-5 py-6 md:px-12">
        <div>
          <span className="block font-grotesk text-[9px] uppercase tracking-[0.5em] text-white/40">
            ARCHITECTURAL PRESS
          </span>
          <span className="mt-1 block font-frank text-lg font-light tracking-[0.14em] text-white/85">
            {info.name || "GALLERY"}
          </span>
        </div>

        <div className="hidden text-right md:block">
          <span className="block font-grotesk text-[9px] uppercase tracking-[0.34em] text-white/35">
            {info.address}
          </span>
          <span className="mt-1 block font-grotesk text-[9px] uppercase tracking-[0.34em] text-white/35">
            {info.phone}
          </span>
        </div>

        <button
          type="button"
          onClick={() => setMenu(true)}
          className="font-grotesk text-[10px] uppercase tracking-[0.34em] text-white/70 hover:text-white"
        >
          INDEX
        </button>
      </header>

      <HudScrubber engine={engine} scenes={SCENES} accent={BRASS} />
      <ChapterBar
        engine={engine}
        scenes={SCENES}
        accent={BRASS}
        hint="סובב גלגלת — הקירות נפתחים והמצלמה נכנסת לגלריה [GALLERY]"
      />

      <CameraStage rig={rig} perspective={1500} className="relative h-full w-full">
        {/* ---------------- 01 · COVER ---------------- */}
        <motion.section
          style={{ ...s1, ...livePointer(active === 0) }}
          className="absolute inset-x-0 top-[9vh] bottom-[9vh] max-h-[82vh] flex items-center justify-center overflow-y-auto px-6 pb-24 pt-20 md:inset-y-0 md:max-h-none md:overflow-visible"
        >
          {/* Architectural curtains */}
          <motion.div
            aria-hidden="true"
            style={{ x: curtainLeft, visibility: s1.visibility, pointerEvents: "none" }}
            className="pointer-events-none absolute inset-y-0 right-0 w-1/2 border-l border-white/10 bg-[#0b0a08]"
          />
          <motion.div
            aria-hidden="true"
            style={{ x: curtainRight, visibility: s1.visibility, pointerEvents: "none" }}
            className="pointer-events-none absolute inset-y-0 left-0 w-1/2 border-r border-white/10 bg-[#0b0a08]"
          />

          <div className="relative z-10 grid w-full max-w-6xl gap-8 md:grid-cols-[1fr_auto]">
            <div>
              <span className="font-grotesk text-[10px] uppercase tracking-[0.55em] text-white/40">
                CHAPTER 01 — COVER
              </span>
              <h1
                className="mt-5 font-frank text-[2.4rem] font-light leading-[1.02] tracking-tight text-white sm:text-6xl md:text-[4.4rem]"
                {...editsFor("hero.headline")}
              >
                {hero.headline || info.tagline || "אדריכלות של תוכן"}
              </h1>
              <motion.div
                style={{ width: editorialRule }}
                className="mt-6 h-px"
                aria-hidden="true"
              >
                <span className="block h-full" style={{ background: BRASS }} />
              </motion.div>
              <p
                className="mt-6 max-w-lg text-sm font-light leading-relaxed text-white/55"
                {...editsFor("hero.subheadline")}
              >
                {hero.subheadline || info.description}
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-6">
                <Magnetic strength={0.4}>
                  <button
                    type="button"
                    onClick={() => jump(1)}
                    className="border px-8 py-4 font-grotesk text-[11px] uppercase tracking-[0.3em]"
                    style={{ borderColor: BRASS, color: PAPER }}
                  >
                    {hero.ctaText || "פתיחת הגלריה"}
                  </button>
                </Magnetic>
                <span className="font-grotesk text-[10px] uppercase tracking-[0.3em] text-white/40">
                  {info.category}
                </span>
              </div>
            </div>

            <div className="hidden flex-col items-end justify-between md:flex">
              <span
                className="font-grotesk text-[7rem] font-light leading-none md:text-[9rem]"
                style={{ color: "rgba(237,231,220,0.10)" }}
              >
                N°01
              </span>
              <div className="text-right">
                <span className="block font-grotesk text-[9px] uppercase tracking-[0.34em] text-white/40">
                  RATING
                </span>
                <span className="font-frank text-4xl font-light text-white">
                  {info.googleRating || "4.9"}★
                </span>
              </div>
            </div>
          </div>
        </motion.section>

        {/* ---------------- 02 · SPREAD ---------------- */}
        <motion.section
          style={{ ...s2, ...livePointer(active === 1) }}
          className="absolute inset-x-0 top-[9vh] bottom-[9vh] max-h-[82vh] flex flex-col justify-center overflow-y-auto px-6 pb-24 pt-20 md:inset-y-0 md:max-h-none md:overflow-visible md:px-14"
        >
          <div className="mx-auto w-full max-w-6xl">
            <div className="flex items-end justify-between border-b border-white/12 pb-5">
              <div>
                <span className="font-grotesk text-[10px] uppercase tracking-[0.42em] text-white/40">
                  CHAPTER 02 — DOUBLE SPREAD
                </span>
                <h2 className="mt-3 font-frank text-3xl font-light md:text-5xl">
                  לוחות הגלריה
                </h2>
              </div>
              <span className="hidden font-grotesk text-[10px] uppercase tracking-[0.3em] text-white/35 md:block">
                PLATES {String(services.length || 4).padStart(2, "0")} · UNFOLDING
              </span>
            </div>

            <div
              className="mt-7 grid gap-4 md:grid-cols-4"
              style={{ perspective: 1600, transformStyle: "preserve-3d" }}
            >
              {(services.length ? services : []).slice(0, 4).map((service, index) => (
                <motion.button
                  key={index}
                  type="button"
                  onClick={() => setPlateIdx(index)}
                  style={{ rotateY: folds[index % folds.length], transformStyle: "preserve-3d" }}
                  className={`${WALL} min-h-[264px] p-5 text-right transition-colors ${
                    plateIdx === index ? "" : "hover:border-white/25"
                  }`}
                >
                  <span className="font-grotesk text-[9px] uppercase tracking-[0.34em] text-white/40">
                    PLATE {String(index + 1).padStart(2, "0")}
                  </span>
                  <h3
                    className="mt-4 font-frank text-xl font-light text-white md:text-2xl"
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
                  <span
                    className="mt-5 block font-grotesk text-[10px] uppercase tracking-[0.26em]"
                    style={{ color: BRASS }}
                  >
                    {service.price || "בהתאמה"}
                  </span>
                </motion.button>
              ))}
            </div>

            {activePlate ? (
              <div className="mt-7 flex flex-wrap items-center justify-between gap-4 border-t border-white/10 pt-5">
                <span className="font-frank text-lg font-light text-white/80">
                  {activePlate.title}
                </span>
                <a
                  href={
                    waNumber
                      ? waLink(waNumber, `היי ${info.name}, אשמח לשמוע על ${activePlate.title}.`)
                      : undefined
                  }
                  target="_blank"
                  rel="noreferrer"
                  className="font-grotesk text-[10px] uppercase tracking-[0.3em]"
                  style={{ color: BRASS }}
                >
                  בקשת עבודה על הלוח הזה →
                </a>
              </div>
            ) : null}
          </div>
        </motion.section>

        {/* ---------------- 03 · INDEX ---------------- */}
        <motion.section
          style={{ ...s3, ...livePointer(active === 2) }}
          className="absolute inset-x-0 top-[9vh] bottom-[9vh] max-h-[82vh] flex flex-col justify-center overflow-y-auto px-6 pb-24 pt-20 md:inset-y-0 md:max-h-none md:overflow-visible md:px-14"
        >
          <div className="mx-auto grid w-full max-w-6xl gap-10 lg:grid-cols-[1.2fr_1fr]">
            <div>
              <span className="font-grotesk text-[10px] uppercase tracking-[0.42em] text-white/40">
                CHAPTER 03 — INDEX
              </span>
              <h2 className="mt-3 font-frank text-3xl font-light md:text-5xl">
                מפתח העניינים
              </h2>

              <ol className="mt-7">
                {(benefits.length ? benefits : services).slice(0, 5).map((item, index) => (
                  <li
                    key={index}
                    className="flex items-baseline gap-6 border-b border-white/10 py-3.5"
                  >
                    <span className="font-grotesk text-[11px]" style={{ color: BRASS }}>
                      {String(index + 1).padStart(2, "0")}
                    </span>
                    <span
                      className="font-frank text-lg font-light text-white md:text-2xl"
                      {...editsFor(
                        benefits.length
                          ? `benefits.${index}.title`
                          : `services.${index}.title`,
                      )}
                    >
                      {(item as { title: string }).title}
                    </span>
                    <span className="mr-auto hidden font-grotesk text-[10px] uppercase tracking-[0.26em] text-white/35 md:block">
                      {(item as { description?: string }).description}
                    </span>
                  </li>
                ))}
              </ol>
            </div>

            <div className={`${WALL} p-7`}>
              <span className="font-grotesk text-[10px] uppercase tracking-[0.34em] text-white/40">
                SELECTED REVIEWS
              </span>
              <div className="mt-5 space-y-5">
                {reviews.slice(0, 3).map((review, index) => (
                  <div key={index} className="border-t border-white/10 pt-4">
                    <p
                      className="font-frank text-lg font-light leading-relaxed text-white/85"
                      {...editsFor(`reviews.${index}.text`)}
                    >
                      “{review.text}”
                    </p>
                    <span
                      className="mt-2 block font-grotesk text-[9px] uppercase tracking-[0.3em]"
                      style={{ color: BRASS }}
                    >
                      — {review.author}
                    </span>
                  </div>
                ))}
                {reviews.length === 0
                  ? timeline.slice(0, 3).map((step, index) => (
                      <div key={index} className="border-t border-white/10 pt-4">
                        <span className="font-grotesk text-[9px] uppercase tracking-[0.3em]" style={{ color: BRASS }}>
                          {String(index + 1).padStart(2, "0")}
                        </span>
                        <p className="mt-2 font-frank text-lg font-light text-white/85">
                          {step.title}
                        </p>
                      </div>
                    ))
                  : null}
              </div>
            </div>
          </div>
        </motion.section>

        {/* ---------------- 04 · ARCHIVE ---------------- */}
        <motion.section
          style={{ ...s4, ...livePointer(active === 3) }}
          className="absolute inset-x-0 top-[9vh] bottom-[9vh] max-h-[82vh] flex flex-col justify-center overflow-y-auto px-6 pb-24 pt-20 md:inset-y-0 md:max-h-none md:overflow-visible md:px-14"
        >
          <motion.div style={{ x: archiveSlide }} className="mx-auto w-full max-w-5xl">
            <div className="flex items-end justify-between pb-5">
              <div>
                <span className="font-grotesk text-[10px] uppercase tracking-[0.42em] text-white/40">
                  CHAPTER 04 — ARCHIVE
                </span>
                <h2 className="mt-3 font-frank text-3xl font-light md:text-5xl">
                  {project?.title || "ארכיון הפרויקטים"}
                </h2>
              </div>
              <span className="hidden font-grotesk text-[10px] uppercase tracking-[0.3em] text-white/35 md:block">
                CURTAIN REVEAL
              </span>
            </div>

            <StageSplit
              beforeImage={project?.beforeImage || heroImage}
              afterImage={project?.afterImage || project?.beforeImage || heroImage}
              beforeLabel="טיוטה ראשונית"
              afterLabel="מסירה סופית"
              caption={project?.description || "גררו את קו השרטוט בין המצבים"}
              accent={BRASS}
            />
          </motion.div>
        </motion.section>

        {/* ---------------- 05 · COLOPHON ---------------- */}
        <motion.section
          style={{ ...s5, ...livePointer(active === 4) }}
          className="absolute inset-x-0 top-[9vh] bottom-[9vh] max-h-[82vh] flex flex-col justify-center overflow-y-auto px-6 py-20 pb-24 md:inset-y-0 md:max-h-none md:overflow-visible md:px-14"
        >
          <div className="mx-auto grid w-full max-w-6xl gap-6 lg:grid-cols-[1fr_1.05fr]">
            <div className={`${WALL} p-7 md:p-9`}>
              <span className="font-grotesk text-[10px] uppercase tracking-[0.42em] text-white/40">
                CHAPTER 05 — COLOPHON
              </span>
              <h2 className="mt-3 font-frank text-4xl font-light leading-tight md:text-5xl">
                {hero.ctaText || "להזמנת עבודה"}
              </h2>

              <dl className="mt-7 space-y-3 text-sm">
                <div className="border-b border-white/10 pb-2">
                  <dt className="font-grotesk text-[9px] uppercase tracking-[0.3em] text-white/35">
                    ADDRESS
                  </dt>
                  <dd className="mt-1 text-white/75" {...editsFor("businessInfo.address")}>
                    {info.address}
                  </dd>
                </div>
                <div className="border-b border-white/10 pb-2">
                  <dt className="font-grotesk text-[9px] uppercase tracking-[0.3em] text-white/35">
                    HOURS
                  </dt>
                  <dd className="mt-1 text-white/75" {...editsFor("businessInfo.openingHours")}>
                    {info.openingHours}
                  </dd>
                </div>
                <div>
                  <dt className="font-grotesk text-[9px] uppercase tracking-[0.3em] text-white/35">
                    CONTACT
                  </dt>
                  <dd className="mt-1 font-grotesk text-xs tracking-[0.24em]" style={{ color: BRASS }}>
                    {info.phone}
                  </dd>
                </div>
              </dl>

              <div className="mt-8 flex flex-wrap gap-3">
                <a
                  href={waNumber ? waLink(waNumber, `היי ${info.name}, אשמח להזמין עבודה.`) : undefined}
                  target="_blank"
                  rel="noreferrer"
                  className="border px-7 py-3.5 font-grotesk text-[11px] uppercase tracking-[0.3em]"
                  style={{ borderColor: BRASS, color: PAPER }}
                >
                  הזמנה בוואטסאפ
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
              className={`${WALL} max-h-[64vh] overflow-y-auto p-7 md:p-9`}
            >
              <span className="font-grotesk text-[10px] uppercase tracking-[0.34em] text-white/40">
                FOOTNOTES
              </span>
              <h3 className="mt-3 font-frank text-2xl font-light md:text-3xl">
                הערות שוליים
              </h3>
              <FaqLedger
                items={faq}
                accent={BRASS}
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
        accent={BRASS}
        brand={info.name || "GALLERY"}
        footerLeft={info.phone}
        footerRight={info.address}
      />
    </LockedViewport>
  );
}

export default SwissEditorialTemplate;
