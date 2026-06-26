# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: setup\global-setup.ts >> create test user account
- Location: e2e\setup\global-setup.ts:35:6

# Error details

```
Error: Failed to register test user: 429 
```

# Test source

```ts
  1   | import { test as setup, request } from "@playwright/test";
  2   | import { uniqueEmail } from "../helpers/auth";
  3   | 
  4   | const API = process.env.PLAYWRIGHT_API_URL || "http://localhost:5000";
  5   | const PAGE_TIMEOUT = 45000;
  6   | 
  7   | /** Wakes up the Render backend (free tier spins down after inactivity). */
  8   | async function warmUpBackend() {
  9   |   const start = Date.now();
  10  |   for (let i = 0; i < 10; i++) {
  11  |     try {
  12  |       const ctx = await request.newContext({ baseURL: API });
  13  |       const res = await ctx.get("/api/health", { timeout: 10000 });
  14  |       await ctx.dispose();
  15  |       if (res.ok()) {
  16  |         console.log(`✓ Backend healthy (${Date.now() - start}ms)`);
  17  |         return;
  18  |       }
  19  |     } catch {
  20  |       // backend still waking up
  21  |     }
  22  |     console.log(`  waiting for backend... attempt ${i + 1}`);
  23  |     await new Promise((r) => setTimeout(r, 5000));
  24  |   }
  25  |   console.warn("⚠ Backend did not become healthy — tests may be unreliable");
  26  | }
  27  | 
  28  | setup("warm up services", async () => {
  29  |   await warmUpBackend();
  30  | });
  31  | 
  32  | /**
  33  |  * Verifies or registers the test user via API (no browser needed — fast and reliable).
  34  |  */
  35  | setup("create test user account", async () => {
  36  |   setup.setTimeout(60000);
  37  |   const apiCtx = await request.newContext({ baseURL: API });
  38  | 
  39  |   if (process.env.E2E_USER_EMAIL && process.env.E2E_USER_PASSWORD) {
  40  |     // Verify existing credentials work
  41  |     const res = await apiCtx.post("/api/auth/login", {
  42  |       data: { email: process.env.E2E_USER_EMAIL, password: process.env.E2E_USER_PASSWORD },
  43  |     });
  44  |     if (res.ok()) {
  45  |       console.log(`✓ Test user verified: ${process.env.E2E_USER_EMAIL}`);
  46  |       await apiCtx.dispose();
  47  |       return;
  48  |     }
  49  |     console.warn("⚠ E2E_USER_EMAIL login failed — will register a new account");
  50  |   }
  51  | 
  52  |   // Register a fresh test user
  53  |   const email = uniqueEmail("e2e-user");
  54  |   const password = "TestUser@123!";
  55  | 
  56  |   const res = await apiCtx.post("/api/auth/register", {
  57  |     data: { fullName: "E2E Tester", email, password, confirmPassword: password },
  58  |   });
  59  | 
  60  |   if (!res.ok()) {
  61  |     const body = await res.text();
> 62  |     throw new Error(`Failed to register test user: ${res.status()} ${body}`);
      |           ^ Error: Failed to register test user: 429 
  63  |   }
  64  | 
  65  |   process.env.E2E_USER_EMAIL = email;
  66  |   process.env.E2E_USER_PASSWORD = password;
  67  |   console.log(`✓ Created test user: ${email}`);
  68  |   await apiCtx.dispose();
  69  | });
  70  | 
  71  | /**
  72  |  * Verifies the admin account exists and credentials are valid via API.
  73  |  */
  74  | setup("verify admin account", async () => {
  75  |   setup.setTimeout(60000);
  76  |   if (!process.env.E2E_ADMIN_EMAIL || !process.env.E2E_ADMIN_PASSWORD) {
  77  |     console.warn("⚠ E2E_ADMIN_EMAIL not set — admin tests will be skipped");
  78  |     return;
  79  |   }
  80  | 
  81  |   try {
  82  |     const apiCtx = await request.newContext({ baseURL: API });
  83  |     const res = await apiCtx.post("/api/auth/login", {
  84  |       data: {
  85  |         email: process.env.E2E_ADMIN_EMAIL,
  86  |         password: process.env.E2E_ADMIN_PASSWORD,
  87  |       },
  88  |     });
  89  |     await apiCtx.dispose();
  90  | 
  91  |     if (!res.ok()) {
  92  |       console.warn(
  93  |         `⚠ Admin login failed: ${res.status()} — admin tests may fail. ` +
  94  |           "Check E2E_ADMIN_EMAIL / E2E_ADMIN_PASSWORD in .env.e2e"
  95  |       );
  96  |       return;
  97  |     }
  98  |     console.log(`✓ Admin account verified: ${process.env.E2E_ADMIN_EMAIL}`);
  99  |   } catch (err) {
  100 |     console.warn(
  101 |       `⚠ Admin login request failed (backend may be down): ${err instanceof Error ? err.message : err} — admin tests may fail`
  102 |     );
  103 |   }
  104 | });
  105 | 
```