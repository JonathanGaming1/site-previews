export type TemplateId = "luxury-dark" | "modern-clean" | "warm-boutique";

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

export interface SiteData {
  businessId: string;
  templateId: TemplateId;
  isDemo: boolean;
  /** n8n webhook used for manual saves, AI edits and Recall */
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
  /** Full snapshot of the originally generated siteData, used by the Recall button */
  initialBackup?: SiteData;
}
