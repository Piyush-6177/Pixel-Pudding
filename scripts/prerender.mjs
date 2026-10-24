/**
 * Build-time SEO:
 *   1. renders every route to static HTML into dist/ (so crawlers get real pages)
 *   2. writes sitemap.xml + robots.txt
 *   3. draws a pixel-art social preview PNG for every recipe into dist/og/
 *
 * Runs after `vite build` (see package.json "build").
 */
import { readFileSync, writeFileSync, mkdirSync, rmSync, existsSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { encodePNG } from './png.mjs';
import { drawText, textWidth, wrap } from './pixelfont.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const dist = resolve(root, 'dist');
const SITE = (readFileSync(resolve(root, 'src/lib/useMeta.js'), 'utf8').match(/const SITE = '([^']+)'/) || [])[1] || 'https://example.com';

const { render, RECIPES, CATEGORIES, Cv, dishRaster } = await import(pathToFileURL(resolve(root, 'dist-ssr/entry-server.js')).href);
const template = readFileSync(resolve(dist, 'index.html'), 'utf8');

/* ── 1. routes → HTML ── */
const routes = ['/', '/book', ...CATEGORIES.filter((c) => c !== 'All').map((c) => `/book?category=${c}`), ...RECIPES.map((r) => `/recipe/${r.slug}`)];
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/"/g, '&quot;');
let count = 0;
for (const url of routes) {
  const { html, meta } = render(url);
  const path = url.split('?')[0];
  const image = meta.image ? SITE + meta.image : `${SITE}/og/pixel-pudding.png`;
  const head = [
    `<title>${esc(meta.title || 'Pixel Pudding')}</title>`,
    `<meta name="description" content="${esc(meta.description || '')}">`,
    `<link rel="canonical" href="${esc(SITE + (meta.path || path))}">`,
    `<meta property="og:title" content="${esc(meta.title || '')}">`,
    `<meta property="og:description" content="${esc(meta.description || '')}">`,
    `<meta property="og:url" content="${esc(SITE + (meta.path || path))}">`,
    `<meta property="og:type" content="${path.startsWith('/recipe/') ? 'article' : 'website'}">`,
    `<meta property="og:site_name" content="Pixel Pudding">`,
    `<meta property="og:image" content="${esc(image)}">`,
    `<meta name="twitter:card" content="summary_large_image">`,
    `<meta name="twitter:image" content="${esc(image)}">`,
    meta.jsonLd ? `<script id="jsonld" type="application/ld+json">${JSON.stringify(meta.jsonLd).replace(/</g, '\\u003c')}</script>` : '',
  ].join('\n    ');
  let out = template
    .replace(/<title>[^<]*<\/title>\s*<meta name="description"[^>]*>/, head)
    .replace('<div id="root"></div>', `<div id="root">${html}</div>`);
  // category pages share /book: only the plain /book gets a file; the ?category= variants are canonicalised to it
  if (url.includes('?')) continue;
  const file = path === '/' ? resolve(dist, 'index.html') : resolve(dist, path.slice(1), 'index.html');
  mkdirSync(dirname(file), { recursive: true });
  writeFileSync(file, out);
  count++;
}
console.log(`prerendered ${count} pages`);

/* ── 2. sitemap + robots ── */
const today = new Date().toISOString().slice(0, 10);
const urls = ['/', '/book', ...RECIPES.map((r) => `/recipe/${r.slug}`)];
writeFileSync(
  resolve(dist, 'sitemap.xml'),
  `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
    urls.map((u) => `  <url><loc>${SITE}${u}</loc><lastmod>${today}</lastmod><priority>${u === '/' ? '1.0' : u === '/book' ? '0.9' : '0.8'}</priority></url>`).join('\n') +
    `\n</urlset>\n`,
);
writeFileSync(resolve(dist, 'robots.txt'), `User-agent: *\nAllow: /\nSitemap: ${SITE}/sitemap.xml\n`);
console.log(`sitemap: ${urls.length} urls`);

/* ── 3. social preview images (1200×630, drawn at 400×210 then scaled ×3) ── */
{
  mkdirSync(resolve(dist, 'og'), { recursive: true });
  const W = 400, H = 210, S = 3;
  const BG = { Breakfast: '#FFE5A0', Lunch: '#B8E0C8', Dinner: '#A9D6E5', Dessert: '#FFC8A2', Snacks: '#F59AA0' };
  const blitScaled = (c, src, ox, oy, k) => {
    for (let y = 0; y < src.h; y++) for (let x = 0; x < src.w; x++) { const i = (y * src.w + x) * 4; if (src.b[i + 3] > 0) c.rect(ox + x * k, oy + y * k, k, k, '#' + [src.b[i], src.b[i + 1], src.b[i + 2]].map((v) => v.toString(16).padStart(2, '0')).join('')); }
  };
  const draw = (recipe) => {
    const c = new Cv(W, H);
    c.rect(0, 0, W, H, '#FFF4E0');
    for (let y = 3; y < H; y += 8) for (let x = (y % 16 ? 4 : 0); x < W; x += 8) c.rect(x, y, 2, 2, '#F2DFC0');
    c.rect(0, 0, W, 5, '#4E3A3E'); c.rect(0, H - 5, W, 5, '#4E3A3E'); c.rect(0, 0, 5, H, '#4E3A3E'); c.rect(W - 5, 0, 5, H, '#4E3A3E');
    // dish tile on the left
    const tile = recipe ? BG[recipe.category] : '#FFE08A';
    c.rect(22, 22, 150, 166, '#4E3A3E'); c.rect(26, 26, 142, 158, tile);
    c.rect(26, 26, 142, 4, '#FFFFFF80');
    // the pixel photo (66×66 raw RGBA from scripts/dish-photos), falling back to the drawn sprite
    const raw = resolve(root, 'scripts/dish-photos/pixels', `${recipe ? recipe.slug : 'caramel-custard-pudding'}.rgba`);
    if (existsSync(raw)) {
      const b = readFileSync(raw), src = { w: 66, h: 66, b };
      blitScaled(c, src, 26 + (142 - 132) / 2, 26 + (158 - 132) / 2, 2);
    } else {
      const d = dishRaster(recipe ? recipe.slug : 'caramel-custard-pudding', '#4E3A3E');
      blitScaled(c, d, 26 + (142 - 128) / 2, 26 + (158 - 128) / 2, 4);
    }
    // text column
    const x0 = 192;
    drawText(c, 'PIXEL PUDDING', x0, 30, 1, '#7A5F5F');
    c.rect(x0, 40, 50, 2, '#D9645A');
    if (recipe) {
      const lines = wrap(recipe.name, 16).slice(0, 3);
      lines.forEach((l, i) => drawText(c, l, x0, 52 + i * 20, 2, '#D9645A', '#4E3A3E'));
      const y2 = 52 + lines.length * 20 + 8;
      drawText(c, `${recipe.category} · ${recipe.prepTime + recipe.cookTime} MIN`, x0, y2, 1, '#4E3A3E');
      drawText(c, `${recipe.cuisine} · ${{ 'non-veg': 'NON-VEG', egg: 'EGG', vegan: 'VEGAN' }[recipe.diet] || 'VEG'}`, x0, y2 + 12, 1, '#7A5F5F');
      // little category badge
      const bw = textWidth(recipe.category) + 8;
      c.rect(x0, H - 46, bw + 2, 14, '#4E3A3E'); c.rect(x0 + 1, H - 45, bw, 12, BG[recipe.category]);
      drawText(c, recipe.category, x0 + 5, H - 42, 1, '#4E3A3E');
    } else {
      drawText(c, 'COZY RECIPES', x0, 52, 2, '#D9645A', '#4E3A3E');
      drawText(c, 'IN A PIXEL-ART', x0, 72, 2, '#D9645A', '#4E3A3E');
      drawText(c, 'KITCHEN', x0, 92, 2, '#D9645A', '#4E3A3E');
      drawText(c, 'INDIAN HOME COOKING AND', x0, 120, 1, '#4E3A3E');
      drawText(c, 'WORLD COMFORT FOOD', x0, 132, 1, '#7A5F5F');
    }
    const out = new Uint8ClampedArray(W * S * H * S * 4);
    for (let y = 0; y < H * S; y++) for (let x = 0; x < W * S; x++) { const si = ((y / S | 0) * W + (x / S | 0)) * 4, di = (y * W * S + x) * 4; out[di] = c.b[si]; out[di + 1] = c.b[si + 1]; out[di + 2] = c.b[si + 2]; out[di + 3] = 255; }
    return encodePNG(W * S, H * S, out);
  };
  writeFileSync(resolve(dist, 'og/pixel-pudding.png'), draw(null));
  for (const r of RECIPES) writeFileSync(resolve(dist, `og/${r.slug}.png`), draw(r));
  console.log(`og images: ${RECIPES.length + 1}`);
}

rmSync(resolve(root, 'dist-ssr'), { recursive: true, force: true });
