export type TemplateId =
  | "forge-automotive"
  | "apple-spatial"
  | "horology-chrono"
  | "kinetic-monolith"
  | "swiss-editorial";

/**
 * Legacy template ids that may still exist in older business JSONs.
 * Every one resolves to one of the five current art directions.
 */
export const LEGACY_TEMPLATE_FALLBACK: Record<string, TemplateId> = {
  "whisky-obsidian": "forge-automotive",
  "luxury-dark": "forge-automotive",
  "modern-clean": "apple-spatial",
  "cyber-quantum": "kinetic-monolith",
  "atelier-boutique": "swiss-editorial",
  "warm-boutique": "swiss-editorial",
};

export const TEMPLATE_OPTIONS: {
  id: TemplateId;
  label: string;
  short: string;
  note: string;
}[] = [
  {
    id: "forge-automotive",
    label: "Forge Dark Luxury Atelier",
    short: "01 / FORGE",
    note: "שחור אובסידיאן · מלאכה בריטית",
  },
  {
    id: "apple-spatial",
    label: "Apple VisionOS Floating Islands",
    short: "02 / SPATIAL",
    note: "איי זכוכית מרחפים · Dynamic Island",
  },
  {
    id: "horology-chrono",
    label: "Swiss Chronograph Mechanical Luxury",
    short: "03 / CHRONO",
    note: "שפיר midnight · זהב שמפאן",
  },
  {
    id: "kinetic-monolith",
    label: "Futuristic Monolith & Horizontal Deck",
    short: "04 / MONOLITH",
    note: "כרום נוזלי · דק אופקי",
  },
  {
    id: "swiss-editorial",
    label: "Architectural Blueprint Curtain Grid",
    short: "05 / EDITORIAL",
    note: "טרוורטין חם · רשת שרטוט",
  },
];

export interface ThemeConfig {
  primaryColor: string;
  accentColor: string;
}

export interface BusinessInfo {
  name: string;
  category: string;
  tagline: string;
  description: string;
  phone: string;
  whatsapp: string;
  address: string;
  openingHours: string;
  googleRating: number;
  reviewsCount: number;
}

export interface HeroContent {
  headline: string;
  subheadline: string;
  ctaText: string;
  backgroundImage: string;
}

export interface ServiceItem {
  title: string;
  description: string;
  price?: string;
  iconName: string;
}

export interface BenefitItem {
  title: string;
  description: string;
}

export interface ReviewItem {
  author: string;
  text: string;
  rating: number;
}

export interface FaqItem {
  question: string;
  answer: string;
}

export interface ProjectItem {
  title: string;
  description: string;
  beforeImage: string;
  afterImage: string;
}

export interface TimelineStep {
  title: string;
  description: string;
}

/** A saved restore point created by the in-site admin editor */
export interface Checkpoint {
  id: string;
  label: string;
  timestamp: string;
  data: Record<string, unknown>;
}

export interface SiteData {
  /** Unique business slug — the site lives permanently at /p/{slug} */
  slug: string;
  businessId: string;
  templateId: TemplateId;
  isDemo: boolean;
  /** Legacy n8n webhook (kept for backward compatibility, unused by the bridge editor) */
  n8nEditWebhookUrl: string;
  /** URL of the agency checkout funnel (default "/checkout") */
  checkoutUrl: string;
  /** Legacy view webhook field, kept so older JSON files still hydrate */
  trackingWebhookUrl: string;
  theme: ThemeConfig;
  businessInfo: BusinessInfo;
  hero: HeroContent;
  services: ServiceItem[];
  benefits: BenefitItem[];
  reviews: ReviewItem[];
  faq: FaqItem[];
  /** Optional interactive showcase content, with template-side fallbacks */
  projects?: ProjectItem[];
  processTimeline?: TimelineStep[];
  /** Full snapshot of the originally generated siteData, used by Recall */
  initialBackup?: SiteData;
  /** Timestamped restore points saved by the admin editor */
  checkpoints?: Checkpoint[];
}
