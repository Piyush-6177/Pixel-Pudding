/**
 * Kitchen props drawn with the pixel raster: book, cat, lamp, cup, plants…
 * Each takes a Cv (c), a position and the palette (Q).
 */
import { Cv, BAY, mkRnd, word, HEART } from '../raster.js';
import { dishRaster } from './dishes.js';

/* ── the closed recipe book (landing hero) ── */
export function drawBook(Q, bw, bh) {
  const c = new Cv(bw + 4, bh + 14);
  const R = mkRnd(7);
  const x0 = 1, y0 = 5, cw = bw - 6, ch = bh - 5, sw = Math.max(6, Math.round(bw * 0.13));
  Q.tabs.forEach((t, i) => {
    const tx = x0 + Math.round(cw * (0.36 + i * 0.13));
    c.rect(tx, y0 - 4, Math.round(cw * 0.09), 6, t);
    c.rect(tx, y0 - 4, Math.round(cw * 0.09), 1, Q.pages);
  });
  for (let y = y0 + 3; y < y0 + ch + 4; y++) for (let x = x0 + cw; x < x0 + cw + 5; x++) c.px(x, y, y % 2 ? Q.pages : Q.pagesShade);
  for (let y = y0 + ch; y < y0 + ch + 4; y++) for (let x = x0 + 4; x < x0 + cw + 5; x++) c.px(x, y, y % 2 ? Q.pages : Q.pagesShade);
  for (let y = y0; y < y0 + ch; y++)
    for (let x = x0; x < x0 + cw; x++) {
      if (x === x0 + cw - 1 && (y === y0 || y === y0 + ch - 1)) continue;
      let col = Q.cover;
      const r = R();
      if (r < 0.035) col = Q.coverLight;
      else if (r < 0.07) col = Q.coverDark;
      const s = x - x0 + (y - y0) * 0.55 - cw * 0.62;
      if (s >= 0 && s < 4 && BAY[y & 3][x & 3] < 0.7) col = Q.coverLight;
      if (s >= 7 && s < 9) col = Q.coverLight;
      if (x > x0 + cw - 4 || y > y0 + ch - 4) if (BAY[y & 3][x & 3] < 0.55) col = Q.coverDark;
      if (y === y0) col = Q.coverLight;
      c.px(x, y, col);
    }
  c.rect(x0, y0, sw, ch, Q.coverDark);
  c.rect(x0 + sw - 2, y0, 1, ch, Q.coverLight);
  c.rect(x0 + 1, y0, 1, ch, Q.coverInner);
  for (const fy of [0.11, 0.84]) {
    const yy = y0 + Math.round(ch * fy);
    c.rect(x0, yy, sw, 3, Q.gold);
    c.rect(x0, yy, sw, 1, Q.goldLight);
    c.rect(x0, yy + 2, sw, 1, Q.goldDark);
  }
  const k = Math.max(5, Math.round(bw * 0.11));
  for (let i = 0; i < k; i++)
    for (let j = 0; j < k - i; j++) {
      c.px(x0 + cw - 1 - j, y0 + i, j === k - i - 1 ? Q.goldDark : i === 0 ? Q.goldLight : Q.gold);
      c.px(x0 + cw - 1 - j, y0 + ch - 1 - i, j === k - i - 1 ? Q.goldLight : Q.gold);
    }
  // title plate with the pudding logo mark
  const pw = Math.round((cw - sw) * 0.74), px0 = x0 + sw + Math.round((cw - sw - pw) / 2), py0 = y0 + Math.round(ch * 0.13), ph = Math.round(ch * 0.52);
  c.rect(px0 - 2, py0 - 2, pw + 4, ph + 4, Q.goldDark);
  c.rect(px0 - 1, py0 - 1, pw + 2, ph + 2, Q.gold);
  c.rect(px0 - 1, py0 - 1, pw + 2, 1, Q.goldLight);
  c.rect(px0, py0, pw, ph, Q.pages);
  for (let y = py0; y < py0 + ph; y++) for (let x = px0; x < px0 + pw; x++) if (x > px0 + pw - 3 || y > py0 + ph - 3) c.dith(x, y, Q.pagesShade, 0.5);
  // the house-special pudding sprite, same one the recipe cards use
  const dish = dishRaster('caramel-custard-pudding', Q.outline);
  const dx = Math.round(px0 + (pw - 32) / 2), dy = Math.round(py0 + (ph - 10 - 32) / 2) + 1;
  if (pw >= 34 && ph >= 44) c.blit(dish, dx, dy);
  else drawPuddingMini(c, Math.round(px0 + pw / 2), Math.round(py0 + ph * 0.58), Math.max(6, Math.round(pw * 0.24)), Q);
  word(c, 'RECIPES', Math.round(px0 + (pw - 27) / 2), py0 + ph - 8, Q.coverDark);
  const hx = Math.round(x0 + sw + (cw - sw) / 2 - 3), hy = Math.round(py0 + ph + (y0 + ch - (py0 + ph)) / 2 - 3);
  c.rows(HEART, hx, hy, { o: Q.goldDark, h: Q.heart, H: Q.heartLight });
  const rx = x0 + Math.round(cw * 0.7);
  for (let y = y0 + ch; y < y0 + ch + 10; y++) {
    const notch = y >= y0 + ch + 8;
    c.px(rx, y, notch ? null : Q.ribbon);
    c.px(rx + 1, y, Q.ribbon);
    c.px(rx + 2, y, Q.ribbonDark);
    c.px(rx + 3, y, notch ? null : Q.ribbonDark);
  }
  c.outline(Q.outline);
  return { c, coverW: cw + 1, spine: sw };
}

/** Small caramel pudding (the brand mark) for the book cover. pr ≈ half the pudding width. */
export function drawPuddingMini(c, cx, base, pr, Q) {
  const cream = '#FFFAF0', creamShade = '#E8DCCF', car = '#B5653A', carHi = '#D9895A', cherry = '#E85D6A', cherryHi = '#FFA3AC', stem = '#4F9468';
  const custard = '#FFE08A', custardL = '#FFF4C9', custardD = '#F2C14E', custardDD = '#DDA03A';
  // plate
  c.rect(cx - pr - 3, base + 1, 2 * pr + 6, 1, Q.cupShade);
  c.rect(cx - pr - 2, base, 2 * pr + 4, 1, Q.cup);
  // custard body: narrow at the top, wider at the base
  const h = Math.round(pr * 1.5);
  for (let y = 0; y < h; y++) {
    const w = Math.round(pr * 0.55 + (pr * 0.45 * y) / h);
    for (let i = -w; i <= w; i++) {
      const u = (i + w) / (2 * w);
      let col = custard;
      if (u < 0.15) col = custardL;
      else if (u > 0.85) col = custardDD;
      else if (u > 0.7) col = custardD;
      if (y < 3) col = y === 0 ? carHi : car;
      c.px(cx + i, base - h + y, col);
    }
  }
  // caramel drips
  const w0 = Math.round(pr * 0.55);
  for (const [fx, len] of [[-0.7, 3], [-0.25, 5], [0.3, 2], [0.65, 4]]) c.rect(cx + Math.round(fx * w0), base - h + 3, 1, len, car);
  // cream dollop + cherry
  c.rect(cx - 2, base - h - 2, 5, 2, cream);
  c.rect(cx - 1, base - h - 3, 3, 1, cream);
  c.px(cx + 2, base - h - 1, creamShade);
  c.rect(cx - 1, base - h - 5, 2, 2, cherry);
  c.px(cx - 1, base - h - 5, cherryHi);
  c.px(cx + 1, base - h - 6, stem);
}

export function drawPages(Q, w, h) {
  const c = new Cv(w, h);
  c.rect(0, 0, w, h, Q.pages);
  for (let y = 6; y < h - 4; y += 4) c.rect(4, y, w - 8, 1, Q.pagesShade);
  c.rect(0, 0, 3, h, Q.pagesShade);
  c.outline(Q.outline);
  return c;
}

export function cloudSprite(Q, s) {
  const w = Math.round(s * 30), h = Math.round(s * 18), c = new Cv(w, h), cx = w / 2, cy = h * 0.55;
  const parts = [[0, 0, 1], [-0.9, 0.3, 0.7], [0.95, 0.25, 0.75], [0.35, -0.4, 0.65], [-0.4, -0.25, 0.6]];
  for (const [dx, dy, r] of parts) c.ell(cx + dx * s * 10, cy + dy * s * 8 + 2, r * s * 10, r * s * 6.5, Q.cloudShade);
  for (const [dx, dy, r] of parts) c.ell(cx + dx * s * 10, cy + dy * s * 8, r * s * 9.3, r * s * 5.6, Q.cloud);
  for (const [dx, dy, r] of parts.slice(3)) c.ell(cx + dx * s * 10 - 1, cy + dy * s * 8 - 1.5, r * s * 5, r * s * 2.6, Q.cloudLight);
  return c.canvas();
}

export function drawLamp(c, cx, yb, w, h, Q) {
  const top = yb - h, sh = Math.round(h * 0.38);
  for (let j = 0; j < sh; j++) {
    const t = j / sh, hw = Math.round(w * 0.26 + w * 0.24 * t);
    for (let i = -hw; i < hw; i++) {
      const u = (i + hw) / (2 * hw);
      let col = Q.shade;
      if (u < 0.25) col = u > 0.12 && (i + j) % 2 ? Q.shade : Q.shadeLight;
      else if (u > 0.76) col = u < 0.86 && (i + j) % 2 ? Q.shade : Q.shadeDark;
      if (j % 6 === 3 && u > 0.1 && u < 0.9 && i % 2 === 0) col = Q.shadeLight;
      c.px(cx + i, top + j, col);
    }
  }
  const hb = Math.round(w * 0.5);
  c.rect(cx - hb, top + sh, 2 * hb, 2, Q.shadeRim);
  for (let i = -hb + 1; i < hb; i += 3) c.px(cx + i, top + sh + 2, Q.shadeRim);
  const st = top + sh + 2, bh = Math.max(4, Math.round(h * 0.1));
  c.rect(cx - 1, st, 3, yb - bh - st, Q.metal);
  c.rect(cx - 1, st, 1, yb - bh - st, Q.metalLight);
  c.ell(cx + 0.5, yb - bh * 0.5, w * 0.32, bh * 0.55, Q.lampBase);
  c.rect(cx - w * 0.22, yb - bh, w * 0.44, 1, Q.lampBaseLight);
  const chx = Math.round(cx + hb * 0.55);
  c.rect(chx, st, 1, Math.round(h * 0.13), Q.metal);
  c.px(chx, st + Math.round(h * 0.13), Q.gold);
  return { gx: cx, gy: top + sh };
}

export function drawCup(c, x, yb, w, Q) {
  const h = Math.round(w * 0.78), top = yb - h;
  c.ell(x + w / 2, yb - 1.6, w * 0.62, 2.3, Q.cupShade);
  c.ell(x + w / 2, yb - 2.3, w * 0.56, 1.6, Q.cup);
  const bx = x + Math.round(w * 0.14), bw = Math.round(w * 0.62), bt = top + 3, bh = h - 6;
  for (let j = 0; j < bh; j++) {
    const ins = j > bh - 4 ? j - (bh - 4) : 0;
    for (let i = ins; i < bw - ins; i++) c.px(bx + i, bt + j, i / bw > 0.72 ? Q.cupShade : Q.cup);
  }
  c.rect(bx + 1, bt + Math.round(bh * 0.38), bw - 2, 2, Q.cupAccent);
  for (let i = 2; i < bw - 2; i += 4) c.px(bx + i, bt + Math.round(bh * 0.38) + 3, Q.cupAccent);
  c.ell(bx + bw / 2, bt + 0.5, bw / 2, 1.5, Q.tea);
  c.px(bx + 3, bt, Q.teaLight);
  const hx = bx + bw, hs = Math.max(4, Math.round(bh * 0.55));
  for (let j = 0; j < hs; j++) {
    const edge = j === 0 || j === hs - 1;
    c.px(hx + (edge ? 0 : 2), bt + 2 + j, Q.cup);
    if (edge) c.px(hx + 1, bt + 2 + j, Q.cup);
  }
  return { sx: bx + bw / 2, sy: bt - 1 };
}

/* 30×14 sleeping loaf cat */
export const CAT = [
  '...o....o.....................',
  '..oqo..oqo....................',
  '..oqqooqqo..ooooooooooo.......',
  '.oqqqqqqqqooqqQqqQqqQqqoo.....',
  '.oqqqqqqqqqoqqQqqQqqQqqqqo....',
  'oqqqqqqqqqqqqqqqqqqqqqqqqqo...',
  'oqeeqqqqeeqqqqqqqqqqqqqqqqqo..',
  'oqqqpqqpqqqqqqqqqqqqqqqqqqqo..',
  'oqqqqLLqqqqqqqqqqqqqqqqqqqqo..',
  '.oqqLLLLqqqqqqqqqqqqqqqqqqqo..',
  '..oqqLLqqqqqqqqqqqqqqqqqqqqoTo',
  '...ooqqqqqqqqTTTTTTTTTTTTTTTTo',
  '.....ooooooooTTTTTTTTTTTTTTTo.',
  '.............oooooooooooooooo.',
];
export function drawCat(c, x, yb, Q) {
  const top = yb - CAT.length;
  c.rows(CAT, Math.round(x), top, { o: Q.outline, q: Q.cat, Q: Q.catDark, L: Q.catLight, e: Q.outline, p: Q.blush, T: Q.catDark });
  return { hx: x + 5, hy: top };
}

export function drawPlate(c, x, yb, w, Q) {
  c.ell(x + w / 2, yb - 2, w / 2, 2.6, Q.cupShade);
  c.ell(x + w / 2, yb - 2.6, w / 2 - 1, 1.8, Q.cup);
  const cr = Math.max(3, w * 0.2);
  [[0.3, 0], [0.68, 0], [0.5, -1]].forEach(([fx, lvl], i) => {
    const cx = x + w * fx, cy = yb - 4 + lvl * 3 - (i === 2 ? 2 : 0);
    c.ell(cx, cy + 1, cr, cr * 0.55, Q.pancakeDark);
    c.ell(cx, cy, cr, cr * 0.5, Q.cookie);
    c.px(cx - 1, cy - 1, Q.choc);
    c.px(cx + 1, cy, Q.choc);
    c.px(cx + 2, cy - 1, Q.choc);
  });
}

export function drawSucculent(c, x, yb, w, Q) {
  const ph = Math.round(w * 0.55);
  c.rect(x + 1, yb - ph, w - 2, ph, Q.pot);
  c.rect(x, yb - ph, w, 2, Q.potLight);
  c.rect(x + w - 3, yb - ph + 2, 2, ph - 2, Q.potDark);
  for (let i = 0; i < 5; i++) {
    const lx = x + w * (0.15 + i * 0.18), lh = Math.round(w * (0.35 + ((i * 7) % 3) * 0.15));
    c.rect(lx, yb - ph - lh, 2, lh, i % 2 ? Q.leaf : Q.leafDark);
    c.px(lx, yb - ph - lh, Q.leafLight);
  }
}

export function drawHangingPlant(c, x, w, len, Q) {
  const pty = Math.round(len * 0.42), cx = x + w / 2;
  c.line(cx, 0, x + 3, pty, Q.rope);
  c.line(cx, 0, x + w - 3, pty, Q.rope);
  c.line(cx, 0, cx, pty, Q.rope);
  c.ell(cx, pty, w * 0.48, w * 0.2, Q.leafDark);
  c.ell(cx, pty - 1, w * 0.42, w * 0.16, Q.leaf);
  for (let i = 0; i < 6; i++) c.px(x + 4 + (i * (w - 8)) / 5, pty - 2 - (i % 2), Q.leafLight);
  const ph = Math.round(w * 0.42);
  for (let j = 0; j < ph; j++) {
    const ins = Math.round(j * 0.18);
    c.rect(x + 2 + ins, pty + 1 + j, w - 4 - ins * 2, 1, j < 2 ? Q.potLight : Q.pot);
    c.px(x + w - 4 - ins, pty + 1 + j, Q.potDark);
  }
  for (let v = 0; v < 5; v++) {
    const vx = x + 3 + (v * (w - 6)) / 4, vl = len * (0.45 + ((v * 37) % 5) / 10);
    let px = vx;
    for (let y = pty + 2; y < pty + vl; y++) {
      px += Math.sin(y * 0.25 + v) * 0.35;
      c.px(px, y, Q.leafDark);
      if (y % 4 === 0) { c.px(px - 1, y, Q.leaf); c.px(px - 2, y - 1, Q.leafLight); }
      if (y % 4 === 2) { c.px(px + 1, y, Q.leaf); c.px(px + 2, y - 1, Q.leaf); }
    }
  }
}

export function drawShelf(c, x, y, w, Q, kind) {
  c.rect(x, y, w, 4, Q.wood);
  c.rect(x, y, w, 1, Q.woodLight);
  c.rect(x, y + 3, w, 1, Q.woodDark);
  for (const bx of [x + 5, x + w - 8]) { c.rect(bx, y + 4, 3, 2, Q.woodDark); c.rect(bx + 1, y + 6, 2, 2, Q.woodDark); }
  const u = w / 110;
  if (kind === 'jars') {
    const jars = [[4, 22, 30, 'cookie'], [30, 16, 40, 'pasta'], [50, 18, 26, 'candy']];
    jars.forEach(([fx, fw, fh, kd], i) => {
      const jx = Math.round(x + fx * u), jw = Math.max(8, Math.round(fw * u)), jh = Math.max(12, Math.round(fh * u)), top = y - jh;
      c.rect(jx, top + 3, jw, jh - 3, Q.glass);
      const ch = Math.round((jh - 6) * 0.68), cy = y - ch;
      for (let yy = cy; yy < y; yy++)
        for (let xx = jx + 1; xx < jx + jw - 1; xx++) {
          if (kd === 'pasta') c.px(xx, yy, (xx + yy) % 3 ? Q.pasta : Q.pastaDark);
          else if (kd === 'candy') c.px(xx, yy, (xx * 7 + yy * 13) % 5 < 3 ? Q.candy[(xx * 3 + yy) % 4] : Q.glassShade);
          else c.px(xx, yy, yy % 4 === 0 ? Q.pancakeDark : (xx + yy) % 5 === 0 ? Q.choc : Q.cookie);
        }
      c.rect(jx + jw - 3, top + 5, 1, jh - 7, Q.glassShade);
      c.rect(jx + 2, top + 5, 1, Math.round(jh * 0.35), Q.paper);
      c.rect(jx - 1, top, jw + 2, 3, Q.lids[i % 3]);
      c.rect(jx - 1, top, jw + 2, 1, Q.paper, 0.35);
      c.rect(jx + 2, y - Math.round(jh * 0.5), jw - 4, 3, Q.paper);
    });
    drawSucculent(c, Math.round(x + 80 * u), y, Math.max(10, Math.round(22 * u)), Q);
  } else {
    const bh = Math.max(4, Math.round(5 * u));
    let by = y;
    Q.books.forEach((b, i) => {
      const bw = Math.round((40 - i * 3) * u), bx = Math.round(x + 6 * u + (i % 2) * 2);
      by -= bh;
      c.rect(bx, by, bw, bh, b);
      c.rect(bx, by, bw, 1, Q.paper, 0.35);
      c.rect(bx + bw - 3, by + 1, 1, bh - 2, Q.gold);
    });
    const mx = Math.round(x + 56 * u), mw = Math.max(8, Math.round(14 * u)), mh = Math.max(8, Math.round(14 * u));
    c.rect(mx, y - mh, mw, mh, Q.cupAccent);
    c.rect(mx, y - mh, mw, 1, Q.paper, 0.4);
    c.rect(mx + mw, y - mh + 2, 2, 1, Q.cupAccent);
    c.rect(mx + mw + 2, y - mh + 2, 1, mh - 6, Q.cupAccent);
    c.rect(mx + mw, y - 5, 2, 1, Q.cupAccent);
    const px = Math.round(x + 80 * u), pw = Math.max(10, Math.round(20 * u)), ph = Math.round(pw * 0.7);
    c.rect(px, y - ph, pw, ph, Q.pot);
    c.rect(px - 1, y - ph, pw + 2, 2, Q.potLight);
    c.ell(px + pw / 2, y - ph - 2, pw * 0.55, 3, Q.leaf);
    for (let v = 0; v < 3; v++) {
      const vx = px + 2 + (v * (pw - 4)) / 2;
      for (let yy = y - ph; yy < y + 8 + v * 4; yy++) {
        c.px(vx + Math.sin(yy * 0.4 + v), yy, Q.leafDark);
        if (yy % 3 === 0) c.px(vx + Math.sin(yy * 0.4 + v) + 1, yy, Q.leaf);
      }
    }
  }
}

export function drawNotes(c, x, y, s, Q) {
  const w = Math.round(s * 0.55), h = Math.round(s * 0.72);
  c.rect(x + Math.round(s * 0.4), y + 2, w, h - 4, Q.paperPink);
  for (let i = 0; i < 4; i++) {
    const ly = y + 8 + i * 5;
    c.rect(x + Math.round(s * 0.4) + 4, ly, 2, 2, Q.leafDark);
    c.rect(x + Math.round(s * 0.4) + 8, ly, w - 12, 1, Q.paperLine);
  }
  c.rect(x, y, w, h, Q.paper);
  for (let ly = y + 5; ly < y + h - 3; ly += 4) c.rect(x + 3, ly, w - 6, 1, Q.paperLine);
  c.rows(HEART, x + Math.round(w / 2 - 3), y + Math.round(h * 0.55), { o: Q.outline, h: Q.heart, H: Q.heartLight });
  c.rect(x + Math.round(w / 2 - 5), y - 2, 10, 4, Q.tape);
  c.px(x + Math.round(s * 0.4) + w / 2, y + 3, Q.pin);
  c.px(x + Math.round(s * 0.4) + w / 2 + 1, y + 3, Q.pin);
}

export function drawFrame(c, x, y, w, h, Q) {
  c.rect(x, y, w, h, Q.wood);
  c.rect(x, y, w, 1, Q.woodLight);
  c.rect(x + 2, y + 2, w - 4, h - 4, Q.paper);
  c.vgrad(x + 3, y + 3, w - 6, h - 6, [Q.sky[1], Q.sky[3], Q.sky[4]]);
  const cx = x + w / 2 - 6, cy = y + h / 2 - 3;
  c.rect(cx, cy + 3, 12, 6, Q.paper);
  c.rect(cx, cy + 5, 12, 1, Q.heart);
  c.rect(cx, cy + 8, 12, 1, Q.pancakeDark);
  c.ell(cx + 6, cy + 1, 2, 2, Q.heart);
  c.px(cx + 6, cy - 1, Q.leafDark);
}

export function drawLights(c, W, Q) {
  const pegs = [];
  const step = W > 220 ? 120 : 64;
  for (let x = 0; x <= W; x += step) pegs.push(x);
  if (pegs[pegs.length - 1] < W - 1) pegs.push(W - 1);
  const yAt = (x) => {
    for (let i = 0; i < pegs.length - 1; i++)
      if (x >= pegs[i] && x <= pegs[i + 1]) {
        const m = (pegs[i] + pegs[i + 1]) / 2, h = (pegs[i + 1] - pegs[i]) / 2;
        return 2 + 10 * (1 - ((x - m) / h) ** 2);
      }
    return 2;
  };
  let py = yAt(0);
  for (let x = 0; x < W; x++) {
    const y = Math.round(yAt(x));
    for (let yy = Math.min(y, py); yy <= Math.max(y, py); yy++) c.px(x, yy, Q.wire);
    py = y;
  }
  const bulbs = [];
  let i = 0;
  for (let bx = 7; bx < W - 3; bx += 14) {
    const by = Math.round(yAt(bx)), col = Q.bulbs[i % Q.bulbs.length];
    c.rect(bx - 1, by + 1, 3, 2, Q.wire);
    c.rect(bx - 1, by + 3, 3, 4, col);
    c.px(bx, by + 7, col);
    c.px(bx - 1, by + 3, Q.bulbHi);
    bulbs.push([bx + 0.5, by + 5, col, i]);
    i++;
  }
  return bulbs;
}
