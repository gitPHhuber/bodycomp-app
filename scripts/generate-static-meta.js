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
import { ARTICLES, NEWS_META } from "../src/content/articles.js";
import { CLINICS } from "../src/pages/ClinicsPage/data.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DIST = resolve(__dirname, "../dist");
const BASE_URL = "https://bodycomp.ru";

const ROUTES = [
  {
    path: "/analyzer",
    title: "Калькулятор состава тела онлайн — процент жира, мышцы, метаболизм",
    description:
      "Бесплатный расчёт состава тела за 3 минуты. Процент жира по формуле Navy, ИМТ, FFMI, базовый метаболизм, висцеральный риск.",
    url: `${BASE_URL}/analyzer`,
  },
  {
    path: "/clinics",
    title: "Запись на DXA-сканирование тела — найти клинику",
    description:
      "Запишитесь на точный DXA-анализ состава тела. Stratos dR — золотой стандарт. Процент жира, мышцы, кости за 5 минут.",
    url: `${BASE_URL}/clinics`,
  },
  {
    path: "/xray",
    title: "Рентген состава тела — сравните двух людей с одинаковым весом",
    description:
      "Интерактивный DXA-сканер: посмотрите, как одинаковый вес скрывает совершенно разное здоровье. Skinny fat vs атлет.",
    url: `${BASE_URL}/xray`,
  },
  {
    path: "/privacy",
    title: "Политика конфиденциальности — BodyComp",
    description:
      "Политика обработки персональных данных сайта BodyComp. Информация о сборе, хранении и защите ваших данных.",
    url: `${BASE_URL}/privacy`,
  },
  {
    path: "/news",
    title: NEWS_META.title,
    description: NEWS_META.description,
    url: `${BASE_URL}/news`,
  },
  {
    path: "/repeat-dxa",
    title: "Повторный DXA — зачем и когда делать | BODYCOMP",
    description:
      "Когда делать повторный DXA. Оптимальные интервалы, что покажет сравнение результатов: жир, мышцы, висцеральный жир, кости.",
    url: `${BASE_URL}/repeat-dxa`,
  },
];

const ARTICLE_ROUTES = ARTICLES.map((article) => ({
  path: `/news/${article.slug}`,
  title: article.metaTitle || article.title,
  description: article.description || article.subtitle,
  url: `${BASE_URL}/news/${article.slug}`,
}));

const CLINIC_ROUTES = CLINICS.filter((c) => !c.comingSoon).map((c) => ({
  path: `/clinics/${c.slug}`,
  title: `DXA-обследование в ${c.name} — запись онлайн | BODYCOMP`,
  description: `Анализ состава тела на DXA в ${c.city}: жир, мышцы, кость, висцеральный жир. ${c.address}. Запись: ${c.phone}.`,
  url: `${BASE_URL}/clinics/${c.slug}`,
}));

const ALL_ROUTES = [...ROUTES, ...ARTICLE_ROUTES, ...CLINIC_ROUTES];

const template = readFileSync(resolve(DIST, "index.html"), "utf-8");

for (const route of ALL_ROUTES) {
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

  // Replace og:url
  html = html.replace(
    /<meta\s+property="og:url"\s+content="[^"]*"\s*\/?>/,
    `<meta property="og:url" content="${route.url}" />`
  );

  // Replace canonical
  html = html.replace(
    /<link\s+rel="canonical"\s+href="[^"]*"\s*\/?>/,
    `<link rel="canonical" href="${route.url}" />`
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

console.log(`\nGenerated static meta for ${ALL_ROUTES.length} routes.`);
