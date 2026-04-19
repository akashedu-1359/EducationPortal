import { test as setup, expect } from "@playwright/test";
import { uniqueEmail } from "../helpers/auth";

/**
 * Runs once before all tests.
 * Creates the E2E test user account if E2E_USER_EMAIL is not already set.
 */
setup("create test user account", async ({ page }) => {
  // If credentials already provided, verify they work
  if (process.env.E2E_USER_EMAIL && process.env.E2E_USER_PASSWORD) {
    await page.goto("/auth/login");
    await page.getByPlaceholder(/email/i).fill(process.env.E2E_USER_EMAIL);
    await page.getByPlaceholder(/password/i).fill(process.env.E2E_USER_PASSWORD);
    await page.getByRole("button", { name: /sign in/i }).click();
    const url = await page.waitForURL(
      (u) => !u.pathname.includes("/auth/login"),
      { timeout: 15000 }
    ).then(() => page.url()).catch(() => null);

    if (url) {
      console.log(`✓ Test user verified: ${process.env.E2E_USER_EMAIL}`);
      return;
    }
    console.warn("⚠ E2E_USER_EMAIL login failed — will register a new account");
  }

  // Register a fresh test user
  const email = uniqueEmail("e2e-user");
  const password = "TestUser@123!";
  const firstName = "E2E";
  const lastName = "Tester";

  await page.goto("/auth/register");
  await page.getByPlaceholder(/first name/i).fill(firstName);
  await page.getByPlaceholder(/last name/i).fill(lastName);
  await page.getByPlaceholder(/email/i).fill(email);

  const passwordFields = await page.getByPlaceholder(/password/i).all();
  await passwordFields[0].fill(password);
  if (passwordFields[1]) await passwordFields[1].fill(password);

  await page.getByRole("button", { name: /register|create/i }).click();
  await page.waitForURL((u) => !u.pathname.includes("/auth/register"), {
    timeout: 15000,
  });

  // Store for test run (written to env so other tests can read)
  process.env.E2E_USER_EMAIL = email;
  process.env.E2E_USER_PASSWORD = password;
  console.log(`✓ Created test user: ${email}`);
});

setup("verify admin account", async ({ page }) => {
  if (!process.env.E2E_ADMIN_EMAIL || !process.env.E2E_ADMIN_PASSWORD) {
    console.warn("⚠ E2E_ADMIN_EMAIL not set — admin tests will be skipped");
    return;
  }

  await page.goto("/auth/login");
  await page.getByPlaceholder(/email/i).fill(process.env.E2E_ADMIN_EMAIL);
  await page.getByPlaceholder(/password/i).fill(process.env.E2E_ADMIN_PASSWORD);
  await page.getByRole("button", { name: /sign in/i }).click();
  await page.waitForURL((u) => !u.pathname.includes("/auth/login"), {
    timeout: 15000,
  });
  console.log(`✓ Admin account verified: ${process.env.E2E_ADMIN_EMAIL}`);
});
