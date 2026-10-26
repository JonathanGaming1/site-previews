/**
 * Generates 4 art-directed 1200x675 template preview PNGs for Discord embeds.
 * Each PNG depicts the distinctive UI of its rebuilt template:
 *   whisky-obsidian  → FORGE ATELIER   (pitch black, thin serif hero, masked
 *                                       studio image, 3-stage spec config)
 *   apple-spatial    → TITANIUM PRO    (sticky split-screen, bento metrics,
 *                                       Dynamic Island pod)
 *   atelier-boutique → SWISS GRID      (alabaster #F2EFE9, exposed 1px
 *                                       hairlines, giant index, table rows)
 *   cyber-quantum    → KINETIC SHOWROOM (carbon #07080A, marquee ticker,
 *                                       draggable range sliders, lime accent)
 *
 * Usage: node scripts/generate-previews.mjs   (runs automatically before `npm run build`)
 * If `sharp` is unavailable, the committed PNGs in public/previews/ remain.
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

const W = 1200;
const H = 675;
const he = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

/* =================================================================== */
/* whisky-obsidian — FORGE ATELIER                                     */
/* =================================================================== */
function forgeAtelier() {
  const bg = "#030303";
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
  <defs>
    <radialGradient id="forgeMask" cx="0.5" cy="0.42" r="0.62">
      <stop offset="0" stop-color="#5a4a2c"/>
      <stop offset="0.55" stop-color="#241d10"/>
      <stop offset="1" stop-color="#030303" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="forgePhoto" x1="0" y1="0" x2="1" y2="0.25">
      <stop offset="0" stop-color="#12100b"/>
      <stop offset="0.5" stop-color="#3a3117"/>
      <stop offset="1" stop-color="#0f0d09"/>
    </linearGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="${bg}"/>

  <!-- 3-point header -->
  <g font-family="'Heebo'" font-size="10" letter-spacing="3">
    <text x="72" y="40" fill="rgba(255,255,255,0.38)">WHATSAPP</text>
    <text x="72" y="58" fill="rgba(255,255,255,0.38)" font-size="9">+972 50 123 4567</text>
    <g transform="translate(${W / 2 - 78} 28)">
      <rect x="0" y="0" width="30" height="30" transform="skewX(-8)" fill="none" stroke="#c59b27aa" stroke-width="1"/>
      <text x="9" y="21" font-size="13" fill="#c59b27" transform="skewX(8)" font-family="'Frank Ruhl Libre'">N</text>
      <text x="42" y="19" font-size="10" letter-spacing="4" fill="rgba(255,255,255,0.65)">אולפן הפורז’</text>
    </g>
    <g transform="translate(${W - 110} 0)">
      <text x="0" y="40" fill="rgba(255,255,255,0.4)">ניווט</text>
      <line x1="34" y1="27" x2="58" y2="27" stroke="rgba(255,255,255,0.5)" stroke-width="1"/>
      <line x1="34" y1="39" x2="58" y2="39" stroke="rgba(255,255,255,0.5)" stroke-width="1"/>
    </g>
  </g>

  <!-- Thin editorial serif hero, two clean lines -->
  <text x="${W / 2}" y="150" text-anchor="middle" font-family="'Frank Ruhl Libre'" font-weight="300" font-size="54" fill="#f4efe6">נגרות יוקרתית</text>
  <text x="${W / 2}" y="215" text-anchor="middle" font-family="'Frank Ruhl Libre'" font-weight="300" font-size="54" fill="#f4efe6">שמקרבת את הבית</text>
  <line x1="${W / 2 - 26}" y1="244" x2="${W / 2 + 26}" y2="244" stroke="rgba(255,255,255,0.18)"/>

  <!-- Wide dramatic studio image with radial vignette mask fade -->
  <g mask="url(#imgMask)">
    <rect x="60" y="266" width="${W - 120}" height="240" fill="url(#forgePhoto)"/>
    <rect x="60" y="266" width="${W - 120}" height="240" fill="url(#forgeMask)"/>
    <rect x="${W / 2 + 90}" y="290" width="90" height="190" fill="#0a0806" opacity="0.5"/>
    <rect x="${W / 2 + 200}" y="310" width="60" height="170" fill="#0a0806" opacity="0.4"/>
  </g>
  <mask id="imgMask">
    <rect width="${W}" height="${H}" fill="url(#vignetteFill)"/>
  </mask>
  <defs>
    <radialGradient id="vignetteFill" cx="0.5" cy="0.57" r="0.42">
      <stop offset="0" stop-color="#fff"/>
      <stop offset="0.62" stop-color="#fff"/>
      <stop offset="1" stop-color="#000" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <text x="${W / 2}" y="532" text-anchor="middle" font-family="'Heebo'" font-size="10.5" letter-spacing="2.5" fill="rgba(255,255,255,0.35)">ייצור, עיצוב והתקנה בסטנדרט של מותג</text>
  <g font-family="'Heebo'" font-size="11">
    <text x="${W / 2 - 150}" y="558" text-anchor="middle" fill="rgba(255,255,255,0.6)" letter-spacing="2.5"> בניית מפרט והצעת מחיר </text>
    <line x1="${W / 2 - 150}" y1="566" x2="${W / 2 + 55}" y2="566" stroke="rgba(255,255,255,0.3)"/>
  </g>

  <!-- Spec configurator strip -->
  <g font-family="'Heebo'">
    <g transform="translate(60 586)">
      <rect width="260" height="62" fill="#030303" stroke="#ffffff14" stroke-width="1"/>
      <text x="16" y="26" font-size="8.5" letter-spacing="2.6" fill="#c59b27">STAGE 01</text>
      <text x="16" y="47" font-size="12.5" fill="rgba(255,255,255,0.85)">בחירת שירות — מטבחים</text>
    </g>
    <g transform="translate(326 586)">
      <rect width="260" height="62" fill="#030303" stroke="#ffffff14" stroke-width="1"/>
      <text x="16" y="26" font-size="8.5" letter-spacing="2.6" fill="#c59b27">STAGE 02</text>
      <text x="16" y="47" font-size="12.5" fill="rgba(255,255,255,0.85)">רמת גימור — פרימיום</text>
    </g>
    <g transform="translate(592 586)">
      <rect width="260" height="62" fill="#030303" stroke="#ffffff14" stroke-width="1"/>
      <text x="16" y="26" font-size="8.5" letter-spacing="2.6" fill="#c59b27">STAGE 03</text>
      <text x="16" y="47" font-size="12.5" fill="rgba(255,255,255,0.85)">לוח זמנים — תוך חודש</text>
    </g>
    <g transform="translate(858 586)">
      <rect width="282" height="62" fill="none" stroke="#c59b2755" stroke-width="1"/>
      <text x="16" y="26" font-size="8.5" letter-spacing="2.6" fill="rgba(255,255,255,0.35)">LIVE SPEC SHEET</text>
      <text x="16" y="49" font-size="15" fill="#f4efe6" font-family="'Frank Ruhl Libre'" font-weight="300">₪48,000 — ₪60,000</text>
    </g>
  </g>
</svg>`;
}

/* =================================================================== */
/* apple-spatial — TITANIUM PRO SPLIT-SCREEN                           */
/* =================================================================== */
function titaniumPro() {
  const bg = "#0b0c0e";
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
  <defs>
    <linearGradient id="tiSheen" x1="0" y1="0" x2="0.4" y2="1">
      <stop offset="0" stop-color="rgba(150,165,190,0.10)"/>
      <stop offset="1" stop-color="rgba(11,12,14,0)"/>
    </linearGradient>
    <linearGradient id="tiPhoto" x1="0" y1="0" x2="0.8" y2="1">
      <stop offset="0" stop-color="#1a1d23"/>
      <stop offset="0.55" stop-color="#2c3542"/>
      <stop offset="1" stop-color="#13151a"/>
    </linearGradient>
    <radialGradient id="tiAmbient" cx="0.75" cy="-0.1" r="0.9">
      <stop offset="0" stop-color="rgba(120,140,180,0.16)"/>
      <stop offset="1" stop-color="rgba(11,12,14,0)"/>
    </radialGradient>
  </defs>
  <rect width="${W}" height="${H}" fill="${bg}"/>
  <rect width="${W}" height="${H}" fill="url(#tiAmbient)"/>

  <!-- Dynamic Island pod -->
  <rect x="${W / 2 - 140}" y="22" width="280" height="46" rx="23" fill="rgba(22,23,27,0.8)" stroke="rgba(255,255,255,0.16)" stroke-width="1"/>
  <circle cx="${W / 2 - 112}" cy="45" r="4.5" fill="#30d158"/>
  <text x="${W / 2}" y="50" text-anchor="middle" font-family="'Heebo'" font-size="12.5" font-weight="600" fill="rgba(255,255,255,0.85)">פתוח כעת • זמינים לפרויקטים</text>

  <!-- Sticky split-screen: pinned visual column on the right, chapters on the left -->
  <line x1="680" y1="96" x2="680" y2="${H - 60}" stroke="rgba(255,255,255,0.10)" stroke-width="1"/>
  <g transform="translate(712 120)">
    <rect width="416" height="330" fill="url(#tiPhoto)" stroke="rgba(255,255,255,0.12)" stroke-width="1" rx="16"/>
    <text x="596" y="300" font-size="0"></text>
    <text x="208" y="180" text-anchor="middle" font-family="'Heebo'" font-size="12" letter-spacing="4" fill="rgba(255,255,255,0.5)">TITANIUM PRO</text>
    <text x="208" y="205" text-anchor="middle" font-family="'Frank Ruhl Libre'" font-weight="300" font-size="19" fill="#f5f5f7">אולפן טיטניום</text>
  </g>
  <g transform="translate(712 470)">
    <rect width="416" height="96" rx="12" fill="rgba(255,255,255,0.05)" stroke="rgba(255,255,255,0.10)" stroke-width="1"/>
    <text x="24" y="42" font-family="'Heebo'" font-weight="300" font-size="26" fill="#f5f5f7">4.9★</text>
    <text x="24" y="72" font-family="'Heebo'" font-size="10" fill="rgba(255,255,255,0.42)">24 ביקורות Google</text>
    <text x="164" y="42" font-family="'Heebo'" font-weight="300" font-size="26" fill="#f5f5f7">100%</text>
    <text x="164" y="72" font-family="'Heebo'" font-size="10" fill="rgba(255,255,255,0.42)">חומרים מובחרים</text>
    <text x="300" y="42" font-family="'Heebo'" font-weight="300" font-size="26" fill="#f5f5f7">24/7</text>
    <text x="300" y="72" font-family="'Heebo'" font-size="10" fill="rgba(255,255,255,0.42)">מענה שוטף</text>
  </g>

  <!-- Scrolling precision chapters -->
  <g font-family="'Heebo'" fill="rgba(245,245,247,0.35)">
    <text x="88" y="146" font-size="10" letter-spacing="3"><tspan fill="#0071e3">01</tspan>  נגרות מודולרית</text>
    <text x="88" y="172" font-family="'Heebo'" font-weight="400" font-size="25" fill="#f5f5f7">מטבחים בהתאמה אישית</text>
    <line x1="88" y1="188" x2="230" y2="188" stroke="rgba(255,255,255,0.14)"/>
    <line x1="88" y1="252" x2="640" y2="252" stroke="rgba(255,255,255,0.10)"/>
    <text x="88" y="290" font-size="10" letter-spacing="3"><tspan fill="#0071e3">02</tspan>  תהליך</text>
    <text x="88" y="316" font-family="'Heebo'" font-weight="400" font-size="25" fill="#f5f5f7">ארונות ונישות מדגם אישי</text>
    <line x1="88" y1="332" x2="230" y2="332" stroke="rgba(255,255,255,0.14)"/>
    <line x1="88" y1="396" x2="640" y2="396" stroke="rgba(255,255,255,0.10)"/>
    <text x="88" y="434" font-size="10" letter-spacing="3"><tspan fill="#0071e3">03</tspan>  סטנדרט</text>
    <text x="88" y="460" font-family="'Heebo'" font-weight="400" font-size="25" fill="#f5f5f7">גימור ואחריות לכל פרויקט</text>
    <line x1="88" y1="476" x2="230" y2="476" stroke="rgba(255,255,255,0.14)"/>
    <text x="88" y="510" font-size="12.5" fill="rgba(245,245,247,0.45)">מדידה, ייצור והתקנה — לוחות זמנים סגורים מהיום הראשון.</text>
  </g>
  <rect x="88" y="544" width="132" height="40" rx="20" fill="#0071e3"/>
  <text x="154" y="570" text-anchor="middle" font-family="'Heebo'" font-size="12.5" font-weight="700" fill="#ffffff">ליצירת קשר</text>
  <text x="240" y="570" font-family="'Heebo'" font-size="12.5" fill="rgba(245,245,247,0.6)">050-1234567</text>
  <line x1="0" y1="${H - 8}" x2="680" y2="${H - 8}" stroke="rgba(255,255,255,0.10)"/>
</svg>`;
}

/* =================================================================== */
/* atelier-boutique — SWISS ARCHITECTURAL GRID                          */
/* =================================================================== */
function swissGrid() {
  const bg = "#F2EFE9";
  const ink = "#141413";
  const hair = "rgba(20,20,19,0.15)";
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
  <rect width="${W}" height="${H}" fill="${bg}"/>
  <g font-family="'Heebo'" fill="${ink}">
    <!-- index numerals -->
    <text x="66" y="128" font-family="'Frank Ruhl Libre'" font-weight="300" font-size="74" fill="rgba(20,20,19,0.12)">01</text>
    <text x="66" y="150" font-size="10" letter-spacing="5" fill="rgba(20,20,19,0.4)">/ STUDIO</text>

    <!-- vertical photo curtain cell -->
    <line x1="430" y1="86" x2="430" y2="${H - 70}" stroke="${hair}" stroke-width="1"/>
    <g transform="translate(430 86)">
      <rect width="240" height="330" fill="#d8d0c0"/>
      <rect width="240" height="330" fill="#c9bfa9" opacity="0.5"/>
      <rect x="26" y="34" width="120" height="160" fill="#b4a887" opacity="0.55"/>
      <rect x="170" y="70" width="44" height="220" fill="#a99c78" opacity="0.4"/>
      <rect x="66" y="220" width="150" height="84" fill="#c2b694" opacity="0.5"/>
    </g>

    <!-- asymmetric editorial typography cell -->
    <g transform="translate(472 200)" font-family="'Frank Ruhl Libre'" font-weight="300">
      <text x="0" y="0" font-family="'Heebo'" font-size="10" letter-spacing="5" fill="rgba(20,20,19,0.45)" font-weight="400">קבלן שיפוצים</text>
      <text x="0" y="58" font-size="46" fill="${ink}">החלום שלך למרחב</text>
      <text x="0" y="112" font-size="46" fill="${ink}">מושלם מתגשם</text>
      <text x="0" y="168" font-family="'Heebo'" font-weight="400" font-size="12.5" fill="rgba(20,20,19,0.55)">שיפוצים ברמה גבוהה, שירות אישי ולוחות זמנים מדויקים</text>
      <line x1="0" y1="196" x2="150" y2="196" stroke="rgba(20,20,19,0.5)" stroke-width="1"/>
      <text x="0" y="224" font-family="'Heebo'" font-size="11.5" letter-spacing="2" fill="rgba(20,20,19,0.7)">להזמנת ייעוץ חינם בווטסאפ</text>
    </g>

    <!-- hairline service table rows -->
    <g transform="translate(0 ${H - 262})">
      <line x1="0" y1="0" x2="${W}" y2="0" stroke="${hair}" stroke-width="1"/>
      <g transform="translate(0 44)">
        <line x1="0" y1="0" x2="${W}" y2="0" stroke="rgba(20,20,19,0.08)" stroke-width="1"/>
        <text x="66" y="-14" font-size="10" letter-spacing="3" fill="rgba(20,20,19,0.35)">01</text>
        <text x="${W - 66}" y="-14" text-anchor="end" font-size="15" font-family="'Frank Ruhl Libre'" font-weight="300" fill="${ink}">שיפוץ מקיף לדירה</text>
      </g>
      <g transform="translate(0 88)">
        <line x1="0" y1="0" x2="${W}" y2="0" stroke="rgba(20,20,19,0.08)" stroke-width="1"/>
        <text x="66" y="-14" font-size="10" letter-spacing="3" fill="rgba(20,20,19,0.35)">02</text>
        <text x="${W - 66}" y="-14" text-anchor="end" font-size="15" font-family="'Frank Ruhl Libre'" font-weight="300" fill="${ink}">שיפוץ מטבח</text>
        <text x="66" y="-14" font-size="10" font-family="'Heebo'" fill="rgba(20,20,19,0.4)">החל מ-3,500 ₪</text>
      </g>
      <g transform="translate(0 132)">
        <line x1="0" y1="0" x2="${W}" y2="0" stroke="rgba(20,20,19,0.08)" stroke-width="1"/>
        <text x="66" y="-14" font-size="10" letter-spacing="3" fill="rgba(20,20,19,0.35)">03</text>
        <text x="${W - 66}" y="-14" text-anchor="end" font-size="15" font-family="'Frank Ruhl Libre'" font-weight="300" fill="${ink}">שיפוץ חדרי אמבטיה</text>
      </g>
      <g transform="translate(0 176)">
        <line x1="0" y1="0" x2="${W}" y2="0" stroke="${hair}" stroke-width="1"/>
        <text x="66" y="-14" font-size="10" letter-spacing="3" fill="rgba(20,20,19,0.35)">04</text>
        <text x="${W - 66}" y="-14" text-anchor="end" font-size="15" font-family="'Frank Ruhl Libre'" font-weight="300" fill="${ink}">שיפוץ משרדים</text>
      </g>
    </g>

    <!-- top hairline chrome -->
    <line x1="0" y1="86" x2="${W}" y2="86" stroke="${hair}" stroke-width="1"/>
    <text x="${W / 2}" y="56" text-anchor="middle" font-size="10" letter-spacing="5" fill="rgba(20,20,19,0.55)">קבלן שיפוצים — רמת גן</text>
    <line x1="0" y1="30" x2="${W}" y2="30" stroke="rgba(20,20,19,0.08)"/>
  </g>
</svg>`;
}

/* =================================================================== */
/* cyber-quantum — KINETIC BESPOKE SHOWROOM                            */
/* =================================================================== */
function kineticShowroom() {
  const bg = "#07080A";
  const lime = "#cdff3d";
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}">
  <defs>
    <pattern id="kGrid" width="56" height="56" patternUnits="userSpaceOnUse">
      <path d="M56 0H0V56" fill="none" stroke="rgba(255,255,255,0.05)" stroke-width="1"/>
    </pattern>
    <radialGradient id="kFade" cx="0.5" cy="0.2" r="0.75">
      <stop offset="0" stop-color="#fff"/>
      <stop offset="1" stop-color="#000" stop-opacity="0"/>
    </radialGradient>
    <mask id="kMask"><rect width="${W}" height="560" fill="url(#kFade)"/></mask>
  </defs>
  <rect width="${W}" height="${H}" fill="${bg}"/>
  <rect width="${W}" height="560" fill="url(#kGrid)" mask="url(#kMask)"/>

  <!-- Swiss chrome header -->
  <line x1="0" y1="44" x2="${W}" y2="44" stroke="rgba(255,255,255,0.08)"/>
  <g font-family="'Heebo'">
    <text x="60" y="30" font-size="10" letter-spacing="3" fill="rgba(255,255,255,0.45)">+972 50 123 4567</text>
    <text x="${W / 2}" y="30" text-anchor="middle" font-size="10" letter-spacing="4" fill="rgba(255,255,255,0.6)">הסטודיו הקינטי לפרויקטים</text>
    <text x="${W - 60}" y="30" text-anchor="end" font-size="10" letter-spacing="3" fill="${lime}">PRICE —</text>
  </g>

  <!-- Kinetic marquee ticker band -->
  <line x1="0" y1="72" x2="${W}" y2="72" stroke="rgba(255,255,255,0.08)"/>
  <g font-family="'Heebo'" fill="rgba(255,255,255,0.42)" font-size="10.5" letter-spacing="2.5">
    <text x="24" y="106">קבלן שיפוצים <tspan fill="${lime}">—</tspan> שיפוץ מקיף לדירה <tspan fill="${lime}">—</tspan> 4.9★ בגוגל <tspan fill="${lime}">—</tspan> שיפוץ מטבח <tspan fill="${lime}">—</tspan> לוחות זמנים סגורים <tspan fill="${lime}">—</tspan> אחריות מסמוכת</text>
  </g>

  <!-- Swiss hero -->
  <g font-family="'Heebo'">
    <text x="60" y="196" font-size="10.5" letter-spacing="5" fill="rgba(255,255,255,0.35)">קבלן שיפוצים</text>
    <text x="60" y="258" font-weight="300" font-size="44" fill="#f2f4f6" font-family="'Heebo'">החלום שלך למרחב</text>
    <text x="60" y="308" font-weight="300" font-size="44" fill="#f2f4f6">מושלם מתגשם</text>
    <rect x="60" y="352" width="214" height="44" fill="${lime}"/>
    <text x="167" y="380" text-anchor="middle" font-size="13" font-weight="700" fill="#07080a">לשפץ אצלנו — הצעה מהסלון</text>
    <g transform="translate(810 180)">
      <!-- draggable range sliders -->
      <rect width="330" height="300" fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.1)" stroke-width="1"/>
      <text x="20" y="36" font-size="9" letter-spacing="3" fill="rgba(255,255,255,0.35)">LIVE QUOTE</text>
      <text x="20" y="86" font-weight="300" font-size="34" fill="${lime}" font-family="'Heebo'">₪12,000</text>
      <text x="20" y="114" font-size="10.5" fill="rgba(255,255,255,0.4)">up to ₪19,000</text>
      <text x="20" y="152" font-size="10" letter-spacing="3" fill="rgba(255,255,255,0.35)">02 — היקף</text>
      <rect x="20" y="166" width="290" height="2" fill="rgba(255,255,255,0.14)"/>
      <rect x="20" y="164" width="146" height="6" fill="${lime}"/>
      <rect x="160" y="158" width="10" height="20" fill="${lime}"/>
      <text x="20" y="208" font-size="10" letter-spacing="3" fill="rgba(255,255,255,0.35)">03 — דחיפות</text>
      <rect x="20" y="222" width="290" height="2" fill="rgba(255,255,255,0.14)"/>
      <rect x="20" y="220" width="76" height="6" fill="${lime}"/>
      <rect x="90" y="214" width="10" height="20" fill="${lime}"/>
      <rect x="20" y="258" width="290" height="34" fill="${lime}"/>
      <text x="165" y="280" text-anchor="middle" font-size="12" font-weight="700" fill="#07080a">שליחת ההצעה לוואטסאפ —</text>
    </g>
  </g>

  <!-- numbered service index rows -->
  <g font-family="'Heebo'" transform="translate(0 ${H - 108})">
    <line x1="0" y1="0" x2="${W}" y2="0" stroke="rgba(255,255,255,0.08)"/>
    <text x="60" y="36" font-size="10" letter-spacing="3" fill="rgba(255,255,255,0.25)">01</text>
    <text x="112" y="36" font-size="14" fill="rgba(255,255,255,0.85)">שיפוץ מקיף לדירה</text>
    <text x="${W - 60}" y="36" text-anchor="end" font-size="11" fill="rgba(255,255,255,0.45)">החל מ-5,000 ₪</text>
    <line x1="0" y1="56" x2="${W}" y2="56" stroke="rgba(255,255,255,0.06)"/>
    <text x="60" y="90" font-size="10" letter-spacing="3" fill="rgba(255,255,255,0.25)">02</text>
    <text x="112" y="90" font-size="14" fill="rgba(255,255,255,0.85)">שיפוץ מטבח</text>
    <text x="${W - 60}" y="90" text-anchor="end" font-size="11" fill="rgba(255,255,255,0.45)">החל מ-3,500 ₪</text>
  </g>
</svg>`;
}

/* ------------------------------------------------------------------ */

mkdirSync(OUT_DIR, { recursive: true });

const targets = [
  ["whisky-obsidian", forgeAtelier],
  ["apple-spatial", titaniumPro],
  ["atelier-boutique", swissGrid],
  ["cyber-quantum", kineticShowroom],
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
