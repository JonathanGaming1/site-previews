"use client";

import React, { useState } from "react";
import { AnimatePresence, motion, useScroll, useTransform } from "framer-motion";
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

/** One gear of the interlocking train: teeth, radius, spin rate and direction. */
function Gear({
  cx,
  cy,
  r,
  teeth,
  rate,
  opacity,
}: {
  cx: number;
  cy: number;
  r: number;
  teeth: number;
  rate: string;
  opacity: number;
}) {
  const pitch = (Math.PI * 2) / teeth;
  const tooth = Array.from({ length: teeth }, (_, i) => {
    const a = i * pitch;
    const inner = r - 9;
    const outer = r + 9;
    const w = pitch * 0.24;
    const p = (angle: number, radius: number) =>
      `${cx + Math.cos(angle) * radius} ${cy + Math.sin(angle) * radius}`;
    return `M ${p(a - w, inner)} L ${p(a - w * 0.72, outer)} L ${p(a + w * 0.72, outer)} L ${p(a + w, inner)} Z`;
  }).join(" ");

  return (
    <motion.g style={{ rotate: 0 }}>
      <g style={{ animation: rate, transformOrigin: `${cx}px ${cy}px` }} opacity={opacity}>
        <circle cx={cx} cy={cy} r={r - 9} fill="none" stroke={GOLD} strokeOpacity="0.5" />
        <circle cx={cx} cy={cy} r={r - 30} fill="none" stroke={GOLD} strokeOpacity="0.22" />
        <path d={tooth} fill="none" stroke={GOLD} strokeOpacity="0.42" />
      </g>
    </motion.g>
  );
}

/* ------------------------------------------------------------------ */
/* HOROLOGY / SWISS MECHANICAL OBSERVATORY                             */
/* Midnight sapphire #06080F, champagne-gold hairlines #D4AF37,         */
/* roman indices, architectural crosshairs, a rotating hero bezel and  */
/* an interactive chronograph dial that selects each service.          */
/* ------------------------------------------------------------------ */

const GOLD = "#D4AF37";
const HAIRLINE = "rgba(212,175,55,0.28)";
const HAIRLINE_SOFT = "rgba(212,175,55,0.13)";

const ROMAN = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII"];

const CALIBRES = [
  { code: "CAL. 01", value: "72H", label: "רזרבת כוח" },
  { code: "CAL. 02", value: "5Y", label: "אחריות מנגנון" },
  { code: "CAL. 03", value: "0.1MM", label: "סובלנות גימור" },
] as const;

const TIERS = [
  {
    roman: "I",
    name: "Initiation",
    he: "מהות",
    body: "פגישת אבחון, מדידה מדויקת ותכנון מנגנון הפרויקט. ללא התחייבות.",
    cover: "אחריות שנתיים",
  },
  {
    roman: "II",
    name: "Signature",
    he: "חתימה",
    body: "ליווי אישי לאורך הביצוע, דיוקי גימור מלאים ובדיקת קבלה מסכמת.",
    cover: "אחריות חמש שנים",
  },
  {
    roman: "III",
    name: "Reserve",
    he: "רזרבה",
    body: "שמורה אישית של הסטודיו: עדיפות בלוח הזמנים ופיקוח צמוד עד המסירה.",
    cover: "אחריות עשר שנים",
  },
] as const;

function Cross({ className = "" }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={`pointer-events-none absolute font-mono text-[13px] leading-none ${className}`}
      style={{ color: HAIRLINE }}
    >
      +
    </span>
  );
}

function MicroTicks({ className = "" }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={`block h-[5px] w-full ${className}`}
      style={{
        backgroundImage:
          "repeating-linear-gradient(90deg, rgba(212,175,55,0.30) 0 1px, transparent 1px 11px)",
      }}
    />
  );
}

export function HorologyChronoTemplate() {
  const { data, editsFor } = useSite();
  const { businessInfo: b, hero, services, faq, reviews, projects = [] } = data;

  const accent = data.theme.accentColor || GOLD;
  const primary = data.theme.primaryColor || "#f4efe6";

  const dialServices = services.length
    ? services.slice(0, 6)
    : [
        {
          title: "מנגנון מותאם",
          description: "תכנון, ייצור והרכבה מדויקת של הפרויקט.",
          price: "",
          iconName: "Clock",
        },
      ];
  const [activeIdx, setActiveIdx] = useState(0);
  // The gear train and the reticle rings turn with the page scroll itself.
  const { scrollYProgress } = useScroll();
  const gearTurn = useTransform(scrollYProgress, [0, 1], [0, 240]);
  const gearTurnBack = useTransform(scrollYProgress, [0, 1], [0, -170]);
  const reticleTurn = useTransform(scrollYProgress, [0, 1], [0, 120]);
  const count = dialServices.length;
  const currentIdx = Math.min(activeIdx, count - 1);
  const active = dialServices[currentIdx];
  const activePrice = parsePrice(active?.price);
  const movementSteps = data.processTimeline?.length
    ? data.processTimeline
    : services.slice(0, 4).map((service) => ({
        title: service.title,
        description: service.description,
      }));

  const bookingHref = waLink(
    b.whatsapp,
    [
      `שלום, הגעתי לאובזרווטורי של ${b.name}.`,
      `• קולקציה: ${active?.title ?? ""}`,
      `• קליבר: ${String(currentIdx + 1).padStart(2, "0")} / ${String(count).padStart(2, "0")}`,
      activePrice ? `• הערכת השקעה: ${formatNis(activePrice)}` : "• אשמח להערכה אישית",
      "אשמח לתאם צפייה פרטית.",
    ].join("\n"),
  );

  const city = b.address.split(",")[0]?.trim() || b.address;
  const navItems = [
    { roman: "I", href: "#observatory", label: "אובזרווטורי" },
    { roman: "II", href: "#calibre", label: "קליבר" },
    { roman: "III", href: "#archive", label: "ארכיון" },
    { roman: "IV", href: "#maison", label: "המיוזן" },
  ];

  return (
    <div
      className="relative min-h-screen overflow-x-hidden pb-20"
      style={{ background: "#06080F", color: "rgba(244,239,230,0.70)" }}
      dir="rtl"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-0"
        style={{
          background:
            "radial-gradient(52% 40% at 74% 6%, rgba(212,175,55,0.10), transparent 66%), radial-gradient(45% 45% at 6% 78%, rgba(32,58,110,0.22), transparent 70%)",
        }}
      />

      {/* Champagne key light tracking the cursor across the observatory. */}
      <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-[5]">
        <SpecularLight color="rgba(212,175,55,0.13)" size={50} />
      </div>

      {/* ---------------- observatory instrument header ---------------- */}
      <header className="sticky top-0 z-[9500] border-b bg-[#06080F]/90 backdrop-blur-xl" style={{ borderColor: HAIRLINE }}>
        <MicroTicks />
        <div className="mx-auto grid max-w-7xl grid-cols-[1fr_auto_1fr] items-center gap-4 px-5 py-3.5 md:px-8">
          <div className="flex flex-col gap-0.5 text-[8.5px] tracking-[0.28em] text-white/32" dir="ltr">
            <span style={{ color: GOLD }}>MMXXVI</span>
            <span className="hidden sm:inline">{city.toUpperCase()}</span>
          </div>
          <a href="#top" className="flex flex-col items-center gap-1.5">
            <span className="flex items-center gap-2">
              <span className="h-px w-6" style={{ background: HAIRLINE }} />
              <span className="text-[9px] tracking-[0.34em]" style={{ color: GOLD }}>
                MAISON
              </span>
              <span className="h-px w-6" style={{ background: HAIRLINE }} />
            </span>
            <span
              className="max-w-[240px] truncate text-[13px] font-light tracking-[0.1em] text-[#f4efe6]"
              style={{ fontFamily: "'Frank Ruhl Libre', serif" }}
              {...editsFor("businessInfo.name")}
            >
              {b.name}
            </span>
          </a>
          <div className="justify-self-end text-right" dir="ltr">
            <a href={`tel:${b.phone}`} className="block text-[9.5px] tracking-[0.16em] text-white/48 hover:text-white/85">
              {b.phone}
            </a>
            <span className="mt-0.5 block text-[8px] tracking-[0.24em]" style={{ color: GOLD }}>
              PRIVATE LINE
            </span>
          </div>
        </div>
        <nav className="mx-auto flex max-w-7xl items-center justify-center gap-1 border-t px-3 py-2" style={{ borderColor: HAIRLINE_SOFT }}>
          {navItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="group flex items-baseline gap-1.5 px-3 py-1 text-[9px] tracking-[0.16em] text-white/35 transition hover:text-white/85"
            >
              <span className="font-mono text-[8px]" style={{ color: GOLD }}>
                {item.roman}
              </span>
              {item.label}
            </a>
          ))}
        </nav>
      </header>

      {/* ---------------- hero — optical lens portal into the movement ----------------
          The scroll turns interlocking geared wheels and chronograph rings
          around the viewport while the camera flies through a precision
          optical lens; the observatory split then resolves from inside it. */}
      <section id="top" className="relative z-10">
        <CameraPortal
          heightVh={320}
          perspective={1250}
          zoom={3.6}
          blurOut={22}
          veilColor="rgba(6,8,15,0.94)"
          hint={
            <span className="flex flex-col items-center gap-3">
              <SpecMark style={{ color: GOLD }}>SCROLL — FOCUS THE MOVEMENT</SpecMark>
              <span className="block h-10 w-px" style={{ background: `linear-gradient(${GOLD}, transparent)` }} />
            </span>
          }
          scene={
            <div className="absolute inset-0 overflow-hidden">
              {/* interlocking 3D gear train, driven by scroll progress */}
              <Parallax depth={22} className="absolute inset-0">
                <svg
                  viewBox="0 0 1200 800"
                  className="absolute inset-0 h-full w-full"
                  aria-hidden="true"
                  preserveAspectRatio="xMidYMid slice"
                >
                  <motion.g style={{ rotate: gearTurn, transformOrigin: "250px 300px" }}>
                    <Gear cx={250} cy={300} r={168} teeth={26} rate="gearspin 34s linear infinite" opacity={0.9} />
                  </motion.g>
                  <motion.g style={{ rotate: gearTurnBack, transformOrigin: "520px 520px" }}>
                    <Gear cx={520} cy={520} r={124} teeth={20} rate="gearspin 22s linear infinite reverse" opacity={0.7} />
                  </motion.g>
                  <motion.g style={{ rotate: gearTurn, transformOrigin: "880px 240px" }}>
                    <Gear cx={880} cy={240} r={196} teeth={30} rate="gearspin 46s linear infinite" opacity={0.55} />
                  </motion.g>
                  <motion.g style={{ rotate: gearTurnBack, transformOrigin: "1010px 590px" }}>
                    <Gear cx={1010} cy={590} r={104} teeth={18} rate="gearspin 18s linear infinite reverse" opacity={0.6} />
                  </motion.g>
                </svg>
              </Parallax>

              {/* chronograph rings + optical lens reticle */}
              <div className="absolute inset-0 flex items-center justify-center">
                <motion.div
                  style={{ rotate: reticleTurn }}
                  className="relative aspect-square w-[min(76vmin,660px)]"
                >
                  <svg viewBox="0 0 600 600" className="h-full w-full" aria-hidden="true">
                    <g fill="none" stroke={GOLD}>
                      <circle cx="300" cy="300" r="292" strokeOpacity="0.4" />
                      <circle cx="300" cy="300" r="268" strokeOpacity="0.16" strokeDasharray="2 9" />
                      <circle cx="300" cy="300" r="214" strokeOpacity="0.24" />
                      <circle cx="300" cy="300" r="150" strokeOpacity="0.12" strokeDasharray="1 6" />
                    </g>
                    <g stroke={GOLD} strokeWidth="1">
                      {Array.from({ length: 96 }).map((_, i) => (
                        <line
                          key={i}
                          x1="300"
                          y1={i % 8 === 0 ? 8 : 14}
                          x2="300"
                          y2={i % 8 === 0 ? 34 : 22}
                          strokeOpacity={i % 8 === 0 ? 0.7 : 0.26}
                          transform={`rotate(${i * 3.75} 300 300)`}
                        />
                      ))}
                    </g>
                  </svg>
                </motion.div>
              </div>

              {/* the lens itself — masked centerpiece */}
              {hero.backgroundImage && (
                <div className="absolute inset-0 flex items-center justify-center">
                  <TiltStage
                    intensity={8}
                    glareColor="rgba(212,175,55,0.26)"
                    className="relative aspect-square w-[min(46vmin,400px)] overflow-hidden rounded-full"
                  >
                    <div className="relative h-full w-full">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={hero.backgroundImage}
                        alt=""
                        className="h-full w-full object-cover"
                        style={{ filter: "saturate(0.58) brightness(0.66) contrast(1.1)" }}
                      />
                      <div
                        aria-hidden="true"
                        className="absolute inset-0"
                        style={{
                          background:
                            "radial-gradient(circle at 50% 42%, transparent 18%, rgba(6,8,15,0.82) 100%)",
                        }}
                      />
                    </div>
                  </TiltStage>
                </div>
              )}

              <div className="absolute inset-x-0 top-24 text-center md:top-28">
                <SpecMark style={{ color: GOLD }}>MAISON · {city.toUpperCase()}</SpecMark>
                <p
                  className="mt-3 text-xl font-light text-[#f4efe6]"
                  style={{ fontFamily: "'Frank Ruhl Libre', serif" }}
                >
                  {b.name}
                </p>
              </div>
            </div>
          }
          pane={
            <div
              className="h-full w-full"
              style={{
                background:
                  "linear-gradient(90deg, rgba(6,8,15,0.97), rgba(6,8,15,0.72) 60%, rgba(6,8,15,0.08))",
              }}
            >
              <div
                className="h-full w-full"
                style={{
                  backgroundImage:
                    "repeating-linear-gradient(0deg, rgba(212,175,55,0.14) 0 1px, transparent 1px 8px)",
                  maskImage: "linear-gradient(90deg, black, transparent)",
                  WebkitMaskImage: "linear-gradient(90deg, black, transparent)",
                }}
              />
            </div>
          }
          interior={
        <div className="mx-auto grid max-w-7xl items-center gap-12 px-5 pt-20 md:px-8 md:pt-24 lg:grid-cols-[1.08fr_0.92fr]">
          <motion.div
            initial={{ opacity: 0, y: 26 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            className="relative lg:pl-8"
          >
            <Cross className="-right-3 -top-3" />
            <Cross className="-bottom-3 -left-3" />
            <div className="mb-6 flex items-center gap-3">
              <span className="font-mono text-[9px] tracking-[0.24em]" style={{ color: GOLD }} dir="ltr">
                N° 01
              </span>
              <span className="h-px flex-1" style={{ background: HAIRLINE_SOFT }} />
              <span
                className="text-[9px] tracking-[0.32em] text-white/35"
                {...editsFor("businessInfo.category")}
              >
                {b.category}
              </span>
            </div>
            <h1
              className="text-[clamp(2.7rem,5.6vw,5.1rem)] font-light leading-[1.08]"
              style={{
                fontFamily: "'Frank Ruhl Libre', serif",
                letterSpacing: "-0.03em",
                color: primary,
              }}
              {...editsFor("hero.headline")}
            >
              <EditorialHeadline text={hero.headline} />
            </h1>
            <p
              className="mt-7 max-w-xl text-[13px] leading-[2] text-white/44"
              {...editsFor("hero.subheadline")}
            >
              {hero.subheadline}
            </p>

            <div className="mt-9 flex flex-wrap items-center gap-6">
              <Magnetic strength={0.24}>
                <a
                  href={bookingHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center gap-3 border px-6 py-3.5 text-[11px] tracking-[0.18em] transition-colors hover:bg-white/[0.04]"
                  style={{ borderColor: HAIRLINE, color: primary }}
                >
                  {hero.ctaText}
                  <span className="transition-transform group-hover:-translate-x-1" style={{ color: accent }} aria-hidden="true">
                    ←
                  </span>
                </a>
              </Magnetic>
              <span className="text-[10px] tracking-[0.12em] text-white/28">
                {b.openingHours}
              </span>
            </div>

            <div className="mt-12 grid max-w-xl grid-cols-3 border-t pt-5" style={{ borderColor: HAIRLINE_SOFT }}>
              {CALIBRES.map((calibre) => (
                <div key={calibre.code} className="border-l pl-3 first:border-l-0 first:pl-0" style={{ borderColor: HAIRLINE_SOFT }}>
                  <p className="text-[7.5px] tracking-[0.26em] text-white/25" dir="ltr">
                    {calibre.code}
                  </p>
                  <p className="mt-1.5 text-xl font-light text-[#f4efe6]" dir="ltr" style={{ fontFamily: "'Frank Ruhl Libre', serif" }}>
                    {calibre.value}
                  </p>
                  <p className="mt-0.5 text-[9px] text-white/30">{calibre.label}</p>
                </div>
              ))}
            </div>
          </motion.div>

          {/* rotating mechanical bezel framing the hero photograph */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1.1, delay: 0.1 }}
            className="relative mx-auto aspect-square w-full max-w-[560px]"
          >
            <div
              aria-hidden="true"
              className="absolute inset-0 rounded-full"
              style={{
                background:
                  "radial-gradient(circle at 50% 50%, rgba(212,175,55,0.08), transparent 62%)",
              }}
            />
            <svg
              viewBox="0 0 600 600"
              className="absolute inset-0 h-full w-full"
              aria-hidden="true"
              style={{ animation: "bezel-rotate 110s linear infinite" }}
            >
              <g fill="none" stroke={GOLD}>
                <circle cx="300" cy="300" r="286" strokeOpacity="0.34" />
                <circle cx="300" cy="300" r="270" strokeOpacity="0.16" />
                <circle cx="300" cy="300" r="268" strokeOpacity="0.4" strokeDasharray="1 7" />
                <circle cx="300" cy="300" r="222" strokeOpacity="0.18" />
              </g>
              <g stroke={GOLD} strokeWidth="1">
                {Array.from({ length: 72 }).map((_, i) => {
                  const major = i % 6 === 0;
                  return (
                    <line
                      key={i}
                      x1="300"
                      y1={major ? 30 : 34}
                      x2="300"
                      y2={major ? 48 : 42}
                      strokeOpacity={major ? 0.62 : 0.24}
                      transform={`rotate(${i * 5} 300 300)`}
                    />
                  );
                })}
              </g>
              <g fill={GOLD} fontFamily="monospace" fontSize="10" textAnchor="middle">
                {ROMAN.map((numeral, i) => (
                  <text
                    key={numeral}
                    x="300"
                    y="72"
                    opacity="0.65"
                    transform={`rotate(${i * 30} 300 300)`}
                  >
                    {numeral}
                  </text>
                ))}
              </g>
            </svg>

            <div
              className="absolute inset-[17%] overflow-hidden rounded-full border"
              style={{ borderColor: HAIRLINE }}
            >
              {hero.backgroundImage ? (
                <>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={hero.backgroundImage}
                    alt=""
                    className="h-full w-full object-cover"
                    style={{ filter: "saturate(0.6) brightness(0.68) contrast(1.08)" }}
                  />
                  <div
                    aria-hidden="true"
                    className="absolute inset-0"
                    style={{
                      background:
                        "radial-gradient(circle at 50% 40%, transparent 20%, rgba(6,8,15,0.72) 100%)",
                    }}
                  />
                </>
              ) : (
                <div className="flex h-full w-full items-center justify-center bg-[#080b14]">
                  <span className="font-mono text-[9px] tracking-[0.36em] text-white/25" dir="ltr">
                    MAISON VIEW
                  </span>
                </div>
              )}
            </div>

            {/* fixed gold pointer */}
            <span
              className="absolute left-1/2 top-[6.5%] z-10 -translate-x-1/2"
              aria-hidden="true"
              style={{ color: accent }}
            >
              <svg width="16" height="22" viewBox="0 0 16 22">
                <path d="M8 21 L1 2 L15 2 Z" fill="currentColor" />
              </svg>
            </span>

            <div className="absolute inset-x-[17%] bottom-[24%] text-center">
              <p className="font-mono text-[8px] tracking-[0.4em] text-white/45" dir="ltr">
                MECHANICAL CHRONOGRAPH
              </p>
              <p className="mt-2 text-lg font-light text-[#f4efe6]" style={{ fontFamily: "'Frank Ruhl Libre', serif" }}>
                {b.name}
              </p>
            </div>

            <Cross className="right-1 top-1" />
            <Cross className="bottom-1 left-1" />
          </motion.div>
        </div>
          }
        />
      </section>

      {/* ---------------- interactive chronograph dial ---------------- */}
      <section id="calibre" className="relative z-10 mx-auto mt-24 max-w-7xl border-y px-5 py-16 md:px-8 md:py-24" style={{ borderColor: HAIRLINE_SOFT }}>
        <div className="mb-10 flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="font-mono text-[9px] tracking-[0.36em]" style={{ color: GOLD }} dir="ltr">
              COLLECTION / N° 02
            </p>
            <h2
              className="mt-3 text-3xl font-light md:text-4xl"
              style={{ fontFamily: "'Frank Ruhl Libre', serif", color: primary }}
            >
              קליבר לכל אוסף
            </h2>
          </div>
          <p className="max-w-sm text-[11px] leading-[1.9] text-white/34">
            סובבו את החוגה המכנית ובחרו את השירות. כל תחנה על הבזל מציגה מפרט,
            לוח זמנים ואחריות משל עצמה.
          </p>
        </div>

        <div className="grid items-center gap-12 lg:grid-cols-[1fr_0.92fr]">
          {/* dial */}
          <div className="relative mx-auto aspect-square w-full max-w-[600px]">
            <div
              aria-hidden="true"
              className="absolute inset-[3%] rounded-full"
              style={{
                background:
                  "radial-gradient(circle at 50% 38%, rgba(212,175,55,0.12), rgba(6,8,15,0.9) 62%)",
                boxShadow:
                  "inset 0 1px 0 rgba(255,255,255,0.08), 0 40px 100px rgba(0,0,0,0.55)",
              }}
            />
            <svg viewBox="0 0 600 600" className="absolute inset-0 h-full w-full" aria-hidden="true">
              <g fill="none" stroke={GOLD}>
                <circle cx="300" cy="300" r="292" strokeOpacity="0.45" />
                <circle cx="300" cy="300" r="278" strokeOpacity="0.15" />
                <circle cx="300" cy="300" r="232" strokeOpacity="0.28" />
                <circle cx="300" cy="300" r="154" strokeOpacity="0.3" />
                <circle cx="300" cy="300" r="146" strokeOpacity="0.12" />
              </g>

              {/* mechanically rotating bezel */}
              <motion.g
                animate={{ rotate: -currentIdx * (360 / Math.max(count, 1)) }}
                transition={{ type: "spring", stiffness: 80, damping: 15 }}
                style={{ transformOrigin: "300px 300px", transformBox: "view-box" }}
              >
                <g stroke={GOLD}>
                  {Array.from({ length: 60 }).map((_, i) => (
                    <line
                      key={i}
                      x1="300"
                      y1={i % 5 === 0 ? 36 : 42}
                      x2="300"
                      y2={i % 5 === 0 ? 60 : 52}
                      strokeOpacity={i % 5 === 0 ? 0.65 : 0.22}
                      transform={`rotate(${i * 6} 300 300)`}
                    />
                  ))}
                </g>
                <g fill={GOLD} opacity="0.56" fontFamily="monospace" fontSize="9" textAnchor="middle">
                  {ROMAN.map((numeral, i) => (
                    <text
                      key={numeral}
                      x="300"
                      y="92"
                      transform={`rotate(${i * 30} 300 300)`}
                    >
                      {numeral}
                    </text>
                  ))}
                </g>
                <circle cx="300" cy="300" r="268" fill="none" stroke={GOLD} strokeOpacity="0.2" strokeDasharray="2 6" />
                <g transform="translate(300 34)">
                  <path d="M0 -12 L7 4 L-7 4 Z" fill={accent} />
                </g>
              </motion.g>

              {/* centre hub */}
              <circle cx="300" cy="300" r="132" fill="#070A13" stroke={GOLD} strokeOpacity="0.34" />
              <circle cx="300" cy="300" r="124" fill="none" stroke={GOLD} strokeOpacity="0.12" strokeDasharray="1 5" />
              <text x="300" y="268" textAnchor="middle" fill={GOLD} opacity="0.65" fontFamily="monospace" fontSize="11" letterSpacing="3">
                CALIBRE
              </text>
              <text x="300" y="324" textAnchor="middle" fill="#f4efe6" fontFamily="'Frank Ruhl Libre', serif" fontSize="56" fontWeight="300">
                {String(currentIdx + 1).padStart(2, "0")}
              </text>
              <text x="300" y="350" textAnchor="middle" fill="rgba(244,239,230,0.35)" fontFamily="monospace" fontSize="9" letterSpacing="2">
                / {String(count).padStart(2, "0")}
              </text>
            </svg>

            {/* clickable bezel positions */}
            {dialServices.map((service, i) => {
              const angle = (-90 + (360 / count) * i) * (Math.PI / 180);
              const left = 50 + Math.cos(angle) * 43;
              const top = 50 + Math.sin(angle) * 43;
              const selected = i === currentIdx;
              return (
                <button
                  key={i}
                  type="button"
                  onClick={() => setActiveIdx(i)}
                  aria-pressed={selected}
                  className="absolute z-10 -translate-x-1/2 -translate-y-1/2 border px-3 py-2 text-center backdrop-blur-sm transition-all"
                  style={{
                    left: `${left}%`,
                    top: `${top}%`,
                    minWidth: 90,
                    borderColor: selected ? accent : "rgba(212,175,55,0.2)",
                    background: selected ? "rgba(212,175,55,0.12)" : "rgba(6,8,15,0.74)",
                    color: selected ? "#fff6d9" : "rgba(244,239,230,0.52)",
                    boxShadow: selected ? `0 0 30px color-mix(in srgb, ${accent} 20%, transparent)` : "none",
                  }}
                >
                  <span className="block font-mono text-[7.5px] tracking-[0.24em]" style={{ color: selected ? accent : "rgba(212,175,55,0.5)" }}>
                    {ROMAN[i % ROMAN.length]} · {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="mt-1 block max-w-[110px] truncate text-[9.5px] font-medium">
                    {service.title}
                  </span>
                </button>
              );
            })}
          </div>

          {/* detail ledger */}
          <div className="border p-6 md:p-8" style={{ borderColor: HAIRLINE }} aria-live="polite">
            <div className="flex items-center justify-between border-b pb-3" style={{ borderColor: HAIRLINE_SOFT }}>
              <span className="font-mono text-[8.5px] tracking-[0.3em]" style={{ color: GOLD }} dir="ltr">
                SPECIFICATION / {String(currentIdx + 1).padStart(2, "0")}
              </span>
              <span className="flex items-center gap-2 font-mono text-[8.5px] tracking-[0.2em] text-white/30">
                <span className="h-1 w-1 rounded-full" style={{ background: accent }} />
                IN STOCK
              </span>
            </div>

            <AnimatePresence mode="wait">
              <motion.div
                key={currentIdx}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.28 }}
              >
                <p className="mt-6 font-mono text-[8.5px] tracking-[0.26em] text-white/25" dir="ltr">
                  {ROMAN[currentIdx % ROMAN.length]} — COLLECTION
                </p>
                <h3
                  className="mt-2 text-3xl font-light leading-[1.2]"
                  style={{ fontFamily: "'Frank Ruhl Libre', serif", color: primary }}
                  {...editsFor(`services.${Math.min(currentIdx, Math.max(services.length - 1, 0))}.title`)}
                >
                  {active?.title}
                </h3>
                <p
                  className="mt-4 text-[12.5px] leading-[2] text-white/42"
                  {...editsFor(`services.${Math.min(currentIdx, Math.max(services.length - 1, 0))}.description`)}
                >
                  {active?.description}
                </p>

                <div className="mt-6 grid grid-cols-3 border-y py-4" style={{ borderColor: HAIRLINE_SOFT }}>
                  <div>
                    <p className="text-[7.5px] tracking-[0.24em] text-white/25">TIMELINE</p>
                    <p className="mt-1 text-[11px] text-white/72">72 שעות תכנון</p>
                  </div>
                  <div className="border-r pr-3" style={{ borderColor: HAIRLINE_SOFT }}>
                    <p className="text-[7.5px] tracking-[0.24em] text-white/25">WARRANTY</p>
                    <p className="mt-1 text-[11px] text-white/72">5 שנים</p>
                  </div>
                  <div className="border-r pr-3" style={{ borderColor: HAIRLINE_SOFT }}>
                    <p className="text-[7.5px] tracking-[0.24em] text-white/25">FINISH</p>
                    <p className="mt-1 text-[11px] text-white/72">Champagne</p>
                  </div>
                </div>

                <div className="mt-6 flex flex-wrap items-end justify-between gap-4">
                  <div>
                    <p className="text-[7.5px] tracking-[0.26em] text-white/25">INVESTMENT FROM</p>
                    <p
                      className="mt-1 text-3xl font-light"
                      style={{ fontFamily: "'Frank Ruhl Libre', serif", color: primary }}
                      dir="ltr"
                      {...editsFor(`services.${Math.min(currentIdx, Math.max(services.length - 1, 0))}.price`)}
                    >
                      {activePrice ? formatNis(activePrice) : active?.price ?? "בהתאמה"}
                    </p>
                  </div>
                  <a
                    href={bookingHref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="border px-5 py-3 text-[10px] tracking-[0.18em] transition-colors hover:bg-white/[0.05]"
                    style={{ borderColor: HAIRLINE, color: primary }}
                  >
                    תיאום צפייה VIP
                  </a>
                </div>
              </motion.div>
            </AnimatePresence>

            <div className="mt-7 flex items-center justify-between border-t pt-4" style={{ borderColor: HAIRLINE_SOFT }}>
              <button
                type="button"
                onClick={() => setActiveIdx((index) => (index - 1 + count) % count)}
                className="flex items-center gap-2 text-[9px] tracking-[0.2em] text-white/38 transition hover:text-white/80"
              >
                <span aria-hidden="true">→</span> הקודם
              </button>
              <span className="flex gap-1.5">
                {dialServices.map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setActiveIdx(i)}
                    aria-label={`קליבר ${i + 1}`}
                    className="h-1 w-5 transition-colors"
                    style={{ background: i === currentIdx ? accent : "rgba(212,175,55,0.18)" }}
                  />
                ))}
              </span>
              <button
                type="button"
                onClick={() => setActiveIdx((index) => (index + 1) % count)}
                className="flex items-center gap-2 text-[9px] tracking-[0.2em] text-white/38 transition hover:text-white/80"
              >
                הבא <span aria-hidden="true">←</span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ---------------- warranty tiers ledger ---------------- */}
      <section className="relative z-10 mx-auto max-w-7xl px-5 py-20 md:px-8">
        <div className="mb-8 flex items-end justify-between border-b pb-3" style={{ borderColor: HAIRLINE_SOFT }}>
          <h2 className="text-2xl font-light md:text-3xl" style={{ fontFamily: "'Frank Ruhl Libre', serif", color: primary }}>
            דרגות שירות
          </h2>
          <span className="font-mono text-[8.5px] tracking-[0.3em]" style={{ color: GOLD }} dir="ltr">
            SERVICE TIERS / III
          </span>
        </div>
        <div className="grid md:grid-cols-3">
          {TIERS.map((tier, i) => (
            <article
              key={tier.name}
              className={`relative px-6 py-8 md:px-8 ${i > 0 ? "border-t md:border-r md:border-t-0" : ""}`}
              style={{ borderColor: HAIRLINE_SOFT }}
            >
              <Cross className="right-3 top-3" />
              <div className="flex items-baseline justify-between">
                <span className="font-mono text-3xl font-light" style={{ color: GOLD }}>
                  {tier.roman}
                </span>
                <span className="text-[8px] tracking-[0.28em] text-white/25" dir="ltr">
                  TIER 0{i + 1}
                </span>
              </div>
              <h3 className="mt-5 text-xl font-light" style={{ fontFamily: "'Frank Ruhl Libre', serif", color: primary }}>
                {tier.name}
                <span className="mr-2 text-[11px] text-white/35">{tier.he}</span>
              </h3>
              <p className="mt-3 text-[11.5px] leading-[1.9] text-white/38">{tier.body}</p>
              <p className="mt-6 border-t pt-3 text-[9px] tracking-[0.18em]" style={{ borderColor: HAIRLINE_SOFT, color: GOLD }}>
                {tier.cover}
              </p>
            </article>
          ))}
        </div>
      </section>

      {/* ---------------- movement timeline ---------------- */}
      <section id="archive" className="relative z-10 border-y" style={{ borderColor: HAIRLINE_SOFT }}>
        <div className="mx-auto grid max-w-7xl gap-10 px-5 py-16 md:grid-cols-[0.8fr_1.2fr] md:px-8 md:py-24">
          <div className="md:sticky md:top-40 md:self-start">
            <p className="font-mono text-[9px] tracking-[0.36em]" style={{ color: GOLD }} dir="ltr">
              THE MOVEMENT / N° 03
            </p>
            <h2
              className="mt-4 text-3xl font-light leading-[1.25] md:text-4xl"
              style={{ fontFamily: "'Frank Ruhl Libre', serif", color: primary }}
            >
              מדויק כמו
              <br />
              מנגנון.
            </h2>
            <p className="mt-5 max-w-xs text-[11.5px] leading-[1.95] text-white/34">
              {b.description}
            </p>
            <div className="mt-8 flex items-center gap-3">
              <span className="h-px w-10" style={{ background: HAIRLINE }} />
              <span className="font-mono text-[8.5px] tracking-[0.28em] text-white/28" dir="ltr">
                {b.googleRating.toFixed(1)} / 5 · {b.reviewsCount} REVIEWS
              </span>
            </div>
          </div>

          <div>
            {movementSteps.slice(0, 4).map((step, i) => (
              <motion.div
                key={`${step.title}-${i}`}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.6, delay: i * 0.05 }}
                className="grid grid-cols-[2.5rem_1fr_auto] items-baseline gap-4 border-t py-6"
                style={{ borderColor: HAIRLINE_SOFT }}
              >
                <span className="font-mono text-[10px]" style={{ color: GOLD }}>
                  {ROMAN[i % ROMAN.length]}
                </span>
                <div>
                  <h3 className="text-lg font-light" style={{ fontFamily: "'Frank Ruhl Libre', serif", color: primary }}>
                    {step.title}
                  </h3>
                  <p className="mt-1.5 max-w-xl text-[11.5px] leading-[1.9] text-white/36">{step.description}</p>
                </div>
                <span className="font-mono text-[7.5px] tracking-[0.24em] text-white/22" dir="ltr">
                  PHASE 0{i + 1}
                </span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------- archive photographs ---------------- */}
      {projects.length > 0 && (
        <section className="relative z-10 mx-auto max-w-7xl px-5 py-16 md:px-8 md:py-24">
          <div className="mb-8 flex items-end justify-between">
            <h2 className="text-2xl font-light md:text-3xl" style={{ fontFamily: "'Frank Ruhl Libre', serif", color: primary }}>
              ארכיון הבית
            </h2>
            <span className="font-mono text-[8.5px] tracking-[0.3em]" style={{ color: GOLD }} dir="ltr">
              PRIVATE ARCHIVE
            </span>
          </div>
          <div className="grid gap-5 md:grid-cols-12">
            {projects.slice(0, 3).map((project, i) => (
              <figure
                key={i}
                className={`relative border p-2 ${
                  i === 0 ? "md:col-span-7" : "md:col-span-5"
                }`}
                style={{ borderColor: HAIRLINE_SOFT }}
              >
                <Cross className="right-1 top-1" />
                <Cross className="bottom-1 left-1" />
                {project.afterImage && (
                  <div className="relative h-[32vh] overflow-hidden md:h-[42vh]">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={project.afterImage}
                      alt={project.title}
                      loading="lazy"
                      className="h-full w-full object-cover"
                      style={{ filter: "saturate(0.62) brightness(0.78) contrast(1.05)" }}
                    />
                    <div
                      aria-hidden="true"
                      className="absolute inset-0"
                      style={{
                        background:
                          "linear-gradient(180deg, rgba(6,8,15,0.12), rgba(6,8,15,0.78))",
                      }}
                    />
                  </div>
                )}
                <figcaption className="flex items-baseline justify-between gap-3 px-3 py-3">
                  <span className="text-[13px] font-light text-white/75" style={{ fontFamily: "'Frank Ruhl Libre', serif" }}>
                    {project.title}
                  </span>
                  <span className="font-mono text-[8px] tracking-[0.24em]" style={{ color: GOLD }} dir="ltr">
                    PLATE {String(i + 1).padStart(2, "0")}
                  </span>
                </figcaption>
              </figure>
            ))}
          </div>
        </section>
      )}

      {/* ---------------- reviews ---------------- */}
      <section id="maison" className="relative z-10 border-t px-5 py-16 md:px-8 md:py-24" style={{ borderColor: HAIRLINE_SOFT }}>
        <div className="mx-auto max-w-7xl">
          <div className="mb-8 flex flex-wrap items-center justify-between gap-3">
            <span className="font-mono text-[9px] tracking-[0.36em]" style={{ color: GOLD }} dir="ltr">
              CERTIFICATES / N° 04
            </span>
            <span className="flex items-center gap-3 text-[10px] text-white/38">
              {b.googleRating.toFixed(1)} / 5
              <RatingBars rating={b.googleRating} color={GOLD} />
            </span>
          </div>
          <div className="grid gap-px md:grid-cols-3" style={{ background: HAIRLINE_SOFT }}>
            {reviews.slice(0, 3).map((review, i) => (
              <figure key={i} className="relative bg-[#06080F] p-7">
                <span className="font-mono text-[8px] tracking-[0.26em]" style={{ color: GOLD }} dir="ltr">
                  CERT. 0{i + 1}
                </span>
                <blockquote
                  className="mt-4 text-[14px] font-light leading-[1.9] text-white/64"
                  style={{ fontFamily: "'Frank Ruhl Libre', serif" }}
                  {...editsFor(`reviews.${i}.text`)}
                >
                  “{review.text}”
                </blockquote>
                <figcaption className="mt-6 flex items-center justify-between border-t pt-4 text-[9px] tracking-[0.2em] text-white/32" style={{ borderColor: HAIRLINE_SOFT }}>
                  <span {...editsFor(`reviews.${i}.author`)}>{review.author}</span>
                  <span dir="ltr">{review.rating}.0 / 5</span>
                </figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------- FAQ + private viewing ---------------- */}
      <section className="relative z-10 mx-auto max-w-7xl px-5 pb-20 pt-16 md:px-8">
        <div className="grid gap-12 lg:grid-cols-[1fr_1.2fr]">
          <div>
            <p className="font-mono text-[9px] tracking-[0.36em]" style={{ color: GOLD }} dir="ltr">
              ENQUIRIES / N° 05
            </p>
            <h2 className="mt-4 text-2xl font-light md:text-3xl" style={{ fontFamily: "'Frank Ruhl Libre', serif", color: primary }}>
              שאלות לפני
              <br />
              הצפייה הפרטית.
            </h2>
            <p className="mt-4 max-w-xs text-[11.5px] leading-[1.9] text-white/34">
              {b.address} · {b.openingHours}
            </p>
            <a
              href={bookingHref}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-7 inline-flex items-center gap-3 border px-5 py-3 text-[10px] tracking-[0.18em] transition hover:bg-white/[0.04]"
              style={{ borderColor: HAIRLINE, color: primary }}
            >
              תיאום צפייה פרטית
              <span style={{ color: accent }} aria-hidden="true">←</span>
            </a>
          </div>
          <FaqAccordion
            items={faq}
            classes={{
              card: "border-b",
              button: "flex w-full items-center justify-between gap-4 py-4 text-right text-[11.5px] text-white/72",
              icon: "h-3.5 w-3.5",
              answer: "pb-4 text-[11px] leading-[1.9] text-white/36",
            }}
          />
        </div>
      </section>

      <footer className="relative z-10 border-t px-5 py-10 text-center" style={{ borderColor: HAIRLINE }}>
        <p className="font-mono text-[8px] tracking-[0.4em]" style={{ color: GOLD }} dir="ltr">
          {b.name.toUpperCase()} · MAISON HORLOGÈRE · {city.toUpperCase()}
        </p>
        <p className="mt-4 text-[10px] tracking-[0.16em] text-white/30" dir="ltr">
          <a href={`tel:${b.phone}`} className="hover:text-white/70">{b.phone}</a>
        </p>
      </footer>
    </div>
  );
}
