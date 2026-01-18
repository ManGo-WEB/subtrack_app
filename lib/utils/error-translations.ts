/**
 * Перевод сообщений об ошибках от Supabase на русский язык
 */
export function translateError(errorMessage: string): string {
  const errorLower = errorMessage.toLowerCase();

  // Ошибки аутентификации
  if (errorLower.includes("invalid login credentials") || errorLower.includes("invalid credentials")) {
    return "Неверный email или пароль";
  }

  if (errorLower.includes("email not confirmed")) {
    return "Email не подтвержден. Проверьте вашу почту";
  }

  if (errorLower.includes("email rate limit exceeded")) {
    return "Превышен лимит отправки писем. Попробуйте позже";
  }

  if (errorLower.includes("signup_disabled")) {
    return "Регистрация временно отключена";
  }

  // Ошибки регистрации
  if (errorLower.includes("user already registered") || errorLower.includes("already registered")) {
    return "Пользователь с таким email уже зарегистрирован";
  }

  if (errorLower.includes("password should be at least")) {
    return "Пароль должен содержать минимум 6 символов";
  }

  // Ошибки валидации email
  // Проверяем различные варианты написания ошибки валидации email
  if (errorLower.includes("invalid email") || 
      errorLower.includes("email address") && errorLower.includes("invalid") ||
      errorLower.includes("email") && errorLower.includes("is invalid") ||
      /email\s+address.*invalid|invalid.*email\s+address/.test(errorLower) ||
      /email.*invalid|invalid.*email/.test(errorLower)) {
    return "Неверный формат email";
  }

  // Ошибки токенов
  if (errorLower.includes("invalid token") || errorLower.includes("expired token")) {
    return "Срок действия токена истек. Пожалуйста, войдите заново";
  }

  if (errorLower.includes("token has expired")) {
    return "Срок действия токена истек";
  }

  // Общие ошибки
  if (errorLower.includes("network") || errorLower.includes("fetch")) {
    return "Ошибка сети. Проверьте подключение к интернету";
  }

  if (errorLower.includes("timeout")) {
    return "Превышено время ожидания. Попробуйте еще раз";
  }

  if (errorLower.includes("too many requests")) {
    return "Слишком много запросов. Подождите немного";
  }

  // Ошибки подписок
  if (errorLower.includes("subscription") || errorLower.includes("подписк")) {
    // Если уже на русском, возвращаем как есть
    if (/[а-яё]/i.test(errorMessage)) {
      return errorMessage;
    }
  }

  // Если не найдено соответствие, возвращаем исходное сообщение
  return errorMessage;
}
