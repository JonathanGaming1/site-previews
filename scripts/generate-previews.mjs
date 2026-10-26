/**
 * Generates 4 luxury 1200x675 template preview PNGs for Discord embeds.
 * Each PNG visually depicts the actual UI layout, exact background colors,
 * header pod, 3D bento cards and style language of its template.
 *
 * Usage: node scripts/generate-previews.mjs   (runs automatically before `npm run build`)
 * If `sharp` could not be installed in a given build environment, the script
 * exits gracefully — the committed PNGs in public/previews/ remain in use.
 */
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const FONTS_DIR = join(ROOT, "scripts", "fonts");
const OUT_DIR = join(ROOT, "public", "previews");

/* ------------------------------------------------------------------ */
/* Fontconfig bootstrap (build images may have zero system fonts)      */
/* ------------------------------------------------------------------ */
if (existsSync(FONTS_DIR)) {
  const fontconfigXml = `<?xml version="1.0"?>
<!DOCTYPE fontconfig SYSTEM "fonts.dtd">
<fontconfig>
  <dir>${FONTS_DIR}</dir>
  <cachedir>${join(ROOT, "node_modules", ".fontcache")}</cachedir>
  <alias><family>sans-serif</family><prefer><family>Heebo</family></prefer></alias>
  <alias><family>serif</family><prefer><family>Frank Ruhl Libre</family></prefer></alias>
</fontconfig>`;
  process.env.FONTCONFIG_FILE = join(ROOT, "scripts", "fontconfig.conf");
  writeFileSync(process.env.FONTCONFIG_FILE, fontconfigXml);
}

let sharp;
try {
  sharp = (await import("sharp")).default;
} catch {
  console.warn("[previews] sharp unavailable — keeping committed preview PNGs.");
  process.exit(0);
}

/* ------------------------------------------------------------------ */
/* Shared SVG helpers                                                  */
/* ------------------------------------------------------------------ */

const W = 1200;
const H = 675;
const GOLD_ACCENT = "#c59b27";
const APPLE_ACCENT = "#0071e3";
const QUANTUM_ACCENT = "#6e7bff";
const ATELIER_ACCENT = "#8b6a3e";

/** The Dynamic-Island header pod (centered, top of frame). */
function islandPod(accent, name, statusText) {
  return `
    <rect x="${W / 2 - 155}" y="26" width="310" height="52" rx="26"
      fill="rgba(18,18,24,0.72)" stroke="rgba(255,255,255,0.22)" stroke-width="1.4"/>
    <circle cx="${W / 2 - 128}" cy="52" r="5" fill="#30d158"/>
    <text x="${W / 2 + 130}" y="46" text-anchor="end" font-family="'Heebo'" font-size="15" font-weight="600" fill="rgba(255,255,255,0.92)">${name}</text>
    <text x="${W / 2 + 130}" y="66" text-anchor="end" font-family="'Heebo'" font-size="11.5" fill="rgba(255,255,255,0.55)">${statusText}</text>`;
}

/** 3D bento card — draw BEFORE its icon/text so content sits on top. */
function bentoCard({ x, y, w, h, r = 22, fill, stroke, glow, strokeWidth = 1.5, sheen }) {
  return `
    ${glow ? `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="none" stroke="${glow}" stroke-width="10" opacity="0.18"/>` : ""}
    ${sheen ? `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="url(#${sheen})"/>` : ""}
    <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="${fill}" stroke="${stroke}" stroke-width="${strokeWidth}"/>
    <rect x="${x + 8}" y="${y + 6}" width="${w - 16}" height="${Math.max(6, h / 2)}" rx="${Math.max(6, h / 2)}" fill="rgba(255,255,255,0.05)"/>`;
}

/** Small frosted service-icon tile. */
function iconTile(x, y, color) {
  return `<rect x="${x}" y="${y}" width="52" height="52" rx="15" fill="${color}20" stroke="${color}55" stroke-width="1.2"/>`;
}

/** Bottom live-meter bar (quote-builder affordance). */
function meterLine(x, y, w, color, pct) {
  return `
  <rect x="${x}" y="${y}" width="${w}" height="6" rx="3" fill="rgba(255,255,255,0.10)"/>
  <rect x="${x}" y="${y}" width="${w * pct}" height="6" rx="3" fill="${color}" opacity="0.9"/>`;
}

const he = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

const SERVICE_TITLES = ["מטבחים מעוצבים", "ארונות אמבטיה", "ספריית קיר", "מזנונים ואחסון"];
const SERVICE_PRICES = ["החל מ-18,000 ₪", "החל מ-9,000 ₪", "החל מ-12,000 ₪", "החל מ-7,000 ₪"];
const SERVICE_HINTS = [
  "עיצוב מדויק עד המילימטר האחרון",
  "עמבר זהב וגימור מוקפד",
  "מודול בניה חכם לחלל",
  "ארכיטקטורה של חום ואבן",
];

/* ------------------------------------------------------------------ */
/* Template mockups                                                    */
/* ------------------------------------------------------------------ */

function appleSpatial() {
  const accent = APPLE_ACCENT;
  const cards = [0, 1, 2, 3]
    .map((i) => {
      const x = 90 + i * 258;
      return `
      ${bentoCard({ x: x - 4, y: 460, w: 240, h: 152, fill: "rgba(255,255,255,0.06)", stroke: "rgba(255,255,255,0.14)", sheen: "glassSheen" })}
      ${iconTile(x, 468, accent)}
      <text x="${x + 8}" y="547" font-family="'Heebo'" font-size="17" font-weight="700" fill="#f5f5f7">${he(SERVICE_TITLES[i])}</text>
      <text x="${x + 8}" y="572" font-family="'Heebo'" font-size="13" fill="rgba(245,245,247,0.5)">עיצוב מדויק עד המילימטר האחרון</text>
      <text x="${x + 8}" y="596" font-family="'Heebo'" font-size="13.5" font-weight="700" fill="${accent}">${he(SERVICE_PRICES[i])}</text>`;
    })
    .join("");

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
  <defs>
    <linearGradient id="glassSheen" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="rgba(255,255,255,0.10)"/>
      <stop offset="0.6" stop-color="rgba(255,255,255,0.02)"/>
    </linearGradient>
    <radialGradient id="ambient" cx="0.5" cy="-0.1" r="0.9">
      <stop offset="0" stop-color="rgba(64,110,245,0.30)"/>
      <stop offset="1" stop-color="rgba(10,10,13,0)"/>
    </radialGradient>
    <linearGradient id="ctaGrad" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="${accent}"/><stop offset="1" stop-color="#3f8cff"/>
    </linearGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="#0a0a0d"/>
  <rect width="${W}" height="${H}" fill="url(#ambient)"/>
  ${islandPod(accent, "אופק הנדימן", "פתוח כעת • זמינות לפרויקטים בהרצליה")}
  <text x="${W / 2}" y="150" text-anchor="middle" font-family="'Heebo'" font-size="14" font-weight="600" letter-spacing="6" fill="rgba(245,245,247,0.45)">SPATIAL DESIGN STUDIO</text>
  <text x="${W / 2}" y="215" text-anchor="middle" font-family="'Heebo'" font-size="46" font-weight="800" fill="#f5f5f7">נגרות יוקרתית שמקרבת את הבית</text>
  <text x="${W / 2}" y="268" text-anchor="middle" font-family="'Heebo'" font-size="46" font-weight="800" fill="url(#ctaGrad)">שתמיד רצית</text>
  <text x="${W / 2}" y="315" text-anchor="middle" font-family="'Heebo'" font-size="19" fill="rgba(245,245,247,0.6)">זכוכית מרחבית, טיטניום מוברש ובנטו תלת-ממד שנע עם הגלילה</text>
  <rect x="${W / 2 - 130}" y="345" width="150" height="44" rx="22" fill="url(#ctaGrad)"/>
  <text x="${W / 2 - 55}" y="373" text-anchor="middle" font-family="'Heebo'" font-size="15" font-weight="700" fill="#ffffff">ליצירת קשר עכשיו</text>
  <rect x="${W / 2 + 40}" y="345" width="150" height="44" rx="22" fill="rgba(255,255,255,0.06)" stroke="rgba(255,255,255,0.2)" stroke-width="1.2"/>
  <text x="${W / 2 + 115}" y="373" text-anchor="middle" font-family="'Heebo'" font-size="15" font-weight="600" fill="#f5f5f7">050-1234567</text>
  ${cards}
  ${meterLine(90, 640, 1020, accent, 0.44)}
  <text x="${W - 90}" y="658" text-anchor="end" font-family="'Heebo'" font-size="11" fill="rgba(245,245,247,0.4)">מחשבון הצעת מחיר חי — עדכון בזמן אמת</text>
</svg>`;
}

function whiskyObsidian() {
  const accent = GOLD_ACCENT;
  const bg = "#080706";
  const cards = [0, 1, 2, 3]
    .map((i) => {
      const x = 90 + i * 258;
      return `
      ${bentoCard({ x: x - 4, y: 462, w: 240, h: 152, fill: "rgba(233,214,176,0.045)", stroke: "rgba(197,155,39,0.35)", glow: "#c59b2722" })}
      <rect x="${x}" y="470" width="52" height="52" rx="15" fill="${accent}14" stroke="${accent}55" stroke-width="1.2"/>
      <text x="${x + 10}" y="550" font-family="'Frank Ruhl Libre'" font-size="17" font-weight="700" fill="#f2e8d5">${he(SERVICE_TITLES[i])}</text>
      <text x="${x + 10}" y="574" font-family="'Heebo'" font-size="13" fill="rgba(242,232,213,0.5)">${he(SERVICE_HINTS[1])}</text>
      <text x="${x + 10}" y="598" font-family="'Frank Ruhl Libre'" font-size="14" font-weight="700" fill="${accent}">${he(SERVICE_PRICES[i])}</text>`;
    })
    .join("");

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
  <defs>
    <filter id="grain"><feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves="2" stitchTiles="stitch" result="n"/><feColorMatrix in="n" type="saturate" values="0"/></filter>
    <radialGradient id="spotlight" cx="0.28" cy="0.18" r="0.75">
      <stop offset="0" stop-color="rgba(197,155,39,0.16)"/>
      <stop offset="1" stop-color="rgba(197,155,39,0)"/>
    </radialGradient>
    <radialGradient id="spotlight2" cx="0.85" cy="0.7" r="0.6">
      <stop offset="0" stop-color="rgba(226,184,87,0.10)"/>
      <stop offset="1" stop-color="rgba(226,184,87,0)"/>
    </radialGradient>
    <linearGradient id="brassCta" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="#c59b27"/><stop offset="1" stop-color="#e2b857"/>
    </linearGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="${bg}"/>
  <rect width="${W}" height="${H}" fill="url(#spotlight)"/>
  <rect width="${W}" height="${H}" fill="url(#spotlight2)"/>
  <rect width="${W}" height="${H}" filter="url(#grain)" opacity="0.05"/>
  <rect x="0" y="0" width="${W}" height="3" fill="url(#brassCta)" opacity="0.85"/>
  ${islandPod(accent, "אופק הנדימן", "פתוח כעת • זמינות לפרויקטים בהרצליה")}
  <text x="${W / 2}" y="148" text-anchor="middle" font-family="'Frank Ruhl Libre'" font-size="15" letter-spacing="8" fill="${accent}">PRIVATE SINGLE-MALT CLUB BESPOKE</text>
  <text x="${W / 2}" y="222" text-anchor="middle" font-family="'Frank Ruhl Libre'" font-size="52" font-weight="900" fill="#f2e8d5">נגרות יוקרתית שמקרבת</text>
  <text x="${W / 2}" y="284" text-anchor="middle" font-family="'Frank Ruhl Libre'" font-size="52" font-weight="900" fill="#f2e8d5">את הבית שתמיד רצית</text>
  <text x="${W / 2}" y="330" text-anchor="middle" font-family="'Heebo'" font-size="18" fill="rgba(242,232,213,0.6)">עיצוב ייצור והתקנה של ריהוט מעץ מלא בסטנדרט של מותג יוקרה</text>
  <rect x="${W / 2 - 145}" y="352" width="160" height="46" rx="23" fill="url(#brassCta)"/>
  <text x="${W / 2 - 65}" y="382" text-anchor="middle" font-family="'Heebo'" font-size="15" font-weight="700" fill="#14100a">ליצירת קשר עכשיו</text>
  <rect x="${W / 2 + 35}" y="352" width="160" height="46" rx="23" fill="${bg}" stroke="${accent}66" stroke-width="1.2"/>
  <text x="${W / 2 + 115}" y="382" text-anchor="middle" font-family="'Heebo'" font-size="15" font-weight="600" fill="#f2e8d5">050-1234567</text>
  ${cards}
  ${meterLine(90, 640, 1020, accent, 0.62)}
  <text x="90" y="658" font-family="'Heebo'" font-size="11" fill="rgba(242,232,213,0.45)">עמבר נוזלי • גימור מוברש • גרעין עדין</text>
</svg>`;
}

function cyberQuantum() {
  const accent = QUANTUM_ACCENT;
  const cards = [0, 1, 2, 3]
    .map((i) => {
      const x = 90 + i * 258;
      const isoY = 512 + (i % 2) * -6;
      return `
      ${bentoCard({ x: x - 4, y: 462, w: 240, h: 152, r: 20, fill: "rgba(110,123,255,0.05)", stroke: "rgba(126,140,255,0.42)", glow: "#6e7bff55" })}
      <rect x="${x}" y="470" width="52" height="52" rx="15" fill="rgba(110,123,255,0.10)" stroke="rgba(126,140,255,0.4)" stroke-width="1.2"/>
      <text x="${x + 10}" y="550" font-family="'Heebo'" font-size="17" font-weight="700" fill="#eef0ff">${he(SERVICE_TITLES[i])}</text>
      <text x="${x + 10}" y="574" font-family="'Heebo'" font-size="13" fill="rgba(238,240,255,0.5)">${he(SERVICE_HINTS[2])}</text>
      <text x="${x + 10}" y="598" font-family="'Heebo'" font-size="13.5" font-weight="700" fill="#8f9bff">${he(SERVICE_PRICES[i])}</text>
      <g transform="translate(${x + 172} ${isoY})" opacity="0.3">
        <rect x="0" y="8" width="54" height="32" rx="4" fill="none" stroke="#8f9bff" stroke-width="1"/>
        <rect x="6" y="0" width="54" height="32" rx="4" fill="none" stroke="#6e7bff" stroke-width="1"/>
        <rect x="12" y="-8" width="54" height="32" rx="4" fill="rgba(110,123,255,0.4)" stroke="#a3b0ff" stroke-width="1.2"/>
      </g>`;
    })
    .join("");

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
  <defs>
    <radialGradient id="aurora1" cx="0.2" cy="0.15" r="0.6">
      <stop offset="0" stop-color="rgba(110,123,255,0.26)"/>
      <stop offset="1" stop-color="rgba(110,123,255,0)"/>
    </radialGradient>
    <radialGradient id="aurora2" cx="0.85" cy="0.75" r="0.55">
      <stop offset="0" stop-color="rgba(162,88,255,0.18)"/>
      <stop offset="1" stop-color="rgba(162,88,255,0)"/>
    </radialGradient>
    <radialGradient id="aurora3" cx="0.5" cy="0.35" r="0.7">
      <stop offset="0" stop-color="rgba(56,232,255,0.08)"/>
      <stop offset="1" stop-color="rgba(56,232,255,0)"/>
    </radialGradient>
    <linearGradient id="qGrad" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#ffffff"/>
      <stop offset="0.6" stop-color="#dfe3ff"/>
      <stop offset="1" stop-color="#8f9bff"/>
    </linearGradient>
    <pattern id="grid" width="48" height="48" patternUnits="userSpaceOnUse">
      <path d="M48 0H0V48" fill="none" stroke="rgba(126,140,255,0.10)" stroke-width="1"/>
    </pattern>
  </defs>
  <rect width="${W}" height="${H}" fill="#05060f"/>
  <rect width="${W}" height="400" fill="url(#grid)" opacity="0.5"/>
  <rect width="${W}" height="${H}" fill="url(#aurora1)"/>
  <rect width="${W}" height="${H}" fill="url(#aurora2)"/>
  <rect width="${W}" height="${H}" fill="url(#aurora3)"/>
  ${islandPod(accent, "עסק הדגמה", "פתוח כעת • זמינות לפרויקטים בכפר סבא")}
  <text x="${W / 2}" y="146" text-anchor="middle" font-family="'Heebo'" font-size="13" font-weight="700" letter-spacing="7" fill="#8f9bff">FUTURESPACES // Q-STUDIO</text>
  <text x="${W / 2}" y="212" text-anchor="middle" font-family="'Heebo'" font-size="46" font-weight="800" fill="url(#qGrad)">נגרות יוקרתית שמקרבת את הבית</text>
  <text x="${W / 2}" y="262" text-anchor="middle" font-family="'Heebo'" font-size="46" font-weight="800" fill="url(#qGrad)">שתמיד רצית</text>
  <text x="${W / 2}" y="305" text-anchor="middle" font-family="'Heebo'" font-size="18" fill="rgba(238,240,255,0.6)">רשתות אור אורורה, כרטיסי מודול תלת-ממדיים ושלטי טלמטריה חיים</text>
  <g font-family="'Heebo'" font-size="12.5" font-weight="600" fill="#dbe0ff">
    <rect x="${W / 2 - 330}" y="340" width="150" height="34" rx="17" fill="rgba(110,123,255,0.08)" stroke="rgba(126,140,255,0.4)" stroke-width="1"/>
    <text x="${W / 2 - 255}" y="362" text-anchor="middle">דיוק מדידה ±2 מ״מ</text>
    <rect x="${W / 2 - 150}" y="340" width="150" height="34" rx="17" fill="rgba(110,123,255,0.08)" stroke="rgba(126,140,255,0.4)" stroke-width="1"/>
    <text x="${W / 2 - 75}" y="362" text-anchor="middle">תגובה תוך דקות</text>
    <rect x="${W / 2 + 30}" y="340" width="150" height="34" rx="17" fill="rgba(110,123,255,0.08)" stroke="rgba(126,140,255,0.4)" stroke-width="1"/>
    <text x="${W / 2 + 105}" y="362" text-anchor="middle">עדכוני פרויקט 24/7</text>
    <rect x="${W / 2 + 200}" y="340" width="150" height="34" rx="17" fill="rgba(110,123,255,0.08)" stroke="rgba(126,140,255,0.4)" stroke-width="1"/>
    <text x="${W / 2 + 275}" y="362" text-anchor="middle">פרוטוקול איכות</text>
  </g>
  <rect x="${W / 2 - 130}" y="390" width="150" height="44" rx="12" fill="${accent}" style="filter:drop-shadow(0 0 22px rgba(110,123,255,0.55))"/>
  <text x="${W / 2 - 55}" y="419" text-anchor="middle" font-family="'Heebo'" font-size="15" font-weight="800" fill="#0a0b14">ליצירת קשר עכשיו</text>
  <rect x="${W / 2 + 40}" y="390" width="150" height="44" rx="12" fill="rgba(255,255,255,0.03)" stroke="rgba(126,140,255,0.35)" stroke-width="1"/>
  <text x="${W / 2 + 115}" y="419" text-anchor="middle" font-family="'Heebo'" font-size="15" font-weight="600" fill="#eef0ff">050-1234567</text>
  ${cards}
  ${meterLine(90, 640, 1020, accent, 0.78)}
  <text x="${W - 90}" y="658" text-anchor="end" font-family="'Heebo'" font-size="11" fill="rgba(238,240,255,0.45)">בנטו איזומטרי תלת-ממד • גבולות לייזר</text>
</svg>`;
}

function atelierBoutique() {
  const accent = ATELIER_ACCENT;
  const bg = "#ede4d3";
  const cards = [0, 1, 2, 3]
    .map((i) => {
      const x = 90 + i * 258;
      return `
      ${bentoCard({ x: x - 4, y: 462, w: 240, h: 152, fill: "rgba(255,253,247,0.75)", stroke: "rgba(64,48,32,0.16)", sheen: "warmSheen" })}
      <rect x="${x}" y="470" width="52" height="52" rx="15" fill="${accent}15" stroke="rgba(64,48,32,0.25)" stroke-width="1.2"/>
      <text x="${x + 10}" y="550" font-family="'Frank Ruhl Libre'" font-size="17" font-weight="700" fill="#2a2118">${he(SERVICE_TITLES[i])}</text>
      <text x="${x + 10}" y="574" font-family="'Heebo'" font-size="13" fill="rgba(42,33,24,0.55)">${he(SERVICE_HINTS[3])}</text>
      <text x="${x + 10}" y="598" font-family="'Frank Ruhl Libre'" font-size="14" font-weight="700" fill="${accent}">${he(SERVICE_PRICES[i])}</text>`;
    })
    .join("");

  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
  <defs>
    <linearGradient id="warmSheen" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="rgba(255,255,255,0.9)"/>
      <stop offset="1" stop-color="rgba(255,252,245,0.7)"/>
    </linearGradient>
    <linearGradient id="stoneCurtain" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#d9cdb8"/>
      <stop offset="0.55" stop-color="#e6dac6"/>
      <stop offset="1" stop-color="${bg}"/>
    </linearGradient>
    <linearGradient id="travertineStripes" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="rgba(139,106,62,0.10)"/>
      <stop offset="1" stop-color="rgba(139,106,62,0.02)"/>
    </linearGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="${bg}"/>
  <rect x="0" y="0" width="${W}" height="330" fill="url(#stoneCurtain)"/>
  <rect x="60" y="30" width="220" height="360" rx="8" fill="#c9b99e" opacity="0.55"/>
  <rect x="920" y="30" width="220" height="360" rx="8" fill="#c9b99e" opacity="0.55"/>
  <rect x="80" y="180" width="1040" height="2" fill="rgba(64,48,32,0.25)"/>
  ${islandPod(accent, "אטלייה ארצית", "פתוח כעת • זמינות לפרויקטים בירושלים")}
  <text x="${W / 2}" y="150" text-anchor="middle" font-family="'Frank Ruhl Libre'" font-size="15" letter-spacing="8" fill="${accent}">ATELIER • TRAVERTINE FLAGSHIP</text>
  <text x="${W / 2}" y="222" text-anchor="middle" font-family="'Frank Ruhl Libre'" font-size="50" font-weight="900" fill="#2a2118">נגרות יוקרתית שמקרבת</text>
  <text x="${W / 2}" y="284" text-anchor="middle" font-family="'Frank Ruhl Libre'" font-size="50" font-weight="900" fill="#2a2118">את הבית שתמיד רצית</text>
  <text x="${W / 2}" y="330" text-anchor="middle" font-family="'Heebo'" font-size="18" fill="rgba(42,33,24,0.6)">אבן טרוורטין חמה, ברונזה אספרסו ורכסי תמונה בפרלקסה</text>
  <rect x="${W / 2 - 140}" y="356" width="160" height="46" rx="23" fill="${accent}"/>
  <text x="${W / 2 - 60}" y="386" text-anchor="middle" font-family="'Heebo'" font-size="15" font-weight="700" fill="#fdf9f3">ליצירת קשר עכשיו</text>
  <rect x="${W / 2 + 40}" y="356" width="160" height="46" rx="23" fill="rgba(255,253,247,0.85)" stroke="rgba(64,48,32,0.22)" stroke-width="1.2"/>
  <text x="${W / 2 + 120}" y="386" text-anchor="middle" font-family="'Heebo'" font-size="15" font-weight="600" fill="#2a2118">050-1234567</text>
  <rect x="0" y="410" width="${W}" height="24" fill="url(#travertineStripes)"/>
  ${cards}
  ${meterLine(90, 640, 1020, accent, 0.5)}
  <text x="90" y="658" font-family="'Heebo'" font-size="11" fill="rgba(42,33,24,0.45)">גיליון ראשון — פרטים בהתאמה אישית באטלייה</text>
</svg>`;
}

/* ------------------------------------------------------------------ */

mkdirSync(OUT_DIR, { recursive: true });

const targets = [
  ["apple-spatial", appleSpatial],
  ["whisky-obsidian", whiskyObsidian],
  ["cyber-quantum", cyberQuantum],
  ["atelier-boutique", atelierBoutique],
];

for (const [name, buildSvg] of targets) {
  try {
    const svg = buildSvg();
    const out = join(OUT_DIR, `${name}.png`);
    await sharp(Buffer.from(svg), { density: 150 })
      .resize(1200, 675, { fit: "cover" })
      .png({ compressionLevel: 9 })
      .toFile(out);
    console.log(`[previews] ✓ ${out}`);
  } catch (err) {
    console.error(`[previews] ✗ ${name}: ${err?.message ?? err}`);
    process.exitCode = 1;
  }
}
