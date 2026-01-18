"use server";

import { createClient } from "@/lib/supabase/server";
import type { ServiceCatalog } from "@/types/service";

/**
 * Поиск сервисов в каталоге
 */
export async function searchServices(
  query: string
): Promise<ServiceCatalog[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("services_catalog")
    .select("*")
    .ilike("name", `%${query}%`)
    .limit(10);

  if (error) {
    console.error("Ошибка поиска сервисов:", error);
    return [];
  }

  return (data as ServiceCatalog[]) || [];
}

/**
 * Получить все сервисы из каталога
 */
export async function getAllServices(): Promise<ServiceCatalog[]> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("services_catalog")
    .select("*")
    .order("name", { ascending: true });

  if (error) {
    console.error("Ошибка получения сервисов:", error);
    return [];
  }

  return (data as ServiceCatalog[]) || [];
}

/**
 * Получить сервис по ID
 */
export async function getServiceById(
  id: number
): Promise<ServiceCatalog | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("services_catalog")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error("Ошибка получения сервиса:", error);
    return null;
  }

  return data as ServiceCatalog;
}

/**
 * Создать новый сервис в каталоге или вернуть существующий
 * @param name - Название сервиса
 * @param defaultCurrency - Валюта по умолчанию
 * @returns ID созданного или существующего сервиса
 */
export async function createServiceOrGetExisting(
  name: string,
  defaultCurrency: "RUB" | "USD" | "EUR" = "RUB"
): Promise<number> {
  const supabase = await createClient();

  const trimmedName = name.trim();
  if (!trimmedName) {
    throw new Error("Название сервиса не может быть пустым");
  }

  // Получаем текущего пользователя
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Пользователь не авторизован");
  }

  // Проверяем, существует ли сервис с таким названием
  // Проверяем общие сервисы (user_id IS NULL) или сервисы текущего пользователя
  // RLS политика автоматически отфильтрует сервисы других пользователей
  const { data: existing, error: checkError } = await supabase
    .from("services_catalog")
    .select("id, user_id")
    .eq("name", trimmedName)
    .maybeSingle();

  if (checkError) {
    console.error("[createServiceOrGetExisting] Ошибка проверки существования сервиса:", checkError);
    throw new Error(`Ошибка при проверке существования сервиса: ${checkError.message}`);
  }

  if (existing && existing.id) {
    console.log(`[createServiceOrGetExisting] Найден существующий сервис "${trimmedName}" с ID: ${existing.id}`);
    return existing.id;
  }

  // Если не существует, создаем новый сервис для текущего пользователя
  const { data, error } = await supabase
    .from("services_catalog")
    .insert({
      name: trimmedName,
      default_currency: defaultCurrency,
      logo_url: null,
      brand_color: null,
      user_id: user.id, // Привязываем сервис к пользователю
    })
    .select("id")
    .single();

  if (error) {
    console.error("[createServiceOrGetExisting] Ошибка создания сервиса:", error);
    throw new Error(`Не удалось создать сервис "${trimmedName}" в каталоге: ${error.message}`);
  }

  if (!data || !data.id) {
    console.error("[createServiceOrGetExisting] Сервис создан, но ID не получен");
    throw new Error(`Сервис "${trimmedName}" создан, но не удалось получить ID`);
  }

  console.log(`[createServiceOrGetExisting] Создан новый сервис "${trimmedName}" с ID: ${data.id}`);
  return data.id;
}
