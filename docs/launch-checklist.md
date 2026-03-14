# Launch Checklist — BodyComp

## Сборка и деплой

- [ ] `npm run build` → 0 ошибок, 0 warnings
- [ ] Прод открывается на `bodycomp.ru`
- [ ] HTTPS работает (замок в браузере)
- [ ] Netlify env-переменные прописаны:
  - `VITE_SUPABASE_URL`
  - `VITE_SUPABASE_ANON_KEY`
  - `VITE_METRIKA_ID`

## Функциональность

- [ ] Все страницы доступны (нет белых экранов):
  - `/` (главная)
  - `/analyzer` (калькулятор)
  - `/clinics` (клиники)
  - `/clinics/medgard-orenburg` (страница клиники)
  - `/news` (статьи)
  - `/repeat-dxa` (повторное сканирование)
  - `/xray` (сравнение)
  - `/privacy` (политика)
  - `/profile` (профиль, требует авторизации)
- [ ] Калькулятор работает (quick + precise mode)
- [ ] ArchetypeCard показывается после расчёта
- [ ] OfferBanner (500₽) показывается с таймером
- [ ] Заявка реально попадает в Supabase `bookings`
- [ ] 4 SEO-статьи открываются и рендерятся
- [ ] Карта (Яндекс) показывает реальную точку на странице клиники

## Контент и юридика

- [ ] Мед. дисклеймер на OfferBanner: «Имеются противопоказания. Необходима консультация специалиста.»
- [ ] Privacy policy заполнена — **⚠️ ТРЕБУЕТСЯ ДЕЙСТВИЕ:**
  - `src/pages/PrivacyPage.jsx` строка 88: заменить `[АДРЕС]` → реальный адрес
  - `src/pages/PrivacyPage.jsx` строка 308: заменить `[EMAIL]` → реальный email
  - `src/pages/PrivacyPage.jsx` строка 311: заменить `[АДРЕС]` → почтовый адрес
  - Эти данные **обязательны по 152-ФЗ**

## SEO и индексация

- [ ] Sitemap содержит все URL (11 штук)
- [ ] `robots.txt` доступен
- [ ] Мета-теги (title, description, OG) на всех страницах
- [ ] JSON-LD разметка (Organization + WebSite) в `index.html`
- [ ] Canonical URL корректен на всех страницах
- [ ] Яндекс Вебмастер настроен (см. `docs/webmaster-setup.md`)
- [ ] Google Search Console настроен (см. `docs/webmaster-setup.md`)

## Аналитика

- [ ] Яндекс Метрика подключена (`VITE_METRIKA_ID` задан)
- [ ] Events идут в Supabase `events` (проверить в админке `/admin/analytics`)
- [ ] Цели настроены в Метрике (см. `docs/webmaster-setup.md`)

## Админка

- [ ] `/admin` открывается
- [ ] Воронка работает (`/admin/funnel`)
- [ ] Заявки отображаются (`/admin/bookings`)
- [ ] Статусы заявок можно менять

## Mobile

- [ ] Все страницы usable без горизонтального скролла
- [ ] Lighthouse mobile > 70 performance
- [ ] Touch-элементы достаточного размера (48×48px минимум)

---

**После выполнения всех пунктов** — сайт готов к первому трафику и доказательству для Ильи.
Начинайте отслеживать KPI по `docs/kpi-dashboard.md`.
