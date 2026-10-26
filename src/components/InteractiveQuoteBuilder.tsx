"use client";

import React, { useEffect, useMemo, useState } from "react";
import { motion, useMotionValue, useTransform, animate } from "framer-motion";
import { MessageCircle, Sliders } from "lucide-react";
import { useSite } from "@/components/SiteProvider";
import type { LuxTheme } from "@/lib/luxtheme";

const SCALES = [
  { value: "standard", label: "סטנדרט", multiplier: 1, hint: "פרויקט ממוצע בהיקף שגור" },
  { value: "premium", label: "פרימיום", multiplier: 1.65, hint: "חומרים יוקרתיים וסטנדרט גימור גבוה" },
  { value: "vip", label: "VIP מותאם אישית", multiplier: 2.9, hint: "סטנדרט אוטור שמעוצב סביב הבית שלכם" },
] as const;

const URGENCIES = [
  { value: "flexible", label: "גמיש", multiplier: 1, hint: "לוחות זמנים גמישים" },
  { value: "soon", label: "השבוע", multiplier: 1.25, hint: "הפרויקט מתחיל בשבוע הקרוב" },
  { value: "rush", label: "דחוף", multiplier: 1.55, hint: "עדיפות מיידית בסטודיו" },
] as const;

function parsePrice(text?: string): number | null {
  if (!text) return null;
  const digits = text.replace(/[^\d]/g, "");
  if (!digits) return null;
  const n = parseInt(digits, 10);
  return Number.isFinite(n) && n > 0 ? n : null;
}

/**
 * Interactive Live Price & Spec Configurator.
 * Visitors pick a service, project scale and urgency; a live animated meter
 * reflects the range in real time, and one click sends the exact spec to
 * WhatsApp pre-formatted.
 */
export function InteractiveQuoteBuilder({ theme }: { theme: LuxTheme }) {
  const { data } = useSite();
  const [serviceIdx, setServiceIdx] = useState(0);
  const [scaleIdx, setScaleIdx] = useState(0);
  const [urgencyIdx, setUrgencyIdx] = useState(0);

  const basePrices = useMemo(
    () => data.services.map((s) => parsePrice(s.price)),
    [data.services],
  );
  const base = basePrices[serviceIdx] ?? null;
  const scale = SCALES[scaleIdx];
  const urgency = URGENCIES[urgencyIdx];
  const low = base ? Math.round((base * scale.multiplier) / 100) * 100 : null;
  const high = base ? Math.round(((low ?? 0) * urgency.multiplier) / 100) * 100 : null;

  // 0..1 progress across the meter (log-ish feel for multipliers)
  const meterValue = (base ?? 0) * scale.multiplier * urgency.multiplier;
  const meterMax = useMemo(() => {
    const maxBase = Math.max(...basePrices.filter((p): p is number => p !== null), 20000);
    return maxBase * 2.9 * 1.55;
  }, [basePrices]);
  const pct = base ? Math.min(1, meterValue / meterMax) : 0.62;

  // Animated price counter driven by the meter progress (0..1)
  const mv = useMotionValue(0);
  const shownLow = useTransform(mv, (v) =>
    low ? `${Math.round(low * v).toLocaleString("he-IL")}` : "",
  );
  const shownHigh = useTransform(mv, (v) =>
    low && high ? `${Math.round(low + (high - low) * v).toLocaleString("he-IL")}` : "",
  );

  useEffect(() => {
    const controls = animate(mv, pct, { duration: 0.7, ease: [0.22, 1, 0.36, 1] });
    return () => controls.stop();
  }, [mv, pct]);

  const specText = useMemo(() => {
    const s = data.services[serviceIdx];
    const lines = [
      `שלום, המפרט שלי מהאתר של ${data.businessInfo.name}:`,
      `• שירות: ${s?.title ?? ""}`,
      `• היקף: ${scale.label}${base ? "" : " (בהתאמה אישית)"}`,
      `• דחיפות: ${urgency.label}`,
    ];
    if (low && high) {
      lines.push(
        `• טווח מחיר צפוי: ${low.toLocaleString("he-IL")}–${high.toLocaleString("he-IL")} ₪`,
      );
    } else {
      lines.push("• מתעניין בהצעת מחיר מותאמת אישית");
    }
    lines.push("אשמח להצעה מדויקת בהתאם למפרט הזה.");
    return lines.join("\n");
  }, [data, serviceIdx, scale, urgency, low, high, base]);

  const segStyle = (active: boolean): React.CSSProperties => ({
    padding: "10px 8px",
    borderRadius: 12,
    fontSize: 13,
    fontWeight: 700,
    cursor: "pointer",
    color: active ? (theme.dark ? "#14100a" : "#fdf9f3") : theme.muted,
    background: active ? theme.accent : theme.surface,
    border: `1px solid ${active ? theme.accent : theme.border}`,
    transition: "all .2s",
    width: "100%",
  });

  return (
    <section
      className="overflow-hidden rounded-[2rem] p-7 backdrop-blur md:p-10"
      style={{ background: theme.surface, border: `1px solid ${theme.border}` }}
      id="quote-builder"
    >
      <div className="mb-7 flex items-center gap-3">
        <span
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl"
          style={{ background: `${theme.accent}1f`, color: theme.accent }}
        >
          <Sliders className="h-5 w-5" aria-hidden="true" />
        </span>
        <div>
          <h3
            className="text-xl font-bold md:text-2xl"
            style={{ color: theme.headline, fontFamily: theme.fontSerif }}
          >
            בונה המפרט החי — מחיר בזמן אמת
          </h3>
          <p className="text-sm" style={{ color: theme.muted }}>
            בחרו שירות, היקף ודחיפות — ותקבלו ממד חי של ההשקעה הצפויה
          </p>
        </div>
      </div>

      {/* 1 — Service type */}
      <p className="mb-2 text-xs font-bold tracking-widest" style={{ color: theme.accent }}>
        1. סוג השירות
      </p>
      <div className="mb-6 grid grid-cols-2 gap-2 sm:grid-cols-4">
        {data.services.map((s, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setServiceIdx(i)}
            style={segStyle(serviceIdx === i)}
          >
            {s.title}
          </button>
        ))}
      </div>

      {/* 2 — Scale */}
      <p className="mb-2 text-xs font-bold tracking-widest" style={{ color: theme.accent }}>
        2. היקף / רמת הפרויקט
      </p>
      <div className="mb-2 grid grid-cols-3 gap-2">
        {SCALES.map((sc, i) => (
          <button
            key={sc.value}
            type="button"
            onClick={() => setScaleIdx(i)}
            style={segStyle(scaleIdx === i)}
          >
            {sc.label}
          </button>
        ))}
      </div>
      <p className="mb-6 text-xs" style={{ color: theme.muted }}>
        {scale.hint}
      </p>

      {/* 3 — Urgency */}
      <p className="mb-2 text-xs font-bold tracking-widest" style={{ color: theme.accent }}>
        3. דחיפות התחלה
      </p>
      <div className="mb-2 grid grid-cols-3 gap-2">
        {URGENCIES.map((u, i) => (
          <button
            key={u.value}
            type="button"
            onClick={() => setUrgencyIdx(i)}
            style={segStyle(urgencyIdx === i)}
          >
            {u.label}
          </button>
        ))}
      </div>
      <p className="mb-7 text-xs" style={{ color: theme.muted }}>
        {urgency.hint}
      </p>

      {/* Live meter */}
      <div
        className="rounded-2xl p-5"
        style={{
          background: theme.dark ? "rgba(0,0,0,0.35)" : "rgba(255,255,255,0.6)",
          border: `1px solid ${theme.border}`,
        }}
      >
        <div className="flex items-center justify-between gap-4">
          <p className="text-sm" style={{ color: theme.muted }}>
            ההשקעה הצפויה
          </p>
          {base ? (
            <p className="text-2xl font-extrabold md:text-3xl" style={{ color: theme.headline }} dir="ltr">
              {low !== null && (
                <motion.span>{shownLow}</motion.span>
              )}
              {low !== null && high !== null && (
                <span style={{ color: theme.muted, fontSize: "0.6em" }}> — </span>
              )}
              {high !== null && (
                <motion.span>{shownHigh}</motion.span>
              )}
            </p>
          ) : (
            <p className="text-2xl font-extrabold md:text-3xl" style={{ color: theme.headline }}>
              בהתאמה אישית מלאה
            </p>
          )}
        </div>

        {/* Animated meter bar */}
        <div
          className="mt-4 h-3 w-full overflow-hidden rounded-full"
          style={{ background: theme.dark ? "rgba(255,255,255,0.08)" : "rgba(15,18,26,0.08)" }}
          dir="ltr"
          role="meter"
          aria-valuenow={Math.round(pct * 100)}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="מד השקעה חי"
        >
          <motion.div
            className="h-full rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${pct * 100}%` }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            style={{
              background: `linear-gradient(90deg, ${theme.accent}66, ${theme.accent}, #ffffff88)`,
              boxShadow: `0 0 14px ${theme.accent}66`,
            }}
          />
        </div>
        <div className="mt-1.5 flex justify-between text-[10px]" style={{ color: theme.muted }} dir="ltr">
          <span>סטנדרט</span>
          <span>פרימיום</span>
          <span>VIP</span>
        </div>
        <p className="mt-3 text-xs" style={{ color: theme.muted }}>
          מידע זה הוא הערכה. המחיר הסופי נקבע אחרי שיחה קצרה וביקור מדידה בבית שלכם — ללא התחייבות.
        </p>
      </div>

      <motion.a
        href={`https://wa.me/${data.businessInfo.whatsapp}?text=${encodeURIComponent(specText)}`}
        target="_blank"
        rel="noopener noreferrer"
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.97 }}
        className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl py-4 text-base font-bold shadow-xl"
        style={{ background: theme.accent, color: theme.dark ? "#14100a" : "#fdf9f3" }}
      >
        <MessageCircle className="h-5 w-5" fill="currentColor" aria-hidden="true" />
        שלחו את המפרט הזה לוואטסאפ — קבלו הצעה מדויקת
      </motion.a>
    </section>
  );
}
