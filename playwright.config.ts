import { defineConfig, devices } from "@playwright/test";
import * as dotenv from "dotenv";

// Load .env.e2e if present (local runs), otherwise use process.env (CI)
dotenv.config({ path: ".env.e2e" });

const BASE_URL =
  process.env.PLAYWRIGHT_BASE_URL ||
  process.env.NEXT_PUBLIC_APP_URL ||
  "http://localhost:3000";

const API_URL =
  process.env.PLAYWRIGHT_API_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  "http://localhost:5000";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false, // serial for shared state (auth cookies etc.)
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 1,
  workers: 1, // single worker for predictable order
  timeout: 30_000,
  expect: { timeout: 10_000 },

  reporter: [
    ["html", { outputFolder: "playwright-report", open: "never" }],
    ["json", { outputFile: "playwright-report/results.json" }],
    ["list"],
  ],

  use: {
    baseURL: BASE_URL,
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "on-first-retry",
    actionTimeout: 20_000,
    navigationTimeout: 45_000,
    extraHTTPHeaders: { "x-e2e-test": "true" },
  },

  projects: [
    // Setup: create test accounts once
    {
      name: "setup",
      testMatch: "**/e2e/setup/*.ts",
    },
    // Main tests run after setup
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
      dependencies: ["setup"],
    },
    {
      name: "mobile",
      use: { ...devices["Pixel 5"] },
      dependencies: ["setup"],
      testMatch: "**/e2e/smoke.spec.ts", // only smoke on mobile
    },
  ],

  webServer: process.env.CI
    ? undefined
    : process.env.PLAYWRIGHT_BASE_URL
    ? undefined // against prod — no local server needed
    : {
        command: "npm run dev",
        url: "http://localhost:3000",
        reuseExistingServer: true,
        timeout: 60_000,
      },
});

export { BASE_URL, API_URL };
