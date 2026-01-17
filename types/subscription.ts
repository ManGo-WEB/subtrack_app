// Типы периодов подписки
export type PeriodType =
  | "weekly"
  | "monthly"
  | "3_months"
  | "6_months"
  | "yearly"
  | "lifetime";

// Интерфейс подписки
export interface Subscription {
  id: string;
  user_id: string;
  service_id: number | null;
  name: string;
  cost: number;
  currency: "RUB" | "USD" | "EUR";
  period: PeriodType;
  start_date: string; // ISO date string
  active: boolean;
  created_at?: string;
  updated_at?: string;
}

// Данные для создания подписки
export interface CreateSubscriptionInput {
  service_id?: number | null;
  name: string;
  cost: number;
  currency: "RUB" | "USD" | "EUR";
  period: PeriodType;
  start_date: string;
  active?: boolean;
}

// Данные для обновления подписки
export interface UpdateSubscriptionInput {
  service_id?: number | null;
  name?: string;
  cost?: number;
  currency?: "RUB" | "USD" | "EUR";
  period?: PeriodType;
  start_date?: string;
  active?: boolean;
}

import type { ServiceCatalog } from "./service";

// Подписка с расширенной информацией (например, с данными сервиса)
export interface SubscriptionWithService extends Subscription {
  service?: ServiceCatalog | null;
}
