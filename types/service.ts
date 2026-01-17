// Интерфейс каталога сервисов
export interface ServiceCatalog {
  id: number;
  name: string;
  logo_url: string | null;
  brand_color: string | null;
  default_currency: "RUB" | "USD" | "EUR";
  created_at?: string;
  updated_at?: string;
}

// Интерфейс для поиска сервисов
export interface ServiceSearchResult extends ServiceCatalog {
  // Дополнительные поля для поиска, если необходимо
}
