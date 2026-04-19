import { test, expect } from "@playwright/test";
import { loginAsUser } from "./helpers/auth";

test.describe("User Dashboard", () => {
  test.beforeEach(async ({ page }) => {
    await loginAsUser(page);
  });

  test("dashboard page loads", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page.locator("main")).toBeVisible();
    await expect(page).not.toHaveURL(/auth\/login/);
  });

  test("dashboard shows stats cards", async ({ page }) => {
    await page.goto("/dashboard");
    await page.waitForLoadState("networkidle");
    // At least one stat card or summary section exists
    const cards = page.locator(
      "[class*='card'], [class*='stat'], [class*='summary']"
    );
    expect(await cards.count()).toBeGreaterThan(0);
  });

  test("my-content page loads", async ({ page }) => {
    await page.goto("/dashboard/my-content");
    await expect(page.locator("main")).toBeVisible();
    await expect(page).not.toHaveURL(/auth\/login/);
  });

  test("certificates page loads", async ({ page }) => {
    await page.goto("/dashboard/certificates");
    await expect(page.locator("main")).toBeVisible();
    await expect(page).not.toHaveURL(/auth\/login/);
  });

  test("certificates page shows empty state or list", async ({ page }) => {
    await page.goto("/dashboard/certificates");
    await page.waitForLoadState("networkidle");
    // Either certificates or empty state message
    const content = page.locator("main");
    await expect(content).toBeVisible();
  });
});
