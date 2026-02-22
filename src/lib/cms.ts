import type {
  Banner,
  PromoBanner,
  StaticPage,
  FaqCategory,
  FooterConfig,
  HomepageSection,
  SiteSettings,
  FeatureFlag,
  HomepageCmsData,
} from "@/types";
import { api, unwrap } from "./api";

// ─── Public CMS Endpoints (server-side / ISR) ──────────────────────────────

export const cmsPublicApi = {
  getHomepageData: async (): Promise<HomepageCmsData> => {
    const res = await api.get("/cms/homepage");
    return unwrap(res);
  },

  getPage: async (slug: string): Promise<StaticPage> => {
    const res = await api.get(`/cms/pages/${slug}`);
    return unwrap(res);
  },

  getFaqs: async (): Promise<FaqCategory[]> => {
    const res = await api.get("/cms/faqs");
    return unwrap(res);
  },

  getFooter: async (): Promise<FooterConfig> => {
    const res = await api.get("/cms/footer");
    return unwrap(res);
  },

  getSettings: async (): Promise<SiteSettings> => {
    const res = await api.get("/cms/settings");
    return unwrap(res);
  },

  getFeatureFlags: async (): Promise<Record<string, boolean>> => {
    const res = await api.get("/cms/feature-flags");
    return unwrap(res);
  },
};

// ─── Admin CMS Endpoints ──────────────────────────────────────────────────

export const cmsAdminApi = {
  // Banners
  getBanners: async (): Promise<Banner[]> => {
    const res = await api.get("/admin/cms/banners");
    return unwrap(res);
  },
  createBanner: async (data: Partial<Banner>): Promise<Banner> => {
    const res = await api.post("/admin/cms/banners", data);
    return unwrap(res);
  },
  updateBanner: async (id: string, data: Partial<Banner>): Promise<Banner> => {
    const res = await api.put(`/admin/cms/banners/${id}`, data);
    return unwrap(res);
  },
  deleteBanner: async (id: string): Promise<void> => {
    const res = await api.delete(`/admin/cms/banners/${id}`);
    unwrap(res);
  },
  reorderBanners: async (ids: string[]): Promise<void> => {
    const res = await api.put("/admin/cms/banners/reorder", { ids });
    unwrap(res);
  },

  // Promo Banner
  getPromoBanner: async (): Promise<PromoBanner | null> => {
    const res = await api.get("/admin/cms/promo-banner");
    return unwrap(res);
  },
  upsertPromoBanner: async (data: Partial<PromoBanner>): Promise<PromoBanner> => {
    const res = await api.put("/admin/cms/promo-banner", data);
    return unwrap(res);
  },

  // Static Pages
  getPages: async (): Promise<StaticPage[]> => {
    const res = await api.get("/admin/cms/pages");
    return unwrap(res);
  },
  getPage: async (id: string): Promise<StaticPage> => {
    const res = await api.get(`/admin/cms/pages/${id}`);
    return unwrap(res);
  },
  createPage: async (data: Partial<StaticPage>): Promise<StaticPage> => {
    const res = await api.post("/admin/cms/pages", data);
    return unwrap(res);
  },
  updatePage: async (id: string, data: Partial<StaticPage>): Promise<StaticPage> => {
    const res = await api.put(`/admin/cms/pages/${id}`, data);
    return unwrap(res);
  },
  deletePage: async (id: string): Promise<void> => {
    const res = await api.delete(`/admin/cms/pages/${id}`);
    unwrap(res);
  },

  // FAQs
  getFaqCategories: async (): Promise<FaqCategory[]> => {
    const res = await api.get("/admin/cms/faqs");
    return unwrap(res);
  },
  createFaqCategory: async (data: Partial<FaqCategory>): Promise<FaqCategory> => {
    const res = await api.post("/admin/cms/faq-categories", data);
    return unwrap(res);
  },
  updateFaqCategory: async (id: string, data: Partial<FaqCategory>): Promise<FaqCategory> => {
    const res = await api.put(`/admin/cms/faq-categories/${id}`, data);
    return unwrap(res);
  },
  deleteFaqCategory: async (id: string): Promise<void> => {
    const res = await api.delete(`/admin/cms/faq-categories/${id}`);
    unwrap(res);
  },
  createFaq: async (
    categoryId: string,
    data: { question: string; answer: string; order?: number }
  ): Promise<void> => {
    const res = await api.post(`/admin/cms/faq-categories/${categoryId}/faqs`, data);
    unwrap(res);
  },
  updateFaq: async (
    id: string,
    data: { question?: string; answer?: string; isActive?: boolean }
  ): Promise<void> => {
    const res = await api.put(`/admin/cms/faqs/${id}`, data);
    unwrap(res);
  },
  deleteFaq: async (id: string): Promise<void> => {
    const res = await api.delete(`/admin/cms/faqs/${id}`);
    unwrap(res);
  },

  // Footer
  getFooter: async (): Promise<FooterConfig> => {
    const res = await api.get("/admin/cms/footer");
    return unwrap(res);
  },
  updateFooter: async (data: Partial<FooterConfig>): Promise<FooterConfig> => {
    const res = await api.put("/admin/cms/footer", data);
    return unwrap(res);
  },

  // Sections
  getSections: async (): Promise<HomepageSection[]> => {
    const res = await api.get("/admin/cms/sections");
    return unwrap(res);
  },
  updateSection: async (
    id: string,
    data: Partial<HomepageSection>
  ): Promise<HomepageSection> => {
    const res = await api.put(`/admin/cms/sections/${id}`, data);
    return unwrap(res);
  },

  // Settings
  getSettings: async (): Promise<SiteSettings> => {
    const res = await api.get("/admin/cms/settings");
    return unwrap(res);
  },
  updateSettings: async (data: Partial<SiteSettings>): Promise<SiteSettings> => {
    const res = await api.put("/admin/cms/settings", data);
    return unwrap(res);
  },

  // Feature Flags
  getFeatureFlags: async (): Promise<FeatureFlag[]> => {
    const res = await api.get("/admin/cms/feature-flags");
    return unwrap(res);
  },
  updateFeatureFlag: async (
    key: string,
    value: boolean
  ): Promise<FeatureFlag> => {
    const res = await api.put(`/admin/cms/feature-flags/${key}`, { value });
    return unwrap(res);
  },
};
