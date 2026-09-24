import Form from "next/form";
import Link from "next/link";

import type { OrderFilters as Filters } from "@/lib/api/types";
import { ORDER_PRIORITIES, ORDER_STATUSES } from "@/lib/orders/filters";
import { priorityLabel, statusLabel } from "@/lib/orders/format";

const FIELD = "rounded-md border border-gray-300 bg-transparent px-2 py-1.5 text-sm dark:border-gray-700";

// A GET form: submitting it only changes the URL (?status=OPEN&title=printer), and the page reads the
// filters back from the URL. Filtered lists can be bookmarked and shared, and no client state is needed.
export function OrderFilters({ filters }: { filters: Filters }) {
  return (
    <Form action="/" className="flex flex-wrap items-end gap-3">
      <label className="flex flex-col gap-1 text-sm">
        Status
        <select name="status" defaultValue={filters.status ?? ""} className={FIELD}>
          <option value="">All</option>
          {ORDER_STATUSES.map((status) => (
            <option key={status} value={status}>
              {statusLabel(status)}
            </option>
          ))}
        </select>
      </label>
      <label className="flex flex-col gap-1 text-sm">
        Priority
        <select name="priority" defaultValue={filters.priority ?? ""} className={FIELD}>
          <option value="">All</option>
          {ORDER_PRIORITIES.map((priority) => (
            <option key={priority} value={priority}>
              {priorityLabel(priority)}
            </option>
          ))}
        </select>
      </label>
      <label className="flex flex-col gap-1 text-sm">
        Title contains
        <input name="title" defaultValue={filters.title ?? ""} className={FIELD} />
      </label>
      <button type="submit" className="rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700">
        Filter
      </button>
      <Link href="/" className="py-1.5 text-sm text-gray-600 underline dark:text-gray-400">
        Clear
      </Link>
    </Form>
  );
}
