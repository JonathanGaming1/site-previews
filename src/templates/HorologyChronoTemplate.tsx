"use client";

/**
 * 03 — OBSIDIAN VIP PENTHOUSE & 3D GALLERY
 * A smoked-bronze architectural gallery for private commissions, lit by a
 * user-controlled studio rig and navigated through five Z-space rooms.
 */

import React, { useState } from "react";
import { motion, useMotionTemplate, useTransform } from "framer-motion";
import { useSite } from "@/components/SiteProvider";
import { formatNis, parsePrice, waLink } from "@/templates/shared";
import {
  CameraStage,
  ChapterBar,
  FaqLedger,
  LockedViewport,
  StageLight,
  livePointer,
  useCameraEngine,
  useCameraRig,
  useSceneTrack,
  type CameraScene,
} from "@/templates/wheel";

const SCENES: CameraScene[] = [
  { code: "01", label: "הפנטהאוז" },
  { code: "02", label: "תאורה" },
  { code: "03", label: "הגלריה" },
  { code: "04", label: "קונסיירז׳" },
  { code: "05", label: "החומרים" },
];

const GOLD = "#C8A97E";
const GLASS = "border border-[#C8A97E]/20 bg-[#171411]/65 shadow-[inset_0_1px_0_rgba(255,240,215,0.12)] backdrop-blur-2xl";
const MOODS = [
  { id: "gold", label: "Ambient Gold", detail: "אור ענברי רך", tint: "#D5A95F", wash: "rgba(186,131,58,0.19)" },
  { id: "titanium", label: "Midnight Titanium", detail: "אור טיטניום קר", tint: "#A7B6C8", wash: "rgba(105,145,184,0.18)" },
  { id: "crimson", label: "Crimson Studio", detail: "אור ארגמן עמוק", tint: "#D17470", wash: "rgba(166,52,53,0.19)" },
] as const;

export function HorologyChronoTemplate() {
  const { data, editsFor } = useSite();
  const info = data.businessInfo;
  const hero = data.hero;
  const services = data.services ?? [];
  const reviews = data.reviews ?? [];
  const faq = data.faq ?? [];
  const [moodIndex, setMoodIndex] = useState(0);
  const [serviceIndex, setServiceIndex] = useState(0);
  const [guestName, setGuestName] = useState("");
  const [visitDate, setVisitDate] = useState("");
  const [visitWindow, setVisitWindow] = useState("Evening / 18:00—21:00");
  const [comparison, setComparison] = useState(52);
  const [menuOpen, setMenuOpen] = useState(false);

  const mood = MOODS[moodIndex];
  const engine = useCameraEngine(SCENES.length, { sensitivity: 0.00018, depthMm: 7600 });
  const rig = useCameraRig({ tiltX: 7, tiltY: 10, lightMin: 14, lightMax: 86 });
  const { progress, active, jump } = engine;
  const scenes = [
    useSceneTrack(progress, { enter: -0.06, peak: 0, exit: 0.3, fromScale: 0.76, zoom: 1.85, depth: 540, tiltX: 5, blur: 0 }),
    useSceneTrack(progress, { enter: 0.16, peak: 0.28, exit: 0.5, fromScale: 0.5, zoom: 1.9, depth: 650, tiltX: 7, blur: 0 }),
    useSceneTrack(progress, { enter: 0.42, peak: 0.55, exit: 0.73, fromScale: 0.52, zoom: 1.85, depth: 590, tiltX: 6, blur: 20 }),
    useSceneTrack(progress, { enter: 0.65, peak: 0.77, exit: 0.92, fromScale: 0.56, zoom: 1.75, depth: 540, tiltX: 5, blur: 18 }),
    useSceneTrack(progress, { enter: 0.84, peak: 0.95, exit: 1.12, fromScale: 0.6, zoom: 1.55, depth: 500, tiltX: 4, blur: 16, opacityRange: [0.84, 0.95, 1.12], opacityValues: [0, 1, 1] }),
  ];
  const roomDrift = useTransform(progress, [0, 1], ["0%", "-8%"]);
  const glow = useMotionTemplate`radial-gradient(700px circle at ${rig.lightX}% ${rig.lightY}%, ${mood.wash}, transparent 72%)`;
  const whatsapp = String(info.whatsapp || "").replace(/\D/g, "");
  const chosenService = services[serviceIndex];
  const estimate = parsePrice(chosenService?.price);
  const bookingMessage = `שלום ${info.name}, אשמח לתאם ביקור VIP בפנטהאוז.\nשם: ${guestName || "—"}\nתאריך מועדף: ${visitDate || "גמיש"}\nחלון זמן: ${visitWindow}\nתחום: ${chosenService?.title || "סיור פרטי"}`;
  const heroImage = hero.backgroundImage || data.projects?.[0]?.afterImage;

  return (
    <LockedViewport background="#040405" text="#F3EEE6" style={{ "--penthouse-light": mood.tint } as React.CSSProperties}>
      <StageLight rig={rig} tint={mood.wash} accent="rgba(200,169,126,0.045)" size={900} />
      <motion.div aria-hidden="true" className="pointer-events-none absolute inset-0 z-0 transition-colors duration-700" style={{ background: glow }} />

      <header className="fixed inset-x-0 top-0 z-40 flex items-center justify-between border-b border-white/[0.07] px-5 py-5 md:px-12">
        <button type="button" onClick={() => jump(0)} className="text-right">
          <span className="block font-grotesk text-[10px] uppercase tracking-[0.42em]" style={{ color: GOLD }}>{info.name || "OBSIDIAN / PRIVATE OFFICE"}</span>
          <span className="mt-1 block font-grotesk text-[8px] uppercase tracking-[0.3em] text-white/35">RAMAT GAN · PRIVATE RESIDENCE</span>
        </button>
        <div className="hidden items-center gap-7 md:flex">
          {SCENES.slice(0, 4).map((scene, index) => (
            <button key={scene.code} type="button" onClick={() => jump(index)} className={`font-grotesk text-[9px] uppercase tracking-[0.22em] transition-colors ${active === index ? "text-white" : "text-white/38 hover:text-white/80"}`}>
              {scene.label}
            </button>
          ))}
        </div>
        <button type="button" onClick={() => setMenuOpen(!menuOpen)} className="border border-[#C8A97E]/35 px-4 py-2 font-grotesk text-[9px] uppercase tracking-[0.24em] text-[#C8A97E] hover:bg-[#C8A97E]/10">
          {menuOpen ? "סגירה" : "PRIVATE ACCESS"}
        </button>
      </header>

      {menuOpen ? (
        <nav className="fixed inset-x-4 top-20 z-50 border border-[#C8A97E]/25 bg-[#080808]/95 p-5 backdrop-blur-2xl md:inset-x-auto md:right-12 md:w-80">
          {SCENES.map((scene, index) => (
            <button key={scene.code} type="button" onClick={() => { jump(index); setMenuOpen(false); }} className="flex w-full items-center justify-between border-b border-white/10 py-3 text-right font-frank text-xl text-white/80 hover:text-[#C8A97E]">
              <span className="font-grotesk text-[9px] tracking-[0.2em] text-[#C8A97E]">{scene.code}</span>{scene.label}
            </button>
          ))}
        </nav>
      ) : null}

      <ChapterBar engine={engine} scenes={SCENES} accent={GOLD} hint="סובב גלגלת · תנועה איטית דרך הגלריה הפרטית" />

      <CameraStage rig={rig} perspective={1600} className="relative h-full w-full">
        {/* 01 — Glass architecture / hero */}
        <motion.section style={{ ...scenes[0], ...livePointer(active === 0) }} className="absolute inset-0 flex items-center justify-center px-5 pb-24 pt-24 md:px-16">
          <motion.div style={{ y: roomDrift }} className="relative mx-auto grid w-full max-w-7xl items-center gap-8 md:grid-cols-[1fr_1.1fr]">
            <div className="relative z-10 max-w-2xl">
              <span className="font-grotesk text-[9px] uppercase tracking-[0.48em] text-[#C8A97E]/75">A PRIVATE WORLD · 01 / 05</span>
              <h1 className="mt-5 font-frank text-4xl font-light leading-[1.18] tracking-tight text-white sm:text-6xl md:text-[4.6rem]" {...editsFor("hero.headline")}>
                {hero.headline || info.tagline || "מרחב פרטי. סטנדרט אחר."}
              </h1>
              <p className="mt-5 max-w-xl text-sm font-light leading-[1.9] text-white/55 md:text-base" {...editsFor("hero.subheadline")}>
                {hero.subheadline || info.description || "גלריה אדריכלית של חומרים, אור ושירות אישי — עד הפרט האחרון."}
              </p>
              <div className="mt-8 flex flex-wrap items-center gap-4">
                <button type="button" onClick={() => jump(3)} className="border border-[#C8A97E]/70 bg-[#C8A97E]/10 px-7 py-3.5 font-grotesk text-[10px] uppercase tracking-[0.25em] text-[#E7D4B3] transition-colors hover:bg-[#C8A97E]/20">תיאום אירוח פרטי</button>
                <span className="font-grotesk text-[9px] uppercase tracking-[0.22em] text-white/35">BY APPOINTMENT · {info.address}</span>
              </div>
              <div className="mt-10 grid max-w-lg grid-cols-3 border-t border-white/10 pt-4">
                {[["01", "אדריכלות"], ["02", "חומרים נדירים"], ["03", "קונסיירז׳ אישי"]].map(([number, label]) => <div key={number}><span className="block font-grotesk text-[9px] tracking-[0.2em] text-[#C8A97E]">{number}</span><span className="mt-2 block text-[11px] leading-relaxed text-white/55">{label}</span></div>)}
              </div>
            </div>
            <div className="relative mx-auto h-[40vh] min-h-[270px] w-full max-w-[620px]" style={{ perspective: 1300, transformStyle: "preserve-3d" }}>
              <div className="absolute inset-[10%_14%] border border-[#C8A97E]/25 bg-[#6D4C2D]/[0.08] shadow-[0_0_90px_rgba(172,125,67,0.09)]" style={{ transform: "translateZ(-120px) rotateY(-11deg)" }} />
              <div className="absolute inset-[4%_8%] border border-white/15 bg-white/[0.025]" style={{ transform: "translateZ(0px) rotateY(8deg)" }} />
              <div className="absolute inset-[15%_2%_2%_20%] overflow-hidden border border-[#C8A97E]/35 bg-gradient-to-br from-[#4a392a]/80 via-[#171513] to-[#09090a]" style={{ transform: "translateZ(85px) rotateY(-4deg)" }}>
                {heroImage ? <img src={heroImage} alt="אדריכלות הפנטהאוז" className="h-full w-full object-cover opacity-50 mix-blend-luminosity" /> : null}
                <div className="absolute inset-0 bg-gradient-to-r from-[#040405]/45 via-transparent to-[#040405]/25" />
                <div className="absolute inset-x-6 bottom-6 border-t border-[#C8A97E]/35 pt-3">
                  <span className="font-grotesk text-[8px] uppercase tracking-[0.34em] text-[#C8A97E]">THE OBSIDIAN RESIDENCE</span>
                  <p className="mt-2 font-frank text-2xl font-light text-white">אור, חומר, שקט.</p>
                </div>
              </div>
              <div className="absolute right-0 top-[8%] h-[1px] w-24 bg-[#C8A97E]/70" />
              <div className="absolute bottom-[4%] left-[4%] h-20 w-[1px] bg-[#C8A97E]/55" />
            </div>
          </motion.div>
        </motion.section>

        {/* 02 — Interactive lighting studio */}
        <motion.section style={{ ...scenes[1], ...livePointer(active === 1) }} className="absolute inset-0 flex items-center px-5 pb-24 pt-24 md:px-16">
          <div className="mx-auto grid w-full max-w-6xl gap-8 md:grid-cols-[0.8fr_1.2fr]">
            <div>
              <span className="font-grotesk text-[9px] uppercase tracking-[0.45em] text-[#C8A97E]/70">LIGHTING ATELIER · 02 / 05</span>
              <h2 className="mt-5 font-frank text-4xl font-light leading-[1.2] text-white md:text-6xl">האור משנה<br />את כל החוויה.</h2>
              <p className="mt-5 max-w-md text-sm leading-[1.9] text-white/50">שלוש סצנות תאורה אדריכליות. בחרו גוון, והחלל כולו מתכוונן סביבכם בזמן אמת.</p>
              <div className="mt-8 space-y-2">
                {MOODS.map((item, index) => <button key={item.id} type="button" aria-pressed={moodIndex === index} onClick={() => setMoodIndex(index)} className={`flex w-full items-center justify-between border px-4 py-3 text-right transition-colors ${moodIndex === index ? "border-[#C8A97E]/60 bg-white/[0.06]" : "border-white/10 hover:border-white/25"}`}><span><span className="block font-grotesk text-[10px] uppercase tracking-[0.19em] text-white/85">{item.label}</span><span className="mt-1 block text-[10px] text-white/40">{item.detail}</span></span><span className="h-5 w-8 border border-white/25" style={{ background: item.tint, boxShadow: moodIndex === index ? `0 0 26px ${item.tint}55` : undefined }} /></button>)}
              </div>
            </div>
            <motion.div animate={{ borderColor: `${mood.tint}88` }} transition={{ duration: 0.5 }} className="relative min-h-[320px] overflow-hidden border bg-[#09090A] p-6 md:min-h-[440px] md:p-9">
              <motion.div animate={{ background: `radial-gradient(ellipse at 72% 14%, ${mood.wash}, transparent 62%)` }} transition={{ duration: 0.65 }} className="absolute inset-0" />
              <div className="absolute inset-[12%_8%] border border-white/10 bg-white/[0.015]" style={{ transform: "perspective(900px) rotateY(-8deg)" }} />
              <div className="absolute inset-[20%_16%_12%_20%] border border-white/15 bg-gradient-to-br from-white/[0.07] via-[#181514]/70 to-black/70" style={{ transform: "perspective(800px) rotateY(6deg) translateZ(40px)" }} />
              <div className="absolute inset-y-[18%] right-[29%] w-[1px] bg-white/15" />
              <div className="absolute bottom-[12%] left-[16%] right-[16%] h-[1px] bg-white/15" />
              <div className="absolute bottom-8 right-8"><span className="font-grotesk text-[8px] uppercase tracking-[0.34em]" style={{ color: mood.tint }}>LIVE LIGHT STUDY</span><p className="mt-2 font-frank text-3xl font-light text-white">{mood.label}</p></div>
            </motion.div>
          </div>
        </motion.section>

        {/* 03 — Tilted architectural bento gallery */}
        <motion.section style={{ ...scenes[2], ...livePointer(active === 2) }} className="absolute inset-0 flex items-center px-5 pb-24 pt-24 md:px-16">
          <div className="mx-auto w-full max-w-6xl">
            <div className="flex flex-wrap items-end justify-between gap-4 border-b border-white/10 pb-4"><div><span className="font-grotesk text-[9px] uppercase tracking-[0.45em] text-[#C8A97E]/70">MATERIAL GALLERY · 03 / 05</span><h2 className="mt-3 font-frank text-3xl font-light leading-[1.2] text-white md:text-5xl">פרטים שנועדו להישאר.</h2></div><span className="text-[10px] tracking-[0.18em] text-white/35">הטו את המבט · גלו את השכבות</span></div>
            <motion.div style={{ rotateX: rig.rotateX, rotateY: rig.rotateY, transformStyle: "preserve-3d" }} className="mt-6 grid h-[48vh] min-h-[310px] grid-cols-2 grid-rows-2 gap-3 md:grid-cols-4 md:gap-4">
              <article className={`${GLASS} relative col-span-2 row-span-2 flex flex-col justify-end overflow-hidden p-5 md:p-8`} style={{ transform: "translateZ(55px)" }}><div className="absolute inset-0 bg-gradient-to-br from-[#826044]/40 via-[#211b16]/30 to-[#09090a]" /><div className="absolute inset-0 bg-[linear-gradient(117deg,transparent_28%,rgba(255,236,206,0.12)_29%,transparent_30%)]" /><div className="relative"><span className="font-grotesk text-[8px] uppercase tracking-[0.34em] text-[#C8A97E]">01 / SMOKED BRONZE</span><h3 className="mt-2 font-frank text-2xl font-light text-white md:text-4xl">זכוכית מעושנת</h3><p className="mt-2 max-w-sm text-xs leading-[1.8] text-white/55">עומק חומרי שמשתנה בכל זווית ובכל שעה ביום.</p></div></article>
              <article className={`${GLASS} relative flex flex-col justify-end overflow-hidden p-4 md:p-5`} style={{ transform: "translateZ(25px)" }}><div className="absolute inset-0 bg-gradient-to-br from-[#4a4034] via-[#201d19] to-[#080809]" /><div className="absolute inset-y-0 left-1/3 w-[1px] bg-[#C8A97E]/30" /><div className="relative"><span className="font-grotesk text-[8px] tracking-[0.28em] text-[#C8A97E]">02 / SATIN METAL</span><h3 className="mt-2 font-frank text-lg font-light text-white md:text-xl">מתכת סאטן</h3></div></article>
              <article className={`${GLASS} relative flex flex-col justify-end overflow-hidden p-4 md:p-5`} style={{ transform: "translateZ(75px)" }}><div className="absolute inset-0 bg-gradient-to-br from-[#5b513f] via-[#211e19] to-[#09090a]" /><div className="absolute inset-x-0 top-1/3 h-[1px] bg-white/20" /><div className="relative"><span className="font-grotesk text-[8px] tracking-[0.28em] text-[#C8A97E]">03 / PRIVATE LIGHT</span><h3 className="mt-2 font-frank text-lg font-light text-white md:text-xl">אור נסתר</h3></div></article>
            </motion.div>
          </div>
        </motion.section>

        {/* 04 — Concierge booking console */}
        <motion.section style={{ ...scenes[3], ...livePointer(active === 3) }} data-camera-ui="true" className="absolute inset-0 flex items-center overflow-y-auto px-5 pb-24 pt-24 md:px-16">
          <div className="mx-auto grid w-full max-w-6xl gap-7 md:grid-cols-[1fr_0.8fr]">
            <div className="py-2"><span className="font-grotesk text-[9px] uppercase tracking-[0.45em] text-[#C8A97E]/70">PRIVATE CONCIERGE · 04 / 05</span><h2 className="mt-5 font-frank text-4xl font-light leading-[1.2] text-white md:text-6xl">הביקור שלכם.<br />בקצב שלכם.</h2><p className="mt-5 max-w-lg text-sm leading-[1.9] text-white/50">הקונסיירז׳ הפרטי יכין עבורכם סיור אוצרות, פגישת חומרים או הצעת פרויקט דיסקרטית.</p><div className="mt-8 grid grid-cols-2 gap-3">{[["01", "סיור פרטי"], ["02", "פגישת חומרים"], ["03", "הצעת פרויקט"], ["04", "אירוח VIP"]].map(([number, title]) => <div key={number} className="border-t border-[#C8A97E]/30 pt-3"><span className="font-grotesk text-[8px] tracking-[0.25em] text-[#C8A97E]">{number}</span><p className="mt-2 text-xs text-white/65">{title}</p></div>)}</div></div>
            <form className={`${GLASS} p-5 md:p-7`} onSubmit={(event) => { event.preventDefault(); if (whatsapp) window.open(waLink(whatsapp, bookingMessage), "_blank", "noopener,noreferrer"); }}>
              <span className="font-grotesk text-[9px] uppercase tracking-[0.34em] text-[#C8A97E]">REQUEST A PRIVATE VISIT</span>
              <label className="mt-5 block text-[10px] text-white/45">שם לאירוח<input value={guestName} onChange={(event) => setGuestName(event.target.value)} autoComplete="name" className="mt-2 w-full border border-white/15 bg-black/35 px-3 py-3 text-sm text-white outline-none focus:border-[#C8A97E]/70" placeholder="השם שלכם" /></label>
              <label className="mt-4 block text-[10px] text-white/45">תאריך מועדף<input type="date" value={visitDate} onChange={(event) => setVisitDate(event.target.value)} className="mt-2 w-full border border-white/15 bg-black/35 px-3 py-3 text-sm text-white [color-scheme:dark] outline-none focus:border-[#C8A97E]/70" /></label>
              <label className="mt-4 block text-[10px] text-white/45">חלון אירוח<select value={visitWindow} onChange={(event) => setVisitWindow(event.target.value)} className="mt-2 w-full border border-white/15 bg-[#100f0e] px-3 py-3 text-sm text-white outline-none focus:border-[#C8A97E]/70"><option>Morning / 09:00—12:00</option><option>Afternoon / 13:00—17:00</option><option>Evening / 18:00—21:00</option></select></label>
              <label className="mt-4 block text-[10px] text-white/45">תחום עניין<select value={serviceIndex} onChange={(event) => setServiceIndex(Number(event.target.value))} className="mt-2 w-full border border-white/15 bg-[#100f0e] px-3 py-3 text-sm text-white outline-none focus:border-[#C8A97E]/70"><option value={0}>סיור אדריכלי פרטי</option>{services.map((service, index) => <option key={index} value={index}>{service.title}</option>)}</select></label>
              <button type="submit" className="mt-6 w-full border border-[#C8A97E]/70 bg-[#C8A97E]/15 px-5 py-3.5 font-grotesk text-[10px] uppercase tracking-[0.25em] text-[#E7D4B3] hover:bg-[#C8A97E]/25">שליחת בקשת אירוח</button>
              <p className="mt-3 text-center text-[9px] leading-relaxed text-white/35">{estimate ? `החל מ־${formatNis(estimate)} · ` : ""}הבקשה מועברת ישירות לצוות הפרטי.</p>
            </form>
          </div>
        </motion.section>

        {/* 05 — Split material comparison studio */}
        <motion.section style={{ ...scenes[4], ...livePointer(active === 4) }} className="absolute inset-0 flex items-center px-5 pb-24 pt-24 md:px-16">
          <div className="mx-auto w-full max-w-6xl"><div className="flex flex-wrap items-end justify-between gap-4"><div><span className="font-grotesk text-[9px] uppercase tracking-[0.45em] text-[#C8A97E]/70">MATERIAL STUDY · 05 / 05</span><h2 className="mt-3 font-frank text-3xl font-light leading-[1.2] text-white md:text-5xl">בין חומר גלם ליצירה.</h2></div><p className="max-w-sm text-xs leading-[1.8] text-white/45">גררו את המחוון כדי לחשוף את שכבת הגימור והאור.</p></div>
            <div className="relative mt-7 h-[42vh] min-h-[260px] overflow-hidden border border-[#C8A97E]/25 bg-[#15120f]" aria-label="השוואת חומר וגימור">
              <div className="absolute inset-0 bg-[linear-gradient(145deg,#191715_0%,#514536_48%,#0d0d0e_100%)]" />
              <div className="absolute inset-[12%_18%] border border-white/15 bg-white/[0.025]" style={{ transform: "perspective(900px) rotateY(-8deg)" }} />
              <div className="absolute inset-y-[12%] left-[28%] w-[1px] bg-white/15" />
              <div className="absolute inset-y-[12%] left-[55%] w-[1px] bg-white/15" />
              <div className="absolute inset-0 bg-gradient-to-br from-[#C8A97E]/25 via-transparent to-transparent" style={{ clipPath: `inset(0 ${100 - comparison}% 0 0)` }} />
              <div className="absolute inset-y-0 z-10 w-px bg-[#E1C49A]" style={{ left: `${comparison}%` }}><span className="absolute left-1/2 top-1/2 block h-12 w-3 -translate-x-1/2 -translate-y-1/2 border border-[#E1C49A] bg-[#080808]" /></div>
              <input aria-label="השוואת חומר וגימור" type="range" min="8" max="92" value={comparison} onChange={(event) => setComparison(Number(event.target.value))} className="absolute inset-0 z-20 h-full w-full cursor-ew-resize opacity-0" />
              <span className="absolute bottom-4 right-4 z-10 border border-white/15 bg-black/55 px-3 py-2 font-grotesk text-[8px] uppercase tracking-[0.2em] text-white/75">RAW MATERIAL</span><span className="absolute bottom-4 left-4 z-10 border border-[#C8A97E]/45 bg-black/60 px-3 py-2 font-grotesk text-[8px] uppercase tracking-[0.2em] text-[#E1C49A]">ATELIER FINISH</span>
            </div>
            <div className="mt-5 flex flex-wrap items-center justify-between gap-4 border-t border-white/10 pt-4"><div className="flex gap-6 text-[10px] text-white/45"><span>{info.phone}</span><span>{info.address}</span></div><div className="font-frank text-lg text-white/70">{reviews[0]?.text || "אירוח פרטי בתיאום מראש"}</div></div>
            <FaqLedger items={faq.slice(0, 2)} accent={GOLD} className="mt-4 grid gap-x-8 md:grid-cols-2" questionClassName="font-frank text-base font-light leading-relaxed text-white md:text-lg" answerClassName="text-xs leading-[1.8] text-white/50" columns={2} />
          </div>
        </motion.section>
      </CameraStage>
    </LockedViewport>
  );
}

export default HorologyChronoTemplate;
