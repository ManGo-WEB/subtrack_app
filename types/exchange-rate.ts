// Интерфейс курса валют
export interface ExchangeRate {
  currency_code: "USD" | "EUR";
  rate_to_rub: number; // Курс к рублю
  updated_at: string; // ISO date string
}

// Результат API ЦБ РФ
export interface CBRExchangeRates {
  [key: string]: {
    CharCode: string;
    Value: number;
    Nominal: number;
  };
}
