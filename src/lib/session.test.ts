import { describe, expect, it, vi } from "vitest";

import { ACCESS_TOKEN_COOKIE, REFRESH_TOKEN_COOKIE, sessionCookies } from "@/lib/session";

const TOKENS = { accessToken: "access", tokenType: "Bearer", expiresIn: 900, refreshToken: "refresh" };

function cookieNamed(name: string) {
  const cookie = sessionCookies(TOKENS).find((c) => c.name === name);
  if (!cookie) {
    throw new Error(`cookie ${name} not found`);
  }
  return cookie;
}

describe("sessionCookies", () => {
  it("expires the access cookie 30 seconds before the token itself", () => {
    const access = cookieNamed(ACCESS_TOKEN_COOKIE);

    expect(access.value).toBe("access");
    expect(access.options.maxAge).toBe(870);
  });

  it("keeps the refresh cookie for 7 days", () => {
    const refresh = cookieNamed(REFRESH_TOKEN_COOKIE);

    expect(refresh.value).toBe("refresh");
    expect(refresh.options.maxAge).toBe(7 * 24 * 60 * 60);
  });

  it("never lets page JavaScript read the tokens", () => {
    for (const cookie of sessionCookies(TOKENS)) {
      expect(cookie.options).toMatchObject({ httpOnly: true, sameSite: "lax", path: "/" });
    }
  });

  it("marks the cookies as secure (HTTPS only) in production", () => {
    vi.stubEnv("NODE_ENV", "production");

    for (const cookie of sessionCookies(TOKENS)) {
      expect(cookie.options.secure).toBe(true);
    }
  });

  it("does not mark the cookies as secure in development, where localhost uses plain HTTP", () => {
    vi.stubEnv("NODE_ENV", "development");

    for (const cookie of sessionCookies(TOKENS)) {
      expect(cookie.options.secure).toBe(false);
    }
  });

  it("never gives the access cookie a negative lifetime", () => {
    const [access] = sessionCookies({ ...TOKENS, expiresIn: 10 });

    expect(access.options.maxAge).toBe(0);
  });
});
