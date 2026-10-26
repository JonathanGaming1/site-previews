"use client";

import React, { useEffect, useState } from "react";
import { ShieldAlert } from "lucide-react";
import { useSite } from "@/components/SiteProvider";

/**
 * Demo experience guard.
 * Active only when siteData.isDemo === true and the visitor has no secret ?key=.
 * - Renders a single sleek bottom dock bar linking to checkout.
 * - Blocks context menu / selection / F12 / devtools shortcuts.
 * - Tamper watchdog: a lightweight `MutationObserver` scoped to the dock
 *   container only. NO poll timers — zero CPU overhead while browsing.
 *   (The previous 400ms setInterval with getComputedStyle/getBoundingClientRect
 *   per tick burned the main thread and degraded every click.)
 */
export function SecurityGuard() {
  const { data, isAdmin, mounted, slug } = useSite();
  const [locked, setLocked] = useState(false);
  const [dockRef, setDockRef] = useState<HTMLDivElement | null>(null);
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

  // Tamper Watchdog — MutationObserver on the dock container ONLY.
  // Fires the lock when the dock is detached from the DOM. CSS-based tampering
  // (opacity/display/visibility) is detected via attribute observation as well.
  useEffect(() => {
    if (!active || !dockRef) return;

    let fired = false;
    const lock = () => {
      if (fired) return;
      fired = true;
      document.documentElement.style.filter = "blur(25px)";
      document.documentElement.style.pointerEvents = "none";
      setLocked(true);
    };

    const checkIntegrity = () => {
      if (fired) return;
      if (!dockRef || !document.body.contains(dockRef)) {
        lock();
        return;
      }
      const style = window.getComputedStyle(dockRef);
      const rect = dockRef.getBoundingClientRect();
      const inViewport =
        rect.left < window.innerWidth &&
        rect.right > 0 &&
        rect.bottom > 0 &&
        rect.height > 0;
      const visuallyIntact =
        parseFloat(style.opacity) > 0.5 &&
        style.display !== "none" &&
        style.visibility !== "hidden" &&
        rect.height > 15;
      if (!inViewport || !visuallyIntact) lock();
    };

    // One observer, scoped to the dock element and its ancestors chain latch.
    const observer = new MutationObserver(checkIntegrity);
    observer.observe(dockRef, { attributes: true, attributeFilter: ["style", "class", "hidden"] });
    observer.observe(document.body, { childList: true, subtree: false });

    // Watch for direct detachment of the dock itself.
    let dockParent: HTMLElement | null = dockRef.parentElement;
    while (dockParent && dockParent !== document.body) {
      const parentEl = dockParent;
      const ancestorObserver = new MutationObserver(checkIntegrity);
      ancestorObserver.observe(parentEl, { childList: true });
      dockParent = parentEl.parentElement;
    }

    return () => {
      observer.disconnect();
      document.documentElement.style.filter = "";
      document.documentElement.style.pointerEvents = "";
    };
  }, [active, dockRef]);

  if (!active) return null;

  const checkoutHref = `/checkout?site=${encodeURIComponent(slug ?? data.slug ?? "default")}`;

  return (
    <>
      {locked && <LockOverlay />}

      {/* Compact frosted-glass demo dock */}
      <div
        ref={setDockRef}
        id="demo-guard-dock"
        className="fixed inset-x-0 bottom-3 z-[99999] flex justify-center px-4"
      >
        <a
          href={checkoutHref}
          className="group flex w-full max-w-2xl items-center justify-center gap-2 rounded-full border px-5 py-2.5 text-center text-[13px] font-medium leading-snug backdrop-blur-2xl shadow-[0_8px_32px_rgba(0,0,0,0.35)] transition-transform duration-300 hover:scale-[1.02] sm:text-sm"
          style={{
            background: "rgba(12,12,15,0.55)",
            borderColor: "rgba(255,255,255,0.16)",
            color: "rgba(255,255,255,0.88)",
            WebkitBackdropFilter: "blur(20px saturate(180%))",
            backdropFilter: "blur(20px saturate(180%))",
          }}
        >
          <ShieldAlert
            className="h-3.5 w-3.5 shrink-0 opacity-70"
            style={{ color: "rgba(255,255,255,0.7)" }}
            aria-hidden="true"
          />
          <span>
            הדגמה חיה עבור{" "}
            <span className="font-semibold text-white">{data.businessInfo.name}</span>
            {" • "}
            <span className="font-semibold text-white underline decoration-white/30 underline-offset-4 transition group-hover:decoration-white/60">
              להפעלת האתר המלא לחצו כאן
            </span>
          </span>
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
      <span className="flex h-16 w-16 items-center justify-center rounded-full border border-white/15 bg-white/5">
        <ShieldAlert className="h-8 w-8 text-white/70" aria-hidden="true" />
      </span>
      <h1 className="text-2xl font-bold text-white sm:text-3xl">האתר נחסם זמנית</h1>
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
