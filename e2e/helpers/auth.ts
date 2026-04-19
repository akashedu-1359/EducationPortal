import { Page } from "@playwright/test";

export async function loginAs(page: Page, email: string, password: string) {
  await page.goto("/auth/login");
  await page.getByPlaceholder(/email/i).fill(email);
  await page.getByPlaceholder(/password/i).fill(password);
  await page.getByRole("button", { name: /sign in/i }).click();
  await page.waitForURL((url) => !url.pathname.includes("/auth/login"), {
    timeout: 15000,
  });
}

export async function loginAsAdmin(page: Page) {
  await loginAs(
    page,
    process.env.E2E_ADMIN_EMAIL!,
    process.env.E2E_ADMIN_PASSWORD!
  );
}

export async function loginAsUser(page: Page) {
  await loginAs(
    page,
    process.env.E2E_USER_EMAIL!,
    process.env.E2E_USER_PASSWORD!
  );
}

export function uniqueEmail(prefix = "e2e") {
  return `${prefix}+${Date.now()}@mailtest.dev`;
}
