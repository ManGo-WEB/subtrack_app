-- Создание таблицы profiles
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  currency TEXT NOT NULL DEFAULT 'RUB',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Создание таблицы services_catalog
CREATE TABLE IF NOT EXISTS public.services_catalog (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  logo_url TEXT,
  brand_color TEXT,
  default_currency TEXT NOT NULL DEFAULT 'RUB',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Создание таблицы subscriptions
CREATE TABLE IF NOT EXISTS public.subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  service_id INTEGER REFERENCES public.services_catalog(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  cost NUMERIC(10, 2) NOT NULL,
  currency TEXT NOT NULL CHECK (currency IN ('RUB', 'USD', 'EUR')),
  period TEXT NOT NULL CHECK (period IN ('weekly', 'monthly', '3_months', '6_months', 'yearly', 'lifetime')),
  start_date DATE NOT NULL,
  active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Создание таблицы exchange_rates
CREATE TABLE IF NOT EXISTS public.exchange_rates (
  currency_code TEXT PRIMARY KEY CHECK (currency_code IN ('USD', 'EUR')),
  rate_to_rub NUMERIC(10, 4) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Включение RLS для всех таблиц
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services_catalog ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exchange_rates ENABLE ROW LEVEL SECURITY;

-- RLS политики для profiles
-- Пользователь может читать только свой профиль
CREATE POLICY "Пользователи могут читать только свой профиль"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

-- Пользователь может обновлять только свой профиль
CREATE POLICY "Пользователи могут обновлять только свой профиль"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- Автоматическое создание профиля при регистрации
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, currency)
  VALUES (NEW.id, 'RUB');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- RLS политики для services_catalog
-- Все аутентифицированные пользователи могут читать каталог
CREATE POLICY "Все могут читать каталог сервисов"
  ON public.services_catalog FOR SELECT
  TO authenticated
  USING (true);

-- RLS политики для subscriptions
-- Пользователь может читать только свои подписки
CREATE POLICY "Пользователи могут читать только свои подписки"
  ON public.subscriptions FOR SELECT
  USING (auth.uid() = user_id);

-- Пользователь может создавать только свои подписки
CREATE POLICY "Пользователи могут создавать свои подписки"
  ON public.subscriptions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Пользователь может обновлять только свои подписки
CREATE POLICY "Пользователи могут обновлять свои подписки"
  ON public.subscriptions FOR UPDATE
  USING (auth.uid() = user_id);

-- Пользователь может удалять только свои подписки
CREATE POLICY "Пользователи могут удалять свои подписки"
  ON public.subscriptions FOR DELETE
  USING (auth.uid() = user_id);

-- RLS политики для exchange_rates
-- Все аутентифицированные пользователи могут читать курсы валют
CREATE POLICY "Все могут читать курсы валют"
  ON public.exchange_rates FOR SELECT
  TO authenticated
  USING (true);

-- Индексы для оптимизации запросов
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id ON public.subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_subscriptions_active ON public.subscriptions(active);
CREATE INDEX IF NOT EXISTS idx_subscriptions_service_id ON public.subscriptions(service_id);

-- Функция для автоматического обновления updated_at
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Триггеры для автоматического обновления updated_at
CREATE TRIGGER set_updated_at_profiles
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_services_catalog
  BEFORE UPDATE ON public.services_catalog
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER set_updated_at_subscriptions
  BEFORE UPDATE ON public.subscriptions
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();
