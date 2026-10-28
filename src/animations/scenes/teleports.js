// Teleport family: 26, 85, 89, 95, 98, 103, 105 (63 lives in dedicated.js). Each uses a different mechanism.
import { TAU, clamp, lerp, smooth, easeOut, easeIn, seg, layout, sky, ground, glow, figure } from './toolkit.js';

const slit = (c, x, yMid, h, w, a, rgb = '216,224,255') => {
  if (w <= 0.5 || a <= 0) return;
  const g = c.createLinearGradient(x - w, 0, x + w, 0);
  g.addColorStop(0, `rgba(${rgb},0)`); g.addColorStop(0.5, `rgba(255,255,255,${a})`); g.addColorStop(1, `rgba(${rgb},0)`);
  c.fillStyle = g; c.fillRect(x - w, yMid - h / 2, w * 2, h);
};
const squeezed = (c, x, gy, fs, sx, opts) => { c.save(); c.translate(x, gy); c.scale(Math.max(0.001, sx), 1); figure(c, 0, 0, fs, opts); c.restore(); };

// 26 — blink up to 10 ft in a random direction.
const blink26 = {
  concept: 'A hair-thin vertical slit opens, the caster is squeezed edge-on into it, the slit hops 10 ft left or right (rolled each play) leaving a faint streak, and the caster unfolds out of the new slit.',
  duration: 3.4,
  init() { return { dir: Math.random() < 0.5 ? -1 : 1 }; },
  draw(c, W, H, t, S) {
    const { fs, gy, cx, unit } = layout(W, H), x0 = cx - S.dir * unit * 0.2, x1 = cx + S.dir * unit * 0.2, mid = gy - 66 * fs;
    sky(c, W, H, '#080a1e', '#141840'); ground(c, W, H, gy, '#0a0b1e', 'rgba(165,180,252,0.3)');
    c.setLineDash([3, 7]); c.strokeStyle = 'rgba(165,180,252,0.25)'; c.beginPath(); c.moveTo(x0, gy + 14); c.lineTo(x1, gy + 14); c.stroke(); c.setLineDash([]);
    const out = smooth(seg(t, 0.6, 1.05)), inn = smooth(seg(t, 1.45, 1.95));
    if (t < 1.1) squeezed(c, x0, gy, fs, 1 - out, { rim: '#a5b4fc' });
    if (t > 1.4) squeezed(c, x1, gy, fs, inn, { rim: '#a5b4fc' });
    c.globalCompositeOperation = 'lighter';
    slit(c, x0, mid, 160 * fs, 14 * fs * Math.sin(seg(t, 0.4, 1.3) * Math.PI), 0.9);
    slit(c, x1, mid, 160 * fs, 14 * fs * Math.sin(seg(t, 1.3, 2.2) * Math.PI), 0.9);
    const s = seg(t, 1.0, 1.7);
    if (s > 0 && s < 1) { const g = c.createLinearGradient(x0, 0, x1, 0); g.addColorStop(0, 'rgba(165,180,252,0)'); g.addColorStop(0.5, `rgba(199,210,254,${0.35 * Math.sin(s * Math.PI)})`); g.addColorStop(1, 'rgba(165,180,252,0)'); c.fillStyle = g; c.fillRect(Math.min(x0, x1), mid - 50 * fs, Math.abs(x1 - x0), 100 * fs); }
    c.globalCompositeOperation = 'source-over';
  },
};

// 85 — swap positions with another creature: a half-orbit exchange.
const swap85 = {
  concept: 'A glowing tether links the caster (cyan) and another creature (rose); the two lift and orbit one another half a turn, trailing coloured after-images that cross at a central rune ring, and settle in each other\'s places.',
  duration: 4.8,
  init() { return null; },
  draw(c, W, H, t) {
    const { fs, gy, unit } = layout(W, H), xa = W * 0.28, xb = W * 0.72, mx = (xa + xb) / 2, R = (xb - xa) / 2;
    sky(c, W, H, '#080b1a', '#10142e'); ground(c, W, H, gy, '#0a0c1c', 'rgba(165,243,252,0.25)');
    const th = smooth(seg(t, 1.1, 3.0)) * Math.PI;
    const pos = (who, th2) => who === 0 ? { x: mx - R * Math.cos(th2), y: gy - Math.sin(th2) * H * 0.16, k: 1 + 0.14 * Math.sin(th2) } : { x: mx + R * Math.cos(th2), y: gy - Math.sin(th2) * H * 0.16, k: 0.95 - 0.14 * Math.sin(th2) };
    // spots that persist on the ground
    for (const [x, col] of [[xa, '165,243,252'], [xb, '253,164,175']]) { c.save(); c.translate(x, gy + 5); c.scale(1, 0.2); c.strokeStyle = `rgba(${col},0.55)`; c.lineWidth = 3; c.beginPath(); c.arc(0, 0, unit * 0.1, 0, TAU); c.stroke(); c.restore(); }
    // tether
    c.globalCompositeOperation = 'lighter';
    const tt = seg(t, 0.3, 1.0) * (1 - seg(t, 3.0, 3.8)), A = pos(0, th), B = pos(1, th);
    if (tt > 0) { c.setLineDash([6, 8]); c.strokeStyle = `rgba(216,200,255,${0.6 * tt})`; c.lineWidth = 2; c.beginPath(); c.moveTo(A.x, A.y - 70 * fs); c.lineTo(B.x, B.y - 70 * fs); c.stroke(); c.setLineDash([]); }
    const ring = Math.sin(seg(t, 0.9, 3.2) * Math.PI);
    c.strokeStyle = `rgba(216,200,255,${0.6 * ring})`; c.lineWidth = 2; c.beginPath(); c.ellipse(mx, gy - 80 * fs, unit * 0.14, unit * 0.14 * 0.4, 0, 0, TAU); c.stroke();
    glow(c, mx, gy - 80 * fs, unit * 0.2, '216,200,255', 0.35 * Math.sin(seg(t, 1.8, 2.3) * Math.PI));
    c.globalCompositeOperation = 'source-over';
    // after-images then the two figures, far one first
    const moving = th > 0 && th < Math.PI;
    for (let k = 5; k >= 1; k--) if (moving) { const q = Math.max(0, th - k * 0.14), a = pos(0, q), b = pos(1, q); figure(c, a.x, a.y, fs * a.k, { rim: '#67e8f9', alpha: 0.12 }); figure(c, b.x, b.y, fs * b.k, { rim: '#fda4af', alpha: 0.12 }); }
    const order = A.k < B.k ? [[A, '#67e8f9'], [B, '#fda4af']] : [[B, '#fda4af'], [A, '#67e8f9']];
    for (const [p, rim] of order) figure(c, p.x, p.y, fs * p.k, { rim });
  },
};

// 89 — teleported to a random plane: spiral tunnel striped with five plane palettes.
const plane89 = {
  concept: 'A spiral tunnel opens overhead, banded in fire, water, shadow, celestial and fey colours; the caster is drawn up in a tightening, tumbling spiral and shrinks to a tiny silhouette at the vortex heart.',
  duration: 5.6,
  init() { return null; },
  draw(c, W, H, t) {
    const { fs, gy, cx, unit } = layout(W, H), vx = cx, vy = H * 0.42;
    sky(c, W, H, '#07040f', '#120a24'); ground(c, W, H, gy, '#0a0612', 'rgba(192,132,252,0.3)');
    const pal = ['251,113,60', '56,189,248', '167,139,250', '250,204,21', '52,211,153'], R = easeOut(seg(t, 0.3, 2.2)) * Math.hypot(W, H) * 0.7;
    c.globalCompositeOperation = 'lighter';
    const rings = 16;
    for (let k = rings; k >= 1; k--) {
      const r = R * (k / rings), tw = k * 0.2 - t * 0.7;
      c.lineWidth = R / rings + 1;
      for (let i = 0; i < 10; i++) { c.strokeStyle = `rgba(${pal[i % 5]},${0.22 * (0.4 + 0.6 * (1 - k / rings))})`; c.beginPath(); c.arc(vx, vy, r, tw + (i / 10) * TAU, tw + (i / 10) * TAU + TAU / 10 - 0.03); c.stroke(); }
    }
    glow(c, vx, vy, unit * 0.2 * seg(t, 1.5, 3.5), '255,240,255', 0.7 * seg(t, 1.5, 3.5));
    c.globalCompositeOperation = 'source-over';
    // caster is pulled up and in
    const u = smooth(seg(t, 1.5, 4.2)), ang = u * TAU * 2.25, dist = 1 - u;
    const sx = vx + (Math.cos(-Math.PI / 2 + ang) * 0 + 0) + Math.sin(ang) * unit * 0.25 * Math.sin(u * Math.PI), sy = lerp(gy, vy + 40 * fs, easeIn(u));
    c.save(); c.translate(sx, sy - 64 * fs * dist); c.rotate(ang * 0.8); c.scale(1 - 0.78 * u, 1 - 0.78 * u); figure(c, 0, 64 * fs, fs, { rim: '#e9d5ff', alpha: 1 - 0.25 * u }); c.restore();
  },
};

// 95 — all non-magical gear teleports away to random places within 500 ft.
const gear95 = {
  concept: 'Six pieces of kit (helm, sword, shield, pack, boots, rope coil) glint, pop off the caster one after another, streak as dotted lines to scattered far-off spots inside a 500-ft ring, and land as tiny pinging icons while the caster is left bare.',
  duration: 5.6,
  init(W, H, r) {
    const { gy } = layout(W, H), kinds = ['helm', 'sword', 'shield', 'pack', 'boots', 'rope'];
    return kinds.map((k, i) => ({ k, i, dx: (r() < 0.5 ? -1 : 1) * (0.14 + r() * 0.3) * W, dy: H * 0.1 + r() * (gy - H * 0.18), t0: 0.9 + i * 0.32 }));
  },
  draw(c, W, H, t, S) {
    const { fs, gy, cx, unit } = layout(W, H);
    sky(c, W, H, '#0e0a05', '#201508'); ground(c, W, H, gy, '#120d06', 'rgba(251,191,36,0.3)');
    const slots = { helm: [0, -136, 0], sword: [34, -66, 0.4], shield: [-32, -62, 0], pack: [0, -84, 0], boots: [0, -5, 0], rope: [-18, -38, 0] };
    const item = (k, x, y, s, a, rgb = '251,191,36') => {
      c.save(); c.translate(x, y); c.scale(s, s); c.globalAlpha = a; c.strokeStyle = `rgb(${rgb})`; c.fillStyle = `rgba(${rgb},0.22)`; c.lineWidth = 2 / s; c.lineJoin = 'round';
      c.beginPath();
      if (k === 'helm') { c.arc(0, 0, 13, Math.PI, 0); c.lineTo(13, 6); c.lineTo(-13, 6); c.closePath(); }
      else if (k === 'sword') { c.moveTo(0, -34); c.lineTo(4, 10); c.lineTo(-4, 10); c.closePath(); c.moveTo(-12, 10); c.lineTo(12, 10); }
      else if (k === 'shield') { c.arc(0, 0, 16, 0, TAU); c.moveTo(0, -12); c.lineTo(0, 12); c.moveTo(-12, 0); c.lineTo(12, 0); }
      else if (k === 'pack') { c.rect(-15, -18, 30, 36); c.moveTo(-15, -4); c.lineTo(15, -4); }
      else if (k === 'boots') { c.rect(-14, -8, 10, 14); c.rect(4, -8, 10, 14); }
      else { c.arc(0, 0, 12, 0, TAU); c.moveTo(7, 0); c.arc(0, 0, 7, 0, TAU); }
      c.fill(); c.stroke(); c.restore();
    };
    // 500 ft boundary
    c.setLineDash([5, 9]); c.strokeStyle = `rgba(251,191,36,${0.3 * seg(t, 0.4, 1.2) * (1 - seg(t, 4.6, 5.4))})`; c.beginPath(); c.ellipse(cx, gy - 30 * fs, W * 0.47, (gy - H * 0.08) / 1.7, 0, 0, TAU); c.stroke(); c.setLineDash([]);
    figure(c, cx, gy, fs, { rim: '#fcd34d' });
    for (const o of S) {
      const [sx, sy] = slots[o.k], px = cx + sx * fs, py = gy + sy * fs, q = t - o.t0, glint = 0.6 + 0.4 * Math.sin(t * 6 + o.i);
      if (q < 0) { item(o.k, px, py, fs * 0.8, glint * (0.4 + 0.6 * seg(t, 0.2, 0.9))); continue; }
      const dx = cx + o.dx, dy = o.dy, run = easeOut(seg(q, 0, 0.55));
      if (q < 0.25) item(o.k, px, py, fs * 0.8, 1 - q / 0.25, '255,255,255');
      c.globalCompositeOperation = 'lighter';
      c.setLineDash([3, 6]); c.strokeStyle = `rgba(253,224,71,${0.5 * (1 - seg(q, 0.6, 1.6))})`; c.beginPath(); c.moveTo(px, py); c.lineTo(lerp(px, dx, run), lerp(py, dy, run)); c.stroke(); c.setLineDash([]);
      const ping = seg(q, 0.5, 1.3);
      if (ping > 0 && ping < 1) { c.strokeStyle = `rgba(253,224,71,${0.7 * (1 - ping)})`; c.lineWidth = 2; c.beginPath(); c.arc(dx, dy, 6 + ping * 30, 0, TAU); c.stroke(); }
      c.globalCompositeOperation = 'source-over';
      if (q > 0.5) item(o.k, dx, dy, 0.32 * (unit / 270) * Math.min(1, fs * 2), smooth(seg(q, 0.5, 0.8)));
    }
  },
};

// 98 — group banished to a harmless demiplane: an iris opens onto a soft pastel void.
const banish98 = {
  concept: 'A shimmering bubble closes around three figures, then an iris widens from it and replaces the dark world with a soft pearl-and-lavender void in which the ground is gone and the group drifts gently, weightless and unharmed.',
  duration: 5.4,
  init(W, H, r) { return { motes: Array.from({ length: 40 }, () => ({ x: r(), y: r(), s: 2 + r() * 5, v: 0.3 + r(), ph: r() * TAU })) }; },
  draw(c, W, H, t, S) {
    const { fs, gy, cx, unit } = layout(W, H), xs = [cx - W * 0.18, cx, cx + W * 0.18], by = gy - 60 * fs, bR = unit * 0.5;
    sky(c, W, H, '#07070f', '#10101e'); ground(c, W, H, gy, '#0a0a14', 'rgba(200,182,255,0.25)');
    xs.forEach((x, i) => figure(c, x, gy, fs * (0.94 + 0.06 * i), { rim: '#a8a2c0' }));
    const iris = easeOut(seg(t, 1.2, 3.4)) * Math.hypot(W, H) * 0.62, rad = Math.max(bR * 0.9 * easeOut(seg(t, 0.2, 1.0)), iris);
    // demiplane inside the iris
    if (t > 1.1) {
      c.save(); c.beginPath(); c.arc(cx, by, rad, 0, TAU); c.clip();
      const g = c.createLinearGradient(0, 0, 0, H); g.addColorStop(0, '#ddd6fe'); g.addColorStop(0.55, '#fbcfe8'); g.addColorStop(1, '#e0e7ff'); c.fillStyle = g; c.fillRect(0, 0, W, H);
      for (const m of S.motes) { const x = (m.x * W + Math.sin(t * 0.6 + m.ph) * 20) % W, y = (((m.y - t * 0.04 * m.v) % 1) + 1) % 1 * H; glow(c, x, y, m.s * 6, '255,255,255', 0.5); }
      xs.forEach((x, i) => { const bob = Math.sin(t * 1.4 + i * 1.7) * 9 * fs; figure(c, x, gy - 14 * fs + bob, fs * (0.94 + 0.06 * i), { fill: '#f5f3ff', rim: '#a78bfa', rimWidth: 2.5 }); });
      c.restore();
    }
    // bubble skin
    const ba = seg(t, 0.2, 0.9) * (1 - seg(t, 3.2, 4.2));
    if (ba > 0) { const g = c.createLinearGradient(cx - bR, by - bR, cx + bR, by + bR); g.addColorStop(0, `rgba(165,243,252,${ba})`); g.addColorStop(0.5, `rgba(244,114,182,${ba})`); g.addColorStop(1, `rgba(196,181,253,${ba})`); c.strokeStyle = g; c.lineWidth = 4; c.beginPath(); c.arc(cx, by, Math.min(rad, bR * 1.05) , 0, TAU); c.stroke(); }
    c.strokeStyle = `rgba(255,255,255,${0.7 * (1 - seg(t, 2.4, 4.0)) * seg(t, 1.2, 1.5)})`; c.lineWidth = 3; c.beginPath(); c.arc(cx, by, rad, 0, TAU); c.stroke();
  },
};

// 103 — the Astral Plane: warp-speed star streaks, nebula and a silver cord.
const astral103 = {
  concept: 'The ground and sky stretch into horizontal star streaks as the caster, turned to silver, lifts off and glides head-first through a violet nebula, trailing a rippling silver cord back into the distance.',
  duration: 5.4,
  init(W, H, r) { return { stars: Array.from({ length: 120 }, () => ({ x: r(), y: r(), z: 0.2 + r() * 0.8, tw: r() * TAU })), neb: Array.from({ length: 5 }, () => ({ x: r(), y: r(), r: 0.2 + r() * 0.3, h: r() < 0.5 ? '139,92,246' : '56,189,248' })) }; },
  draw(c, W, H, t, S) {
    const { fs, gy, cx, unit } = layout(W, H), warp = smooth(seg(t, 0.7, 2.4));
    sky(c, W, H, '#05031a', '#0c0830');
    c.globalCompositeOperation = 'lighter';
    for (const n of S.neb) glow(c, ((n.x * W - t * 12 * n.r * 20) % (W * 1.4) + W * 1.4) % (W * 1.4) - W * 0.2, n.y * H, n.r * unit * 1.5, n.h, 0.18 * warp);
    for (const s of S.stars) {
      const v = (0.15 + 3.5 * warp) * s.z * unit * 0.5 * t, x = (((s.x * W - v) % W) + W) % W, y = s.y * H, len = (3 + 150 * warp * s.z) * (unit / 270);
      c.strokeStyle = `rgba(226,232,255,${(0.35 + 0.5 * s.z) * (0.85 + 0.15 * Math.sin(t * 3 + s.tw))})`; c.lineWidth = 1 + s.z; c.beginPath(); c.moveTo(x, y); c.lineTo(x + len, y); c.stroke();
    }
    c.globalCompositeOperation = 'source-over';
    const gAlpha = 1 - seg(t, 0.7, 1.7);
    if (gAlpha > 0) ground(c, W, H, gy + warp * H * 0.3, '#0a0818', `rgba(200,182,255,${0.3 * gAlpha})`);
    // silver caster lifts, tilts into a flying pose
    const u = smooth(seg(t, 0.5, 2.2)), fx = lerp(cx, W * 0.6, u), fy = lerp(gy - 64 * fs, H * 0.44, u) + Math.sin(t * 1.3) * 8, tilt = u * 1.35;
    // silver cord streaming behind (left)
    const ax = fx - 30 * fs * Math.cos(tilt), ay = fy + 30 * fs * Math.sin(tilt) * 0, cordA = seg(t, 1.0, 2.0);
    if (cordA > 0) {
      c.globalCompositeOperation = 'lighter'; c.lineWidth = 3; c.lineCap = 'round';
      for (const [w, a] of [[8, 0.12], [3, 0.7]]) { c.strokeStyle = `rgba(226,232,240,${a * cordA})`; c.lineWidth = w; c.beginPath(); for (let i = 0; i <= 40; i++) { const q = i / 40, x = ax - q * ax * 1.1, y = ay + Math.sin(q * 9 - t * 4) * 14 * q * (unit / 270) + q * q * H * 0.08; i ? c.lineTo(x, y) : c.moveTo(x, y); } c.stroke(); }
      for (let i = 0; i < 6; i++) { const q = ((t * 0.5 + i / 6) % 1), x = ax - q * ax * 1.1, y = ay + Math.sin(q * 9 - t * 4) * 14 * q * (unit / 270) + q * q * H * 0.08; glow(c, x, y, 10, '255,255,255', 0.8 * (1 - q) * cordA); }
      c.globalCompositeOperation = 'source-over';
    }
    c.save(); c.translate(fx, fy); c.rotate(tilt); glow(c, 0, 0, 120 * fs, '226,232,240', 0.0); figure(c, 0, 64 * fs, fs, { fill: 'rgba(203,213,225,0.55)', rim: '#f1f5f9', rimWidth: 3 }); c.restore();
    c.globalCompositeOperation = 'lighter'; glow(c, fx, fy, 90 * fs, '226,232,240', 0.22 * u); c.globalCompositeOperation = 'source-over';
  },
};

// 105 — repeating 20-ft bonus-action teleports for a minute: a chain of hops under a draining timer ring.
const hop105 = {
  concept: 'The caster blinks four times in succession along the ground, each hop a squeezed slit, a streak and a rune mark; above, a sigil ring slowly drains to show the one-minute window in which this can be repeated every turn.',
  duration: 5.6,
  init() { return null; },
  draw(c, W, H, t) {
    const { fs, gy, unit } = layout(W, H), xs = [W * 0.16, W * 0.38, W * 0.6, W * 0.82], th = [1.0, 2.0, 3.0, 4.0], mid = gy - 66 * fs;
    sky(c, W, H, '#07081c', '#0f1238'); ground(c, W, H, gy, '#090a1c', 'rgba(129,140,248,0.3)');
    xs.forEach((x, i) => { const a = seg(t, i ? th[i - 1] + 0.2 : 0, i ? th[i - 1] + 0.5 : 0.01); c.save(); c.translate(x, gy + 6); c.scale(1, 0.2); c.strokeStyle = `rgba(165,180,252,${0.55 * a})`; c.lineWidth = 3; c.beginPath(); c.arc(0, 0, unit * 0.07, 0, TAU); c.stroke(); c.restore(); });
    for (let i = 0; i < 4; i++) {
      const arrive = i ? seg(t, th[i - 1] + 0.18, th[i - 1] + 0.38) : 1, leave = i < 3 ? seg(t, th[i], th[i] + 0.18) : 0;
      if (arrive > 0 && leave < 1) squeezed(c, xs[i], gy, fs, smooth(arrive) * (1 - smooth(leave)) , { rim: '#a5b4fc' });
    }
    c.globalCompositeOperation = 'lighter';
    for (let i = 0; i < 3; i++) {
      const q = seg(t, th[i], th[i] + 0.5);
      slit(c, xs[i], mid, 150 * fs, 12 * fs * Math.sin(clamp(q * 2) * Math.PI), 0.9);
      slit(c, xs[i + 1], mid, 150 * fs, 12 * fs * Math.sin(clamp((q - 0.4) * 2) * Math.PI), 0.9);
      if (q > 0 && q < 1) { const g = c.createLinearGradient(xs[i], 0, xs[i + 1], 0); g.addColorStop(0, 'rgba(165,180,252,0)'); g.addColorStop(0.5, `rgba(199,210,254,${0.35 * Math.sin(q * Math.PI)})`); g.addColorStop(1, 'rgba(165,180,252,0)'); c.fillStyle = g; c.fillRect(xs[i], mid - 45 * fs, xs[i + 1] - xs[i], 90 * fs); }
    }
    // sigil timer ring (the 1-minute window)
    const sx = W / 2, sy = H * 0.15, R = unit * 0.08, left = 1 - 0.55 * (t / 5.6);
    c.strokeStyle = 'rgba(165,180,252,0.25)'; c.lineWidth = 5; c.beginPath(); c.arc(sx, sy, R, 0, TAU); c.stroke();
    c.strokeStyle = 'rgba(224,231,255,0.9)'; c.beginPath(); c.arc(sx, sy, R, -Math.PI / 2, -Math.PI / 2 + TAU * left); c.stroke();
    c.strokeStyle = 'rgba(199,210,254,0.8)'; c.lineWidth = 2; c.beginPath(); c.moveTo(sx, sy - R * 0.45); c.lineTo(sx + R * 0.35, sy); c.lineTo(sx, sy + R * 0.45); c.lineTo(sx - R * 0.35, sy); c.closePath(); c.stroke();
    c.globalCompositeOperation = 'source-over';
  },
};

export const TELEPORT_SCENES = { 26: blink26, 85: swap85, 89: plane89, 95: gear95, 98: banish98, 103: astral103, 105: hop105 };
