/**
 * Generates the five art-directed 1200x675 template preview PNGs used in
 * Discord embeds and the admin template switcher.
 *
 *   forge-automotive → pitch black atelier, masked studio photo, three-car
 *                      vignette, thin serif hero, three-stage spec strip
 *   apple-spatial    → titanium void, eight levitating glass islands,
 *                      Dynamic Island status pod, pinned product island
 *   horology-chrono  → midnight sapphire, champagne gold ticks, rotating
 *                      bezel, chronograph dial, roman indices
 *   kinetic-monolith → carbon + liquid chrome slabs, oversized type,
 *                      live waveform modulator, horizontal deck
 *   swiss-editorial  → travertine blueprint grid, magazine cover, giant
 *                      N° 01, framed archive plate, 60% curtain column
 *
 * Usage: node scripts/generate-previews.mjs  (runs before `npm run build`)
 */
import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const FONTS_DIR = join(ROOT, "scripts", "fonts");
const OUT_DIR = join(ROOT, "public", "previews");

/* Fontconfig bootstrap (build images may have zero system fonts) */
if (existsSync(FONTS_DIR)) {
  const fontconfigXml = `<?xml version="1.0"?>
<!DOCTYPE fontconfig SYSTEM "fonts.dtd">
<fontconfig>
  <dir>${FONTS_DIR}</dir>
  <cachedir>${join(ROOT, "node_modules", ".fontcache")}</cachedir>
  <alias><family>sans-serif</family><prefer><family>Heebo</family></prefer></alias>
  <alias><family>serif</family><prefer><family>Frank Ruhl Libre</family></prefer></alias>
</fontconfig>`;
  const generatedFontconfig = join(
    ROOT,
    "node_modules",
    ".fontconfig-previews.xml",
  );
  mkdirSync(dirname(generatedFontconfig), { recursive: true });
  process.env.FONTCONFIG_FILE = generatedFontconfig;
  writeFileSync(generatedFontconfig, fontconfigXml);
}

let sharp;
try {
  sharp = (await import("sharp")).default;
} catch {
  console.warn("[previews] sharp unavailable — keeping committed preview PNGs.");
  process.exit(0);
}

const W = 1200;
const H = 675;
const HE = "'Heebo'";
const FR = "'Frank Ruhl Libre'";

const esc = (s) =>
  String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

const svg = (body) =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">${body}</svg>`;

const tickRing = (cx, cy, inner, outer, count, color, opacity = 0.3) =>
  Array.from({ length: count }, (_, i) => {
    const major = i % 5 === 0;
    return `<line x1="${cx}" y1="${cy - outer}" x2="${cx}" y2="${cy - inner}" stroke="${color}" stroke-opacity="${major ? opacity : opacity * 0.42}" stroke-width="1" transform="rotate(${(i * 360) / count} ${cx} ${cy})"/>`;
  }).join("");

const roman = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII"];

/* =================================================================== */
/* 01 — FORGE AUTOMOTIVE                                               */
/* =================================================================== */
function forgeAutomotive() {
  const accents = "#C9A227";
  const car = `
    <g id="forgeCar">
      <path d="M-178 34 C-160 16 -132 6 -102 2 L-72 -18 C-48 -34 -12 -38 20 -32 L60 -18 C94 -14 124 -4 150 16 L168 26 C180 30 184 38 181 46 L-181 46 C-184 40 -182 36 -178 34 Z" fill="#0d0c0a" stroke="#8a6d2c" stroke-opacity="0.42" stroke-width="1.2"/>
      <path d="M-64 -17 C-42 -29 -10 -32 16 -27 L56 -15 L-78 -15 Z" fill="#2b2417" opacity="0.68"/>
      <path d="M-150 26 L-88 8 L-70 -6 L152 18" fill="none" stroke="#f5e5b5" stroke-opacity="0.13"/>
      <circle cx="-106" cy="44" r="23" fill="#070706" stroke="#4d4027" stroke-width="1.2"/>
      <circle cx="110" cy="44" r="23" fill="#070706" stroke="#4d4027" stroke-width="1.2"/>
      <circle cx="-106" cy="44" r="9" fill="#2b2518"/>
      <circle cx="110" cy="44" r="9" fill="#2b2518"/>
      <rect x="132" y="22" width="22" height="5" fill="${accents}" opacity="0.7"/>
    </g>`;

  return svg(`
  <defs>
    <linearGradient id="forgePhoto" x1="0" y1="0" x2="0.9" y2="1">
      <stop offset="0" stop-color="#17140f"/>
      <stop offset="0.42" stop-color="#3b311d"/>
      <stop offset="0.7" stop-color="#221c12"/>
      <stop offset="1" stop-color="#080706"/>
    </linearGradient>
    <radialGradient id="forgePool" cx="50%" cy="58%" r="52%">
      <stop offset="0" stop-color="#d9bb6c" stop-opacity="0.5"/>
      <stop offset="0.42" stop-color="#6f5927" stop-opacity="0.2"/>
      <stop offset="1" stop-color="#000" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="forgeVignette" cx="50%" cy="50%" r="58%">
      <stop offset="0.45" stop-color="#fff"/>
      <stop offset="0.72" stop-color="#fff" stop-opacity="0.55"/>
      <stop offset="1" stop-color="#000" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="forgeFade" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#000" stop-opacity="0"/>
      <stop offset="0.16" stop-color="#fff"/>
      <stop offset="0.84" stop-color="#fff"/>
      <stop offset="1" stop-color="#000" stop-opacity="0"/>
    </linearGradient>
    <mask id="forgeMask">
      <rect x="90" y="248" width="1020" height="270" fill="url(#forgeVignette)"/>
      <rect x="90" y="248" width="1020" height="270" fill="url(#forgeFade)" opacity="0.55"/>
    </mask>
    ${car}
  </defs>

  <rect width="${W}" height="${H}" fill="#030303"/>
  <rect y="0" width="${W}" height="300" fill="url(#forgePhoto)" opacity="0.06"/>

  <!-- 3-point header -->
  <g font-family="${HE}" font-size="8.5" letter-spacing="3" fill="rgba(255,255,255,0.38)">
    <text x="62" y="38">WHATSAPP</text>
    <text x="62" y="54" font-size="8" fill="rgba(255,255,255,0.26)">+972 50 827 7982</text>
    <text x="${W - 62}" y="46" text-anchor="end" fill="rgba(255,255,255,0.52)">ניווט =</text>
  </g>
  <g transform="translate(${W / 2 - 88} 18)">
    <rect x="0" y="0" width="30" height="30" fill="none" stroke="#C9A227" stroke-opacity="0.55" transform="skewX(-9)"/>
    <text x="9" y="21" font-family="${FR}" font-size="14" fill="#C9A227" letter-spacing="0" transform="skewX(9)">F</text>
    <text x="44" y="19" font-family="${HE}" font-size="9" letter-spacing="3.6" fill="rgba(255,255,255,0.72)">אטלייה פרטי</text>
    <text x="44" y="31" font-family="${HE}" font-size="6.5" letter-spacing="2.4" fill="rgba(255,255,255,0.28)">BESPOKE MOTOR CARS</text>
  </g>
  <line x1="0" y1="72" x2="${W}" y2="72" stroke="rgba(255,255,255,0.06)"/>

  <!-- tall thin serif headline -->
  <text x="${W / 2}" y="157" text-anchor="middle" font-family="${FR}" font-weight="300" font-size="58" letter-spacing="-1.4" fill="#f4efe6">האומנות של</text>
  <text x="${W / 2}" y="220" text-anchor="middle" font-family="${FR}" font-weight="300" font-size="58" letter-spacing="-1.4" fill="#f4efe6">בספוק מוחלט</text>
  <line x1="${W / 2 - 22}" y1="244" x2="${W / 2 + 22}" y2="244" stroke="#C9A227" stroke-opacity="0.48"/>

  <!-- masked three-car studio vignette -->
  <g mask="url(#forgeMask)">
    <rect x="90" y="248" width="1020" height="270" fill="url(#forgePhoto)"/>
    <ellipse cx="600" cy="468" rx="470" ry="68" fill="url(#forgePool)"/>
    <path d="M90 472 C300 440 900 440 1110 472 L1110 518 L90 518 Z" fill="#050505" opacity="0.78"/>
    <line x1="130" y1="471" x2="1070" y2="471" stroke="#e3c77b" stroke-opacity="0.16"/>
    <use href="#forgeCar" transform="translate(290 428) scale(0.64)" opacity="0.33"/>
    <use href="#forgeCar" transform="translate(910 428) scale(0.64)" opacity="0.33"/>
    <use href="#forgeCar" transform="translate(600 424) scale(1.18)"/>
    <rect x="90" y="248" width="1020" height="270" fill="url(#forgeVignette)" opacity="0.34"/>
  </g>

  <!-- understated caption + bottom-border CTA -->
  <text x="${W / 2}" y="548" text-anchor="middle" font-family="${HE}" font-size="9.5" letter-spacing="2.2" fill="rgba(255,255,255,0.36)">שלוש מכוניות. מפרט אחד. אטלייה אחד.</text>
  <text x="${W / 2}" y="566" text-anchor="middle" font-family="${HE}" font-size="8.5" letter-spacing="1.6" fill="rgba(255,255,255,0.22)">מומחיות בריטית · ייצור בעבודת יד · ליווי אישי</text>
  <text x="${W / 2}" y="592" text-anchor="middle" font-family="${HE}" font-size="9" letter-spacing="2.6" fill="rgba(255,255,255,0.72)">בניית מפרט והצעת מחיר</text>
  <line x1="${W / 2 - 94}" y1="600" x2="${W / 2 + 94}" y2="600" stroke="rgba(255,255,255,0.28)"/>

  <!-- three-stage configurator strip -->
  <g font-family="${HE}">
    <g transform="translate(60 616)">
      <rect width="252" height="44" fill="#030303" stroke="rgba(255,255,255,0.09)"/>
      <text x="14" y="18" font-size="6.8" letter-spacing="2.4" fill="#C9A227">STAGE 01</text>
      <text x="14" y="34" font-size="10.5" fill="rgba(255,255,255,0.78)">בחירת שירות</text>
    </g>
    <g transform="translate(322 616)">
      <rect width="252" height="44" fill="#030303" stroke="rgba(255,255,255,0.09)"/>
      <text x="14" y="18" font-size="6.8" letter-spacing="2.4" fill="#C9A227">STAGE 02</text>
      <text x="14" y="34" font-size="10.5" fill="rgba(255,255,255,0.78)">רמת גימור — Signature</text>
    </g>
    <g transform="translate(584 616)">
      <rect width="252" height="44" fill="#030303" stroke="rgba(255,255,255,0.09)"/>
      <text x="14" y="18" font-size="6.8" letter-spacing="2.4" fill="#C9A227">STAGE 03</text>
      <text x="14" y="34" font-size="10.5" fill="rgba(255,255,255,0.78)">לוח זמנים — עונה קרובה</text>
    </g>
    <g transform="translate(846 616)">
      <rect width="294" height="44" fill="none" stroke="#C9A227" stroke-opacity="0.32"/>
      <text x="14" y="18" font-size="6.8" letter-spacing="2.4" fill="rgba(255,255,255,0.32)">LIVE SPEC SHEET</text>
      <text x="14" y="35" font-family="${FR}" font-weight="300" font-size="16" fill="#f4efe6">₪48,000 — ₪60,000</text>
    </g>
  </g>`);
}

/* =================================================================== */
/* 02 — APPLE SPATIAL                                                   */
/* =================================================================== */
function appleSpatial() {
  const accent = "#7AA2FF";
  const glass = (x, y, w, h, extra = "") => `
    <g ${extra}>
      <rect x="${x + 2}" y="${y + 18}" width="${w}" height="${h}" rx="32" fill="#000" opacity="0.48" filter="url(#spatialBlur)"/>
      <rect x="${x}" y="${y}" width="${w}" height="${h}" rx="32" fill="rgba(255,255,255,0.045)" stroke="rgba(255,255,255,0.13)" stroke-width="1"/>
      <rect x="${x + 18}" y="${y + 1}" width="${w - 36}" height="1.2" rx="1" fill="rgba(255,255,255,0.24)"/>
    </g>`;

  return svg(`
  <defs>
    <radialGradient id="spatialAmb" cx="73%" cy="-4%" r="86%">
      <stop offset="0" stop-color="#6a84ce" stop-opacity="0.26"/>
      <stop offset="0.5" stop-color="#1b2233" stop-opacity="0.2"/>
      <stop offset="1" stop-color="#07080C" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="spatialAmb2" cx="4%" cy="90%" r="65%">
      <stop offset="0" stop-color="#8e98b8" stop-opacity="0.12"/>
      <stop offset="1" stop-color="#07080C" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="spatialPhoto" x1="0" y1="0" x2="0.8" y2="1">
      <stop offset="0" stop-color="#2a3040"/>
      <stop offset="0.45" stop-color="#59647a"/>
      <stop offset="1" stop-color="#151922"/>
    </linearGradient>
    <linearGradient id="spatialBtn" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="${accent}"/>
      <stop offset="1" stop-color="#a9c2ff"/>
    </linearGradient>
    <filter id="spatialBlur" x="-40%" y="-40%" width="180%" height="180%">
      <feGaussianBlur stdDeviation="18"/>
    </filter>
    <pattern id="spatialGrid" width="92" height="92" patternUnits="userSpaceOnUse">
      <path d="M92 0H0V92" fill="none" stroke="rgba(255,255,255,0.06)" stroke-width="1"/>
    </pattern>
    <radialGradient id="spatialGridMask" cx="50%" cy="30%" r="65%">
      <stop offset="0" stop-color="#fff"/>
      <stop offset="1" stop-color="#000" stop-opacity="0"/>
    </radialGradient>
    <mask id="spatialMask"><rect width="${W}" height="${H}" fill="url(#spatialGridMask)"/></mask>
  </defs>

  <rect width="${W}" height="${H}" fill="#07080C"/>
  <rect width="${W}" height="${H}" fill="url(#spatialGrid)" mask="url(#spatialMask)"/>
  <rect width="${W}" height="${H}" fill="url(#spatialAmb)"/>
  <rect width="${W}" height="${H}" fill="url(#spatialAmb2)"/>

  <!-- Dynamic Island -->
  <rect x="${W / 2 - 154}" y="18" width="308" height="42" rx="21" fill="rgba(17,19,24,0.82)" stroke="rgba(255,255,255,0.16)"/>
  <circle cx="${W / 2 - 124}" cy="39" r="4.2" fill="#30d158"/>
  <text x="${W / 2 - 110}" y="43" font-family="${HE}" font-size="10.5" font-weight="600" fill="rgba(255,255,255,0.85)">פתוח כעת ברמת גן</text>
  <text x="${W / 2 + 126}" y="43" text-anchor="end" font-family="${HE}" font-size="9" fill="rgba(255,255,255,0.38)">⌄</text>

  <!-- island 01 — hero -->
  ${glass(54, 92, 700, 292)}
  <text x="86" y="135" font-family="${HE}" font-size="8" letter-spacing="3.2" fill="rgba(255,255,255,0.34)">SPATIAL / 01</text>
  <text x="754" y="135" text-anchor="end" font-family="${HE}" font-size="8" letter-spacing="2.4" fill="rgba(255,255,255,0.28)">קבלן שיפוצים</text>
  <text x="754" y="190" text-anchor="end" font-family="${HE}" font-weight="300" font-size="47" letter-spacing="-1.2" fill="#f5f5f7">החלום שלך</text>
  <text x="754" y="246" text-anchor="end" font-family="${HE}" font-weight="300" font-size="47" letter-spacing="-1.2" fill="#f5f5f7">למרחב מושלם</text>
  <text x="754" y="282" text-anchor="end" font-family="${HE}" font-size="10.5" fill="rgba(255,255,255,0.46)">שיפוצים מדויקים, שירות אישי ולוחות זמנים סגורים — ברמת גן.</text>
  <rect x="500" y="306" width="186" height="40" rx="20" fill="url(#spatialBtn)"/>
  <text x="593" y="331" text-anchor="middle" font-family="${HE}" font-size="10.5" font-weight="700" fill="#07080C">להזמנת ייעוץ בוואטסאפ</text>
  <text x="754" y="366" text-anchor="end" font-family="${HE}" font-size="9.5" fill="rgba(255,255,255,0.5)">050-827-7982</text>

  <!-- island 02 — floating photo -->
  ${glass(772, 92, 372, 196)}
  <rect x="788" y="108" width="340" height="146" rx="24" fill="url(#spatialPhoto)"/>
  <rect x="788" y="108" width="340" height="146" rx="24" fill="rgba(7,8,12,0.28)"/>
  <text x="808" y="226" font-family="${HE}" font-size="7.5" letter-spacing="2.6" fill="rgba(255,255,255,0.56)">TITANIUM SERIES</text>
  <text x="808" y="244" font-family="${FR}" font-size="15" fill="#f5f5f7">הבית שלך, בגימור אחר</text>

  <!-- island 03 — live reputation -->
  ${glass(772, 306, 372, 144)}
  <text x="798" y="334" font-family="${HE}" font-size="7.5" letter-spacing="2.8" fill="rgba(255,255,255,0.32)">LIVE REPUTATION</text>
  <text x="798" y="386" font-family="${HE}" font-weight="300" font-size="40" fill="#f5f5f7">4.9</text>
  <text x="846" y="386" font-family="${HE}" font-size="14" fill="rgba(255,255,255,0.25)">/5</text>
  <g transform="translate(892 370)">
    ${[0, 1, 2, 3, 4].map((i) => `<rect x="${i * 8}" y="${12 - i * 2}" width="3" height="${6 + i * 2}" fill="${accent}"/>`).join("")}
  </g>
  <text x="798" y="413" font-family="${HE}" font-size="9" fill="rgba(255,255,255,0.36)">24 ביקורות Google מאומתות</text>
  <line x1="798" y1="422" x2="1118" y2="422" stroke="rgba(255,255,255,0.08)"/>
  <text x="798" y="438" font-family="${HE}" font-size="7.5" fill="rgba(255,255,255,0.3)">רמת גן · פנויים לפרויקט</text>

  <!-- island 04 — metrics -->
  ${glass(54, 400, 436, 130)}
  <g font-family="${HE}" text-anchor="middle">
    <text x="128" y="452" font-weight="300" font-size="25" fill="#f5f5f7">4.9</text>
    <text x="128" y="470" font-size="7.5" fill="rgba(255,255,255,0.32)">דירוג</text>
    <text x="272" y="452" font-weight="300" font-size="25" fill="#f5f5f7">24</text>
    <text x="272" y="470" font-size="7.5" fill="rgba(255,255,255,0.32)">ביקורות</text>
    <text x="416" y="452" font-weight="300" font-size="25" fill="#f5f5f7">24/7</text>
    <text x="416" y="470" font-size="7.5" fill="rgba(255,255,255,0.32)">מענה</text>
  </g>
  <line x1="204" y1="422" x2="204" y2="500" stroke="rgba(255,255,255,0.07)"/>
  <line x1="340" y1="422" x2="340" y2="500" stroke="rgba(255,255,255,0.07)"/>

  <!-- island 05 — live spec -->
  ${glass(506, 400, 240, 130)}
  <text x="528" y="428" font-family="${HE}" font-size="7.5" letter-spacing="2.4" fill="rgba(255,255,255,0.3)">SPATIAL POD</text>
  <text x="528" y="462" font-family="${FR}" font-size="22" fill="#f5f5f7">שיפוץ מלא</text>
  <text x="528" y="482" font-family="${HE}" font-size="8.5" fill="rgba(255,255,255,0.38)">מפרט · השקעה · תיאום</text>
  <circle cx="712" cy="464" r="12" fill="none" stroke="rgba(255,255,255,0.18)"/>
  <text x="712" y="468" text-anchor="middle" font-family="${HE}" font-size="10" fill="rgba(255,255,255,0.6)">+</text>

  <!-- islands 06-09 — service pods + contact -->
  ${glass(54, 546, 252, 100)}
  <text x="78" y="572" font-family="${HE}" font-size="7" letter-spacing="2.4" fill="${accent}">POD 01</text>
  <text x="78" y="596" font-family="${FR}" font-size="16" fill="#f5f5f7">שיפוץ מקיף</text>
  <text x="78" y="616" font-family="${HE}" font-size="8" fill="rgba(255,255,255,0.34)">החל מ-5,000 ₪</text>

  ${glass(322, 546, 252, 100)}
  <text x="346" y="572" font-family="${HE}" font-size="7" letter-spacing="2.4" fill="${accent}">POD 02</text>
  <text x="346" y="596" font-family="${FR}" font-size="16" fill="#f5f5f7">מטבח מעוצב</text>
  <text x="346" y="616" font-family="${HE}" font-size="8" fill="rgba(255,255,255,0.34)">החל מ-3,500 ₪</text>

  ${glass(590, 546, 252, 100)}
  <text x="614" y="572" font-family="${HE}" font-size="7" letter-spacing="2.4" fill="${accent}">POD 03</text>
  <text x="614" y="596" font-family="${FR}" font-size="16" fill="#f5f5f7">חדרי אמבטיה</text>
  <text x="614" y="616" font-family="${HE}" font-size="8" fill="rgba(255,255,255,0.34)">החל מ-2,800 ₪</text>

  ${glass(858, 546, 286, 100)}
  <circle cx="890" cy="578" r="4" fill="#30d158"/>
  <text x="902" y="582" font-family="${HE}" font-size="9" fill="rgba(255,255,255,0.72)">זמינות מיידית</text>
  <text x="884" y="614" font-family="${HE}" font-size="9.5" fill="rgba(255,255,255,0.46)">וואטסאפ · 050-827-7982</text>`);
}

/* =================================================================== */
/* 03 — HOROLOGY CHRONO                                                 */
/* =================================================================== */
function horologyChrono() {
  const gold = "#D4AF37";
  const cx = 894;
  const cy = 342;
  const numerals = roman
    .map((numeral, i) => {
      const angle = (i * 30 - 90) * (Math.PI / 180);
      const x = cx + Math.cos(angle) * 222;
      const y = cy + Math.sin(angle) * 222 + 3;
      return `<text x="${x.toFixed(1)}" y="${y.toFixed(1)}" text-anchor="middle" font-family="monospace" font-size="8.5" fill="${gold}" opacity="0.62">${numeral}</text>`;
    })
    .join("");

  return svg(`
  <defs>
    <radialGradient id="chronoAmb" cx="74%" cy="10%" r="70%">
      <stop offset="0" stop-color="${gold}" stop-opacity="0.16"/>
      <stop offset="0.55" stop-color="#0a1326" stop-opacity="0.35"/>
      <stop offset="1" stop-color="#06080F" stop-opacity="0"/>
    </radialGradient>
    <radialGradient id="chronoDial" cx="50%" cy="38%" r="64%">
      <stop offset="0" stop-color="#33415f"/>
      <stop offset="0.5" stop-color="#18233b"/>
      <stop offset="1" stop-color="#070a13"/>
    </radialGradient>
    <linearGradient id="chronoPhoto" x1="0" y1="0" x2="0.8" y2="1">
      <stop offset="0" stop-color="#38404f"/>
      <stop offset="0.5" stop-color="#736c58"/>
      <stop offset="1" stop-color="#171a24"/>
    </linearGradient>
  </defs>

  <rect width="${W}" height="${H}" fill="#06080F"/>
  <rect width="${W}" height="${H}" fill="url(#chronoAmb)"/>
  <rect x="0" y="0" width="${W}" height="4" fill="${gold}" opacity="0.55"/>
  ${Array.from({ length: 120 }, (_, i) => `<line x1="${i * 10}" y1="7" x2="${i * 10}" y2="11" stroke="${gold}" stroke-opacity="0.22"/>`).join("")}

  <!-- observatory header -->
  <g font-family="${HE}" font-size="8" letter-spacing="2.6">
    <text x="62" y="38" fill="${gold}">MMXXVI</text>
    <text x="62" y="52" fill="rgba(255,255,255,0.3)">רמת גן</text>
    <text x="${W / 2}" y="34" text-anchor="middle" fill="${gold}" font-size="8">MAISON</text>
    <text x="${W / 2}" y="51" text-anchor="middle" font-family="${FR}" font-size="13" fill="#f4efe6" letter-spacing="1">קבלן שיפוצים</text>
    <text x="${W - 62}" y="38" text-anchor="end" fill="rgba(255,255,255,0.56)">050-827-7982</text>
    <text x="${W - 62}" y="52" text-anchor="end" fill="${gold}" font-size="7">PRIVATE LINE</text>
  </g>
  <line x1="0" y1="70" x2="${W}" y2="70" stroke="${gold}" stroke-opacity="0.28"/>
  <g font-family="${HE}" font-size="7.5" letter-spacing="1.8" fill="rgba(255,255,255,0.38)" text-anchor="middle">
    <text x="450" y="89">I · אובזרווטורי</text>
    <text x="590" y="89" fill="#f4efe6">II · קליבר</text>
    <text x="730" y="89">III · ארכיון</text>
    <text x="870" y="89">IV · המיוזן</text>
  </g>
  <line x1="0" y1="100" x2="${W}" y2="100" stroke="${gold}" stroke-opacity="0.1"/>

  <!-- hero typography -->
  <text x="558" y="162" text-anchor="end" font-family="${HE}" font-size="8" letter-spacing="3.5" fill="rgba(255,255,255,0.34)">קבלן שיפוצים</text>
  <text x="558" y="228" text-anchor="end" font-family="${FR}" font-weight="300" font-size="58" letter-spacing="-1.6" fill="#f4efe6">החלום שלך</text>
  <text x="558" y="292" text-anchor="end" font-family="${FR}" font-weight="300" font-size="58" letter-spacing="-1.6" fill="#f4efe6">נבנה בדיוק</text>
  <text x="558" y="330" text-anchor="end" font-family="${HE}" font-size="10" fill="rgba(255,255,255,0.42)">שיפוצים בסטנדרט של הוט קוטור — מדידה, תכנון וביצוע.</text>
  <text x="558" y="347" text-anchor="end" font-family="${HE}" font-size="10" fill="rgba(255,255,255,0.32)">כל פרט נבחן. כל חומר נבחר. כל שנייה נספרת.</text>
  <text x="558" y="386" text-anchor="end" font-family="${HE}" font-size="9" letter-spacing="2.2" fill="#f4efe6">תיאום צפייה פרטית</text>
  <line x1="404" y1="394" x2="558" y2="394" stroke="${gold}" stroke-opacity="0.55"/>

  <!-- calibres ledger -->
  <g transform="translate(62 434)" font-family="${HE}">
    <line x1="0" y1="0" x2="470" y2="0" stroke="${gold}" stroke-opacity="0.18"/>
    <text x="0" y="18" font-size="6.8" letter-spacing="2.2" fill="rgba(255,255,255,0.28)">CAL. 01</text>
    <text x="0" y="42" font-family="${FR}" font-weight="300" font-size="22" fill="#f4efe6">72H</text>
    <text x="0" y="56" font-size="7.5" fill="rgba(255,255,255,0.3)">רזרבת כוח</text>
    <text x="157" y="18" font-size="6.8" letter-spacing="2.2" fill="rgba(255,255,255,0.28)">CAL. 02</text>
    <text x="157" y="42" font-family="${FR}" font-weight="300" font-size="22" fill="#f4efe6">5Y</text>
    <text x="157" y="56" font-size="7.5" fill="rgba(255,255,255,0.3)">אחריות מנגנון</text>
    <text x="314" y="18" font-size="6.8" letter-spacing="2.2" fill="rgba(255,255,255,0.28)">CAL. 03</text>
    <text x="314" y="42" font-family="${FR}" font-weight="300" font-size="22" fill="#f4efe6">0.1MM</text>
    <text x="314" y="56" font-size="7.5" fill="rgba(255,255,255,0.3)">סובלנות גימור</text>
  </g>

  <!-- rotating mechanical bezel / chronograph -->
  <circle cx="${cx}" cy="${cy}" r="252" fill="none" stroke="${gold}" stroke-opacity="0.34"/>
  <circle cx="${cx}" cy="${cy}" r="238" fill="none" stroke="${gold}" stroke-opacity="0.14"/>
  <circle cx="${cx}" cy="${cy}" r="236" fill="none" stroke="${gold}" stroke-opacity="0.36" stroke-dasharray="1 8"/>
  <g>${tickRing(cx, cy, 224, 248, 72, gold, 0.52)}</g>
  ${numerals}
  <circle cx="${cx}" cy="${cy}" r="188" fill="none" stroke="${gold}" stroke-opacity="0.22"/>
  <circle cx="${cx}" cy="${cy}" r="154" fill="url(#chronoDial)" stroke="${gold}" stroke-opacity="0.4"/>
  <circle cx="${cx}" cy="${cy}" r="154" fill="url(#chronoPhoto)" opacity="0.22"/>
  <circle cx="${cx}" cy="${cy}" r="142" fill="none" stroke="${gold}" stroke-opacity="0.13" stroke-dasharray="1 5"/>
  <text x="${cx}" y="290" text-anchor="middle" font-family="monospace" font-size="8" letter-spacing="3" fill="${gold}" opacity="0.65">CALIBRE</text>
  <text x="${cx}" y="354" text-anchor="middle" font-family="${FR}" font-weight="300" font-size="62" fill="#f4efe6">01</text>
  <text x="${cx}" y="380" text-anchor="middle" font-family="monospace" font-size="8" letter-spacing="2" fill="rgba(244,239,230,0.34)">/ 04</text>
  <polygon points="${cx},84 ${cx + 7},106 ${cx - 7},106" fill="${gold}"/>

  <!-- collection legend, clear of the bezel and nav -->
  <g font-family="${HE}" font-size="8.5" transform="translate(62 512)">
    <text x="0" y="0" font-size="6.5" letter-spacing="3" fill="${gold}">COLLECTION INDEX</text>
    <line x1="0" y1="10" x2="470" y2="10" stroke="${gold}" stroke-opacity="0.18"/>
    <text x="0" y="31" fill="${gold}" font-family="monospace" font-size="7">I</text>
    <text x="20" y="31" fill="rgba(255,255,255,0.55)">שיפוץ מקיף</text>
    <text x="160" y="31" fill="${gold}" font-family="monospace" font-size="7">II</text>
    <text x="180" y="31" fill="rgba(255,255,255,0.55)">מטבח מעוצב</text>
    <text x="0" y="52" fill="${gold}" font-family="monospace" font-size="7">III</text>
    <text x="20" y="52" fill="rgba(255,255,255,0.55)">חדרי אמבטיה</text>
    <text x="160" y="52" fill="${gold}" font-family="monospace" font-size="7">IV</text>
    <text x="180" y="52" fill="rgba(255,255,255,0.55)">שיפוץ משרדים</text>
  </g>

  <!-- crosshairs -->
  <g fill="${gold}" opacity="0.45" font-family="monospace" font-size="13">
    <text x="58" y="124">+</text><text x="${W - 64}" y="124">+</text>
    <text x="58" y="${H - 24}">+</text><text x="${W - 64}" y="${H - 24}">+</text>
  </g>

  <!-- bottom precision rail -->
  <line x1="0" y1="596" x2="${W}" y2="596" stroke="${gold}" stroke-opacity="0.2"/>
  <g font-family="monospace" font-size="7.5" letter-spacing="2.4" fill="rgba(255,255,255,0.3)">
    <text x="62" y="622">PRECISION OBSERVATORY</text>
    <text x="${W / 2}" y="622" text-anchor="middle" fill="${gold}">CHAMPAGNE / SAPPHIRE</text>
    <text x="${W - 62}" y="622" text-anchor="end">EST. MMXXVI</text>
  </g>
  <text x="${W / 2}" y="651" text-anchor="middle" font-family="${HE}" font-size="8" letter-spacing="2" fill="rgba(255,255,255,0.22)">כל מנגנון נבנה סביב אדם אחד — וסביב שנים של דיוק.</text>`);
}

/* =================================================================== */
/* 04 — KINETIC MONOLITH                                                */
/* =================================================================== */
function kineticMonolith() {
  const accent = "#C8FF4D";
  const bars = Array.from({ length: 40 }, (_, i) => {
    const phase = (i / 39) * Math.PI * 2;
    const env = Math.sin((i / 39) * Math.PI);
    const wave = Math.sin(phase * 4.2 + 1.8) * 0.62 + Math.sin(phase * 7.1 + 0.7) * 0.26;
    const h = 5 + Math.abs(wave) * env * 82;
    return `<rect x="${78 + i * 15.6}" y="${568 - h}" width="6" height="${h.toFixed(1)}" fill="${i % 6 === 0 ? accent : "rgba(205,214,226,0.55)"}" opacity="${i % 6 === 0 ? 1 : 0.7}"/>`;
  }).join("");

  return svg(`
  <defs>
    <linearGradient id="monoChrome" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#ffffff"/>
      <stop offset="0.22" stop-color="#b9bfca"/>
      <stop offset="0.44" stop-color="#5a606b"/>
      <stop offset="0.58" stop-color="#eef2f7"/>
      <stop offset="0.78" stop-color="#7d838f"/>
      <stop offset="1" stop-color="#3b4049"/>
    </linearGradient>
    <linearGradient id="monoTextChrome" x1="0" y1="0" x2="0.8" y2="1">
      <stop offset="0" stop-color="#ffffff"/>
      <stop offset="0.3" stop-color="#c3cad6"/>
      <stop offset="0.55" stop-color="#737b88"/>
      <stop offset="0.76" stop-color="#f2f5f9"/>
      <stop offset="1" stop-color="#6d7480"/>
    </linearGradient>
    <linearGradient id="monoPhoto" x1="0" y1="0" x2="0.7" y2="1">
      <stop offset="0" stop-color="#2e333c"/>
      <stop offset="0.5" stop-color="#686f7b"/>
      <stop offset="1" stop-color="#121419"/>
    </linearGradient>
    <linearGradient id="monoAmb" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#bccde4" stop-opacity="0.14"/>
      <stop offset="0.55" stop-color="#0b0c10" stop-opacity="0"/>
      <stop offset="1" stop-color="${accent}" stop-opacity="0.06"/>
    </linearGradient>
    <pattern id="monoGrid" width="56" height="56" patternUnits="userSpaceOnUse">
      <path d="M56 0H0V56" fill="none" stroke="rgba(255,255,255,0.045)" stroke-width="1"/>
    </pattern>
  </defs>

  <rect width="${W}" height="${H}" fill="#090A0D"/>
  <rect width="${W}" height="${H}" fill="url(#monoGrid)" opacity="0.7"/>
  <rect width="${W}" height="${H}" fill="url(#monoAmb)"/>

  <!-- left vertical rail -->
  <rect x="0" y="0" width="46" height="${H}" fill="rgba(9,10,13,0.7)" stroke="rgba(255,255,255,0.08)"/>
  <text x="30" y="${H / 2}" transform="rotate(-90 30 ${H / 2})" text-anchor="middle" font-family="monospace" font-size="7" letter-spacing="3.4" fill="rgba(255,255,255,0.28)">MONOLITH / 01</text>
  <rect x="19" y="52" width="9" height="9" fill="${accent}" opacity="0.7"/>
  <text x="24" y="96" text-anchor="middle" font-family="monospace" font-size="6.5" fill="rgba(255,255,255,0.3)">01</text>
  <text x="24" y="120" text-anchor="middle" font-family="monospace" font-size="6.5" fill="rgba(255,255,255,0.3)">02</text>
  <text x="24" y="144" text-anchor="middle" font-family="monospace" font-size="6.5" fill="rgba(255,255,255,0.3)">03</text>

  <!-- technical strip -->
  <line x1="46" y1="34" x2="${W}" y2="34" stroke="rgba(255,255,255,0.08)"/>
  <g font-family="monospace" font-size="7" letter-spacing="2.4" fill="rgba(255,255,255,0.3)">
    <text x="70" y="24">TLV 32.0853 / 34.7818</text>
    <text x="${W / 2}" y="24" text-anchor="middle">LIQUID CHROME SYSTEMS / MMXXVI</text>
    <text x="${W - 64}" y="24" text-anchor="end">אינדקס +</text>
  </g>

  <!-- monolith slabs -->
  <rect x="742" y="66" width="138" height="330" fill="rgba(255,255,255,0.018)" stroke="rgba(255,255,255,0.05)"/>
  <rect x="900" y="112" width="60" height="284" fill="rgba(255,255,255,0.012)" stroke="rgba(255,255,255,0.04)"/>
  <rect x="1058" y="66" width="94" height="330" fill="rgba(255,255,255,0.018)" stroke="rgba(255,255,255,0.05)"/>
  <line x1="46" y1="180" x2="${W}" y2="180" stroke="rgba(255,255,255,0.04)"/>
  <line x1="46" y1="360" x2="${W}" y2="360" stroke="rgba(255,255,255,0.04)"/>

  <!-- oversized kinetic type -->
  <text x="774" y="104" text-anchor="end" font-family="${HE}" font-size="7.5" letter-spacing="3" fill="${accent}">MONOLITH / N° 01</text>
  <text x="774" y="186" text-anchor="end" font-family="${HE}" font-weight="300" font-size="82" letter-spacing="-3" fill="#f2f4f6">החלום שלך</text>
  <text x="774" y="266" text-anchor="end" font-family="${HE}" font-weight="300" font-size="82" letter-spacing="-3" fill="url(#monoTextChrome)">בכרום נוזלי</text>
  <text x="774" y="300" text-anchor="end" font-family="${HE}" font-size="9.5" fill="rgba(255,255,255,0.36)">פרויקטים שנבנים כמו מונולית — גוף אחד, קצה אחד, אפס פשרות.</text>
  <rect x="600" y="318" width="174" height="38" fill="${accent}"/>
  <text x="687" y="342" text-anchor="middle" font-family="${HE}" font-size="10" font-weight="700" fill="#090A0D">כניסה לדק ←</text>

  <!-- hero photo slab -->
  <rect x="810" y="82" width="380" height="300" fill="rgba(10,11,15,0.7)" stroke="rgba(255,255,255,0.1)"/>
  <rect x="818" y="90" width="364" height="284" fill="url(#monoPhoto)"/>
  <rect x="818" y="90" width="364" height="284" fill="rgba(9,10,13,0.3)"/>
  <text x="1142" y="124" text-anchor="end" font-family="${HE}" font-weight="300" font-size="54" fill="url(#monoTextChrome)">01</text>
  <text x="834" y="340" font-family="monospace" font-size="6.5" letter-spacing="2.8" fill="rgba(255,255,255,0.36)">ACOUSTIC SCULPTURE</text>
  <text x="834" y="358" font-family="${FR}" font-size="14" fill="rgba(255,255,255,0.8)">סטודיו מונולית</text>

  <!-- ticker -->
  <rect x="46" y="378" width="${W - 46}" height="28" fill="rgba(255,255,255,0.025)"/>
  <line x1="46" y1="378" x2="${W}" y2="378" stroke="rgba(255,255,255,0.08)"/>
  <line x1="46" y1="406" x2="${W}" y2="406" stroke="rgba(255,255,255,0.08)"/>
  <text x="70" y="396" font-family="monospace" font-size="7" letter-spacing="2.4" fill="rgba(255,255,255,0.36)">KINETIC <tspan fill="${accent}">—</tspan> ACOUSTIC <tspan fill="${accent}">—</tspan> CHROME <tspan fill="${accent}">—</tspan> MONOLITH <tspan fill="${accent}">—</tspan> PRECISION <tspan fill="${accent}">—</tspan> 4.9 / 5 <tspan fill="${accent}">—</tspan> TLV</text>

  <!-- waveform modulator -->
  <rect x="62" y="430" width="670" height="218" fill="rgba(255,255,255,0.022)" stroke="rgba(255,255,255,0.09)"/>
  <rect x="74" y="442" width="646" height="128" fill="#07080B" stroke="rgba(255,255,255,0.07)"/>
  <line x1="74" y1="506" x2="720" y2="506" stroke="rgba(255,255,255,0.08)" stroke-dasharray="2 6"/>
  ${bars}
  <text x="88" y="460" font-family="monospace" font-size="6.5" letter-spacing="2.4" fill="rgba(255,255,255,0.32)">LIVE SIGNAL / 40 BANDS</text>
  <circle cx="696" cy="460" r="2" fill="${accent}"/>
  <text x="686" y="462" text-anchor="end" font-family="monospace" font-size="6" letter-spacing="1.6" fill="${accent}">LIVE</text>
  <line x1="98" y1="562" x2="672" y2="562" stroke="rgba(255,255,255,0.16)"/>
  <line x1="98" y1="562" x2="430" y2="562" stroke="${accent}" stroke-width="2"/>
  <rect x="424" y="552" width="10" height="20" fill="${accent}"/>
  <text x="98" y="588" font-family="${HE}" font-size="7" letter-spacing="2" fill="rgba(255,255,255,0.3)">POINT</text>
  <text x="360" y="588" font-family="${HE}" font-size="7" letter-spacing="2" fill="rgba(255,255,255,0.3)">ROOM</text>
  <text x="630" y="588" font-family="${HE}" font-size="7" letter-spacing="2" fill="rgba(255,255,255,0.3)">FULL SYSTEM</text>
  <text x="98" y="622" font-family="${HE}" font-size="8.5" fill="rgba(255,255,255,0.5)">עוצמת היקף 46% · מודול שיפוץ מקיף</text>
  <text x="708" y="622" text-anchor="end" font-family="${FR}" font-weight="300" font-size="24" fill="#f2f4f6">₪12,400</text>

  <!-- horizontal deck -->
  <text x="764" y="448" font-family="${HE}" font-size="7" letter-spacing="2.6" fill="rgba(255,255,255,0.3)">SHOWROOM DECK</text>
  <g>
    <rect x="764" y="460" width="376" height="74" fill="rgba(255,255,255,0.025)" stroke="rgba(255,255,255,0.1)"/>
    <rect x="772" y="468" width="86" height="58" fill="url(#monoPhoto)"/>
    <text x="1132" y="486" text-anchor="end" font-family="monospace" font-size="7" letter-spacing="2" fill="${accent}">01</text>
    <text x="1132" y="506" text-anchor="end" font-family="${FR}" font-size="14" fill="rgba(255,255,255,0.8)">שיפוץ מקיף</text>
    <text x="1132" y="521" text-anchor="end" font-family="${HE}" font-size="8" fill="rgba(255,255,255,0.32)">₪5,000</text>

    <rect x="764" y="542" width="376" height="66" fill="rgba(255,255,255,0.018)" stroke="rgba(255,255,255,0.08)"/>
    <rect x="772" y="550" width="74" height="50" fill="url(#monoPhoto)" opacity="0.7"/>
    <text x="1132" y="568" text-anchor="end" font-family="monospace" font-size="7" letter-spacing="2" fill="rgba(255,255,255,0.4)">02</text>
    <text x="1132" y="586" text-anchor="end" font-family="${FR}" font-size="13" fill="rgba(255,255,255,0.66)">מטבח מעוצב</text>
    <text x="1132" y="600" text-anchor="end" font-family="${HE}" font-size="7.5" fill="rgba(255,255,255,0.28)">₪3,500</text>

    <rect x="764" y="616" width="376" height="34" fill="none" stroke="rgba(255,255,255,0.07)"/>
    <text x="784" y="637" font-family="${HE}" font-size="7.5" fill="rgba(255,255,255,0.34)">גללו את הדק · 04 מודולים</text>
  </g>`);
}

/* =================================================================== */
/* 05 — SWISS EDITORIAL                                                 */
/* =================================================================== */
function swissEditorial() {
  const ink = "#141311";
  const accent = "#8B6A3E";
  const hair = "rgba(20,19,17,0.16)";

  return svg(`
  <defs>
    <pattern id="swissGrid" width="100" height="96" patternUnits="userSpaceOnUse">
      <path d="M100 0H0V96" fill="none" stroke="rgba(20,19,17,0.14)" stroke-width="1"/>
    </pattern>
    <linearGradient id="swissPhoto" x1="0" y1="0" x2="0.8" y2="1">
      <stop offset="0" stop-color="#d8cfbc"/>
      <stop offset="0.45" stop-color="#b2a385"/>
      <stop offset="1" stop-color="#8f8068"/>
    </linearGradient>
    <linearGradient id="swissPhoto2" x1="0" y1="0" x2="0.7" y2="1">
      <stop offset="0" stop-color="#4f4638"/>
      <stop offset="0.55" stop-color="#8b7c62"/>
      <stop offset="1" stop-color="#393127"/>
    </linearGradient>
    <linearGradient id="swissCurtain" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#3e372c"/>
      <stop offset="0.5" stop-color="#8d7c5c"/>
      <stop offset="1" stop-color="#27221b"/>
    </linearGradient>
  </defs>

  <rect width="${W}" height="${H}" fill="#F3EFE6"/>
  <rect width="${W}" height="${H}" fill="url(#swissGrid)"/>
  <line x1="600" y1="0" x2="600" y2="${H}" stroke="rgba(20,19,17,0.07)"/>

  <!-- masthead -->
  <line x1="0" y1="70" x2="${W}" y2="70" stroke="${hair}"/>
  <g font-family="${HE}" font-size="7.5" letter-spacing="2.4" fill="rgba(20,19,17,0.45)">
    <text x="60" y="32">THE MONOGRAPH</text>
    <text x="60" y="47" fill="${accent}">ISSUE N° 05 — 2026</text>
    <text x="${W / 2}" y="32" text-anchor="middle" font-family="${FR}" font-size="17" letter-spacing="0.5" fill="${ink}">קבלן שיפוצים</text>
    <text x="${W / 2}" y="47" text-anchor="middle" font-size="6.5" letter-spacing="3" fill="${accent}">ARCHITECTURAL PRACTICE</text>
    <text x="${W - 60}" y="32" text-anchor="end">050-827-7982</text>
    <text x="${W - 60}" y="47" text-anchor="end" fill="rgba(20,19,17,0.55)">תיאום פגישה</text>
  </g>
  <line x1="0" y1="82" x2="${W}" y2="82" stroke="rgba(20,19,17,0.08)"/>
  <g font-family="${HE}" font-size="7" letter-spacing="1.8" fill="rgba(20,19,17,0.5)" text-anchor="middle">
    <text x="520" y="96">02 עבודות</text>
    <text x="610" y="96">03 ארכיון</text>
    <text x="700" y="96">04 תהליך</text>
    <text x="790" y="96">05 קשר</text>
  </g>
  <line x1="0" y1="106" x2="${W}" y2="106" stroke="${hair}"/>

  <!-- vertical running header -->
  <text x="24" y="390" transform="rotate(-90 24 390)" text-anchor="middle" font-family="monospace" font-size="6.5" letter-spacing="3" fill="rgba(20,19,17,0.3)">SECTION N° 01 — THE COVER / RAMAT GAN</text>

  <!-- editorial cover typography -->
  <text x="370" y="144" text-anchor="end" font-family="${HE}" font-size="7.5" letter-spacing="3" fill="${accent}">THE COVER / N° 01</text>
  <text x="370" y="160" text-anchor="end" font-family="${HE}" font-size="7.5" letter-spacing="2" fill="rgba(20,19,17,0.4)">קבלן שיפוצים · רמת גן</text>
  <text x="370" y="242" text-anchor="end" font-family="${FR}" font-weight="300" font-size="86" letter-spacing="-4" fill="${ink}">N° <tspan fill="${accent}">01</tspan></text>
  <text x="370" y="322" text-anchor="end" font-family="${FR}" font-weight="300" font-size="50" letter-spacing="-2" fill="${ink}">החלום שלך</text>
  <text x="370" y="374" text-anchor="end" font-family="${FR}" font-weight="300" font-size="50" letter-spacing="-2" fill="${ink}">למרחב מושלם</text>
  <text x="370" y="408" text-anchor="end" font-family="${HE}" font-size="9" fill="rgba(20,19,17,0.55)">שיפוצים ברמה גבוהה, שירות אישי ולוחות זמנים מדויקים — ברמת גן.</text>
  <text x="370" y="437" text-anchor="end" font-family="${HE}" font-size="8" letter-spacing="2" fill="${ink}">להזמנת ייעוץ חינם בווטסאפ ←</text>
  <line x1="170" y1="445" x2="370" y2="445" stroke="rgba(20,19,17,0.4)"/>

  <!-- framed cover photograph -->
  <rect x="632" y="126" width="508" height="306" fill="none" stroke="${hair}"/>
  <rect x="640" y="134" width="492" height="290" fill="url(#swissPhoto)"/>
  <rect x="640" y="134" width="492" height="290" fill="rgba(243,239,230,0.08)"/>
  <circle cx="1060" cy="196" r="104" fill="rgba(255,251,241,0.16)"/>
  <rect x="690" y="158" width="150" height="214" fill="rgba(243,239,230,0.26)"/>
  <rect x="690" y="158" width="150" height="214" fill="none" stroke="rgba(255,255,255,0.3)"/>
  <rect x="866" y="144" width="108" height="236" fill="rgba(20,19,17,0.18)"/>
  <rect x="1000" y="188" width="92" height="192" fill="rgba(243,239,230,0.2)"/>
  <g opacity="0.32">
    <path d="M740 134 C728 220 742 330 720 424" fill="none" stroke="#fff9ea" stroke-width="10"/>
    <path d="M850 134 C838 220 852 330 830 424" fill="none" stroke="#fff9ea" stroke-width="7"/>
    <path d="M970 134 C982 220 968 330 990 424" fill="none" stroke="#2d261d" stroke-width="12"/>
    <path d="M1090 134 C1078 220 1092 330 1070 424" fill="none" stroke="#fff9ea" stroke-width="8"/>
  </g>
  <path d="M640 424 C780 392 980 392 1132 424 L1132 424 L640 424 Z" fill="rgba(45,38,29,0.2)"/>
  <line x1="640" y1="360" x2="1132" y2="360" stroke="rgba(255,255,255,0.24)"/>
  <rect x="660" y="374" width="452" height="34" fill="rgba(243,239,230,0.9)"/>
  <text x="1092" y="389" text-anchor="end" font-family="monospace" font-size="6.5" letter-spacing="2.4" fill="${accent}">MATERIAL / LIGHT / PROPORTION</text>
  <text x="1092" y="402" text-anchor="end" font-family="${FR}" font-size="11" fill="${ink}">ריהוט, נגרות וגימור בהתאמה אישית</text>
  <text x="650" y="149" font-family="monospace" font-size="6.5" letter-spacing="2.4" fill="rgba(255,255,255,0.82)">PLATE 01 / COVER</text>

  <!-- curtain columns -->
  <line x1="0" y1="466" x2="${W}" y2="466" stroke="${hair}"/>
  <text x="60" y="492" font-family="${HE}" font-size="7" letter-spacing="2.6" fill="${accent}">PORTFOLIO INDEX / N° 03</text>
  <text x="${W - 60}" y="492" text-anchor="end" font-family="${HE}" font-size="7" letter-spacing="1.8" fill="rgba(20,19,17,0.45)">העבירו על העמודות · נפתח ל-60%</text>

  <!-- active column (60%) -->
  <rect x="0" y="508" width="720" height="167" fill="url(#swissCurtain)"/>
  <rect x="0" y="508" width="720" height="167" fill="rgba(20,19,17,0.52)"/>
  <rect x="28" y="526" width="32" height="22" fill="rgba(243,239,230,0.86)"/>
  <text x="44" y="541" text-anchor="middle" font-family="monospace" font-size="7" fill="${ink}">01</text>
  <text x="690" y="541" text-anchor="end" font-family="monospace" font-size="6.5" letter-spacing="2.2" fill="rgba(255,255,255,0.55)">SECTION 01 / ACTIVE</text>
  <text x="690" y="578" text-anchor="end" font-family="${FR}" font-weight="300" font-size="34" letter-spacing="-1" fill="#f6f2e9">מטבחים מעוצבים</text>
  <text x="690" y="604" text-anchor="end" font-family="${HE}" font-size="8.5" fill="rgba(255,255,255,0.6)">מטבח מעץ מלא שנבנה למידות שלך — דיוק בכל פתיחה של מגירה.</text>
  <text x="690" y="624" text-anchor="end" font-family="monospace" font-size="6.5" letter-spacing="1.8" fill="rgba(255,255,255,0.36)">TIMELINE 6—10 WEEKS · BESPOKE · 5Y WARRANTY</text>
  <rect x="556" y="636" width="134" height="24" fill="none" stroke="rgba(255,255,255,0.35)"/>
  <text x="623" y="651" text-anchor="middle" font-family="${HE}" font-size="7" fill="rgba(255,255,255,0.82)">ייעוץ ←</text>

  <!-- inactive columns -->
  <g>
    <rect x="720" y="508" width="160" height="167" fill="url(#swissPhoto2)"/>
    <rect x="720" y="508" width="160" height="167" fill="rgba(243,239,230,0.14)"/>
    <line x1="720" y1="508" x2="720" y2="675" stroke="rgba(243,239,230,0.35)"/>
    <text x="740" y="529" font-family="monospace" font-size="7" fill="rgba(255,255,255,0.75)">02</text>
    <text x="748" y="632" transform="rotate(-90 748 632)" font-family="${HE}" font-size="9.5" fill="rgba(255,255,255,0.82)">ארונות אמבטיה</text>

    <rect x="880" y="508" width="160" height="167" fill="url(#swissPhoto)"/>
    <rect x="880" y="508" width="160" height="167" fill="rgba(20,19,17,0.38)"/>
    <line x1="880" y1="508" x2="880" y2="675" stroke="rgba(243,239,230,0.35)"/>
    <text x="900" y="529" font-family="monospace" font-size="7" fill="rgba(255,255,255,0.75)">03</text>
    <text x="908" y="632" transform="rotate(-90 908 632)" font-family="${HE}" font-size="9.5" fill="rgba(255,255,255,0.82)">ספריות קיר</text>

    <rect x="1040" y="508" width="160" height="167" fill="url(#swissPhoto2)"/>
    <rect x="1040" y="508" width="160" height="167" fill="rgba(20,19,17,0.2)"/>
    <line x1="1040" y1="508" x2="1040" y2="675" stroke="rgba(243,239,230,0.35)"/>
    <text x="1060" y="529" font-family="monospace" font-size="7" fill="rgba(255,255,255,0.75)">04</text>
    <text x="1068" y="632" transform="rotate(-90 1068 632)" font-family="${HE}" font-size="9.5" fill="rgba(255,255,255,0.82)">שיפוץ משרדים</text>
  </g>
  <line x1="0" y1="508" x2="${W}" y2="508" stroke="rgba(243,239,230,0.3)"/>`);
}

/* ------------------------------------------------------------------ */

mkdirSync(OUT_DIR, { recursive: true });

const targets = [
  ["forge-automotive", forgeAutomotive],
  ["apple-spatial", appleSpatial],
  ["horology-chrono", horologyChrono],
  ["kinetic-monolith", kineticMonolith],
  ["swiss-editorial", swissEditorial],
];

for (const [name, buildSvg] of targets) {
  try {
    const markup = buildSvg();
    const out = join(OUT_DIR, `${name}.png`);
    await sharp(Buffer.from(markup), { density: 150 })
      .resize(1200, 675, { fit: "cover" })
      .png({ compressionLevel: 9 })
      .toFile(out);
    console.log(`[previews] ✓ ${out}`);
  } catch (err) {
    console.error(`[previews] ✗ ${name}: ${err?.message ?? err}`);
    process.exitCode = 1;
  }
}
