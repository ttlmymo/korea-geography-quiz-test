import { readFile, writeFile, mkdir } from "node:fs/promises";
import path from "node:path";

const src = await readFile("index.html", "utf8");
let html = src;

/* 0) 마커 추출 헬퍼 — 없거나 2개 이상이면 즉시 throw */
function cut(s, tag) {
  const a = `<!-- GEN:${tag}:START -->`, b = `<!-- GEN:${tag}:END -->`;
  const ia = s.indexOf(a), ib = s.indexOf(b);
  if (ia < 0 || ib < 0) throw new Error(`마커 없음: ${tag}`);
  if (s.indexOf(a, ia + 1) >= 0) throw new Error(`마커 중복: ${tag}`);
  return { a, b, ia, ib, inner: s.slice(ia + a.length, ib) };
}

/* 1) lang 속성 */
html = html.replace('<html lang="ko">', '<html lang="en">');

/* 2) HEAD 블록 — 한글 head에서 URL·noindex·hreflang을 그대로 물려받는다 */
const koHead   = cut(html, "HEAD").inner;
const KO_URL   = /<link rel="canonical" href="([^"]+)"/.exec(koHead)[1]; // 끝에 / 포함
const EN_URL   = KO_URL + "en/";
const NOINDEX  = /name="robots"[^>]*noindex/.test(koHead);
const HREFLANG = koHead.match(/<link rel="alternate"[^>]*>/g).join("\n");
