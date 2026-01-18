"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { getNextPaymentDate } from "@/lib/utils/date";
import { createServiceOrGetExisting } from "@/app/actions/services";
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
    .eq("active", true);

  if (error) {
    console.error("Ошибка получения подписок:", error);
    throw new Error("Не удалось получить подписки");
  }

  // Преобразуем данные Supabase в наш формат
  // Supabase возвращает services_catalog как массив при JOIN
  const subscriptions = (data || []).map((item: any) => {
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

  // Сортируем по дате следующего платежа (по возрастанию)
  // Подписки без даты (lifetime) идут в конец
  subscriptions.sort((a, b) => {
    const dateA = getNextPaymentDate(a.start_date, a.period);
    const dateB = getNextPaymentDate(b.start_date, b.period);
    
    // Если обе даты null (бессрочные) - сохраняем порядок
    if (!dateA && !dateB) return 0;
    // Бессрочные в конец
    if (!dateA) return 1;
    if (!dateB) return -1;
    
    // Сортируем по возрастанию даты
    return dateA.getTime() - dateB.getTime();
  });

  return subscriptions;
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

  // Если service_id не указан (null или undefined), но есть название, создаем или находим сервис в каталоге
  let serviceId = input.service_id ?? null;
  if ((serviceId === null || serviceId === undefined) && input.name && input.name.trim()) {
    try {
      serviceId = await createServiceOrGetExisting(input.name.trim(), input.currency);
      console.log(`[createSubscription] Создан/найден сервис "${input.name.trim()}" с ID: ${serviceId}`);
    } catch (error) {
      console.error("[createSubscription] Ошибка создания сервиса:", error);
      // Бросаем ошибку, чтобы пользователь знал о проблеме
      throw new Error(
        `Не удалось создать сервис "${input.name}" в каталоге. ${error instanceof Error ? error.message : "Неизвестная ошибка"}`
      );
    }
  }

  const { data, error } = await supabase
    .from("subscriptions")
    .insert({
      user_id: user.id,
      service_id: serviceId || null,
      name: input.name,
      cost: input.cost,
      currency: input.currency,
      period: input.period,
      start_date: input.start_date,
      active: input.active ?? true,
    } as any) // Приведение типа для обхода проблемы с типизацией Supabase
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
    // @ts-expect-error - Проблема с типизацией Supabase, типы не обновлены после миграций
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
    // @ts-expect-error - Проблема с типизацией Supabase, типы не обновлены после миграций
    .update({ active: false })
    .eq("id", id);

  if (error) {
    console.error("Ошибка удаления подписки:", error);
    throw new Error("Не удалось удалить подписку");
  }

  revalidatePath("/dashboard");
}
