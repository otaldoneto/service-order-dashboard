// Types mirroring the JSON returned by the Service Order Management API.
// Keep them in sync with the Java DTOs (com.serviceorder.management.dtos).

export type OrderStatus = "OPEN" | "IN_PROGRESS" | "FINISHED" | "CANCELED";

export type OrderPriority = "LOW" | "MEDIUM" | "HIGH";

export type Client = {
  id: number;
  name: string;
  email: string;
  cpfOrCnpj: string;
};

export type Technician = {
  id: number;
  name: string;
  email: string;
  specialty: string;
};

export type ServiceOrder = {
  id: number;
  title: string;
  description: string;
  status: OrderStatus;
  priority: OrderPriority;
  createdAt: string;
  finishedAt: string | null;
  createdBy: string | null;
  lastModifiedBy: string | null;
  lastModifiedAt: string | null;
  rootCauseReport: string | null;
  client: Client;
  technician: Technician | null;
};

// Every paginated endpoint (GET /orders, /clients, /technicians) answers with this envelope
export type Page<T> = {
  content: T[];
  page: number;
  size: number;
  totalElements: number;
  totalPages: number;
};

// Optional filters accepted by GET /orders; an omitted field means "do not filter by it"
export type OrderFilters = {
  status?: OrderStatus;
  priority?: OrderPriority;
  clientId?: number;
  technicianId?: number;
  title?: string;
  page?: number;
  size?: number;
};

// POST /auth/login and POST /auth/refresh
export type TokenResponse = {
  accessToken: string;
  tokenType: string;
  expiresIn: number;
  refreshToken: string;
};

// GET /auth/me
export type CurrentUser = {
  email: string;
  roles: string[];
};

// Body of every error response (4xx and 5xx)
export type ApiErrorBody = {
  timestamp: string;
  status: number;
  error: string;
  message: string;
  path: string;
};