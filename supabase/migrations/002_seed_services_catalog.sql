-- Заполнение каталога популярных сервисов
-- Выполняется только при первом запуске

INSERT INTO public.services_catalog (name, logo_url, brand_color, default_currency)
VALUES
  -- Мультиподписки
  ('Яндекс Плюс', NULL, '#FC3F1D', 'RUB'),
  ('СберПрайм', NULL, '#048055', 'RUB'),
  ('MTS Premium', NULL, '#E20011', 'RUB'),
  ('Тинькофф Premium', NULL, '#FFDD2D', 'RUB'),
  ('Ozon Premium', NULL, '#005BFF', 'RUB'),
  
  -- Российские стриминги
  ('Кинопоиск HD', NULL, '#FF7F00', 'RUB'),
  ('Okko', NULL, '#000000', 'RUB'),
  ('Ivi', NULL, '#FF6900', 'RUB'),
  ('Wink', NULL, '#0066CC', 'RUB'),
  ('Kion', NULL, '#000000', 'RUB'),
  
  -- Зарубежные сервисы
  ('YouTube Premium', NULL, '#FF0000', 'USD'),
  ('ChatGPT Plus', NULL, '#10A37F', 'USD'),
  ('Apple Music', NULL, '#FA243C', 'USD'),
  ('Spotify Premium', NULL, '#1DB954', 'USD'),
  ('Netflix', NULL, '#E50914', 'USD'),
  ('Microsoft 365', NULL, '#0078D4', 'USD'),
  ('Adobe Creative Cloud', NULL, '#FF0000', 'USD'),
  ('Midjourney', NULL, '#000000', 'USD'),
  ('Google One', NULL, '#4285F4', 'USD'),
  ('iCloud+', NULL, '#000000', 'USD')
ON CONFLICT (name) DO NOTHING;
