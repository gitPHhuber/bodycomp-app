# KPI Dashboard — Еженедельный отчёт для Ильи

## Основные метрики

| Метрика | Источник | Цель (месяц 1) | Неделя 1 | Неделя 2 | Неделя 3 | Неделя 4 |
|---------|----------|-----------------|----------|----------|----------|----------|
| Визиты на сайт | Метрика + events(page_view) | 500+ | | | | |
| Уникальные посетители | Метрика | 300+ | | | | |
| Калькулятор начат | events WHERE type='calc_start' | 100+ | | | | |
| Калькулятор завершён | events WHERE type='calc_complete' | 60+ | | | | |
| Оффер показан | events WHERE type='offer_view' | 50+ | | | | |
| Заявки (все типы) | bookings COUNT(*) | 10+ | | | | |
| Из них booking | bookings WHERE lead_type='booking' | 5+ | | | | |
| Из них report_sample | bookings WHERE lead_type='report_sample' | 5+ | | | | |
| Купон использован | bookings WHERE coupon_code IS NOT NULL | 3+ | | | | |
| Confirmed | bookings WHERE status='confirmed' | 3+ | | | | |
| Completed scans | bookings WHERE status='completed' | 2+ | | | | |
| Повторные записи | bookings WHERE scan_type='repeat' | 0 (ещё рано) | | | | |
| Выручка ASVOMED | completed × 4000₽ × 50% | ₽4 000+ | | | | |
| Конверсия визит→заявка | заявки / визиты × 100% | >2% | | | | |
| Конверсия заявка→completed | completed / заявки × 100% | >30% | | | | |

## SQL-запросы для Supabase

### Заявки за неделю
```sql
SELECT count(*), lead_type, status
FROM bookings
WHERE created_at >= now() - interval '7 days'
GROUP BY lead_type, status;
```

### Конверсионная воронка за неделю
```sql
SELECT type, count(*)
FROM events
WHERE type IN ('page_view', 'calc_start', 'calc_complete', 'offer_view', 'booking_click')
  AND created_at >= now() - interval '7 days'
GROUP BY type;
```

### Купоны за неделю
```sql
SELECT count(*)
FROM bookings
WHERE coupon_code IS NOT NULL
  AND created_at >= now() - interval '7 days';
```

### Выручка (оценочная)
```sql
SELECT
  count(*) AS completed_scans,
  count(*) * 4000 * 0.5 AS estimated_revenue_rub
FROM bookings
WHERE status = 'completed'
  AND created_at >= now() - interval '30 days';
```

## Core Web Vitals (из Lighthouse / Search Console)

| Метрика | Цель | Текущее |
|---------|------|---------|
| LCP (Largest Contentful Paint) | < 2.5с | |
| CLS (Cumulative Layout Shift) | < 0.1 | |
| INP (Interaction to Next Paint) | < 200мс | |
| Performance Score (mobile) | > 70 | |

## Как заполнять

1. **Еженедельно** (каждый понедельник): выполнить SQL-запросы в Supabase Dashboard
2. **Метрика**: открыть metrika.yandex.ru → отчёт «Посещаемость» за прошлую неделю
3. **CWV**: раз в месяц проверять в Google Search Console → «Основные интернет-показатели»
4. Данные вносить в таблицу выше или в Google Sheets (копировать структуру)
