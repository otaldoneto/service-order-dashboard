import { AppHeader } from "@/components/app-header";
import { getCurrentUser, listOrders } from "@/lib/api/orders";
import { requireAccessToken } from "@/lib/auth";
import { parseOrderFilters } from "@/lib/orders/filters";

import { OrderFilters } from "./order-filters";
import { OrdersTable } from "./orders-table";
import { Pagination } from "./pagination";

export default async function HomePage(props: PageProps<"/">) {
  const token = await requireAccessToken();
  const filters = parseOrderFilters(await props.searchParams);

  // Both calls are independent, so they run at the same time instead of one after the other
  const [user, orders] = await Promise.all([getCurrentUser(token), listOrders(token, filters)]);

  return (
    <main className="mx-auto flex w-full max-w-5xl flex-col gap-6 p-6">
      <AppHeader user={user} />
      <h1 className="text-lg font-semibold">Service orders</h1>
      <OrderFilters filters={filters} />
      <OrdersTable orders={orders.content} />
      <Pagination page={orders} filters={filters} />
    </main>
  );
}
