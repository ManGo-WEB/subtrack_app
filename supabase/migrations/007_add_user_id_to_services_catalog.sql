-- Добавление поля user_id в таблицу services_catalog
-- Предустановленные сервисы (user_id = NULL) видны всем
-- Кастомные сервисы (user_id = ID пользователя) видны только создателю

ALTER TABLE public.services_catalog
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Существующие сервисы остаются общими (user_id = NULL)
UPDATE public.services_catalog SET user_id = NULL WHERE user_id IS NULL;

-- Индекс для оптимизации запросов по user_id
CREATE INDEX IF NOT EXISTS idx_services_catalog_user_id ON public.services_catalog(user_id);

-- Удаляем уникальное ограничение на name, так как разные пользователи могут создавать сервисы с одинаковыми названиями
-- Для общих сервисов (user_id IS NULL) все равно должно быть уникальное название
ALTER TABLE public.services_catalog DROP CONSTRAINT IF EXISTS services_catalog_name_key;

-- Создаем уникальное ограничение только для общих сервисов (user_id IS NULL)
-- Пользователи могут создавать сервисы с любыми названиями, включая те, что уже есть у других
CREATE UNIQUE INDEX IF NOT EXISTS services_catalog_name_unique_global 
  ON public.services_catalog(name) 
  WHERE user_id IS NULL;

-- Обновление RLS политик для services_catalog

-- Удаляем старые политики чтения (если существуют)
DROP POLICY IF EXISTS "Все могут читать каталог сервисов" ON public.services_catalog;
DROP POLICY IF EXISTS "Пользователи могут читать общие и свои сервисы" ON public.services_catalog;

-- Политика чтения: пользователь видит предустановленные сервисы (user_id = NULL) + свои кастомные
CREATE POLICY "Пользователи могут читать общие и свои сервисы"
  ON public.services_catalog FOR SELECT
  TO authenticated
  USING (user_id IS NULL OR user_id = auth.uid());

-- Политика создания: пользователь может создавать сервисы только со своим user_id
-- Удаляем все возможные варианты политик создания (если существуют)
DROP POLICY IF EXISTS "Аутентифицированные пользователи могут создавать сервисы в каталоге" ON public.services_catalog;
DROP POLICY IF EXISTS "Пользователи могут создавать свои сервисы" ON public.services_catalog;

-- Создаем политику создания с проверкой, что user_id = auth.uid()
CREATE POLICY "Пользователи могут создавать свои сервисы"
  ON public.services_catalog FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());
