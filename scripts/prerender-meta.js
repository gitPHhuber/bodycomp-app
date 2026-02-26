/**
 * Post-build script: generates per-route HTML files with correct
 * <title> and <meta name="description"> baked in, so search-engine
 * bots (Yandex, Google) see the right meta tags without executing JS.
 *
 * Usage: node scripts/prerender-meta.js
 */

import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { resolve, dirname } from "node:path";

const DIST = resolve(import.meta.dirname, "..", "dist");

const ROUTES = [
  {
    path: "/",
    title: "Состав тела — узнайте, что скрывают ваши весы | DXA-анализ",
    description: "Ваш вес не показывает правду. Узнайте реальный процент жира, мышечную массу и риски. Бесплатный расчёт или точный DXA-анализ.",
  },
  {
    path: "/analyzer",
    title: "Калькулятор состава тела онлайн — процент жира, мышцы, метаболизм",
    description: "Бесплатный расчёт состава тела за 3 минуты. Процент жира по формуле Navy, ИМТ, FFMI, базовый метаболизм, висцеральный риск.",
  },
  {
    path: "/clinics",
    title: "Запись на DXA-сканирование тела — найти клинику",
    description: "Запишитесь на точный DXA-анализ состава тела. Stratos dR — золотой стандарт. Процент жира, мышцы, кости за 5 минут.",
  },
  {
    path: "/xray",
    title: "Рентген состава тела — сравните двух людей с одинаковым весом",
    description: "Интерактивный DXA-сканер: посмотрите, как одинаковый вес скрывает совершенно разное здоровье. Skinny fat vs атлет.",
  },
  {
    path: "/privacy",
    title: "Политика конфиденциальности — BodyComp",
    description: "Политика обработки персональных данных сайта BodyComp. Информация о сборе, хранении и защите ваших данных.",
  },
];

const template = readFileSync(resolve(DIST, "index.html"), "utf-8");

function escapeHtml(str) {
  return str.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

for (const route of ROUTES) {
  let html = template;

  // Replace <title>
  html = html.replace(
    /<title>[^<]*<\/title>/,
    `<title>${escapeHtml(route.title)}</title>`
  );

  // Replace <meta name="description">
  html = html.replace(
    /<meta name="description" content="[^"]*"/,
    `<meta name="description" content="${escapeHtml(route.description)}"`
  );

  // Replace og:title
  html = html.replace(
    /<meta property="og:title" content="[^"]*"/,
    `<meta property="og:title" content="${escapeHtml(route.title)}"`
  );

  // Replace og:description
  html = html.replace(
    /<meta property="og:description" content="[^"]*"/,
    `<meta property="og:description" content="${escapeHtml(route.description)}"`
  );

  // Replace twitter:title
  html = html.replace(
    /<meta name="twitter:title" content="[^"]*"/,
    `<meta name="twitter:title" content="${escapeHtml(route.title)}"`
  );

  // Replace twitter:description
  html = html.replace(
    /<meta name="twitter:description" content="[^"]*"/,
    `<meta name="twitter:description" content="${escapeHtml(route.description)}"`
  );

  // Set canonical og:url
  html = html.replace(
    /<meta property="og:url" content="[^"]*"/,
    `<meta property="og:url" content="https://bodycomp.ru${route.path === "/" ? "" : route.path}"`
  );

  // Write route-specific index.html
  const outDir = route.path === "/"
    ? DIST
    : resolve(DIST, route.path.slice(1));

  mkdirSync(outDir, { recursive: true });
  writeFileSync(resolve(outDir, "index.html"), html, "utf-8");

  console.log(`  ✓ ${route.path} → ${route.path === "/" ? "" : route.path + "/"}index.html`);
}

console.log(`\nPrerendered ${ROUTES.length} routes with per-page meta tags.`);
