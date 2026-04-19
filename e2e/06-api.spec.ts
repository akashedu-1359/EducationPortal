import { test, expect, request } from "@playwright/test";

const API = process.env.PLAYWRIGHT_API_URL || "http://localhost:5000";

/**
 * Direct API tests — bypass the UI and hit the backend REST API.
 * These catch backend regressions even if the UI changes.
 */
test.describe("Backend API", () => {
  let apiCtx: Awaited<ReturnType<typeof request.newContext>>;
  let accessToken: string;

  test.beforeAll(async () => {
    apiCtx = await request.newContext({ baseURL: API });
  });

  test.afterAll(async () => {
    await apiCtx.dispose();
  });

  test("GET /api/health — returns healthy", async () => {
    const res = await apiCtx.get("/api/health");
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.status ?? body.Status).toMatch(/healthy|ok/i);
  });

  test("POST /api/auth/register — creates user", async () => {
    const res = await apiCtx.post("/api/auth/register", {
      data: {
        fullName: `E2E API User ${Date.now()}`,
        email: `api-test-${Date.now()}@mailtest.dev`,
        password: "ApiTest@123!",
        confirmPassword: "ApiTest@123!",
      },
    });
    expect([200, 201]).toContain(res.status());
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.data.accessToken).toBeTruthy();
    accessToken = body.data.accessToken;
  });

  test("POST /api/auth/login — returns token", async () => {
    const email = `login-test-${Date.now()}@mailtest.dev`;
    const password = "LoginTest@123!";

    // Register first
    await apiCtx.post("/api/auth/register", {
      data: { fullName: "Login Tester", email, password, confirmPassword: password },
    });

    // Then login
    const res = await apiCtx.post("/api/auth/login", {
      data: { email, password },
    });
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.data.accessToken).toBeTruthy();
    accessToken = body.data.accessToken;
  });

  test("GET /api/resources — returns paginated list", async () => {
    const res = await apiCtx.get("/api/resources");
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
    expect(body.data).toHaveProperty("items");
    expect(Array.isArray(body.data.items)).toBe(true);
  });

  test("GET /api/cms/sections — returns sections list", async () => {
    const res = await apiCtx.get("/api/cms/sections");
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
  });

  test("GET /api/cms/features — returns feature flags", async () => {
    const res = await apiCtx.get("/api/cms/features");
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
  });

  test("GET /api/cms/footer — returns footer data", async () => {
    const res = await apiCtx.get("/api/cms/footer");
    expect(res.status()).toBe(200);
  });

  test("GET /api/cms/faqs — returns faq list", async () => {
    const res = await apiCtx.get("/api/cms/faqs");
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
  });

  test("GET /api/user/dashboard — 401 without token", async () => {
    const res = await apiCtx.get("/api/user/dashboard");
    expect(res.status()).toBe(401);
  });

  test("GET /api/user/dashboard — 200 with valid token", async () => {
    if (!accessToken) test.skip();
    const res = await apiCtx.get("/api/user/dashboard", {
      headers: { Authorization: `Bearer ${accessToken}` },
    });
    expect(res.status()).toBe(200);
    const body = await res.json();
    expect(body.success).toBe(true);
  });

  test("GET /api/admin/users — 401 without token", async () => {
    const res = await apiCtx.get("/api/admin/users");
    expect(res.status()).toBe(401);
  });

  test("GET /api/admin/analytics/dashboard — 401 without token", async () => {
    const res = await apiCtx.get("/api/admin/analytics/dashboard");
    expect(res.status()).toBe(401);
  });

  test("POST /api/auth/refresh — 401 without cookie", async () => {
    const res = await apiCtx.post("/api/auth/refresh");
    expect(res.status()).toBe(401);
  });
});
