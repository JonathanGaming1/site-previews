"use client";

import React, { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Check,
  ChevronDown,
  Clock,
  Layers,
  Loader2,
  Palette,
  RotateCcw,
  Save,
  X,
} from "lucide-react";
import {
  clone,
  makeInitialBackup,
  normalizeTemplate,
  SITES_RAW_BASE,
  SITE_OVERRIDE_PREFIX,
  useSite,
} from "@/components/SiteProvider";
import {
  TEMPLATE_OPTIONS,
  type Checkpoint,
  type SiteData,
} from "@/types/site";

/* ------------------------------------------------------------------ */
/* n8n bridge — no GitHub token, no AI key, ever.                      */
/* A hidden form POSTs to n8n with a named top-level window target,    */
/* which browsers allow even from HTTPS → HTTP (no CORS/mixed block).  */
/* n8n keeps the GitHub + Groq credentials server-side.                */
/* ------------------------------------------------------------------ */

const N8N_BRIDGE_URL = "http://100.127.219.21:5678/webhook/site-editor";
const BRIDGE_WINDOW = "n8n_bridge_popup";

const COLOR_PRESETS: {
  name: string;
  primary: string;
  accent: string;
}[] = [
  { name: "אובסידיאן ושמפאן", primary: "#0B0B0B", accent: "#C9A227" },
  { name: "חצות וספיר", primary: "#0A1024", accent: "#3B6EF6" },
  { name: "פחם וליים", primary: "#0C0D10", accent: "#C8FF4D" },
  { name: "טרוורטין ואספרסו", primary: "#F3EFE6", accent: "#141311" },
  { name: "בורדו ורוז גולד", primary: "#1A0B0E", accent: "#D9A38A" },
];

type Status = {
  kind: "idle" | "sending" | "ok" | "error";
  message?: string;
};

/** Site JSON without heavy meta fields (used for AI payloads + checkpoints). */
function stripHeavy(data: SiteData): Partial<SiteData> {
  const {
    slug: _slug,
    checkpoints: _checkpoints,
    initialBackup: _initialBackup,
    ...light
  } = (data ?? {}) as Partial<SiteData>;
  return light;
}

/** Fields enforced by the platform, never touched by an AI response. */
function withEnforcedMeta(
  base: SiteData,
  incoming: Partial<SiteData>,
): SiteData {
  const {
    slug: _s,
    businessId: _b,
    isDemo: _d,
    n8nEditWebhookUrl: _n,
    checkoutUrl: _c,
    trackingWebhookUrl: _t,
    checkpoints: _cp,
    initialBackup: _ib,
    ...rest
  } = incoming;
  const merged: SiteData = {
    ...clone(base),
    ...(clone(rest) as Partial<SiteData>),
    slug: base.slug,
    businessId: base.businessId,
    isDemo: base.isDemo,
    n8nEditWebhookUrl: base.n8nEditWebhookUrl,
    checkoutUrl: base.checkoutUrl,
    trackingWebhookUrl: base.trackingWebhookUrl,
    checkpoints: base.checkpoints ?? [],
    initialBackup: base.initialBackup,
  };
  merged.templateId = normalizeTemplate(merged.templateId);
  return merged;
}

function pushCheckpoint(data: SiteData, label: string): SiteData {
  const rest = clone(stripHeavy(data) as SiteData);
  const cp: Checkpoint = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    label,
    timestamp: new Date().toISOString(),
    data: rest as unknown as Record<string, unknown>,
  };
  return { ...data, checkpoints: [...(data.checkpoints ?? []), cp] };
}

/** Guard against arbitrary postMessage payloads: only accept site-shaped data. */
function asSiteData(raw: unknown): Partial<SiteData> | null {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
  const candidate = raw as Partial<SiteData>;
  if (
    !candidate.businessInfo &&
    !candidate.hero &&
    !candidate.templateId &&
    !candidate.services
  ) {
    return null;
  }
  return candidate;
}

function timestampedLabel(prefix: string): string {
  return `${prefix} — ${new Date().toLocaleString("he-IL", {
    day: "2-digit",
    month: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  })}`;
}

function bridgeFormTarget(): HTMLIFrameElement {
  const existing = document.getElementById(
    "n8n-bridge-frame",
  ) as HTMLIFrameElement | null;
  if (existing) return existing;
  const frame = document.createElement("iframe");
  frame.id = "n8n-bridge-frame";
  frame.name = BRIDGE_WINDOW;
  frame.title = "n8n bridge";
  frame.style.position = "fixed";
  frame.style.width = "1px";
  frame.style.height = "1px";
  frame.style.opacity = "0";
  frame.style.pointerEvents = "none";
  frame.style.border = "0";
  frame.style.left = "-9999px";
  document.body.appendChild(frame);
  return frame;
}

export function AdminToolbar() {
  const {
    data,
    isAdmin,
    mounted,
    slug,
    setTemplate,
    setTheme,
    replaceData,
  } = useSite();
  const [aiOpen, setAiOpen] = useState(false);
  const [cpOpen, setCpOpen] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const [barDown, setBarDown] = useState(false);

  const dataRef = useRef(data);
  useEffect(() => {
    dataRef.current = data;
  }, [data]);

  const bridgeCleanup = useRef<(() => void) | null>(null);
  useEffect(
    () => () => {
      bridgeCleanup.current?.();
    },
    [],
  );

  if (!mounted || !isAdmin) return null;

  const targetSlug = slug ?? data.slug ?? "default";

  const writeOverride = (value: SiteData) => {
    try {
      localStorage.setItem(
        SITE_OVERRIDE_PREFIX + targetSlug,
        JSON.stringify(value),
      );
    } catch {
      /* storage disabled */
    }
  };

  const applySyncedSite = (raw: unknown): boolean => {
    const candidate = asSiteData(raw);
    if (!candidate) return false;
    const merged = withEnforcedMeta(dataRef.current, candidate);
    replaceData(merged);
    writeOverride(merged);
    return true;
  };

  const syncFromGithub = async (attempt = 0) => {
    try {
      const res = await fetch(
        `${SITES_RAW_BASE}/${targetSlug}.json?t=${Date.now()}`,
        { cache: "no-store" },
      );
      if (res.ok) {
        const raw = (await res.json()) as unknown;
        if (applySyncedSite(raw)) {
          setStatus({
            kind: "ok",
            message: "n8n סיים — האתר סונכרן מ-GitHub",
          });
          return;
        }
      }
    } catch {
      /* retry below */
    }
    if (attempt < 2) {
      window.setTimeout(() => {
        void syncFromGithub(attempt + 1);
      }, 1800);
      return;
    }
    setStatus({
      kind: "error",
      message: "n8n סיים, אך לא ניתן היה לקרוא את הגרסה מ-GitHub",
    });
  };

  /**
   * sendToN8nBridge — the zero-key handoff.
   * 1. Persist the updated site locally (instant 0ms feedback).
   * 2. Build a hidden HTML form into a named, centered popup window so the
   *    browser treats it as a top-level navigation (no CORS, no mixed-content
   *    fetch failure). n8n holds the GitHub + Groq credentials.
   * 3. Listen for a postMessage and poll `popup.closed`; when n8n finishes we
   *    re-sync the JSON straight from GitHub.
   */
  const sendToN8nBridge = (payloadObject: Record<string, unknown>) => {
      bridgeCleanup.current?.();

      const updated =
        (payloadObject.updatedData as SiteData | undefined) ??
        (payloadObject.restoredData as SiteData | undefined) ??
        (payloadObject.currentData as SiteData | undefined) ??
        dataRef.current;

      // Step 1 — instant local persistence, before any network hop.
      writeOverride(updated);
      setStatus({
        kind: "sending",
        message: "נפתח גשר n8n — אין צורך במפתחות API",
      });

      // Step 2 — centered popup + hidden form.
      const width = 420;
      const height = 260;
      const left = Math.max(
        0,
        Math.round((window.screenX || 0) + (window.outerWidth - width) / 2),
      );
      const top = Math.max(
        0,
        Math.round((window.screenY || 0) + (window.outerHeight - height) / 2),
      );

      let popup: Window | null = null;
      let fallbackFrame: HTMLIFrameElement | null = null;

      try {
        popup = window.open(
          "",
          BRIDGE_WINDOW,
          `popup=yes,width=${width},height=${height},left=${left},top=${top}`,
        );
      } catch {
        popup = null;
      }

      if (popup) {
        try {
          popup.document.write(
            '<!doctype html><html lang="he" dir="rtl"><head><meta charset="utf-8"><title>גשר n8n</title></head><body style="margin:0;height:100vh;display:flex;align-items:center;justify-content:center;background:#0b0a08;color:#e7dcc4;font-family:system-ui,sans-serif;font-size:13px">מעביר את השינויים ל-n8n…</body></html>',
          );
          popup.document.close();
        } catch {
          /* the popup may already be navigating */
        }
      } else {
        fallbackFrame = bridgeFormTarget();
      }

      const form = document.createElement("form");
      form.method = "POST";
      form.action = N8N_BRIDGE_URL;
      form.target = BRIDGE_WINDOW;
      form.encType = "application/x-www-form-urlencoded";
      form.acceptCharset = "UTF-8";
      form.style.display = "none";

      const payloadInput = document.createElement("input");
      payloadInput.type = "hidden";
      payloadInput.name = "payload";
      payloadInput.value = JSON.stringify(payloadObject);
      form.appendChild(payloadInput);
      document.body.appendChild(form);

      try {
        form.submit();
      } catch {
        setStatus({
          kind: "error",
          message: "הדפדפן חסם את פתיחת גשר n8n — נסו שוב",
        });
      }
      window.setTimeout(() => form.remove(), 0);

      // Step 3 — wait for n8n, then sync from GitHub.
      let pollTimer = 0;
      let watchdog = 0;
      let syncing = false;

      const cleanup = () => {
        window.removeEventListener("message", onMessage);
        window.clearInterval(pollTimer);
        window.clearTimeout(watchdog);
        if (fallbackFrame) fallbackFrame.onload = null;
        if (bridgeCleanup.current === cleanup) bridgeCleanup.current = null;
      };

      const finishAndSync = () => {
        if (syncing) return;
        syncing = true;
        cleanup();
        setStatus({
          kind: "sending",
          message: "n8n מסיים — מסנכרן את הגרסה מ-GitHub",
        });
        window.setTimeout(() => {
          void syncFromGithub(0);
        }, 1400);
      };

      const onMessage = (event: MessageEvent) => {
        if (popup && event.source !== popup) return;
        const payload = event.data;
        if (!payload || typeof payload !== "object") return;
        const envelope = payload as Record<string, unknown>;
        const site =
          asSiteData(envelope.siteData) ??
          asSiteData(envelope.updatedData) ??
          asSiteData(envelope.data) ??
          asSiteData(envelope);
        if (site && applySyncedSite(site)) {
          setStatus({
            kind: "ok",
            message: "השינוי התקבל מ-n8n ונשמר מקומית",
          });
          cleanup();
          return;
        }
        if (envelope.ok === true || envelope.success === true) {
          finishAndSync();
        }
      };

      window.addEventListener("message", onMessage);

      if (popup) {
        pollTimer = window.setInterval(() => {
          if (popup?.closed) finishAndSync();
        }, 650);
      } else if (fallbackFrame) {
        fallbackFrame.onload = () => finishAndSync();
      }

      watchdog = window.setTimeout(() => {
        if (!syncing) finishAndSync();
      }, 120000);

      bridgeCleanup.current = cleanup;
  };

  const handleSave = () => {
    const next = pushCheckpoint(
      clone(data),
      timestampedLabel("שמירה ידנית"),
    );
    replaceData(next);
    sendToN8nBridge({
      action: "manual_save",
      slug: targetSlug,
      updatedData: next,
    });
  };

  const handleAiSubmit = () => {
    const instruction = prompt.trim();
    if (!instruction) return;
    sendToN8nBridge({
      action: "ai_edit",
      slug: targetSlug,
      prompt: instruction,
      currentData: stripHeavy(data),
    });
    setPrompt("");
    setAiOpen(false);
  };

  const handleRecallInitial = () => {
    if (!data.initialBackup) {
      setStatus({ kind: "error", message: "אין גיבוי ראשוני זמין" });
      return;
    }
    const restored = withEnforcedMeta(
      data,
      clone(data.initialBackup) as Partial<SiteData>,
    );
    replaceData(restored);
    setCpOpen(false);
    sendToN8nBridge({
      action: "recall",
      slug: targetSlug,
      restoredData: restored,
    });
  };

  const handleRestoreCheckpoint = (cp: Checkpoint) => {
    const restored = withEnforcedMeta(
      data,
      clone(cp.data) as Partial<SiteData>,
    );
    replaceData(restored);
    setCpOpen(false);
    sendToN8nBridge({
      action: "recall",
      slug: targetSlug,
      restoredData: restored,
    });
  };

  if (barDown) return <ExpandPill onExpand={() => setBarDown(false)} />;

  const activePreset = COLOR_PRESETS.find(
    (preset) =>
      preset.primary.toLowerCase() === data.theme.primaryColor.toLowerCase() &&
      preset.accent.toLowerCase() === data.theme.accentColor.toLowerCase(),
  );

  return (
    <>
      <motion.div
        initial={{ y: -90 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 260, damping: 26 }}
        className="fixed inset-x-0 top-0 z-[100001] border-b border-white/10 bg-[#0a0908]/95 text-white shadow-[0_18px_60px_rgba(0,0,0,0.55)] backdrop-blur-2xl"
        dir="rtl"
      >
        <div className="mx-auto max-w-[1500px] px-3 py-2 sm:px-4">
          {/* Row 1 — studio identity + actions */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="flex items-center gap-2 border-l border-white/10 pl-3">
              <span
                className="flex h-7 w-7 items-center justify-center border text-[10px] font-bold"
                style={{
                  borderColor: "rgba(212,175,55,0.55)",
                  color: "#e9c86a",
                  transform: "skewX(-8deg)",
                }}
              >
                <span style={{ transform: "skewX(8deg)" }}>AS</span>
              </span>
              <span className="leading-none">
                <span className="block text-[10px] tracking-[0.32em] text-white/40">
                  ADMIN STUDIO
                </span>
                <code
                  className="mt-1 block text-[11px] text-white/75"
                  dir="ltr"
                >
                  /p/{targetSlug}
                </code>
              </span>
            </span>

            {/* Live colour studio */}
            <span className="flex items-center gap-2 border border-white/10 bg-white/[0.04] px-2.5 py-1.5">
              <Palette
                className="h-3.5 w-3.5 text-[#e9c86a]"
                aria-hidden="true"
              />
              <label className="flex items-center gap-1" title="צבע ראשי">
                <span className="sr-only">צבע ראשי</span>
                <input
                  type="color"
                  value={data.theme.primaryColor}
                  onChange={(e) => setTheme({ primaryColor: e.target.value })}
                  className="h-6 w-6 cursor-pointer border-0 bg-transparent p-0"
                  aria-label="צבע ראשי"
                />
              </label>
              <label className="flex items-center gap-1" title="צבע מבטא">
                <span className="sr-only">צבע מבטא</span>
                <input
                  type="color"
                  value={data.theme.accentColor}
                  onChange={(e) => setTheme({ accentColor: e.target.value })}
                  className="h-6 w-6 cursor-pointer border-0 bg-transparent p-0"
                  aria-label="צבע מבטא"
                />
              </label>
              <span className="flex items-center gap-1 border-r border-white/10 pr-2">
                {COLOR_PRESETS.map((preset) => {
                  const active = activePreset?.name === preset.name;
                  return (
                    <button
                      key={preset.name}
                      type="button"
                      onClick={() =>
                        setTheme({
                          primaryColor: preset.primary,
                          accentColor: preset.accent,
                        })
                      }
                      title={preset.name}
                      aria-label={preset.name}
                      aria-pressed={active}
                      className={`h-4 w-4 border transition-transform hover:scale-110 ${
                        active ? "scale-110 border-white" : "border-white/25"
                      }`}
                      style={{
                        background: `linear-gradient(135deg, ${preset.primary} 0 50%, ${preset.accent} 50% 100%)`,
                      }}
                    />
                  );
                })}
              </span>
            </span>

            <button
              type="button"
              onClick={() => setAiOpen(true)}
              className="border border-[#d4af37]/40 bg-[#d4af37]/10 px-3.5 py-2 text-[12px] font-semibold text-[#efd797] transition hover:bg-[#d4af37]/20"
            >
              בקש שינוי מ-AI
            </button>

            <button
              type="button"
              onClick={handleSave}
              disabled={status.kind === "sending"}
              className="inline-flex items-center gap-1.5 border border-emerald-400/40 bg-emerald-400/10 px-3.5 py-2 text-[12px] font-semibold text-emerald-200 transition hover:bg-emerald-400/20 disabled:opacity-50"
            >
              {status.kind === "sending" ? (
                <Loader2
                  className="h-3.5 w-3.5 animate-spin"
                  aria-hidden="true"
                />
              ) : (
                <Save className="h-3.5 w-3.5" aria-hidden="true" />
              )}
              שמור שינויים ל-GitHub
            </button>

            <div className="relative">
              <button
                type="button"
                onClick={() => setCpOpen((open) => !open)}
                className="inline-flex items-center gap-1.5 border border-white/15 bg-white/[0.04] px-3.5 py-2 text-[12px] font-semibold text-white/80 transition hover:bg-white/10"
                aria-expanded={cpOpen}
              >
                <Clock className="h-3.5 w-3.5" aria-hidden="true" />
                נקודות שמירה / Recall
                <ChevronDown
                  className={`h-3.5 w-3.5 transition-transform ${cpOpen ? "rotate-180" : ""}`}
                  aria-hidden="true"
                />
                {(data.checkpoints?.length ?? 0) > 0 && (
                  <span className="bg-white/10 px-1.5 text-[10px] tabular-nums text-white/70">
                    {data.checkpoints?.length}
                  </span>
                )}
              </button>

              <AnimatePresence>
                {cpOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    className="absolute left-0 top-[calc(100%+8px)] z-20 w-[340px] border border-white/12 bg-[#100e0b] p-3 shadow-2xl"
                  >
                    <p className="mb-2 flex items-center justify-between text-[10px] tracking-[0.28em] text-white/35">
                      CHECKPOINTS
                      <button
                        type="button"
                        onClick={() => setCpOpen(false)}
                        className="p-1 text-white/40 hover:text-white"
                        aria-label="סגור נקודות שמירה"
                      >
                        <X className="h-3.5 w-3.5" aria-hidden="true" />
                      </button>
                    </p>
                    <button
                      type="button"
                      onClick={handleRecallInitial}
                      disabled={!data.initialBackup}
                      className="mb-2 flex w-full items-center justify-between gap-3 border border-[#d4af37]/40 bg-[#d4af37]/10 px-3 py-2.5 text-right transition hover:bg-[#d4af37]/20 disabled:opacity-40"
                    >
                      <span>
                        <span className="block text-[12px] font-bold text-[#efd797]">
                          Recall — הגרסה הראשונה
                        </span>
                        <span className="block text-[10px] text-[#efd797]/55">
                          הגיבוי המקורי של האתר
                        </span>
                      </span>
                      <RotateCcw
                        className="h-4 w-4 shrink-0 text-[#efd797]"
                        aria-hidden="true"
                      />
                    </button>
                    <div className="max-h-64 space-y-1 overflow-y-auto">
                      {[...(data.checkpoints ?? [])].reverse().map((cp) => (
                        <button
                          key={cp.id}
                          type="button"
                          onClick={() => handleRestoreCheckpoint(cp)}
                          className="flex w-full items-center justify-between gap-3 border border-white/8 bg-white/[0.03] px-3 py-2 text-right transition hover:bg-white/[0.08]"
                        >
                          <span>
                            <span className="block text-[11px] font-semibold text-white/80">
                              {cp.label}
                            </span>
                            <span
                              className="block text-[10px] text-white/35"
                              dir="ltr"
                            >
                              {new Date(cp.timestamp).toLocaleString("he-IL")}
                            </span>
                          </span>
                          <RotateCcw
                            className="h-3.5 w-3.5 shrink-0 text-white/30"
                            aria-hidden="true"
                          />
                        </button>
                      ))}
                      {(data.checkpoints?.length ?? 0) === 0 && (
                        <p className="px-2 py-5 text-center text-[11px] text-white/35">
                          עדיין אין נקודות שמירה. כל שמירה או עריכת AI יוצרת
                          נקודה חדשה.
                        </p>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <span className="mr-auto flex items-center gap-2">
              {status.kind !== "idle" && (
                <span
                  className={`hidden items-center gap-1.5 px-2.5 py-1.5 text-[10px] font-semibold sm:inline-flex ${
                    status.kind === "ok"
                      ? "bg-emerald-400/15 text-emerald-300"
                      : status.kind === "error"
                        ? "bg-red-400/15 text-red-300"
                        : "bg-white/8 text-white/60"
                  }`}
                >
                  {status.kind === "ok" ? (
                    <Check className="h-3 w-3" aria-hidden="true" />
                  ) : status.kind === "sending" ? (
                    <Loader2
                      className="h-3 w-3 animate-spin"
                      aria-hidden="true"
                    />
                  ) : (
                    <X className="h-3 w-3" aria-hidden="true" />
                  )}
                  {status.message}
                </span>
              )}
              <button
                type="button"
                onClick={() => setBarDown(true)}
                className="p-1.5 text-white/40 transition hover:text-white"
                aria-label="קפל את סרגל הניהול"
                title="קפל את סרגל הניהול"
              >
                <X className="h-4 w-4" aria-hidden="true" />
              </button>
            </span>
          </div>

          {/* Row 2 — instant five-template switcher */}
          <div className="mt-2 flex items-stretch gap-1 overflow-x-auto pb-0.5">
            <span className="hidden shrink-0 items-center gap-1.5 border border-white/8 bg-white/[0.03] px-2.5 text-[9px] tracking-[0.28em] text-white/35 md:flex">
              <Layers className="h-3 w-3" aria-hidden="true" />
              LIVE
            </span>
            {TEMPLATE_OPTIONS.map((option) => {
              const active = data.templateId === option.id;
              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() => setTemplate(option.id)}
                  aria-pressed={active}
                  title={option.note}
                  className={`min-w-[132px] shrink-0 border px-3 py-1.5 text-right transition-colors ${
                    active
                      ? "border-[#d4af37]/60 bg-[#d4af37]/15 text-[#f3e4b8]"
                      : "border-white/8 bg-white/[0.02] text-white/50 hover:border-white/25 hover:text-white/85"
                  }`}
                >
                  <span className="block text-[9px] tracking-[0.22em]">
                    {option.short}
                  </span>
                  <span className="mt-0.5 block truncate text-[10px]">
                    {option.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </motion.div>

      <AnimatePresence>
        {aiOpen && (
          <AiEditModal
            prompt={prompt}
            setPrompt={setPrompt}
            onClose={() => setAiOpen(false)}
            onSubmit={handleAiSubmit}
            sending={status.kind === "sending"}
          />
        )}
      </AnimatePresence>
    </>
  );
}

/* ------------------------------------------------------------------ */

function AiEditModal({
  prompt,
  setPrompt,
  onClose,
  onSubmit,
  sending,
}: {
  prompt: string;
  setPrompt: (value: string) => void;
  onClose: () => void;
  onSubmit: () => void;
  sending: boolean;
}) {
  return (
    <div className="fixed inset-0 z-[100002] flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm">
      <motion.div
        initial={{ scale: 0.94, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.94, opacity: 0 }}
        className="w-full max-w-lg border border-[#d4af37]/25 bg-[#12100c] p-6 shadow-[0_30px_90px_rgba(0,0,0,0.7)]"
        dir="rtl"
        role="dialog"
        aria-modal="true"
        aria-label="בקשת שינוי מ-AI"
      >
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-bold text-white">בקש שינוי מ-AI</h2>
            <p className="mt-1 text-[11px] leading-relaxed text-white/40">
              ההוראה נשלחת ל-n8n, שמפעיל את המודל, מעדכן את GitHub ומחזיר את
              הגרסה החדשה — בלי מפתח API בדפדפן.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-white/40 transition hover:text-white"
            aria-label="סגור"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          rows={5}
          autoFocus
          className="w-full resize-none border border-white/12 bg-[#0a0908] p-4 text-sm leading-relaxed text-gray-100 outline-none placeholder:text-gray-600 focus:border-[#d4af37]/60"
          placeholder="לדוגמה: תשכתב את הכותרת והשירותים לסגנון יוקרתי יותר"
        />
        <div className="mt-4 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="border border-white/10 px-5 py-2.5 text-sm font-semibold text-gray-300 hover:bg-white/5"
          >
            ביטול
          </button>
          <button
            type="button"
            onClick={onSubmit}
            disabled={!prompt.trim() || sending}
            className="bg-gradient-to-l from-[#d4af37] to-[#f4e3a1] px-5 py-2.5 text-sm font-bold text-gray-950 shadow-lg shadow-[#d4af37]/20 transition hover:brightness-110 disabled:opacity-50"
          >
            {sending ? "שולח…" : "בצע עריכת AI"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

/* ------------------------------------------------------------------ */

function ExpandPill({ onExpand }: { onExpand: () => void }) {
  return (
    <button
      type="button"
      onClick={onExpand}
      className="fixed bottom-4 left-4 z-[100001] flex items-center gap-2 border border-[#d4af37]/35 bg-[#0b0a08]/90 px-4 py-2 text-xs font-semibold text-[#efd797] shadow-xl backdrop-blur transition hover:text-[#fff4cf]"
    >
      <Layers className="h-3.5 w-3.5" aria-hidden="true" />
      Admin Studio
    </button>
  );
}
