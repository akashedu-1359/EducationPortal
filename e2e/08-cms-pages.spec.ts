import { test, expect, request } from "@playwright/test";

const API = process.env.PLAYWRIGHT_API_URL || "http://localhost:5000";

const KNOWN_CMS_SLUGS = ["about", "privacy", "terms", "contact", "refund-policy"];

/**
 * CMS (dynamic static pages) E2E tests.
 * These pages are served from the catch-all /[slug] route backed by the CMS API.
 */
test.describe("CMS Pages", () => {
  let publishedSlugs: string[] = [];

  test.beforeAll(async () => {
    const apiCtx = await request.newContext({ baseURL: API });
    try {
      const res = await apiCtx.get("/api/cms/pages");
      if (res.ok()) {
        const body = await res.json();
        const pages = body.data ?? body.data?.items ?? [];
        if (Array.isArray(pages)) {
          publishedSlugs = pages
            .filter((p: { status?: string }) => p.status === "Published")
            .map((p: { slug: string }) => p.slug);
        }
      }
    } catch {
      // API unavailable — fallback to known slugs
    }
    await apiCtx.dispose();
  });

  test("known CMS pages load without crashing (about, privacy, terms)", async ({
    page,
  }) => {
    for (const slug of KNOWN_CMS_SLUGS.slice(0, 3)) {
      const res = await page.goto(`/${slug}`);
      // 200 if the page exists in CMS, 404 if it hasn't been created yet — both are valid
      expect([200, 404]).toContain(res?.status());
    }
  });

  test("published CMS page has proper content structure", async ({ page }) => {
    const slug =
      publishedSlugs.length > 0 ? publishedSlugs[0] : KNOWN_CMS_SLUGS[0];

    const res = await page.goto(`/${slug}`);
    if (res?.status() === 404) {
      test.skip(true, `CMS page /${slug} not found — skipping content check`);
    }

    // Page should have a heading
    const heading = page.locator("h1").first();
    await expect(heading).toBeVisible({ timeout: 10000 });

    // Page should have a content area (prose block from CMS)
    const content = page.locator("main").first();
    await expect(content).toBeVisible();
  });

  test("CMS page renders title in document head", async ({ page }) => {
    const slug =
      publishedSlugs.length > 0 ? publishedSlugs[0] : "privacy";

    const res = await page.goto(`/${slug}`);
    if (res?.status() === 404) {
      test.skip(true, `CMS page /${slug} not found`);
    }

    const title = await page.title();
    expect(title).toBeTruthy();
    expect(title.length).toBeGreaterThan(0);
  });

  test("CMS page has navbar and footer", async ({ page }) => {
    const slug =
      publishedSlugs.length > 0 ? publishedSlugs[0] : "privacy";

    const res = await page.goto(`/${slug}`);
    if (res?.status() === 404) {
      test.skip(true, `CMS page /${slug} not found`);
    }

    await expect(page.locator("nav")).toBeVisible();
    await expect(page.locator("footer")).toBeVisible();
  });

  test("non-existent CMS page returns 404", async ({ page }) => {
    const res = await page.goto(`/this-page-does-not-exist-${Date.now()}`);
    expect(res?.status()).toBe(404);
  });

  test("404 page has user-friendly content", async ({ page }) => {
    await page.goto(`/this-page-does-not-exist-${Date.now()}`);

    // Should show some 404-related text (Next.js default or custom)
    const notFoundText = page
      .getByText(/not found|404|page.*exist|couldn.*find/i)
      .first();
    await expect(notFoundText).toBeVisible({ timeout: 10000 });
  });

  test("multiple CMS pages are independently accessible", async ({ page }) => {
    if (publishedSlugs.length < 2) {
      test.skip(true, "Need at least 2 published CMS pages to test");
    }

    for (const slug of publishedSlugs.slice(0, 3)) {
      const res = await page.goto(`/${slug}`);
      expect(res?.status()).toBe(200);
      const heading = page.locator("h1").first();
      await expect(heading).toBeVisible({ timeout: 10000 });
    }
  });

  test("CMS page via API matches rendered page title", async ({ page }) => {
    if (publishedSlugs.length === 0) {
      test.skip(true, "No published CMS pages available");
    }

    const slug = publishedSlugs[0];

    const apiCtx = await request.newContext({ baseURL: API });
    const apiRes = await apiCtx.get(`/api/cms/pages/${slug}`);
    if (!apiRes.ok()) {
      await apiCtx.dispose();
      test.skip(true, `Could not fetch CMS page ${slug} from API`);
    }

    const apiBody = await apiRes.json();
    const expectedTitle = apiBody.data?.title;
    await apiCtx.dispose();

    if (!expectedTitle) {
      test.skip(true, "CMS page has no title in API response");
    }

    await page.goto(`/${slug}`);
    const heading = page.locator("h1").first();
    await expect(heading).toContainText(expectedTitle, { timeout: 10000 });
  });
});
