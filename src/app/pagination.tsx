import Link from "next/link";

import type { OrderFilters, Page } from "@/lib/api/types";
import { ordersHref } from "@/lib/orders/filters";

const LINK = "rounded-md border border-gray-300 px-3 py-1.5 hover:bg-gray-100 dark:border-gray-700 dark:hover:bg-gray-900";
const DISABLED = "rounded-md border border-gray-200 px-3 py-1.5 text-gray-400 dark:border-gray-800 dark:text-gray-600";

function countLabel(total: number): string {
  return `${total} ${total === 1 ? "order" : "orders"}`;
}

export function Pagination({ page, filters }: { page: Page<unknown>; filters: OrderFilters }) {
  if (page.totalPages <= 1) {
    return <p className="text-sm text-gray-600 dark:text-gray-400">{countLabel(page.totalElements)}</p>;
  }

  const hasPrevious = page.page > 0;
  const hasNext = page.page + 1 < page.totalPages;

  return (
    <nav aria-label="Pagination" className="flex items-center justify-between text-sm">
      <p className="text-gray-600 dark:text-gray-400">
        Page {page.page + 1} of {page.totalPages} · {countLabel(page.totalElements)}
      </p>
      <div className="flex gap-2">
        {hasPrevious ? (
          <Link href={ordersHref(filters, page.page - 1)} className={LINK}>
            Previous
          </Link>
        ) : (
          <span className={DISABLED}>Previous</span>
        )}
        {hasNext ? (
          <Link href={ordersHref(filters, page.page + 1)} className={LINK}>
            Next
          </Link>
        ) : (
          <span className={DISABLED}>Next</span>
        )}
      </div>
    </nav>
  );
}
