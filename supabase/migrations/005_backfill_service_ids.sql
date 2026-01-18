-- Миграция для заполнения service_id для существующих подписок с service_id = NULL
-- Создает или находит сервис в каталоге по названию подписки и обновляет service_id

-- Функция для создания или получения ID сервиса
DO $$
DECLARE
  sub_record RECORD;
  service_id_found INTEGER;
BEGIN
  -- Проходим по всем подпискам с service_id = NULL
  FOR sub_record IN 
    SELECT DISTINCT name, currency 
    FROM public.subscriptions 
    WHERE service_id IS NULL
    ORDER BY name
  LOOP
    -- Проверяем, существует ли сервис с таким названием
    SELECT id INTO service_id_found
    FROM public.services_catalog
    WHERE name = sub_record.name
    LIMIT 1;

    -- Если сервис не найден, создаем новый
    IF service_id_found IS NULL THEN
      INSERT INTO public.services_catalog (name, default_currency, logo_url, brand_color)
      VALUES (sub_record.name, sub_record.currency, NULL, NULL)
      RETURNING id INTO service_id_found;
      
      RAISE NOTICE 'Создан новый сервис: % (ID: %)', sub_record.name, service_id_found;
    ELSE
      RAISE NOTICE 'Найден существующий сервис: % (ID: %)', sub_record.name, service_id_found;
    END IF;

    -- Обновляем все подписки с таким названием
    UPDATE public.subscriptions
    SET service_id = service_id_found
    WHERE name = sub_record.name 
      AND service_id IS NULL;
    
    RAISE NOTICE 'Обновлено подписок для сервиса %: %', sub_record.name, 
      (SELECT COUNT(*) FROM public.subscriptions WHERE name = sub_record.name AND service_id = service_id_found);
  END LOOP;
END $$;
