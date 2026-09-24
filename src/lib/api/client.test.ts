import { beforeEach, describe, expect, it, vi } from "vitest";

import {
  ApiError,
  ApiUnavailableError,
  apiDownload,
  apiRequest,
  buildUrl,
} from "@/lib/api/client";

// "server-only" throws when imported outside a Next.js server build; in tests it is replaced by an empty module
vi.mock("server-only", () => ({}));

const BASE_URL = "https://api.example.com";

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

describe("buildUrl", () => {
  beforeEach(() => {
    vi.stubEnv("API_BASE_URL", `${BASE_URL}/`);
  });

  it("joins the base URL and the path, ignoring a trailing slash in the base URL", () => {
    expect(buildUrl("/orders").toString()).toBe(`${BASE_URL}/orders`);
  });

  it("adds the query parameters and leaves out the empty ones", () => {
    const url = buildUrl("/orders", {
      status: "OPEN",
      page: 0,
      title: "",
      clientId: undefined,
    });

    expect(url.searchParams.get("status")).toBe("OPEN");
    expect(url.searchParams.get("page")).toBe("0");
    expect(url.searchParams.has("title")).toBe(false);
    expect(url.searchParams.has("clientId")).toBe(false);
  });
});

describe("apiRequest", () => {
  const fetchMock = vi.fn<typeof fetch>();

  beforeEach(() => {
    vi.stubEnv("API_BASE_URL", BASE_URL);
    vi.stubGlobal("fetch", fetchMock);
  });

  it("returns the parsed JSON body", async () => {
    fetchMock.mockResolvedValue(
      jsonResponse({ email: "demo@helpdesk.dev", roles: ["VIEWER"] }),
    );

    const user = await apiRequest<{ email: string }>("/auth/me");

    expect(user.email).toBe("demo@helpdesk.dev");
  });

  it("sends the token as a Bearer header and the body as JSON", async () => {
    fetchMock.mockResolvedValue(jsonResponse({}));

    await apiRequest("/auth/login", {
      method: "POST",
      token: "abc",
      body: { email: "a@b.com" },
    });

    const [url, init] = fetchMock.mock.calls[0];
    const headers = init?.headers as Record<string, string>;
    expect(String(url)).toBe(`${BASE_URL}/auth/login`);
    expect(init?.method).toBe("POST");
    expect(headers.Authorization).toBe("Bearer abc");
    expect(headers["Content-Type"]).toBe("application/json");
    expect(init?.body).toBe(JSON.stringify({ email: "a@b.com" }));
  });

  it("does not send an Authorization header without a token", async () => {
    fetchMock.mockResolvedValue(jsonResponse({}));

    await apiRequest("/orders");

    const headers = fetchMock.mock.calls[0][1]?.headers as Record<
      string,
      string
    >;
    expect(headers.Authorization).toBeUndefined();
  });

  it("returns undefined for 204 No Content", async () => {
    fetchMock.mockResolvedValue(new Response(null, { status: 204 }));

    await expect(
      apiRequest("/auth/logout", { method: "POST" }),
    ).resolves.toBeUndefined();
  });

  it("turns an error response into an ApiError with the API's status and message", async () => {
    fetchMock.mockResolvedValue(
      jsonResponse(
        { status: 403, error: "Forbidden", message: "Access denied" },
        403,
      ),
    );

    const error = await apiRequest("/clients", { method: "POST" }).catch(
      (e: unknown) => e,
    );

    expect(error).toBeInstanceOf(ApiError);
    expect(error).toMatchObject({ status: 403, message: "Access denied" });
  });

  it("still returns an ApiError when the error body is not JSON", async () => {
    fetchMock.mockResolvedValue(
      new Response("<html>Bad Gateway</html>", { status: 502 }),
    );

    await expect(apiRequest("/orders")).rejects.toMatchObject({
      status: 502,
      message: "HTTP 502",
    });
  });

  it("turns a network failure or a timeout into an ApiUnavailableError", async () => {
    fetchMock.mockRejectedValue(new TypeError("fetch failed"));

    await expect(apiRequest("/orders")).rejects.toBeInstanceOf(
      ApiUnavailableError,
    );
  });

  it("reports a missing API_BASE_URL as a configuration error, not as an unavailable API", async () => {
    vi.stubEnv("API_BASE_URL", "");

    await expect(apiRequest("/orders")).rejects.toThrow(
      "API_BASE_URL is not set",
    );
    expect(fetchMock).not.toHaveBeenCalled();
  });
  it("asks for JSON unless another media type is requested", async () => {
    fetchMock.mockResolvedValue(jsonResponse({}));

    await apiRequest("/orders");

    const headers = fetchMock.mock.calls[0][1]?.headers as Record<
      string,
      string
    >;
    expect(headers.Accept).toBe("application/json");
  });
});

describe("apiDownload", () => {
  const fetchMock = vi.fn<typeof fetch>();

  beforeEach(() => {
    vi.stubEnv("API_BASE_URL", BASE_URL);
    vi.stubGlobal("fetch", fetchMock);
  });

  it("returns the response unread, with the requested media type in the Accept header", async () => {
    fetchMock.mockResolvedValue(
      new Response("%PDF-1.4", {
        status: 200,
        headers: { "Content-Type": "application/pdf" },
      }),
    );

    const response = await apiDownload("/orders/1/report", {
      token: "abc",
      accept: "application/pdf",
    });

    const headers = fetchMock.mock.calls[0][1]?.headers as Record<
      string,
      string
    >;
    expect(headers.Accept).toBe("application/pdf");
    expect(response.bodyUsed).toBe(false);
    await expect(response.text()).resolves.toBe("%PDF-1.4");
  });

  it("fails with the same errors as apiRequest", async () => {
    fetchMock.mockResolvedValue(
      jsonResponse({ message: "Service order not found with id: 9" }, 404),
    );

    await expect(
      apiDownload("/orders/9/report", { accept: "application/pdf" }),
    ).rejects.toMatchObject({
      status: 404,
      message: "Service order not found with id: 9",
    });
  });
});
