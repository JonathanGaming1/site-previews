import type { LuxTheme } from "@/lib/luxtheme";
import type { TemplateId } from "@/types/site";

export const LUX_THEMES: Record<TemplateId, LuxTheme> = {
  "apple-spatial": {
    accent: "#0071e3",
    dark: true,
    pageBg: "#0a0a0d",
    surface: "rgba(255,255,255,0.06)",
    border: "rgba(255,255,255,0.12)",
    headline: "#f5f5f7",
    text: "rgba(245,245,247,0.8)",
    muted: "rgba(245,245,247,0.5)",
    fontSerif: undefined, // Apple look = pure sans (Heebo)
  },
  "whisky-obsidian": {
    accent: "#c59b27",
    dark: true,
    pageBg: "#080706",
    surface: "rgba(233,214,176,0.05)",
    border: "rgba(197,155,39,0.25)",
    headline: "#f2e8d5",
    text: "rgba(242,232,213,0.74)",
    muted: "rgba(242,232,213,0.46)",
    fontSerif: "'Frank Ruhl Libre', serif",
  },
  "cyber-quantum": {
    accent: "#6e7bff",
    dark: true,
    pageBg: "#05060f",
    surface: "rgba(110,123,255,0.05)",
    border: "rgba(126,140,255,0.28)",
    headline: "#eef0ff",
    text: "rgba(238,240,255,0.78)",
    muted: "rgba(238,240,255,0.48)",
    fontSerif: undefined,
  },
  "atelier-boutique": {
    accent: "#8b6a3e",
    dark: false,
    pageBg: "#ede4d3",
    surface: "rgba(255,253,247,0.72)",
    border: "rgba(64,48,32,0.12)",
    headline: "#2a2118",
    text: "rgba(42,33,24,0.74)",
    muted: "rgba(42,33,24,0.48)",
    fontSerif: "'Frank Ruhl Libre', serif",
  },
};

/** Small helper: hex + alpha suffix (works with 6-digit hex only). */
export function withAlpha(hex: string, alpha: string): string {
  return hex.length === 7 ? `${hex}${alpha}` : hex;
}
