import "server-only";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { ACCESS_TOKEN_COOKIE } from "@/lib/session";

// Returns the access token of the current visitor, or sends them to the login page.
// The proxy already redirects visitors without a session; this is the second, authoritative check.
export async function requireAccessToken(): Promise<string> {
  const token = (await cookies()).get(ACCESS_TOKEN_COOKIE)?.value;
  if (!token) {
    redirect("/login");
  }
  return token;
}
