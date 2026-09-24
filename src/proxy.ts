import { type NextRequest, NextResponse } from "next/server";

import { ApiError, ApiUnavailableError, apiRequest } from "@/lib/api/client";
import type { TokenResponse } from "@/lib/api/types";
import { ACCESS_TOKEN_COOKIE, REFRESH_TOKEN_COOKIE, sessionCookies } from "@/lib/session";

function redirectToLogin(request: NextRequest): NextResponse {
  const response = NextResponse.redirect(new URL("/login", request.url));
  response.cookies.delete(ACCESS_TOKEN_COOKIE);
  response.cookies.delete(REFRESH_TOKEN_COOKIE);
  return response;
}

// Runs before every page: keeps visitors without a session out, and renews an expired access token
export async function proxy(request: NextRequest) {
  if (request.nextUrl.pathname === "/login" || request.cookies.has(ACCESS_TOKEN_COOKIE)) {
    return NextResponse.next();
  }

  const refreshToken = request.cookies.get(REFRESH_TOKEN_COOKIE)?.value;
  if (!refreshToken) {
    return redirectToLogin(request);
  }

  let tokens: TokenResponse;
  try {
    tokens = await apiRequest<TokenResponse>("/auth/refresh", { method: "POST", body: { refreshToken } });
  } catch (error) {
    if (error instanceof ApiError || error instanceof ApiUnavailableError) {
      return redirectToLogin(request);
    }
    throw error;
  }

  const cookies = sessionCookies(tokens);
  // The page rendered right now must already see the new token...
  for (const cookie of cookies) {
    request.cookies.set(cookie.name, cookie.value);
  }
  const response = NextResponse.next({ request: { headers: request.headers } });
  // ...and the browser must store it for the next requests
  for (const cookie of cookies) {
    response.cookies.set(cookie.name, cookie.value, cookie.options);
  }
  return response;
}

export const config = {
  // Everything except Next.js internals and static files
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|ico)$).*)"],
};
