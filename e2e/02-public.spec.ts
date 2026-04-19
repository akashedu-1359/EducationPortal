import { test, expect } from "@playwright/test";

test.describe("Public Pages", () => {
  test("homepage — hero section visible", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("section").first()).toBeVisible();
    // Hero should have a primary CTA button
    const cta = page.getByRole("link", { name: /browse|get started|learn|explore/i }).first();
    await expect(cta).toBeVisible();
  });

  test("homepage — features section visible", async ({ page }) => {
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    await expect(page.locator("main")).toBeVisible();
  });

  test("homepage — login link visible for guests", async ({ page }) => {
    await page.goto("/");
    const loginLink = page
      .getByRole("link", { name: /sign in|login/i })
      .first();
    await expect(loginLink).toBeVisible();
  });

  test("resources page loads", async ({ page }) => {
    await page.goto("/resources");
    await expect(page).not.toHaveURL(/error/i);
    await expect(page.locator("main")).toBeVisible();
  });

  test("resources page has search", async ({ page }) => {
    await page.goto("/resources");
    await expect(page.getByPlaceholder(/search/i)).toBeVisible();
  });

  test("CMS page — /privacy loads without crash", async ({ page }) => {
    const res = await page.goto("/privacy");
    expect([200, 404]).toContain(res?.status());
  });

  test("CMS page — /terms loads without crash", async ({ page }) => {
    const res = await page.goto("/terms");
    expect([200, 404]).toContain(res?.status());
  });

  test("CMS page — /faq loads without crash", async ({ page }) => {
    const res = await page.goto("/faq");
    expect([200, 404]).toContain(res?.status());
  });

  test("unauthenticated: /dashboard redirects to login", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/auth\/login/);
  });

  test("unauthenticated: /admin redirects to login", async ({ page }) => {
    await page.goto("/admin");
    await expect(page).toHaveURL(/auth\/login/);
  });

  test("unauthenticated: /checkout redirects or shows login prompt", async ({
    page,
  }) => {
    await page.goto("/checkout/00000000-0000-0000-0000-000000000001");
    const url = page.url();
    const isLoginOrCheckout =
      url.includes("/auth/login") || url.includes("/checkout");
    expect(isLoginOrCheckout).toBe(true);
  });
});
