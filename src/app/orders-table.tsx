import Link from "next/link";

import { StatusBadge } from "@/components/status-badge";
import type { ServiceOrder } from "@/lib/api/types";
import { formatDateTime, priorityLabel } from "@/lib/orders/format";

export function OrdersTable({ orders }: { orders: ServiceOrder[] }) {
  if (orders.length === 0) {
    return <p className="py-8 text-center text-gray-600 dark:text-gray-400">No service orders match these filters.</p>;
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[720px] text-left text-sm">
        <thead className="border-b border-gray-200 text-gray-600 dark:border-gray-800 dark:text-gray-400">
          <tr>
            <th className="py-2 pr-4 font-medium">#</th>
            <th className="py-2 pr-4 font-medium">Title</th>
            <th className="py-2 pr-4 font-medium">Client</th>
            <th className="py-2 pr-4 font-medium">Technician</th>
            <th className="py-2 pr-4 font-medium">Status</th>
            <th className="py-2 pr-4 font-medium">Priority</th>
            <th className="py-2 font-medium">Created</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => (
            <tr key={order.id} className="border-b border-gray-100 dark:border-gray-900">
              <td className="py-2 pr-4 text-gray-500">{order.id}</td>
              <td className="py-2 pr-4">
                <Link href={`/orders/${order.id}`} className="font-medium hover:underline">
                  {order.title}
                </Link>
              </td>
              <td className="py-2 pr-4">{order.client.name}</td>
              <td className="py-2 pr-4">{order.technician?.name ?? "—"}</td>
              <td className="py-2 pr-4">
                <StatusBadge status={order.status} />
              </td>
              <td className="py-2 pr-4">{priorityLabel(order.priority)}</td>
              <td className="py-2 whitespace-nowrap">{formatDateTime(order.createdAt)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
