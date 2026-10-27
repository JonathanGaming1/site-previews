const plugin = require("tailwindcss/plugin");

/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/templates/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        /* Body / UI — razor-sharp Hebrew sans */
        heebo: ["Heebo", "system-ui", "sans-serif"],
        assistant: ["Assistant", "Heebo", "system-ui", "sans-serif"],
        /* High-contrast editorial serifs — always used light, tight tracking */
        frank: ["'Frank Ruhl Libre'", "Heebo", "serif"],
        cormorant: ["'Cormorant Garamond'", "'Frank Ruhl Libre'", "Heebo", "serif"],
        /* Geometric display: numerals, spec marks, Latin capitals */
        grotesk: ["'Space Grotesk'", "Assistant", "system-ui", "sans-serif"],
        /* Single bold Hebrew display face */
        secular: ["'Secular One'", "Assistant", "sans-serif"],
      },
      letterSpacing: {
        editorial: "-0.03em",
        stage: "0.34em",
        specmark: "0.46em",
      },
      boxShadow: {
        stage: "0 60px 160px -60px rgba(0,0,0,0.95)",
        specular: "inset 0 1px 0 0 rgba(255,255,255,0.14)",
        halo: "0 0 90px -20px currentColor",
      },
      keyframes: {
        sheen: {
          "0%": { transform: "translateX(-140%) rotate(8deg)" },
          "100%": { transform: "translateX(140%) rotate(8deg)" },
        },
        floaty: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-16px)" },
        },
        gearspin: {
          "0%": { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(360deg)" },
        },
        beampulse: {
          "0%, 100%": { opacity: "0.18" },
          "50%": { opacity: "0.85" },
        },
        scanline: {
          "0%": { transform: "translateY(-100%)" },
          "100%": { transform: "translateY(100%)" },
        },
        curtainopen: {
          "0%": { transform: "translateX(0%)" },
          "100%": { transform: "translateX(-100%)" },
        },
        breathe: {
          "0%, 100%": { opacity: "0.35", transform: "scale(1)" },
          "50%": { opacity: "0.75", transform: "scale(1.06)" },
        },
      },
      animation: {
        sheen: "sheen 2.8s cubic-bezier(0.22, 1, 0.36, 1) infinite",
        floaty: "floaty 7.5s ease-in-out infinite",
        "gear-slow": "gearspin 42s linear infinite",
        "gear-mid": "gearspin 26s linear infinite",
        "gear-fast": "gearspin 13s linear infinite",
        "gear-reverse": "gearspin 20s linear infinite reverse",
        beam: "beampulse 3.6s ease-in-out infinite",
        scanline: "scanline 4.2s linear infinite",
        curtain: "curtainopen 1.1s cubic-bezier(0.76, 0, 0.24, 1) forwards",
        breathe: "breathe 6.5s ease-in-out infinite",
      },
    },
  },
  plugins: [
    /* 3D stage utilities — Tailwind v3 ships none of these, and the templates
       lean on real perspective/z-depth for their camera work. */
    plugin(({ addUtilities, matchUtilities }) => {
      addUtilities({
        ".transform-3d": { transformStyle: "preserve-3d" },
        ".transform-flat": { transformStyle: "flat" },
        ".backface-hidden": { backfaceVisibility: "hidden" },
        ".backface-visible": { backfaceVisibility: "visible" },
        ".preserve-depth": { transform: "translateZ(0px)" },
      });
      matchUtilities(
        {
          perspective: (value) => ({ perspective: value }),
          "perspective-origin": (value) => ({ perspectiveOrigin: value }),
          "translate-z": (value) => ({ transform: `translateZ(${value})` }),
          "rotate-y": (value) => ({ transform: `rotateY(${value})` }),
          "rotate-x": (value) => ({ transform: `rotateX(${value})` }),
        },
        {
          values: {
            none: "none",
            600: "600px",
            800: "800px",
            1000: "1000px",
            1200: "1200px",
            1600: "1600px",
            2000: "2000px",
            0: "0px",
            30: "30px",
            60: "60px",
            90: "90px",
            140: "140px",
          },
        },
      );
    }),
  ],
};
