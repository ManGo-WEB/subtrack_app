"use server";

import { createClient } from "@/lib/supabase/server";
import {
  fetchCBRExchangeRates,
  convertCBRToExchangeRates,
  shouldUpdateExchangeRates,
} from "@/lib/utils/currency";
import type { ExchangeRate } from "@/types/exchange-rate";

/**
 * Получить курсы валют из кэша или обновить их
 */
export async function getExchangeRates(): Promise<ExchangeRate[]> {
  const supabase = await createClient();

  // Проверяем, есть ли курсы в БД и нужно ли их обновить
  const { data: cachedRates } = await supabase
    .from("exchange_rates")
    .select("*")
    .order("updated_at", { ascending: false });

  // Если есть кэш и он свежий (менее 24 часов), возвращаем его
  if (
    cachedRates &&
    cachedRates.length > 0 &&
    !shouldUpdateExchangeRates(cachedRates[0]?.updated_at)
  ) {
    return cachedRates as ExchangeRate[];
  }

  // Обновляем курсы от ЦБ РФ
  try {
    const cbrData = await fetchCBRExchangeRates();
    const exchangeRates = convertCBRToExchangeRates(cbrData);

    // Сохраняем курсы в БД (upsert - обновить или создать)
    for (const rate of exchangeRates) {
      await supabase
        .from("exchange_rates")
        .upsert(
          {
            currency_code: rate.currency_code,
            rate_to_rub: rate.rate_to_rub,
            updated_at: rate.updated_at,
          },
          {
            onConflict: "currency_code",
          }
        );
    }

    return exchangeRates;
  } catch (error) {
    console.error("Ошибка обновления курсов валют:", error);

    // Если обновление не удалось, возвращаем кэш (если есть)
    if (cachedRates && cachedRates.length > 0) {
      return cachedRates as ExchangeRate[];
    }

    // Если кэша нет, возвращаем пустой массив
    return [];
  }
}
