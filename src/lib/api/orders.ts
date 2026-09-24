import "server-only";

import { ApiError, apiDownload, apiRequest } from "@/lib/api/client";
import type {
  CurrentUser,
  OrderFilters,
  Page,
  ServiceOrder,
} from "@/lib/api/types";

export const ORDERS_PAGE_SIZE = 10;

export function getCurrentUser(token: string): Promise<CurrentUser> {
  return apiRequest<CurrentUser>("/auth/me", { token });
}

export function listOrders(
  token: string,
  filters: OrderFilters,
): Promise<Page<ServiceOrder>> {
  return apiRequest<Page<ServiceOrder>>("/orders", {
    token,
    query: { ...filters, size: ORDERS_PAGE_SIZE },
  });
}

// Returns null when the order does not exist, so the page can show a "not found" message
export async function getOrder(
  token: string,
  id: number,
): Promise<ServiceOrder | null> {
  try {
    return await apiRequest<ServiceOrder>(`/orders/${id}`, { token });
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) {
      return null;
    }
    throw error;
  }
}

// JSON must be accepted too: errors (such as the 404 of a missing order) come back as JSON, and with an
// Accept header of only "application/pdf" the API cannot write them and answers with a server error instead
export function downloadOrderReport(
  token: string,
  id: number,
): Promise<Response> {
  return apiDownload(`/orders/${id}/report`, {
    token,
    accept: "application/pdf, application/json",
  });
}
