"use client";

import React, { useRef, useState, useCallback } from "react";
import { MoveHorizontal } from "lucide-react";
import type { LuxTheme } from "@/lib/luxtheme";

interface BeforeAfterSliderProps {
  theme: LuxTheme;
  beforeImage?: string;
  afterImage?: string;
  beforeLabel?: string;
  afterLabel?: string;
  caption?: string;
  handleColor?: string;
}

/**
 * Interactive Before / After Split Comparison Slider.
 * A draggable metallic handle sweeps a clip that compares standard market
 * work (left/before) against our bespoke standard (right/after). Works with
 * mouse, touch and keyboard arrows. If no images exist for a business, it
 * degrades into an elegant labeled split without any broken imagery.
 */
export function BeforeAfterSlider({
  theme,
  beforeImage,
  afterImage,
  beforeLabel = "סטנדרט עבודה רגיל",
  afterLabel = "הסטנדרט הבספוק שלנו",
  caption = "גררו את הידית המתכתית וראו את ההפרש בעיניים",
  handleColor,
}: BeforeAfterSliderProps) {
  const [pos, setPos] = useState(50);
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const dragging = useRef(false);
  const accent = handleColor ?? theme.accent;

  const moveFromClientX = useCallback((clientX: number) => {
    const rect = wrapRef.current?.getBoundingClientRect();
    if (!rect) return;
    const pct = ((clientX - rect.left) / rect.width) * 100;
    setPos(Math.min(94, Math.max(6, pct)));
  }, []);

  const onPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    dragging.current = true;
    (e.currentTarget as HTMLDivElement).setPointerCapture?.(e.pointerId);
    moveFromClientX(e.clientX);
  };
  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (dragging.current) moveFromClientX(e.clientX);
  };
  const onPointerUp = () => {
    dragging.current = false;
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === "ArrowLeft") setPos((v) => Math.max(6, v - 4));
    if (e.key === "ArrowRight") setPos((v) => Math.min(94, v + 4));
  };

  const handleInk = theme.dark ? "#14100a" : "#fdf9f3";

  return (
    <div className="w-full">
      <p className="mb-2 text-center text-sm" style={{ color: theme.muted }}>
        {caption}
      </p>

      <div
        ref={wrapRef}
        role="slider"
        tabIndex={0}
        aria-valuenow={Math.round(pos)}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="השוואת לפני ואחרי"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerLeave={onPointerUp}
        onKeyDown={onKeyDown}
        className="relative h-[300px] w-full cursor-ew-resize select-none overflow-hidden rounded-[2rem] outline-none focus-visible:ring-2 md:h-[440px]"
        style={{
          border: `2px solid ${theme.border}`,
          background: theme.surface,
          boxShadow: theme.dark
            ? "0 30px 60px rgba(0,0,0,0.45)"
            : "0 30px 60px rgba(15,18,26,0.14)",
        }}
      >
        {/* BEFORE layer */}
        {beforeImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={beforeImage}
            alt={beforeLabel}
            draggable={false}
            className="pointer-events-none absolute inset-0 h-full w-full object-cover"
          />
        ) : (
          <div
            className="pointer-events-none absolute inset-0 flex items-center justify-center p-10"
            style={{
              background: theme.dark
                ? "linear-gradient(135deg, #191713, #22201b)"
                : "linear-gradient(135deg, #e7e2d8, #d9d2c4)",
            }}
          >
            <span className="text-center text-lg font-semibold" style={{ color: theme.muted }}>
              {beforeLabel}
            </span>
          </div>
        )}

        {/* AFTER layer (clipped from split to right edge) */}
        <div
          className="pointer-events-none absolute inset-0"
          style={{ clipPath: `inset(0 0 0 ${pos}%)` }}
          dir="ltr"
        >
          {afterImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={afterImage}
              alt={afterLabel}
              draggable={false}
              className="absolute inset-0 h-full w-full object-cover"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center p-10">
              <span
                className="text-center text-lg font-bold"
                style={{ color: theme.dark ? "#efe7d8" : "#2a2118" }}
              >
                {afterLabel}
              </span>
            </div>
          )}
        </div>

        {/* Split line/metallic handle */}
        <div
          className="pointer-events-none absolute inset-y-0 z-20"
          style={{ left: `${pos}%`, width: 2 }}
          dir="ltr"
        >
          <span
            className="absolute inset-y-0 left-1/2 w-[2px] -translate-x-1/2"
            style={{
              background: `linear-gradient(180deg, transparent, ${accent} 12%, #fff8 50%, ${accent} 88%, transparent)`,
              boxShadow: `0 0 14px ${accent}88`,
            }}
          />
          <span
            className="absolute top-1/2 flex h-12 w-12 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full"
            style={{
              background: `linear-gradient(145deg, ${lightenOrDarken(handleColor ?? theme.accent, 0.35)}, ${handleColor ?? theme.accent}, ${lightenOrDarken(handleColor ?? theme.accent, -0.25)})`,
              boxShadow: `0 6px 20px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,255,255,0.5), inset 0 -2px 4px rgba(0,0,0,0.3)`,
              color: handleColor === undefined && !theme.dark ? "#14100a" : "#151007",
            }}
          >
            <MoveHorizontal className="h-5 w-5" aria-hidden="true" strokeWidth={2.4} />
          </span>
        </div>

        {/* Labels */}
        <span
          className="pointer-events-none absolute bottom-4 right-4 z-10 rounded-full px-3.5 py-1.5 text-xs font-bold backdrop-blur"
          style={{ background: "rgba(0,0,0,0.55)", color: "#fff" }}
        >
          {beforeLabel}
        </span>
        <span
          className="pointer-events-none absolute bottom-4 left-4 z-10 rounded-full px-3.5 py-1.5 text-xs font-bold"
          style={{ background: accent, color: handleInk }}
        >
          {afterLabel}
        </span>
      </div>
    </div>
  );
}

/** Simple hex lighten / darken helper (amount −1..1). */
function lightenOrDarken(hex: string, amount: number): string {
  const clean = hex.replace("#", "");
  if (clean.length !== 6) return hex;
  const clamp = (v: number) => Math.max(0, Math.min(255, Math.round(v)));
  const r = parseInt(clean.slice(0, 2), 16);
  const g = parseInt(clean.slice(2, 4), 16);
  const b = parseInt(clean.slice(4, 6), 16);
  const target = amount > 0 ? 255 : 0;
  const f = Math.abs(amount);
  const mix = (c: number) => clamp(c + (target - c) * f);
  return `#${[mix(r), mix(g), mix(b)].map((v) => v.toString(16).padStart(2, "0")).join("")}`;
}
