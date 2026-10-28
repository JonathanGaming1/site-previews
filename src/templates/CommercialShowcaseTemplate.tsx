"use client";

import React, { useState } from "react";
import { BeforeAfterSlider } from "@/components/BeforeAfterSlider";
import { useSite } from "@/components/SiteProvider";
import { FaqAccordion, formatNis, parsePrice, waLink } from "@/templates/shared";
import type { LuxTheme } from "@/lib/luxtheme";
import type { FaqItem, ProjectItem, ServiceItem } from "@/types/site";

type ShowcaseDesign = "forge" | "apple" | "horology" | "kinetic" | "swiss";

const DESIGN_LABELS: Record<ShowcaseDesign, string> = {
  forge: "FORGE / BESPOKE ATELIER",
  apple: "SPATIAL / DESIGN STUDIO",
  horology: "OBSIDIAN / PRIVATE OFFICE",
  kinetic: "KINETIC / SYSTEMS STUDIO",
  swiss: "SWISS / ARCHITECTURAL PRESS",
};

const DEFAULT_SERVICES: ServiceItem[] = [
  { title: "פגישת ייעוץ ותכנון", description: "ממפים יחד את הצורך, האפשרויות והשלבים הבאים.", price: "החל מ־₪1,800", iconName: "Compass" },
  { title: "פתרון בהתאמה אישית", description: "בחירת חומרים, מפרט וליווי שמותאמים לפרויקט.", price: "החל מ־₪3,500", iconName: "Wrench" },
  { title: "ביצוע וגימור מקצועי", description: "עבודה מוקפדת, תיאום ציפיות ועדכון לאורך הדרך.", price: "החל מ־₪2,800", iconName: "Shield" },
];

const DEFAULT_FAQ: FaqItem[] = [
  { question: "איך מתחילים לקבל הצעת מחיר?", answer: "בוחרים את השירות וההיקף במחשבון ושולחים את הסיכום בוואטסאפ. נחזור אליכם לתיאום הפרטים והצעה מדויקת." },
  { question: "האם אפשר להתאים את השירות לפרויקט שלי?", answer: "כן. כל הצעה נבנית לפי הצורך, היקף העבודה והעדפותיכם, לאחר שיחת היכרות קצרה." },
  { question: "מתי אפשר להתחיל?", answer: "זמינות ותאריכים מתואמים אישית בשיחה, יחד עם לוח זמנים ברור לפני תחילת העבודה." },
  { question: "איזו אחריות מקבלים?", answer: "האחריות והכיסוי מפורטים בהצעה לפי סוג השירות והעבודה." },
];

const FALLBACK_IMAGES = [
  "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1400&q=85",
  "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1000&q=85",
  "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1000&q=85",
  "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?auto=format&fit=crop&w=1000&q=85",
];

const PALETTES: Record<ShowcaseDesign, { accent: string; dark: { bg: string; surface: string; raised: string; text: string; muted: string; border: string }; light: { bg: string; surface: string; raised: string; text: string; muted: string; border: string } }> = {
  forge: { accent: "#bd9656", dark: { bg: "#11110f", surface: "#1b1a17", raised: "#24221d", text: "#f5f1e8", muted: "#b4ad9f", border: "#534831" }, light: { bg: "#f4f1e9", surface: "#fffdf8", raised: "#ebe5d8", text: "#211d16", muted: "#716959", border: "#d6c8a8" } },
  apple: { accent: "#3986df", dark: { bg: "#10131a", surface: "#191e28", raised: "#222b39", text: "#f2f6ff", muted: "#aab5c7", border: "#35445b" }, light: { bg: "#f1f6ff", surface: "#ffffff", raised: "#e2edfc", text: "#121c2b", muted: "#62738a", border: "#ccdcef" } },
  horology: { accent: "#b48a52", dark: { bg: "#151310", surface: "#201c17", raised: "#2c251c", text: "#f4ecde", muted: "#bcb09d", border: "#5a4832" }, light: { bg: "#f5f0e7", surface: "#fffdf8", raised: "#eee5d6", text: "#292116", muted: "#796c5b", border: "#d7c6a9" } },
  kinetic: { accent: "#b0d832", dark: { bg: "#111419", surface: "#1a2026", raised: "#252e36", text: "#f0f4f7", muted: "#adb7c1", border: "#404d56" }, light: { bg: "#f1f4eb", surface: "#ffffff", raised: "#e5ebd9", text: "#171d15", muted: "#65705e", border: "#cbd5bb" } },
  swiss: { accent: "#a36e43", dark: { bg: "#171614", surface: "#211f1b", raised: "#2d2923", text: "#f2ede3", muted: "#b8afa1", border: "#554638" }, light: { bg: "#f2eee6", surface: "#fffdf8", raised: "#e9e1d4", text: "#27231e", muted: "#71685c", border: "#d4c7b5" } },
};

export function CommercialShowcaseTemplate({ design }: { design: ShowcaseDesign }) {
  const { data, editsFor } = useSite();
  const info = data.businessInfo;
  const hero = data.hero;
  const services = data.services?.length ? data.services : DEFAULT_SERVICES;
  const projects: ProjectItem[] = data.projects?.length ? data.projects : services.slice(0, 4).map((service, index) => ({
    title: service.title,
    description: service.description,
    beforeImage: FALLBACK_IMAGES[index % FALLBACK_IMAGES.length],
    afterImage: hero.backgroundImage || FALLBACK_IMAGES[index % FALLBACK_IMAGES.length],
  }));
  const faq = data.faq?.length ? data.faq : DEFAULT_FAQ;
  const reviews = data.reviews ?? [];
  const [dark, setDark] = useState(true);
  const [themeReady, setThemeReady] = useState(false);
  const [serviceIndex, setServiceIndex] = useState(0);
  const [scope, setScope] = useState(24);
  const [packageIndex, setPackageIndex] = useState(1);
  const palette = PALETTES[design];
  const colors = dark ? palette.dark : palette.light;
  const whatsapp = String(info.whatsapp || info.phone || "").replace(/\D/g, "").replace(/^0/, "972");
  const service = services[serviceIndex] ?? services[0];
  const basePrice = parsePrice(service?.price) ?? 1800;
  const packageOptions = [
    { label: "חיוני", factor: 0.9 },
    { label: "מורחב", factor: 1 },
    { label: "פרימיום", factor: 1.25 },
  ];
  const estimate = Math.round((basePrice * (0.7 + scope / 48) * packageOptions[packageIndex].factor) / 100) * 100;
  const quote = `שלום ${info.name || ""}, אשמח להצעה עבור ${service?.title || "השירות"}.\nהיקף: ${scope} יחידות\nמסלול: ${packageOptions[packageIndex].label}\nאומדן ראשוני: ${formatNis(estimate)}\nאשמח לתיאום שיחה.`;
  const heroImage = hero.backgroundImage || FALLBACK_IMAGES[0];
  const compareProject = projects[0];
  const comparisonTheme: LuxTheme = {
    accent: palette.accent,
    dark,
    pageBg: colors.bg,
    surface: colors.raised,
    border: colors.border,
    headline: colors.text,
    text: colors.text,
    muted: colors.muted,
  };
  const cssVars = {
    "--shop-bg": colors.bg,
    "--shop-surface": colors.surface,
    "--shop-raised": colors.raised,
    "--shop-text": colors.text,
    "--shop-muted": colors.muted,
    "--shop-border": colors.border,
    "--shop-accent": palette.accent,
  } as React.CSSProperties;
  const tags = [info.category || "פרויקט נבחר", "תכנון מוקפד", "ביצוע אישי"];

  React.useEffect(() => {
    try {
      const saved = window.localStorage.getItem(`commercial-theme-${design}`);
      if (saved === "light" || saved === "dark") setDark(saved === "dark");
    } catch {
      // Keep the in-memory theme if browser storage is unavailable.
    }
    setThemeReady(true);
  }, [design]);

  const toggleTheme = () => {
    const nextDark = !dark;
    setDark(nextDark);
    try {
      window.localStorage.setItem(`commercial-theme-${design}`, nextDark ? "dark" : "light");
    } catch {
      // Theme switching remains available for the current visit.
    }
  };

  return (
    <div dir="rtl" data-design={design} data-mode={dark ? "dark" : "light"} data-theme-ready={themeReady} className="commercial-site min-h-screen transition-colors duration-300" style={cssVars}>
      <header className="commerce-header sticky top-0 z-40 border-b backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-7 md:px-10">
          <a href="#top" className="min-w-0">
            <span className="block truncate font-grotesk text-[9px] uppercase tracking-[0.25em] commerce-muted">{DESIGN_LABELS[design]}</span>
            <span className="mt-0.5 block truncate font-frank text-lg leading-tight">{info.name || "העסק שלכם"}</span>
          </a>
          <nav aria-label="ניווט ראשי" className="hidden items-center gap-5 text-xs md:flex">
            <a href="#services" className="commerce-muted hover:text-[var(--shop-text)]">השירותים</a>
            <a href="#projects" className="commerce-muted hover:text-[var(--shop-text)]">פרויקטים</a>
            <a href="#faq" className="commerce-muted hover:text-[var(--shop-text)]">שאלות נפוצות</a>
          </nav>
          <div className="flex shrink-0 items-center gap-2">
            <button type="button" aria-label={dark ? "החלפה למצב יום" : "החלפה למצב לילה"} aria-pressed={!dark} onClick={toggleTheme} className="commerce-theme-toggle rounded-full border px-3 py-2 text-[11px] transition-colors">
              {dark ? "☀️ בהיר" : "🌙 כהה"}
            </button>
            <a href={whatsapp ? waLink(whatsapp, `שלום ${info.name || ""}, אשמח לשמוע עוד על השירותים.`) : "#quote"} target={whatsapp ? "_blank" : undefined} rel={whatsapp ? "noreferrer" : undefined} className="commerce-button hidden rounded-full px-4 py-2 text-xs font-semibold sm:inline-flex">לתיאום בוואטסאפ</a>
          </div>
        </div>
      </header>

      <main id="top" className="mx-auto max-w-7xl px-4 pb-16 sm:px-7 md:px-10">
        <section className="commerce-hero grid items-center gap-8 py-12 md:grid-cols-[1fr_1.05fr] md:gap-12 md:py-20">
          <div className="relative z-10">
            <span className="commerce-kicker inline-flex items-center gap-2 text-[10px] font-semibold uppercase tracking-[0.22em] commerce-accent-text"><span className="h-1.5 w-1.5 rounded-full bg-current" />{info.category || "שירות מקצועי בהתאמה אישית"}</span>
            <h1 className="mt-5 max-w-3xl font-frank text-4xl font-light leading-[1.15] tracking-tight sm:text-5xl md:text-6xl">{hero.headline || info.tagline || info.name || "השירות שמקדם אתכם קדימה"}</h1>
            <p className="commerce-muted mt-5 max-w-2xl text-base leading-[1.9] md:text-lg">{hero.subheadline || info.description || "תכנון מדויק, שירות אישי ותוצאה שאפשר לסמוך עליה."}</p>
            <div className="mt-7 flex flex-wrap items-center gap-3">
              <a href="#quote" className="commerce-button rounded-full px-6 py-3.5 text-sm font-semibold">{hero.ctaText || "קבלת הצעה מותאמת"} <span aria-hidden="true">←</span></a>
              {info.phone ? <a href={`tel:${info.phone}`} className="commerce-secondary-button rounded-full border px-6 py-3.5 text-sm">{info.phone}</a> : null}
            </div>
            <div className="commerce-hero-note mt-8 flex flex-wrap gap-x-5 gap-y-2 border-t pt-4 text-xs commerce-muted"><span>{info.address}</span><span>{info.openingHours}</span></div>
          </div>
          <div className="commerce-hero-art commerce-card group relative min-h-[320px] overflow-hidden rounded-[28px] border md:min-h-[460px]">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={heroImage} alt={info.name || "תמונה מייצגת של העסק"} className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-[1.045]" />
            <div className="commerce-image-shade absolute inset-0" />
            <div className="absolute inset-x-5 bottom-5 flex items-end justify-between gap-4 sm:inset-x-7 sm:bottom-7"><span className="max-w-sm font-frank text-2xl font-light text-white sm:text-3xl">{info.tagline || "תוצאה מדויקת. שירות אישי."}</span><span className="shrink-0 rounded-full border border-white/35 bg-black/25 px-3 py-2 text-[10px] text-white backdrop-blur">{info.category || "נבחר בקפידה"}</span></div>
            <span className="commerce-art-index absolute right-5 top-5 font-grotesk text-[10px] tracking-[0.22em] text-white/85">01 — SHOWCASE</span>
          </div>
        </section>

        <section aria-label="מדדי אמון" className="commerce-trust commerce-card grid gap-px overflow-hidden rounded-2xl border sm:grid-cols-2 lg:grid-cols-4">
          <div className="commerce-trust-item flex items-center gap-3 p-4"><span className="commerce-google-mark">G</span><span><span className="block text-[10px] commerce-muted">דירוג Google</span><strong className="text-lg">{Number(info.googleRating || 4.9).toFixed(1)} <span className="commerce-accent-text">★</span></strong><span className="sr-only">נתון לפי פרטי העסק</span></span><span className="commerce-verified mr-auto rounded-full border px-2 py-1 text-[9px]">✓ Google</span></div>
          <div className="commerce-trust-item flex items-center gap-3 p-4"><span className="commerce-trust-icon">✦</span><span><span className="block text-[10px] commerce-muted">לקוחות ממליצים</span><strong className="text-lg">{Number(info.reviewsCount || reviews.length || 0)} ביקורות</strong></span></div>
          <div className="commerce-trust-item flex items-center gap-3 p-4"><span className="commerce-status-dot" /><span><span className="block text-[10px] commerce-muted">זמן תגובה</span><strong className="text-sm">מענה אישי ומהיר</strong></span></div>
          <div className="commerce-trust-item flex items-center gap-3 p-4"><span className="commerce-trust-icon">✓</span><span><span className="block text-[10px] commerce-muted">עבודה בראש שקט</span><strong className="text-sm">{faq.find((item) => /אחריות|warranty/i.test(item.question))?.question || "אחריות מתואמת להצעה"}</strong></span></div>
        </section>

        <section id="services" className="commerce-section py-16 md:py-20">
          <div className="mb-7 flex flex-wrap items-end justify-between gap-4"><div><span className="commerce-kicker text-[10px] font-semibold uppercase tracking-[0.2em] commerce-accent-text">מה אנחנו מציעים</span><h2 className="mt-2 font-frank text-3xl font-light md:text-4xl">שירות ברור. ערך שאפשר לראות.</h2></div><p className="max-w-md text-sm leading-relaxed commerce-muted">כל האפשרויות, הפרטים והמחירים ההתחלתיים במקום אחד — בוחרים את הכיוון וממשיכים לשיחה אישית.</p></div>
          <div className="commerce-service-grid grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {services.slice(0, 6).map((item, index) => <article key={`${item.title}-${index}`} className={`commerce-card commerce-service-card rounded-2xl border p-5 transition-all duration-300 hover:-translate-y-1 ${serviceIndex === index ? "is-selected" : ""}`}><span className="font-grotesk text-[10px] commerce-accent-text">0{index + 1} / SERVICE</span><h3 className="mt-4 text-xl font-semibold" {...(data.services?.length ? editsFor(`services.${index}.title`) : {})}>{item.title}</h3><p className="mt-2 min-h-12 text-sm leading-relaxed commerce-muted" {...(data.services?.length ? editsFor(`services.${index}.description`) : {})}>{item.description}</p><div className="mt-5 flex items-center justify-between gap-3 border-t pt-4"><span className="text-sm font-semibold">{item.price || "בהצעה אישית"}</span><button type="button" onClick={() => { setServiceIndex(index); document.getElementById("quote")?.scrollIntoView({ behavior: "smooth" }); }} className="commerce-inline-link text-xs font-semibold commerce-accent-text">למחשבון ←</button></div></article>)}
          </div>
        </section>

        <section id="quote" className="commerce-quote commerce-card grid gap-8 rounded-[28px] border p-5 sm:p-8 md:grid-cols-[1.1fr_0.9fr] md:p-10">
          <div><span className="commerce-kicker text-[10px] font-semibold uppercase tracking-[0.2em] commerce-accent-text">מחשבון הצעה אינטראקטיבי</span><h2 className="mt-3 font-frank text-3xl font-light md:text-4xl">בונים אומדן בשניות.</h2><p className="mt-3 text-sm leading-relaxed commerce-muted">כוונו את הפרטים וראו הערכה ראשונית שמתעדכנת מיד. ההצעה הסופית תותאם יחד לפרויקט.</p>
            <label className="mt-7 block text-sm font-medium">בחירת שירות<select value={serviceIndex} onChange={(event) => setServiceIndex(Number(event.target.value))} className="commerce-input mt-2 w-full rounded-xl border px-4 py-3"><option value={0}>{services[0]?.title || "שירות"}</option>{services.slice(1).map((item, index) => <option key={`${item.title}-${index}`} value={index + 1}>{item.title}</option>)}</select></label>
            <label className="mt-6 block text-sm font-medium"><span className="flex justify-between gap-4"><span>היקף הפרויקט</span><output className="commerce-accent-text">{scope} יחידות</output></span><input aria-label="היקף הפרויקט" type="range" min="5" max="100" value={scope} onChange={(event) => setScope(Number(event.target.value))} className="commerce-range mt-3 w-full" style={{ accentColor: palette.accent }} /></label>
            <fieldset className="mt-6"><legend className="text-sm font-medium">רמת שירות</legend><div className="mt-2 grid grid-cols-3 gap-2">{packageOptions.map((option, index) => <button key={option.label} type="button" aria-pressed={packageIndex === index} onClick={() => setPackageIndex(index)} className={`commerce-package rounded-xl border px-2 py-3 text-xs transition-colors ${packageIndex === index ? "is-selected" : ""}`}>{option.label}</button>)}</div></fieldset>
          </div>
          <aside className="commerce-estimate flex flex-col justify-between rounded-2xl p-5 sm:p-7"><div><span className="text-xs commerce-muted">האומדן המעודכן שלכם</span><p aria-live="polite" className="mt-2 font-frank text-4xl font-light md:text-5xl">{formatNis(estimate)}</p><p className="mt-2 text-xs commerce-muted">אומדן ראשוני, לא הצעת מחיר סופית</p><dl className="mt-7 space-y-3 border-t pt-5 text-sm"><div className="flex justify-between gap-3"><dt className="commerce-muted">שירות</dt><dd className="text-left">{service?.title}</dd></div><div className="flex justify-between gap-3"><dt className="commerce-muted">היקף</dt><dd>{scope} יחידות</dd></div><div className="flex justify-between gap-3"><dt className="commerce-muted">מסלול</dt><dd>{packageOptions[packageIndex].label}</dd></div></dl></div><a href={whatsapp ? waLink(whatsapp, quote) : undefined} target={whatsapp ? "_blank" : undefined} rel={whatsapp ? "noreferrer" : undefined} aria-disabled={!whatsapp} className={`commerce-button mt-7 inline-flex items-center justify-center rounded-full px-5 py-4 text-sm font-semibold ${!whatsapp ? "pointer-events-none opacity-50" : ""}`}>שליחת הסיכום המלא בוואטסאפ ↗</a></aside>
        </section>

        <section id="projects" className="commerce-section py-16 md:py-20">
          <div className="mb-7 flex flex-wrap items-end justify-between gap-4"><div><span className="commerce-kicker text-[10px] font-semibold uppercase tracking-[0.2em] commerce-accent-text">נבחרת הפרויקטים</span><h2 className="mt-2 font-frank text-3xl font-light md:text-4xl">רואים את התוצאה. מרגישים את ההבדל.</h2></div><span className="text-xs commerce-muted">{projects.length} פרויקטים נבחרים</span></div>
          <div className="commerce-project-grid grid gap-4 md:grid-cols-2">
            {projects.slice(0, 4).map((project, index) => <article key={`${project.title}-${index}`} className={`commerce-project commerce-card group relative min-h-[250px] overflow-hidden rounded-2xl border ${index === 0 ? "md:row-span-2 md:min-h-[520px]" : ""}`}><img src={project.afterImage || heroImage || FALLBACK_IMAGES[index % FALLBACK_IMAGES.length]} alt={project.title} className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-110" /><div className="commerce-image-shade absolute inset-0" /><div className="absolute inset-x-5 bottom-5 z-10 sm:inset-x-7 sm:bottom-7"><div className="mb-3 flex flex-wrap gap-2">{tags.map((tag) => <span key={tag} className="commerce-project-tag rounded-full border border-white/30 bg-black/25 px-3 py-1 text-[10px] text-white backdrop-blur">{tag}</span>)}</div><h3 className="font-frank text-2xl text-white md:text-3xl">{project.title}</h3><p className="mt-1 line-clamp-2 max-w-lg text-xs leading-relaxed text-white/75">{project.description}</p></div><span className="absolute right-5 top-5 z-10 font-grotesk text-[10px] tracking-[0.2em] text-white/80">PROJECT / 0{index + 1}</span></article>)}
          </div>
          <div className="commerce-comparison commerce-card mt-6 rounded-2xl border p-4 sm:p-6"><div className="mb-3 flex flex-wrap items-end justify-between gap-3"><div><span className="text-[10px] font-semibold uppercase tracking-[0.18em] commerce-accent-text">לפני ואחרי</span><h3 className="mt-1 text-xl font-semibold">העבודה מדברת בעד עצמה</h3></div><span className="text-xs commerce-muted">גררו את הידית להשוואה</span></div><BeforeAfterSlider theme={comparisonTheme} beforeImage={compareProject?.beforeImage || heroImage} afterImage={compareProject?.afterImage || heroImage} beforeLabel="לפני" afterLabel="אחרי" caption={compareProject?.title || "השוואה בין נקודת ההתחלה לתוצאה"} handleColor={palette.accent} /></div>
        </section>

        <section className="commerce-reviews commerce-card rounded-[28px] border p-5 sm:p-8 md:p-10"><div className="grid gap-8 md:grid-cols-[0.8fr_1.2fr]"><div><span className="commerce-kicker text-[10px] font-semibold uppercase tracking-[0.2em] commerce-accent-text">לקוחות משתפים</span><h2 className="mt-3 font-frank text-3xl font-light">אמון שבונים יחד.</h2><div className="mt-5 flex items-center gap-3"><span className="font-frank text-5xl">{Number(info.googleRating || 4.9).toFixed(1)}</span><span><span className="block commerce-accent-text">★★★★★</span><span className="text-xs commerce-muted">דירוג Google · {Number(info.reviewsCount || reviews.length || 0)} ביקורות</span></span></div></div><div className="grid gap-3 sm:grid-cols-2">{(reviews.length ? reviews.slice(0, 2) : [{ author: "לקוחות העסק", text: "שירות אישי, תהליך ברור ותוצאה שנעשתה בתשומת לב לפרטים.", rating: 5 }]).map((review, index) => <blockquote key={`${review.author}-${index}`} className="commerce-review-card rounded-2xl border p-5"><span className="commerce-accent-text" aria-label="5 מתוך 5 כוכבים">★★★★★</span><p className="mt-3 text-sm leading-relaxed" {...(reviews.length ? editsFor(`reviews.${index}.text`) : {})}>“{review.text}”</p><footer className="mt-4 text-xs commerce-muted">— {review.author}</footer></blockquote>)}</div></div></section>

        <section id="faq" className="commerce-faq commerce-card mt-6 rounded-[28px] border p-5 sm:p-8 md:p-10"><div className="mb-5"><span className="commerce-kicker text-[10px] font-semibold uppercase tracking-[0.2em] commerce-accent-text">כל הפרטים, בשקיפות</span><h2 className="mt-2 font-frank text-3xl font-light">שאלות נפוצות</h2></div><FaqAccordion items={faq} classes={{ card: "commerce-faq-item border-t", button: "flex w-full items-center justify-between gap-4 py-4 text-sm", icon: "commerce-accent-text h-4 w-4", answer: "commerce-muted pb-4 text-sm leading-relaxed" }} /></section>

        <footer className="commerce-footer mt-10 flex flex-wrap items-center justify-between gap-4 border-t py-6 text-xs commerce-muted"><span>{info.name || ""} {info.address ? `· ${info.address}` : ""}</span><span>{info.phone} {info.openingHours ? `· ${info.openingHours}` : ""}</span><a href={whatsapp ? waLink(whatsapp, `שלום ${info.name || ""}, אשמח לקבל פרטים נוספים.`) : "#quote"} target={whatsapp ? "_blank" : undefined} rel={whatsapp ? "noreferrer" : undefined} className="commerce-accent-text font-semibold">לשיחה אישית ←</a></footer>
      </main>
    </div>
  );
}
