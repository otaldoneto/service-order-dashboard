import "server-only";

import { apiRequest } from "@/lib/api/client";
import type { CurrentUser, OrderFilters, Page, ServiceOrder } from "@/lib/api/types";

export const ORDERS_PAGE_SIZE = 10;

export function getCurrentUser(token: string): Promise<CurrentUser> {
  return apiRequest<CurrentUser>("/auth/me", { token });
}

export function listOrders(token: string, filters: OrderFilters): Promise<Page<ServiceOrder>> {
  return apiRequest<Page<ServiceOrder>>("/orders", {
    token,
    query: { ...filters, size: ORDERS_PAGE_SIZE },
  });
}
