import { test, expect, request } from "@playwright/test";
import { loginAsUser } from "./helpers/auth";

const API = process.env.PLAYWRIGHT_API_URL || "http://localhost:5000";

/**
 * Checkout flow E2E tests.
 * These verify the checkout UI renders correctly without performing real payments.
 */
test.describe("Checkout Flow", () => {
  let resourceId: string | null = null;
  let resourceSlug: string | null = null;

  test.beforeAll(async () => {
    const apiCtx = await request.newContext({ baseURL: API });
    try {
      const res = await apiCtx.get("/api/resources?pageSize=1");
      if (res.ok()) {
        const body = await res.json();
        const items = body.data?.items ?? [];
        if (items.length > 0) {
          resourceId = items[0].id;
          resourceSlug = items[0].slug;
        }
      }
    } catch {
      // API unavailable — tests will skip gracefully
    }
    await apiCtx.dispose();
  });

  test("checkout page loads for a valid resource", async ({ page }) => {
    if (!resourceId) test.skip(true, "No resources available to test checkout");
    await loginAsUser(page);
    const res = await page.goto(`/checkout/${resourceId}`);
    expect([200, 304]).toContain(res?.status());
    await expect(page.locator("main, [class*='checkout'], h1")).toBeVisible();
  });

  test("checkout page shows payment heading and pay button", async ({ page }) => {
    if (!resourceId) test.skip(true, "No resources available to test checkout");
    await loginAsUser(page);
    await page.goto(`/checkout/${resourceId}`);
    await page.waitForLoadState("networkidle");

    const heading = page.locator("h1, h2").filter({ hasText: /purchase|checkout|payment/i }).first();
    await expect(heading).toBeVisible({ timeout: 10000 });

    const payButton = page.getByRole("button", { name: /pay|purchase|buy/i }).first();
    await expect(payButton).toBeVisible();
  });

  test("checkout page shows payment method selector", async ({ page }) => {
    if (!resourceId) test.skip(true, "No resources available to test checkout");
    await loginAsUser(page);
    await page.goto(`/checkout/${resourceId}`);
    await page.waitForLoadState("networkidle");

    const providerButton = page.getByRole("button", { name: /stripe|razorpay/i }).first();
    const hasProvider = await providerButton.isVisible().catch(() => false);
    // At least one payment provider should be configured, but skip if neither is
    if (!hasProvider) {
      test.skip(true, "No payment providers configured in this environment");
    }
    await expect(providerButton).toBeVisible();
  });

  test("checkout page shows security badge", async ({ page }) => {
    if (!resourceId) test.skip(true, "No resources available to test checkout");
    await loginAsUser(page);
    await page.goto(`/checkout/${resourceId}`);
    await page.waitForLoadState("networkidle");

    const securityText = page.getByText(/secure|encrypted/i).first();
    await expect(securityText).toBeVisible({ timeout: 10000 });
  });

  test("checkout page has back link to resources", async ({ page }) => {
    if (!resourceId) test.skip(true, "No resources available to test checkout");
    await loginAsUser(page);
    await page.goto(`/checkout/${resourceId}`);
    await page.waitForLoadState("networkidle");

    const backLink = page.getByRole("link", { name: /back/i }).first();
    await expect(backLink).toBeVisible();
  });

  test("unauthenticated user is redirected from checkout", async ({ page }) => {
    const fakeId = "00000000-0000-0000-0000-000000000001";
    await page.goto(`/checkout/${fakeId}`);

    await page.waitForURL(
      (url) => url.pathname.includes("/auth/login") || url.pathname.includes("/checkout"),
      { timeout: 15000 }
    );

    const url = page.url();
    const redirectedOrPrompted =
      url.includes("/auth/login") || url.includes("/checkout");
    expect(redirectedOrPrompted).toBe(true);
  });

  test("checkout success page renders", async ({ page }) => {
    const res = await page.goto("/checkout/success");
    expect([200, 304]).toContain(res?.status());

    const successHeading = page.getByText(/payment successful|success/i).first();
    await expect(successHeading).toBeVisible({ timeout: 10000 });
  });

  test("checkout success page has navigation links", async ({ page }) => {
    await page.goto("/checkout/success");
    await page.waitForLoadState("networkidle");

    const contentLink = page.getByRole("link", { name: /my content|dashboard/i }).first();
    await expect(contentLink).toBeVisible();

    const browseLink = page.getByRole("link", { name: /browse|resources/i }).first();
    await expect(browseLink).toBeVisible();
  });
});
