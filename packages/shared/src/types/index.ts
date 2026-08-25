import type { ORDER_STATUSES, CUSTOMIZATION_FIELD_TYPES, BRAZILIAN_STATES } from "../constants/index.js";

export type OrderStatus = (typeof ORDER_STATUSES)[number];
export type CustomizationFieldType = (typeof CUSTOMIZATION_FIELD_TYPES)[number];
export type BrazilianState = (typeof BRAZILIAN_STATES)[number];
export type UserRole = "customer" | "admin";

export interface PublicUser {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  cpf: string | null;
  role: UserRole;
  createdAt: string;
}

export interface ApiErrorBody {
  error: {
    message: string;
    fields?: Record<string, string[]>;
  };
}
