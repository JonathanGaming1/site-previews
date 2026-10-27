"use client";

/**
 * 01 — FORGE DARK LUXURY ATELIER
 * ==============================
 * Zero native scrollbar. The viewport is locked (`fixed inset-0 w-screen
 * h-screen overflow-hidden`) and the mouse wheel / touch swipe feeds a spring
 * virtual progress value: the camera physically flies forward through 3D
 * Z-space, passing *through* the centerpiece and into the next room.
 *
 * Nothing on this stage is a normal scrolling page: no scrollbar, no flat
 * section stack, no icon-set clip art. HUD telemetry replaces the browser
 * scrubber, the whole 3D rig tilts live with the mouse, studio rim light
 * follows the cursor and the pointer itself is a magnetic precision ring.
 */

import React, { useState, useEffect, useRef } from "react";
import {
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  AnimatePresence,
} from "framer-motion";
import { useSite } from "@/components/SiteProvider";
import { waLink } from "@/templates/shared";
import { useLockedViewport } from "@/templates/wheel";

const FORGE_FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&w=1900&q=85";

export function ForgeAutomotiveTemplate() {
  const { data, editsFor } = useSite();
  const [menuOpen, setMenuOpen] = useState(false);
  const [selectedServiceIdx, setSelectedServiceIdx] = useState(0);
  const [selectedTier, setSelectedTier] = useState<
    "SIGNATURE" | "BESPOKE" | "RESERVE"
  >("BESPOKE");
  const [selectedTimeline, setSelectedTimeline] = useState<
    "STANDARD" | "PRIORITY" | "VIP"
  >("VIP");
  const [sliderPos, setSliderPos] = useState(50);
  const [activeScene, setActiveScene] = useState(0);

  useLockedViewport();

  const info: any = data?.businessInfo || {};
  const hero: any = data?.hero || {};
  const hasServices = Array.isArray(data?.services) && data.services.length > 0;
  const hasReviews = Array.isArray(data?.reviews) && data.reviews.length > 0;

  const services = hasServices
    ? data.services
    : [
        {
          title: "הנדסת מפרט עילית",
          description: "תכנון תלת-ממדי והתאמה מדויקת לדרישות הלקוח.",
          price: "בהתאמה אישית",
        },
        {
          title: "ביצוע בסטנדרט אטלייה",
          description: "חומרי גלם נדירים וגימור ידני מוקפד ללא פשרות.",
          price: "אחריות מלאה",
        },
        {
          title: "פרויקטים מיוחדים VIP",
          description: "ליווי אישי דיסקרטי מהסקיצה הראשונה ועד המסירה.",
          price: "מפרט שמור",
        },
        {
          title: "מעטפת שירות פרטית",
          description: "זמינות מלאה ובקרת איכות רב-שנתית.",
          price: "ליווי שנתי",
        },
      ];
  const reviews = hasReviews ? data.reviews : [];

  const serviceEdits = (index: number, field: "title" | "description") =>
    hasServices ? editsFor(`services.${index}.${field}`) : {};
  const reviewEdits = (index: number, field: "text") =>
    hasReviews ? editsFor(`reviews.${index}.${field}`) : {};

  const whatsappNumber = String(
    info.whatsapp || String(info.phone || "").replace(/\D/g, "").replace(/^0/, "972"),
  ).replace(/\D/g, "");
  const whatsappLink = whatsappNumber ? `https://wa.me/${whatsappNumber}` : "#";

  const heroImg = hero.backgroundImage || FORGE_FALLBACK_IMAGE;

  // =========================================================================
  // 1. VIRTUAL 3D CAMERA WHEEL ENGINE (NO NATIVE SCROLLBAR - LIKE FORGE)
  // =========================================================================
  const rawProgress = useMotionValue(0); // 0 to 1 across 5 3D scenes
  const smoothProgress = useSpring(rawProgress, {
    stiffness: 55,
    damping: 20,
    mass: 0.9,
  });

  const touchStartY = useRef(0);

  useEffect(() => {
    const unsub = smoothProgress.on("change", (v) => {
      const idx = Math.min(4, Math.max(0, Math.round(v * 4)));
      setActiveScene(idx);
    });
    return () => unsub();
  }, [smoothProgress]);

  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      if (menuOpen) return;
      e.preventDefault();
      const unit = e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? 100 : 1;
      const delta = e.deltaY * unit * 0.00045;
      const next = Math.min(1, Math.max(0, rawProgress.get() + delta));
      rawProgress.set(next);
    };

    const handleTouchStart = (e: TouchEvent) => {
      touchStartY.current = e.touches[0]?.clientY || 0;
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (menuOpen) return;
      const currentY = e.touches[0]?.clientY || 0;
      const diff = (touchStartY.current - currentY) * 0.0012;
      touchStartY.current = currentY;
      const next = Math.min(1, Math.max(0, rawProgress.get() + diff));
      rawProgress.set(next);
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (menuOpen) return;
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.isContentEditable ||
          /^(INPUT|TEXTAREA|SELECT)$/.test(target.tagName))
      ) {
        return;
      }
      if (e.key === "ArrowDown" || e.key === "PageDown") {
        rawProgress.set(Math.min(1, rawProgress.get() + 0.25));
      } else if (e.key === "ArrowUp" || e.key === "PageUp") {
        rawProgress.set(Math.max(0, rawProgress.get() - 0.25));
      }
    };

    window.addEventListener("wheel", handleWheel, { passive: false });
    window.addEventListener("touchstart", handleTouchStart, { passive: true });
    window.addEventListener("touchmove", handleTouchMove, { passive: true });
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      window.removeEventListener("wheel", handleWheel);
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [menuOpen, rawProgress]);

  function jumpToScene(sceneIndex: number) {
    rawProgress.set(sceneIndex / 4);
  }

  // =========================================================================
  // 2. LIVE 3D MOUSE PARALLAX & CUSTOM CURSOR RIG
  // =========================================================================
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const cursorX = useSpring(useMotionValue(-100), { stiffness: 400, damping: 28 });
  const cursorY = useSpring(useMotionValue(-100), { stiffness: 400, damping: 28 });

  const rigRotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [7, -7]), {
    stiffness: 85,
    damping: 22,
  });
  const rigRotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-10, 10]), {
    stiffness: 85,
    damping: 22,
  });
  const lightX = useSpring(useTransform(mouseX, [-0.5, 0.5], [15, 85]), {
    stiffness: 70,
    damping: 20,
  });
  const lightY = useSpring(useTransform(mouseY, [-0.5, 0.5], [15, 85]), {
    stiffness: 70,
    damping: 20,
  });

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      mouseX.set(e.clientX / window.innerWidth - 0.5);
      mouseY.set(e.clientY / window.innerHeight - 0.5);
      cursorX.set(e.clientX);
      cursorY.set(e.clientY);
    };
    window.addEventListener("mousemove", onMove, { passive: true });
    return () => window.removeEventListener("mousemove", onMove);
  }, [mouseX, mouseY, cursorX, cursorY]);

  // =========================================================================
  // 3. 3D Z-SPACE SCENE TRANSFORMS (CAMERA FLIES THROUGH EACH SCENE)
  // =========================================================================
  // SCENE 01: FORGE HERO STAGE (0.00 -> 0.25)
  const s1Scale = useTransform(smoothProgress, [0, 0.22, 0.3], [1, 2.6, 4.2]);
  const s1Opacity = useTransform(smoothProgress, [0, 0.18, 0.26], [1, 0.7, 0]);
  const s1Z = useTransform(smoothProgress, [0, 0.28], [0, 700]);
  const s1Pointer = activeScene === 0 ? "auto" : "none";

  // SCENE 02: 3D MONOLITH SHOWROOM (0.20 -> 0.50)
  const s2Scale = useTransform(smoothProgress, [0.14, 0.25, 0.42, 0.52], [0.45, 1, 1, 2.4]);
  const s2Opacity = useTransform(smoothProgress, [0.16, 0.24, 0.42, 0.5], [0, 1, 1, 0]);
  const s2Pointer = activeScene === 1 ? "auto" : "none";

  // SCENE 03: BESPOKE 3-STAGE CONFIGURATOR (0.45 -> 0.75)
  const s3Scale = useTransform(smoothProgress, [0.4, 0.5, 0.67, 0.77], [0.5, 1, 1, 2.3]);
  const s3Opacity = useTransform(smoothProgress, [0.42, 0.5, 0.67, 0.75], [0, 1, 1, 0]);
  const s3Pointer = activeScene === 2 ? "auto" : "none";

  // SCENE 04: PRECISION SPLIT STUDIO SLIDER (0.70 -> 0.92)
  const s4Scale = useTransform(smoothProgress, [0.65, 0.75, 0.88, 0.96], [0.5, 1, 1, 2.2]);
  const s4Opacity = useTransform(smoothProgress, [0.67, 0.75, 0.88, 0.95], [0, 1, 1, 0]);
  const s4Pointer = activeScene === 3 ? "auto" : "none";

  // SCENE 05: PRIVATE VAULT & DIRECT DISPATCH (0.88 -> 1.00)
  const s5Scale = useTransform(smoothProgress, [0.84, 0.94, 1], [0.55, 1, 1]);
  const s5Opacity = useTransform(smoothProgress, [0.86, 0.94, 1], [0, 1, 1]);
  const s5Pointer = activeScene === 4 ? "auto" : "none";

  const zDepthReadout = useTransform(smoothProgress, (v) =>
    `Z // -${String(Math.round(v * 4800)).padStart(4, "0")}MM`,
  );

  const specMessage =
    `היי ${info.name || ""}, בניתי מפרט באתר:\n` +
    `• מערכת: ${services[selectedServiceIdx]?.title || ""}\n` +
    `• רמת גימור: ${selectedTier}\n` +
    `• דחיפות: ${selectedTimeline}`;

  const scenesList = [
    { id: 0, code: "01", label: "SHOWROOM" },
    { id: 1, code: "02", label: "CRAFT" },
    { id: 2, code: "03", label: "CONFIGURE" },
    { id: 3, code: "04", label: "PRECISION" },
    { id: 4, code: "05", label: "COMMISSION" },
  ];

  return (
    <div
      dir="rtl"
      data-camera-engine="true"
      className="camera-cursor-hidden fixed inset-0 h-screen w-screen select-none overflow-hidden bg-[#030303] font-heebo text-[#F5F5F3]"
    >
      {/* סמן עכבר מגנטי תלת-ממדי */}
      <motion.div
        style={{ x: cursorX, y: cursorY }}
        className="pointer-events-none fixed top-0 left-0 z-50 hidden md:flex -translate-x-1/2 -translate-y-1/2 items-center justify-center"
      >
        <div className="w-9 h-9 rounded-full border border-white/25 flex items-center justify-center backdrop-blur-[2px]">
          <div className="w-1 h-1 rounded-full bg-[#C59B27]" />
        </div>
      </motion.div>

      {/* אלומת תאורת סטודיו חיה שעוקבת אחרי העכבר */}
      <motion.div
        className="pointer-events-none absolute inset-0 z-0"
        style={{
          background: useTransform(
            [lightX, lightY],
            ([lx, ly]: number[]) =>
              `radial-gradient(750px circle at ${lx}% ${ly}%, rgba(255,255,255,0.075), rgba(197,155,39,0.03) 42%, transparent 75%)`,
          ),
        }}
      />

      {/* תפריט מסך מלא (NAVIGATE =) */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, clipPath: "inset(0 0 100% 0)" }}
            animate={{ opacity: 1, clipPath: "inset(0 0 0% 0)" }}
            exit={{ opacity: 0, clipPath: "inset(0 0 100% 0)" }}
            transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-0 z-50 bg-[#040404]/98 backdrop-blur-2xl flex flex-col justify-between p-8 md:p-16"
          >
            <div className="flex items-center justify-between border-b border-white/10 pb-6">
              <span className="text-[11px] font-mono tracking-[0.35em] text-white/40 uppercase">
                {info.name || "FORGE ATELIER"}
              </span>
              <button
                onClick={() => setMenuOpen(false)}
                className="text-xs tracking-[0.3em] uppercase text-white/75 hover:text-white"
              >
                סגור [×]
              </button>
            </div>

            <div className="my-auto space-y-5 max-w-2xl">
              {scenesList.map((s) => (
                <button
                  key={s.id}
                  onClick={() => {
                    jumpToScene(s.id);
                    setMenuOpen(false);
                  }}
                  className="w-full text-right group flex items-baseline gap-6 border-b border-white/[0.07] pb-4 hover:border-[#C59B27] transition-all"
                >
                  <span className="font-mono text-xs text-[#C59B27]">{s.code}</span>
                  <span className="font-frank text-3xl md:text-5xl font-light text-white group-hover:-translate-x-3 transition-transform">
                    {s.label}
                  </span>
                </button>
              ))}
            </div>

            <div className="flex items-center justify-between text-xs text-white/40 border-t border-white/10 pt-6">
              <span>{info.phone}</span>
              <span>{info.address}</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* =====================================================================
          HEADER עליון מינימליסטי בסגנון FORGE AUTOMOTIVE
         ===================================================================== */}
      <header className="fixed top-0 inset-x-0 z-40 px-6 md:px-14 py-7 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <a
            href={whatsappLink}
            target="_blank"
            rel="noreferrer"
            className="text-[11px] font-mono tracking-[0.25em] uppercase text-white/60 hover:text-white transition-colors"
          >
            WHATSAPP
          </a>
          {info.phone && (
            <a
              href={`tel:${info.phone}`}
              className="hidden sm:inline-block text-[11px] font-mono tracking-[0.2em] text-white/45 hover:text-white transition-colors"
            >
              {info.phone}
            </a>
          )}
        </div>

        <button
          onClick={() => jumpToScene(0)}
          className="flex flex-col items-center group"
        >
          <svg width="28" height="16" viewBox="0 0 28 16" fill="none" className="mb-1.5">
            <path d="M14 0L27 16H20.5L14 8L7.5 16H1L14 0Z" fill="white" />
          </svg>
          <span className="text-[10px] tracking-[0.4em] uppercase text-white/90">
            {info.name || "FORGE"}
          </span>
        </button>

        <button
          onClick={() => setMenuOpen(true)}
          className="flex items-center gap-3 text-[11px] font-mono tracking-[0.28em] uppercase text-white/75 hover:text-white"
        >
          <span>NAVIGATE</span>
          <span className="flex flex-col gap-1.5 w-5">
            <span className="w-full h-[1px] bg-white" />
            <span className="w-2/3 h-[1px] bg-[#C59B27] mr-auto" />
          </span>
        </button>
      </header>

      {/* =====================================================================
          מחוון גלילה עתידני בצד המסך (HUD TELEMETRY SCRUBBER - במקום גלגלת רגילה!)
         ===================================================================== */}
      <aside className="fixed left-6 md:left-10 top-1/2 -translate-y-1/2 z-40 hidden sm:flex flex-col items-center gap-4">
        <motion.span className="text-[9px] font-mono tracking-[0.25em] text-white/35 [writing-mode:vertical-rl] mb-2">
          {zDepthReadout}
        </motion.span>

        <div className="flex items-center gap-2">
          <div className="relative h-44 w-4">
            {Array.from({ length: 21 }, (_, index) => index * 5).map((top, index) => (
              <span
                key={top}
                className="absolute right-0 block h-px"
                style={{
                  top: `${top}%`,
                  width: index % 5 === 0 ? 12 : 5,
                  background:
                    index % 5 === 0
                      ? "rgba(255,255,255,0.4)"
                      : "rgba(255,255,255,0.16)",
                }}
              />
            ))}
          </div>

          <div className="relative h-44 w-[1px] bg-white/15 overflow-hidden">
            <motion.div
              style={{ scaleY: smoothProgress, transformOrigin: "top" }}
              className="w-full h-full bg-[#C59B27]"
            />
          </div>
        </div>

        <div className="flex flex-col gap-2.5 mt-2">
          {scenesList.map((s) => (
            <button
              key={s.id}
              onClick={() => jumpToScene(s.id)}
              className="group flex items-center gap-2"
              title={s.label}
            >
              <span
                className={`text-[9px] font-mono transition-all ${
                  activeScene === s.id
                    ? "text-[#C59B27] scale-110"
                    : "text-white/25 group-hover:text-white/60"
                }`}
              >
                {s.code}
              </span>
            </button>
          ))}
        </div>
      </aside>

      {/* סרגל תחתון של פרקים + חיווי גלגלת */}
      <div className="fixed bottom-6 inset-x-6 md:inset-x-14 z-40 flex items-center justify-between pointer-events-none">
        <div className="pointer-events-auto flex items-center gap-4 bg-black/60 backdrop-blur-md border border-white/10 px-4 py-2">
          {scenesList.map((s) => (
            <button
              key={s.id}
              onClick={() => jumpToScene(s.id)}
              className={`text-[10px] font-mono tracking-[0.2em] uppercase transition-colors ${
                activeScene === s.id ? "text-[#C59B27]" : "text-white/35 hover:text-white/75"
              }`}
            >
              {s.code}
            </button>
          ))}
        </div>

        <div className="text-[10px] font-mono tracking-[0.28em] text-white/40 uppercase">
          סובב גלגלת לטיסה בעומק החלל [3D SCROLL]
        </div>
      </div>

      {/* =====================================================================
          במת ה-3D המרכזית (5 סצנות תלת-ממדיות שנכנסות אחת לתוך השנייה!)
         ===================================================================== */}
      <motion.main
        style={{
          rotateX: rigRotateX,
          rotateY: rigRotateY,
          transformStyle: "preserve-3d",
          perspective: "1400px",
        }}
        className="relative w-full h-full flex items-center justify-center"
      >
        {/* -----------------------------------------------------------------
            SCENE 01: FORGE HERO SHOWROOM (כמו בצילום המסך של FORGE AUTOMOTIVE)
           ----------------------------------------------------------------- */}
        <motion.section
          style={{
            scale: s1Scale,
            opacity: s1Opacity,
            z: s1Z,
            pointerEvents: s1Pointer as any,
          }}
          className="absolute inset-0 flex flex-col items-center justify-center px-6"
        >
          <div className="text-center mb-3 md:mb-5 max-w-3xl mx-auto">
            <h1
              className="font-frank font-light text-4xl sm:text-6xl md:text-[5.2rem] leading-[1.06] tracking-tight text-white"
              {...editsFor("hero.headline")}
            >
              {hero.headline || info.name || "למי שמסרב לסטנדרט רגיל"}
            </h1>
          </div>

          <div className="relative w-full max-w-5xl aspect-[16/8] flex items-center justify-center">
            <div
              className="w-full h-full relative overflow-hidden"
              style={{
                WebkitMaskImage:
                  "radial-gradient(ellipse 76% 66% at 50% 50%, #000 42%, transparent 96%)",
                maskImage:
                  "radial-gradient(ellipse 76% 66% at 50% 50%, #000 42%, transparent 96%)",
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={heroImg}
                alt={info.name || "Hero"}
                className="w-full h-full object-cover object-center contrast-[1.14] brightness-95"
              />
              <motion.div
                className="pointer-events-none absolute inset-0"
                style={{
                  background: useTransform(
                    lightX,
                    (lx) =>
                      `linear-gradient(105deg, transparent ${Number(lx) - 22}%, rgba(255,255,255,0.16) ${lx}%, transparent ${Number(lx) + 22}%)`,
                  ),
                }}
              />
            </div>
          </div>

          <div className="text-center max-w-md mx-auto mt-3 space-y-4">
            <p
              className="text-xs sm:text-sm text-white/55 font-light leading-relaxed"
              {...editsFor("hero.subheadline")}
            >
              {hero.subheadline || info.description}
            </p>
            <button
              onClick={() => jumpToScene(2)}
              className="text-[11px] font-mono tracking-[0.28em] uppercase text-white border-b border-[#C59B27] pb-1.5 hover:text-[#C59B27] transition-colors"
            >
              {hero.ctaText || "כניסה לקונפיגורטור המפרט →"}
            </button>
          </div>
        </motion.section>

        {/* -----------------------------------------------------------------
            SCENE 02: 3D MONOLITH SPECIFICATIONS
           ----------------------------------------------------------------- */}
        <motion.section
          style={{
            scale: s2Scale,
            opacity: s2Opacity,
            pointerEvents: s2Pointer as any,
          }}
          className="absolute inset-0 flex flex-col justify-center px-6 md:px-20 max-w-7xl mx-auto"
        >
          <div className="flex items-end justify-between border-b border-white/10 pb-5 mb-8">
            <div>
              <span className="text-[10px] font-mono tracking-[0.35em] text-[#C59B27] uppercase block mb-2">
                CHAPTER 02 // BESPOKE ARCHITECTURE
              </span>
              <h2 className="font-frank text-3xl md:text-5xl font-light">
                מפרטי עילית בהתאמה אישית
              </h2>
            </div>
            <button
              onClick={() => jumpToScene(2)}
              className="text-[11px] font-mono tracking-[0.25em] text-[#C59B27] uppercase"
            >
              לשלב הקונפיגורטור [03] →
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {services.slice(0, 4).map((srv: any, idx: number) => (
              <div
                key={idx}
                onClick={() => {
                  setSelectedServiceIdx(idx);
                  jumpToScene(2);
                }}
                className="cursor-pointer group bg-[#070708]/90 backdrop-blur-xl border border-white/10 hover:border-[#C59B27]/60 p-6 md:p-8 transition-all duration-300"
              >
                <div className="flex items-center justify-between mb-4">
                  <span className="font-mono text-[10px] tracking-[0.3em] text-white/35">
                    UNIT // 0{idx + 1}
                  </span>
                  <span className="font-mono text-xs text-[#C59B27]">
                    {srv.price || "בהתאמה אישית"}
                  </span>
                </div>
                <h3
                  className="font-frank text-2xl md:text-3xl font-light text-white mb-2 group-hover:text-[#C59B27] transition-colors"
                  {...serviceEdits(idx, "title")}
                >
                  {srv.title}
                </h3>
                <p
                  className="text-xs md:text-sm text-white/50 font-light leading-relaxed"
                  {...serviceEdits(idx, "description")}
                >
                  {srv.description}
                </p>
              </div>
            ))}
          </div>
        </motion.section>

        {/* -----------------------------------------------------------------
            SCENE 03: INTERACTIVE 3-STAGE AUTOMOTIVE CONFIGURATOR
           ----------------------------------------------------------------- */}
        <motion.section
          style={{
            scale: s3Scale,
            opacity: s3Opacity,
            pointerEvents: s3Pointer as any,
          }}
          className="absolute inset-0 flex flex-col justify-center px-6 md:px-20 max-w-7xl mx-auto"
        >
          <div className="mb-6">
            <span className="text-[10px] font-mono tracking-[0.35em] text-[#C59B27] uppercase block mb-2">
              CHAPTER 03 // COMMISSION CONFIGURATOR
            </span>
            <h2 className="font-frank text-3xl md:text-5xl font-light">
              הרכבת מפרט פרויקט חי
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            <div className="lg:col-span-8 space-y-4">
              <div className="bg-[#060607] border border-white/10 p-5">
                <div className="text-[10px] font-mono tracking-[0.25em] text-white/40 uppercase mb-3">
                  STAGE 01 // בחירת מערכת
                </div>
                <div className="grid grid-cols-2 gap-2.5">
                  {services.slice(0, 4).map((srv: any, idx: number) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setSelectedServiceIdx(idx)}
                      className={`text-right p-3 border text-xs transition-all ${
                        selectedServiceIdx === idx
                          ? "border-[#C59B27] bg-[#C59B27]/15 text-white"
                          : "border-white/10 text-white/50 hover:border-white/30"
                      }`}
                    >
                      {srv.title}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-[#060607] border border-white/10 p-5">
                  <div className="text-[10px] font-mono tracking-[0.25em] text-white/40 uppercase mb-3">
                    STAGE 02 // רמת גימור
                  </div>
                  <div className="flex flex-col gap-2">
                    {(["SIGNATURE", "BESPOKE", "RESERVE"] as const).map((tier) => (
                      <button
                        key={tier}
                        type="button"
                        onClick={() => setSelectedTier(tier)}
                        className={`p-2.5 border text-right font-mono text-xs transition-all ${
                          selectedTier === tier
                            ? "border-[#C59B27] bg-[#C59B27]/15 text-white"
                            : "border-white/10 text-white/45"
                        }`}
                      >
                        {tier} EDITION
                      </button>
                    ))}
                  </div>
                </div>

                <div className="bg-[#060607] border border-white/10 p-5">
                  <div className="text-[10px] font-mono tracking-[0.25em] text-white/40 uppercase mb-3">
                    STAGE 03 // זמינות ביצוע
                  </div>
                  <div className="flex flex-col gap-2">
                    {[
                      { id: "STANDARD", label: "תכנון רגיל" },
                      { id: "PRIORITY", label: "עדיפות גבוהה" },
                      { id: "VIP", label: "מסלול VIP מיידי" },
                    ].map((tl) => (
                      <button
                        key={tl.id}
                        type="button"
                        onClick={() => setSelectedTimeline(tl.id as any)}
                        className={`p-2.5 border text-right text-xs transition-all ${
                          selectedTimeline === tl.id
                            ? "border-[#C59B27] bg-[#C59B27]/15 text-white"
                            : "border-white/10 text-white/45"
                        }`}
                      >
                        {tl.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-4 bg-[#070709] border border-[#C59B27]/40 p-6 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="text-[10px] font-mono tracking-[0.3em] text-[#C59B27] uppercase border-b border-white/10 pb-3">
                  TELEMETRY SUMMARY
                </div>
                <div>
                  <div className="text-[10px] text-white/35">מערכת</div>
                  <div className="font-frank text-2xl font-light">
                    {services[selectedServiceIdx]?.title}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] text-white/35">מהדורה וגימור</div>
                  <div className="font-mono text-sm text-[#C59B27]">{selectedTier}</div>
                </div>
                <div>
                  <div className="text-[10px] text-white/35">אומדן</div>
                  <div className="font-frank text-xl">
                    {services[selectedServiceIdx]?.price || "בהתאמה אישית"}
                  </div>
                </div>
              </div>

              <a
                href={
                  whatsappNumber
                    ? waLink(whatsappNumber, specMessage)
                    : undefined
                }
                target="_blank"
                rel="noreferrer"
                className="mt-6 block w-full text-center bg-white text-black hover:bg-[#C59B27] py-3.5 text-xs font-mono tracking-[0.22em] uppercase transition-colors"
              >
                שלח מפרט לוואטסאפ →
              </a>
            </div>
          </div>
        </motion.section>

        {/* -----------------------------------------------------------------
            SCENE 04: BEFORE / AFTER STUDIO SPLIT COMPARISON
           ----------------------------------------------------------------- */}
        <motion.section
          style={{
            scale: s4Scale,
            opacity: s4Opacity,
            pointerEvents: s4Pointer as any,
          }}
          className="absolute inset-0 flex flex-col justify-center px-6 md:px-20 max-w-6xl mx-auto"
        >
          <div className="flex items-end justify-between mb-6">
            <div>
              <span className="text-[10px] font-mono tracking-[0.35em] text-[#C59B27] uppercase block mb-2">
                CHAPTER 04 // VISUAL CALIBRATION
              </span>
              <h2 className="font-frank text-3xl md:text-5xl font-light">
                השוואת רמת גימור חיה
              </h2>
            </div>
            <span className="text-xs text-white/45">הזז את הסליידר להשוואה</span>
          </div>

          <div className="relative w-full aspect-[16/7.5] overflow-hidden border border-white/15">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={heroImg}
              alt="After"
              className="absolute inset-0 w-full h-full object-cover contrast-125"
            />
            <div
              className="absolute inset-0 overflow-hidden"
              style={{ clipPath: `inset(0 ${100 - sliderPos}% 0 0)` }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={heroImg}
                alt="Before"
                className="absolute inset-0 w-full h-full object-cover grayscale brightness-50"
              />
            </div>

            <input
              type="range"
              min={5}
              max={95}
              value={sliderPos}
              onChange={(e) => setSliderPos(Number(e.target.value))}
              className="absolute inset-0 w-full h-full opacity-0 cursor-ew-resize z-30"
            />

            <div
              style={{ left: `${sliderPos}%` }}
              className="pointer-events-none absolute top-0 bottom-0 w-[1px] bg-[#C59B27] z-20 flex items-center justify-center"
            >
              <div className="w-9 h-9 bg-black border border-[#C59B27] text-[10px] font-mono text-[#C59B27] flex items-center justify-center">
                ↔
              </div>
            </div>
          </div>
        </motion.section>

        {/* -----------------------------------------------------------------
            SCENE 05: PRIVATE COMMISSION VAULT (CONTACT & REVIEWS)
           ----------------------------------------------------------------- */}
        <motion.section
          style={{
            scale: s5Scale,
            opacity: s5Opacity,
            pointerEvents: s5Pointer as any,
          }}
          className="absolute inset-0 flex flex-col justify-center px-6 md:px-20 max-w-6xl mx-auto"
        >
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center bg-[#060608]/90 border border-white/15 p-8 md:p-14">
            <div>
              <span className="text-[10px] font-mono tracking-[0.35em] text-[#C59B27] uppercase block mb-3">
                CHAPTER 05 // PRIVATE COMMISSION
              </span>
              <h2 className="font-frank text-4xl md:text-6xl font-light leading-tight mb-6">
                מוכנים להזמנה האישית שלכם?
              </h2>
              <p className="text-xs md:text-sm text-white/55 font-light mb-8">
                {info.address} • {info.openingHours} • דירוג{" "}
                {info.googleRating || "4.9"}★
              </p>
              <div className="flex flex-wrap gap-4">
                <a
                  href={whatsappLink}
                  target="_blank"
                  rel="noreferrer"
                  className="bg-white text-black hover:bg-[#C59B27] px-8 py-4 text-xs font-mono tracking-[0.25em] uppercase transition-colors"
                >
                  פתיחת תיק לקוח בוואטסאפ
                </a>
                {info.phone && (
                  <a
                    href={`tel:${info.phone}`}
                    className="border border-white/25 hover:border-white px-8 py-4 text-xs font-mono tracking-[0.25em] uppercase"
                  >
                    {info.phone}
                  </a>
                )}
              </div>
            </div>

            <div className="space-y-5 border-r border-white/10 pr-8">
              {(reviews.length > 0
                ? reviews.slice(0, 2)
                : [
                    {
                      author: "לקוח מאומת",
                      text: "סטנדרט ביצוע שלא קיים בארץ. ירידה לפרטים הכי קטנים.",
                    },
                  ]
              ).map((rev: any, i: number) => (
                <div key={i} className="border-b border-white/10 pb-4">
                  <p
                    className="font-frank text-xl font-light text-white/85 mb-2"
                    {...reviewEdits(i, "text")}
                  >
                    &ldquo;{rev.text}&rdquo;
                  </p>
                  <span className="text-[10px] font-mono tracking-widest text-[#C59B27] uppercase">
                    — {rev.author}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </motion.section>
      </motion.main>
    </div>
  );
}

export default ForgeAutomotiveTemplate;
