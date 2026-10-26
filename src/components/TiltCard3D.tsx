"use client";

import React, { useCallback, useRef, useState } from "react";
import type { CSSProperties, ReactNode } from "react";
import type { LuxTheme } from "@/lib/luxtheme";

interface TiltCard3DProps {
  theme: LuxTheme;
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  /** CSS perspective of the 3D space */
  perspective?: number;
  /** Max tilt angle in degrees */
  maxTilt?: number;
  /** Glare opacity (0–1) */
  glare?: number;
}

/**
 * 3D Perspective Tilt Card with a false-apple specular glare.
 * Physically tilts in 3D space (perspective + rotateX/rotateY) following the
 * pointer/touch position, with a moving metallic light reflection across the
 * surface. Springs back flat on leave.
 */
export function TiltCard3D({
  theme,
  children,
  className = "",
  style,
  perspective = 1200,
  maxTilt = 10,
  glare = 0.14,
}: TiltCard3DProps) {
  const ref = useRef<HTMLDivElement | null>(null);
  const frame = useRef<number | null>(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [glarePos, setGlarePos] = useState({ x: 50, y: 50 });
  const [hover, setHover] = useState(false);

  const handleMove = useCallback(
    (clientX: number, clientY: number) => {
      const el = ref.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const px = (clientX - rect.left) / rect.width; // 0..1
      const py = (clientY - rect.top) / rect.height; // 0..1
      // rotateY follows horizontal, rotateX inverse of vertical
      const y = (px - 0.5) * 2; // -1..1
      const x = -(py - 0.5) * 2; // -1..1
      if (frame.current !== null) cancelAnimationFrame(frame.current);
      frame.current = requestAnimationFrame(() => {
        setTilt({ x: x * maxTilt, y: y * maxTilt });
        setGlarePos({ x: px * 100, y: py * 100 });
      });
    },
    [maxTilt],
  );

  const onPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    handleMove(e.clientX, e.clientY);
  };

  const reset = () => {
    if (frame.current !== null) cancelAnimationFrame(frame.current);
    setHover(false);
    setTilt({ x: 0, y: 0 });
  };

  return (
    <div style={{ perspective: `${perspective}px`, transformStyle: "preserve-3d" }}>
      <div
        ref={ref}
        onPointerMove={onPointerMove}
        onPointerEnter={() => setHover(true)}
        onPointerLeave={reset}
        className={`relative will-change-transform ${className}`}
        style={{
          ...style,
          transform: hover
            ? `rotateX(${tilt.x.toFixed(2)}deg) rotateY(${tilt.y.toFixed(2)}deg) translateZ(6px) scale(1.015)`
            : "rotateX(0deg) rotateY(0deg) translateZ(0)",
          transition: hover
            ? "transform 60ms linear"
            : "transform 420ms cubic-bezier(0.22, 1, 0.36, 1)",
          transformStyle: "preserve-3d",
        }}
      >
        {/* Specular glare — moving metallic light reflection */}
        {hover && glare > 0 && (
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 overflow-hidden"
            style={{ borderRadius: "inherit" }}
          >
            <span
              className="absolute inset-0"
              style={{
                background: `radial-gradient(340px circle at ${glarePos.x}% ${glarePos.y}%, rgba(255,255,255,${glare}), transparent 60%)`,
                mixBlendMode: theme.dark ? "screen" : "soft-light",
                transition: "background 60ms linear",
              }}
            />
          </span>
        )}
        {children}
      </div>
    </div>
  );
}
