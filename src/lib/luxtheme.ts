/**
 * Shared theming contract for the bespoke interactive components
 * (DynamicIslandNav, TiltCard3D, InteractiveQuoteBuilder, BeforeAfterSlider,
 * VipConciergeDrawer). Every template supplies its own LuxTheme so the same
 * reusable component feels native to each luxury design language.
 */
export interface LuxTheme {
  /** Brand accent color (buttons, meters, glares) */
  accent: string;
  /** Dark or light design language */
  dark: boolean;
  /** Page background color (used for inline gradients) */
  pageBg: string;
  /** Card / panel surface */
  surface: string;
  /** 1px border color */
  border: string;
  /** Headline color */
  headline: string;
  /** Body text color */
  text: string;
  /** Muted text color */
  muted: string;
  /** Optional serif font-family for headings */
  fontSerif?: string;
}

/** Derive a readable on-accent ink color (dark text on bright accents). */
export function inkOn(accent: string, dark: boolean): string {
  if (dark) return "#14100a";
  return "#fdf9f3";
}
