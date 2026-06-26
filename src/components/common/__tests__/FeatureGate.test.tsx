import { describe, it, expect, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { FeatureGate, useFeatureFlag } from "../FeatureGate";

vi.mock("@/lib/cms", () => ({
  cmsPublicApi: {
    getFeatureFlags: vi.fn(),
  },
}));

function createWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false, gcTime: 0 },
    },
  });
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    );
  };
}

describe("FeatureGate", () => {
  it("renders children when flag is enabled", async () => {
    const { cmsPublicApi } = await import("@/lib/cms");
    vi.mocked(cmsPublicApi.getFeatureFlags).mockResolvedValue({
      show_blog_section: true,
      enable_exams: true,
    });

    render(
      <FeatureGate flag="show_blog_section">
        <div>Blog Section</div>
      </FeatureGate>,
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      expect(screen.getByText("Blog Section")).toBeInTheDocument();
    });
  });

  it("does not render children when flag is disabled", async () => {
    const { cmsPublicApi } = await import("@/lib/cms");
    vi.mocked(cmsPublicApi.getFeatureFlags).mockResolvedValue({
      show_blog_section: false,
      enable_exams: true,
    });

    render(
      <FeatureGate flag="show_blog_section">
        <div>Blog Section</div>
      </FeatureGate>,
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      expect(screen.queryByText("Blog Section")).not.toBeInTheDocument();
    });
  });

  it("renders fallback when flag is disabled", async () => {
    const { cmsPublicApi } = await import("@/lib/cms");
    vi.mocked(cmsPublicApi.getFeatureFlags).mockResolvedValue({
      show_blog_section: false,
    });

    render(
      <FeatureGate flag="show_blog_section" fallback={<div>Coming Soon</div>}>
        <div>Blog Section</div>
      </FeatureGate>,
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      expect(screen.getByText("Coming Soon")).toBeInTheDocument();
      expect(screen.queryByText("Blog Section")).not.toBeInTheDocument();
    });
  });

  it("hides children when flag does not exist", async () => {
    const { cmsPublicApi } = await import("@/lib/cms");
    vi.mocked(cmsPublicApi.getFeatureFlags).mockResolvedValue({});

    render(
      <FeatureGate flag="nonexistent_flag">
        <div>Hidden Feature</div>
      </FeatureGate>,
      { wrapper: createWrapper() }
    );

    await waitFor(() => {
      expect(screen.queryByText("Hidden Feature")).not.toBeInTheDocument();
    });
  });

  it("renders nothing while loading", async () => {
    const { cmsPublicApi } = await import("@/lib/cms");
    vi.mocked(cmsPublicApi.getFeatureFlags).mockReturnValue(new Promise(() => {}));

    const { container } = render(
      <FeatureGate flag="show_blog_section">
        <div>Blog Section</div>
      </FeatureGate>,
      { wrapper: createWrapper() }
    );

    expect(container.innerHTML).toBe("");
  });
});

describe("useFeatureFlag", () => {
  function TestComponent({ flag }: { flag: string }) {
    const enabled = useFeatureFlag(flag);
    return <div data-testid="result">{String(enabled)}</div>;
  }

  it("returns true for enabled flag", async () => {
    const { cmsPublicApi } = await import("@/lib/cms");
    vi.mocked(cmsPublicApi.getFeatureFlags).mockResolvedValue({
      my_feature: true,
    });

    render(<TestComponent flag="my_feature" />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByTestId("result")).toHaveTextContent("true");
    });
  });

  it("returns false for disabled flag", async () => {
    const { cmsPublicApi } = await import("@/lib/cms");
    vi.mocked(cmsPublicApi.getFeatureFlags).mockResolvedValue({
      my_feature: false,
    });

    render(<TestComponent flag="my_feature" />, { wrapper: createWrapper() });

    await waitFor(() => {
      expect(screen.getByTestId("result")).toHaveTextContent("false");
    });
  });
});
