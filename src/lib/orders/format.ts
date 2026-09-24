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

// 11 characters are a CPF (000.000.000-00), 14 are a CNPJ (00.000.000/0000-00, digits or the new alphanumeric
// format). Anything else is shown as it came.
export function formatCpfOrCnpj(value: string): string {
  if (/^\d{11}$/.test(value)) {
    return value.replace(/^(\d{3})(\d{3})(\d{3})(\d{2})$/, "$1.$2.$3-$4");
  }
  if (/^[0-9A-Z]{12}\d{2}$/.test(value)) {
    return value.replace(/^(.{2})(.{3})(.{3})(.{4})(.{2})$/, "$1.$2.$3/$4-$5");
  }
  return value;
}
