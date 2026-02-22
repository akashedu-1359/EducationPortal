export type BannerType = "Hero" | "Promotional" | "Announcement";
export type PageStatus = "Draft" | "Published";
export type SectionType =
  | "Features"
  | "Testimonials"
  | "Stats"
  | "HowItWorks"
  | "CallToAction";

export interface Banner {
  id: string;
  type: BannerType;
  title: string;
  subtitle?: string;
  imageUrl?: string;
  mobileImageUrl?: string;
  ctaText?: string;
  ctaUrl?: string;
  secondaryCtaText?: string;
  secondaryCtaUrl?: string;
  isActive: boolean;
  order: number;
  startDate?: string;
  endDate?: string;
}

export interface PromoBanner {
  id: string;
  message: string;
  linkText?: string;
  linkUrl?: string;
  backgroundColor: string;
  textColor: string;
  isActive: boolean;
  startDate?: string;
  endDate?: string;
}

export interface StaticPage {
  id: string;
  title: string;
  slug: string;
  content: string; // rich HTML content
  metaTitle?: string;
  metaDescription?: string;
  status: PageStatus;
  publishedAt?: string;
  updatedAt: string;
}

export interface FaqItem {
  id: string;
  question: string;
  answer: string;
  categoryId?: string;
  order: number;
  isActive: boolean;
}

export interface FaqCategory {
  id: string;
  name: string;
  order: number;
  faqs: FaqItem[];
}

export interface FooterLink {
  id: string;
  label: string;
  url: string;
  order: number;
  isExternal: boolean;
}

export interface FooterColumn {
  id: string;
  title: string;
  order: number;
  links: FooterLink[];
}

export interface FooterConfig {
  columns: FooterColumn[];
  copyrightText: string;
  socialLinks: SocialLink[];
}

export interface SocialLink {
  platform: "Twitter" | "Facebook" | "Instagram" | "LinkedIn" | "YouTube";
  url: string;
  isActive: boolean;
}

export interface HomepageSection {
  id: string;
  type: SectionType;
  title?: string;
  subtitle?: string;
  isActive: boolean;
  order: number;
  content: Record<string, unknown>; // flexible JSON per section type
}

export interface SiteSettings {
  siteName: string;
  logoUrl?: string;
  faviconUrl?: string;
  primaryColor?: string;
  supportEmail: string;
  supportPhone?: string;
  address?: string;
  googleAnalyticsId?: string;
  facebookPixelId?: string;
}

export interface FeatureFlag {
  id: string;
  key: string;
  value: boolean;
  description?: string;
  updatedAt: string;
}

// All CMS data for homepage SSR
export interface HomepageCmsData {
  banners: Banner[];
  promoBanner?: PromoBanner;
  sections: HomepageSection[];
  settings: SiteSettings;
  featureFlags: Record<string, boolean>;
}
