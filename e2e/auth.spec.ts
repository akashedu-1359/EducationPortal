import { test, expect } from "@playwright/test";

test.describe("Authentication", () => {
  test("homepage loads and shows navbar", async ({ page }) => {
    await page.goto("/");
    await expect(page).toHaveTitle(/EduPortal/i);
    await expect(page.locator("nav")).toBeVisible();
  });

  test("login page renders form", async ({ page }) => {
    await page.goto("/auth/login");
    await expect(page.getByRole("heading", { name: /sign in/i })).toBeVisible();
    await expect(page.getByPlaceholder(/email/i)).toBeVisible();
    await expect(page.getByPlaceholder(/password/i)).toBeVisible();
    await expect(page.getByRole("button", { name: /sign in/i })).toBeVisible();
  });

  test("register page renders form", async ({ page }) => {
    await page.goto("/auth/register");
    await expect(page.getByRole("heading", { name: /create account/i })).toBeVisible();
    await expect(page.getByPlaceholder(/first name/i)).toBeVisible();
    await expect(page.getByPlaceholder(/email/i)).toBeVisible();
  });

  test("login validates empty form", async ({ page }) => {
    await page.goto("/auth/login");
    await page.getByRole("button", { name: /sign in/i }).click();
    // Validation errors should appear
    await expect(page.locator("text=required").or(page.locator("[role='alert']"))).toBeVisible();
  });

  test("login with invalid credentials shows error", async ({ page }) => {
    await page.goto("/auth/login");
    await page.getByPlaceholder(/email/i).fill("invalid@example.com");
    await page.getByPlaceholder(/password/i).fill("wrongpassword");
    await page.getByRole("button", { name: /sign in/i }).click();
    // Should show error toast or inline error
    await expect(
      page.locator(".react-hot-toast, [role='alert'], text=/invalid|incorrect|wrong/i")
    ).toBeVisible({ timeout: 5000 });
  });

  test("unauthenticated user is redirected from dashboard", async ({ page }) => {
    await page.goto("/dashboard");
    await expect(page).toHaveURL(/auth\/login/);
  });

  test("unauthenticated user is redirected from admin", async ({ page }) => {
    await page.goto("/admin");
    await expect(page).toHaveURL(/auth\/login/);
  });
});
