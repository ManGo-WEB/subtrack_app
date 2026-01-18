import type { Subscription, PeriodType } from "@/types/subscription";
import type { ExchangeRate } from "@/types/exchange-rate";
import { convertToRUB } from "./currency";

/**
 * Рассчитывает месячную стоимость подписки
 * Для lifetime возвращает 0, так как это разовый платеж
 */
function getMonthlyCost(subscription: Subscription): number {
  if (subscription.period === "lifetime") {
    return 0;
  }

  const cost = subscription.cost;

  switch (subscription.period) {
    case "weekly":
      // 4.33 недели в среднем в месяце
      return cost * 4.33;
    case "monthly":
      return cost;
    case "3_months":
      // Делим на 3 месяца
      return cost / 3;
    case "6_months":
      // Делим на 6 месяцев
      return cost / 6;
    case "yearly":
      // Делим на 12 месяцев
      return cost / 12;
    default:
      return 0;
  }
}

/**
 * Рассчитывает итоговую месячную сумму всех подписок в RUB
 * Lifetime подписки НЕ учитываются в расчете
 * 
 * @param subscriptions - Массив подписок пользователя
 * @param exchangeRates - Курсы валют для конвертации
 * @returns Итоговая сумма в RUB
 */
export function calculateMonthlyTotal(
  subscriptions: Subscription[],
  exchangeRates: ExchangeRate[]
): number {
  return subscriptions.reduce((total, subscription) => {
    const monthlyCost = getMonthlyCost(subscription);
    
    if (monthlyCost === 0) {
      return total;
    }

    // Конвертируем в RUB
    const costInRUB = convertToRUB(
      monthlyCost,
      subscription.currency,
      exchangeRates
    );

    return total + costInRUB;
  }, 0);
}

/**
 * Рассчитывает итоговую сумму только по месячным подпискам в RUB
 * Учитываются только подписки с периодом "monthly"
 * 
 * @param subscriptions - Массив подписок пользователя
 * @param exchangeRates - Курсы валют для конвертации
 * @returns Итоговая сумма в RUB
 */
export function calculateMonthlyOnlyTotal(
  subscriptions: Subscription[],
  exchangeRates: ExchangeRate[]
): number {
  return subscriptions.reduce((total, subscription) => {
    // Учитываем только месячные подписки
    if (subscription.period !== "monthly") {
      return total;
    }

    // Конвертируем в RUB
    const costInRUB = convertToRUB(
      subscription.cost,
      subscription.currency,
      exchangeRates
    );

    return total + costInRUB;
  }, 0);
}
