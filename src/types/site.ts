export type TemplateId =
  | "apple-spatial"
  | "whisky-obsidian"
  | "cyber-quantum"
  | "atelier-boutique";

/** Legacy template ids that may still exist in older business JSONs. */
export const LEGACY_TEMPLATE_FALLBACK: Record<string, TemplateId> = {
  "luxury-dark": "whisky-obsidian",
  "modern-clean": "apple-spatial",
  "warm-boutique": "atelier-boutique",
};

export const TEMPLATE_OPTIONS: { id: TemplateId; label: string }[] = [
  { id: "apple-spatial", label: "Titanium Pro — פיצול טיטניום" },
  { id: "whisky-obsidian", label: "Forge Atelier — אולפן שחור" },
  { id: "cyber-quantum", label: "Kinetic Showroom — סלון קינטי" },
  { id: "atelier-boutique", label: "Swiss Grid — רשת אדריכלית" },
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
  /** Legacy n8n webhook (kept for backward compatibility, unused by the direct-API editor) */
  n8nEditWebhookUrl: string;
  /** URL of the agency checkout funnel (default "/checkout") */
  checkoutUrl: string;
  /** n8n webhook notified when a visitor opens the demo (live view radar) */
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
