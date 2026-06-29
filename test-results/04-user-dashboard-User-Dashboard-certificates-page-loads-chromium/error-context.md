# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: 04-user-dashboard.spec.ts >> User Dashboard >> certificates page loads
- Location: e2e\04-user-dashboard.spec.ts:31:7

# Error details

```
TimeoutError: locator.fill: Timeout 20000ms exceeded.
Call log:
  - waiting for getByPlaceholder(/email/i)

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
        - heading "Welcome back" [level=1] [ref=e27]
        - paragraph [ref=e28]: Sign in to continue learning
      - button "Continue with Google" [ref=e29] [cursor=pointer]:
        - img [ref=e30]
        - text: Continue with Google
      - generic [ref=e37]: OR
      - generic [ref=e39]:
        - generic [ref=e40]:
          - generic [ref=e41]: Email address*
          - generic [ref=e42]:
            - generic:
              - img
            - textbox "Email address" [ref=e43]:
              - /placeholder: you@example.com
        - generic [ref=e44]:
          - generic [ref=e45]: Password*
          - generic [ref=e46]:
            - generic:
              - img
            - textbox "Password" [ref=e47]:
              - /placeholder: Enter your password
            - button "Show password" [ref=e49] [cursor=pointer]:
              - img [ref=e50]
        - link "Forgot password?" [ref=e54] [cursor=pointer]:
          - /url: /auth/forgot-password
        - button "Sign In" [ref=e55] [cursor=pointer]
      - paragraph [ref=e56]:
        - text: Don't have an account?
        - link "Create one free" [ref=e57] [cursor=pointer]:
          - /url: /auth/register
  - alert [ref=e58]
```

# Test source

```ts
  1  | import { Page } from "@playwright/test";
  2  | 
  3  | export async function loginAs(page: Page, email: string, password: string) {
  4  |   await page.goto("/auth/login");
> 5  |   await page.getByPlaceholder(/email/i).fill(email);
     |                                         ^ TimeoutError: locator.fill: Timeout 20000ms exceeded.
  6  |   await page.getByPlaceholder(/password/i).fill(password);
  7  |   await page.getByRole("button", { name: /sign in/i }).click();
  8  |   await page.waitForURL((url) => !url.pathname.includes("/auth/login"), {
  9  |     timeout: 45000,
  10 |   });
  11 | }
  12 | 
  13 | export async function loginAsAdmin(page: Page) {
  14 |   await loginAs(
  15 |     page,
  16 |     process.env.E2E_ADMIN_EMAIL!,
  17 |     process.env.E2E_ADMIN_PASSWORD!
  18 |   );
  19 | }
  20 | 
  21 | export async function loginAsUser(page: Page) {
  22 |   await loginAs(
  23 |     page,
  24 |     process.env.E2E_USER_EMAIL!,
  25 |     process.env.E2E_USER_PASSWORD!
  26 |   );
  27 | }
  28 | 
  29 | export function uniqueEmail(prefix = "e2e") {
  30 |   return `${prefix}+${Date.now()}@mailtest.dev`;
  31 | }
  32 | 
```