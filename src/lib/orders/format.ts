import type { OrderPriority, OrderStatus } from "@/lib/api/types";

const STATUS_LABELS: Record<OrderStatus, string> = {
  OPEN: "Open",
  IN_PROGRESS: "In progress",
  FINISHED: "Finished",
  CANCELED: "Canceled",
};

const PRIORITY_LABELS: Record<OrderPriority, string> = {
  LOW: "Low",
  MEDIUM: "Medium",
  HIGH: "High",
};

// The data belongs to a Brazilian help desk, so dates are shown in São Paulo time wherever the server runs
const DATE_TIME_FORMAT = new Intl.DateTimeFormat("en-US", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "America/Sao_Paulo",
});

export function statusLabel(status: OrderStatus): string {
  return STATUS_LABELS[status];
}

export function priorityLabel(priority: OrderPriority): string {
  return PRIORITY_LABELS[priority];
}

export function formatDateTime(isoDate: string): string {
  return DATE_TIME_FORMAT.format(new Date(isoDate));
}
