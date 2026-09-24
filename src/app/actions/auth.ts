"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { ApiError, ApiUnavailableError, apiRequest } from "@/lib/api/client";
import type { TokenResponse } from "@/lib/api/types";
import { ACCESS_TOKEN_COOKIE, REFRESH_TOKEN_COOKIE, sessionCookies } from "@/lib/session";

export type LoginState = { error: string } | undefined;

function loginErrorMessage(error: unknown): string {
  if (error instanceof ApiUnavailableError) {
    return "The API did not respond in time. It may still be waking up: please try again.";
  }
  if (error instanceof ApiError && error.status === 429) {
    return "Too many login attempts. Please wait a few minutes and try again.";
  }
  if (error instanceof ApiError) {
    return `The demo login was refused (HTTP ${error.status}).`;
  }
  throw error;
}

// Logs in with the demo account kept in the server's environment variables
export async function enterAsDemo(): Promise<LoginState> {
  const email = process.env.DEMO_EMAIL;
  const password = process.env.DEMO_PASSWORD;
  if (!email || !password) {
    throw new Error("DEMO_EMAIL and DEMO_PASSWORD must be set: see .env.example");
  }

  try {
    const tokens = await apiRequest<TokenResponse>("/auth/login", {
      method: "POST",
      body: { email, password },
    });
    const cookieStore = await cookies();
    for (const cookie of sessionCookies(tokens)) {
      cookieStore.set(cookie.name, cookie.value, cookie.options);
    }
  } catch (error) {
    return { error: loginErrorMessage(error) };
  }

  // redirect() works by throwing, so it must stay outside the try/catch
  redirect("/");
}

export async function logout(): Promise<void> {
  const cookieStore = await cookies();
  const refreshToken = cookieStore.get(REFRESH_TOKEN_COOKIE)?.value;

  if (refreshToken) {
    // Revokes the refresh token on the API. Best effort: the cookies are removed even if the API is down.
    await apiRequest("/auth/logout", { method: "POST", body: { refreshToken } }).catch(() => undefined);
  }

  cookieStore.delete(ACCESS_TOKEN_COOKIE);
  cookieStore.delete(REFRESH_TOKEN_COOKIE);
  redirect("/login");
}
