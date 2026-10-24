/**
 * The landing-page kitchen: rainy window, table, lamp, cat, the closed book.
 * Pure canvas code, framework-free. Landing.jsx creates one scene and
 * gives it the two canvases + a few callbacks.
 *
 *   const scene = createKitchenScene({ container, canvas, fadeCanvas });
 *   scene.build({ theme, lampOn, titleBottomPx });   // (re)draw static layers
 *   scene.start(); scene.stop();                      // animation loop
 *   scene.setHover(bool); scene.startOpening(); scene.cancelOpening();
 *   scene.layout  → { S, bookPx:{x,y,w,h}, lampPx:{x,y,w,h}, ctaTopPx, originPx:{x,y} }
 */
import { Cv, hexA, mkRnd } from '../raster.js';
import { PAL, LAMP_OFF, DIM } from '../palette.js';
import {
  drawBook, drawPages, cloudSprite, drawLamp, drawCup, drawCat, CAT, drawPlate, drawSucculent,
  drawHangingPlant, drawShelf, drawNotes, drawFrame, drawLights,
} from '../sprites/props.js';

export function createKitchenScene({ container, canvas, fadeCanvas }) {
  const ctx = canvas.getContext('2d');
  const fctx = fadeCanvas.getContext('2d');
  const reduceMQ = window.matchMedia('(prefers-reduced-motion: reduce)');
  let L = null, G = null, theme = 'light', lampOn = true;
  let raf = 0, t0 = performance.now(), last = t0, hover = false, hoverAmt = 0, opening = null;

  function layout(titleBottomPx) {
    const vw = container.clientWidth, vh = container.clientHeight, S = vw >= 900 ? 3 : 2;
    const W = Math.ceil(vw / S), H = Math.ceil(vh / S), mob = vw < 700 || vw < vh * 0.9;
    const titleBottom = Math.ceil(titleBottomPx / S);
    const f = mob ? 4 : 5, bover = mob ? 6 : 10;
    let ty = Math.round(H * (mob ? 0.7 : 0.75));
    ty = Math.min(ty, Math.floor((vh - 150) / S) - bover);
    const bw = mob ? Math.round(Math.min(W * 0.44, 100)) : Math.round(Math.min(Math.max(W * 0.2, 72), 116)), bh = Math.round(bw * 1.12);
    const by = ty + bover - bh, cx = Math.round(W / 2);
    const gw = mob ? Math.round(W * 0.7) : Math.round(Math.min(Math.max(W * 0.36, 120), 240));
    const gy0 = titleBottom + 7 + f;
    const gy1max = mob ? by - 12 - f : ty - 22;
    let gh = Math.min(Math.round(gw * (mob ? 0.66 : 0.62)), gy1max - gy0);
    gh = Math.max(gh, Math.round(gw * 0.45), 36);
    const gx0 = Math.round(cx - gw / 2), gx1 = gx0 + gw, gy1 = gy0 + gh;
    let wy = gy1 + f + 11;
    if (wy > ty - 6) wy = ty - 6;
    const cwid = Math.round(gw * 0.17);
    return { S, W, H, mob, f, ty, bw, bh, by, bx: Math.round(cx - bw / 2), cx, gx0, gx1, gy0, gy1, gw, gh, wy, cwid, bover };
  }

  function build(opts) {
    theme = opts.theme;
    lampOn = opts.lampOn;
    L = layout(opts.titleBottomPx);
    const { S, W, H, mob, f, ty, bw, bh, bx, by, cx, gx0, gx1, gy0, gy1, gw, gh, wy, cwid, bover } = L;
    const Q = PAL[theme], R = mkRnd(42);
    canvas.width = fadeCanvas.width = W;
    canvas.height = fadeCanvas.height = H;
    for (const cv of [canvas, fadeCanvas]) { cv.style.width = W * S + 'px'; cv.style.height = H * S + 'px'; }
    ctx.imageSmoothingEnabled = false;
    const g = { Q };

    /* back layer */
    const A = new Cv(W, H);
    A.vgrad(0, 0, W, wy, [Q.wallTop, Q.wallTop, Q.wallBot]);
    for (let y = 8; y < wy - 3; y += 12)
      for (let x = (Math.floor(y / 12) % 2) * 6 + 3; x < W; x += 12) { A.px(x, y, Q.wallPat); A.px(x - 1, y + 1, Q.wallPat); A.px(x + 1, y + 1, Q.wallPat); A.px(x, y + 2, Q.wallPat); }
    A.rect(0, wy, W, ty - wy, Q.wain); A.rect(0, wy, W, 2, Q.wainLight); A.rect(0, wy + 2, W, 1, Q.wainDark);
    for (let x = 7; x < W; x += 14) { A.rect(x, wy + 4, 1, ty - wy - 4, Q.wainDark); A.rect(x + 1, wy + 4, 1, ty - wy - 4, Q.wainLight); }
    A.rect(0, ty - 2, W, 2, Q.wainDark);
    A.rect(0, ty, W, H - ty, Q.table); A.rect(0, ty, W, 2, Q.tableLight); A.rect(0, ty + 2, W, 1, Q.tableDark);
    for (let y = ty + 9; y < H; y += 9) A.rect(0, y, W, 1, Q.tableDark, 0.55);
    for (let i = 0; i < (W * (H - ty)) / 90; i++) { const x = R() * W, y = ty + 4 + R() * (H - ty - 4), l = 6 + R() * 26; A.rect(x, y, l, 1, R() < 0.7 ? Q.tableDark : Q.tableLight, 0.8); }
    for (let i = 0; i < W / 40; i++) { const x = R() * W, y = ty + 10 + R() * (H - ty - 14); A.ell(x, y, 3, 1.4, Q.tableDeep); A.px(x, y, Q.tableDark); }
    A.rect(gx0 - f - 1, gy0 - f - 1, gw + 2 * f + 2, gh + 2 * f + 2, Q.outline);
    A.rect(gx0 - f, gy0 - f, gw + 2 * f, gh + 2 * f, Q.wood); A.rect(gx0 - f, gy0 - f, gw + 2 * f, 1, Q.woodLight); A.rect(gx0 - f, gy0 - f, 1, gh + 2 * f, Q.woodLight);
    A.rect(gx0 - f, gy1 + f - 1, gw + 2 * f, 1, Q.woodDark); A.rect(gx1 + f - 1, gy0 - f, 1, gh + 2 * f, Q.woodDark);
    A.rect(gx0 - 1, gy0 - 1, gw + 2, gh + 2, Q.woodDark);
    A.clip = [gx0, gy0, gx1, gy1];
    A.vgrad(gx0, gy0, gw, gh, Q.sky);
    if (theme === 'light') {
      const sx = gx0 + gw * 0.28, sy = gy0 + gh * 0.3;
      for (let y = gy0; y < gy0 + gh * 0.7; y++) for (let x = gx0; x < gx0 + gw * 0.6; x++) { const d = Math.hypot((x - sx) / (gw * 0.2), (y - sy) / (gh * 0.22)); if (d < 1) A.dith(x, y, Q.sunGlow, (1 - d) * 0.9); }
    } else {
      const mr = Math.max(6, Math.round(gw * 0.055));
      const skyAbove = by - gy0;
      let mx, my;
      if (mob || skyAbove >= mr * 2 + 8) { mx = gx0 + gw * 0.74; my = gy0 + Math.min(gh * 0.28, Math.max(mr + 4, (skyAbove - mr * 2) / 2 + mr)); }
      else { mx = gx0 + Math.max(mr + cwid * 0.5, (bx - gx0) / 2 + 2); my = gy0 + mr + 5; }
      mx = Math.round(mx); my = Math.round(my);
      for (let i = 0; i < (gw * gh) / 120; i++) A.px(gx0 + R() * gw, gy0 + R() * gh * 0.65, Q.star);
      for (let y = my - mr * 2.6; y < my + mr * 2.6; y++) for (let x = mx - mr * 2.6; x < mx + mr * 2.6; x++) { const d = Math.hypot(x - mx, y - my) / (mr * 2.6); if (d < 1 && d > 0.38) A.dith(x, y, Q.sky[3], (1 - d) * 0.85); }
      A.ell(mx, my, mr, mr, Q.moon); A.ell(mx - mr * 0.35, my - mr * 0.25, mr * 0.25, mr * 0.25, Q.moonShade); A.ell(mx + mr * 0.3, my + mr * 0.4, mr * 0.18, mr * 0.18, Q.moonShade); A.ell(mx + mr * 0.25, my - mr * 0.45, mr * 0.12, mr * 0.12, Q.moonShade);
      g.moon = [mx, my, mr];
    }
    A.clip = null;
    const lampW = mob ? Math.round(bw * 0.5) : Math.round(bw * 0.55), lampH = mob ? Math.round(bw * 0.86) : Math.round(bw * 0.95);
    const lampCx = mob ? W - Math.round(lampW / 2) - 6 : Math.round(cx + bw / 2 + W * 0.09 + lampW / 2);
    const lampTop = ty + 2 - lampH, glowX = lampCx, glowY = lampTop + Math.round(lampH * 0.38);
    const LR = mob ? W * 0.55 : W * 0.3;
    if (lampOn)
      for (let y = Math.max(0, glowY - LR); y < Math.min(H, glowY + LR); y++)
        for (let x = Math.max(0, glowX - LR); x < Math.min(W, glowX + LR); x++) { const d = Math.hypot(x - glowX, (y - glowY) * 1.15) / LR; if (d < 1) { const band = d < 0.3 ? 3 : d < 0.55 ? 2 : d < 0.8 ? 1 : 0; if (band) A.px(x, y, Q.lampWarm, (band * Q.lampA) / 3); } }
    for (let y = ty; y < Math.min(H, ty + (mob ? 24 : 30)); y++) { const t = (y - ty) / (mob ? 24 : 30), sp = (y - ty) * 0.8; const a = ((t < 0.5 ? 2 : 1) * Q.windowA) / 2; for (let x = gx0 - sp; x < gx1 + sp; x++) A.px(x, y, Q.windowLight, a); }
    A.rect(gx0 - f - 7, gy1 + f + 7, gw + 2 * f + 14, 3, Q.shadow, Q.shadowA * 0.7);
    A.ell(cx + 2, ty + 11, bw * 0.62, 4, Q.shadow, Q.shadowA);
    A.ell(lampCx + 2, ty + 2, lampW * 0.4, 2.5, Q.shadow, Q.shadowA);
    g.bg = A.canvas();

    /* sky layer pieces */
    const cs = mob ? 0.7 : Math.max(0.8, gw / 150);
    g.clouds = [[0.08, 0.12, 1.4 * cs, 1.3], [0.55, 0.38, 1 * cs, 2], [0.3, 0.05, 0.8 * cs, 1.7], [0.82, 0.55, 0.9 * cs, 2.4], [0.15, 0.6, 0.7 * cs, 2.9]].map(([fx, fy, s, sp]) => ({ img: cloudSprite(Q, s), x: gx0 + fx * gw, y: gy0 + fy * gh, sp }));
    const RF = new Cv(gw, gh);
    let x = 0, k = 0;
    const R2 = mkRnd(5);
    while (x < gw) {
      const w = 8 + Math.floor(R2() * 14), h = Math.round(gh * (0.08 + R2() * 0.17)), col = k % 2 ? Q.roof1 : Q.roof2, top = gh - h;
      RF.rect(x, top, w, h, col);
      if (R2() < 0.45) for (let j = 0; j < Math.floor(w / 2); j++) RF.rect(x + j, top - j, w - 2 * j, 1, col);
      if (R2() < 0.4) RF.rect(x + w - 4, top - 5, 3, 5, col);
      for (let wy2 = top + 3; wy2 < gh - 2; wy2 += 5) for (let wx = x + 2; wx < x + w - 2; wx += 4) { const r = R2(), lit = theme === 'dark' ? r < 0.55 : r < 0.12; if (lit) RF.rect(wx, wy2, 2, 2, Q.winLit); else if (r < 0.75) RF.rect(wx, wy2, 2, 2, Q.roofWin); }
      x += w; k++;
    }
    g.roofs = RF.canvas();
    g.rain = [];
    const RR = mkRnd(9);
    for (let i = 0; i < (gw * gh) / 70; i++) g.rain.push({ x: RR() * (gw + 20), y: RR() * gh, l: 3 + RR() * 5, v: (mob ? 70 : 110) + RR() * 80 });
    g.drops = [];
    for (let i = 0; i < Math.max(4, gw / 18); i++) g.drops.push({ x: 4 + RR() * (gw - 8), y: RR() * gh, v: 2 + RR() * 5 });
    g.stars = [];
    if (theme === 'dark') for (let i = 0; i < 7; i++) g.stars.push({ x: gx0 + 6 + RR() * (gw - 12), y: gy0 + 4 + RR() * gh * 0.5, p: RR() * 6 });

    /* front layer */
    const B = new Cv(W, H);
    const mvx = Math.round(gx0 + gw / 2 - 2), mhy = Math.round(gy0 + gh / 2 - 2);
    B.rect(mvx, gy0, 4, gh, Q.wood); B.rect(mvx, gy0, 1, gh, Q.woodLight); B.rect(mvx + 3, gy0, 1, gh, Q.woodDark);
    B.rect(gx0, mhy, gw, 4, Q.wood); B.rect(gx0, mhy, gw, 1, Q.woodLight); B.rect(gx0, mhy + 3, gw, 1, Q.woodDark);
    const sx0 = gx0 - f - 7, sw0 = gw + 2 * f + 14, sy = gy1 + f;
    B.rect(sx0, sy, sw0, 2, Q.woodLight); B.rect(sx0, sy + 2, sw0, 4, Q.wood); B.rect(sx0, sy + 6, sw0, 1, Q.woodDark);
    const ct = gy0 - f - 4, cb = gy1 + f + 12, chh = cb - ct;
    const wf = (yy) => { const t = yy / chh; return t < 0.6 ? cwid - t * cwid * 0.55 : t < 0.66 ? cwid * 0.5 : Math.min(cwid * 0.86, cwid * 0.5 + (t - 0.66) * cwid * 1.3); };
    const lx = gx0 - f - Math.round(cwid * 0.55), rx = gx1 + f + Math.round(cwid * 0.55);
    for (let yy = 0; yy < chh; yy++) { const w = Math.round(wf(yy)); for (let i = 0; i < w; i++) { const t = i % 7; const col = yy >= chh - 2 ? Q.curtainShade : t < 2 ? Q.curtainLight : t < 5 ? Q.curtain : Q.curtainShade; B.px(lx + i, ct + yy, col); B.px(rx - i - 1, ct + yy, col); } }
    const tieY = ct + Math.round(chh * 0.6);
    for (const [x0, dir] of [[lx, 1], [rx - 1, -1]]) for (let yy = tieY; yy < tieY + 4; yy++) for (let i = 0; i < Math.round(cwid * 0.55) + 1; i++) B.px(x0 + dir * i, yy, yy === tieY ? Q.goldLight : yy === tieY + 3 ? Q.goldDark : Q.gold);
    const rodY = ct - 3;
    B.rect(lx - 4, rodY, rx - lx + 8, 3, Q.woodDark); B.rect(lx - 4, rodY, rx - lx + 8, 1, Q.wood); B.ell(lx - 5, rodY + 1.5, 2.6, 2.6, Q.gold); B.ell(rx + 5, rodY + 1.5, 2.6, 2.6, Q.gold);
    g.bulbs = drawLights(B, W, Q);
    const catW = CAT[0].length;
    const catX = mob ? gx0 + 3 : Math.max(gx0 + 2, bx - catW - 3);
    g.cat = drawCat(B, catX, sy, Q);
    drawSucculent(B, Math.min(gx1 - 14, mob ? gx1 - 16 : bx + bw + 4), sy, mob ? 12 : 14, Q);
    if (!mob) {
      const outer = lx - 4, shW = Math.min(110, outer - 20);
      if (shW >= 56) {
        const shY = gy0 + Math.round(gh * 0.42);
        drawShelf(B, Math.round((outer - shW) / 2), shY, shW, Q, 'jars');
        drawShelf(B, W - Math.round((outer - shW) / 2) - shW, shY, shW, Q, 'books');
        const nS = Math.min(52, shW * 0.55);
        if (shY + 14 + nS * 0.75 < wy - 4) drawNotes(B, Math.round((outer - shW) / 2) + 6, shY + 16, nS, Q);
        const fW = Math.round(Math.min(40, shW * 0.4)), fH = Math.round(fW * 0.8);
        if (shY + 18 + fH < wy - 4) drawFrame(B, W - Math.round((outer - shW) / 2) - fW - 10, shY + 18, fW, fH, Q);
        drawHangingPlant(B, Math.round((outer - shW) / 2) + shW * 0.55, Math.round(Math.min(34, shW * 0.32)), Math.round(Math.min(64, shY - 14)), Q);
      }
    }
    g.lamp = drawLamp(B, lampCx, ty + 2, lampW, lampH, lampOn ? Q : Object.assign({}, Q, LAMP_OFF[theme]));
    g.lampBox = [lampCx - Math.round(lampW / 2) - 2, ty + 2 - lampH - 2, lampW + 4, lampH + 4];
    const cupW = Math.round(bw * 0.3);
    const cupX = mob ? 6 : Math.round(cx - bw / 2 - W * 0.16 - cupW);
    g.cup = drawCup(B, cupX, ty + 4, cupW, Q);
    if (!mob) { const pw = Math.round(bw * 0.38); drawPlate(B, Math.round(cx - bw / 2 - 12 - pw), ty + 5, pw, Q); }
    B.outline(Q.outline);
    for (let y = gy1 - Math.round(gh * 0.16); y < gy1; y++) for (let x = gx0; x < gx1; x++) if (!B.has(x, y)) B.dith(x, y, Q.fog, ((y - (gy1 - gh * 0.16)) / (gh * 0.16)) * 0.55);
    for (const s of [gx0 + gw * 0.05, gx0 + gw * 0.09, gx0 + gw * 0.58]) for (let j = 0; j < gh * 0.3; j++) for (const dx of [0, 1]) { const x = Math.floor(s + j + dx), y = Math.floor(gy0 + gh * 0.3 - j); if (!B.has(x, y)) B.px(x, y, Q.glassShine); }
    g.fg = B.canvas();

    const V = new Cv(W, H);
    for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) { const d = Math.hypot(((x - W / 2) / (W / 2)) * 0.9, (y - H * 0.45) / (H * 0.55)); const band = d > 1.22 ? 3 : d > 1.08 ? 2 : d > 0.95 ? 1 : 0; if (band) V.px(x, y, Q.vig, (band * Q.vigA) / 3); }
    g.vig = V.canvas();

    const bk = drawBook(Q, bw, bh);
    g.book = bk.c.canvas();
    g.bookCoverW = bk.coverW;
    g.pages = drawPages(Q, bk.coverW, bh - 5).canvas();
    G = g;
    const [lx0, ly0, lw0, lh0] = g.lampBox;
    L.bookPx = { x: bx * S, y: (by - 4) * S, w: (bw + 4) * S, h: (bh + 10) * S };
    L.lampPx = { x: lx0 * S, y: ly0 * S, w: lw0 * S, h: lh0 * S };
    L.ctaTopPx = (ty + bover) * S + 26;
    L.originPx = { x: cx * S, y: (by + bh / 2) * S };
    return L;
  }

  function frame(now) {
    raf = requestAnimationFrame(frame);
    if (now - last < 33) return;
    const dt = Math.min(0.1, (now - last) / 1000);
    last = now;
    draw(now, dt);
  }

  function draw(now, dt) {
    if (!L || !G) return;
    const t = (now - t0) / 1000, calm = reduceMQ.matches, Q = G.Q;
    const { W, H, gx0, gy0, gw, gh, bx, by, bw, bh, cx } = L;
    ctx.clearRect(0, 0, W, H);
    ctx.drawImage(G.bg, 0, 0);
    ctx.save(); ctx.beginPath(); ctx.rect(gx0, gy0, gw, gh); ctx.clip();
    for (const s of G.stars) { const on = Math.sin(t * 1.7 + s.p) > 0.2; ctx.fillStyle = Q.star; if (on) { ctx.fillRect(Math.round(s.x) - 1, Math.round(s.y), 3, 1); ctx.fillRect(Math.round(s.x), Math.round(s.y) - 1, 1, 3); } else ctx.fillRect(Math.round(s.x), Math.round(s.y), 1, 1); }
    for (const c of G.clouds) { const span = gw + c.img.width; const x = calm ? c.x : gx0 - c.img.width + ((c.x - gx0 + c.img.width + t * c.sp) % span); ctx.drawImage(c.img, Math.round(x), Math.round(c.y)); }
    ctx.drawImage(G.roofs, gx0, gy0);
    ctx.fillStyle = Q.rain; ctx.globalAlpha = 0.85;
    for (const r of G.rain) { if (!calm) { r.y += r.v * dt; if (r.y > gh) { r.y = -r.l; r.x = Math.random() * (gw + 20); } } for (let j = 0; j < r.l; j++) ctx.fillRect(Math.floor(gx0 + r.x - j * 0.35), Math.floor(gy0 + r.y + j), 1, 1); }
    ctx.globalAlpha = 1;
    for (const d of G.drops) { if (!calm) { d.y += d.v * dt; if (d.y > gh + 4) { d.y = -4; d.x = 4 + Math.random() * (gw - 8); } } ctx.globalAlpha = 0.5; ctx.fillRect(Math.floor(gx0 + d.x), Math.floor(gy0 + d.y - 6), 1, 6); ctx.globalAlpha = 1; ctx.fillRect(Math.floor(gx0 + d.x), Math.floor(gy0 + d.y), 2, 2); }
    ctx.restore();
    ctx.drawImage(G.fg, 0, 0);
    const flick = calm ? 1 : 0.86 + 0.14 * Math.sin(t * 9) * Math.sin(t * 3.3 + 1) + (Math.random() < 0.02 ? -0.12 : 0);
    const lr = L.mob ? W * 0.5 : W * 0.26;
    if (!lampOn) { ctx.fillStyle = hexA(Q.vig, DIM[theme]); ctx.fillRect(0, 0, W, H); }
    ctx.globalCompositeOperation = 'screen';
    if (lampOn) {
      const lg = ctx.createRadialGradient(G.lamp.gx, G.lamp.gy, 2, G.lamp.gx, G.lamp.gy, lr);
      lg.addColorStop(0, hexA(Q.lampWarm, 0.55 * flick * (theme === 'dark' ? 1 : 0.6))); lg.addColorStop(0.4, hexA(Q.lampWarm, 0.18 * flick)); lg.addColorStop(1, hexA(Q.lampWarm, 0));
      ctx.fillStyle = lg; ctx.fillRect(G.lamp.gx - lr, G.lamp.gy - lr, lr * 2, lr * 2);
    }
    for (const [bx2, by2, col, i] of G.bulbs) { const a = Q.bulbA * (calm ? 1 : 0.75 + 0.25 * Math.sin(t * 2 + i * 1.3)); const rg = ctx.createRadialGradient(bx2, by2, 0, bx2, by2, 9); rg.addColorStop(0, hexA(col, a)); rg.addColorStop(1, hexA(col, 0)); ctx.fillStyle = rg; ctx.fillRect(bx2 - 9, by2 - 9, 18, 18); }
    if (G.moon) { const [mx, my, mr] = G.moon; const mg = ctx.createRadialGradient(mx, my, mr, mx, my, mr * 4); mg.addColorStop(0, hexA(Q.moon, 0.18)); mg.addColorStop(1, hexA(Q.moon, 0)); ctx.fillStyle = mg; ctx.fillRect(mx - mr * 4, my - mr * 4, mr * 8, mr * 8); }
    ctx.globalCompositeOperation = 'source-over';
    ctx.fillStyle = Q.steam;
    for (let s = 0; s < 3; s++) for (let k = 0; k < 9; k++) { const ph = calm ? 0 : (t * 0.9 + s * 0.33) % 1; const kk = k + ph * 2; const y = G.cup.sy - 2 - kk * 1.6, x = G.cup.sx + (s - 1) * 3 + Math.sin(kk * 0.7 + t * 2 + s) * 1.6; ctx.globalAlpha = Math.max(0, 0.55 - kk * 0.06); ctx.fillRect(Math.round(x), Math.round(y), 1, 1); }
    ctx.globalAlpha = 1;
    for (let i = 0; i < 3; i++) { const p = calm ? i / 3 : (t / 2.4 + i / 3) % 1; const zx = Math.round(G.cat.hx + 2 + p * 7 + i), zy = Math.round(G.cat.hy - 2 - p * 12); ctx.globalAlpha = 1 - p; ctx.fillStyle = Q.z; if (i === 1) { ctx.fillRect(zx, zy, 3, 1); ctx.fillRect(zx + 2, zy + 1, 1, 1); ctx.fillRect(zx + 1, zy + 2, 1, 1); ctx.fillRect(zx, zy + 3, 1, 1); ctx.fillRect(zx, zy + 4, 3, 1); } else { ctx.fillRect(zx, zy, 2, 1); ctx.fillRect(zx + 1, zy + 1, 1, 1); ctx.fillRect(zx + 1, zy + 2, 2, 1); } }
    ctx.globalAlpha = 1;
    hoverAmt += ((hover || opening ? 1 : 0) - hoverAmt) * Math.min(1, dt * 8);
    if (hoverAmt > 0.02) { const bg = ctx.createRadialGradient(cx, by + bh / 2, bw * 0.2, cx, by + bh / 2, bw * 1.1); bg.addColorStop(0, hexA(Q.goldLight, 0.55 * hoverAmt)); bg.addColorStop(1, hexA(Q.goldLight, 0)); ctx.fillStyle = bg; ctx.fillRect(cx - bw * 1.2, by - bh * 0.6, bw * 2.4, bh * 2.2); }
    const bob = calm || opening ? 0 : Math.round(Math.sin(t * 2.1) * 2);
    const hop = calm || opening ? 0 : -Math.round(hoverAmt * 2);
    const shake = calm || !hover || opening ? 0 : Math.floor(t * 6) % 2 ? 1 : 0;
    ctx.save(); ctx.translate(bx + shake, by - 5 + bob + hop);
    if (opening) {
      const p = Math.min(1, (now - opening) / 450), f = Math.cos(p * Math.PI);
      ctx.drawImage(G.pages, 1, 5);
      if (f > 0) ctx.drawImage(G.book, 0, 0, G.bookCoverW + 1, G.book.height, 1, 0, Math.max(1, G.bookCoverW * f), G.book.height);
      else { ctx.fillStyle = Q.outline; ctx.fillRect(1 - G.bookCoverW * -f - 1, 4, G.bookCoverW * -f + 2, G.book.height - 12); ctx.fillStyle = Q.coverInner; ctx.fillRect(1 - G.bookCoverW * -f, 5, G.bookCoverW * -f, G.book.height - 14); }
    } else ctx.drawImage(G.book, 0, 0);
    ctx.restore();
    ctx.fillStyle = Q.sparkle;
    for (const [sx, sy, ph] of [[bx - 8, by + 10, 0], [bx + bw + 5, by + bh * 0.35, 1.7], [bx + bw - 4, by - 8, 3.1]]) { const v = calm ? 0.6 : (Math.sin(t * 2.4 + ph) + 1) / 2; if (v < 0.25) continue; const r = v > 0.7 ? 2 : 1; ctx.fillRect(Math.round(sx) - r, Math.round(sy), r * 2 + 1, 1); ctx.fillRect(Math.round(sx), Math.round(sy) - r, 1, r * 2 + 1); }
    ctx.drawImage(G.vig, 0, 0);
  }

  /** Snapshot current frame onto the fade canvas, then fade it out (used when theme/lamp changes) */
  function crossfade() {
    fctx.clearRect(0, 0, fadeCanvas.width, fadeCanvas.height);
    fctx.drawImage(canvas, 0, 0);
    fadeCanvas.style.transition = 'none';
    fadeCanvas.style.opacity = '1';
    requestAnimationFrame(() => requestAnimationFrame(() => { fadeCanvas.style.transition = 'opacity .4s ease'; fadeCanvas.style.opacity = '0'; }));
  }

  return {
    build,
    crossfade,
    start() { if (!raf) { last = performance.now(); draw(last, 0.016); raf = requestAnimationFrame(frame); } },
    stop() { cancelAnimationFrame(raf); raf = 0; },
    setHover(v) { hover = v; },
    startOpening() { opening = performance.now(); },
    cancelOpening() { opening = null; },
    get layout() { return L; },
    get reduced() { return reduceMQ.matches; },
  };
}
