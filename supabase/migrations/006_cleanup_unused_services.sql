-- Удаление неиспользуемых сервисов из каталога
-- Удаляет сервисы, на которые не ссылается ни одна активная подписка

-- Удаление конкретного сервиса по названию (для ручного использования)
-- DELETE FROM public.services_catalog WHERE name = 'Новый сервис';

-- Удаление всех неиспользуемых сервисов (сервисы без связанных подписок)
-- ВАЖНО: Выполняйте с осторожностью! Удалятся только сервисы, которые нигде не используются
DELETE FROM public.services_catalog
WHERE id NOT IN (
  SELECT DISTINCT service_id 
  FROM public.subscriptions 
  WHERE service_id IS NOT NULL
    AND active = true
);
