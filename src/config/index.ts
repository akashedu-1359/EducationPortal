/**
 * Unified application config.
 *
 * Resolution order (highest priority wins):
 *   1. Environment variables (process.env) — injected by GitHub Actions / CI
 *   2. Environment-specific JSON file    — config/environments/<env>.json
 *
 * Non-secret values (URLs, names, feature toggles) live in the JSON files.
 * Secret values (API keys, client IDs, tokens) are ONLY in env vars / GitHub Secrets
 * and must never be committed to the repository.
 *
 * GitHub Environments used: development | production
 * Each environment's secrets are configured in:
 *   GitHub → Settings → Environments → Secrets
 */

type AppEnv = "development" | "production";

function getEnv(): AppEnv {
  const raw =
    process.env.NEXT_PUBLIC_APP_ENV ||
    process.env.APP_ENV ||
    process.env.NODE_ENV ||
    "development";
  if (raw === "production") return "production";
  return "development";
}

// Load the JSON config for this environment.
// Next.js statically resolves require() at build time — this is intentional.
function loadEnvJson(env: AppEnv) {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  return require(`../../config/environments/${env}.json`) as {
    apiUrl: string;
    appUrl: string;
    appName: string;
    cookieRefreshName: string;
    cookieRoleName: string;
    logLevel: string;
    enableDevTools: boolean;
  };
}

const ENV = getEnv();
const json = loadEnvJson(ENV);

export const config = {
  // ── Environment ────────────────────────────────────────────────────────────
  env: ENV,
  isDev: ENV === "development",
  isProd: ENV === "production",

  // ── URLs (env vars take precedence over JSON defaults) ────────────────────
  apiUrl: process.env.NEXT_PUBLIC_API_URL || json.apiUrl,
  appUrl: process.env.NEXT_PUBLIC_APP_URL || json.appUrl,
  appName: process.env.NEXT_PUBLIC_APP_NAME || json.appName,

  // ── Cookie names ──────────────────────────────────────────────────────────
  cookies: {
    refresh:
      process.env.NEXT_PUBLIC_REFRESH_COOKIE_NAME || json.cookieRefreshName,
    role: process.env.NEXT_PUBLIC_ROLE_COOKIE_NAME || json.cookieRoleName,
  },

  // ── Secrets (ONLY from env vars / GitHub Secrets — never in JSON) ─────────
  googleClientId: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "",
  stripePublishableKey: process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "",
  razorpayKeyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "",

  // Server-side only — never exposed to the browser bundle
  revalidationSecret: process.env.REVALIDATION_SECRET || "",

  // ── Dev tooling ───────────────────────────────────────────────────────────
  logLevel: process.env.LOG_LEVEL || json.logLevel,
  enableDevTools:
    process.env.NEXT_PUBLIC_ENABLE_DEV_TOOLS === "true" ||
    json.enableDevTools,
} as const;

export type AppConfig = typeof config;
