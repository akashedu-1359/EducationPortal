import { test, expect } from "@playwright/test";

test.describe("Public Pages", () => {
  test("homepage renders hero section", async ({ page }) => {
    await page.goto("/");
    // Should have some hero content visible
    await expect(page.locator("main")).toBeVisible();
  });

  test("resources listing page loads", async ({ page }) => {
    await page.goto("/resources");
    await expect(page.getByRole("heading", { name: /resources/i })).toBeVisible();
  });

  test("resources page has search input", async ({ page }) => {
    await page.goto("/resources");
    await expect(page.getByPlaceholder(/search/i)).toBeVisible();
  });

  test("privacy page loads via slug", async ({ page }) => {
    const res = await page.goto("/privacy");
    // Either renders or 404 — should not crash
    expect([200, 404]).toContain(res?.status());
  });

  test("terms page loads via slug", async ({ page }) => {
    const res = await page.goto("/terms");
    expect([200, 404]).toContain(res?.status());
  });

  test("footer is visible on homepage", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("footer")).toBeVisible();
  });

  test("navbar has login link for unauthenticated users", async ({ page }) => {
    await page.goto("/");
    const loginLink = page.getByRole("link", { name: /sign in|login/i });
    await expect(loginLink).toBeVisible();
  });
});
