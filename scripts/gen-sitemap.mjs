import { readdir, writeFile, stat } from "node:fs/promises";
import path from "node:path";

const ORIGIN = "https://ttlmymo.github.io";
const BASE_PATH = "/korea-geography-quiz-test"; // 실서비스: /korea-geography-quiz
const SITE_URL = ORIGIN + BASE_PATH;
const today = new Date().toISOString().slice(0, 10);

const urls = [
  { loc: `${SITE_URL}/`, pri: "1.0", freq: "weekly" },
  { loc: `${SITE_URL}/en/`, pri: "0.9", freq: "monthly" },
  { loc: `${SITE_URL}/seoul/`, pri: "0.9", freq: "monthly" }
];

const dirs = await readdir("seoul", { withFileTypes: true });
for (const d of dirs) {
  if (!d.isDirectory()) continue;
  try {
    await stat(path.join("seoul", d.name, "index.html"));
    urls.push({ loc: `${SITE_URL}/seoul/${d.name}/`, pri: "0.7", freq: "monthly" });
  } catch {}
}

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((u) => `  <url>
    <loc>${u.loc}</loc>
    <lastmod>${today}</lastmod>
    <changefreq>${u.freq}</changefreq>
    <priority>${u.pri}</priority>
  </url>`).join("\n")}
</urlset>`;

await writeFile("sitemap.xml", xml, "utf8");
console.log(`sitemap.xml 생성 완료 (${urls.length}개 URL)`);
