import { notFound } from "next/navigation";
import type { NextRequest } from "next/server";

import { ApiError, ApiUnavailableError } from "@/lib/api/client";
import { downloadOrderReport } from "@/lib/api/orders";
import { requireAccessToken } from "@/lib/auth";
import { parseOrderId } from "@/lib/orders/order-id";

// GET /orders/{id}/report: fetches the PDF from the API with the token from the session cookie and passes it
// on to the browser. The browser never talks to the API and never sees the token.
export async function GET(_request: NextRequest, ctx: RouteContext<"/orders/[id]/report">) {
  const id = parseOrderId((await ctx.params).id);
  if (id === null) {
    notFound();
  }

  const token = await requireAccessToken();

  let report: Response;
  try {
    report = await downloadOrderReport(token, id);
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      notFound();
    }
    if (error instanceof ApiUnavailableError) {
      return new Response("The API did not respond in time. It may still be waking up: please try again.", {
        status: 503,
        headers: { "Content-Type": "text/plain; charset=utf-8" },
      });
    }
    throw error;
  }

  // The body is streamed through as it arrives, without loading the whole file into memory first
  return new Response(report.body, {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": report.headers.get("Content-Disposition") ?? `inline; filename="service-order-${id}.pdf"`,
      "Cache-Control": "private, no-store",
    },
  });
}
