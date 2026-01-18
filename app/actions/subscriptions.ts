"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import type {
  CreateSubscriptionInput,
  UpdateSubscriptionInput,
  Subscription,
  SubscriptionWithService,
} from "@/types/subscription";

/**
 * Получить все подписки текущего пользователя с данными сервисов
 */
export async function getSubscriptions(): Promise<SubscriptionWithService[]> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Пользователь не авторизован");
  }

  const { data, error } = await supabase
    .from("subscriptions")
    .select(`
      *,
      services_catalog (
        id,
        name,
        logo_url,
        brand_color,
        default_currency
      )
    `)
    .eq("user_id", user.id)
    .eq("active", true)
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Ошибка получения подписок:", error);
    throw new Error("Не удалось получить подписки");
  }

  // Преобразуем данные Supabase в наш формат
  // Supabase возвращает services_catalog как массив при JOIN
  return (data || []).map((item: any) => {
    const service = Array.isArray(item.services_catalog) 
      ? (item.services_catalog[0] || null)
      : (item.services_catalog || null);
    
    // Удаляем services_catalog из объекта, оставляем только service
    const { services_catalog, ...subscription } = item;
    return {
      ...subscription,
      service,
    };
  }) as SubscriptionWithService[];
}

/**
 * Получить подписку по ID
 */
export async function getSubscriptionById(
  id: string
): Promise<Subscription | null> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Пользователь не авторизован");
  }

  const { data, error } = await supabase
    .from("subscriptions")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (error) {
    console.error("Ошибка получения подписки:", error);
    return null;
  }

  return data as Subscription;
}

/**
 * Создать новую подписку
 */
export async function createSubscription(
  input: CreateSubscriptionInput
): Promise<Subscription> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Пользователь не авторизован");
  }

  const { data, error } = await supabase
    .from("subscriptions")
    .insert({
      user_id: user.id,
      service_id: input.service_id || null,
      name: input.name,
      cost: input.cost,
      currency: input.currency,
      period: input.period,
      start_date: input.start_date,
      active: input.active ?? true,
    })
    .select()
    .single();

  if (error) {
    console.error("Ошибка создания подписки:", error);
    throw new Error("Не удалось создать подписку");
  }

  revalidatePath("/dashboard");
  return data as Subscription;
}

/**
 * Обновить подписку
 */
export async function updateSubscription(
  id: string,
  input: UpdateSubscriptionInput
): Promise<Subscription> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Пользователь не авторизован");
  }

  // Проверяем, что подписка принадлежит пользователю
  const { data: existingSubscription } = await supabase
    .from("subscriptions")
    .select("id")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (!existingSubscription) {
    throw new Error("Подписка не найдена или у вас нет доступа");
  }

  const { data, error } = await supabase
    .from("subscriptions")
    .update(input)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Ошибка обновления подписки:", error);
    throw new Error("Не удалось обновить подписку");
  }

  revalidatePath("/dashboard");
  return data as Subscription;
}

/**
 * Удалить подписку (помечает как неактивную)
 */
export async function deleteSubscription(id: string): Promise<void> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Пользователь не авторизован");
  }

  // Проверяем, что подписка принадлежит пользователю
  const { data: existingSubscription } = await supabase
    .from("subscriptions")
    .select("id")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (!existingSubscription) {
    throw new Error("Подписка не найдена или у вас нет доступа");
  }

  const { error } = await supabase
    .from("subscriptions")
    .update({ active: false })
    .eq("id", id);

  if (error) {
    console.error("Ошибка удаления подписки:", error);
    throw new Error("Не удалось удалить подписку");
  }

  revalidatePath("/dashboard");
}
