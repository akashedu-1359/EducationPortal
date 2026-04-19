import { test, expect, request } from "@playwright/test";

const API = process.env.PLAYWRIGHT_API_URL || "http://localhost:5000";

test.describe("Health & Connectivity", () => {
  test("frontend loads and returns 200", async ({ page }) => {
    const res = await page.goto("/");
    expect(res?.status()).toBe(200);
  });

  test("page title contains EduPortal", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/EduPortal/i);
  });

  test("backend health endpoint returns healthy", async () => {
    const ctx = await request.newContext({ baseURL: API });
    const res = await ctx.get("/api/health");
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.status ?? body.Status).toMatch(/healthy|ok/i);
    await ctx.dispose();
  });

  test("navbar is visible", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("nav")).toBeVisible();
  });

  test("footer is visible", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator("footer")).toBeVisible();
  });

  test("no console errors on homepage", async ({ page }) => {
    const errors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") errors.push(msg.text());
    });
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    const critical = errors.filter(
      (e) => !e.includes("favicon") && !e.includes("hydrat")
    );
    expect(critical).toHaveLength(0);
  });
});
