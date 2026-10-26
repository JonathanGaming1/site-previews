"use client";

import React, { useMemo, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Check,
  Clock,
  Compass,
  Hammer,
  Layers,
  MapPin,
  Phone,
  MessageCircle,
  Sliders,
  Wrench,
  X,
} from "lucide-react";
import { useSite } from "@/components/SiteProvider";
import type { ProjectItem, TimelineStep } from "@/types/site";

/* ------------------------------------------------------------------ */
/* Theme palette — each template passes its own surface colors.        */
/* ------------------------------------------------------------------ */

export interface Palette {
  /** page/section background behind cards */
  section: string;
  /** card surface */
  card: string;
  /** 1px card border */
  border: string;
  headline: string;
  body: string;
  muted: string;
  /** true = template is dark */
  dark: boolean;
}

const DEFAULT_PALETTES: Record<"dark" | "light" | "warm", Palette> = {
  dark: {
    section: "transparent",
    card: "rgba(255,255,255,0.03)",
    border: "rgba(197,155,39,0.22)",
    headline: "#f5efe4",
    body: "rgba(245,239,228,0.72)",
    muted: "rgba(245,239,228,0.45)",
    dark: true,
  },
  light: {
    section: "#f7f8fa",
    card: "#ffffff",
    border: "rgba(17,24,39,0.08)",
    headline: "#111827",
    body: "#4b5563",
    muted: "#9ca3af",
    dark: false,
  },
  warm: {
    section: "#efe4d3",
    card: "rgba(255,253,248,0.85)",
    border: "rgba(42,33,24,0.10)",
    headline: "#2a2118",
    body: "rgba(42,33,24,0.7)",
    muted: "rgba(42,33,24,0.45)",
    dark: false,
  },
};

export function resolvePalette(p: Palette | null, mode: "dark" | "light" | "warm"): Palette {
  if (p) return p;
  return DEFAULT_PALETTES[mode];
}

/* ------------------------------------------------------------------ */
/* 1) Interactive Live Quote Estimator                                 */
/* ------------------------------------------------------------------ */

const SCOPES = [
  { label: "רגיל", multiplier: 1, hint: "פרויקט ממוצע בהיקף שגור" },
  { label: "מורכב", multiplier: 1.65, hint: "מדידות ופרטים מרובים" },
  { label: "פרימיום VIP", multiplier: 2.9, hint: "חומרים יוקרתיים וגימור מוקפד" },
] as const;

const URGENCIES = [
  { label: "גמיש", multiplier: 1, hint: "לוחות זמנים גמישים" },
  { label: "השבוע", multiplier: 1.25, hint: "פרויקט מתחיל בשבוע הקרוב" },
  { label: "דחוף", multiplier: 1.55, hint: "עדיפות מיידית בסטודיו" },
] as const;

function parsePrice(text?: string): number | null {
  if (!text) return null;
  const digits = text.replace(/[^\d]/g, "");
  if (!digits) return null;
  const n = parseInt(digits, 10);
  return Number.isFinite(n) && n > 0 ? n : null;
}

export function QuoteEstimator({
  accent,
  palette,
}: {
  accent: string;
  palette: Palette;
}) {
  const { data, editsFor, isAdmin } = useSite();
  const [serviceIdx, setServiceIdx] = useState(0);
  const [scopeIdx, setScopeIdx] = useState(0);
  const [urgencyIdx, setUrgencyIdx] = useState(0);

  const basePrices = useMemo(
    () =>
      data.services.map((s) => {
        const p = parsePrice(s.price);
        return p; // null = custom pricing
      }),
    [data.services],
  );

  const base = basePrices[serviceIdx] ?? null;
  const low = base ? Math.round((base * SCOPES[scopeIdx].multiplier || 0) / 100) * 100 : null;
  const high = base ? Math.round((low ?? 0) * URGENCIES[urgencyIdx].multiplier / 100) * 100 : null;

  const specText = useMemo(() => {
    const s = data.services[serviceIdx];
    const lines = [
      `המפרט שלי מהאתר של ${data.businessInfo.name}:`,
      `• שירות: ${s?.title ?? ""}`,
      `• היקף: ${SCOPES[scopeIdx].label}${base ? "" : " (בהתאמה אישית)"}`,
      `• דחיפות: ${URGENCIES[urgencyIdx].label}`,
    ];
    if (low && high) {
      lines.push(`• טווח חיוב משוער: ${(low / 1000).toFixed(0)}-${(high / 1000).toFixed(1)} אלף ש\"ח`);
    } else {
      lines.push("• הצעת מחיר מותאמת אישית");
    }
    lines.push("אשמח לקבל הצעה מדויקת בהתאם למפרט.");
    return lines.join("\n");
  }, [data, serviceIdx, scopeIdx, urgencyIdx, low, high, base]);

  const segBtn = (active: boolean) =>
    ({
      flex: 1,
      padding: "10px 8px",
      borderRadius: 12,
      fontSize: 13,
      fontWeight: 700,
      cursor: "pointer",
      color: active ? (palette.dark ? "#14100a" : "#fdf9f3") : palette.muted,
      background: active ? accent : palette.card,
      border: `1px solid ${active ? accent : palette.border}`,
      transition: "all .2s",
    }) as React.CSSProperties;

  return (
    <section
      className="overflow-hidden rounded-[2rem] p-8 backdrop-blur md:p-10"
      style={{ background: palette.card, border: `1px solid ${palette.border}` }}
    >
      <div className="mb-7 flex items-center gap-3">
        <span
          className="flex h-11 w-11 items-center justify-center rounded-2xl"
          style={{ background: `${accent}1f`, color: accent }}
        >
          <Sliders className="h-5 w-5" aria-hidden="true" />
        </span>
        <div>
          <h3 className="text-xl font-bold md:text-2xl" style={{ color: palette.headline }}>
            מחשבון הצעת מחיר חכם
          </h3>
          <p className="text-sm" style={{ color: palette.muted }}>
            שלוש דקות של סלקציה — ותקבלו טווח מחיר מציאותי לפרויקט
          </p>
        </div>
      </div>

      {/* Service select */}
      <p className="mb-2 text-xs font-bold tracking-widest" style={{ color: accent }}>
        1. סוג השירות
      </p>
      <div className="mb-6 grid grid-cols-2 gap-2 sm:grid-cols-4">
        {data.services.map((s, i) => (
          <button key={i} onClick={() => setServiceIdx(i)} style={segBtn(serviceIdx === i)} type="button">
            {s.title}
          </button>
        ))}
      </div>

      {/* Scope */}
      <p className="mb-2 text-xs font-bold tracking-widest" style={{ color: accent }}>
        2. היקף / גודל הפרויקט
      </p>
      <div className="mb-2 flex gap-2">{SCOPES.map((sc, i) => (
        <button key={sc.label} onClick={() => setScopeIdx(i)} style={segBtn(scopeIdx === i)} type="button">
          {sc.label}
        </button>
      ))}</div>
      <p className="mb-6 text-xs" style={{ color: palette.muted }}>{SCOPES[scopeIdx].hint}</p>

      {/* Urgency */}
      <p className="mb-2 text-xs font-bold tracking-widest" style={{ color: accent }}>
        3. דחיפות
      </p>
      <div className="mb-2 flex gap-2">{URGENCIES.map((u, i) => (
        <button key={u.label} onClick={() => setUrgencyIdx(i)} style={segBtn(urgencyIdx === i)} type="button">
          {u.label}
        </button>
      ))}</div>
      <p className="mb-6 text-xs" style={{ color: palette.muted }}>{URGENCIES[urgencyIdx].hint}</p>

      {/* Result */}
      <div
        className="mt-2 rounded-2xl px-5 py-5"
        style={{
          background: palette.dark ? "rgba(0,0,0,0.35)" : "rgba(255,255,255,0.65)",
          border: `1px solid ${palette.border}`,
        }}
      >
        {base && low && high ? (
          <>
            <p className="text-sm" style={{ color: palette.muted }}>טווח השקעה צפוי</p>
            <p className="mt-1 text-2xl font-extrabold md:text-3xl" style={{ color: palette.headline }}>
              {(low / 1000).toFixed(0)}K — {(high / 1000).toFixed(1)}K שקלים
            </p>
            <p className="mt-1 text-xs" style={{ color: palette.muted }}>
              עדכוני מחיר בפועל נקבעים אחרי מדידה בבית שלכם.
            </p>
          </>
        ) : (
          <>
            <p className="text-sm" style={{ color: palette.muted }}>תמחור לשירות שנבחר</p>
            <p className="mt-1 text-2xl font-extrabold md:text-3xl" style={{ color: palette.headline }}>
              בהתאמה אישית מלאה
            </p>
          </>
        )}
      </div>

      {isAdmin && (
        <p className="mt-2 text-xs text-amber-400/80" {...editsFor(`services.${serviceIdx}.price`)}>
          (עריכת אדמין: מחיר יסוד = {data.services[serviceIdx]?.price ?? "—"})
        </p>
      )}

      <motion.a
        href={`https://wa.me/${data.businessInfo.whatsapp}?text=${encodeURIComponent(specText)}`}
        target="_blank"
        rel="noopener noreferrer"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.97 }}
        className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl py-4 text-base font-bold shadow-xl"
        style={{ background: accent, color: palette.dark ? "#14100a" : "#fdf9f3" }}
      >
        <MessageCircle className="h-5 w-5" aria-hidden="true" />
        שלח מפרט זה לוואטסאפ להצעה מדויקת
      </motion.a>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* 2) Before/After comparison slider + project lightbox                */
/* ------------------------------------------------------------------ */

export function BeforeAfterShowcase({
  accent,
  palette,
}: {
  accent: string;
  palette: Palette;
}) {
  const { data } = useSite();
  const projects = data.projects ?? ([] as ProjectItem[]);
  const [pos, setPos] = useState(50);
  const [lightbox, setLightbox] = useState<number | null>(null);
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const dragging = useRef(false);

  const project = projects[0];

  const moveFromEvent = (clientX: number) => {
    const rect = wrapRef.current?.getBoundingClientRect();
    if (!rect) return;
    const pct = ((clientX - rect.left) / rect.width) * 100;
    setPos(Math.min(94, Math.max(6, pct)));
  };

  if (!project) return null;

  return (
    <section>
      <div className="mb-7 flex items-center gap-3">
        <span
          className="flex h-11 w-11 items-center justify-center rounded-2xl"
          style={{ background: `${accent}1f`, color: accent }}
        >
          <Hammer className="h-5 w-5" aria-hidden="true" />
        </span>
        <div>
          <h3 className="text-xl font-bold md:text-2xl" style={{ color: palette.headline }}>
            לפני / אחרי — הפער שנשאר בעין
          </h3>
          <p className="text-sm" style={{ color: palette.muted }}>
            גררו את הברזל האמצעי ותראו מה עבודת בסטודיו עושה לחלל
          </p>
        </div>
      </div>

      <div
        ref={wrapRef}
        className="relative h-[300px] w-full cursor-ew-resize select-none overflow-hidden rounded-[2rem] md:h-[420px]"
        style={{ border: `1px solid ${palette.border}` }}
        onPointerDown={(e) => {
          dragging.current = true;
          moveFromEvent(e.clientX);
        }}
        onPointerMove={(e) => {
          if (dragging.current) moveFromEvent(e.clientX);
        }}
        onPointerUp={() => {
          dragging.current = false;
        }}
        onPointerLeave={() => {
          dragging.current = false;
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={project.beforeImage}
          alt="לפני"
          className="pointer-events-none absolute inset-0 h-full w-full object-cover"
          draggable={false}
        />
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={project.afterImage}
          alt="אחרי"
          className="pointer-events-none absolute inset-0 h-full w-full object-cover"
          draggable={false}
          style={{
            clipPath: `inset(0 ${100 - pos}% 0 0)`,
          }}
          dir="ltr"
        />
        {/* Handle */}
        <div
          className="pointer-events-none absolute inset-y-0"
          style={{ left: `${pos}%`, width: 2, background: accent }}
          dir="ltr"
        >
          <span
            className="absolute top-1/2 flex h-10 w-10 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full shadow-2xl"
            style={{ background: accent, left: 1, color: palette.dark ? "#14100a" : "#fdf9f3" }}
          >
            <Sliders className="h-4 w-4" aria-hidden="true" />
          </span>
        </div>
        <span
          className="absolute bottom-4 right-4 rounded-full px-3 py-1.5 text-xs font-bold"
          style={{ background: "rgba(0,0,0,0.55)", color: "#fff" }}
        >
          לפני — סטנדרט רגיל
        </span>
        <span
          className="absolute bottom-4 left-4 rounded-full px-3 py-1.5 text-xs font-bold"
          style={{ background: accent, color: palette.dark ? "#14100a" : "#fdf9f3" }}
        >
          אחרי — הסטנדרט שלנו
        </span>
      </div>

      {/* Project cards → lightbox */}
      <div className="mt-5 grid gap-5 md:grid-cols-2">
        {projects.map((p, i) => (
          <motion.button
            key={i}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: i * 0.08 }}
            onClick={() => setLightbox(i)}
            className="group overflow-hidden rounded-[1.5rem] text-right"
            style={{ background: palette.card, border: `1px solid ${palette.border}` }}
          >
            <span className="relative block h-44 overflow-hidden md:h-52">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={p.afterImage}
                alt={p.title}
                className="h-full w-full object-cover transition duration-700 group-hover:scale-105"
              />
              <span
                className="absolute bottom-3 right-3 rounded-full px-3 py-1.5 text-xs font-bold"
                style={{ background: accent, color: palette.dark ? "#14100a" : "#fdf9f3" }}
              >
                {p.beforeImage && p.afterImage ? "לחצו לפרוייקט המלא" : ""}
              </span>
            </span>
            <span className="block px-5 py-4">
              <span className="block text-lg font-bold" style={{ color: palette.headline }}>
                {p.title}
              </span>
              <span className="mt-1 block text-sm" style={{ color: palette.body }}>
                {p.description}
              </span>
            </span>
          </motion.button>
        ))}
      </div>

      <AnimatePresence>
        {lightbox !== null && projects[lightbox] && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setLightbox(null)}
            className="fixed inset-0 z-[98000] flex items-center justify-center bg-black/85 p-4 backdrop-blur"
          >
            <motion.figure
              initial={{ scale: 0.92, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.94, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="max-h-full w-full max-w-3xl overflow-y-auto rounded-[2rem]"
              style={{ background: palette.dark ? "#14100a" : "#fff" }}
            >
              <div className="relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={projects[lightbox].afterImage}
                  alt=""
                  className="h-[300px] w-full rounded-t-[2rem] object-cover md:h-[420px]"
                />
                <button
                  onClick={() => setLightbox(null)}
                  aria-label="סגור"
                  className="absolute left-4 top-4 flex h-10 w-10 items-center justify-center rounded-full bg-black/60 text-white"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              <figcaption className="px-6 py-5">
                <p className="text-xl font-bold" style={{ color: palette.headline }}>
                  {projects[lightbox].title}
                </p>
                <p className="mt-2 text-sm leading-relaxed" style={{ color: palette.body }}>
                  {projects[lightbox].description}
                </p>
              </figcaption>
            </motion.figure>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}

/* ------------------------------------------------------------------ */
/* 3) VIP callback drawer                                              */
/* ------------------------------------------------------------------ */

const CALLBACK_WINDOWS = [
  { value: "morning", label: "בוקר (08:00–12:00)" },
  { value: "noon", label: "צהריים (12:00–16:00)" },
  { value: "evening", label: "ערב (16:00–20:00)" },
] as const;

export function VipCallbackDrawer({
  accent,
  palette,
}: {
  accent: string;
  palette: Palette;
}) {
  const { data } = useSite();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [slot, setSlot] = useState("morning");

  const send = () => {
    const label =
      CALLBACK_WINDOWS.find((w) => w.value === slot)?.label ?? slot;
    const msg = `היי ${data.businessInfo.name}, שמי ${name || "—"}.\nאשמח לשיחת ייעוץ VIP — זמן מועדף לחזרה: ${label}.`;
    window.location.href = `https://wa.me/${data.businessInfo.whatsapp}?text=${encodeURIComponent(msg)}`;
    setOpen(false);
  };

  const triggerPosition = palette.dark
    ? { bottom: 24 }
    : { bottom: 24 };

  return (
    <>
      <motion.button
        initial={{ scale: 0, x: 40 }}
        animate={{ scale: 1, x: 0 }}
        transition={{ delay: 1.6, type: "spring", stiffness: 240, damping: 20 }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.96 }}
        onClick={() => setOpen(true)}
        className="fixed z-[9100] flex items-center gap-2 rounded-full px-5 py-3 text-sm font-bold shadow-2xl ltr:right-5 rtl:left-5"
        style={{
          background: `linear-gradient(120deg, ${accent}, ${accent}d9)`,
          color: palette.dark ? "#14100a" : "#fdf9f3",
          ...triggerPosition,
        }}
        aria-haspopup="dialog"
      >
        <Layers className="h-4 w-4" aria-hidden="true" />
        תיאום שיחת ייעוץ VIP
      </motion.button>

      <AnimatePresence>
        {open && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
              className="fixed inset-0 z-[92000] bg-black/60 backdrop-blur-sm"
            />
            <motion.aside
              initial={{ x: "-105%" }}
              animate={{ x: 0 }}
              exit={{ x: "-105%" }}
              transition={{ type: "spring", stiffness: 320, damping: 32 }}
              className="fixed inset-y-0 left-0 z-[92100] flex w-full max-w-sm flex-col p-7 shadow-2xl"
              style={{ background: palette.dark ? "#120e08" : palette.card, color: palette.headline }}
              role="dialog"
              aria-label="תיאום שיחת ייעוץ VIP"
            >
              <div className="mb-6 flex items-center justify-between">
                <h3 className="text-xl font-bold">תיאום שיחת ייעוץ VIP</h3>
                <button
                  onClick={() => setOpen(false)}
                  aria-label="סגור"
                  className="rounded-lg p-1.5 transition hover:bg-white/5"
                  style={{ color: palette.muted }}
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <label className="mb-5 block">
                <span className="mb-1.5 block text-sm font-semibold">השם שלך</span>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="למשל: דנה כהן"
                  className="w-full rounded-xl px-4 py-3 text-sm outline-none"
                  style={{
                    background: palette.dark ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.03)",
                    border: `1px solid ${palette.border}`,
                    color: palette.headline,
                  }}
                />
              </label>

              <p className="mb-2 text-sm font-semibold">מתי נוח לך שנחזור?</p>
              <div className="mb-7 flex flex-col gap-2">
                {CALLBACK_WINDOWS.map((w) => (
                  <button
                    key={w.value}
                    onClick={() => setSlot(w.value)}
                    className="flex items-center justify-between rounded-xl px-4 py-3 text-sm font-semibold transition"
                    style={{
                      border: `1px solid ${slot === w.value ? accent : palette.border}`,
                      background: slot === w.value ? `${accent}1a` : "transparent",
                      color: palette.body,
                    }}
                  >
                    <span className="flex items-center gap-2">
                      <Clock className="h-4 w-4" aria-hidden="true" />
                      {w.label}
                    </span>
                    {slot === w.value && <Check className="h-4 w-4" aria-hidden="true" />}
                  </button>
                ))}
              </div>

              <button
                onClick={send}
                className="mt-auto flex items-center justify-center gap-2 rounded-2xl py-4 text-base font-bold shadow-xl"
                style={{ background: accent, color: palette.dark ? "#14100a" : "#fdf9f3" }}
              >
                <Phone className="h-5 w-5" aria-hidden="true" />
                קבעו לי שיחת ייעוץ VIP
              </button>
              <p className="mt-3 text-center text-xs" style={{ color: palette.muted }}>
                הבקשה נשלחת ישירות לוואטסאפ של {data.businessInfo.name}
              </p>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

/* ------------------------------------------------------------------ */
/* 4) Availability badge + animated process timeline                   */
/* ------------------------------------------------------------------ */

export function AvailabilityBadge({
  accent,
  palette,
}: {
  accent: string;
  palette: Palette;
}) {
  const { data } = useSite();
  const city = data.businessInfo.address.split(",")[0]?.trim() || "העיר שלך";
  return (
    <span
      className="inline-flex items-center gap-2 rounded-full px-4 py-2 text-xs font-bold backdrop-blur"
      style={{
        border: `1px solid ${accent}55`,
        background: `${accent}14`,
        color: accent,
      }}
    >
      <span className="relative flex h-2.5 w-2.5">
        <span className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-60" style={{ background: accent }} />
        <span className="relative inline-flex h-2.5 w-2.5 rounded-full" style={{ background: accent }} />
      </span>
      <MapPin className="h-3.5 w-3.5" aria-hidden="true" />
      זמינות לקבלת פרויקטים חדשים ב{city}
    </span>
  );
}

export function ProcessTimeline({
  accent,
  palette,
  steps,
}: {
  accent: string;
  palette: Palette;
  steps?: TimelineStep[];
}) {
  const { data } = useSite();
  const timeline =
    steps ??
    data.processTimeline ??
    [
      { title: "שיחת היכרות", description: "שיחה קצרה שבה אנחנו מקשיבים לחזון שלך — בלי התחייבות." },
      { title: "מדידה ותכנון", description: "מדידה מקצועית בבית שלך, תוכנית מדויקת והצעת מחיר שקופה." },
      { title: "ייצור בסטודיו", description: "עבודת עץ בהתאמה אישית, עם עדכוני התקדמות שוטפים." },
      { title: "התקנה וליווי", description: "התקנה נקייה, קבלה מלאה, ואחריות של 5 שנים." },
    ];

  return (
    <section>
      <div className="mb-9 flex items-center gap-3">
        <span
          className="flex h-11 w-11 items-center justify-center rounded-2xl"
          style={{ background: `${accent}1f`, color: accent }}
        >
          <Compass className="h-5 w-5" aria-hidden="true" />
        </span>
        <h3 className="text-xl font-bold md:text-2xl" style={{ color: palette.headline }}>
          איך עובדים איתנו
        </h3>
      </div>

      <ol className="relative mx-auto max-w-2xl">
        {timeline.map((step, i) => (
          <motion.li
            key={i}
            initial={{ opacity: 0.25 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.6 }}
            className="relative flex items-start gap-5 pb-10 last:pb-0"
          >
            {i < timeline.length - 1 && (
              <span
                className="absolute right-[18px] top-12 h-[calc(100%-2.5rem)] w-[2px]"
                style={{
                  background: `linear-gradient(to bottom, ${accent}88, ${accent}22)`,
                }}
                aria-hidden="true"
              />
            )}
            <span
              className="relative z-10 flex h-10 w-10 shrink-0 items-center justify-center rounded-full font-bold shadow-lg"
              style={{
                background: `${accent}1f`,
                border: `1px solid ${accent}`,
                color: accent,
              }}
            >
              <Wrench className="h-4 w-4" aria-hidden="true" />
            </span>
            <div>
              <h4 className="text-lg font-bold" style={{ color: palette.headline }}>
                פרק {i + 1} — {step.title}
              </h4>
              <p className="mt-1 text-sm leading-relaxed" style={{ color: palette.body }}>
                {step.description}
              </p>
            </div>
          </motion.li>
        ))}
      </ol>
    </section>
  );
}
