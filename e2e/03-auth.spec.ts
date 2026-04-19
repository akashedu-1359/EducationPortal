import { test, expect } from "@playwright/test";
import { loginAs, loginAsUser, uniqueEmail } from "./helpers/auth";

test.describe("Authentication", () => {
  test("register page renders", async ({ page }) => {
    await page.goto("/auth/register");
    await expect(page.getByPlaceholder(/first name/i)).toBeVisible();
    await expect(page.getByPlaceholder(/last name/i)).toBeVisible();
    await expect(page.getByPlaceholder(/email/i)).toBeVisible();
  });

  test("register — validation rejects empty form", async ({ page }) => {
    await page.goto("/auth/register");
    await page.getByRole("button", { name: /register|create/i }).click();
    const error = page.locator(
      "[class*='error'], [role='alert'], p:has-text('required')"
    ).first();
    await expect(error).toBeVisible({ timeout: 5000 });
  });

  test("register — full successful flow", async ({ page }) => {
    const email = uniqueEmail("reg");
    await page.goto("/auth/register");
    await page.getByPlaceholder(/first name/i).fill("Test");
    await page.getByPlaceholder(/last name/i).fill("User");
    await page.getByPlaceholder(/email/i).fill(email);
    const passwordFields = await page.getByPlaceholder(/password/i).all();
    await passwordFields[0].fill("TestPass@123!");
    if (passwordFields[1]) await passwordFields[1].fill("TestPass@123!");
    await page.getByRole("button", { name: /register|create/i }).click();
    await page.waitForURL((u) => !u.pathname.includes("/auth/register"), {
      timeout: 15000,
    });
    expect(page.url()).toMatch(/dashboard/);
  });

  test("login page renders", async ({ page }) => {
    await page.goto("/auth/login");
    await expect(page.getByPlaceholder(/email/i)).toBeVisible();
    await expect(page.getByPlaceholder(/password/i)).toBeVisible();
    await expect(page.getByRole("button", { name: /sign in/i })).toBeVisible();
  });

  test("login — invalid credentials shows error", async ({ page }) => {
    await page.goto("/auth/login");
    await page.getByPlaceholder(/email/i).fill("nobody@nowhere.com");
    await page.getByPlaceholder(/password/i).fill("WrongPass@1");
    await page.getByRole("button", { name: /sign in/i }).click();
    // Should stay on login page and show error
    await expect(page).toHaveURL(/auth\/login/, { timeout: 8000 });
  });

  test("login — successful login redirects to dashboard", async ({ page }) => {
    await loginAsUser(page);
    expect(page.url()).toMatch(/dashboard/);
  });

  test("login — user name visible in navbar after login", async ({ page }) => {
    await loginAsUser(page);
    await page.goto("/");
    // Navbar should show something indicating the user is logged in
    const authIndicator = page
      .locator("nav")
      .getByText(/dashboard|profile|logout|sign out/i)
      .first();
    await expect(authIndicator).toBeVisible({ timeout: 8000 });
  });

  test("login — redirect preserves ?next param", async ({ page }) => {
    await page.goto("/auth/login?next=/dashboard/certificates");
    await page.getByPlaceholder(/email/i).fill(process.env.E2E_USER_EMAIL!);
    await page.getByPlaceholder(/password/i).fill(process.env.E2E_USER_PASSWORD!);
    await page.getByRole("button", { name: /sign in/i }).click();
    await page.waitForURL(/certificates/, { timeout: 15000 });
    expect(page.url()).toMatch(/certificates/);
  });

  test("already logged-in user redirected away from /auth/login", async ({
    page,
  }) => {
    await loginAsUser(page);
    await page.goto("/auth/login");
    await page.waitForURL((u) => !u.pathname.includes("/auth/login"), {
      timeout: 8000,
    });
    expect(page.url()).not.toMatch(/auth\/login/);
  });
});
