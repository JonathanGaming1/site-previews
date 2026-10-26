import type { LuxTheme } from "@/lib/luxtheme";
import type { TemplateId } from "@/types/site";

/**
 * Distinct art-directed themes. Backgrounds follow each template's spec:
 * Forge #030303 · Titanium #0B0C0E · Carbon #07080A · Stone #F2EFE9.
 */
export const LUX_THEMES: Record<TemplateId, LuxTheme> = {
  "apple-spatial": {
    accent: "#0071e3",
    dark: true,
    pageBg: "#0b0c0e",
    surface: "rgba(255,255,255,0.045)",
    border: "rgba(255,255,255,0.10)",
    headline: "#f5f5f7",
    text: "rgba(245,245,247,0.78)",
    muted: "rgba(245,245,247,0.46)",
    fontSerif: undefined, // precision sans (Heebo), Apple hardware language
  },
  "whisky-obsidian": {
    accent: "#c59b27",
    dark: true,
    pageBg: "#030303",
    surface: "rgba(255,255,255,0.035)",
    border: "rgba(255,255,255,0.08)",
    headline: "#f4efe6",
    text: "rgba(244,239,230,0.72)",
    muted: "rgba(244,239,230,0.42)",
    fontSerif: "'Frank Ruhl Libre', serif",
  },
  "cyber-quantum": {
    accent: "#cdff3d",
    dark: true,
    pageBg: "#07080a",
    surface: "rgba(255,255,255,0.04)",
    border: "rgba(255,255,255,0.10)",
    headline: "#f2f4f6",
    text: "rgba(242,244,246,0.76)",
    muted: "rgba(242,244,246,0.44)",
    fontSerif: undefined,
  },
  "atelier-boutique": {
    accent: "#8b6a3e",
    dark: false,
    pageBg: "#f2efe9",
    surface: "rgba(255,255,255,0.55)",
    border: "rgba(20,20,19,0.15)",
    headline: "#141413",
    text: "rgba(20,20,19,0.76)",
    muted: "rgba(20,20,19,0.48)",
    fontSerif: "'Frank Ruhl Libre', serif",
  },
};
