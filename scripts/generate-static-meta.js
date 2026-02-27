/**
 * Post-build script: generates per-route index.html with correct meta tags.
 * This gives search bots (Yandex, Google) the right title/description
 * without requiring SSR or a prerender service.
 *
 * Usage: node scripts/generate-static-meta.js
 * Runs automatically via "npm run build".
 */

import { readFileSync, writeFileSync, mkdirSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DIST = resolve(__dirname, "../dist");

const ROUTES = [
  {
    path: "/analyzer",
    title: "Калькулятор состава тела онлайн — процент жира, мышцы, метаболизм",
    description:
      "Бесплатный расчёт состава тела за 3 минуты. Процент жира по формуле Navy, ИМТ, FFMI, базовый метаболизм, висцеральный риск.",
  },
  {
    path: "/clinics",
    title: "Запись на DXA-сканирование тела — найти клинику",
    description:
      "Запишитесь на точный DXA-анализ состава тела. Stratos dR — золотой стандарт. Процент жира, мышцы, кости за 5 минут.",
  },
  {
    path: "/xray",
    title: "Рентген состава тела — сравните двух людей с одинаковым весом",
    description:
      "Интерактивный DXA-сканер: посмотрите, как одинаковый вес скрывает совершенно разное здоровье. Skinny fat vs атлет.",
  },
  {
    path: "/privacy",
    title: "Политика конфиденциальности — BodyComp",
    description:
      "Политика обработки персональных данных сайта BodyComp. Информация о сборе, хранении и защите ваших данных.",
  },
];

const template = readFileSync(resolve(DIST, "index.html"), "utf-8");

for (const route of ROUTES) {
  let html = template;

  // Replace <title>
  html = html.replace(
    /<title>[^<]*<\/title>/,
    `<title>${route.title}</title>`
  );

  // Replace meta description
  html = html.replace(
    /<meta\s+name="description"\s+content="[^"]*"\s*\/?>/,
    `<meta name="description" content="${route.description}" />`
  );

  // Replace og:title
  html = html.replace(
    /<meta\s+property="og:title"\s+content="[^"]*"\s*\/?>/,
    `<meta property="og:title" content="${route.title}" />`
  );

  // Replace og:description
  html = html.replace(
    /<meta\s+property="og:description"\s+content="[^"]*"\s*\/?>/,
    `<meta property="og:description" content="${route.description}" />`
  );

  // Replace twitter:title
  html = html.replace(
    /<meta\s+name="twitter:title"\s+content="[^"]*"\s*\/?>/,
    `<meta name="twitter:title" content="${route.title}" />`
  );

  // Replace twitter:description
  html = html.replace(
    /<meta\s+name="twitter:description"\s+content="[^"]*"\s*\/?>/,
    `<meta name="twitter:description" content="${route.description}" />`
  );

  const dir = resolve(DIST, route.path.slice(1));
  mkdirSync(dir, { recursive: true });
  writeFileSync(resolve(dir, "index.html"), html);
  console.log(`  ✓ ${route.path}/index.html`);
}

console.log(`\nGenerated static meta for ${ROUTES.length} routes.`);
