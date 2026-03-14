# Подключение индексации и аналитики — Ручной чеклист

## 1. Яндекс Вебмастер

- [ ] Зарегистрироваться на [webmaster.yandex.ru](https://webmaster.yandex.ru)
- [ ] Добавить сайт `bodycomp.ru`
- [ ] Подтвердить владение (рекомендуется: DNS TXT запись)
  - Альтернатива: мета-тег в `<head>` (уже есть generate-static-meta.js)
- [ ] Загрузить sitemap: `https://bodycomp.ru/sitemap.xml`
- [ ] Проверить robots.txt в интерфейсе Вебмастера
- [ ] Подождать индексации (3–7 дней)
- [ ] Проверить: все ли URL из sitemap проиндексированы
- [ ] Убедиться, что нет ошибок в разделе «Диагностика»

## 2. Google Search Console

- [ ] Зарегистрироваться на [search.google.com/search-console](https://search.google.com/search-console)
- [ ] Добавить домен `bodycomp.ru`
- [ ] Подтвердить владение (DNS TXT запись)
- [ ] Загрузить sitemap: `https://bodycomp.ru/sitemap.xml`
- [ ] Запросить индексацию ключевых URL вручную:
  - `https://bodycomp.ru/` (главная)
  - `https://bodycomp.ru/analyzer` (калькулятор)
  - `https://bodycomp.ru/clinics` (клиники)
  - `https://bodycomp.ru/news` (статьи)
  - `https://bodycomp.ru/repeat-dxa` (повторное сканирование)
- [ ] Проверить Core Web Vitals через раздел «Основные интернет-показатели»

## 3. Яндекс Метрика

### Создание счётчика
- [ ] Зайти на [metrika.yandex.ru](https://metrika.yandex.ru)
- [ ] Создать новый счётчик для `bodycomp.ru`
- [ ] Получить ID счётчика (числовой, например `98765432`)
- [ ] Включить Вебвизор (записи сессий)
- [ ] Включить карту кликов
- [ ] Включить карту скроллинга

### Подключение к сайту
- [ ] Прописать в Netlify: **Site settings → Environment variables**:
  ```
  VITE_METRIKA_ID=XXXXXXXX
  ```
- [ ] Перезапустить деплой на Netlify (чтобы env подхватился)
- [ ] Проверить: на сайте в DevTools → Network → `mc.yandex.ru` запросы идут

### Настройка целей
- [ ] **Калькулятор завершён** — JavaScript-событие: `calc_complete`
- [ ] **Клик «Записаться»** — JavaScript-событие: `booking_click`
- [ ] **Заявка отправлена** — JavaScript-событие: `lead_created`
- [ ] **Загрузка протокола** — JavaScript-событие: `report_download`
- [ ] **Оффер показан** — JavaScript-событие: `offer_view`
- [ ] **Купон скопирован** — JavaScript-событие: `offer_claim`

> **Примечание:** Компонент `YandexMetrika.jsx` уже подключён в `main.jsx` и загружает скрипт Метрики динамически при наличии `VITE_METRIKA_ID`. Код менять не нужно — только задать env-переменную.

## 4. Проверка robots.txt

Текущий `public/robots.txt`:
```
User-agent: *
Allow: /
Disallow: /privacy

Sitemap: https://bodycomp.ru/sitemap.xml
```

- [ ] Проверить доступность: `https://bodycomp.ru/robots.txt`
- [ ] Убедиться что `/admin` НЕ индексируется (опционально добавить `Disallow: /admin`)

## 5. Проверка sitemap.xml

- [ ] Открыть `https://bodycomp.ru/sitemap.xml` в браузере
- [ ] Убедиться что все 11 URL присутствуют
- [ ] Валидировать XML (xmlvalidation.com или встроенная проверка в Яндекс Вебмастере)
