import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import axios from "axios";
import { http, HttpResponse } from "msw";
import { server } from "@/test/mocks/server";

vi.mock("@/config", () => ({
  config: {
    apiUrl: "http://localhost:5000",
  },
}));

describe("api module", () => {
  beforeEach(async () => {
    vi.resetModules();
  });

  describe("request interceptor - token attachment", () => {
    it("attaches Authorization header when access token is set", async () => {
      const { api, setAccessToken } = await import("../api");
      setAccessToken("my-test-token");

      server.use(
        http.get("http://localhost:5000/api/test-endpoint", ({ request }) => {
          const authHeader = request.headers.get("Authorization");
          return HttpResponse.json({
            success: true,
            message: "OK",
            data: { authHeader },
          });
        })
      );

      const res = await api.get("/test-endpoint");
      expect(res.data.data.authHeader).toBe("Bearer my-test-token");

      setAccessToken(null);
    });

    it("does not attach Authorization header when no token", async () => {
      const { api, setAccessToken } = await import("../api");
      setAccessToken(null);

      server.use(
        http.get("http://localhost:5000/api/test-endpoint", ({ request }) => {
          const authHeader = request.headers.get("Authorization");
          return HttpResponse.json({
            success: true,
            message: "OK",
            data: { authHeader },
          });
        })
      );

      const res = await api.get("/test-endpoint");
      expect(res.data.data.authHeader).toBeNull();
    });
  });

  describe("unwrap helper", () => {
    it("extracts data from successful ApiResponse", async () => {
      const { unwrap } = await import("../api");
      const response = {
        data: { success: true, message: "OK", data: { id: 1, name: "Test" } },
      };
      expect(unwrap(response)).toEqual({ id: 1, name: "Test" });
    });

    it("throws on unsuccessful ApiResponse", async () => {
      const { unwrap } = await import("../api");
      const response = {
        data: { success: false, message: "Not found", data: null },
      };
      expect(() => unwrap(response)).toThrow("Not found");
    });
  });

  describe("getApiErrorMessage", () => {
    it("extracts message from Axios error response", async () => {
      const { getApiErrorMessage } = await import("../api");
      const error = new axios.AxiosError("Request failed", "ERR", undefined, undefined, {
        data: { success: false, message: "Email already exists", errors: [] },
        status: 400,
        statusText: "Bad Request",
        headers: {},
        config: {} as never,
      });
      expect(getApiErrorMessage(error)).toBe("Email already exists");
    });

    it("extracts first error string from errors array", async () => {
      const { getApiErrorMessage } = await import("../api");
      const error = new axios.AxiosError("Request failed", "ERR", undefined, undefined, {
        data: { success: false, message: "", errors: ["Field is required"] },
        status: 400,
        statusText: "Bad Request",
        headers: {},
        config: {} as never,
      });
      expect(getApiErrorMessage(error)).toBe("Field is required");
    });

    it("returns generic message for unknown errors", async () => {
      const { getApiErrorMessage } = await import("../api");
      expect(getApiErrorMessage("something")).toBe("An unexpected error occurred");
    });

    it("returns error.message for plain Error objects", async () => {
      const { getApiErrorMessage } = await import("../api");
      expect(getApiErrorMessage(new Error("Custom error"))).toBe("Custom error");
    });
  });
});
