"use client";

import React, { useState } from "react";
import { Bot, Palette, RotateCcw, Save, Layout, X, Check, Loader2 } from "lucide-react";
import { motion } from "framer-motion";
import { useSite } from "@/components/SiteProvider";
import { postToWebhook } from "@/lib/webhook";
import type { TemplateId } from "@/types/site";

const TEMPLATE_OPTIONS: { id: TemplateId; label: string }[] = [
  { id: "luxury-dark", label: "Dark Luxury" },
  { id: "modern-clean", label: "Modern Clean" },
  { id: "warm-boutique", label: "Warm Boutique" },
];

type Status = { kind: "idle" | "sending" | "ok" | "error"; message?: string };

export function AdminToolbar() {
  const { data, isAdmin, mounted, adminKey, setTemplate, setTheme, recallOriginal } =
    useSite();
  const [aiOpen, setAiOpen] = useState(false);
  const [prompt, setPrompt] = useState("");
  const [status, setStatus] = useState<Status>({ kind: "idle" });
  const [barDown, setBarDown] = useState(false);

  if (!mounted || !isAdmin) return null;

  const sendAction = async (
    action: string,
    extra: Record<string, unknown>,
    okMessage: string,
  ) => {
    setStatus({ kind: "sending" });
    const res = await postToWebhook(data.n8nEditWebhookUrl, {
      action,
      adminKey,
      ...extra,
    });
    if (res.ok) setStatus({ kind: "ok", message: okMessage });
    else setStatus({ kind: "error", message: `שליחה נכשלה: ${res.error ?? "שגיאה"}` });
  };

  const handleSave = async () => {
    const extra2: Record<string, unknown> = { updatedData: data };
    await sendAction("manual_save", extra2, "השינויים נשמרו בהצלחה ✓");
  };

  const handleAiSubmit = async () => {
    if (!prompt.trim()) return;
    await sendAction(
      "ai_edit",
      { prompt, currentData: data },
      "הבקשה נשלחה ל-AI. עדכונים יחלו בעת רענון.",
    );
    setPrompt("");
    setAiOpen(false);
  };

  const handleRecall = async () => {
    await sendAction("recall", {}, "האתר חזר לגרסה הראשונה ✓");
    recallOriginal();
  };

  if (barDown) return <ExpandPill onExpand={() => setBarDown(false)} />;

  return (
    <>
      <motion.div
        initial={{ y: -80 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 260, damping: 24 }}
        className="fixed inset-x-0 top-0 z-[100001] mx-auto flex max-w-6xl flex-wrap items-center gap-2 rounded-b-2xl border-b border-white/10 bg-gray-950/90 px-3 py-2 text-sm text-white shadow-2xl backdrop-blur"
      >
        {/* Template switcher */}
        <span className="flex items-center gap-1 rounded-lg bg-white/5 px-3 py-2">
          <Layout className="h-4 w-4 text-cyan-300" aria-hidden="true" />
          <select
            value={data.templateId}
            onChange={(e) => setTemplate(e.target.value as TemplateId)}
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
          <Palette className="h-4 w-4 text-pink-300" aria-hidden="true" />
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

        {/* AI change request */}
        <button
          onClick={() => setAiOpen(true)}
          className="rounded-lg border border-violet-400/40 bg-violet-500/15 px-3 py-2 font-semibold text-violet-200 transition hover:bg-violet-500/25"
        >
          <span className="inline-flex items-center gap-1.5">
            <Bot className="h-4 w-4" aria-hidden="true" />
            בקש שינוי מ-AI
          </span>
        </button>

        {/* Save */}
        <button
          onClick={handleSave}
          disabled={status.kind === "sending"}
          className="rounded-lg border border-emerald-400/40 bg-emerald-500/15 px-3 py-2 font-semibold text-emerald-200 transition hover:bg-emerald-500/25 disabled:opacity-50"
        >
          <span className="inline-flex items-center gap-1.5">
            {status.kind === "sending" ? (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            ) : (
              <Save className="h-4 w-4" aria-hidden="true" />
            )}
            שמור שינויים
          </span>
        </button>

        {/* Recall */}
        <button
          onClick={handleRecall}
          disabled={status.kind === "sending"}
          className="rounded-lg border border-amber-400/40 bg-amber-500/15 px-3 py-2 font-semibold text-amber-200 transition hover:bg-amber-500/25 disabled:opacity-50"
        >
          <span className="inline-flex items-center gap-1.5">
            <RotateCcw className="h-4 w-4" aria-hidden="true" />
            חזור לגרסה הראשונה
          </span>
        </button>

        <span className="mr-auto flex items-center gap-2 text-xs text-gray-400">
          מפתח: <code className="rounded bg-white/10 px-1.5 py-0.5">{adminKey}</code>
          <button
            onClick={() => setBarDown(true)}
            className="rounded p-1 text-gray-400 transition hover:text-white"
            aria-label="קפל את סרגל הניהול"
            title="קפל את סרגל הניהול"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </span>

        {/* Status toast */}
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
    </>
  );
}

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
        className="w-full max-w-lg rounded-2xl border border-white/10 bg-gray-900 p-6 shadow-2xl"
      >
        <div className="mb-4 flex items-center justify-between">
          <h2 className="flex items-center gap-2 text-lg font-bold text-white">
            <Bot className="h-5 w-5 text-violet-400" aria-hidden="true" />
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
          כתבו בחופשיות מה לשנות באתר. לדוגמה: "בקופסה של האודות תשנה את הטקסט ל..."
        </p>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          rows={5}
          autoFocus
          className="w-full resize-none rounded-xl border border-white/10 bg-gray-950 p-4 text-sm leading-relaxed text-gray-100 outline-none placeholder:text-gray-600 focus:border-violet-400/60"
          placeholder={"לדוגמה: בקופסה של האודות תשנה את הטקסט ל... ועדכן מחיר במחירון ל-450 ש\"ח..."}
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
            className="rounded-xl bg-violet-500 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-violet-500/30 transition hover:bg-violet-400 disabled:opacity-50"
          >
            {sending ? "שולח..." : "שלח ל-AI"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

function ExpandPill({ onExpand }: { onExpand: () => void }) {
  return (
    <button
      onClick={onExpand}
      className="fixed bottom-4 left-4 z-[100001] flex items-center gap-2 rounded-full border border-white/10 bg-gray-950/90 px-4 py-2 text-xs font-semibold text-gray-300 shadow-xl backdrop-blur transition hover:text-white"
    >
      <Layout className="h-3.5 w-3.5" aria-hidden="true" />
      Admin
    </button>
  );
}
