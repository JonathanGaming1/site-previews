"use client";

import React, { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown, MessageCircle, Phone, Star } from "lucide-react";
import { useSite } from "@/components/SiteProvider";
import type { FaqItem } from "@/types/site";

/* ---------- Star row ---------- */
export function Stars({
  rating,
  className = "h-4 w-4",
  starClass = "text-amber-400",
}: {
  rating: number;
  className?: string;
  starClass?: string;
}) {
  return (
    <span className="inline-flex items-center gap-0.5" dir="ltr" aria-label={`דירוג ${rating} מתוך 5`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          className={`${className} ${i < rating ? starClass : "text-gray-400/40"}`}
          fill={i < rating ? "currentColor" : "none"}
          aria-hidden="true"
        />
      ))}
    </span>
  );
}

/* ---------- FAQ accordion ---------- */
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
    <div className="mx-auto flex max-w-3xl flex-col gap-3">
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

/* ---------- Floating WhatsApp ---------- */
export function WhatsAppFab({ accentColor }: { accentColor: string }) {
  const { data } = useSite();
  return (
    <motion.a
      href={`https://wa.me/${data.businessInfo.whatsapp}?text=${encodeURIComponent("היי, אשמח לקבל פרטים נוספים 😊")}`}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="צרו קשר בוואטסאפ"
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      transition={{ delay: 1.2, type: "spring", stiffness: 260, damping: 18 }}
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.94 }}
      className="fixed bottom-24 z-[9000] flex h-14 w-14 items-center justify-center rounded-full text-white shadow-2xl ltr:left-5 rtl:right-5 md:bottom-6"
      style={{
        background: `linear-gradient(135deg,#25D366, ${accentColor})`,
        boxShadow: `0 10px 30px ${accentColor}55`,
      }}
    >
      <MessageCircle className="h-7 w-7" fill="currentColor" aria-hidden="true" />
      <span className="absolute inset-0 -z-10 animate-ping rounded-full bg-[#25D366]/40 [animation-duration:2.5s]" />
    </motion.a>
  );
}

/* ---------- Sticky mobile action bar ---------- */
export function MobileActionBar({
  accentColor,
  variant,
}: {
  accentColor: string;
  variant: "dark" | "light" | "warm";
}) {
  const { data } = useSite();
  const bg =
    variant === "dark"
      ? "rgba(10,10,14,0.92)"
      : variant === "light"
        ? "rgba(255,255,255,0.94)"
        : "rgba(245,238,228,0.95)";
  const fg = variant === "dark" ? "#f5f5f5" : "#1a1712";
  const sub = variant === "dark" ? "#9ca3af" : "#6b6455";

  return (
    <div
      className="fixed inset-x-0 bottom-0 z-[9500] flex items-center justify-between gap-2 border-t px-4 py-3 backdrop-blur-md md:hidden"
      style={{ background: bg, borderColor: variant === "dark" ? "#ffffff1a" : "#00000014", color: fg }}
    >
      <a
        href={`tel:${data.businessInfo.phone}`}
        className="flex flex-1 flex-col items-center gap-0.5 text-center"
      >
        <Phone className="h-5 w-5" aria-hidden="true" />
        <span className="text-[11px] font-semibold">התקשרו אלינו</span>
      </a>
      <a
        href={data.checkoutUrl}
        className="flex flex-1 items-center justify-center gap-1.5 rounded-xl px-4 py-2.5 text-sm font-bold text-gray-950"
        style={{ background: accentColor }}
      >
        לרכישת האתר
      </a>
      <a
        href={`https://wa.me/${data.businessInfo.whatsapp}`}
        target="_blank"
        rel="noopener noreferrer"
        className="flex flex-1 flex-col items-center gap-0.5 text-center"
      >
        <MessageCircle className="h-5 w-5 text-[#25D366]" aria-hidden="true" />
        <span className="text-[11px] font-semibold" style={{ color: sub }}>
          וואטסאפ
        </span>
      </a>
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
