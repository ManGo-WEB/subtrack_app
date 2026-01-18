-- Обновление user_id для существующих кастомных сервисов
-- Сервисы, которые используются только одним пользователем, привязываются к этому пользователю
-- Сервисы, используемые несколькими пользователями, остаются общими (user_id = NULL)

DO $$
DECLARE
  service_record RECORD;
  unique_user_id UUID;
  user_count INTEGER;
BEGIN
  -- Проходим по всем сервисам с user_id IS NULL (созданным до миграции)
  FOR service_record IN 
    SELECT DISTINCT s.id, s.name
    FROM public.services_catalog s
    WHERE s.user_id IS NULL
    ORDER BY s.id
  LOOP
    -- Проверяем, сколько разных пользователей используют этот сервис
    SELECT COUNT(DISTINCT user_id)
    INTO user_count
    FROM public.subscriptions
    WHERE service_id = service_record.id
      AND active = true;
    
    -- Если используется только одним пользователем, получаем его ID и привязываем сервис
    IF user_count = 1 THEN
      SELECT DISTINCT user_id
      INTO unique_user_id
      FROM public.subscriptions
      WHERE service_id = service_record.id
        AND active = true
      LIMIT 1;
      
      -- Привязываем сервис к этому пользователю
      IF unique_user_id IS NOT NULL THEN
        UPDATE public.services_catalog
        SET user_id = unique_user_id
        WHERE id = service_record.id;
        
        RAISE NOTICE 'Сервис "%" (ID: %) привязан к пользователю %', 
          service_record.name, service_record.id, unique_user_id;
      END IF;
    ELSIF user_count > 1 THEN
      -- Сервис используется несколькими пользователями - оставляем общим
      RAISE NOTICE 'Сервис "%" (ID: %) используется % пользователями - оставлен общим', 
        service_record.name, service_record.id, user_count;
    ELSE
      -- Сервис не используется - оставляем общим
      RAISE NOTICE 'Сервис "%" (ID: %) не используется - оставлен общим', 
        service_record.name, service_record.id;
    END IF;
  END LOOP;
END $$;
