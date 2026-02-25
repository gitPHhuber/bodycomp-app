# BodyComp — Анализ состава тела

PWA-приложение: образовательная страница + калькулятор состава тела + поиск клиник DXA.

## Структура

```
/               — Образовательная landing page (3D-модели, квиз, статистика)
/analyzer       — Калькулятор состава тела (Navy Body Fat Formula)
/clinics        — Поиск клиник + запись на DXA
```

## Стек

- **React 18** + React Router 6
- **Three.js** — 3D-модели тела и кости
- **Vite** — сборка
- Нулевой бэкенд — всё работает на клиенте

## Деплой на Netlify

### Вариант A: Быстрый (drag & drop)

1. Откройте [app.netlify.com/drop](https://app.netlify.com/drop)
2. Перетащите папку `dist/` в окно
3. Готово! Сайт доступен по ссылке

### Вариант B: Через Git (автодеплой)

1. Залейте проект на GitHub/GitLab
2. В Netlify: **Add new site** → **Import from Git**
3. Настройки сборки уже в `netlify.toml`:
   - Build command: `npm run build`
   - Publish directory: `dist`
4. Каждый push = автодеплой

### Вариант C: Netlify CLI

```bash
npm install -g netlify-cli
netlify login
netlify deploy --prod --dir=dist
```

## Локальная разработка

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # Сборка в dist/
npm run preview    # Превью сборки
```

## Кастомный домен

1. В Netlify: **Domain management** → **Add custom domain**
2. Укажите домен (например bodycomp.ru)
3. Настройте DNS: CNAME запись → ваш-сайт.netlify.app
4. HTTPS включится автоматически (Let's Encrypt)

## Что нужно поменять

- `/src/pages/ClinicsPage.jsx` — реальные данные клиник (адреса, телефоны, цены)
- `/src/pages/LandingPage.jsx` — CTA кнопка «Записаться на DXA» (ссылка на WhatsApp/телефон)
- `/public/manifest.json` — URL сайта
- `/public/robots.txt` — URL sitemap
