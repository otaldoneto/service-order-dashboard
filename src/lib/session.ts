import type { TokenResponse } from "@/lib/api/types";

// Names of the cookies that hold the API tokens. They are httpOnly: page JavaScript can never read them.
export const ACCESS_TOKEN_COOKIE = "access_token";
export const REFRESH_TOKEN_COOKIE = "refresh_token";

// The API's refresh token is valid for 7 days
const REFRESH_TOKEN_MAX_AGE_SECONDS = 7 * 24 * 60 * 60;

// The access cookie expires a little before the token itself, so a request never carries a token that is
// about to expire on its way to the API
const EXPIRY_MARGIN_SECONDS = 30;

export type SessionCookie = {
  name: string;
  value: string;
  options: {
    httpOnly: true;
    secure: boolean;
    sameSite: "lax";
    path: "/";
    maxAge: number;
  };
};

function cookieOptions(maxAge: number): SessionCookie["options"] {
  return {
    httpOnly: true,
    // HTTPS only in production; localhost runs on plain HTTP
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge,
  };
}

// The two cookies to store after a login or a token refresh
export function sessionCookies(tokens: TokenResponse): SessionCookie[] {
  return [
    {
      name: ACCESS_TOKEN_COOKIE,
      value: tokens.accessToken,
      options: cookieOptions(Math.max(tokens.expiresIn - EXPIRY_MARGIN_SECONDS, 0)),
    },
    {
      name: REFRESH_TOKEN_COOKIE,
      value: tokens.refreshToken,
      options: cookieOptions(REFRESH_TOKEN_MAX_AGE_SECONDS),
    },
  ];
}
