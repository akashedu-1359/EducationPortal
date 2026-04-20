import { test as setup, expect, request } from "@playwright/test";
import { uniqueEmail } from "../helpers/auth";

const API = process.env.PLAYWRIGHT_API_URL || "http://localhost:5000";
const PAGE_TIMEOUT = 45000;

/** Wakes up the Render backend (free tier spins down after inactivity). */
async function warmUpBackend() {
  const start = Date.now();
  for (let i = 0; i < 10; i++) {
    try {
      const ctx = await request.newContext({ baseURL: API });
      const res = await ctx.get("/api/health", { timeout: 10000 });
      await ctx.dispose();
      if (res.ok()) {
        console.log(`✓ Backend healthy (${Date.now() - start}ms)`);
        return;
      }
    } catch {
      // backend still waking up
    }
    console.log(`  waiting for backend... attempt ${i + 1}`);
    await new Promise((r) => setTimeout(r, 5000));
  }
  console.warn("⚠ Backend did not become healthy — tests may be unreliable");
}

setup("warm up services", async () => {
  await warmUpBackend();
});

/**
 * Runs once before all tests.
 * Creates the E2E test user account if E2E_USER_EMAIL is not already set.
 */
setup("create test user account", async ({ page }) => {
  setup.setTimeout(60000);
  // If credentials already provided, verify they work
  if (process.env.E2E_USER_EMAIL && process.env.E2E_USER_PASSWORD) {
    await page.goto("/auth/login");
    await page.getByPlaceholder(/email/i).fill(process.env.E2E_USER_EMAIL);
    await page.getByPlaceholder(/password/i).fill(process.env.E2E_USER_PASSWORD);
    await page.getByRole("button", { name: /sign in/i }).click();
    const url = await page.waitForURL(
      (u) => !u.pathname.includes("/auth/login"),
      { timeout: PAGE_TIMEOUT }
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
    timeout: PAGE_TIMEOUT,
  });

  // Store for test run (written to env so other tests can read)
  process.env.E2E_USER_EMAIL = email;
  process.env.E2E_USER_PASSWORD = password;
  console.log(`✓ Created test user: ${email}`);
});

setup("verify admin account", async ({ page }) => {
  setup.setTimeout(60000);
  if (!process.env.E2E_ADMIN_EMAIL || !process.env.E2E_ADMIN_PASSWORD) {
    console.warn("⚠ E2E_ADMIN_EMAIL not set — admin tests will be skipped");
    return;
  }

  await page.goto("/auth/login");
  await page.getByPlaceholder(/email/i).fill(process.env.E2E_ADMIN_EMAIL!);
  await page.getByPlaceholder(/password/i).fill(process.env.E2E_ADMIN_PASSWORD!);
  await page.getByRole("button", { name: /sign in/i }).click();
  await page.waitForURL((u) => !u.pathname.includes("/auth/login"), {
    timeout: PAGE_TIMEOUT,
  });
  console.log(`✓ Admin account verified: ${process.env.E2E_ADMIN_EMAIL}`);
});
