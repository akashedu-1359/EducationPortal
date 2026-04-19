import { test, expect } from "@playwright/test";
import { loginAsAdmin } from "./helpers/auth";

const SKIP_REASON = "E2E_ADMIN_EMAIL not configured";
const hasAdmin = () =>
  !!process.env.E2E_ADMIN_EMAIL && !!process.env.E2E_ADMIN_PASSWORD;

test.describe("Admin Panel", () => {
  test.beforeEach(async ({ page }) => {
    if (!hasAdmin()) test.skip();
    await loginAsAdmin(page);
  });

  // ── Dashboard ───────────────────────────────────────────────────────────────
  test("admin dashboard loads", async ({ page }) => {
    await page.goto("/admin");
    await expect(page.locator("main")).toBeVisible();
    await expect(page).not.toHaveURL(/auth\/login/);
  });

  // ── Categories ──────────────────────────────────────────────────────────────
  test("categories page loads", async ({ page }) => {
    await page.goto("/admin/categories");
    await expect(page.locator("main")).toBeVisible();
  });

  test("create and delete a category", async ({ page }) => {
    await page.goto("/admin/categories");
    const name = `E2E-Cat-${Date.now()}`;

    // Open create modal/form
    const addBtn = page
      .getByRole("button", { name: /add|new|create/i })
      .first();
    await addBtn.click();

    // Fill name
    await page.getByPlaceholder(/name/i).fill(name);
    await page.getByRole("button", { name: /save|create|submit/i }).last().click();

    // Category should appear in list
    await expect(page.getByText(name)).toBeVisible({ timeout: 8000 });

    // Delete it
    const row = page.locator(`tr:has-text("${name}"), li:has-text("${name}")`);
    const deleteBtn = row.getByRole("button", { name: /delete|remove/i });
    await deleteBtn.click();

    // Confirm if dialog appears
    const confirmBtn = page.getByRole("button", { name: /confirm|yes|delete/i }).last();
    if (await confirmBtn.isVisible()) await confirmBtn.click();

    await expect(page.getByText(name)).not.toBeVisible({ timeout: 8000 });
  });

  // ── Resources ───────────────────────────────────────────────────────────────
  test("admin resources page loads", async ({ page }) => {
    await page.goto("/admin/resources");
    await expect(page.locator("main")).toBeVisible();
  });

  test("navigate to new resource form", async ({ page }) => {
    await page.goto("/admin/resources/new");
    await expect(page.locator("main")).toBeVisible();
    await expect(page).not.toHaveURL(/auth\/login/);
  });

  // ── Exams ────────────────────────────────────────────────────────────────────
  test("admin exams page loads", async ({ page }) => {
    await page.goto("/admin/exams");
    await expect(page.locator("main")).toBeVisible();
  });

  test("admin questions page loads", async ({ page }) => {
    await page.goto("/admin/questions");
    await expect(page.locator("main")).toBeVisible();
  });

  // ── Users ────────────────────────────────────────────────────────────────────
  test("admin users page loads", async ({ page }) => {
    await page.goto("/admin/users");
    await expect(page.locator("main")).toBeVisible();
  });

  test("users list shows at least one user", async ({ page }) => {
    await page.goto("/admin/users");
    await page.waitForLoadState("networkidle");
    const rows = page.locator("table tbody tr, [data-testid='user-row']");
    expect(await rows.count()).toBeGreaterThan(0);
  });

  // ── Analytics ────────────────────────────────────────────────────────────────
  test("analytics page loads", async ({ page }) => {
    await page.goto("/admin/analytics");
    await expect(page.locator("main")).toBeVisible();
  });

  // ── Exam Attempts ─────────────────────────────────────────────────────────────
  test("exam attempts page loads", async ({ page }) => {
    await page.goto("/admin/exam-attempts");
    await expect(page.locator("main")).toBeVisible();
  });

  // ── CMS ──────────────────────────────────────────────────────────────────────
  test("CMS banners page loads", async ({ page }) => {
    await page.goto("/admin/cms/banners");
    await expect(page.locator("main")).toBeVisible();
  });

  test("CMS pages page loads", async ({ page }) => {
    await page.goto("/admin/cms/pages");
    await expect(page.locator("main")).toBeVisible();
  });

  test("CMS FAQs page loads", async ({ page }) => {
    await page.goto("/admin/cms/faqs");
    await expect(page.locator("main")).toBeVisible();
  });

  test("CMS feature flags page loads", async ({ page }) => {
    await page.goto("/admin/cms/feature-flags");
    await expect(page.locator("main")).toBeVisible();
  });

  test("CMS footer page loads", async ({ page }) => {
    await page.goto("/admin/cms/footer");
    await expect(page.locator("main")).toBeVisible();
  });

  test("CMS sections page loads", async ({ page }) => {
    await page.goto("/admin/cms/sections");
    await expect(page.locator("main")).toBeVisible();
  });

  test("CMS settings page loads", async ({ page }) => {
    await page.goto("/admin/cms/settings");
    await expect(page.locator("main")).toBeVisible();
  });

  // ── Access Control ────────────────────────────────────────────────────────────
  test("regular user cannot access admin panel", async ({ page }) => {
    // Log out from admin, log in as regular user
    await page.goto("/");
    if (process.env.E2E_USER_EMAIL) {
      await page.goto("/auth/login");
      await page.getByPlaceholder(/email/i).fill(process.env.E2E_USER_EMAIL);
      await page.getByPlaceholder(/password/i).fill(process.env.E2E_USER_PASSWORD!);
      await page.getByRole("button", { name: /sign in/i }).click();
      await page.waitForURL((u) => !u.pathname.includes("/auth/login"), {
        timeout: 15000,
      });
      await page.goto("/admin");
      // Should redirect away from admin
      await page.waitForURL((u) => !u.pathname.startsWith("/admin"), {
        timeout: 8000,
      });
      expect(page.url()).not.toMatch(/^.*\/admin$/);
    }
  });
});
