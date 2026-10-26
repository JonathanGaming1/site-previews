"use client";

import React, { useState } from "react";
import {
  Check,
  Clock,
  Key,
  Layers,
  Loader2,
  Lock,
  RotateCcw,
  Sliders,
  X,
} from "lucide-react";
import { motion } from "framer-motion";
import { clone, useSite } from "@/components/SiteProvider";
import { saveSiteJson } from "@/lib/github";
import {
  TEMPLATE_OPTIONS,
  type Checkpoint,
  type SiteData,
} from "@/types/site";

const GITHUB_TOKEN_KEY = "admin_gh_token";
const GROQ_KEY_KEY = "admin_groq_key";

type Status = { kind: "idle" | "sending" | "ok" | "error"; message?: string };

/** Site JSON without heavy meta fields (used to slim AI prompts). */
function stripHeavy(data: SiteData): Partial<SiteData> {
  const {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    slug: _slug,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    checkpoints: _checkpoints,
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    initialBackup: _initialBackup,
    ...light
  } = (data ?? {}) as Partial<SiteData>;
  return light;
}

/** Fields enforced by the platform, never touched by the AI. */
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
  return {
    ...clone(base),
    ...(rest as Partial<SiteData>),
    slug: base.slug,
    businessId: base.businessId,
    isDemo: base.isDemo,
    n8nEditWebhookUrl: base.n8nEditWebhookUrl,
    checkoutUrl: base.checkoutUrl,
    trackingWebhookUrl: base.trackingWebhookUrl,
    checkpoints: base.checkpoints ?? [],
    initialBackup: base.initialBackup,
  };
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

export function AdminToolbar() {
  const { data, isAdmin, mounted, adminKey, slug, setTemplate, setTheme, replaceData } =
    useSite();
  const [aiOpen, setAiOpen] = useState(false);
  const [cpOpen, setCpOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const [barDown, setBarDown] = useState(false);

  if (!mounted || !isAdmin) return null;

  const targetSlug = slug ?? data.slug ?? "default";

  /** Push the current state to GitHub, adding a checkpoint snapshot. */
  const commit = async (nextData: SiteData, label: string) => {
    const ghToken = localStorage.getItem(GITHUB_TOKEN_KEY) ?? "";
    if (!ghToken) {
      setStatus({ kind: "error", message: "חסר טוקן GitHub — פתח הגדרות חיבור" });
      setSettingsOpen(true);
      return;
    }
    const withCp = pushCheckpoint(nextData, label);
    try {
      await saveSiteJson(ghToken, targetSlug, withCp);
      replaceData(withCp);
      setStatus({ kind: "ok", message: `${label} — נשמר ל-GitHub ✓` });
    } catch (err) {
      // The screen already updated (or will below) even if the commit failed.
      if (!withCp.checkpoints?.length) replaceData(withCp);
      setStatus({
        kind: "error",
        message: `השמירה ל-GitHub נכשלה: ${err instanceof Error ? err.message : "שגיאה"}`,
      });
    }
  };

  const handleSave = async () => {
    const cp = data.checkpoints?.length ?? 0;
    if (cp < 1 && !localStorage.getItem(GITHUB_TOKEN_KEY)) {
      setSettingsOpen(true);
      return;
    }
    setStatus({ kind: "sending" });
    await commit(clone(data), "שמירה ידנית");
  };

  const handleAiSubmit = async () => {
    const groqKey = localStorage.getItem(GROQ_KEY_KEY) ?? "";
    if (!groqKey) {
      setSettingsOpen(true);
      setStatus({ kind: "error", message: "חסר מפתח Groq — פתח הגדרות חיבור" });
      return;
    }
    setStatus({ kind: "sending" });
    try {
      const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${groqKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          temperature: 0.2,
          response_format: { type: "json_object" },
          messages: [
            {
              role: "system",
              content:
                "אתה עורך אתרים מומחה. אתה מקבל את ה-JSON הנוכחי של האתר והוראת שינוי בעברית. " +
                "עליך להחזיר את אובייקט ה-JSON המלא והמעודכן של האתר — בדיוק באותו מבנה — " +
                "כאשר ביצעת את השינוי המבוקש בלבד, ללא יצירה של שדות חדשים או השמטה של שדות קיימים. " +
                "כל הטקסטים בעברית, טבעיים וחלקים לתדמית. השב ב-JSON בלבד.",
            },
            {
              role: "user",
              content: `JSON נוכחי:\n${JSON.stringify(stripHeavy(data))}\n\nהוראת שינוי:\n${prompt}`,
            },
          ],
        }),
      });
      if (!res.ok) {
        const body = await res.text();
        throw new Error(`Groq API (${res.status}): ${body.slice(0, 180)}`);
      }
      const json = (await res.json()) as {
        choices?: { message?: { content?: string } }[];
      };
      const content = json.choices?.[0]?.message?.content ?? "";
      const aiPayload = JSON.parse(
        content.trim().replace(/^```(?:json)?\s*/i, "").replace(/```$/, "").trim(),
      ) as Partial<SiteData>;

      // Update the screen immediately, then commit to GitHub.
      const merged = withEnforcedMeta(data, aiPayload);
      replaceData(merged);
      setPrompt("");
      setAiOpen(false);
      await commit(merged, `עריכת AI — ${new Date().toLocaleDateString("he-IL")}`);
    } catch (err) {
      setStatus({
        kind: "error",
        message: `העריכה מה-AI נכשלה: ${err instanceof Error ? err.message : "שגיאה"}`,
      });
    }
  };

  /** Restore the original version — updates screen + GitHub. */
  const handleRecallInitial = async () => {
    if (!data.initialBackup) {
      setStatus({ kind: "error", message: "אין גיבוי ראשוני זמין" });
      return;
    }
    setStatus({ kind: "sending" });
    const restored = withEnforcedMeta(data, clone(data.initialBackup));
    replaceData(restored);
    await commit(restored, "Recall — חזרה לגרסה הראשונה");
  };

  /** Restore a specific checkpoint by id. */
  const handleRestoreCheckpoint = async (cp: Checkpoint) => {
    setStatus({ kind: "sending" });
    const restored = withEnforcedMeta(
      data,
      clone(cp.data) as Partial<SiteData>,
    );
    replaceData(restored);
    setCpOpen(false);
    await commit(restored, `שחזור נקודת שמירה — ${cp.label}`);
  };

  if (barDown) return <ExpandPill onExpand={() => setBarDown(false)} />;

  return (
    <>
      <motion.div
        initial={{ y: -80 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 260, damping: 24 }}
        className="fixed inset-x-0 top-0 z-[100001] mx-auto flex max-w-6xl flex-wrap items-center gap-2 rounded-b-2xl border-b border-amber-500/20 bg-[#0b0a08]/90 px-3 py-2 text-sm text-white shadow-2xl backdrop-blur"
      >
        {/* Template switcher */}
        <span className="flex items-center gap-1 rounded-lg bg-white/5 px-3 py-2">
          <Layers className="h-4 w-4 text-amber-300" aria-hidden="true" />
          <select
            value={data.templateId}
            onChange={(e) => setTemplate(e.target.value as SiteData["templateId"])}
            className="bg-transparent text-sm text-white outline-none"
            aria-label="בחירת תבנית"
          >
            {TEMPLATE_OPTIONS.map((t) => (
              <option key={t.id} value={t.id} className="text-gray-900">
                {t.label}
              </option>
            ))}
          </select>
        </span>

        {/* Color pickers */}
        <span className="flex items-center gap-2 rounded-lg bg-white/5 px-3 py-1.5">
          <Sliders className="h-4 w-4" style={{ color: "#d9a441" }} aria-hidden="true" />
          <label className="flex items-center gap-1" title="צבע ראשי">
            <input
              type="color"
              value={data.theme.primaryColor}
              onChange={(e) => setTheme({ primaryColor: e.target.value })}
              className="h-6 w-6 cursor-pointer rounded border-0 bg-transparent p-0"
              aria-label="צבע ראשי"
            />
          </label>
          <label className="flex items-center gap-1" title="צבע מבטא">
            <input
              type="color"
              value={data.theme.accentColor}
              onChange={(e) => setTheme({ accentColor: e.target.value })}
              className="h-6 w-6 cursor-pointer rounded border-0 bg-transparent p-0"
              aria-label="צבע מבטא"
            />
          </label>
        </span>

        {/* AI change request (direct Groq) */}
        <button
          onClick={() => setAiOpen(true)}
          className="rounded-lg border border-amber-400/40 bg-amber-500/10 px-3 py-2 font-semibold text-amber-200 transition hover:bg-amber-500/20"
        >
          בקש שינוי מ-AI
        </button>

        {/* Save (direct GitHub) */}
        <button
          onClick={handleSave}
          disabled={status.kind === "sending"}
          className="rounded-lg border border-emerald-400/40 bg-emerald-500/10 px-3 py-2 font-semibold text-emerald-200 transition hover:bg-emerald-500/20 disabled:opacity-50"
        >
          <span className="inline-flex items-center gap-1.5">
            {status.kind === "sending" ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            ) : (
              <Check className="h-4 w-4" aria-hidden="true" />
            )}
            שמור שינויים
          </span>
        </button>

        {/* Recall / checkpoints */}
        <button
          onClick={() => setCpOpen(true)}
          disabled={status.kind === "sending"}
          className="rounded-lg border border-zinc-400/30 bg-white/5 px-3 py-2 font-semibold text-zinc-200 transition hover:bg-white/10 disabled:opacity-50"
        >
          <span className="inline-flex items-center gap-1.5">
            <RotateCcw className="h-4 w-4" aria-hidden="true" />
            נקודות שמירה / Recall
          </span>
        </button>

        {/* Connection settings — 🔑 הגדרות API (GitHub token + Groq key, saved in localStorage) */}
        <button
          onClick={() => setSettingsOpen(true)}
          title="הגדרות API (GitHub + Groq)"
          className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 font-semibold text-gray-200 transition hover:bg-white/10"
        >
          <span className="inline-flex items-center gap-1.5">
            <Key className="h-4 w-4 text-amber-300" aria-hidden="true" />
            הגדרות API
          </span>
        </button>

        <span className="mr-auto flex items-center gap-2 text-xs text-gray-400">
          <code className="rounded bg-white/10 px-1.5 py-0.5">/p/{targetSlug}</code>
          <button
            onClick={() => setBarDown(true)}
            className="rounded p-1 text-gray-400 transition hover:text-white"
            aria-label="קפל את סרגל הניהול"
            title="קפל את סרגל הניהול"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </span>

        {status.kind !== "idle" && status.kind !== "sending" && (
          <span
            className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold ${
              status.kind === "ok"
                ? "bg-emerald-500/20 text-emerald-300"
                : "bg-red-500/20 text-red-300"
            }`}
          >
            {status.kind === "ok" ? (
              <Check className="h-3.5 w-3.5" aria-hidden="true" />
            ) : (
              <X className="h-3.5 w-3.5" aria-hidden="true" />
            )}
            {status.message}
          </span>
        )}
      </motion.div>

      {aiOpen && (
        <AiEditModal
          prompt={prompt}
          setPrompt={setPrompt}
          onClose={() => setAiOpen(false)}
          onSubmit={handleAiSubmit}
          sending={status.kind === "sending"}
        />
      )}

      {cpOpen && (
        <CheckpointsModal
          data={data}
          onClose={() => setCpOpen(false)}
          onRecallInitial={handleRecallInitial}
          onRestore={handleRestoreCheckpoint}
        />
      )}

      {settingsOpen && (
        <SettingsModal
          onClose={() => setSettingsOpen(false)}
          ghToken={localStorage.getItem(GITHUB_TOKEN_KEY) ?? ""}
          groqKey={localStorage.getItem(GROQ_KEY_KEY) ?? ""}
        />
      )}
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
  setPrompt: (v: string) => void;
  onClose: () => void;
  onSubmit: () => void;
  sending: boolean;
}) {
  return (
    <div className="fixed inset-0 z-[100002] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <motion.div
        initial={{ scale: 0.92, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-full max-w-lg rounded-2xl border border-amber-500/20 bg-[#14100a] p-6 shadow-2xl"
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-lg font-bold text-white">
            <Layers className="h-5 w-5 text-amber-300" aria-hidden="true" />
            בקשת שינוי מ-AI
          </h2>
          <button
            onClick={onClose}
            className="rounded p-1 text-gray-400 hover:text-white"
            aria-label="סגור"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>
        <p className="mb-3 text-sm text-gray-400">
          כתבו בחופשיות מה לשנות באתר — העריכה מבוצעת ישירות ומופיעה על המסך
          מיד, ונשמרת ל-GitHub כנקודת שמירה חדשה.
        </p>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          rows={5}
          autoFocus
          className="w-full resize-none rounded-xl border border-white/10 bg-[#0b0a08] p-4 text-sm leading-relaxed text-gray-100 outline-none placeholder:text-gray-600 focus:border-amber-400/60"
          placeholder={"לדוגמה: בקופסה של האודות תשנה את הטקסט ל... ועדכן את מחיר המטבחים."}
        />
        <div className="mt-4 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="rounded-xl border border-white/10 px-5 py-2.5 text-sm font-semibold text-gray-300 hover:bg-white/5"
          >
            ביטול
          </button>
          <button
            onClick={onSubmit}
            disabled={!prompt.trim() || sending}
            className="rounded-xl bg-gradient-to-l from-amber-400 to-yellow-200 px-5 py-2.5 text-sm font-bold text-gray-950 shadow-lg shadow-amber-500/25 transition hover:brightness-110 disabled:opacity-50"
          >
            {sending ? "שולח..." : "בצע עריכת AI"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

/* ------------------------------------------------------------------ */

function CheckpointsModal({
  data,
  onClose,
  onRecallInitial,
  onRestore,
}: {
  data: SiteData;
  onClose: () => void;
  onRecallInitial: () => void;
  onRestore: (cp: Checkpoint) => void;
}) {
  const checkpoints = [...(data.checkpoints ?? [])].reverse();
  return (
    <div className="fixed inset-0 z-[100002] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <motion.div
        initial={{ scale: 0.94, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-full max-w-lg rounded-2xl border border-amber-500/20 bg-[#14100a] p-6 shadow-2xl"
      >
        <div className="mb-5 flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-lg font-bold text-white">
            <Clock className="h-5 w-5 text-amber-300" aria-hidden="true" />
            נקודות שמירה
          </h2>
          <button
            onClick={onClose}
            className="rounded p-1 text-gray-400 hover:text-white"
            aria-label="סגור"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        <button
          onClick={onRecallInitial}
          disabled={!data.initialBackup}
          className="mb-4 flex w-full items-center justify-between gap-3 rounded-2xl border border-amber-400/40 bg-amber-400/10 px-5 py-4 text-right transition hover:bg-amber-400/20 disabled:opacity-50"
        >
          <span>
            <span className="block font-bold text-amber-200">Recall — הגרסה הראשונה</span>
            <span className="mt-0.5 block text-xs text-amber-300/70">
              השחזור הקור של האתר מהייצור האוטומטי
            </span>
          </span>
          <RotateCcw className="h-5 w-5 shrink-0 text-amber-300" aria-hidden="true" />
        </button>

        <div className="max-h-72 space-y-2 overflow-y-auto">
          {checkpoints.length === 0 && (
            <p className="rounded-xl bg-white/5 px-4 py-6 text-center text-sm text-gray-500">
              עדיין אין נקודות שמירה. הן נוצרות בכל שמירה או עריכת AI.
            </p>
          )}
          {checkpoints.map((cp) => (
            <button
              key={cp.id}
              onClick={() => onRestore(cp)}
              className="flex w-full items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-right transition hover:bg-white/[0.09]"
            >
              <span>
                <span className="block text-sm font-semibold text-gray-200">{cp.label}</span>
                <span className="block text-xs text-gray-500" dir="ltr">
                  {new Date(cp.timestamp).toLocaleString("he-IL")}
                </span>
              </span>
              <RotateCcw className="h-4 w-4 shrink-0 text-gray-500" aria-hidden="true" />
            </button>
          ))}
        </div>
      </motion.div>
    </div>
  );
}

/* ------------------------------------------------------------------ */

function SettingsModal({
  onClose,
  ghToken,
  groqKey,
}: {
  onClose: () => void;
  ghToken: string;
  groqKey: string;
}) {
  const [gh, setGh] = useState(ghToken);
  const [groq, setGroq] = useState(groqKey);
  const [saved, setSaved] = useState(false);

  return (
    <div className="fixed inset-0 z-[100002] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
      <motion.div
        initial={{ scale: 0.94, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-full max-w-md rounded-2xl border border-amber-500/20 bg-[#14100a] p-6 shadow-2xl"
      >
        <div className="mb-5 flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-lg font-bold text-white">
            <Lock className="h-5 w-5 text-amber-300" aria-hidden="true" />
            הגדרות API
          </h2>
          <button
            onClick={onClose}
            className="rounded p-1 text-gray-400 hover:text-white"
            aria-label="סגור"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>
        <p className="mb-4 text-xs text-gray-500">
          המפתחות נשמרים ב-localStorage של הדפדפן שלך בלבד ולא נשלחים לשום גורם
          חוץ מ-GitHub ו-Groq ישירות מהדפדפן.
        </p>
        <label className="mb-4 block">
          <span className="mb-1 block text-sm font-semibold text-gray-300">
            GitHub Personal Access Token
          </span>
          <input
            type="password"
            value={gh}
            onChange={(e) => setGh(e.target.value)}
            dir="ltr"
            placeholder="ghp_..."
            className="w-full rounded-xl border border-white/10 bg-[#0b0a08] px-4 py-3 text-sm text-gray-100 outline-none focus:border-amber-400/60"
          />
        </label>
        <label className="mb-6 block">
          <span className="mb-1 block text-sm font-semibold text-gray-300">Groq API Key</span>
          <input
            type="password"
            value={groq}
            onChange={(e) => setGroq(e.target.value)}
            dir="ltr"
            placeholder="gsk_..."
            className="w-full rounded-xl border border-white/10 bg-[#0b0a08] px-4 py-3 text-sm text-gray-100 outline-none focus:border-amber-400/60"
          />
        </label>
        <button
          onClick={() => {
            localStorage.setItem(GITHUB_TOKEN_KEY, gh);
            localStorage.setItem(GROQ_KEY_KEY, groq);
            setSaved(true);
            window.setTimeout(() => setSaved(false), 1600);
          }}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-l from-amber-400 to-yellow-200 py-3 text-sm font-bold text-gray-950 shadow-lg shadow-amber-500/25 hover:brightness-110"
        >
          {saved ? (
            <>
              <Check className="h-4 w-4" aria-hidden="true" /> נשמר במכשיר זה
            </>
          ) : (
            "שמור הגדרות"
          )}
        </button>
      </motion.div>
    </div>
  );
}

/* ------------------------------------------------------------------ */

function ExpandPill({ onExpand }: { onExpand: () => void }) {
  return (
    <button
      onClick={onExpand}
      className="fixed bottom-4 left-4 z-[100001] flex items-center gap-2 rounded-full border border-amber-500/30 bg-[#0b0a08]/90 px-4 py-2 text-xs font-semibold text-amber-200 shadow-xl backdrop-blur transition hover:text-amber-100"
    >
      <Layers className="h-3.5 w-3.5" aria-hidden="true" />
      Admin
    </button>
  );
}
