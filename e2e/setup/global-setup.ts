import { test as setup, request } from "@playwright/test";
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
 * Verifies or registers the test user via API (no browser needed — fast and reliable).
 */
setup("create test user account", async () => {
  setup.setTimeout(60000);
  const apiCtx = await request.newContext({ baseURL: API });

  if (process.env.E2E_USER_EMAIL && process.env.E2E_USER_PASSWORD) {
    // Verify existing credentials work
    const res = await apiCtx.post("/api/auth/login", {
      data: { email: process.env.E2E_USER_EMAIL, password: process.env.E2E_USER_PASSWORD },
    });
    if (res.ok()) {
      console.log(`✓ Test user verified: ${process.env.E2E_USER_EMAIL}`);
      await apiCtx.dispose();
      return;
    }
    console.warn("⚠ E2E_USER_EMAIL login failed — will register a new account");
  }

  // Register a fresh test user
  const email = uniqueEmail("e2e-user");
  const password = "TestUser@123!";

  const res = await apiCtx.post("/api/auth/register", {
    data: { fullName: "E2E Tester", email, password, confirmPassword: password },
  });

  if (!res.ok()) {
    const body = await res.text();
    throw new Error(`Failed to register test user: ${res.status()} ${body}`);
  }

  process.env.E2E_USER_EMAIL = email;
  process.env.E2E_USER_PASSWORD = password;
  console.log(`✓ Created test user: ${email}`);
  await apiCtx.dispose();
});

/**
 * Verifies the admin account exists and credentials are valid via API.
 */
setup("verify admin account", async () => {
  setup.setTimeout(60000);
  if (!process.env.E2E_ADMIN_EMAIL || !process.env.E2E_ADMIN_PASSWORD) {
    console.warn("⚠ E2E_ADMIN_EMAIL not set — admin tests will be skipped");
    return;
  }

  const apiCtx = await request.newContext({ baseURL: API });
  const res = await apiCtx.post("/api/auth/login", {
    data: {
      email: process.env.E2E_ADMIN_EMAIL,
      password: process.env.E2E_ADMIN_PASSWORD,
    },
  });
  await apiCtx.dispose();

  if (!res.ok()) {
    throw new Error(`Admin login failed: ${res.status()} — check E2E_ADMIN_EMAIL / E2E_ADMIN_PASSWORD secrets`);
  }
  console.log(`✓ Admin account verified: ${process.env.E2E_ADMIN_EMAIL}`);
});
