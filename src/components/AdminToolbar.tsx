"use client";

import React, { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Check,
  ChevronDown,
  Clock,
  Layers,
  Loader2,
  Lock,
  Palette,
  RotateCcw,
  Save,
  X,
} from "lucide-react";
import {
  clone,
  normalizeTemplate,
  REPO_NAME,
  SITE_OVERRIDE_PREFIX,
  useSite,
} from "@/components/SiteProvider";
import {
  TEMPLATE_OPTIONS,
  type Checkpoint,
  type SiteData,
} from "@/types/site";

/* ------------------------------------------------------------------ */
/* Server-side admin API — no GitHub token, no AI key, no n8n, no      */
/* popups, and no secret in this bundle: the browser only talks to     */
/* /api/admin over an HttpOnly session cookie minted by the server.    */
/* ------------------------------------------------------------------ */

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

type AdminAction = "manual_save" | "ai_edit" | "recall";

interface AdminPayload {
  action: AdminAction;
  slug: string;
  updatedData?: Partial<SiteData>;
  prompt?: string;
  target?: "initial";
  checkpointId?: string;
}

/** Site JSON without heavy meta fields (what we send to the server). */
function stripHeavy(data: SiteData): Partial<SiteData> {
  const {
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
    checkpoints: Array.isArray(incoming.checkpoints)
      ? clone(incoming.checkpoints)
      : (base.checkpoints ?? []),
    initialBackup: incoming.initialBackup
      ? clone(incoming.initialBackup)
      : base.initialBackup,
  };
  merged.templateId = normalizeTemplate(merged.templateId);
  return merged;
}

/** Guard against malformed server payloads: only accept site-shaped data. */
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

const ERROR_TEXT: Record<string, string> = {
  forbidden: "מפתח הניהול שגוי — פתחו שוב את קישור המנהל",
  unauthorized: "אין חיבור מנהל פעיל — פתחו שוב את קישור המנהל",
  rate_limited: "נסיונות רבים מדי — המתינו כמה דקות ונסו שוב",
  admin_not_configured:
    "השרת לא מוגדר — חסרים ADMIN_KEY במשתני הסביבה של Cloudflare Pages",
  bad_origin: "הבקשה נדחתה — היא לא הגיעה מהאתר עצמו",
  invalid_slug: "כתובת העסק חסרה או אינה תקינה",
  invalid_site_data: "נתוני האתר אינם תקינים",
  empty_prompt: "כתבו הוראה לפני השליחה",
  site_not_found: "לא נמצא קובץ האתר ב-public/sites ב-GitHub",
  restore_target_missing: "הגרסה המבוקשת לא נמצאה בקובץ",
  missing_env: "חסרים משתני סביבה בשרת — GITHUB_TOKEN או GROQ_API_KEY",
  invalid_json: "השרת לא הצליח לקרוא את הבקשה",
};

function explainError(reason: string, hint?: string): string {
  if (ERROR_TEXT[reason]) return ERROR_TEXT[reason];
  if (reason.startsWith("groq_")) return "עריכת ה-AI נכשלה בשרת — נסו שוב";
  if (reason.startsWith("github_read_")) return "לא ניתן לקרוא את הקובץ מ-GitHub";
  if (reason.startsWith("github_write_")) return "GitHub דחה את השמירה — בדקו הרשאות טוקן";
  return hint ? `${hint} (${reason})` : `הפעולה נכשלה: ${reason}`;
}

export function AdminToolbar() {
  const {
    data,
    isAdmin,
    adminReady,
    mounted,
    slug,
    setTemplate,
    setTheme,
    replaceData,
    refreshAuth,
    logoutAdmin,
  } = useSite();
  const [aiOpen, setAiOpen] = useState(false);
  const [cpOpen, setCpOpen] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const [barDown, setBarDown] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);
  const [password, setPassword] = useState("");
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loggingIn, setLoggingIn] = useState(false);

  const dataRef = useRef(data);
  useEffect(() => {
    dataRef.current = data;
  }, [data]);

  // ?login=1 starts the automatic server exchange; open the manual prompt if
  // that exchange fails and the provider returns to signed-out state.
  useEffect(() => {
    if (!mounted || isAdmin) return;
    const params = new URLSearchParams(window.location.search);
    if (params.get("login") === "1") setLoginOpen(true);
  }, [mounted, isAdmin]);

  /** POST the password to the edge; the HttpOnly JWT cookie does the rest. */
  const submitLogin = async (event: React.FormEvent) => {
    event.preventDefault();
    if (loggingIn) return;
    setLoggingIn(true);
    setLoginError(null);
    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        cache: "no-store",
        body: JSON.stringify({ password }),
      });
      const parsed = (await res.json().catch(() => null)) as {
        authenticated?: boolean;
      } | null;
      if (res.ok && parsed?.authenticated === true) {
        setPassword("");
        setLoginOpen(false);
        await refreshAuth();
        return;
      }
      setLoginError(
        res.status === 429
          ? "נסיונות רבים מדי — המתינו כמה דקות ונסו שוב"
          : res.status === 503
            ? "השרת לא מוגדר — חסרים משתני סביבה ב-Cloudflare Pages"
            : "הסיסמה שגויה",
      );
    } catch {
      setLoginError("לא ניתן להגיע לשרת האימות");
    } finally {
      setLoggingIn(false);
    }
  };

  if (!mounted || !adminReady) return null;

  // Signed out: a discreet lock that opens the server-side password prompt.
  if (!isAdmin) {
    return (
      <div dir="rtl">
        <button
          type="button"
          onClick={() => setLoginOpen(true)}
          aria-label="כניסת מנהל"
          title="כניסת מנהל"
          className="fixed bottom-4 left-4 z-[100002] flex h-9 w-9 items-center justify-center border border-white/15 bg-black/70 text-white/70 backdrop-blur transition hover:border-[#e9c86a]/60 hover:text-[#e9c86a]"
        >
          <Lock className="h-4 w-4" aria-hidden="true" />
        </button>

        {loginOpen && (
          <div role="dialog" aria-modal="true" aria-label="כניסת מנהל" className="fixed inset-0 z-[100003] flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm">
            <form
              onSubmit={submitLogin}
              className="w-full max-w-[360px] border border-white/12 bg-[#0a0908] p-5 shadow-2xl"
            >
              <div className="flex items-center justify-between">
                <h2 className="text-sm tracking-[0.2em] text-white/80">
                  כניסת מנהל
                </h2>
                <button
                  type="button"
                  onClick={() => {
                    setLoginOpen(false);
                    setLoginError(null);
                  }}
                  aria-label="סגירה"
                  className="text-white/50 transition hover:text-white"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>

              <p className="mt-2 text-[11px] leading-relaxed text-white/45">
                הסיסמה נשלחת לשרת פעם אחת ומחזירה עוגיה מוצפנת ל-12 שעות —
                היא לא נשמרת בדפדפן ולא מופיעה בכתובת.
              </p>

              <input
                type="password"
                autoFocus
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="סיסמת מנהל"
                autoComplete="current-password"
                className="mt-4 w-full border border-white/15 bg-white/[0.05] px-3 py-2.5 text-sm text-white outline-none transition focus:border-[#e9c86a]/70"
              />

              {loginError && (
                <p className="mt-2 text-[11px] text-red-300">{loginError}</p>
              )}

              <button
                type="submit"
                disabled={loggingIn || !password}
                className="mt-4 flex w-full items-center justify-center gap-2 border border-[#e9c86a]/50 bg-[#e9c86a]/10 py-2.5 text-xs tracking-[0.2em] text-[#f0d79a] transition disabled:opacity-50"
              >
                {loggingIn && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                {loggingIn ? "מאמתים…" : "כניסה"}
              </button>
            </form>
          </div>
        )}
      </div>
    );
  }

  const targetSlug = slug ?? data.slug ?? "default";
  const sending = status.kind === "sending";

  const handleExitAdmin = async () => {
    try {
      await logoutAdmin();
    } finally {
      setAiOpen(false);
      setCpOpen(false);
      setBarDown(false);
      setLoginOpen(false);
      window.location.assign(`/?site=${encodeURIComponent(targetSlug)}`);
    }
  };

  /** Persist server truth immediately: drop the stale override, replace the
   * React state, then mirror the fresh snapshot back to localStorage. */
  const persist = (next: SiteData) => {
    try {
      localStorage.removeItem(SITE_OVERRIDE_PREFIX + targetSlug);
    } catch {
      /* storage disabled */
    }
    replaceData(next);
    try {
      localStorage.setItem(
        SITE_OVERRIDE_PREFIX + targetSlug,
        JSON.stringify(next),
      );
    } catch {
      /* storage disabled — the live state still holds */
    }
  };

  /**
   * callAdmin — single HTTPS request to our Cloudflare Function. The function
   * holds GITHUB_TOKEN + GROQ_API_KEY, commits the JSON, and returns the new
   * site so the screen updates with no refresh.
   */
  const callAdmin = async (payload: AdminPayload): Promise<SiteData> => {
    let res: Response;
    try {
      res = await fetch("/api/admin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        cache: "no-store",
        body: JSON.stringify({
          repo: REPO_NAME,
          ...payload,
        }),
      });
    } catch {
      throw new Error("לא ניתן להגיע לשרת השמירה — בדקו את החיבור");
    }

    let parsed: Record<string, unknown> | null = null;
    try {
      parsed = (await res.json()) as Record<string, unknown>;
    } catch {
      parsed = null;
    }

    if (res.status === 401) {
      setLoginOpen(true);
      throw new Error("פג תוקף חיבור המנהל — התחברו מחדש");
    }

    if (!res.ok || parsed?.ok !== true) {
      const reason =
        typeof parsed?.error === "string" ? parsed.error : `HTTP ${res.status}`;
      const hint = typeof parsed?.hint === "string" ? parsed.hint : undefined;
      throw new Error(explainError(reason, hint));
    }

    const candidate = asSiteData(parsed?.updatedData);
    if (!candidate) {
      throw new Error("השרת לא החזיר את נתוני האתר המעודכנים");
    }
    return withEnforcedMeta(dataRef.current, candidate);
  };

  const handleSave = async () => {
    if (sending) return;
    setStatus({ kind: "sending", message: "שומר ל-GitHub דרך השרת…" });
    const snapshot = stripHeavy(data);
    try {
      const next = await callAdmin({
        action: "manual_save",
        slug: targetSlug,
        updatedData: snapshot,
      });
      persist(next);
      setStatus({
        kind: "ok",
        message: "נשמר ל-GitHub · נקודת שמירה חדשה נוצרה",
      });
    } catch (error) {
      setStatus({
        kind: "error",
        message: error instanceof Error ? error.message : "השמירה נכשלה",
      });
    }
  };

  const handleAiSubmit = async () => {
    const instruction = prompt.trim();
    if (!instruction || sending) return;
    setAiOpen(false);
    setStatus({ kind: "sending", message: "ה-AI עורך את האתר בשרת…" });
    try {
      const next = await callAdmin({
        action: "ai_edit",
        slug: targetSlug,
        prompt: instruction,
        updatedData: stripHeavy(data),
      });
      persist(next);
      setPrompt("");
      setStatus({ kind: "ok", message: "עריכת ה-AI נשמרה ל-GitHub" });
    } catch (error) {
      setStatus({
        kind: "error",
        message: error instanceof Error ? error.message : "עריכת ה-AI נכשלה",
      });
    }
  };

  const handleRecallInitial = async () => {
    if (sending) return;
    if (!data.initialBackup) {
      setStatus({ kind: "error", message: "אין גיבוי ראשוני זמין" });
      return;
    }
    setCpOpen(false);
    setStatus({ kind: "sending", message: "משחזר את הגרסה הראשונה…" });
    try {
      const next = await callAdmin({
        action: "recall",
        slug: targetSlug,
        target: "initial",
      });
      persist(next);
      setStatus({ kind: "ok", message: "הגרסה הראשונה שוחזרה" });
    } catch (error) {
      setStatus({
        kind: "error",
        message: error instanceof Error ? error.message : "השחזור נכשל",
      });
    }
  };

  const handleRestoreCheckpoint = async (cp: Checkpoint) => {
    if (sending) return;
    setCpOpen(false);
    setStatus({ kind: "sending", message: `משחזר: ${cp.label}` });
    try {
      const next = await callAdmin({
        action: "recall",
        slug: targetSlug,
        checkpointId: cp.id,
      });
      persist(next);
      setStatus({ kind: "ok", message: "נקודת השמירה שוחזרה" });
    } catch (error) {
      setStatus({
        kind: "error",
        message: error instanceof Error ? error.message : "השחזור נכשל",
      });
    }
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
              onClick={handleExitAdmin}
              className="border border-red-400/45 bg-red-500/15 px-3.5 py-2 text-[12px] font-semibold text-red-200 transition hover:bg-red-500/25"
            >
              יציאה ממצב אדמין
            </button>

            <button
              type="button"
              onClick={() => setAiOpen(true)}
              disabled={sending}
              className="border border-[#d4af37]/40 bg-[#d4af37]/10 px-3.5 py-2 text-[12px] font-semibold text-[#efd797] transition hover:bg-[#d4af37]/20 disabled:opacity-50"
            >
              בקש שינוי מ-AI
            </button>

            <button
              type="button"
              onClick={handleSave}
              disabled={sending}
              className="inline-flex items-center gap-1.5 border border-emerald-400/40 bg-emerald-400/10 px-3.5 py-2 text-[12px] font-semibold text-emerald-200 transition hover:bg-emerald-400/20 disabled:opacity-50"
            >
              {sending ? (
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
                      disabled={!data.initialBackup || sending}
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
                          disabled={sending}
                          className="flex w-full items-center justify-between gap-3 border border-white/8 bg-white/[0.03] px-3 py-2 text-right transition hover:bg-white/[0.08] disabled:opacity-50"
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
            sending={sending}
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
              ההוראה נשלחת לשרת שלנו, שמפעיל את המודל, מעדכן את GitHub ומחזיר את
              הגרסה החדשה — בלי שום מפתח API בדפדפן.
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
