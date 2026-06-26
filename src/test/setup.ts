import "@testing-library/jest-dom/vitest";
import { cleanup } from "@testing-library/react";
import { afterEach, beforeAll, afterAll, vi } from "vitest";
import { server } from "./mocks/server";

beforeAll(() => server.listen({ onUnhandledRequest: "bypass" }));
afterEach(() => {
  cleanup();
  server.resetHandlers();
});
afterAll(() => server.close());

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    replace: vi.fn(),
    back: vi.fn(),
    prefetch: vi.fn(),
    refresh: vi.fn(),
  }),
  usePathname: () => "/",
  useSearchParams: () => new URLSearchParams(),
  useParams: () => ({}),
}));

vi.mock("@/config", () => ({
  config: {
    apiUrl: "http://localhost:5000",
    appUrl: "http://localhost:3000",
    appName: "EduPortal",
    env: "development",
    isDev: true,
    isProd: false,
    cookies: { refresh: "refreshToken", role: "userRole" },
    googleClientId: "",
    stripePublishableKey: "",
    razorpayKeyId: "",
    revalidationSecret: "",
    logLevel: "debug",
    enableDevTools: true,
  },
}));
