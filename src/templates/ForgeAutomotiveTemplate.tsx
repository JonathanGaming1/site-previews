"use client";

import React, { useRef, useState, useEffect } from "react";
import {
  motion,
  useScroll,
  useTransform,
  useMotionValue,
  useSpring,
  AnimatePresence,
} from "framer-motion";

interface TemplateProps {
  data: any;
}

// כרטיס תלת-ממדי אמיתי שמגיב לתנועת העכבר עם החזר אור מתכתי (בלי רינדור מחדש של React)
function TiltMonolith({
  children,
  index,
}: {
  children: React.ReactNode;
  index: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const glareX = useMotionValue(50);
  const glareY = useMotionValue(50);

  const rotateX = useSpring(useTransform(y, [-0.5, 0.5], [10, -10]), {
    stiffness: 180,
    damping: 22,
  });
  const rotateY = useSpring(useTransform(x, [-0.5, 0.5], [-10, 10]), {
    stiffness: 180,
    damping: 22,
  });

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    if (!ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const normX = (e.clientX - rect.left) / rect.width - 0.5;
    const normY = (e.clientY - rect.top) / rect.height - 0.5;
    x.set(normX);
    y.set(normY);
    glareX.set(((e.clientX - rect.left) / rect.width) * 100);
    glareY.set(((e.clientY - rect.top) / rect.height) * 100);
  }

  function handleMouseLeave() {
    x.set(0);
    y.set(0);
  }

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      initial={{ opacity: 0, y: 60 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.8, delay: index * 0.12, ease: [0.16, 1, 0.3, 1] }}
      style={{
        rotateX,
        rotateY,
        transformStyle: "preserve-3d",
      }}
      className="group relative overflow-hidden bg-[#070708] border border-white/[0.08] p-8 md:p-12 transition-colors duration-500 hover:border-white/25"
    >
      {/* אלומת אור דינמית שעוקבת אחרי העכבר בתוך הכרטיס */}
      <motion.div
        className="pointer-events-none absolute -inset-px opacity-0 transition-opacity duration-500 group-hover:opacity-100"
        style={{
          background: useTransform(
            [glareX, glareY],
            ([gx, gy]) =>
              `radial-gradient(420px circle at ${gx}% ${gy}%, rgba(212,175,55,0.12), transparent 70%)`
          ),
        }}
      />
      <div style={{ transform: "translateZ(35px)" }} className="relative z-10">
        {children}
      </div>
    </motion.div>
  );
}

export default function ForgeAutomotiveTemplate({ data }: TemplateProps) {
  const [menuOpen, setMenuOpen] = useState(false);
  const [selectedServiceIdx, setSelectedServiceIdx] = useState(0);
  const [selectedTier, setSelectedTier] = useState<"SIGNATURE" | "BESPOKE" | "RESERVE">("BESPOKE");
  const [selectedTimeline, setSelectedTimeline] = useState<"STANDARD" | "PRIORITY" | "IMMEDIATE">("PRIORITY");
  const [sliderPos, setSliderPos] = useState(52);

  const info = data?.businessInfo || {};
  const hero = data?.hero || {};
  const services = Array.isArray(data?.services) && data.services.length > 0
    ? data.services
    : [
        { title: "תכנון והנדסת מפרט", description: "אפיון מדויק בהתאמה מלאה לדרישות הפרויקט ולתנאי השטח.", price: "בהתאמה אישית" },
        { title: "ביצוע בסטנדרט אטלייה", description: "שימוש בחומרי הגלם העמידים והיוקרתיים ביותר תחת בקרת איכות קפדנית.", price: "אחריות מלאה" },
        { title: "פרויקטים מיוחדים VIP", description: "ליווי אישי צמוד מהסקיצה הראשונה ועד למסירת המפתח.", price: "מפרט שמור" },
        { title: "תחזוקה ושירות פרימיום", description: "מענה מהיר וזמינות מלאה לשמירה על איכות התוצאה לאורך שנים.", price: "ליווי שנתי" },
      ];
  const reviews = Array.isArray(data?.reviews) ? data.reviews : [];
  const faqs = Array.isArray(data?.faq) ? data.faq : [];

  const whatsappNumber = info.whatsapp || String(info.phone || "").replace(/\D/g, "").replace(/^0/, "972");
  const whatsappLink = whatsappNumber ? `https://wa.me/${whatsappNumber}` : "#contact";

  // --- 1. פיזיקת עכבר חיה ב-3D על כל במת ה-Hero (כמו ב-Forge Automotive) ---
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const stageRotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [6, -6]), {
    stiffness: 90,
    damping: 25,
  });
  const stageRotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-8, 8]), {
    stiffness: 90,
    damping: 25,
  });
  const imageShiftX = useSpring(useTransform(mouseX, [-0.5, 0.5], [-28, 28]), {
    stiffness: 70,
    damping: 20,
  });
  const imageShiftY = useSpring(useTransform(mouseY, [-0.5, 0.5], [-18, 18]), {
    stiffness: 70,
    damping: 20,
  });
  const lightX = useSpring(useTransform(mouseX, [-0.5, 0.5], [20, 80]), {
    stiffness: 80,
    damping: 20,
  });
  const lightY = useSpring(useTransform(mouseY, [-0.5, 0.5], [20, 80]), {
    stiffness: 80,
    damping: 20,
  });

  useEffect(() => {
    const handleGlobalMouse = (e: MouseEvent) => {
      const nx = e.clientX / window.innerWidth - 0.5;
      const ny = e.clientY / window.innerHeight - 0.5;
      mouseX.set(nx);
      mouseY.set(ny);
    };
    window.addEventListener("mousemove", handleGlobalMouse, { passive: true });
    return () => window.removeEventListener("mousemove", handleGlobalMouse);
  }, [mouseX, mouseY]);

  // --- 2. מצלמת גלילה תלת-ממדית (Scroll-Driven 3D Portal Zoom-In) ---
  const portalRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: portalRef,
    offset: ["start start", "end end"],
  });

  // ככל שגוללים עם הגלגלת למטה, המצלמה נכנסת פיזית לתוך התמונה!
  const carScale = useTransform(scrollYProgress, [0, 0.65, 1], [1, 2.35, 3.6]);
  const carY = useTransform(scrollYProgress, [0, 0.7, 1], ["0%", "8%", "18%"]);
  const carOpacity = useTransform(scrollYProgress, [0, 0.68, 0.95], [1, 0.85, 0]);

  const titleScale = useTransform(scrollYProgress, [0, 0.45], [1, 1.55]);
  const titleY = useTransform(scrollYProgress, [0, 0.45], ["0%", "-65%"]);
  const titleOpacity = useTransform(scrollYProgress, [0, 0.38], [1, 0]);

  // השכבה הפנימית שבוקעת מתוך החושך אחרי שנכנסים לתוך התמונה בגלילה
  const interiorScale = useTransform(scrollYProgress, [0.42, 0.88], [0.72, 1]);
  const interiorOpacity = useTransform(scrollYProgress, [0.45, 0.78], [0, 1]);
  const interiorY = useTransform(scrollYProgress, [0.45, 0.88], ["80px", "0px"]);

  const heroImg =
    hero.backgroundImage ||
    "https://images.unsplash.com/photo-1617788138017-80ad40651399?auto=format&fit=crop&w=1800&q=85";

  const configuredSpecText = encodeURIComponent(
    `היי ${info.name || ""}, הרכבתי מפרט באתר:\n` +
      `• שירות: ${services[selectedServiceIdx]?.title || ""}\n` +
      `• רמת גימור: ${selectedTier}\n` +
      `• לוח זמנים: ${selectedTimeline}\n` +
      `אשמח לתיאום שיחת ייעוץ.`
  );

  return (
    <div
      dir="rtl"
      className="min-h-screen bg-[#030303] text-[#F5F5F3] font-heebo selection:bg-[#C59B27] selection:text-black overflow-x-hidden"
    >
      {/* תפריט ניווט קולנועי על מסך מלא (נפתח בלחיצה על NAVIGATE =) */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            initial={{ opacity: 0, clipPath: "inset(0 0 100% 0)" }}
            animate={{ opacity: 1, clipPath: "inset(0 0 0% 0)" }}
            exit={{ opacity: 0, clipPath: "inset(0 0 100% 0)" }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="fixed inset-0 z-50 bg-[#040404]/98 backdrop-blur-2xl flex flex-col justify-between p-8 md:p-16"
          >
            <div className="flex items-center justify-between border-b border-white/10 pb-6">
              <span className="text-xs tracking-[0.35em] text-white/40 uppercase">
                {info.name || "FORGE ATELIER"}
              </span>
              <button
                onClick={() => setMenuOpen(false)}
                className="text-xs tracking-[0.3em] uppercase text-white/70 hover:text-white flex items-center gap-3"
              >
                <span>סגור תפריט</span>
                <span className="text-lg font-light">×</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-12 my-auto py-12">
              <div className="space-y-6">
                {[
                  { num: "01", label: "האטלייה והחזון", href: "#vision" },
                  { num: "02", label: "מפרט שירותים", href: "#services" },
                  { num: "03", label: "קונפיגורטור התאמה אישית", href: "#configurator" },
                  { num: "04", label: "השוואת סטנדרט (לפני / אחרי)", href: "#comparison" },
                  { num: "05", label: "תיאום פגישת ייעוץ", href: "#contact" },
                ].map((item) => (
                  <a
                    key={item.num}
                    href={item.href}
                    onClick={() => setMenuOpen(false)}
                    className="group flex items-baseline gap-6 border-b border-white/[0.06] pb-4 hover:border-white/30 transition-all"
                  >
                    <span className="text-xs font-mono text-[#C59B27]">{item.num}</span>
                    <span className="font-frank text-3xl md:text-5xl font-light tracking-tight group-hover:translate-x-[-10px] transition-transform duration-300">
                      {item.label}
                    </span>
                  </a>
                ))}
              </div>

              <div className="flex flex-col justify-end space-y-6 border-r border-white/10 pr-8">
                <p className="text-xs tracking-[0.25em] text-white/40 uppercase">קו ישיר לאטלייה</p>
                <p className="font-frank text-3xl font-light text-white">{info.phone || "050-0000000"}</p>
                <p className="text-sm text-white/50">{info.address || info.city || "ישראל"}</p>
                <p className="text-xs text-white/35">{info.openingHours}</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* סרגל עליון מינימליסטי זהה ל-Forge Automotive */}
      <header className="fixed top-0 inset-x-0 z-40 px-6 md:px-14 py-7 flex items-center justify-between pointer-events-none">
        <div className="flex items-center gap-6 pointer-events-auto">
          <a
            href={whatsappLink}
            target="_blank"
            rel="noreferrer"
            className="text-[11px] tracking-[0.25em] uppercase text-white/60 hover:text-white transition-colors"
          >
            WHATSAPP
          </a>
          {info.phone && (
            <a
              href={`tel:${info.phone}`}
              className="hidden sm:inline-block text-[11px] tracking-[0.2em] text-white/50 hover:text-white transition-colors"
            >
              {info.phone}
            </a>
          )}
        </div>

        {/* סמל גיאומטרי נקי במרכז כמו ב-Forge */}
        <div className="flex flex-col items-center pointer-events-auto">
          <svg
            width="28"
            height="18"
            viewBox="0 0 28 18"
            fill="none"
            className="mb-1.5 opacity-90"
          >
            <path d="M14 1L26 17H20L14 9L8 17H2L14 1Z" fill="white" />
          </svg>
          <span className="text-[11px] tracking-[0.38em] uppercase font-medium text-white/90">
            {info.name || "FORGE"}
          </span>
        </div>

        <button
          onClick={() => setMenuOpen(true)}
          className="pointer-events-auto flex items-center gap-3 text-[11px] tracking-[0.28em] uppercase text-white/75 hover:text-white transition-colors"
        >
          <span>ניווט</span>
          <span className="flex flex-col gap-1.5 w-5">
            <span className="w-full h-[1px] bg-white" />
            <span className="w-3/4 h-[1px] bg-white/70 mr-auto" />
          </span>
        </button>
      </header>

      {/* =====================================================================
          במת ה-3D והכניסה לתוך התמונה בגלילה (SCROLL-ZOOM 3D CAMERA PORTAL)
         ===================================================================== */}
      <section ref={portalRef} className="relative h-[260vh] bg-[#030303]">
        <div
          className="sticky top-0 h-screen w-full overflow-hidden flex flex-col items-center justify-center"
          style={{ perspective: "1400px" }}
        >
          {/* אלומת תאורת סטודיו שחיה וזזה עם העכבר */}
          <motion.div
            className="pointer-events-none absolute inset-0 z-0"
            style={{
              background: useTransform(
                [lightX, lightY],
                ([lx, ly]) =>
                  `radial-gradient(650px circle at ${lx}% ${ly}%, rgba(255,255,255,0.07), rgba(197,155,39,0.03) 40%, transparent 75%)`
              ),
            }}
          />

          {/* הבמה המרכזית שנוטה ב-3D לפי העכבר ונכנסת פנימה לפי הגלגלת */}
          <motion.div
            style={{
              rotateX: stageRotateX,
              rotateY: stageRotateY,
              transformStyle: "preserve-3d",
            }}
            className="relative z-10 w-full max-w-6xl mx-auto px-6 flex flex-col items-center justify-center"
          >
            {/* הכותרת הדקה והיוקרתית במרכז (בדיוק כמו For Those Who Refuse Ordinary) */}
            <motion.div
              style={{
                scale: titleScale,
                y: titleY,
                opacity: titleOpacity,
                transform: "translateZ(75px)",
              }}
              className="text-center mb-4 md:mb-6 pointer-events-none"
            >
              <h1 className="font-frank font-light text-4xl sm:text-6xl md:text-[5.2rem] leading-[1.08] tracking-tight text-white max-w-3xl mx-auto">
                {hero.headline || info.name || "למי שמסרב לסטנדרט רגיל"}
              </h1>
            </motion.div>

            {/* התמונה המרכזית שמתמזגת לשחור המוחלט (Vignette Mask) ומתקרבת אליך בגלילה */}
            <motion.div
              style={{
                scale: carScale,
                y: carY,
                opacity: carOpacity,
                x: imageShiftX,
                rotateZ: useTransform(imageShiftY, [-18, 18], [-0.8, 0.8]),
                transform: "translateZ(20px)",
              }}
              className="relative w-full max-w-5xl aspect-[16/8.5] flex items-center justify-center"
            >
              <div
                className="w-full h-full relative overflow-hidden"
                style={{
                  WebkitMaskImage:
                    "radial-gradient(ellipse 78% 68% at 50% 50%, #000 42%, transparent 96%)",
                  maskImage:
                    "radial-gradient(ellipse 78% 68% at 50% 50%, #000 42%, transparent 96%)",
                }}
              >
                <img
                  src={heroImg}
                  alt={info.name || "Showcase"}
                  className="w-full h-full object-cover object-center contrast-[1.12] brightness-95 scale-105"
                />
                {/* הברקת אור שחולפת על האובייקט בתזוזת העכבר */}
                <motion.div
                  className="pointer-events-none absolute inset-0"
                  style={{
                    background: useTransform(
                      lightX,
                      (lx) =>
                        `linear-gradient(105deg, transparent ${Number(lx) - 25}%, rgba(255,255,255,0.14) ${lx}%, transparent ${Number(lx) + 25}%)`
                    ),
                  }}
                />
              </div>
            </motion.div>

            {/* הכיתוב התחתון המינימליסטי מתחת לתמונה (כמו בלפטופ של Forge) */}
            <motion.div
              style={{ opacity: titleOpacity }}
              className="text-center max-w-md mx-auto mt-2 space-y-5"
            >
              <p className="text-xs sm:text-sm text-white/60 font-light leading-relaxed tracking-wide">
                {hero.subheadline || info.description}
              </p>
              <div className="flex items-center justify-center gap-8 pt-2">
                <a
                  href="#configurator"
                  className="text-[11px] tracking-[0.28em] uppercase text-white border-b border-white/40 pb-1.5 hover:border-[#C59B27] hover:text-[#C59B27] transition-all"
                >
                  {hero.ctaText || "הרכבת מפרט אישי"}
                </a>
                <span className="text-[10px] tracking-[0.25em] text-white/30 uppercase">
                  גלול לכניסה פנימה ↓
                </span>
              </div>
            </motion.div>
          </motion.div>

          {/* השכבה הפנימית (The Cockpit / Atelier Core) שנחשפת מתוך התמונה תוך כדי גלילה! */}
          <motion.div
            id="vision"
            style={{
              scale: interiorScale,
              opacity: interiorOpacity,
              y: interiorY,
            }}
            className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center px-6"
          >
            <div className="pointer-events-auto max-w-5xl w-full bg-[#060607]/90 backdrop-blur-2xl border border-white/15 p-8 md:p-16 shadow-[0_0_120px_rgba(0,0,0,0.95)]">
              <div className="flex flex-col md:flex-row items-start md:items-end justify-between border-b border-white/10 pb-8 mb-10 gap-6">
                <div>
                  <span className="text-[10px] font-mono tracking-[0.35em] text-[#C59B27] uppercase block mb-3">
                    INSIDE THE ATELIER // 01
                  </span>
                  <h2 className="font-frank text-3xl md:text-5xl font-light text-white leading-tight">
                    הנדסת פרטים ללא פשרות.
                  </h2>
                </div>
                <p className="text-xs md:text-sm text-white/55 max-w-md font-light leading-relaxed">
                  {info.description}
                </p>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
                {[
                  { label: "דירוג לקוחות מאומת", val: `${info.googleRating || "4.9"} / 5.0` },
                  { label: "ביקורות בגוגל", val: `+${info.reviewsCount || "40"}` },
                  { label: "אזור פעילות", val: info.city || "פריסה ארצית" },
                  { label: "סטנדרט ביצוע", val: "BESPOKE" },
                ].map((stat, i) => (
                  <div key={i} className="border-r border-white/10 pr-5">
                    <div className="font-frank text-2xl md:text-4xl font-light text-white mb-1">
                      {stat.val}
                    </div>
                    <div className="text-[11px] tracking-wider text-white/40 uppercase">
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* =====================================================================
          02 // מונוליטים תלת-ממדיים של שירותי העסק (ללא אייקונים זולים!)
         ===================================================================== */}
      <section id="services" className="py-28 md:py-36 px-6 md:px-14 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-20 border-b border-white/10 pb-8">
          <div>
            <span className="text-[11px] font-mono tracking-[0.35em] text-[#C59B27] uppercase block mb-3">
              02 // SPECIFICATIONS & CRAFTSMANSHIP
            </span>
            <h2 className="font-frank text-4xl md:text-6xl font-light tracking-tight">
              תחומי התמחות ומפרטים
            </h2>
          </div>
          <p className="text-xs tracking-[0.2em] text-white/40 uppercase mt-4 md:mt-0">
            הזז את העכבר על כל מפרט לבחינה בתלת-ממד
          </p>
        </div>

        <div
          className="grid grid-cols-1 md:grid-cols-2 gap-6"
          style={{ perspective: "1200px" }}
        >
          {services.map((srv: any, idx: number) => (
            <TiltMonolith key={idx} index={idx}>
              <div className="flex items-center justify-between border-b border-white/[0.07] pb-5 mb-8">
                <span className="font-mono text-xs tracking-[0.3em] text-white/35">
                  SPEC // 0{idx + 1}
                </span>
                <span className="text-xs tracking-[0.15em] text-[#C59B27] border border-[#C59B27]/30 px-3 py-1">
                  {srv.price || "בהתאמה אישית"}
                </span>
              </div>
              <h3 className="font-frank text-2xl md:text-4xl font-light text-white mb-4">
                {srv.title}
              </h3>
              <p className="text-sm text-white/55 font-light leading-relaxed mb-8">
                {srv.description}
              </p>
              <a
                href="#configurator"
                onClick={() => setSelectedServiceIdx(idx)}
                className="inline-flex items-center gap-4 text-[11px] tracking-[0.25em] uppercase text-white/70 group-hover:text-white transition-colors"
              >
                <span>הגדר מפרט זה בקונפיגורטור</span>
                <span className="w-8 h-[1px] bg-[#C59B27] transition-all duration-300 group-hover:w-14" />
              </a>
            </TiltMonolith>
          ))}
        </div>
      </section>

      {/* =====================================================================
          03 // קונפיגורטור מפרט 3 שלבים בסגנון רכבי יוקרה (FORGE CONFIGURATOR)
         ===================================================================== */}
      <section
        id="configurator"
        className="py-28 bg-[#060607] border-y border-white/[0.07] px-6 md:px-14"
      >
        <div className="max-w-7xl mx-auto">
          <div className="mb-16">
            <span className="text-[11px] font-mono tracking-[0.35em] text-[#C59B27] uppercase block mb-3">
              03 // BESPOKE COMMISSION CONFIGURATOR
            </span>
            <h2 className="font-frank text-4xl md:text-6xl font-light">
              בניית מפרט פרויקט אישי
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            {/* שלבי הבחירה */}
            <div className="lg:col-span-8 space-y-10">
              {/* STAGE 01 */}
              <div className="border border-white/10 bg-[#030303] p-6 md:p-8">
                <div className="text-[11px] font-mono tracking-[0.3em] text-white/40 uppercase mb-5">
                  STAGE 01 // בחר את המערכת או השירות המבוקש
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {services.map((srv: any, idx: number) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => setSelectedServiceIdx(idx)}
                      className={`text-right p-4 border transition-all duration-300 ${
                        selectedServiceIdx === idx
                          ? "border-[#C59B27] bg-[#C59B27]/10 text-white"
                          : "border-white/10 bg-transparent text-white/55 hover:border-white/25"
                      }`}
                    >
                      <div className="text-[10px] font-mono text-white/35 mb-1">
                        0{idx + 1}
                      </div>
                      <div className="font-frank text-lg font-light">{srv.title}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* STAGE 02 */}
              <div className="border border-white/10 bg-[#030303] p-6 md:p-8">
                <div className="text-[11px] font-mono tracking-[0.3em] text-white/40 uppercase mb-5">
                  STAGE 02 // בחר רמת גימור והיקף (EDITION)
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    { id: "SIGNATURE", name: "Signature", desc: "ביצוע מוקפד לפי מפרט מלא" },
                    { id: "BESPOKE", name: "Bespoke Atelier", desc: "התאמה אישית מלאה מאפס" },
                    { id: "RESERVE", name: "Black Reserve VIP", desc: "פרויקט דגל עם עדיפות עליונה" },
                  ].map((tier) => (
                    <button
                      key={tier.id}
                      type="button"
                      onClick={() => setSelectedTier(tier.id as any)}
                      className={`text-right p-4 border transition-all duration-300 ${
                        selectedTier === tier.id
                          ? "border-[#C59B27] bg-[#C59B27]/10 text-white"
                          : "border-white/10 text-white/55 hover:border-white/25"
                      }`}
                    >
                      <div className="font-mono text-xs tracking-wider uppercase mb-1">
                        {tier.name}
                      </div>
                      <div className="text-xs text-white/45 font-light">{tier.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* STAGE 03 */}
              <div className="border border-white/10 bg-[#030303] p-6 md:p-8">
                <div className="text-[11px] font-mono tracking-[0.3em] text-white/40 uppercase mb-5">
                  STAGE 03 // לוח זמנים מבוקש
                </div>
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { id: "STANDARD", label: "תכנון מראש" },
                    { id: "PRIORITY", label: "החודש הקרוב" },
                    { id: "IMMEDIATE", label: "זמינות מיידית VIP" },
                  ].map((tl) => (
                    <button
                      key={tl.id}
                      type="button"
                      onClick={() => setSelectedTimeline(tl.id as any)}
                      className={`p-4 border text-xs tracking-wider uppercase transition-all ${
                        selectedTimeline === tl.id
                          ? "border-[#C59B27] bg-[#C59B27]/10 text-white"
                          : "border-white/10 text-white/50 hover:border-white/25"
                      }`}
                    >
                      {tl.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* תעודת המפרט החיה (Live Telemetry Spec Sheet) */}
            <div className="lg:col-span-4 border border-white/15 bg-[#030303] p-8 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-6">
                  <span className="text-[10px] font-mono tracking-[0.3em] text-[#C59B27]">
                    LIVE TELEMETRY SPEC
                  </span>
                  <span className="w-2 h-2 rounded-full bg-[#C59B27] animate-pulse" />
                </div>

                <div className="space-y-6">
                  <div>
                    <div className="text-[10px] uppercase tracking-widest text-white/35 mb-1">
                      מערכת נבחרת
                    </div>
                    <div className="font-frank text-2xl font-light text-white">
                      {services[selectedServiceIdx]?.title}
                    </div>
                  </div>

                  <div className="border-t border-white/10 pt-4">
                    <div className="text-[10px] uppercase tracking-widest text-white/35 mb-1">
                      רמת גימור
                    </div>
                    <div className="font-mono text-sm text-[#C59B27]">{selectedTier}</div>
                  </div>

                  <div className="border-t border-white/10 pt-4">
                    <div className="text-[10px] uppercase tracking-widest text-white/35 mb-1">
                      הערכת תקציב ראשונית
                    </div>
                    <div className="font-frank text-xl text-white">
                      {services[selectedServiceIdx]?.price || "בהתאמה אישית"}
                    </div>
                  </div>
                </div>
              </div>

              <div className="pt-10 mt-10 border-t border-white/10">
                <a
                  href={`${whatsappLink}?text=${configuredSpecText}`}
                  target="_blank"
                  rel="noreferrer"
                  className="block w-full text-center bg-white text-black hover:bg-[#C59B27] hover:text-black py-4 text-xs tracking-[0.25em] uppercase font-medium transition-colors duration-300"
                >
                  שלח מפרט זה לתיאום בוואטסאפ
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================================
          04 // סליידר השוואת סטנדרט אינטראקטיבי (BEFORE / AFTER SPLIT STAGE)
         ===================================================================== */}
      <section id="comparison" className="py-28 px-6 md:px-14 max-w-7xl mx-auto">
        <div className="mb-14 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <span className="text-[11px] font-mono tracking-[0.35em] text-[#C59B27] uppercase block mb-3">
              04 // PRECISION COMPARISON
            </span>
            <h2 className="font-frank text-4xl md:text-5xl font-light">
              ההבדל בין רגיל ליוצא דופן
            </h2>
          </div>
          <p className="text-xs text-white/45">גרור את הסמן להשוואת רמת הגימור</p>
        </div>

        <div className="relative w-full aspect-[16/8] overflow-hidden border border-white/15 select-none">
          <img
            src={heroImg}
            alt="After Bespoke"
            className="absolute inset-0 w-full h-full object-cover contrast-125"
          />
          <div
            className="absolute inset-0 overflow-hidden"
            style={{ clipPath: `inset(0 ${100 - sliderPos}% 0 0)` }}
          >
            <img
              src={heroImg}
              alt="Standard"
              className="absolute inset-0 w-full h-full object-cover grayscale brightness-50 contrast-75"
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
            <div className="w-10 h-10 bg-[#030303] border border-[#C59B27] text-[10px] font-mono text-[#C59B27] flex items-center justify-center">
              ↔
            </div>
          </div>

          <span className="absolute bottom-5 right-5 z-20 bg-black/80 border border-white/15 px-3 py-1 text-[10px] tracking-[0.25em] uppercase">
            סטנדרט רגיל
          </span>
          <span className="absolute bottom-5 left-5 z-20 bg-black/80 border border-[#C59B27]/50 text-[#C59B27] px-3 py-1 text-[10px] tracking-[0.25em] uppercase">
            גימור {info.name}
          </span>
        </div>
      </section>

      {/* =====================================================================
          05 // חוות דעת ויצירת קשר מינימליסטית
         ===================================================================== */}
      <footer id="contact" className="border-t border-white/10 bg-[#020202] py-28 px-6 md:px-14">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-16 items-end">
          <div>
            <span className="text-[11px] font-mono tracking-[0.35em] text-[#C59B27] uppercase block mb-4">
              05 // PRIVATE CONSULTATION
            </span>
            <h2 className="font-frank text-5xl md:text-7xl font-light leading-[1.05] mb-8">
              מוכנים לעבור לסטנדרט הבא?
            </h2>
            <p className="text-sm text-white/50 max-w-md font-light mb-10">
              {info.address || info.city} • {info.openingHours}
            </p>
            <div className="flex flex-wrap gap-4">
              <a
                href={whatsappLink}
                target="_blank"
                rel="noreferrer"
                className="bg-white text-black hover:bg-[#C59B27] px-8 py-4 text-xs tracking-[0.25em] uppercase font-medium transition-colors"
              >
                תיאום ישיר בוואטסאפ
              </a>
              {info.phone && (
                <a
                  href={`tel:${info.phone}`}
                  className="border border-white/20 hover:border-white px-8 py-4 text-xs tracking-[0.25em] uppercase transition-colors"
                >
                  {info.phone}
                </a>
              )}
            </div>
          </div>

          {reviews.length > 0 && (
            <div className="grid grid-cols-1 gap-6 border-r border-white/10 pr-8">
              {reviews.slice(0, 2).map((rev: any, idx: number) => (
                <div key={idx} className="border-b border-white/[0.07] pb-6">
                  <p className="font-frank text-xl font-light text-white/85 mb-3">
                    &ldquo;{rev.text}&rdquo;
                  </p>
                  <span className="text-[11px] font-mono tracking-widest text-[#C59B27] uppercase">
                    — {rev.author}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </footer>
    </div>
  );
}
