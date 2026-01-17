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
