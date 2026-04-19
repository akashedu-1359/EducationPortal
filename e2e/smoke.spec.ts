/**
 * Smoke tests — run after every deployment to confirm nothing is broken.
 * Fast, minimal, no auth required for most checks.
 */
import { test, expect, request } from "@playwright/test";

const API = process.env.PLAYWRIGHT_API_URL || "http://localhost:5000";

test("health: frontend returns 200", async ({ page }) => {
  const res = await page.goto("/");
  expect(res?.status()).toBe(200);
});

test("health: backend API is reachable", async () => {
  const ctx = await request.newContext({ baseURL: API });
  const res = await ctx.get("/api/health");
  expect(res.status()).toBe(200);
  await ctx.dispose();
});

test("homepage renders without crash", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("main")).toBeVisible();
  await expect(page.locator("nav")).toBeVisible();
});

test("resources page renders", async ({ page }) => {
  await page.goto("/resources");
  await expect(page).not.toHaveURL(/error/);
  await expect(page.locator("main")).toBeVisible();
});

test("login page renders", async ({ page }) => {
  await page.goto("/auth/login");
  await expect(page.getByPlaceholder(/email/i)).toBeVisible();
});

test("register page renders", async ({ page }) => {
  await page.goto("/auth/register");
  await expect(page.getByPlaceholder(/email/i)).toBeVisible();
});

test("unauthenticated redirect: /dashboard → /auth/login", async ({ page }) => {
  await page.goto("/dashboard");
  await expect(page).toHaveURL(/auth\/login/);
});
