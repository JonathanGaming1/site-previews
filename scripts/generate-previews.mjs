/**
 * Render the five template cards as art-directed 1200x675 PNGs.
 * Run directly with `node scripts/generate-previews.mjs` or via `npm run build`.
 */
import { mkdir } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const OUT = join(ROOT, "public", "previews");
const W = 1200;
const H = 675;
const SANS = "Heebo,Arial,sans-serif";
const SERIF = "Frank Ruhl Libre,Georgia,serif";
const e = (value) => String(value).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const text = (x, y, value, { size = 14, fill = "#f1eee8", family = SANS, anchor = "start", spacing = 0, weight = 400, opacity = 1 } = {}) => `<text x="${x}" y="${y}" fill="${fill}" font-family="${family}" font-size="${size}" font-weight="${weight}" text-anchor="${anchor}" letter-spacing="${spacing}" opacity="${opacity}">${e(value)}</text>`;
const rect = (x, y, w, h, fill, stroke = "none", extra = "") => `<rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${fill}" stroke="${stroke}" ${extra}/>`;
const line = (x1, y1, x2, y2, stroke, opacity = 1, width = 1) => `<line x1="${x1}" y1="${y1}" x2="${x2}" y2="${y2}" stroke="${stroke}" stroke-opacity="${opacity}" stroke-width="${width}"/>`;
const svg = (body, defs = "") => `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}"><defs>${defs}</defs>${body}</svg>`;

function forge() {
  return svg(`
    ${rect(0,0,W,H,"#030303")}
    <ellipse cx="600" cy="368" rx="475" ry="242" fill="url(#vignette)"/>
    ${rect(125,305,950,195,"url(#studio)")}
    <ellipse cx="600" cy="478" rx="380" ry="31" fill="#8d7139" opacity=".18" filter="url(#blur)"/>
    <path d="M260 443 Q300 402 420 390 L490 345 Q545 318 650 332 L750 371 Q845 380 930 430 L956 449 L944 465 L250 465Z" fill="#10100f" stroke="#b99b5d" stroke-opacity=".46"/>
    <path d="M475 350 Q540 330 636 342 L711 372 L440 372Z" fill="#25231d" stroke="#c8ad76" stroke-opacity=".22"/>
    <path d="M270 443 L405 415 M755 382 L900 430" fill="none" stroke="#e6d2a2" stroke-opacity=".23"/>
    ${rect(326,450,48,8,"#d4bb82")}${rect(875,448,42,7,"#d4bb82")}
    <ellipse cx="380" cy="462" rx="34" ry="34" fill="#050505" stroke="#51452c" stroke-width="3"/><ellipse cx="820" cy="462" rx="34" ry="34" fill="#050505" stroke="#51452c" stroke-width="3"/>
    ${line(0,72,W,72,"#fff",.09)}
    ${text(64,39,"FORGE / PRIVATE ATELIER",{size:11,fill:"#d1b477",spacing:3})}
    ${text(600,40,"BESPOKE MOTOR CARS",{size:9,fill:"#ffffff",anchor:"middle",spacing:4,opacity:.55})}
    ${text(1136,40,"NAVIGATE  —",{size:10,fill:"#fff",anchor:"end",spacing:2,opacity:.7})}
    ${text(600,160,"האמנות של",{size:55,family:SERIF,anchor:"middle",weight:300})}
    ${text(600,223,"בספוק מוחלט",{size:55,family:SERIF,anchor:"middle",weight:300})}
    ${line(574,246,626,246,"#c8a97e",.7)}
    ${text(600,550,"שלוש מכוניות. מפרט אחד. אטלייה אחד.",{size:13,anchor:"middle",opacity:.7})}
    ${text(600,586,"DISCOVER THE ATELIER   ·   REQUEST A PRIVATE SPECIFICATION",{size:9,fill:"#c8a97e",anchor:"middle",spacing:2})}
    ${[0,1,2].map((i)=>`${rect(178+i*286,616,270,38,"#080808","#fff","stroke-opacity='.12'")}${text(195+i*286,640,`STAGE 0${i+1}   /   BESPOKE`,{size:9,fill:"#c8a97e",spacing:1.4})}`).join("")}
  `, `<radialGradient id="vignette"><stop offset="0" stop-color="#443a2a" stop-opacity=".32"/><stop offset=".64" stop-color="#10100e" stop-opacity=".5"/><stop offset="1" stop-color="#030303"/></radialGradient><linearGradient id="studio" x2="0" y2="1"><stop stop-color="#171613"/><stop offset="1" stop-color="#080808"/></linearGradient><filter id="blur"><feGaussianBlur stdDeviation="16"/></filter>`);
}

function apple() {
  const island = (x,y,w,h) => `${rect(x+3,y+12,w,h,"#000","#fff","stroke-opacity='.08'")}${rect(x,y,w,h,"#151a24","#cad8ff","rx='20' stroke-opacity='.22'")}${line(x+20,y+2,x+w-20,y+2,"#fff",.24,2)}`;
  return svg(`
    ${rect(0,0,W,H,"#07090e")}${rect(0,0,W,H,"url(#nebula)")}${rect(0,0,W,H,"url(#grid)","none","opacity='.32'")}
    <rect x="448" y="18" width="304" height="42" rx="21" fill="#11141b" stroke="#fff" stroke-opacity=".2"/>
    <circle cx="477" cy="39" r="4" fill="#7ef0c1"/>${text(496,43,"SPATIAL FIELD   /   04:28 PM",{size:10,fill:"#e4e9f4",spacing:1.2})}
    ${island(68,100,656,348)}
    ${text(105,141,"PRIVATE SPACE  /  01",{size:9,fill:"#9ec7ff",spacing:2.6})}
    ${text(682,220,"המרחב שמתאים",{size:41,family:SERIF,anchor:"end",weight:300})}
    ${text(682,270,"את עצמו אליכם",{size:41,family:SERIF,anchor:"end",weight:300})}
    ${text(682,310,"אדריכלות וחוויות שנבנו סביבכם.",{size:12,anchor:"end",opacity:.58})}
    ${rect(472,347,176,40,"#9fc9ff","none","rx='20'")}${text(560,372,"כניסה למרחב",{size:11,fill:"#09101b",anchor:"middle",weight:600})}
    ${island(751,100,381,200)}
    <rect x="769" y="118" width="345" height="163" rx="14" fill="url(#islandGlow)"/>
    <path d="M785 245 L865 172 930 223 1000 150 1097 245" fill="none" stroke="#d5e5ff" stroke-opacity=".32" stroke-width="2"/>
    ${text(788,264,"LEVITATING ISLAND / MATERIAL STUDY",{size:8,fill:"#c4d9ff",spacing:1.4})}
    ${island(751,321,381,126)}${text(780,353,"LIVE REPUTATION",{size:8,fill:"#9ec7ff",spacing:2})}${text(780,402,"4.9",{size:38,family:SERIF})}${text(855,401,"24 VERIFIED REVIEWS",{size:9,opacity:.55,spacing:1})}
    ${island(68,466,1064,166)}
    ${text(100,499,"FLOATING SERVICE ISLANDS",{size:8,fill:"#9ec7ff",spacing:2})}
    ${["ARCHITECTURE","IMMERSIVE DESIGN","PRIVATE CONSULTATION","MATERIAL LAB"].map((label,i)=>`${rect(95+i*250,516,228,90,"#fff","#d5e5ff","rx='13' fill-opacity='.035' stroke-opacity='.14'")}${text(114+i*250,546,`0${i+1}`,{size:9,fill:"#9ec7ff",spacing:1.5})}${text(114+i*250,575,label,{size:10,fill:"#f0f4fc",spacing:1.2})}`).join("")}
  `, `<radialGradient id="nebula" cx="76%" cy="4%" r="88%"><stop stop-color="#425a9b" stop-opacity=".35"/><stop offset="1" stop-color="#07090e" stop-opacity="0"/></radialGradient><pattern id="grid" width="70" height="70" patternUnits="userSpaceOnUse"><path d="M70 0H0V70" fill="none" stroke="#b8cbff" stroke-opacity=".11"/></pattern><linearGradient id="islandGlow" x2="1" y2="1"><stop stop-color="#7989b3"/><stop offset=".45" stop-color="#333e58"/><stop offset="1" stop-color="#151a23"/></linearGradient>`);
}

function horology() {
  const frame = (x,y,w,h,depth) => `<path d="M${x} ${y}l${depth} ${-depth/2}h${w}l-${depth} ${depth/2}z" fill="#fff" fill-opacity=".035" stroke="#c8a97e" stroke-opacity=".35"/><path d="M${x} ${y}v${h}l${depth} ${-depth/2}v-${h}z" fill="#b38b5c" fill-opacity=".08" stroke="#c8a97e" stroke-opacity=".25"/><path d="M${x} ${y+h}l${depth} ${-depth/2}h${w}l-${depth} ${depth/2}z" fill="#fff" fill-opacity=".018" stroke="#c8a97e" stroke-opacity=".25"/>`;
  return svg(`
    ${rect(0,0,W,H,"#040405")}${rect(0,0,W,H,"url(#bronzeGlow)")}
    ${line(0,75,W,75,"#fff",.09)}
    ${text(58,39,"OBSIDIAN / PRIVATE OFFICE",{size:10,fill:"#c8a97e",spacing:2.6})}
    ${text(600,39,"PENTHOUSE · 3D GALLERY",{size:9,fill:"#fff",anchor:"middle",opacity:.55,spacing:2.5})}
    ${text(1140,39,"PRIVATE ACCESS",{size:9,fill:"#d9c3a4",anchor:"end",spacing:2})}
    ${frame(730,198,245,300,65)}${frame(800,154,245,300,65)}${frame(867,115,245,300,65)}
    <path d="M800 455h270M790 485h310M830 515h210" stroke="#c8a97e" stroke-opacity=".19"/>
    ${rect(850,202,240,206,"url(#room)","#c8a97e","stroke-opacity='.27'")}
    <path d="M875 385V260h66v125m18 0V235h90v150" fill="none" stroke="#e2c79d" stroke-opacity=".3" stroke-width="2"/>
    <path d="M870 391h236" stroke="#c8a97e" stroke-opacity=".35"/>
    ${text(1090,437,"SMOKED BRONZE / MATERIAL 01",{size:8,fill:"#c8a97e",anchor:"end",spacing:1.5})}
    ${text(655,164,"OBSIDIAN RESIDENCE",{size:8,fill:"#c8a97e",anchor:"end",spacing:3})}
    ${text(655,222,"מרחב פרטי.",{size:48,family:SERIF,anchor:"end",weight:300})}
    ${text(655,280,"סטנדרט אחר.",{size:48,family:SERIF,anchor:"end",weight:300})}
    ${text(655,318,"גלריה אדריכלית של חומר, אור ושירות אישי.",{size:12,anchor:"end",opacity:.58})}
    ${text(655,340,"עד הפרט האחרון.",{size:12,anchor:"end",opacity:.58})}
    ${rect(480,374,175,40,"#c8a97e","#c8a97e","fill-opacity='.14' stroke-opacity='.64'")}${text(567,399,"תיאום אירוח פרטי",{size:10,fill:"#ead5b4",anchor:"middle"})}
    ${text(64,479,"LIGHTING ATELIER",{size:8,fill:"#c8a97e",spacing:2.1})}
    ${["AMBIENT GOLD","MIDNIGHT TITANIUM","CRIMSON STUDIO"].map((label,i)=>`${rect(64+i*204,500,188,48,i===0?"#5a4028":"#111112","#c8a97e","stroke-opacity='.25'")}${rect(64+i*204,500,4,48,["#d4a65b","#91a8c1","#b75358"][i])}${text(80+i*204,529,label,{size:8,fill:"#eee2d0",spacing:1})}`).join("")}
    ${rect(706,485,430,145,"#110f0d","#c8a97e","stroke-opacity='.2'")}
    ${text(735,516,"THE MATERIAL GALLERY",{size:8,fill:"#c8a97e",spacing:1.9})}
    ${[0,1,2].map((i)=>`${rect(735+i*126,533,112,74,["#383029","#292b2c","#4a3934"][i],"#c8a97e","stroke-opacity='.22'")}${line(746+i*126,546,825+i*126,546,"#f0d9b5",.35,2)}${text(746+i*126,594,["BRONZE","SATIN","SMOKED"][i],{size:7,fill:"#e6d6c0",spacing:1})}`).join("")}
    ${line(64,622,1136,622,"#fff",.12)}${text(64,647,"BY APPOINTMENT",{size:8,fill:"#c8a97e",spacing:2})}${text(1136,647,"PRIVATE OFFICE  ·  RAMAT GAN",{size:8,fill:"#fff",anchor:"end",opacity:.42,spacing:1.6})}
  `, `<radialGradient id="bronzeGlow" cx="78%" cy="20%" r="75%"><stop stop-color="#5f432b" stop-opacity=".3"/><stop offset="1" stop-color="#040405" stop-opacity="0"/></radialGradient><linearGradient id="room" x2="1" y2="1"><stop stop-color="#594531"/><stop offset=".48" stop-color="#191715"/><stop offset="1" stop-color="#09090a"/></linearGradient>`);
}

function kinetic() {
  const bars = Array.from({ length: 56 }, (_, i) => {
    const x = 77 + i * 12;
    const amp = Math.abs(Math.sin(i * 0.38) * 36 + Math.sin(i * 0.13 + 1) * 23) + 6;
    return `<rect x="${x}" y="${570-amp}" width="5" height="${amp}" fill="${i%7===0?"#caff4b":"#b7c0cd"}" opacity="${i%7===0?".95":".55"}"/>`;
  }).join("");
  return svg(`
    ${rect(0,0,W,H,"#07080b")}${rect(0,0,W,H,"url(#chromeGlow)")}${rect(55,50,8,570,"#caff4b")}
    ${text(82,38,"KINETIC MONOLITH / LIQUID CHROME SYSTEMS",{size:8,fill:"#caff4b",spacing:2})}${text(1138,38,"TLV / MMXXVI",{size:8,fill:"#fff",anchor:"end",opacity:.42,spacing:2})}
    ${text(82,126,"FORM / 01",{size:8,fill:"#caff4b",spacing:2.5})}
    ${text(82,222,"החלום שלכם",{size:67,family:SERIF,weight:300})}${text(82,294,"בכרום נוזלי",{size:67,family:SERIF,fill:"url(#chromeText)",weight:300})}
    ${text(84,329,"פרויקטים שנבנים כגוף אחד. אפס פשרות.",{size:12,opacity:.55})}
    ${rect(84,358,175,42,"#caff4b")}${text(171,385,"כניסה לדק",{size:11,fill:"#090a0d",anchor:"middle",weight:600})}
    <path d="M715 135l80-28h250l62 28v240H715z" fill="#161a20" stroke="#c8d0dc" stroke-opacity=".35"/><path d="M730 145l70-21h221l70 21v210H730z" fill="url(#slab)" stroke="#f3f5fa" stroke-opacity=".25"/><path d="M731 154h360" stroke="#fff" stroke-opacity=".38" stroke-width="3"/><path d="M750 335l110-162h58l-105 162m158 0 94-134h37l-82 134" fill="none" stroke="#f7f9ff" stroke-opacity=".2" stroke-width="12"/>
    ${text(1056,186,"01",{size:51,family:SERIF,fill:"#e7ebf2",anchor:"end",weight:300})}${text(1057,327,"CHROME / SCULPTURE",{size:8,fill:"#caff4b",anchor:"end",spacing:2})}
    ${rect(82,425,1040,202,"#0b0d11","#fff","stroke-opacity='.12'")}${text(105,453,"LIVE WAVE MODULATOR",{size:8,fill:"#caff4b",spacing:2})}${text(1097,453,"SIGNAL / 56 BANDS",{size:8,fill:"#fff",anchor:"end",opacity:.42,spacing:1.6})}
    ${line(100,570,1100,570,"#fff",.12)}${bars}${line(100,580,1100,580,"#caff4b",.55)}${rect(581,572,10,16,"#caff4b")}
    ${text(105,611,"FORM",{size:8,fill:"#fff",opacity:.4,spacing:2})}${text(1097,611,"FULL SYSTEM",{size:8,fill:"#fff",anchor:"end",opacity:.4,spacing:2})}
    ${text(82,658,"ACOUSTIC  —  CHROME  —  MONOLITH  —  PRECISION",{size:8,fill:"#fff",opacity:.35,spacing:1.8})}${text(1120,658,"01 / 05",{size:8,fill:"#caff4b",anchor:"end",spacing:1.8})}
  `, `<linearGradient id="chromeGlow" x2="1" y2="1"><stop stop-color="#596575" stop-opacity=".22"/><stop offset=".55" stop-color="#08090c" stop-opacity="0"/><stop offset="1" stop-color="#caff4b" stop-opacity=".07"/></linearGradient><linearGradient id="chromeText" x2="0.8" y2="1"><stop stop-color="#fff"/><stop offset=".48" stop-color="#737e8d"/><stop offset=".62" stop-color="#f8fbff"/><stop offset="1" stop-color="#7b8491"/></linearGradient><linearGradient id="slab" x2="1" y2="1"><stop stop-color="#aeb8c7"/><stop offset=".25" stop-color="#363d48"/><stop offset=".47" stop-color="#c7ced8"/><stop offset=".68" stop-color="#424954"/><stop offset="1" stop-color="#14171c"/></linearGradient>`);
}

function swiss() {
  const curtains = ["#373127", "#554535", "#282824", "#40372d"];
  return svg(`
    ${rect(0,0,W,H,"#070706")}${rect(0,0,W,H,"url(#blueprint)","none","opacity='.9'")}
    ${line(60,72,1140,72,"#e1d4bf",.23)}
    ${text(60,39,"MUSEUM OF MATERIAL / VOL. 01",{size:9,fill:"#d0b58a",spacing:2.2})}${text(600,42,"ארכיטקטורה של מגורים",{size:15,family:SERIF,anchor:"middle",opacity:.84})}${text(1140,39,"THE ARCHIVE · 2026",{size:9,fill:"#fff",anchor:"end",opacity:.42,spacing:1.8})}
    ${text(70,122,"01 — THE COVER",{size:8,fill:"#c8a97e",spacing:2.2})}
    ${text(70,224,"N° 01",{size:78,family:SERIF,fill:"#eee8dd",weight:300})}
    ${text(70,293,"החלל שבין",{size:42,family:SERIF,fill:"#eee8dd",weight:300})}${text(70,344,"החומר לאור",{size:42,family:SERIF,fill:"#eee8dd",weight:300})}
    ${text(72,385,"מוזיאון חי של פרטים, פרופורציות ומרחב.",{size:11,fill:"#eee8dd",opacity:.52})}
    ${text(72,422,"DISCOVER THE COLLECTION  →",{size:8,fill:"#c8a97e",spacing:1.8})}
    ${rect(685,120,450,286,"#11110f","#eee8dd","stroke-opacity='.22'")}${rect(699,134,422,258,"url(#museum)")}
    ${[0,1,2,3].map((i)=>`<path d="M${740+i*94} 140v241" stroke="${i%2?"#eee8dd":"#c8a97e"}" stroke-opacity=".28" stroke-width="${i%2?2:8}"/>`).join("")}
    <path d="M700 342h420M720 160h380" stroke="#fff" stroke-opacity=".18"/><path d="M701 392l115-30 124 20 105-37 76 34" fill="none" stroke="#c8a97e" stroke-opacity=".44"/>
    ${text(1110,153,"PLATE 01 / LIGHT STUDY",{size:7,fill:"#f2e9db",anchor:"end",spacing:1.7})}
    ${line(60,454,1140,454,"#fff",.22)}${text(60,480,"ARCHIVE INDEX / 01—04",{size:8,fill:"#c8a97e",spacing:2})}${text(1140,480,"VERTICAL CURTAINS · ACTIVE SECTION 01",{size:8,fill:"#fff",anchor:"end",opacity:.42,spacing:1.4})}
    ${curtains.map((color,i)=>`${rect(60+i*270,500,270,175,color,"#fff","stroke-opacity='.2'")}${rect(60+i*270,500,270,175,"#000","none","fill-opacity='.35'")}${text(80+i*270,530,`0${i+1}`,{size:10,fill:"#d5bd9b",spacing:2})}${i===0?`${text(300,579,"חלל. חומר.",{size:25,family:SERIF,anchor:"end",fill:"#f3eee7",weight:300})}${text(300,612,"ארבעה פרקים של אדריכלות שקטה.",{size:9,anchor:"end",fill:"#fff",opacity:.62})}`:`<path d="M${105+i*270} 550v94" stroke="#c8a97e" stroke-opacity=".55" stroke-width="2"/>`}`).join("")}
  `, `<pattern id="blueprint" width="90" height="90" patternUnits="userSpaceOnUse"><path d="M90 0H0V90" fill="none" stroke="#d8c8b1" stroke-opacity=".16" stroke-width="1"/></pattern><linearGradient id="museum" x2="1" y2="1"><stop stop-color="#514332"/><stop offset=".47" stop-color="#252521"/><stop offset="1" stop-color="#090909"/></linearGradient>`);
}

const previews = [
  ["forge-automotive", forge],
  ["apple-spatial", apple],
  ["horology-chrono", horology],
  ["kinetic-monolith", kinetic],
  ["swiss-editorial", swiss],
];

await mkdir(OUT, { recursive: true });
const { default: sharp } = await import("sharp");
for (const [name, render] of previews) {
  const destination = join(OUT, `${name}.png`);
  await sharp(Buffer.from(render()), { density: 144 })
    .resize(W, H, { fit: "fill" })
    .png({ compressionLevel: 9 })
    .toFile(destination);
  console.log(`[previews] ${name}.png · ${W}x${H}`);
}
