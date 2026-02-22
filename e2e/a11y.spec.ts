import { test, expect } from "@playwright/test";

test.describe("Accessibility", () => {
  test("skip-to-content link is present and focusable", async ({ page }) => {
    await page.goto("/");
    // Tab once from start of page
    await page.keyboard.press("Tab");
    const skipLink = page.locator("a[href='#main-content']");
    await expect(skipLink).toBeFocused();
  });

  test("login page form has labelled inputs", async ({ page }) => {
    await page.goto("/auth/login");
    // All inputs should have associated labels
    const emailInput = page.getByLabel(/email/i);
    const passwordInput = page.getByLabel(/password/i);
    await expect(emailInput).toBeVisible();
    await expect(passwordInput).toBeVisible();
  });

  test("homepage has proper heading hierarchy", async ({ page }) => {
    await page.goto("/");
    const h1s = page.locator("h1");
    await expect(h1s).toHaveCount(1); // Only one h1 per page
  });

  test("resources page has main landmark", async ({ page }) => {
    await page.goto("/resources");
    await expect(page.locator("main, [role='main']")).toBeVisible();
  });

  test("nav links are keyboard accessible", async ({ page }) => {
    await page.goto("/");
    // Tab to nav links
    await page.keyboard.press("Tab");
    await page.keyboard.press("Tab");
    const focused = page.locator(":focus");
    const tagName = await focused.evaluate((el) => el.tagName.toLowerCase());
    expect(["a", "button"]).toContain(tagName);
  });

  test("page title is set", async ({ page }) => {
    await page.goto("/");
    const title = await page.title();
    expect(title).toBeTruthy();
    expect(title).not.toBe("");
  });

  test("login page title is set", async ({ page }) => {
    await page.goto("/auth/login");
    const title = await page.title();
    expect(title).toContain("EduPortal");
  });
});
