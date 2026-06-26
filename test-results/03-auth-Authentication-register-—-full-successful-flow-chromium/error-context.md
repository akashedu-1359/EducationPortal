# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: 03-auth.spec.ts >> Authentication >> register — full successful flow
- Location: e2e\03-auth.spec.ts:21:7

# Error details

```
TimeoutError: locator.fill: Timeout 20000ms exceeded.
Call log:
  - waiting for getByPlaceholder(/first name/i)

```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - link "Skip to main content" [ref=e2] [cursor=pointer]:
    - /url: "#main-content"
  - generic [ref=e4]:
    - generic [ref=e5]:
      - link "EduPortal" [ref=e6] [cursor=pointer]:
        - /url: /
        - img [ref=e8]
        - generic [ref=e11]: EduPortal
      - generic [ref=e12]:
        - heading "Learn without limits." [level=1] [ref=e13]:
          - text: Learn without
          - text: limits.
        - paragraph [ref=e14]: Access premium courses, PDFs, and blog articles. Take exams and earn verifiable certificates.
        - generic [ref=e15]:
          - paragraph [ref=e16]: “EduPortal transformed how I learn. The content quality is outstanding, and the certificate I earned opened doors for me.”
          - generic [ref=e17]:
            - generic [ref=e18]: AS
            - generic [ref=e19]:
              - paragraph [ref=e20]: Arjun Sharma
              - paragraph [ref=e21]: Software Engineer
      - paragraph [ref=e22]: © 2026 EduPortal. All rights reserved.
    - generic [ref=e25]:
      - generic [ref=e26]:
        - heading "Create your account" [level=1] [ref=e27]
        - paragraph [ref=e28]: Start learning for free today
      - generic [ref=e29]:
        - generic [ref=e30]:
          - generic [ref=e31]:
            - generic [ref=e32]: First name*
            - generic [ref=e33]:
              - generic:
                - img
              - textbox "First name" [ref=e34]:
                - /placeholder: John
          - generic [ref=e35]:
            - generic [ref=e36]: Last name*
            - textbox "Last name" [ref=e38]:
              - /placeholder: Doe
        - generic [ref=e39]:
          - generic [ref=e40]: Email address*
          - generic [ref=e41]:
            - generic:
              - img
            - textbox "Email address" [ref=e42]:
              - /placeholder: you@example.com
        - generic [ref=e43]:
          - generic [ref=e44]: Password*
          - generic [ref=e45]:
            - generic:
              - img
            - textbox "Password" [ref=e46]:
              - /placeholder: Min. 8 characters
            - button "Show password" [ref=e48] [cursor=pointer]:
              - img [ref=e49]
          - paragraph [ref=e52]: Must contain uppercase, lowercase, and a number
        - generic [ref=e53]:
          - generic [ref=e54]: Confirm password*
          - generic [ref=e55]:
            - generic:
              - img
            - textbox "Confirm password" [ref=e56]:
              - /placeholder: Repeat your password
            - button "Show password" [ref=e58] [cursor=pointer]:
              - img [ref=e59]
        - paragraph [ref=e62]:
          - text: By creating an account you agree to our
          - link "Terms of Service" [ref=e63] [cursor=pointer]:
            - /url: /terms
          - text: and
          - link "Privacy Policy" [ref=e64] [cursor=pointer]:
            - /url: /privacy
          - text: .
        - button "Create Account" [ref=e65] [cursor=pointer]
      - paragraph [ref=e66]:
        - text: Already have an account?
        - link "Sign in" [ref=e67] [cursor=pointer]:
          - /url: /auth/login
  - alert [ref=e68]
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
> 24 |     await page.getByPlaceholder(/first name/i).fill("Test");
     |                                                ^ TimeoutError: locator.fill: Timeout 20000ms exceeded.
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
  39 |     await expect(page.getByPlaceholder(/email/i)).toBeVisible();
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