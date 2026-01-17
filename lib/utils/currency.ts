import type { ExchangeRate, CBRExchangeRates } from "@/types/exchange-rate";

const CBR_API_URL = "https://www.cbr-xml-daily.ru/daily_json.js";

/**
 * Получает курсы валют от API ЦБ РФ
 */
export async function fetchCBRExchangeRates(): Promise<CBRExchangeRates> {
  try {
    const response = await fetch(CBR_API_URL);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    const data = await response.json();
    return data.Valute || {};
  } catch (error) {
    console.error("Ошибка получения курсов валют от ЦБ РФ:", error);
    throw error;
  }
}

/**
 * Преобразует данные от ЦБ РФ в формат ExchangeRate
 */
export function convertCBRToExchangeRates(
  cbrData: CBRExchangeRates
): ExchangeRate[] {
  const rates: ExchangeRate[] = [];

  // USD
  if (cbrData.USD) {
    rates.push({
      currency_code: "USD",
      rate_to_rub: cbrData.USD.Value / cbrData.USD.Nominal,
      updated_at: new Date().toISOString(),
    });
  }

  // EUR
  if (cbrData.EUR) {
    rates.push({
      currency_code: "EUR",
      rate_to_rub: cbrData.EUR.Value / cbrData.EUR.Nominal,
      updated_at: new Date().toISOString(),
    });
  }

  return rates;
}

/**
 * Конвертирует сумму из указанной валюты в RUB
 * @param amount - Сумма для конвертации
 * @param fromCurrency - Исходная валюта
 * @param exchangeRates - Массив курсов валют
 * @returns Сконвертированная сумма в RUB
 */
export function convertToRUB(
  amount: number,
  fromCurrency: "RUB" | "USD" | "EUR",
  exchangeRates: ExchangeRate[]
): number {
  if (fromCurrency === "RUB") {
    return amount;
  }

  const rate = exchangeRates.find((r) => r.currency_code === fromCurrency);
  if (!rate) {
    console.warn(`Курс для валюты ${fromCurrency} не найден`);
    return amount; // Возвращаем исходную сумму в случае ошибки
  }

  return amount * rate.rate_to_rub;
}

/**
 * Форматирует сумму с валютой и знаком "~" для конвертированных сумм
 */
export function formatCurrency(
  amount: number,
  currency: "RUB" | "USD" | "EUR",
  isConverted: boolean = false
): string {
  const sign = isConverted ? "~" : "";
  const formatted = new Intl.NumberFormat("ru-RU", {
    style: "currency",
    currency: currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);

  return sign ? `${sign}${formatted}` : formatted;
}

/**
 * Проверяет, нужно ли обновить курсы валют
 * (не чаще 1 раза в сутки)
 */
export function shouldUpdateExchangeRates(
  lastUpdated: string | null
): boolean {
  if (!lastUpdated) {
    return true;
  }

  const lastUpdateDate = new Date(lastUpdated);
  const now = new Date();
  const diffInHours = (now.getTime() - lastUpdateDate.getTime()) / (1000 * 60 * 60);

  // Обновляем, если прошло более 24 часов
  return diffInHours >= 24;
}
