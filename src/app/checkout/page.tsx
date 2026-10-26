"use client";

import React, { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowLeft,
  Check,
  CheckCircle2,
  Crown,
  FileText,
  Infinity as InfinityIcon,
  Landmark,
  Lock,
  Sparkles,
  Wrench,
  X,
  Zap,
} from "lucide-react";

type PlanId = "one-time" | "vip-monthly";

interface QuizState {
  updateFrequency?: "seldom" | "regular" | "always";
  maintenance?: "self" | "agency";
  payment?: "one-time" | "monthly";
}

const QUIZ_Q1 = [
  { value: "seldom", label: "נדיר — פעם בכמה חודשים בערך" },
  { value: "regular", label: "באופן קבוע — פעם-פעמיים בשבוע" },
  { value: "always", label: "כל הזמן — רוצה תוכן חי ומתעדכן" },
] as const;

const QUIZ_Q2 = [      { value: "self", label: "אני אסתדר לבד — פשוט שיעבוד" },
  { value: "agency", label: "שהצוות שלכם יעשה את זה בשבילי בלי לחשוב" },
] as const;

const QUIZ_Q3 = [
  { value: "one-time", label: "תשלום חד-פעמי פעם אחת ונגמר — יותר נוח לי" },
  { value: "monthly", label: "מנוי חודשי שמכסה שירות והכל — ראש שקט" },
] as const;

function recommendPlan(a: Required<QuizState>): PlanId {
  const scoreOneTime =
    (a.payment === "one-time" ? 2 : 0) +
    (a.updateFrequency === "seldom" ? 1 : 0) +
    (a.maintenance === "self" ? 1 : 0);
  return scoreOneTime >= 2 ? "one-time" : "vip-monthly";
}

/* ------------------------------------------------------------------ */
/*  Legal copy — exact Hebrew clauses required by the product spec.    */
/* ------------------------------------------------------------------ */

const TOS_CLAUSES: { title: string; body: string }[] = [
  {
    title: "היעדר החזר כספי (No Refunds)",
    body: "הלקוח מאשר כי צפה באתר ההדגמה מראש וכי מדובר במוצר דיגיטלי שיוצר והותאם אישית לעסק שלו, ולכן בהתאם לחוק הגנת הצרכן לא ניתן לבטל את העסקה ולא יינתן החזר כספי (Refund) לאחר הרכישה.",
  },
  {
    title: "תנאי אחסון ועריכה לאחר שנה בתוכנית החד-פעמית (1,800 ₪)",
    body: "התוכנית כוללת שנת אחסון ראשונה בחינם. לאחר תום השנה הראשונה, באחריות הלקוח לאחסן את האתר באופן עצמאי ולבצע בו שינויים לבד (או לבחור לחדש אחסון ותחזוקה בתשלום).",
  },
  {
    title: "מגבלת שינויים וזמני תגובה בתוכנית החודשית",
    body: "התוכנית כוללת עד 10 שינויי תוכן נקודתיים בשבוע. זמני ביצוע השינויים כפופים לעומס המערכת וללא התחייבות לזמן תגובה מיידי (SLA).",
  },
];

/* ------------------------------------------------------------------ */

const PLANS: {
  id: PlanId;
  name: string;
  badge?: string;
  price: string;
  priceNote: string;
  icon: React.ComponentType<{ className?: string }>;
  features: string[];
}[] = [
  {
    id: "one-time",
    name: "תוכנית חד-פעמית",
    badge: "בעלות מלאה על האתר",
    price: "1,800 ₪",
    priceNote: "תשלום חד-פעמי",
    icon: Landmark,
    features: [
      "הקמת אתר פרימיום מותאם אישית לעסק שלך",
      "שנה ראשונה של אחסון ותחזוקה בחינם",
      "התאמה מלאה למובייל",
      "חיבור לוואטסאפ ורשתות חברתיות",
    ],
  },
  {
    id: "vip-monthly",
    name: "תוכנית VIP חודשית",
    badge: "ראש שקט — הכל עלינו",
    price: "חודשי",
    priceNote: "מסלול חודשי",
    icon: Crown,
    features: [
      "אתר פרימיום מותאם אישית לעסק שלך",
      "אחסון שרתים ותחזוקה שוטפת ללא הגבלת זמן",
      "עד 10 שינויי תוכן בשבוע ע\"י הצוות שלנו",
      "גיבויים ואבטחה שוטפת",
    ],
  },
];

export default function CheckoutPage() {
  const [openPlan, setOpenPlan] = useState<PlanId | null>(null);
  const [recommended, setRecommended] = useState<PlanId | null>(null);
  const [quizOpen, setQuizOpen] = useState(false);
  const [agreeToS, setAgreeToS] = useState(false);
  const [agreeNoRefund, setAgreeNoRefund] = useState(false);
  const [quizState, setQuizState] = useState<QuizState>({});
  const [quizStep, setQuizStep] = useState(0);
  const [orderPlaced, setOrderPlaced] = useState(false);

  const quizComplete =
    quizState.updateFrequency !== undefined &&
    quizState.maintenance !== undefined &&
    quizState.payment !== undefined;
  const canPay = openPlan !== null && agreeToS && agreeNoRefund;

  const selectPlan = (id: PlanId) => {
    setOpenPlan(id);
    setAgreeToS(false);
    setAgreeNoRefund(false);
    setOrderPlaced(false);
    if (id === recommended) return;
  };

  const answer = (idx: number, key: keyof QuizState, value: string) => {
    if (idx !== quizStep) return;
    const next: QuizState = { ...quizState, [key]: value };
    setQuizState(next);
    if (idx < 2) {
      setQuizStep(idx + 1);
    } else {
      setQuizOpen(false);
      setRecommended(recommendPlan(next as Required<QuizState>));
    }
  };

  const QUESTIONS: {
    key: keyof QuizState;
    title: string;
    options: readonly { value: string; label: string }[];
  }[] = [
    {
      key: "updateFrequency",
      title: "באיזו תדירות אתם מעדכנים את התוכן באתר?",
      options: QUIZ_Q1,
    },
    {
      key: "maintenance",
      title: "מי אמור להתמודד עם החזקה ותחזוקה טכנית?",
      options: QUIZ_Q2,
    },
    {
      key: "payment",
      title: "איך אתם מעדיפים לשלם על האתר?",
      options: QUIZ_Q3,
    },
  ];

  return (
    <div className="min-h-screen bg-[#07070b] pb-28 text-gray-100" dir="rtl">
      {/* Ambient glow */}
      <div
        aria-hidden="true"
        className="pointer-events-none fixed inset-0 z-0"
        style={{
          background:
            "radial-gradient(60% 40% at 70% 0%, rgba(212,175,55,0.14), transparent 60%), radial-gradient(50% 40% at 15% 30%, rgba(139,92,246,0.10), transparent 60%)",
        }}
      />

      <div className="relative z-10 mx-auto max-w-5xl px-6 pt-16">
        {/* ---------- Hero ---------- */}
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          className="text-center"
        >
          <span className="mb-5 inline-flex items-center gap-2 rounded-full border border-amber-400/30 bg-amber-400/10 px-4 py-1.5 text-xs font-semibold text-amber-300">
            <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
            הזמנת אתר פרימיום • סוכנות עיצוב אוטומטית
          </span>
          <h1 className="text-4xl font-extrabold tracking-tight text-white md:text-5xl">
            בחרו את התוכנית המושלמת{" "}
            <span className="bg-gradient-to-l from-amber-300 via-amber-400 to-yellow-200 bg-clip-text text-transparent">
              לעסק שלכם
            </span>
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg leading-relaxed text-gray-400">
            שני דרכים להשיג את האתר שראיתם בהדגמה — שניהם כוללים הקמה מלאה,
            עיצוב בהתאמה אישית ועלייה לאוויר שלנו מ-A עד Z.
          </p>
        </motion.div>

        {/* ---------- Interactive quiz box ---------- */}
        <motion.section
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: 0.1 }}
          className="mt-12 overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-white/[0.06] to-transparent p-8 backdrop-blur-xl md:p-10"
        >
          <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
            <div className="text-center sm:text-right">
              <h2 className="text-2xl font-bold text-white md:text-3xl">
                איזו תוכנית הכי מתאימה בשבילך?
              </h2>
              <p className="mt-2 text-gray-400">
                שלוש שאלות קצרות — ונדע להמליץ לך בדיוק על מה שמתאים לך.
                {quizComplete && (
                  <span className="mr-1 font-semibold text-emerald-400"> השאלון הושלם ✓</span>
                )}
              </p>
            </div>
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => {
                setQuizStep(quizComplete ? 0 : 0);
                setQuizOpen(true);
              }}
              className="flex items-center gap-2 rounded-2xl bg-gradient-to-l from-amber-400 to-yellow-200 px-7 py-4 text-base font-bold text-gray-950 shadow-2xl shadow-amber-500/25"
            >
              <Zap className="h-5 w-5" aria-hidden="true" />
              {quizComplete ? "הצג את ההמלצה שלי" : "התחל את השאלון"}
              <ArrowLeft className="h-5 w-5 ltr:rotate-180 rtl:rotate-0" aria-hidden="true" />
            </motion.button>
          </div>
        </motion.section>

        {/* ---------- Pricing boxes ---------- */}
        <div className="mt-10 grid gap-6 md:grid-cols-2">
          {PLANS.map((plan, i) => {
            const isRec = recommended === plan.id;
            const isOpen = openPlan === plan.id;
            const Icon = plan.icon;
            return (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.15 + i * 0.1 }}
                className="relative"
              >
                {isRec && (
                  <motion.span
                    initial={{ scale: 0.85, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="absolute -top-4 right-1/2 z-20 flex translate-x-1/2 items-center gap-1.5 whitespace-nowrap rounded-full border border-amber-300/60 bg-gradient-to-l from-amber-400 to-yellow-200 px-5 py-1.5 text-sm font-extrabold text-gray-950"
                    style={{ boxShadow: "0 0 30px rgba(212,175,55,0.5)" }}
                  >
                    <Crown className="h-4 w-4" aria-hidden="true" />
                    התוכנית המומלצת ביותר עבורך!
                  </motion.span>
                )}
                <motion.div
                  animate={
                    isRec
                      ? { boxShadow: "0 0 44px rgba(212,175,55,0.25)", borderColor: "rgba(212,175,55,0.5)" }
                      : { boxShadow: "0 20px 50px rgba(0,0,0,0.35)", borderColor: "rgba(255,255,255,0.10)" }
                  }
                  onClick={() => selectPlan(plan.id)}
                  className={`relative z-10 flex h-full cursor-pointer flex-col rounded-3xl border bg-[#0c0c12]/80 p-8 backdrop-blur-xl transition-all duration-300 hover:border-white/25 ${
                    isOpen ? "ring-2 ring-amber-400/50" : ""
                  }`}
                  role="button"
                  aria-pressed={isOpen}
                >
                  <div className="flex items-center justify-between">
                    <span
                      className="flex h-12 w-12 items-center justify-center rounded-2xl"
                      style={{ background: "rgba(212,175,55,0.12)", color: "#d4af37" }}
                    >
                      <Icon className="h-6 w-6" />
                    </span>
                    <span className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] font-semibold text-gray-300">
                      {plan.badge}
                    </span>
                  </div>

                  <h3 className="mt-5 text-xl font-bold text-white">{plan.name}</h3>
                  <div className="mt-3 flex items-baseline gap-2" dir="rtl">
                    {plan.id === "one-time" ? (
                      <>
                        <span className="text-4xl font-extrabold text-white">1,800 ₪</span>
                        <span className="text-sm text-gray-400">{plan.priceNote}</span>
                      </>
                    ) : (
                      <>
                        <span className="text-4xl font-extrabold text-white">249 ₪</span>
                        <span className="text-sm text-gray-400">לחודש • ללא התחייבות</span>
                      </>
                    )}
                  </div>

                  <ul className="mt-6 flex-1 space-y-3">
                    {plan.features.map((f) => (
                      <li key={f} className="flex items-start gap-3 text-sm text-gray-300">
                        <CheckCircle2 className="mt-0.5 h-4.5 w-4.5 shrink-0 text-amber-400" aria-hidden="true" style={{ width: 18, height: 18 }} />
                        <span className="leading-relaxed">{f}</span>
                      </li>
                    ))}
                  </ul>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      selectPlan(plan.id);
                    }}
                    className={`mt-8 w-full rounded-2xl py-3.5 text-base font-bold transition ${
                      isOpen
                        ? "bg-amber-400 text-gray-950 hover:bg-amber-300"
                        : "border border-white/15 text-white hover:bg-white/5"
                    }`}
                  >
                    {isOpen ? "נבחרה ✓" : "הצג פרטי תוכנית"}
                  </button>
                </motion.div>
              </motion.div>
            );
          })}
        </div>

        {/* ---------- Selected plan details + ToS gate ---------- */}
        <AnimatePresence mode="wait">
          {openPlan && (
            <motion.section
              key={openPlan}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.45 }}
              className="mt-10 rounded-3xl border border-white/10 bg-[#0c0c12]/80 p-8 backdrop-blur-xl md:p-10"
            >
              <h2 className="text-2xl font-bold text-white">
                פרטי התוכנית: {PLANS.find((p) => p.id === openPlan)!.name}
              </h2>
              <ul className="mt-5 grid gap-3 md:grid-cols-2">
                {PLANS.find((p) => p.id === openPlan)!.features.map((f) => (
                  <li key={f} className="flex items-center gap-3 rounded-2xl bg-white/[0.04] px-4 py-3 text-sm text-gray-200">
                    <Check className="h-4 w-4 shrink-0 text-emerald-400" aria-hidden="true" />
                    {f}
                  </li>
                ))}
              </ul>

              {/* Scrollable ToS */}
              <div className="mt-8">
                <h3 className="flex items-center gap-2 text-lg font-bold text-amber-300">
                  <FileText className="h-5 w-5" aria-hidden="true" />
                  תקנון ותנאי שימוש (Terms of Service)
                </h3>
                <div
                  className="mt-4 max-h-72 overflow-y-auto rounded-2xl border border-white/10 bg-black/30 p-5 text-sm leading-relaxed text-gray-300"
                  tabIndex={0}
                  aria-label="תקנון ותנאי שימוש"
                >
                  <ol className="space-y-5">
                    {TOS_CLAUSES.map((c, i) => (
                      <li key={i}>
                        <p className="font-bold text-amber-200/90">
                          {i + 1}. {c.title}
                        </p>
                        <p className="mt-1.5 text-gray-400">{c.body}</p>
                      </li>
                    ))}
                    <li>
                      <p className="font-bold text-amber-200/90">4. כללי</p>
                      <p className="mt-1.5 text-gray-400">
                        הרכישה מהווה אישור לכל התנאים המפורטים לעיל. לכל שאלה או
                        הבהרה לפני תשלום — אנחנו זמינים בוואטסאפ 24/6.
                      </p>
                    </li>
                  </ol>
                </div>
              </div>

              {/* Double confirmation */}
              <div className="mt-6 space-y-3">
                <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3.5 transition hover:bg-white/[0.06]">
                  <input
                    type="checkbox"
                    checked={agreeToS}
                    onChange={(e) => setAgreeToS(e.target.checked)}
                    className="mt-1 h-5 w-5 shrink-0 cursor-pointer rounded-md accent-amber-400"
                  />
                  <span className="text-sm leading-relaxed text-gray-300">
                    אני מאשר/ת שקראתי את{" "}
                    <span className="font-bold text-amber-300">תקנון ותנאי השימוש</span>{" "}
                    במלואם ומסכים/ה לתנאיהם.
                  </span>
                </label>
                <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3.5 transition hover:bg-white/[0.06]">
                  <input
                    type="checkbox"
                    checked={agreeNoRefund}
                    onChange={(e) => setAgreeNoRefund(e.target.checked)}
                    className="mt-1 h-5 w-5 shrink-0 cursor-pointer rounded-md accent-amber-400"
                  />
                  <span className="text-sm leading-relaxed text-gray-300">
                    אני מאשר/ת שהתמיד{" "}
                    <span className="font-bold text-red-400">מדובר במוצר דיגיטלי ללא החזר כספי</span>{" "}
                    לאחר הרכישה.
                  </span>
                </label>
              </div>

              <motion.button
                whileHover={canPay ? { scale: 1.02 } : undefined}
                whileTap={canPay ? { scale: 0.98 } : undefined}
                disabled={!canPay}
                onClick={() => setOrderPlaced(true)}
                className={`mt-8 flex w-full items-center justify-center gap-2 rounded-2xl py-4 text-lg font-extrabold transition ${
                  canPay
                    ? "bg-gradient-to-l from-amber-400 to-yellow-200 text-gray-950 shadow-2xl shadow-amber-500/30"
                    : "cursor-not-allowed bg-white/5 text-gray-500"
                }`}
              >
                {!canPay && <Lock className="h-5 w-5" aria-hidden="true" />}
                המשך לתשלום
                {canPay && <ArrowLeft className="h-5 w-5" aria-hidden="true" />}
              </motion.button>
              {!canPay && (
                <p className="mt-3 text-center text-xs text-gray-500">
                  יש לסמן את שני האישורים לעיל כדי להפעיל את כפתור התשלום.
                </p>
              )}
              {orderPlaced && (
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-6 rounded-2xl border border-emerald-400/40 bg-emerald-400/10 p-5 text-center text-emerald-300"
                  role="status"
                >
                  🎉 ההזמנה התקבלה! צוות ההקמה שלנו יבוא עליכם ליצירת קשר בוואטסאפ תוך דקות.
                </motion.div>
              )}
            </motion.section>
          )}
        </AnimatePresence>

        {/* Trust strip */}
        <div className="mx-auto mt-12 flex max-w-3xl flex-wrap items-center justify-center gap-6 pb-10 text-xs text-gray-500">
          <span className="inline-flex items-center gap-1.5">
            <Wrench className="h-3.5 w-3.5" aria-hidden="true" />
            הקמה ע\"י הצוות שלנו בישראל
          </span>
          <span className="inline-flex items-center gap-1.5">
            <InfinityIcon className="h-3.5 w-3.5" aria-hidden="true" />
            אחסון ותמיכה זמינים
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Landmark className="h-3.5 w-3.5" aria-hidden="true" />
            תשלום מאובטח
          </span>
        </div>
      </div>

      {/* ---------- Quiz modal ---------- */}
      <AnimatePresence>
        {quizOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200000] flex items-center justify-center bg-black/75 p-4 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.94, y: 24, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.96, opacity: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 26 }}
              className="w-full max-w-lg rounded-3xl border border-white/10 bg-[#0d0d13] p-8 shadow-2xl"
            >
              <div className="mb-6 flex items-center justify-between">
                <div className="flex gap-2">
                  {QUESTIONS.map((_, i) => (
                    <span
                      key={i}
                      className={`h-2 w-10 rounded-full transition-all ${i <= quizStep ? "bg-amber-400" : "bg-white/10"}`}
                    />
                  ))}
                </div>
                <button
                  onClick={() => setQuizOpen(false)}
                  className="rounded-lg p-1.5 text-gray-400 transition hover:bg-white/5 hover:text-white"
                  aria-label="סגור שאלון"
                >
                  <X className="h-5 w-5" aria-hidden="true" />
                </button>
              </div>

              <p className="text-xs font-semibold tracking-widest text-amber-400">
                שאלה {quizStep + 1} מתוך 3
              </p>
              <h2 className="mt-2 text-2xl font-bold text-white">
                {QUESTIONS[quizStep].title}
              </h2>

              <div className="mt-6 flex flex-col gap-3">
                {QUESTIONS[quizStep].options.map((opt) => (
                  <motion.button
                    key={opt.value}
                    whileHover={{ scale: 1.02, x: -4 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={() => answer(quizStep, QUESTIONS[quizStep].key, opt.value)}
                    className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.04] px-5 py-4 text-right text-base font-medium text-gray-200 transition hover:border-amber-400/50 hover:bg-amber-400/10 hover:text-white"
                  >
                    {opt.label}
                    <ArrowLeft className="h-4 w-4 shrink-0 text-amber-400/70" aria-hidden="true" />
                  </motion.button>
                ))}
              </div>

              {quizStep > 0 && (
                <button
                  onClick={() => setQuizStep(quizStep - 1)}
                  className="mt-5 text-sm text-gray-400 transition hover:text-white"
                >
                  ← חזרה
                </button>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
