import type { OrderStatus } from "@/lib/api/types";
import { statusLabel } from "@/lib/orders/format";

const STATUS_STYLES: Record<OrderStatus, string> = {
  OPEN: "bg-blue-100 text-blue-800 dark:bg-blue-950 dark:text-blue-300",
  IN_PROGRESS: "bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300",
  FINISHED: "bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300",
  CANCELED: "bg-gray-200 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
};

export function StatusBadge({ status }: { status: OrderStatus }) {
  return (
    <span className={`inline-block rounded-full px-2 py-0.5 text-xs font-medium whitespace-nowrap ${STATUS_STYLES[status]}`}>
      {statusLabel(status)}
    </span>
  );
}
