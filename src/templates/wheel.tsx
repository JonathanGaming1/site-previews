"use client";

/**
 * LOCKED-VIEWPORT VIRTUAL 3D CAMERA ENGINE
 * ========================================
 * The Forge Automotive contract: the viewport is locked (`fixed inset-0`,
 * `overflow-hidden`, no native scrollbar) and the mouse wheel / touch swipe /
 * arrow keys feed a spring-smoothed virtual progress value instead of scrolling
 * the document. That single 0→1 value flies a 3D camera forward through Z-space
 * past a sequence of absolutely-positioned scenes, passing *through* each one.
 *
 * Everything the five templates share lives here:
 *   useCameraEngine      — wheel/touch/keyboard → spring progress + active scene
 *   useCameraRig         — live 3D mouse parallax + moving specular light
 *   useSceneTrack        — per-scene dolly transforms (scale/z/tilt/blur/fade)
 *   LockedViewport       — the fixed, scrollbar-free stage root
 *   CameraStage/StageLight/MagneticCursor/HudScrubber/ChapterBar/SceneMenu/FaqLedger
 *
 * The engine never traps a genuinely scrollable panel: admin drawers, modals
 * and any overflow container keep their native wheel (see `ownsWheel`), and a
 * contentEditable field never loses arrow keys to chapter navigation.
 */

import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import {
  AnimatePresence,
  motion,
  useMotionTemplate,
  useMotionValue,
  useMotionValueEvent,
  useSpring,
  useTransform,
  type MotionValue,
} from "framer-motion";
import { useSite } from "@/components/SiteProvider";
import type { FaqItem } from "@/types/site";

export interface CameraScene {
  /** Latin chapter mark, e.g. "01" */
  code: string;
  /** Chapter name shown in the menu / chapter bar */
  label: string;
}

const clamp01 = (value: number) => Math.max(0, Math.min(1, value));

/* ------------------------------------------------------------------ */
/* Input guards                                                        */
/* ------------------------------------------------------------------ */

/**
 * True when the wheel belongs to a panel that scrolls natively instead of to
 * the 3D camera.
 *
 * Outside the camera engine (admin toolbar, admin dialogs, any overlay) a
 * genuinely overflowing container always keeps the native wheel. Inside the
 * engine, scene layers never steal the wheel — only regions explicitly marked
 * `data-camera-ui="true"` (dense implement lists, long forms) may, and only
 * while they actually overflow.
 */
function ownsWheel(node: EventTarget | null): boolean {
  let el = node as HTMLElement | null;
  while (el && el !== document.body) {
    const style = window.getComputedStyle(el);
    const overflowY = style.overflowY;
    const scrollable =
      (overflowY === "auto" || overflowY === "scroll") &&
      el.scrollHeight > el.clientHeight + 2;
    if (scrollable) {
      const insideEngine = el.closest("[data-camera-engine='true']") !== null;
      if (!insideEngine) return true;
      if (el.dataset && el.dataset.cameraUi === "true") return true;
    }
    el = el.parentElement;
  }
  return false;
}

/** True when the event came from a text field the admin is editing. */
function isTextTarget(node: EventTarget | null): boolean {
  const el = node as HTMLElement | null;
  if (!el) return false;
  if (el.isContentEditable) return true;
  return /^(INPUT|TEXTAREA|SELECT|OPTION)$/.test(el.tagName);
}

/** Keep camera gestures away from controls that own their own pointer input. */
function isCameraInteractiveTarget(node: EventTarget | null): boolean {
  const el = node as HTMLElement | null;
  return Boolean(
    el?.closest(
      "a,button,input,textarea,select,option,[role='slider'],[contenteditable='true'],[data-camera-interactive='true']",
    ),
  );
}

/* ------------------------------------------------------------------ */
/* Viewport lock                                                       */
/* ------------------------------------------------------------------ */

/**
 * Locks the document viewport while a camera template is mounted. The page
 * must never scroll natively — the wheel belongs to the 3D camera.
 */
export function useLockedViewport(): void {
  useEffect(() => {
    const root = document.documentElement;
    root.setAttribute("data-camera-engine", "true");
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.scrollTo(0, 0);
    return () => {
      root.removeAttribute("data-camera-engine");
      document.body.style.overflow = previousOverflow;
    };
  }, []);
}

/** The fixed, scrollbar-free stage root every template is drawn inside. */
export function LockedViewport({
  children,
  background = "#030303",
  text = "#F5F5F3",
  className = "",
  style,
}: {
  children: ReactNode;
  background?: string;
  text?: string;
  className?: string;
  style?: CSSProperties;
}) {
  useLockedViewport();
  return (
    <div
      dir="rtl"
      data-camera-engine="true"
      className={`camera-cursor-hidden fixed inset-0 h-screen w-screen select-none overflow-hidden ${className}`}
      style={{ background, color: text, ...style }}
    >
      {children}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Virtual wheel engine                                                */
/* ------------------------------------------------------------------ */

export interface CameraEngine {
  /** Unsprung 0→1 camera progress */
  raw: MotionValue<number>;
  /** Spring-smoothed 0→1 camera progress that drives every scene */
  progress: MotionValue<number>;
  /** Index of the chapter currently framed by the camera */
  active: number;
  /** Fly the camera straight to a chapter index */
  jump: (index: number) => void;
  /** Step the camera one chapter forward (+1) or back (-1) */
  step: (direction: number) => void;
  /** Pause wheel/keyboard capture (menu or modal open) */
  setSuppressed: (value: boolean) => void;
  /** Live `Z // -####MM` depth readout */
  zDepth: MotionValue<string>;
  /** Index of the last chapter */
  last: number;
}

export function useCameraEngine(
  sceneCount: number,
  options: { sensitivity?: number; depthMm?: number } = {},
): CameraEngine {
  const sensitivity = options.sensitivity ?? 0.00018;
  const depthMm = options.depthMm ?? 4800;
  const last = Math.max(1, sceneCount - 1);

  const raw = useMotionValue(0);
  const progress = useSpring(raw, {
    stiffness: 48,
    damping: 19,
    mass: 0.95,
  });
  const [active, setActive] = useState(0);
  const suppressed = useRef(false);
  const touchY = useRef(0);
  const snapTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const clearSnapTimeout = useCallback(() => {
    if (snapTimeoutRef.current) clearTimeout(snapTimeoutRef.current);
    snapTimeoutRef.current = null;
  }, []);

  const scheduleSnap = useCallback(() => {
    clearSnapTimeout();
    snapTimeoutRef.current = setTimeout(() => {
      snapTimeoutRef.current = null;
      const nearestScene = Math.round(raw.get() * last);
      raw.set(nearestScene / last);
    }, 220);
  }, [clearSnapTimeout, last, raw]);

  useMotionValueEvent(progress, "change", (value) => {
    const index = Math.max(0, Math.min(last, Math.round(value * last)));
    setActive((previous) => (previous === index ? previous : index));
  });

  const jump = useCallback(
    (index: number) => {
      clearSnapTimeout();
      raw.set(clamp01(index / last));
    },
    [clearSnapTimeout, raw, last],
  );

  const step = useCallback(
    (direction: number) => {
      clearSnapTimeout();
      const index = Math.max(
        0,
        Math.min(last, Math.round(raw.get() * last) + direction),
      );
      raw.set(index / last);
    },
    [clearSnapTimeout, raw, last],
  );

  const setSuppressed = useCallback((value: boolean) => {
    suppressed.current = value;
    /* Freeze the camera exactly where it is while a dialog owns the screen. */
    if (value) {
      clearSnapTimeout();
      raw.set(raw.get());
    }
  }, [clearSnapTimeout, raw]);

  const zDepth = useTransform(
    progress,
    (value) =>
      `Z // -${String(Math.round(value * depthMm)).padStart(4, "0")}MM`,
  );

  useEffect(() => {
    const onWheel = (event: WheelEvent) => {
      if (
        suppressed.current ||
        ownsWheel(event.target) ||
        isCameraInteractiveTarget(event.target)
      ) return;
      event.preventDefault();
      const unit =
        event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? 100 : 1;
      raw.set(clamp01(raw.get() + event.deltaY * unit * sensitivity));
      scheduleSnap();
    };

    const onTouchStart = (event: TouchEvent) => {
      touchY.current = event.touches[0]?.clientY ?? 0;
    };

    const onTouchMove = (event: TouchEvent) => {
      if (
        suppressed.current ||
        ownsWheel(event.target) ||
        isCameraInteractiveTarget(event.target)
      ) return;
      const currentY = event.touches[0]?.clientY ?? 0;
      const node = event.target as HTMLElement | null;
      if (node?.closest("[data-camera-open='true']")) return;
      const delta = touchY.current - currentY;
      touchY.current = currentY;
      raw.set(clamp01(raw.get() + delta * 0.0016));
      scheduleSnap();
    };

    const onKeyDown = (event: KeyboardEvent) => {
      if (suppressed.current || isTextTarget(event.target)) return;
      const plus = ["ArrowDown", "PageDown", " "];
      const minus = ["ArrowUp", "PageUp"];
      if (plus.includes(event.key)) {
        event.preventDefault();
        step(1);
      } else if (minus.includes(event.key)) {
        event.preventDefault();
        step(-1);
      } else if (event.key === "Home") {
        event.preventDefault();
        jump(0);
      } else if (event.key === "End") {
        event.preventDefault();
        jump(last);
      }
    };

    window.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: true });
    window.addEventListener("keydown", onKeyDown);

    return () => {
      clearSnapTimeout();
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [clearSnapTimeout, jump, last, raw, scheduleSnap, sensitivity, step]);

  return useMemo(
    () => ({
      raw,
      progress,
      active,
      jump,
      step,
      setSuppressed,
      zDepth,
      last,
    }),
    [active, jump, last, progress, raw, setSuppressed, step, zDepth],
  );
}

/* ------------------------------------------------------------------ */
/* Live 3D mouse parallax camera rig                                   */
/* ------------------------------------------------------------------ */

export interface CameraRig {
  /** Whole-rig pitch in degrees (spring-smoothed) */
  rotateX: MotionValue<number>;
  /** Whole-rig yaw in degrees (spring-smoothed) */
  rotateY: MotionValue<number>;
  /** Studio light X position in % of the viewport */
  lightX: MotionValue<number>;
  /** Studio light Y position in % of the viewport */
  lightY: MotionValue<number>;
  /** Custom cursor X in px */
  cursorX: MotionValue<number>;
  /** Custom cursor Y in px */
  cursorY: MotionValue<number>;
}

export function useCameraRig(
  options: {
    tiltX?: number;
    tiltY?: number;
    lightMin?: number;
    lightMax?: number;
  } = {},
): CameraRig {
  const tiltX = options.tiltX ?? 7;
  const tiltY = options.tiltY ?? 10;
  const lightMin = options.lightMin ?? 15;
  const lightMax = options.lightMax ?? 85;

  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const cursorX = useSpring(useMotionValue(-240), {
    stiffness: 420,
    damping: 30,
  });
  const cursorY = useSpring(useMotionValue(-240), {
    stiffness: 420,
    damping: 30,
  });

  const rotateX = useSpring(useTransform(mouseY, [-0.5, 0.5], [tiltX, -tiltX]), {
    stiffness: 85,
    damping: 22,
  });
  const rotateY = useSpring(useTransform(mouseX, [-0.5, 0.5], [-tiltY, tiltY]), {
    stiffness: 85,
    damping: 22,
  });
  const lightX = useSpring(
    useTransform(mouseX, [-0.5, 0.5], [lightMin, lightMax]),
    { stiffness: 70, damping: 20 },
  );
  const lightY = useSpring(
    useTransform(mouseY, [-0.5, 0.5], [lightMin, lightMax]),
    { stiffness: 70, damping: 20 },
  );

  useEffect(() => {
    const onMove = (event: PointerEvent) => {
      mouseX.set(event.clientX / window.innerWidth - 0.5);
      mouseY.set(event.clientY / window.innerHeight - 0.5);
      cursorX.set(event.clientX);
      cursorY.set(event.clientY);
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, [cursorX, cursorY, mouseX, mouseY]);

  return useMemo(
    () => ({ rotateX, rotateY, lightX, lightY, cursorX, cursorY }),
    [cursorX, cursorY, lightX, lightY, rotateX, rotateY],
  );
}

/* ------------------------------------------------------------------ */
/* Per-scene dolly transforms                                          */
/* ------------------------------------------------------------------ */

export interface SceneTrack {
  scale: MotionValue<number>;
  opacity: MotionValue<number>;
  z: MotionValue<number>;
  rotateX: MotionValue<number>;
  rotateY: MotionValue<number>;
  y: MotionValue<number>;
  /** Omitted entirely when `blur` is 0 — any non-`none` filter flattens a
   * nested `preserve-3d` stage, so 3D-heavy scenes opt out. */
  filter?: MotionValue<string>;
}

/**
 * Dolly track for one scene. The camera approaches from behind `enter`,
 * frames the scene at `peak` and flies *through* it by `exit` — the scene
 * grows past the lens (`zoom`) and Z (`depth`) instead of blinking away.
 */
export function useSceneTrack(
  progress: MotionValue<number>,
  options: {
    enter: number;
    peak: number;
    exit: number;
    fromScale?: number;
    zoom?: number;
    depth?: number;
    tiltX?: number;
    tiltY?: number;
    blur?: number;
    rise?: number;
    opacityRange?: [number, number, number];
    opacityValues?: [number, number, number];
  },
): SceneTrack {
  const {
    enter,
    peak,
    exit,
    fromScale = 0.55,
    zoom = 1.9,
    depth = 620,
    tiltX = 8,
    tiltY = 0,
    blur = 22,
    rise = 0,
  } = options;

  const range: [number, number, number] = [enter, peak, exit];
  const scale = useTransform(progress, range, [fromScale, 1, zoom]);
  const opacity = useTransform(
    progress,
    options.opacityRange ?? range,
    options.opacityValues ?? [0, 1, 0],
  );
  const z = useTransform(progress, range, [-depth, 0, depth]);
  const rotateX = useTransform(progress, range, [tiltX, 0, -tiltX]);
  const rotateY = useTransform(progress, range, [-tiltY, 0, tiltY]);
  const y = useTransform(progress, range, [rise, 0, -rise]);
  const blurValue = useTransform(progress, range, [blur, 0, blur]);
  const blurFilter = useMotionTemplate`blur(${blurValue}px)`;

  return {
    scale,
    opacity,
    z,
    rotateX,
    rotateY,
    y,
    filter: blur > 0 ? blurFilter : undefined,
  };
}

/** Keeps a scene layer from eating pointer events while it is off-camera. */
export function livePointer(active: boolean): CSSProperties {
  return { pointerEvents: active ? "auto" : "none" };
}

/* ------------------------------------------------------------------ */
/* Stage, light, cursor                                                */
/* ------------------------------------------------------------------ */

/** The 3D camera body: the whole world tilts live with the mouse. */
export function CameraStage({
  rig,
  children,
  className = "",
  perspective = 1400,
  style,
}: {
  rig: CameraRig;
  children: ReactNode;
  className?: string;
  perspective?: number;
  style?: CSSProperties;
}) {
  return (
    <motion.main
      style={{
        rotateX: rig.rotateX,
        rotateY: rig.rotateY,
        transformStyle: "preserve-3d",
        perspective,
        ...style,
      }}
      className={className}
    >
      {children}
    </motion.main>
  );
}

/** Cursor-tracked studio light sweeping the dark stage. */
export function StageLight({
  rig,
  tint = "rgba(255,255,255,0.075)",
  accent = "rgba(255,255,255,0.03)",
  size = 760,
  blend = "screen",
  className = "",
}: {
  rig: CameraRig;
  tint?: string;
  accent?: string;
  size?: number;
  blend?: CSSProperties["mixBlendMode"];
  className?: string;
}) {
  const background = useMotionTemplate`radial-gradient(${size}px circle at ${rig.lightX}% ${rig.lightY}%, ${tint}, ${accent} 42%, transparent 76%)`;
  return (
    <motion.div
      aria-hidden="true"
      style={{ background, mixBlendMode: blend }}
      className={`pointer-events-none absolute inset-0 z-0 ${className}`}
    />
  );
}

/** Custom magnetic cursor — a precision ring that grips interactive targets. */
export function MagneticCursor({
  rig,
  accent = "#C9A227",
  label,
}: {
  rig: CameraRig;
  accent?: string;
  label?: string;
}) {
  const [hot, setHot] = useState(false);

  useEffect(() => {
    const onOver = (event: PointerEvent) => {
      const el = event.target as HTMLElement | null;
      setHot(Boolean(el?.closest("a,button,input,[role='slider'],[data-cursor]")));
    };
    window.addEventListener("pointerover", onOver, { passive: true });
    return () => window.removeEventListener("pointerover", onOver);
  }, []);

  return (
    <motion.div
      aria-hidden="true"
      style={{ x: rig.cursorX, y: rig.cursorY }}
      className="pointer-events-none fixed left-0 top-0 z-[9000] hidden md:block"
    >
      <div className="-translate-x-1/2 -translate-y-1/2">
        <motion.div
          animate={{
            scale: hot ? 1.6 : 1,
            borderColor: hot ? accent : "rgba(255,255,255,0.25)",
          }}
          transition={{ type: "spring", stiffness: 280, damping: 24 }}
          className="flex h-9 w-9 items-center justify-center rounded-full border backdrop-blur-[2px]"
        >
          <span
            className="h-1 w-1 rounded-full"
            style={{ background: accent }}
          />
        </motion.div>
        {label ? (
          <span className="absolute left-1/2 top-6 -translate-x-1/2 whitespace-nowrap font-grotesk text-[8px] uppercase tracking-specmark text-white/45">
            {label}
          </span>
        ) : null}
      </div>
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/* HUD telemetry scrubber + chapter bar                                */
/* ------------------------------------------------------------------ */

const HUD_TICKS = Array.from({ length: 21 }, (_, index) => index * 5);

/** Millimetre tick rail, live camera depth and clickable chapter nodes. */
export function HudScrubber({
  engine,
  scenes,
  accent = "#C9A227",
  className = "",
}: {
  engine: CameraEngine;
  scenes: CameraScene[];
  accent?: string;
  className?: string;
}) {
  const { progress, zDepth, active, jump } = engine;
  return (
    <aside
      className={`fixed left-5 top-1/2 z-40 hidden -translate-y-1/2 flex-col items-center gap-4 sm:flex md:left-9 ${className}`}
    >
      <motion.span className="hud-vertical mb-1 font-grotesk text-[9px] tracking-[0.25em] text-white/35">
        {zDepth}
      </motion.span>

      <div className="flex items-center gap-2.5">
        {/* Millimetre tick column */}
        <div className="relative h-44 w-4">
          {HUD_TICKS.map((top, index) => {
            const major = index % 5 === 0;
            return (
              <span
                key={top}
                className="absolute right-0 block h-px"
                style={{
                  top: `${top}%`,
                  width: major ? 12 : 5,
                  background: major
                    ? "rgba(255,255,255,0.42)"
                    : "rgba(255,255,255,0.16)",
                }}
              />
            );
          })}
        </div>

        {/* Depth rail with live camera fill */}
        <div className="relative h-44 w-px overflow-hidden bg-white/15">
          <motion.div
            style={{ scaleY: progress, transformOrigin: "top" }}
            className="h-full w-full"
            // eslint-disable-next-line react/forbid-dom-props
          >
            <span
              className="block h-full w-full"
              style={{ background: accent }}
            />
          </motion.div>
        </div>
      </div>

      <div className="mt-2 flex flex-col gap-2.5">
        {scenes.map((scene, index) => (
          <button
            key={scene.code}
            type="button"
            onClick={() => jump(index)}
            title={scene.label}
            className="group flex items-center gap-2"
          >
            <span
              className={`font-grotesk text-[9px] tracking-[0.18em] transition-all ${
                active === index
                  ? "scale-110"
                  : "text-white/25 group-hover:text-white/60"
              }`}
              style={active === index ? { color: accent } : undefined}
            >
              {scene.code}
            </span>
          </button>
        ))}
      </div>
    </aside>
  );
}

/** Bottom chapter strip + wheel hint. */
export function ChapterBar({
  engine,
  scenes,
  accent = "#C9A227",
  hint = "סובב גלגלת לטיסה בעומק החלל [3D SCROLL]",
  className = "",
}: {
  engine: CameraEngine;
  scenes: CameraScene[];
  accent?: string;
  hint?: string;
  className?: string;
}) {
  const { active, jump } = engine;
  return (
    <div
      className={`pointer-events-none fixed inset-x-6 bottom-6 z-40 flex items-center justify-between md:inset-x-14 ${className}`}
    >
      <div className="pointer-events-auto flex items-center gap-4 border border-white/10 bg-black/60 px-4 py-2 backdrop-blur-md">
        {scenes.map((scene, index) => (
          <button
            key={scene.code}
            type="button"
            onClick={() => jump(index)}
            className={`font-grotesk text-[10px] uppercase tracking-[0.2em] transition-colors ${
              active === index ? "" : "text-white/35 hover:text-white/75"
            }`}
            style={active === index ? { color: accent } : undefined}
          >
            {scene.code}
          </button>
        ))}
      </div>
      <div className="hidden font-grotesk text-[10px] uppercase tracking-[0.28em] text-white/40 sm:block">
        {hint}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Full-screen chapter menu                                            */
/* ------------------------------------------------------------------ */

export function SceneMenu({
  open,
  onClose,
  scenes,
  engine,
  accent = "#C9A227",
  brand,
  footerLeft,
  footerRight,
}: {
  open: boolean;
  onClose: () => void;
  scenes: CameraScene[];
  engine: CameraEngine;
  accent?: string;
  brand: string;
  footerLeft?: string;
  footerRight?: string;
}) {
  const { setSuppressed, jump } = engine;

  useEffect(() => {
    setSuppressed(open);
    if (!open) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose, open, setSuppressed]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          data-camera-open="true"
          initial={{ opacity: 0, clipPath: "inset(0 0 100% 0)" }}
          animate={{ opacity: 1, clipPath: "inset(0 0 0% 0)" }}
          exit={{ opacity: 0, clipPath: "inset(0 0 100% 0)" }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="fixed inset-0 z-[9500] flex flex-col justify-between overflow-y-auto bg-black/95 p-8 backdrop-blur-2xl md:p-16"
        >
          <div className="flex items-center justify-between border-b border-white/10 pb-6">
            <span className="font-grotesk text-[11px] uppercase tracking-[0.35em] text-white/40">
              {brand}
            </span>
            <button
              type="button"
              onClick={onClose}
              className="font-grotesk text-[11px] uppercase tracking-[0.3em] text-white/75 hover:text-white"
            >
              סגור [ESC]
            </button>
          </div>

          <div className="my-auto max-w-2xl space-y-4">
            {scenes.map((scene, index) => (
              <button
                key={scene.code}
                type="button"
                onClick={() => {
                  jump(index);
                  onClose();
                }}
                className="group flex w-full items-baseline gap-6 border-b border-white/[0.07] pb-4 text-right transition-all hover:border-white/40"
              >
                <span
                  className="font-grotesk text-xs"
                  style={{ color: accent }}
                >
                  {scene.code}
                </span>
                <span className="font-frank text-3xl font-light text-white transition-transform group-hover:-translate-x-3 md:text-5xl">
                  {scene.label}
                </span>
              </button>
            ))}
          </div>

          <div className="flex items-center justify-between border-t border-white/10 pt-6 font-grotesk text-[11px] tracking-[0.2em] text-white/40">
            <span dir="ltr">{footerLeft}</span>
            <span>{footerRight}</span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ------------------------------------------------------------------ */
/* Stage split comparator — before / after, zero icon-set clip art      */
/* ------------------------------------------------------------------ */

/**
 * A light-beam before/after comparator for the pinned stage. The drag writes
 * straight to DOM styles through refs, so scrubbing never re-renders the
 * 3D scene. The handle is a typographic beam (↔), never a stock icon.
 */
export function StageSplit({
  beforeImage,
  afterImage,
  beforeLabel = "הסטנדרט הרגיל בשוק",
  afterLabel = "הסטנדרט שלנו",
  caption,
  accent = "#C9A227",
  className = "",
}: {
  beforeImage?: string;
  afterImage?: string;
  beforeLabel?: string;
  afterLabel?: string;
  caption?: string;
  accent?: string;
  className?: string;
}) {
  const wrapRef = useRef<HTMLDivElement | null>(null);
  const afterRef = useRef<HTMLDivElement | null>(null);
  const beamRef = useRef<HTMLDivElement | null>(null);
  const dragging = useRef(false);
  const frame = useRef<number | null>(null);
  const pendingX = useRef<number | null>(null);

  const flush = useCallback(() => {
    frame.current = null;
    const wrap = wrapRef.current;
    const clientX = pendingX.current;
    if (!wrap || clientX === null) return;
    pendingX.current = null;
    const rect = wrap.getBoundingClientRect();
    const pct = Math.min(94, Math.max(6, ((clientX - rect.left) / rect.width) * 100));
    if (afterRef.current) {
      afterRef.current.style.clipPath = `inset(0 0 0 ${pct}%)`;
    }
    if (beamRef.current) {
      beamRef.current.style.left = `${pct}%`;
    }
    wrap.setAttribute("aria-valuenow", String(Math.round(pct)));
  }, []);

  const schedule = useCallback(
    (clientX: number) => {
      pendingX.current = clientX;
      if (frame.current === null) frame.current = requestAnimationFrame(flush);
    },
    [flush],
  );

  return (
    <div className={`w-full ${className}`}>
      {caption ? (
        <p className="mb-3 text-center font-grotesk text-[10px] uppercase tracking-[0.3em] text-white/45">
          {caption}
        </p>
      ) : null}

      <div
        ref={wrapRef}
        role="slider"
        tabIndex={0}
        aria-valuenow={50}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="השוואת לפני ואחרי"
        data-cursor="גרור להשוואה"
        onPointerDown={(event) => {
          dragging.current = true;
          event.currentTarget.setPointerCapture?.(event.pointerId);
          schedule(event.clientX);
        }}
        onPointerMove={(event) => {
          if (dragging.current) schedule(event.clientX);
        }}
        onPointerUp={() => {
          dragging.current = false;
        }}
        onPointerLeave={() => {
          dragging.current = false;
        }}
        onKeyDown={(event) => {
          const wrap = wrapRef.current;
          if (!wrap) return;
          const rect = wrap.getBoundingClientRect();
          const current = Number(wrap.getAttribute("aria-valuenow") ?? 50);
          if (event.key === "ArrowLeft") {
            event.preventDefault();
            schedule(rect.left + ((current - 5) / 100) * rect.width);
          }
          if (event.key === "ArrowRight") {
            event.preventDefault();
            schedule(rect.left + ((current + 5) / 100) * rect.width);
          }
        }}
        className="relative aspect-[16/8] w-full cursor-ew-resize overflow-hidden border border-white/15 bg-white/[0.03] outline-none"
      >
        {beforeImage ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={beforeImage}
            alt={beforeLabel}
            draggable={false}
            className="pointer-events-none absolute inset-0 h-full w-full object-cover grayscale brightness-[0.45]"
          />
        ) : (
          <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-gradient-to-br from-white/[0.06] to-transparent">
            <span className="font-grotesk text-xs uppercase tracking-[0.3em] text-white/40">
              {beforeLabel}
            </span>
          </div>
        )}

        <div
          ref={afterRef}
          className="pointer-events-none absolute inset-0"
          style={{ clipPath: "inset(0 0 0 50%)" }}
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
            <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-tl from-white/[0.09] to-transparent">
              <span className="font-grotesk text-xs uppercase tracking-[0.3em] text-white/55">
                {afterLabel}
              </span>
            </div>
          )}
        </div>

        <div
          ref={beamRef}
          className="pointer-events-none absolute inset-y-0 z-20 w-px"
          style={{ left: "50%", background: accent }}
        >
          <span
            className="absolute left-1/2 top-1/2 flex h-11 w-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border text-[13px]"
            style={{
              borderColor: accent,
              background: "rgba(3,3,3,0.85)",
              color: accent,
            }}
          >
            ↔
          </span>
        </div>

        <span className="pointer-events-none absolute bottom-4 right-4 z-10 bg-black/60 px-3 py-1.5 font-grotesk text-[10px] uppercase tracking-[0.2em] text-white/70 backdrop-blur">
          {beforeLabel}
        </span>
        <span
          className="pointer-events-none absolute bottom-4 left-4 z-10 px-3 py-1.5 font-grotesk text-[10px] uppercase tracking-[0.2em] text-black"
          style={{ background: accent }}
        >
          {afterLabel}
        </span>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Typographic FAQ ledger (no icon-set clip art)                        */
/* ------------------------------------------------------------------ */

/**
 * Chapter-closing FAQ. Every answer stays admin-editable through
 * `editsFor("faq.N.question" | "faq.N.answer")`.
 */
export function FaqLedger({
  items,
  accent = "#C9A227",
  questionClassName = "font-frank text-lg font-light text-white md:text-2xl",
  answerClassName = "text-xs leading-relaxed text-white/50 md:text-sm",
  className = "",
  columns = 1,
}: {
  items: FaqItem[];
  accent?: string;
  questionClassName?: string;
  answerClassName?: string;
  className?: string;
  columns?: 1 | 2;
}) {
  const [openIndex, setOpenIndex] = useState<number | null>(0);
  const { editsFor } = useSite();

  if (!items.length) return null;

  return (
    <div
      className={`${columns === 2 ? "grid gap-x-10 md:grid-cols-2" : "flex flex-col"} ${className}`}
    >
      {items.map((item, index) => {
        const open = openIndex === index;
        return (
          <div key={index} className="border-b border-white/10 py-3">
            <button
              type="button"
              onClick={() => setOpenIndex(open ? null : index)}
              aria-expanded={open}
              className="flex w-full items-baseline justify-between gap-4 text-right"
            >
              <span
                className={questionClassName}
                {...editsFor(`faq.${index}.question`)}
              >
                {item.question}
              </span>
              <span
                className="font-grotesk text-sm leading-none"
                style={{ color: open ? accent : "rgba(255,255,255,0.35)" }}
              >
                {open ? "–" : "+"}
              </span>
            </button>
            <AnimatePresence initial={false}>
              {open && (
                <motion.div
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                  className="overflow-hidden"
                >
                  <p
                    className={`${answerClassName} pt-2`}
                    {...editsFor(`faq.${index}.answer`)}
                  >
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
