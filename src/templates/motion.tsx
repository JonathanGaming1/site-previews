"use client";

import React, {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import {
  motion,
  useMotionTemplate,
  useMotionValue,
  useMotionValueEvent,
  useScroll,
  useSpring,
  useTransform,
  useVelocity,
  type MotionValue,
} from "framer-motion";

/* ------------------------------------------------------------------ */
/* Pointer stage — normalized -1..1, spring-smoothed                   */
/* ------------------------------------------------------------------ */

export interface PointerStage {
  /** -1 (left edge) .. 1 (right edge) */
  x: MotionValue<number>;
  /** -1 (top edge) .. 1 (bottom edge) */
  y: MotionValue<number>;
}

/**
 * Tracks the pointer across the viewport and smooths it with a spring, so
 * camera tilts, glares and parallax layers glide instead of snapping. The
 * listener is passive and the values never trigger React re-renders.
 */
export function usePointerStage(stiffness = 110, damping = 22): PointerStage {
  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);
  const x = useSpring(rawX, { stiffness, damping, mass: 0.35 });
  const y = useSpring(rawY, { stiffness, damping, mass: 0.35 });

  useEffect(() => {
    if (typeof window === "undefined") return;
    const onMove = (event: PointerEvent) => {
      rawX.set((event.clientX / window.innerWidth) * 2 - 1);
      rawY.set((event.clientY / window.innerHeight) * 2 - 1);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, [rawX, rawY]);

  return { x, y };
}

/* ------------------------------------------------------------------ */
/* 3D tilt stage with a cursor-tracked specular highlight              */
/* ------------------------------------------------------------------ */

export function TiltStage({
  children,
  className = "",
  style,
  intensity = 10,
  perspective = 1200,
  glare = true,
  glareColor = "rgba(255,255,255,0.14)",
  glareRadius = 60,
  scale = 1,
}: {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  /** Max rotateX/rotateY in degrees */
  intensity?: number;
  perspective?: number;
  glare?: boolean;
  glareColor?: string;
  glareRadius?: number;
  scale?: number;
}) {
  const { x, y } = usePointerStage();
  const rotateY = useTransform(x, [-1, 1], [-intensity, intensity]);
  const rotateX = useTransform(y, [-1, 1], [intensity, -intensity]);
  const glarePos = useTransform(x, [-1, 1], ["22%", "78%"]);
  const glarePosY = useTransform(y, [-1, 1], ["22%", "78%"]);
  const background = useMotionTemplate`radial-gradient(circle at ${glarePos} ${glarePosY}, ${glareColor}, transparent ${glareRadius}%)`;

  return (
    <div className={className} style={{ perspective, ...style }}>
      <motion.div
        style={{ rotateX, rotateY, scale, transformStyle: "preserve-3d" }}
        className="relative h-full w-full"
      >
        {children}
        {glare && (
          <motion.div
            aria-hidden="true"
            style={{ background }}
            className="pointer-events-none absolute inset-0 z-30 mix-blend-screen"
          />
        )}
      </motion.div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Multi-depth pointer parallax                                        */
/* ------------------------------------------------------------------ */

export function Parallax({
  children,
  depth = 18,
  className = "",
  style,
  /** Optional extra Z offset so layers sit at different camera depths */
  depthZ = 0,
}: {
  children: ReactNode;
  depth?: number;
  className?: string;
  style?: CSSProperties;
  depthZ?: number;
}) {
  const { x, y } = usePointerStage();
  const tx = useTransform(x, [-1, 1], [-depth, depth]);
  const ty = useTransform(y, [-1, 1], [-depth, depth]);
  return (
    <motion.div
      style={{ x: tx, y: ty, z: depthZ, transformStyle: "preserve-3d", ...style }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/* Full-bleed cursor-tracked studio light                              */
/* ------------------------------------------------------------------ */

export function SpecularLight({
  color = "rgba(255,255,255,0.10)",
  size = 46,
  className = "",
  blend = "screen",
}: {
  color?: string;
  /** Radius as a percentage of the viewport's larger axis */
  size?: number;
  className?: string;
  blend?: CSSProperties["mixBlendMode"];
}) {
  const { x, y } = usePointerStage(80, 24);
  const px = useTransform(x, [-1, 1], ["18%", "82%"]);
  const py = useTransform(y, [-1, 1], ["14%", "86%"]);
  const background = useMotionTemplate`radial-gradient(circle ${size}vmax at ${px} ${py}, ${color}, transparent 68%)`;

  return (
    <motion.div
      aria-hidden="true"
      style={{ background, mixBlendMode: blend }}
      className={`pointer-events-none absolute inset-0 z-20 ${className}`}
    />
  );
}

/* ------------------------------------------------------------------ */
/* Magnetic element — pulls toward the cursor, springs back            */
/* ------------------------------------------------------------------ */

export function Magnetic({
  children,
  className = "",
  style,
  strength = 0.32,
  maxPull = 26,
}: {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
  strength?: number;
  maxPull?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);
  const x = useSpring(rawX, { stiffness: 260, damping: 20, mass: 0.4 });
  const y = useSpring(rawY, { stiffness: 260, damping: 20, mass: 0.4 });
  const clamp = (value: number) => Math.max(-maxPull, Math.min(maxPull, value));

  return (
    <motion.div
      ref={ref}
      style={{ x, y, ...style }}
      className={className}
      onPointerMove={(event) => {
        const el = ref.current;
        if (!el) return;
        const rect = el.getBoundingClientRect();
        rawX.set(clamp((event.clientX - (rect.left + rect.width / 2)) * strength));
        rawY.set(clamp((event.clientY - (rect.top + rect.height / 2)) * strength));
      }}
      onPointerLeave={() => {
        rawX.set(0);
        rawY.set(0);
      }}
    >
      {children}
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/* Scroll-jacking 3D camera portal                                     */
/* ------------------------------------------------------------------ */

export interface PortalCamera {
  /** 0 → 1 through the pinned scene */
  progress: MotionValue<number>;
  /** Camera dolly distance in px (drives `z`) */
  cameraZ: MotionValue<number>;
}

/**
 * A pinned 3D portal. Scrolling does not move flat divs: the camera dollies
 * *through* `scene` (which scales, recedes and blurs), two foreground panels
 * part ways, and `interior` is revealed from inside the scene.
 *
 * Height defaults to 280vh — 180vh of scroll distance drives the transition.
 */
export function CameraPortal({
  scene,
  interior,
  pane,
  hint,
  className = "",
  sceneClassName = "absolute inset-0",
  heightVh = 280,
  perspective = 1200,
  blurOut = 20,
  zoom = 3.4,
  veilColor = "rgba(3,3,4,0.9)",
  children,
}: {
  scene: ReactNode;
  interior: ReactNode;
  /** Optional foreground texture rendered on both parting panels */
  pane?: ReactNode;
  hint?: ReactNode;
  className?: string;
  sceneClassName?: string;
  heightVh?: number;
  perspective?: number;
  /** Max blur applied as the scene passes the camera */
  blurOut?: number;
  /** Final scene scale at the end of the dolly */
  zoom?: number;
  veilColor?: string;
  children?: ReactNode;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end end"],
  });
  const p = useSpring(scrollYProgress, {
    stiffness: 150,
    damping: 30,
    mass: 0.4,
  });

  const cameraZ = useTransform(p, [0, 1], [0, 1100]);
  const sceneScale = useTransform(p, [0, 1], [1, zoom]);
  const sceneOpacity = useTransform(p, [0, 0.4, 0.74], [1, 0.72, 0]);
  const sceneBlur = useTransform(p, [0, 0.85], [0, blurOut]);
  const sceneFilter = useMotionTemplate`blur(${sceneBlur}px)`;

  const paneOut = useTransform(p, [0, 0.55, 1], [0, 58, 96]);
  const paneLeftX = useTransform(paneOut, (v) => `${-v}%`);
  const paneRightX = useTransform(paneOut, (v) => `${v}%`);
  const paneOpacity = useTransform(p, [0, 0.3, 0.82], [0, 0.5, 0]);

  const interiorScale = useTransform(p, [0, 0.54, 1], [0.58, 0.97, 1.05]);
  const interiorOpacity = useTransform(p, [0.3, 0.74], [0, 1]);
  const interiorY = useTransform(p, [0.3, 1], [40, 0]);
  const interiorRotateX = useTransform(p, [0, 1], [14, 0]);

  const hintOpacity = useTransform(p, [0, 0.12], [1, 0]);
  const veilOpacity = useTransform(p, [0.05, 0.42, 0.8], [0, 0.72, 0.92]);

  // The interior is only interactive once it is actually on screen — an
  // opacity-0 panel would otherwise swallow every pointer event on the scene.
  const [interiorLive, setInteriorLive] = useState(false);
  useMotionValueEvent(p, "change", (value) => {
    const live = value > 0.5;
    setInteriorLive((previous) => (previous === live ? previous : live));
  });

  const camera: PortalCamera = { progress: p, cameraZ };

  return (
    <div
      ref={ref}
      className={`relative ${className}`}
      style={{ height: `${heightVh}vh` }}
    >
      <div
        className="sticky top-0 h-screen overflow-hidden"
        style={{ perspective, perspectiveOrigin: "50% 50%" }}
      >
        {/* The scene the camera flies into */}
        <motion.div
          style={{
            scale: sceneScale,
            z: cameraZ,
            opacity: sceneOpacity,
            filter: sceneFilter,
            transformStyle: "preserve-3d",
          }}
          className={sceneClassName}
        >
          {scene}
        </motion.div>

        {/* Foreground panels that part ways as the camera advances */}
        {pane && (
          <>
            <motion.div
              aria-hidden="true"
              style={{ x: paneLeftX, opacity: paneOpacity }}
              className="pointer-events-none absolute inset-y-0 right-0 z-20 w-1/2 overflow-hidden"
            >
              {pane}
            </motion.div>
            <motion.div
              aria-hidden="true"
              style={{ x: paneRightX, opacity: paneOpacity }}
              className="pointer-events-none absolute inset-y-0 left-0 z-20 w-1/2 overflow-hidden"
            >
              {pane}
            </motion.div>
          </>
        )}

        {/* Light veil — deepens as we pass through */}
        <motion.div
          aria-hidden="true"
          style={{ opacity: veilOpacity, background: veilColor }}
          className="pointer-events-none absolute inset-0 z-30"
        />

        {/* The interior, revealed from inside the scene */}
        <motion.div
          style={{
            scale: interiorScale,
            opacity: interiorOpacity,
            y: interiorY,
            rotateX: interiorRotateX,
            transformStyle: "preserve-3d",
          }}
          className={`absolute inset-0 z-40 ${interiorLive ? "" : "pointer-events-none"}`}
        >
          {interior}
        </motion.div>

        {hint && (
          <motion.div
            style={{ opacity: hintOpacity }}
            className="pointer-events-none absolute inset-x-0 bottom-8 z-50 flex justify-center"
          >
            {hint}
          </motion.div>
        )}

        {children ? <div className="relative z-50">{children}</div> : null}
        {camera && null}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Scroll-velocity helpers                                             */
/* ------------------------------------------------------------------ */

/**
 * Signed scroll velocity mapped into a small -1..1 range. Used by kinetic
 * typography that warps with the speed of the scroll.
 */
export function useScrollVelocityRange(max = 1): MotionValue<number> {
  const { scrollY } = useScroll();
  const smooth = useSpring(scrollY, { stiffness: 200, damping: 40, mass: 0.4 });
  const velocity = useVelocity(smooth);
  const damped = useSpring(velocity, { stiffness: 160, damping: 30, mass: 0.3 });
  // px/s → roughly -1..1 for ordinary wheel and trackpad speeds.
  return useTransform(damped, (value) => Math.max(-max, Math.min(max, value / 900)));
}

/** Raw 0..1 progress of an element through the viewport. */
export function useSectionProgress(ref: React.RefObject<HTMLElement | null>) {
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  return useSpring(scrollYProgress, { stiffness: 130, damping: 30 });
}

/* ------------------------------------------------------------------ */
/* Shared stage chrome                                                 */
/* ------------------------------------------------------------------ */

export const STAGE_PERSPECTIVE = 1200;

/** Thin Latin spec mark, the house style for section numbering. */
export function SpecMark({
  children,
  className = "",
  style,
}: {
  children: ReactNode;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <span
      dir="ltr"
      className={`font-grotesk text-[9px] font-light uppercase tracking-specmark ${className}`}
      style={style}
    >
      {children}
    </span>
  );
}
