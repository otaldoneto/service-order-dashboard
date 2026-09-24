// Named "Middleware" in this Next.js version, although the docs already call it unstable_doesProxyMatch
import { getRedirectUrl, unstable_doesMiddlewareMatch } from "next/experimental/testing/server";
import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { config, proxy } from "@/proxy";

vi.mock("server-only", () => ({}));

const APP_URL = "http://localhost:3000";

function requestTo(path: string, cookies: Record<string, string> = {}): NextRequest {
  const request = new NextRequest(new URL(path, APP_URL));
  for (const [name, value] of Object.entries(cookies)) {
    request.cookies.set(name, value);
  }
  return request;
}

function tokenResponse(accessToken: string, refreshToken: string): Response {
  return new Response(JSON.stringify({ accessToken, tokenType: "Bearer", expiresIn: 900, refreshToken }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}

describe("proxy", () => {
  const fetchMock = vi.fn<typeof fetch>();

  beforeEach(() => {
    vi.stubEnv("API_BASE_URL", "https://api.example.com");
    vi.stubGlobal("fetch", fetchMock);
  });

  it("lets the login page through without a session", async () => {
    const response = await proxy(requestTo("/login"));

    expect(getRedirectUrl(response)).toBeNull();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("lets a visitor with an access token through without calling the API", async () => {
    const response = await proxy(requestTo("/", { access_token: "valid" }));

    expect(getRedirectUrl(response)).toBeNull();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("sends a visitor without any token to the login page", async () => {
    const response = await proxy(requestTo("/"));

    expect(getRedirectUrl(response)).toBe(`${APP_URL}/login`);
  });

  it("renews an expired access token with the refresh token", async () => {
    fetchMock.mockResolvedValue(tokenResponse("new-access", "new-refresh"));

    const response = await proxy(requestTo("/", { refresh_token: "old-refresh" }));

    const [url, init] = fetchMock.mock.calls[0];
    expect(String(url)).toBe("https://api.example.com/auth/refresh");
    expect(init?.body).toBe(JSON.stringify({ refreshToken: "old-refresh" }));
    expect(getRedirectUrl(response)).toBeNull();
    // The browser stores the new pair...
    expect(response.cookies.get("access_token")?.value).toBe("new-access");
    expect(response.cookies.get("refresh_token")?.value).toBe("new-refresh");
    // ...and the page rendered for this same request already receives the new access token
    expect(response.headers.get("x-middleware-request-cookie")).toContain("access_token=new-access");
  });

  it("clears the session and goes to login when the refresh token is refused", async () => {
    fetchMock.mockResolvedValue(new Response(JSON.stringify({ message: "Invalid refresh token" }), { status: 401 }));

    const response = await proxy(requestTo("/", { refresh_token: "revoked" }));

    expect(getRedirectUrl(response)).toBe(`${APP_URL}/login`);
    expect(response.cookies.get("refresh_token")?.value).toBe("");
  });

  it("goes to login when the API does not answer", async () => {
    fetchMock.mockRejectedValue(new TypeError("fetch failed"));

    const response = await proxy(requestTo("/", { refresh_token: "whatever" }));

    expect(getRedirectUrl(response)).toBe(`${APP_URL}/login`);
  });
});

describe("proxy matcher", () => {
  it.each(["/", "/login", "/orders/42"])("runs on the page %s", (url) => {
    expect(unstable_doesMiddlewareMatch({ config, url })).toBe(true);
  });

  it.each(["/_next/static/chunks/main.js", "/_next/image?url=x", "/favicon.ico", "/logo.svg"])(
    "skips the static file %s",
    (url) => {
      expect(unstable_doesMiddlewareMatch({ config, url })).toBe(false);
    },
  );
});
