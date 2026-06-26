import { test, expect, request } from "@playwright/test";
import { loginAsUser } from "./helpers/auth";

const API = process.env.PLAYWRIGHT_API_URL || "http://localhost:5000";

/**
 * Resource detail page E2E tests.
 * These verify the /resources/[slug] page renders resource metadata correctly.
 */
test.describe("Resource Detail Page", () => {
  let firstResource: {
    id: string;
    slug: string;
    title: string;
    type: string;
    pricingType: string;
    category?: { name: string };
  } | null = null;

  test.beforeAll(async () => {
    const apiCtx = await request.newContext({ baseURL: API });
    try {
      const res = await apiCtx.get("/api/resources?pageSize=5");
      if (res.ok()) {
        const body = await res.json();
        const items = body.data?.items ?? [];
        if (items.length > 0) {
          firstResource = items[0];
        }
      }
    } catch {
      // API unavailable — tests will skip gracefully
    }
    await apiCtx.dispose();
  });

  test("resource detail page loads with valid slug", async ({ page }) => {
    if (!firstResource) return test.skip(true, "No resources available");

    const res = await page.goto(`/resources/${firstResource.slug}`);
    expect(res?.status()).toBe(200);
    await expect(page.locator("main")).toBeVisible();
  });

  test("resource title is displayed", async ({ page }) => {
    if (!firstResource) return test.skip(true, "No resources available");

    await page.goto(`/resources/${firstResource.slug}`);

    const heading = page.locator("h1").first();
    await expect(heading).toBeVisible({ timeout: 10000 });
    await expect(heading).toContainText(firstResource.title);
  });

  test("resource description section is visible", async ({ page }) => {
    if (!firstResource) return test.skip(true, "No resources available");

    await page.goto(`/resources/${firstResource.slug}`);
    await page.waitForLoadState("networkidle");

    const aboutSection = page
      .getByText(/about this resource|description/i)
      .first();
    await expect(aboutSection).toBeVisible({ timeout: 10000 });
  });

  test("resource type badge is shown", async ({ page }) => {
    if (!firstResource) return test.skip(true, "No resources available");

    await page.goto(`/resources/${firstResource.slug}`);
    await page.waitForLoadState("networkidle");

    const typeBadge = page
      .getByText(new RegExp(`^${firstResource.type}$`, "i"))
      .first();
    await expect(typeBadge).toBeVisible({ timeout: 10000 });
  });

  test("resource has breadcrumb navigation back to resources list", async ({
    page,
  }) => {
    if (!firstResource) return test.skip(true, "No resources available");

    await page.goto(`/resources/${firstResource.slug}`);
    await page.waitForLoadState("networkidle");

    const breadcrumbLink = page
      .getByRole("link", { name: /resources/i })
      .first();
    await expect(breadcrumbLink).toBeVisible({ timeout: 10000 });
  });

  test("resource has enroll/access/purchase button", async ({ page }) => {
    if (!firstResource) return test.skip(true, "No resources available");

    await page.goto(`/resources/${firstResource.slug}`);
    await page.waitForLoadState("networkidle");

    const actionButton = page
      .getByRole("link", {
        name: /purchase|enroll|access|watch|view|read|sign in/i,
      })
      .first();
    await expect(actionButton).toBeVisible({ timeout: 10000 });
  });

  test("resource detail shows enrollment count", async ({ page }) => {
    if (!firstResource) return test.skip(true, "No resources available");

    await page.goto(`/resources/${firstResource.slug}`);
    await page.waitForLoadState("networkidle");

    const enrollCount = page.getByText(/enrolled/i).first();
    await expect(enrollCount).toBeVisible({ timeout: 10000 });
  });

  test("resource detail page sets document title", async ({ page }) => {
    if (!firstResource) return test.skip(true, "No resources available");

    await page.goto(`/resources/${firstResource.slug}`);
    const title = await page.title();
    expect(title).toBeTruthy();
    expect(title.toLowerCase()).toContain(
      firstResource.title.toLowerCase().slice(0, 10)
    );
  });

  test("non-existent resource slug returns 404", async ({ page }) => {
    const res = await page.goto(
      `/resources/this-resource-does-not-exist-${Date.now()}`
    );
    expect(res?.status()).toBe(404);
  });

  test("clicking breadcrumb navigates to resources list", async ({ page }) => {
    if (!firstResource) return test.skip(true, "No resources available");

    await page.goto(`/resources/${firstResource.slug}`);
    await page.waitForLoadState("networkidle");

    const resourcesLink = page
      .locator("nav a, a")
      .filter({ hasText: /^Resources$/i })
      .first();

    if (!(await resourcesLink.isVisible().catch(() => false))) {
      return test.skip(true, "Breadcrumb Resources link not visible");
    }

    await resourcesLink.click();
    await page.waitForURL(/\/resources\/?(\?|$)/, { timeout: 10000 });
    expect(page.url()).toMatch(/\/resources/);
  });

  test("authenticated user sees correct access button for free resource", async ({
    page,
  }) => {
    if (!firstResource) return test.skip(true, "No resources available");

    const apiCtx = await request.newContext({ baseURL: API });
    let freeSlug: string | null = null;
    try {
      const res = await apiCtx.get(
        "/api/resources?pageSize=20&pricingType=Free"
      );
      if (res.ok()) {
        const body = await res.json();
        const items = body.data?.items ?? [];
        if (items.length > 0) freeSlug = items[0].slug;
      }
    } catch {
      // ignore
    }
    await apiCtx.dispose();

    if (!freeSlug) return test.skip(true, "No free resources available");

    await loginAsUser(page);
    await page.goto(`/resources/${freeSlug}`);
    await page.waitForLoadState("networkidle");

    const accessButton = page
      .getByRole("link", { name: /watch|view|read|access|enroll/i })
      .first();
    await expect(accessButton).toBeVisible({ timeout: 10000 });
  });
});
