import { beforeEach, describe, expect, it, vi } from "vitest";

import { ApiError } from "@/lib/api/client";
import { downloadOrderReport, getOrder } from "@/lib/api/orders";

vi.mock("server-only", () => ({}));

function jsonResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

describe("getOrder", () => {
  const fetchMock = vi.fn<typeof fetch>();

  beforeEach(() => {
    vi.stubEnv("API_BASE_URL", "https://api.example.com");
    vi.stubGlobal("fetch", fetchMock);
  });

  it("returns the order", async () => {
    fetchMock.mockResolvedValue(jsonResponse({ id: 7, title: "Printer jam" }));

    const order = await getOrder("token", 7);

    expect(order?.title).toBe("Printer jam");
    expect(String(fetchMock.mock.calls[0][0])).toBe(
      "https://api.example.com/orders/7",
    );
  });

  it("returns null when the order does not exist", async () => {
    fetchMock.mockResolvedValue(
      jsonResponse({ message: "Service order not found with id: 7" }, 404),
    );

    await expect(getOrder("token", 7)).resolves.toBeNull();
  });

  it("does not hide other errors behind a 'not found'", async () => {
    fetchMock.mockResolvedValue(
      jsonResponse({ message: "Internal error" }, 500),
    );

    await expect(getOrder("token", 7)).rejects.toBeInstanceOf(ApiError);
  });
});

describe("downloadOrderReport", () => {
  const fetchMock = vi.fn<typeof fetch>();

  beforeEach(() => {
    vi.stubEnv("API_BASE_URL", "https://api.example.com");
    vi.stubGlobal("fetch", fetchMock);
  });

  it("accepts JSON as well as PDF, so a missing order comes back as a 404 instead of a server error", async () => {
    fetchMock.mockResolvedValue(
      new Response("%PDF-1.5", {
        status: 200,
        headers: { "Content-Type": "application/pdf" },
      }),
    );

    await downloadOrderReport("token", 7);

    const [url, init] = fetchMock.mock.calls[0];
    expect(String(url)).toBe("https://api.example.com/orders/7/report");
    expect((init?.headers as Record<string, string>).Accept).toBe(
      "application/pdf, application/json",
    );
  });
});
