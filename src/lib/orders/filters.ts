import type { OrderFilters, OrderPriority, OrderStatus } from "@/lib/api/types";

export const ORDER_STATUSES: readonly OrderStatus[] = ["OPEN", "IN_PROGRESS", "FINISHED", "CANCELED"];
export const ORDER_PRIORITIES: readonly OrderPriority[] = ["LOW", "MEDIUM", "HIGH"];

// What Next.js gives a page as searchParams: each value can be missing, a string or a repeated string
export type SearchParams = Record<string, string | string[] | undefined>;

function single(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function isOneOf<T extends string>(values: readonly T[], value: string | undefined): value is T {
  return value !== undefined && (values as readonly string[]).includes(value);
}

// Turns the URL query (?status=OPEN&page=2) into API filters. Invalid values are dropped instead of
// being sent to the API, so a hand-edited URL shows the unfiltered list rather than an error.
// The URL counts pages from 1 (friendlier to read), the API counts from 0.
export function parseOrderFilters(params: SearchParams): OrderFilters {
  const status = single(params.status);
  const priority = single(params.priority);
  const title = single(params.title)?.trim();
  const page = Number(single(params.page));

  return {
    status: isOneOf(ORDER_STATUSES, status) ? status : undefined,
    priority: isOneOf(ORDER_PRIORITIES, priority) ? priority : undefined,
    title: title || undefined,
    page: Number.isInteger(page) && page > 1 ? page - 1 : 0,
  };
}

// URL of the list with the same filters, on another page (apiPage counts from 0, like the API)
export function ordersHref(filters: OrderFilters, apiPage: number): string {
  const params = new URLSearchParams();
  if (filters.status) {
    params.set("status", filters.status);
  }
  if (filters.priority) {
    params.set("priority", filters.priority);
  }
  if (filters.title) {
    params.set("title", filters.title);
  }
  if (apiPage > 0) {
    params.set("page", String(apiPage + 1));
  }
  const query = params.toString();
  return query ? `/?${query}` : "/";
}
