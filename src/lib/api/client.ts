import "server-only";

import type { ApiErrorBody } from "./types";

// Render's free tier sleeps after 15 minutes idle and takes about a minute to wake up
const DEFAULT_TIMEOUT_MS = 90_000;

// The API answered, but with an error status (401, 403, 404, 409, 500...)
export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

// The API did not answer at all: it is down, unreachable or took longer than the timeout
export class ApiUnavailableError extends Error {
  constructor(cause: unknown) {
    super("The API is not responding. It may be waking up, try again in a minute.", { cause });
    this.name = "ApiUnavailableError";
  }
}

type QueryValue = string | number | undefined;

export type ApiRequestOptions = {
  method?: "GET" | "POST" | "PUT";
  token?: string;
  body?: unknown;
  query?: Record<string, QueryValue>;
  timeoutMs?: number;
};

function baseUrl(): string {
  const url = process.env.API_BASE_URL;
  if (!url) {
    throw new Error("API_BASE_URL is not set: copy .env.example to .env.local");
  }
  return url.replace(/\/+$/, "");
}

export function buildUrl(path: string, query: Record<string, QueryValue> = {}): URL {
  const url = new URL(baseUrl() + path);
  for (const [key, value] of Object.entries(query)) {
    // Empty filters are left out, so the API does not filter by them
    if (value !== undefined && value !== "") {
      url.searchParams.set(key, String(value));
    }
  }
  return url;
}

async function errorMessage(response: Response): Promise<string> {
  try {
    const body = (await response.json()) as Partial<ApiErrorBody>;
    return body.message ?? `HTTP ${response.status}`;
  } catch {
    // The error body was not JSON (for example, an HTML page from a proxy)
    return `HTTP ${response.status}`;
  }
}

// Calls the API from the server and returns the parsed JSON body
export async function apiRequest<T>(path: string, options: ApiRequestOptions = {}): Promise<T> {
  const headers: Record<string, string> = { Accept: "application/json" };
  if (options.body !== undefined) {
    headers["Content-Type"] = "application/json";
  }
  if (options.token) {
    headers.Authorization = `Bearer ${options.token}`;
  }
  // Built outside the try: a missing API_BASE_URL is a configuration error, not an unavailable API
  const url = buildUrl(path, options.query);

  let response: Response;
  try {
    response = await fetch(url, {
      method: options.method ?? "GET",
      headers,
      body: options.body === undefined ? undefined : JSON.stringify(options.body),
      // Per-user data must never be cached or shared between requests
      cache: "no-store",
      signal: AbortSignal.timeout(options.timeoutMs ?? DEFAULT_TIMEOUT_MS),
    });
  } catch (error) {
    throw new ApiUnavailableError(error);
  }

  if (!response.ok) {
    throw new ApiError(response.status, await errorMessage(response));
  }
  if (response.status === 204) {
    return undefined as T;
  }
  return (await response.json()) as T;
}