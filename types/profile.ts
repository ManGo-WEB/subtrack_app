// Интерфейс профиля пользователя
export interface Profile {
  id: string; // UUID, ссылка на auth.users
  currency: "RUB" | "USD" | "EUR";
  created_at?: string;
  updated_at?: string;
}

// Данные для обновления профиля
export interface UpdateProfileInput {
  currency?: "RUB" | "USD" | "EUR";
}
