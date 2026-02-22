import { test, expect } from "@playwright/test";
import { loginAsAdmin } from "./helpers/auth";

// These tests require a running backend API + seeded admin account
// Set E2E_ADMIN_EMAIL and E2E_ADMIN_PASSWORD env vars
test.describe("Admin Panel (requires auth)", () => {
  test.skip(
    !process.env.E2E_ADMIN_EMAIL,
    "Skipping admin tests — E2E_ADMIN_EMAIL not set"
  );

  test.beforeEach(async ({ page }) => {
    await loginAsAdmin(page);
  });

  test("admin dashboard loads", async ({ page }) => {
    await page.goto("/admin");
    await expect(page.getByRole("heading", { name: /dashboard/i })).toBeVisible();
  });

  test("admin resources page loads", async ({ page }) => {
    await page.goto("/admin/resources");
    await expect(page.getByRole("heading", { name: /resources/i })).toBeVisible();
  });

  test("admin users page loads", async ({ page }) => {
    await page.goto("/admin/users");
    await expect(page.getByRole("heading", { name: /user management/i })).toBeVisible();
  });

  test("admin exams page loads", async ({ page }) => {
    await page.goto("/admin/exams");
    await expect(page.getByRole("heading", { name: /exams/i })).toBeVisible();
  });

  test("admin analytics page loads", async ({ page }) => {
    await page.goto("/admin/analytics");
    await expect(page.getByRole("heading", { name: /analytics/i })).toBeVisible();
  });
});
