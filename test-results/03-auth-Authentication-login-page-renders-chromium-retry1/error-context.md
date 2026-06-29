# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: 03-auth.spec.ts >> Authentication >> login page renders
- Location: e2e\03-auth.spec.ts:37:7

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByPlaceholder(/email/i)
Expected: visible
Timeout: 10000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" with timeout 10000ms
  - waiting for getByPlaceholder(/email/i)

```

```yaml
- link "Skip to main content":
  - /url: "#main-content"
- link "EduPortal":
  - /url: /
  - img
  - text: EduPortal
- heading "Learn without limits." [level=1]
- paragraph: Access premium courses, PDFs, and blog articles. Take exams and earn verifiable certificates.
- paragraph: “EduPortal transformed how I learn. The content quality is outstanding, and the certificate I earned opened doors for me.”
- text: AS
- paragraph: Arjun Sharma
- paragraph: Software Engineer
- paragraph: © 2026 EduPortal. All rights reserved.
- heading "Welcome back" [level=1]
- paragraph: Sign in to continue learning
- button "Continue with Google"
- text: OR Email address
- img
- textbox "Email address":
  - /placeholder: you@example.com
- text: Password
- img
- textbox "Password":
  - /placeholder: Enter your password
- button "Show password":
  - img
- link "Forgot password?":
  - /url: /auth/forgot-password
- button "Sign In"
- paragraph:
  - text: Don't have an account?
  - link "Create one free":
    - /url: /auth/register
- alert
```

# Test source

```ts
  1  | import { test, expect } from "@playwright/test";
  2  | import { loginAs, loginAsUser, uniqueEmail } from "./helpers/auth";
  3  | 
  4  | test.describe("Authentication", () => {
  5  |   test("register page renders", async ({ page }) => {
  6  |     await page.goto("/auth/register");
  7  |     await expect(page.getByPlaceholder(/first name/i)).toBeVisible();
  8  |     await expect(page.getByPlaceholder(/last name/i)).toBeVisible();
  9  |     await expect(page.getByPlaceholder(/email/i)).toBeVisible();
  10 |   });
  11 | 
  12 |   test("register — validation rejects empty form", async ({ page }) => {
  13 |     await page.goto("/auth/register");
  14 |     await page.getByRole("button", { name: /register|create/i }).click();
  15 |     const error = page.locator(
  16 |       "[class*='error'], [role='alert'], p:has-text('required')"
  17 |     ).first();
  18 |     await expect(error).toBeVisible({ timeout: 5000 });
  19 |   });
  20 | 
  21 |   test("register — full successful flow", async ({ page }) => {
  22 |     const email = uniqueEmail("reg");
  23 |     await page.goto("/auth/register");
  24 |     await page.getByPlaceholder(/first name/i).fill("Test");
  25 |     await page.getByPlaceholder(/last name/i).fill("User");
  26 |     await page.getByPlaceholder(/email/i).fill(email);
  27 |     const passwordFields = await page.getByPlaceholder(/password/i).all();
  28 |     await passwordFields[0].fill("TestPass@123!");
  29 |     if (passwordFields[1]) await passwordFields[1].fill("TestPass@123!");
  30 |     await page.getByRole("button", { name: /register|create/i }).click();
  31 |     await page.waitForURL((u) => !u.pathname.includes("/auth/register"), {
  32 |       timeout: 15000,
  33 |     });
  34 |     expect(page.url()).toMatch(/dashboard/);
  35 |   });
  36 | 
  37 |   test("login page renders", async ({ page }) => {
  38 |     await page.goto("/auth/login");
> 39 |     await expect(page.getByPlaceholder(/email/i)).toBeVisible();
     |                                                   ^ Error: expect(locator).toBeVisible() failed
  40 |     await expect(page.getByPlaceholder(/password/i)).toBeVisible();
  41 |     await expect(page.getByRole("button", { name: /sign in/i })).toBeVisible();
  42 |   });
  43 | 
  44 |   test("login — invalid credentials shows error", async ({ page }) => {
  45 |     await page.goto("/auth/login");
  46 |     await page.getByPlaceholder(/email/i).fill("nobody@nowhere.com");
  47 |     await page.getByPlaceholder(/password/i).fill("WrongPass@1");
  48 |     await page.getByRole("button", { name: /sign in/i }).click();
  49 |     // Should stay on login page and show error
  50 |     await expect(page).toHaveURL(/auth\/login/, { timeout: 8000 });
  51 |   });
  52 | 
  53 |   test("login — successful login redirects to dashboard", async ({ page }) => {
  54 |     await loginAsUser(page);
  55 |     expect(page.url()).toMatch(/dashboard/);
  56 |   });
  57 | 
  58 |   test("login — user name visible in navbar after login", async ({ page }) => {
  59 |     await loginAsUser(page);
  60 |     await page.goto("/");
  61 |     // Navbar should show something indicating the user is logged in
  62 |     const authIndicator = page
  63 |       .locator("nav")
  64 |       .getByText(/dashboard|profile|logout|sign out/i)
  65 |       .first();
  66 |     await expect(authIndicator).toBeVisible({ timeout: 8000 });
  67 |   });
  68 | 
  69 |   test("login — redirect preserves ?next param", async ({ page }) => {
  70 |     await page.goto("/auth/login?next=/dashboard/certificates");
  71 |     await page.getByPlaceholder(/email/i).fill(process.env.E2E_USER_EMAIL!);
  72 |     await page.getByPlaceholder(/password/i).fill(process.env.E2E_USER_PASSWORD!);
  73 |     await page.getByRole("button", { name: /sign in/i }).click();
  74 |     await page.waitForURL(/certificates/, { timeout: 15000 });
  75 |     expect(page.url()).toMatch(/certificates/);
  76 |   });
  77 | 
  78 |   test("already logged-in user redirected away from /auth/login", async ({
  79 |     page,
  80 |   }) => {
  81 |     await loginAsUser(page);
  82 |     await page.goto("/auth/login");
  83 |     await page.waitForURL((u) => !u.pathname.includes("/auth/login"), {
  84 |       timeout: 8000,
  85 |     });
  86 |     expect(page.url()).not.toMatch(/auth\/login/);
  87 |   });
  88 | });
  89 | 
```