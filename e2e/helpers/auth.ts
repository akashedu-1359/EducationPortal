import { Page } from "@playwright/test";

export async function loginAs(
  page: Page,
  email: string,
  password: string
): Promise<void> {
  await page.goto("/auth/login");
  await page.getByPlaceholder(/email/i).fill(email);
  await page.getByPlaceholder(/password/i).fill(password);
  await page.getByRole("button", { name: /sign in/i }).click();
  // Wait for redirect away from login
  await page.waitForURL((url) => !url.pathname.includes("/auth/login"), {
    timeout: 10000,
  });
}

export async function loginAsAdmin(page: Page): Promise<void> {
  const email = process.env.E2E_ADMIN_EMAIL || "admin@example.com";
  const password = process.env.E2E_ADMIN_PASSWORD || "Admin@123";
  await loginAs(page, email, password);
}

export async function loginAsUser(page: Page): Promise<void> {
  const email = process.env.E2E_USER_EMAIL || "user@example.com";
  const password = process.env.E2E_USER_PASSWORD || "User@123";
  await loginAs(page, email, password);
}
