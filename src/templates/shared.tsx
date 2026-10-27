"use client";

import React, { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { useSite } from "@/components/SiteProvider";
import type { FaqItem } from "@/types/site";

/* ------------------------------------------------------------------ */
/* Hebrew editorial headline engine                                    */
/* ------------------------------------------------------------------ */

/** Common Hebrew clause starters that n8n concatenates directly onto the
 * tail of the first headline part (e.g. "נגרות יוקרתי" + "את הבית" →
 * "נגרות יוקרתיאת הבית"). Repair the missing space at the junction. */
const CLAUSE_STARTERS = [
  "את",
  "אבל",
  "עם",
  "שתמיד",
  "שאליהם",
  "שאנחנו",
  "שנבנים",
  "שמקרבת",
  "שתרצו",
  "שהחלום",
  "דוגמת",
  "כמו",
  "לקבלת",
  "להזמנת",
  "לעסק",
  "ברמה",
  "בלב",
] as const;

/** Real Hebrew words that legitimately end with a starter-like suffix and
 * must NOT be split. */
const GLUE_EXCEPTIONS = new Set([
  "מאת",
  "מטעם",
  "קראת",
  "שראת",
  "נאת",
  "קוראת",
  "מתעדכנת",
  "ראתה",
]);

/** Collapse repeated whitespace and re-glue words that lost their space
 * when two generated headline parts were concatenated. */
export function normalizeHeadline(raw: string): string {
  const s = (raw ?? "").replace(/\s+/g, " ").trim();
  return s
    .split(" ")
    .map((token) => {
      if (token.length < 5 || GLUE_EXCEPTIONS.has(token)) return token;
      for (const starter of CLAUSE_STARTERS) {
        if (!token.endsWith(starter) || token.length <= starter.length) continue;
        const prefix = token.slice(0, token.length - starter.length);
        if (prefix.length < 3) continue;
        return `${prefix} ${starter}`;
      }
      return token;
    })
    .join(" ");
}

/**
 * Split an editorial headline into two intentionally balanced lines.
 * Breaks before the last clause when that keeps both lines readable;
 * otherwise splits at the word midway.
 */
export function splitHeadline(raw: string): [string, string] | [string] {
  const s = normalizeHeadline(raw);
  const words = s.split(" ");
  if (words.length <= 1) return [s];

  let breakAt = Math.ceil(words.length / 2);
  for (let i = Math.floor(words.length * 0.35); i < words.length - 1; i++) {
    if (CLAUSE_STARTERS.some((st) => words[i] === st || words[i].startsWith(st))) {
      breakAt = i;
      break;
    }
  }
  const first = words.slice(0, breakAt).join(" ");
  const second = words.slice(breakAt).join(" ");
  return first && second ? [first, second] : [s];
}

/** Render a split headline with clean spacing + an intentional <br />. */
export function EditorialHeadline({
  text,
  className = "",
  style,
}: {
  text: string;
  className?: string;
  style?: React.CSSProperties;
}) {
  const lines = splitHeadline(text);
  return (
    <span className={className} style={style}>
      {lines.map((line, i) => (
        <React.Fragment key={i}>
          {i > 0 && <br />}
          {line}
        </React.Fragment>
      ))}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* Shared commerce + rating helpers                                    */
/* ------------------------------------------------------------------ */

export function parsePrice(text?: string): number | null {
  if (!text) return null;
  const digits = text.replace(/[^\d]/g, "");
  const n = digits ? parseInt(digits, 10) : NaN;
  return Number.isFinite(n) && n > 0 ? n : null;
}

export function formatNis(value: number): string {
  return `₪${Math.round(value).toLocaleString("he-IL")}`;
}

export function waLink(whatsapp: string, message: string): string {
  return `https://wa.me/${whatsapp.replace(/[^\d]/g, "")}?text=${encodeURIComponent(message)}`;
}

/**
 * Typographic rating mark — five precision bars, no icon-set stars.
 * Keeps the data readable without the generic "star row" AI pattern.
 */
export function RatingBars({
  rating,
  color = "currentColor",
  className = "",
}: {
  rating: number;
  color?: string;
  className?: string;
}) {
  const filled = Math.max(0, Math.min(5, Math.round(rating)));
  return (
    <span
      className={`inline-flex items-end gap-1 ${className}`}
      role="img"
      aria-label={`דירוג ${rating} מתוך 5`}
      title={`${rating} / 5`}
    >
      {Array.from({ length: 5 }).map((_, i) => (
        <span
          key={i}
          className="block w-[3px]"
          style={{
            height: `${6 + i * 2}px`,
            background: i < filled ? color : "currentColor",
            opacity: i < filled ? 1 : 0.2,
          }}
        />
      ))}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* FAQ accordion (restyled per template through `classes`)             */
/* ------------------------------------------------------------------ */

export function FaqAccordion({
  items,
  classes,
}: {
  items: FaqItem[];
  classes: {
    card: string;
    button: string;
    icon: string;
    answer: string;
  };
}) {
  const [openIdx, setOpenIdx] = useState<number | null>(0);
  const { editsFor } = useSite();

  return (
    <div className="flex flex-col gap-0">
      {items.map((item, i) => {
        const open = openIdx === i;
        return (
          <div key={i} className={`${classes.card} overflow-hidden`}>
            <button
              type="button"
              onClick={() => setOpenIdx(open ? null : i)}
              aria-expanded={open}
              className={classes.button}
            >
              <span className="text-right font-semibold" {...editsFor(`faq.${i}.question`)}>
                {item.question}
              </span>
              <ChevronDown
                className={`${classes.icon} shrink-0 transition-transform duration-300 ${open ? "rotate-180" : ""}`}
                aria-hidden="true"
              />
            </button>
            <AnimatePresence initial={false}>
              {open && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.28, ease: "easeInOut" }}
                >
                  <p className={`${classes.answer}`} {...editsFor(`faq.${i}.answer`)}>
                    {item.answer}
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}

/* ---------- Motion helpers ---------- */

export const fadeUp = {
  initial: { opacity: 0, y: 28 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-60px" },
  transition: { duration: 0.6, ease: "easeOut" as const },
};
