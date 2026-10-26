"use client";

import React, { useEffect, useRef, useState } from "react";
import { ShieldAlert, ShoppingBag } from "lucide-react";
import { useSite } from "@/components/SiteProvider";

/**
 * Anti-F12 demo protection + un-removable watermark.
 * Active only when siteData.isDemo === true and the visitor has no secret ?key=.
 * A watchdog (MutationObserver + 400ms interval) verifies the watermark is
 * present, inside the viewport and visually intact; tampering blurs & locks
 * the entire page.
 */
export function SecurityGuard() {
  const { data, isAdmin, mounted } = useSite();
  const [locked, setLocked] = useState(false);
  const watermarkRef = useRef<HTMLDivElement | null>(null);
  const active = mounted && data.isDemo && !isAdmin;

  // Event blocking: context menu, selection and F12 / devtools shortcuts
  useEffect(() => {
    if (!active) return;

    const onContextMenu = (e: MouseEvent) => e.preventDefault();
    const onKeyDown = (e: KeyboardEvent) => {
      const key = e.key;
      const ctrlShift = e.ctrlKey && e.shiftKey;
      const ctrl = e.ctrlKey;
      if (
        key === "F12" ||
        (ctrlShift && (key === "I" || key === "J" || key === "C")) ||
        (ctrl && key === "u") ||
        (ctrl && key === "U")
      ) {
        e.preventDefault();
        e.stopPropagation();
      }
    };

    document.documentElement.classList.add("guard-active");
    document.addEventListener("contextmenu", onContextMenu);
    document.addEventListener("keydown", onKeyDown, true);

    return () => {
      document.documentElement.classList.remove("guard-active");
      document.removeEventListener("contextmenu", onContextMenu);
      document.removeEventListener("keydown", onKeyDown, true);
    };
  }, [active]);

  // Tamper Watchdog
  useEffect(() => {
    if (!active) return;

    let fired = false;
    const check = () => {
      if (fired) return;
      const el = watermarkRef.current;
      if (!el || !document.body.contains(el)) {
        fired = true;
      } else {
        const rect = el.getBoundingClientRect();
        const style = window.getComputedStyle(el);
        const inViewport =
          rect.left < window.innerWidth &&
          rect.right > 0 &&
          rect.top < window.innerHeight &&
          rect.bottom > 0 &&
          rect.width > 0 &&
          rect.height > 0;
        const visuallyIntact =
          parseFloat(style.opacity) > 0.8 &&
          style.display !== "none" &&
          style.visibility !== "hidden" &&
          parseFloat(style.width || "0") > 0;
        if (!inViewport || !visuallyIntact) fired = true;
      }
      if (fired) {
        document.documentElement.style.filter = "blur(25px)";
        document.documentElement.style.pointerEvents = "none";
        setLocked(true);
      }
    };

    const interval = window.setInterval(check, 400);
    const observer = new MutationObserver(check);
    observer.observe(document.body, { childList: true, subtree: true, attributes: true });

    return () => {
      window.clearInterval(interval);
      observer.disconnect();
      document.documentElement.style.filter = "";
      document.documentElement.style.pointerEvents = "";
    };
  }, [active]);

  if (!active) return null;

  return (
    <>
      {locked && <LockOverlay />}

      {/* Diagonal full-screen watermark */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-[99998] overflow-hidden"
        style={{ userSelect: "none" }}
      >
        {Array.from({ length: 5 }).map((_, i) => (
          <span
            key={i}
            className="absolute whitespace-nowrap rotate-[-38deg] text-[4vw] font-bold opacity-[0.04]"
            style={{
              top: `${12 + i * 22}%`,
              right: i % 2 === 0 ? "-8%" : "12%",
              color: "#ffffff",
              textShadow: "0 0 1px rgba(0,0,0,0.35)",
            }}
          >
            אתר הדגמה • {data.businessInfo.name}
          </span>
        ))}
      </div>

      {/* Persistent bottom watermark bar */}
      <div
        ref={watermarkRef}
        id="demo-watermark"
        className="fixed inset-x-0 bottom-0 z-[99999] flex flex-col items-center justify-center gap-2 px-4 py-3 text-center shadow-[0_-8px_30px_rgba(0,0,0,0.45)] sm:flex-row sm:gap-4"
        style={{ background: "linear-gradient(90deg,#111318,#1c1f26,#111318)" }}
      >
        <ShieldAlert className="h-5 w-5 shrink-0 text-amber-400" aria-hidden="true" />
        <p className="text-sm font-medium text-gray-100 sm:text-base">
          הדגמה חיה עבור{" "}
          <span className="font-bold text-amber-300">{data.businessInfo.name}</span> •
          לרכישת האתר והסרת סימן המים לחצו כאן
        </p>
        <a
          href={data.checkoutUrl}
          className="inline-flex items-center gap-2 rounded-xl bg-amber-400 px-5 py-2 text-sm font-bold text-gray-950 shadow-lg shadow-amber-500/30 transition hover:bg-amber-300 active:scale-95"
        >
          <ShoppingBag className="h-4 w-4" aria-hidden="true" />
          רכשו את האתר עכשיו
        </a>
      </div>
    </>
  );
}

function LockOverlay() {
  return (
    <div
      className="fixed inset-0 z-[100000] flex flex-col items-center justify-center gap-6 bg-gray-950/95 px-6 text-center"
      style={{ pointerEvents: "auto" }}
      role="alert"
    >
      <span className="flex h-20 w-20 items-center justify-center rounded-full border-2 border-red-500/40 bg-red-500/10">
        <ShieldAlert className="h-10 w-10 text-red-400" aria-hidden="true" />
      </span>
      <h1 className="text-2xl font-bold text-white sm:text-3xl">
        האתר נחסם זמנית
      </h1>
      <p className="max-w-xl text-lg leading-relaxed text-gray-300">
        מערכת האבטחה זיהתה ניסיון לעקוף את מצב ההדגמה. לצפייה באתר יש לרענן את
        העמוד.
      </p>
      <button
        onClick={() => window.location.reload()}
        className="rounded-xl bg-white px-8 py-3 text-base font-bold text-gray-950 shadow-lg transition hover:bg-gray-200"
      >
        רענון העמוד
      </button>
    </div>
  );
}
