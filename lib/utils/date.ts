import { add, addWeeks, addMonths, addYears, isAfter, isBefore } from "date-fns";
import type { PeriodType } from "@/types/subscription";

/**
 * Преобразует тип периода в длительность для date-fns
 */
function periodToDuration(period: PeriodType) {
  switch (period) {
    case "weekly":
      return { weeks: 1 };
    case "monthly":
      return { months: 1 };
    case "3_months":
      return { months: 3 };
    case "6_months":
      return { months: 6 };
    case "yearly":
      return { years: 1 };
    case "lifetime":
      return null;
    default:
      return null;
  }
}

/**
 * Рассчитывает дату следующего платежа на основе якорной даты и периода
 * Формула: NextPaymentDate = StartDate + N * Interval
 * 
 * @param startDate - Дата начала подписки (якорная дата)
 * @param period - Период подписки
 * @returns Дата следующего платежа или null для lifetime подписок
 */
export function getNextPaymentDate(
  startDate: Date | string,
  period: PeriodType
): Date | null {
  // Обработка lifetime подписок
  if (period === "lifetime") {
    return null;
  }

  const start = typeof startDate === "string" ? new Date(startDate) : startDate;
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Если дата старта в будущем, то это и есть дата платежа
  if (isAfter(start, today)) {
    return start;
  }

  const duration = periodToDuration(period);
  if (!duration) {
    return null;
  }

  // Накатываем интервалы, пока дата не станет больше сегодняшней
  let nextDate = new Date(start);
  
  while (nextDate <= today) {
    nextDate = add(nextDate, duration);
  }

  return nextDate;
}

/**
 * Проверяет, близка ли дата платежа (менее указанного количества дней)
 */
export function isPaymentDateNear(
  paymentDate: Date | null,
  daysThreshold: number = 3
): boolean {
  if (!paymentDate) return false;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const diffTime = paymentDate.getTime() - today.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  return diffDays >= 0 && diffDays <= daysThreshold;
}
