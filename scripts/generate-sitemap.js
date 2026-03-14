import { writeFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import { execSync } from "child_process";
import { ARTICLES } from "../src/content/articles.js";
import { CLINICS } from "../src/pages/ClinicsPage/data.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");
const SITEMAP_PATH = resolve(ROOT, "public/sitemap.xml");
const BASE_URL = "https://bodycomp.ru";

function getLastMod(paths) {
  for (const file of paths) {
    try {
      const output = execSync(`git log -1 --format=%cs -- ${file}`, {
        cwd: ROOT,
        encoding: "utf8",
        stdio: ["ignore", "pipe", "ignore"],
      }).trim();
      if (output) return output;
    } catch {
      // noop: fallback below
    }
  }

  return new Date().toISOString().slice(0, 10);
}

const staticUrls = [
  {
    path: "/analyzer",
    changefreq: "weekly",
    priority: "1.0",
    files: ["src/pages/AnalyzerPage/index.jsx", "src/main.jsx"],
  },
  {
    path: "/",
    changefreq: "monthly",
    priority: "0.9",
    files: ["src/pages/LandingPage/index.jsx", "src/main.jsx"],
  },
  {
    path: "/clinics",
    changefreq: "weekly",
    priority: "0.8",
    files: ["src/pages/ClinicsPage/index.jsx", "src/main.jsx"],
  },
  {
    path: "/xray",
    changefreq: "monthly",
    priority: "0.7",
    files: ["src/pages/BodyComparePage/index.jsx", "src/main.jsx"],
  },
  {
    path: "/news",
    changefreq: "weekly",
    priority: "0.8",
    files: ["src/pages/NewsPage/index.jsx", "src/content/articles.js"],
  },
  {
    path: "/repeat-dxa",
    changefreq: "weekly",
    priority: "0.8",
    files: ["src/pages/RepeatDxaPage/index.jsx", "src/main.jsx"],
  },
];

const articleUrls = ARTICLES.filter((article) => !article.noindex).map((article) => ({
  path: `/news/${article.slug}`,
  changefreq: "monthly",
  priority: "0.7",
  files: ["src/content/articles.js"],
}));

const clinicUrls = CLINICS.filter((c) => !c.comingSoon).map((c) => ({
  path: `/clinics/${c.slug}`,
  changefreq: "weekly",
  priority: "0.8",
  files: ["src/pages/ClinicsPage/data.js", "src/pages/ClinicPage/index.jsx"],
}));

const allUrls = [...staticUrls, ...articleUrls, ...clinicUrls].map((item) => ({
  ...item,
  lastmod: getLastMod(item.files),
}));

const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${allUrls
  .map(
    (item) => `  <url>\n    <loc>${BASE_URL}${item.path}</loc>\n    <lastmod>${item.lastmod}</lastmod>\n    <changefreq>${item.changefreq}</changefreq>\n    <priority>${item.priority}</priority>\n  </url>`
  )
  .join("\n")}\n</urlset>\n`;

writeFileSync(SITEMAP_PATH, xml, "utf8");
console.log(`Generated sitemap with ${allUrls.length} URLs: ${SITEMAP_PATH}`);
