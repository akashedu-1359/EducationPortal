import { test, expect } from "@playwright/test";
import { loginAsAdmin } from "./helpers/auth";

const MOBILE_VIEWPORT = { width: 375, height: 812 }; // iPhone X
const TABLET_VIEWPORT = { width: 768, height: 1024 }; // iPad

/**
 * Responsive layout E2E tests.
 * These verify that key pages adapt correctly to mobile and tablet viewports.
 */
test.describe("Responsive Layout", () => {
  // ── Mobile: Navbar ──────────────────────────────────────────────────────────

  test("mobile: hamburger menu button is visible", async ({ page }) => {
    await page.setViewportSize(MOBILE_VIEWPORT);
    await page.goto("/");

    const hamburger = page.getByLabel(/toggle menu/i);
    await expect(hamburger).toBeVisible({ timeout: 10000 });
  });

  test("mobile: hamburger menu opens and shows links", async ({ page }) => {
    await page.setViewportSize(MOBILE_VIEWPORT);
    await page.goto("/");

    const hamburger = page.getByLabel(/toggle menu/i);
    await hamburger.click();

    // Mobile menu should now be visible with sign-in / get-started links
    const mobileMenu = page.locator(".md\\:hidden").last();
    await expect(mobileMenu).toBeVisible({ timeout: 5000 });

    const signInLink = mobileMenu
      .getByRole("link", { name: /sign in|login/i })
      .or(mobileMenu.getByRole("button", { name: /sign in|login/i }))
      .first();
    await expect(signInLink).toBeVisible();
  });

  test("mobile: hamburger menu closes on toggle", async ({ page }) => {
    await page.setViewportSize(MOBILE_VIEWPORT);
    await page.goto("/");

    const hamburger = page.getByLabel(/toggle menu/i);
    await hamburger.click();

    // Menu should be open
    const mobileMenu = page.locator(".md\\:hidden").last();
    await expect(mobileMenu).toBeVisible({ timeout: 5000 });

    // Click again to close
    await hamburger.click();

    // The mobile menu panel should be hidden (the md:hidden toggle button remains)
    await expect(
      page.locator("[class*='border-t'][class*='md:hidden']")
    ).not.toBeVisible({ timeout: 5000 });
  });

  test("mobile: desktop nav links are hidden", async ({ page }) => {
    await page.setViewportSize(MOBILE_VIEWPORT);
    await page.goto("/");

    // Desktop sign-in / get-started buttons (wrapped in sm:flex) should be hidden
    const desktopAuth = page.locator(".sm\\:flex").filter({
      has: page.getByRole("link", { name: /sign in/i }),
    });

    const isHidden = await desktopAuth.isHidden().catch(() => true);
    expect(isHidden).toBe(true);
  });

  // ── Mobile: Homepage Layout ─────────────────────────────────────────────────

  test("mobile: homepage renders without horizontal overflow", async ({
    page,
  }) => {
    await page.setViewportSize(MOBILE_VIEWPORT);
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
    expect(bodyWidth).toBeLessThanOrEqual(MOBILE_VIEWPORT.width + 1);
  });

  test("mobile: homepage main content is visible", async ({ page }) => {
    await page.setViewportSize(MOBILE_VIEWPORT);
    await page.goto("/");

    await expect(page.locator("main")).toBeVisible();
    await expect(page.locator("nav")).toBeVisible();
    await expect(page.locator("footer")).toBeVisible();
  });

  test("mobile: homepage hero CTA is accessible", async ({ page }) => {
    await page.setViewportSize(MOBILE_VIEWPORT);
    await page.goto("/");

    const cta = page
      .getByRole("link", { name: /browse|get started|learn|explore/i })
      .first();
    await expect(cta).toBeVisible({ timeout: 10000 });
  });

  // ── Mobile: Resources Page Layout ──────────────────────────────────────────

  test("mobile: resources page renders correctly", async ({ page }) => {
    await page.setViewportSize(MOBILE_VIEWPORT);
    await page.goto("/resources");

    await expect(page.locator("main")).toBeVisible();
    await expect(page.getByPlaceholder(/search/i)).toBeVisible();
  });

  test("mobile: resources page has no horizontal overflow", async ({
    page,
  }) => {
    await page.setViewportSize(MOBILE_VIEWPORT);
    await page.goto("/resources");
    await page.waitForLoadState("networkidle");

    const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
    expect(bodyWidth).toBeLessThanOrEqual(MOBILE_VIEWPORT.width + 1);
  });

  test("mobile: resources search input is full-width accessible", async ({
    page,
  }) => {
    await page.setViewportSize(MOBILE_VIEWPORT);
    await page.goto("/resources");

    const searchInput = page.getByPlaceholder(/search/i);
    await expect(searchInput).toBeVisible();

    const box = await searchInput.boundingBox();
    if (box) {
      // Search input should take a reasonable portion of the viewport width
      expect(box.width).toBeGreaterThan(MOBILE_VIEWPORT.width * 0.4);
    }
  });

  // ── Tablet: General Layout ────────────────────────────────────────────────

  test("tablet: homepage renders without overflow", async ({ page }) => {
    await page.setViewportSize(TABLET_VIEWPORT);
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
    expect(bodyWidth).toBeLessThanOrEqual(TABLET_VIEWPORT.width + 1);
  });

  test("tablet: navbar is visible and functional", async ({ page }) => {
    await page.setViewportSize(TABLET_VIEWPORT);
    await page.goto("/");

    await expect(page.locator("nav")).toBeVisible();
    // At 768px (md breakpoint), the hamburger should still be visible
    const hamburger = page.getByLabel(/toggle menu/i);
    const isVisible = await hamburger.isVisible().catch(() => false);

    // On tablet, either desktop nav or hamburger should be usable
    if (isVisible) {
      await hamburger.click();
      const mobileMenu = page.locator(".md\\:hidden").last();
      await expect(mobileMenu).toBeVisible({ timeout: 5000 });
    } else {
      // Desktop nav should be visible instead
      const desktopNav = page.locator("nav");
      await expect(desktopNav).toBeVisible();
    }
  });

  // ── Tablet: Admin sidebar (if applicable) ──────────────────────────────────

  test("tablet: admin sidebar adapts to viewport", async ({ page }) => {
    const hasAdmin =
      !!process.env.E2E_ADMIN_EMAIL && !!process.env.E2E_ADMIN_PASSWORD;
    if (!hasAdmin) test.skip(true, "E2E_ADMIN_EMAIL not configured");

    await page.setViewportSize(TABLET_VIEWPORT);
    await loginAsAdmin(page);
    await page.goto("/admin");

    await expect(page.locator("main")).toBeVisible();
    // Admin page should not have horizontal overflow on tablet
    const bodyWidth = await page.evaluate(() => document.body.scrollWidth);
    expect(bodyWidth).toBeLessThanOrEqual(TABLET_VIEWPORT.width + 1);
  });

  // ── Desktop: Verify normal layout ─────────────────────────────────────────

  test("desktop: hamburger menu is hidden", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto("/");

    const hamburger = page.getByLabel(/toggle menu/i);
    const isHidden = await hamburger.isHidden().catch(() => true);
    expect(isHidden).toBe(true);
  });

  test("desktop: sign-in and get-started buttons are visible", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto("/");

    const signIn = page.getByRole("link", { name: /sign in/i }).first();
    await expect(signIn).toBeVisible();

    const getStarted = page
      .getByRole("link", { name: /get started/i })
      .first();
    await expect(getStarted).toBeVisible();
  });
});
