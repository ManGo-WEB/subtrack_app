-- Заполнение каталога популярных сервисов
-- Выполняется только при первом запуске

INSERT INTO public.services_catalog (name, logo_url, brand_color, default_currency)
VALUES
  ('Netflix', NULL, '#E50914', 'USD'),
  ('Spotify', NULL, '#1DB954', 'USD'),
  ('YouTube Premium', NULL, '#FF0000', 'USD'),
  ('Apple Music', NULL, '#FA243C', 'USD'),
  ('Disney+', NULL, '#113CCF', 'USD'),
  ('Яндекс Плюс', NULL, '#FC3F1D', 'RUB'),
  ('Яндекс Музыка', NULL, '#FC3F1D', 'RUB'),
  ('Ozon Premium', NULL, '#005BFF', 'RUB'),
  ('Wildberries Premium', NULL, '#A62021', 'RUB'),
  ('Twitch Turbo', NULL, '#9146FF', 'USD')
ON CONFLICT (name) DO NOTHING;
