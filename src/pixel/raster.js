/**
 * Tiny pixel raster. Everything pixel-art on the site is drawn with this
 * into an offscreen canvas, then blitted at a whole-number scale.
 */

/** 4×4 Bayer matrix (0..1) for ordered dithering */
export const BAY = [
  [0, 8, 2, 10],
  [12, 4, 14, 6],
  [3, 11, 1, 9],
  [15, 7, 13, 5],
].map((r) => r.map((v) => (v + 0.5) / 16));

const rgbaCache = {};
/** '#RRGGBB' or '#RRGGBBAA' → [r,g,b,a(0-255)] */
export const rgba = (c) => {
  if (rgbaCache[c]) return rgbaCache[c];
  const h = c.slice(1);
  return (rgbaCache[c] = [
    parseInt(h.slice(0, 2), 16),
    parseInt(h.slice(2, 4), 16),
    parseInt(h.slice(4, 6), 16),
    h.length > 6 ? parseInt(h.slice(6, 8), 16) : 255,
  ]);
};
export const hexA = (h, a) => {
  const [r, g, b] = rgba(h);
  return `rgba(${r},${g},${b},${Math.max(0, Math.min(1, a))})`;
};
/** Deterministic random so scenes look the same every load */
export const mkRnd = (s) => () => (s = (s * 16807) % 2147483647) / 2147483647;

export class Cv {
  constructor(w, h) {
    this.w = Math.max(1, Math.round(w));
    this.h = Math.max(1, Math.round(h));
    this.b = new Uint8ClampedArray(this.w * this.h * 4);
    this.clip = null;
  }
  px(x, y, c, al) {
    if (!c) return;
    x = Math.floor(x);
    y = Math.floor(y);
    if (x < 0 || y < 0 || x >= this.w || y >= this.h) return;
    if (this.clip) {
      const [a, b, cc, d] = this.clip;
      if (x < a || y < b || x >= cc || y >= d) return;
    }
    const p = rgba(c);
    const a = (p[3] / 255) * (al === undefined ? 1 : al);
    const i = (y * this.w + x) * 4;
    const B = this.b;
    if (a >= 1) {
      B[i] = p[0];
      B[i + 1] = p[1];
      B[i + 2] = p[2];
      B[i + 3] = 255;
      return;
    }
    if (a <= 0) return;
    const da = B[i + 3] / 255;
    const oa = a + da * (1 - a);
    B[i] = (p[0] * a + B[i] * da * (1 - a)) / oa;
    B[i + 1] = (p[1] * a + B[i + 1] * da * (1 - a)) / oa;
    B[i + 2] = (p[2] * a + B[i + 2] * da * (1 - a)) / oa;
    B[i + 3] = oa * 255;
  }
  has(x, y) {
    return x >= 0 && y >= 0 && x < this.w && y < this.h && this.b[(y * this.w + x) * 4 + 3] > 0;
  }
  rect(x, y, w, h, c, al) {
    x = Math.round(x);
    y = Math.round(y);
    w = Math.round(w);
    h = Math.round(h);
    for (let j = y; j < y + h; j++) for (let i = x; i < x + w; i++) this.px(i, j, c, al);
  }
  ell(cx, cy, rx, ry, c, al) {
    for (let j = Math.floor(cy - ry - 1); j <= cy + ry + 1; j++)
      for (let i = Math.floor(cx - rx - 1); i <= cx + rx + 1; i++) {
        const dx = (i + 0.5 - cx) / rx;
        const dy = (j + 0.5 - cy) / ry;
        if (dx * dx + dy * dy <= 1) this.px(i, j, c, al);
      }
  }
  dith(x, y, c, a) {
    x = Math.floor(x);
    y = Math.floor(y);
    if (a > BAY[((y % 4) + 4) % 4][((x % 4) + 4) % 4]) this.px(x, y, c);
  }
  vgrad(x, y, w, h, cols) {
    x = Math.round(x);
    y = Math.round(y);
    w = Math.round(w);
    h = Math.round(h);
    for (let j = 0; j < h; j++) {
      const t = (j / h) * (cols.length - 1);
      const k = Math.floor(t);
      const f = t - k;
      for (let i = 0; i < w; i++)
        this.px(x + i, y + j, f > BAY[(((y + j) % 4) + 4) % 4][(((x + i) % 4) + 4) % 4] ? cols[Math.min(k + 1, cols.length - 1)] : cols[k]);
    }
  }
  line(x0, y0, x1, y1, c) {
    const n = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0), 1);
    for (let k = 0; k <= n; k++) this.px(x0 + ((x1 - x0) * k) / n, y0 + ((y1 - y0) * k) / n, c);
  }
  /** 1px outline around everything drawn so far */
  outline(c) {
    const a = [];
    for (let y = 0; y < this.h; y++)
      for (let x = 0; x < this.w; x++)
        if (!this.has(x, y) && (this.has(x - 1, y) || this.has(x + 1, y) || this.has(x, y - 1) || this.has(x, y + 1))) a.push(x, y);
    const cl = this.clip;
    this.clip = null;
    for (let i = 0; i < a.length; i += 2) this.px(a[i], a[i + 1], c);
    this.clip = cl;
  }
  /** Draw a text-row sprite: rows of chars, map char → colour, '.' = transparent */
  rows(rows, ox, oy, map) {
    rows.forEach((r, y) => {
      for (let x = 0; x < r.length; x++) {
        const ch = r[x];
        if (ch !== '.' && map[ch]) this.px(ox + x, oy + y, map[ch]);
      }
    });
  }
  blit(src, ox, oy) {
    for (let y = 0; y < src.h; y++)
      for (let x = 0; x < src.w; x++) {
        const i = (y * src.w + x) * 4;
        if (src.b[i + 3] > 0) {
          const j = ((oy + y) * this.w + ox + x) * 4;
          if (ox + x >= 0 && ox + x < this.w && oy + y >= 0 && oy + y < this.h) {
            this.b[j] = src.b[i];
            this.b[j + 1] = src.b[i + 1];
            this.b[j + 2] = src.b[i + 2];
            this.b[j + 3] = src.b[i + 3];
          }
        }
      }
  }
  canvas() {
    const cv = document.createElement('canvas');
    cv.width = this.w;
    cv.height = this.h;
    cv.getContext('2d').putImageData(new ImageData(this.b, this.w, this.h), 0, 0);
    return cv;
  }
}

/** 3×5 micro font for tiny labels on sprites */
export const FONT = {
  R: ['110', '101', '110', '101', '101'],
  E: ['111', '100', '110', '100', '111'],
  C: ['011', '100', '100', '100', '011'],
  I: ['111', '010', '010', '010', '111'],
  P: ['110', '101', '110', '100', '100'],
  S: ['011', '100', '010', '001', '110'],
};
export const word = (c, str, x, y, col) => {
  [...str].forEach((ch, i) =>
    FONT[ch]?.forEach((r, j) => {
      for (let k = 0; k < 3; k++) if (r[k] === '1') c.px(x + i * 4 + k, y + j, col);
    }),
  );
};
export const HEART = ['.oo.oo.', 'ohhohho', 'oHhhhho', '.ohhho.', '..oho..', '...o...'];
