# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: 05-admin.spec.ts >> Admin Panel >> create and delete a category
- Location: e2e\05-admin.spec.ts:27:7

# Error details

```
Error: locator.fill: Page crashed
Call log:
  - waiting for getByPlaceholder(/email/i)

```

# Test source

```ts
  1  | import { Page } from "@playwright/test";
  2  | 
  3  | export async function loginAs(page: Page, email: string, password: string) {
  4  |   await page.goto("/auth/login");
> 5  |   await page.getByPlaceholder(/email/i).fill(email);
     |                                         ^ Error: locator.fill: Page crashed
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