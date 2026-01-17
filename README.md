# SubTrack - Трекер подписок

Веб-приложение для учета и отслеживания регулярных подписок. Позволяет пользователям централизовать управление расходами, прогнозировать даты списаний и видеть общую сумму трат в единой валюте (RUB).

## Технологический стек

- **Frontend:** Next.js 15 (App Router), TypeScript, Tailwind CSS
- **UI Library:** Shadcn/UI (Radix Primitives)
- **Backend & Auth:** Supabase (PostgreSQL, GoTrue, Realtime)
- **Работа с датами:** date-fns
- **Иконки:** Lucide-React
- **Валидация:** React Hook Form + Zod
- **Уведомления:** Sonner

## Основные возможности

- ✅ Аутентификация через Supabase Auth (Email + Пароль или Magic Link)
- ✅ Управление подписками (CRUD операции)
- ✅ Каталог популярных сервисов с автодополнением
- ✅ Расчет дат следующего платежа
- ✅ Конвертация валют (USD, EUR → RUB) по курсу ЦБ РФ
- ✅ Расчет итоговой месячной суммы
- ✅ Адаптивный дизайн (Mobile-First)
- ✅ Поддержка Dark Mode

## Установка и настройка

### 1. Клонирование репозитория

```bash
git clone <repository-url>
cd subtrack_app
```

### 2. Установка зависимостей

```bash
npm install
```

### 3. Настройка Supabase

1. Создайте проект в [Supabase](https://app.supabase.com)
2. Скопируйте `NEXT_PUBLIC_SUPABASE_URL` и `NEXT_PUBLIC_SUPABASE_ANON_KEY`
3. Создайте файл `.env.local` в корне проекта:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. Настройка базы данных

1. Откройте SQL Editor в Supabase Dashboard
2. Выполните миграции из папки `supabase/migrations/`:
   - `001_initial_schema.sql` - создание таблиц и RLS политик
   - `002_seed_services_catalog.sql` - заполнение каталога сервисов

### 5. Запуск приложения

```bash
npm run dev
```

Приложение будет доступно по адресу [http://localhost:3000](http://localhost:3000)

## Структура проекта

```
subtrack_app/
├── app/                    # Next.js App Router
│   ├── (auth)/            # Страницы аутентификации
│   ├── (main)/            # Защищенные страницы
│   ├── actions/           # Server Actions
│   └── api/               # API routes
├── components/            # React компоненты
│   ├── ui/               # UI компоненты Shadcn/UI
│   └── ...               # Бизнес-компоненты
├── lib/                   # Утилиты и хелперы
│   ├── supabase/         # Supabase клиенты
│   └── utils/            # Утилиты (даты, валюты, итоги)
├── types/                 # TypeScript типы
├── supabase/             # SQL миграции
└── public/               # Статические файлы
```

## Основные функции

### Управление подписками

- Добавление подписки с выбором сервиса из каталога или ручным вводом
- Редактирование существующих подписок
- Удаление подписок с подтверждением
- Отображение даты следующего платежа
- Визуальное выделение подписок с близкими датами платежа (< 3 дней)

### Расчеты

- Автоматический расчет даты следующего платежа на основе якорной даты
- Конвертация валют в RUB по курсу ЦБ РФ
- Расчет итоговой месячной суммы (lifetime подписки не учитываются)
- Кэширование курсов валют (обновление не чаще 1 раза в сутки)

### Безопасность

- Row Level Security (RLS) политики в Supabase
- Пользователи видят только свои подписки
- Автоматическое создание профиля при регистрации

## Разработка

### Команды

```bash
npm run dev      # Запуск dev сервера
npm run build    # Сборка для production
npm run start    # Запуск production сервера
npm run lint     # Проверка кода линтером
```

### Code Style

- Все комментарии и UI тексты на русском языке
- Строгая типизация TypeScript (Strict Mode)
- Использование React Server Components по умолчанию
- Client Components только для интерактивности

## Деплой

Приложение готово к деплою на Vercel:

1. Подключите репозиторий к Vercel
2. Добавьте переменные окружения из `.env.local`
3. Запустите деплой

## Лицензия

MIT
