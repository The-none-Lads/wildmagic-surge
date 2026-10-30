// Elemental family: 35, 46, 49, 58, 79, 82, 83, 86, 90, 96, 97, 100.
import { TAU, clamp, lerp, smooth, easeOut, easeIn, seg, layout, sky, ground, glow, figure, rng } from './toolkit.js';

/** Teardrop flame; base centred on (x,y). */
function flame(c, x, y, h, w, t, ph, a = 1) {
  const sw = Math.sin(t * 6 + ph) * w * 0.6, sh = h * (0.9 + 0.1 * Math.sin(t * 9 + ph * 2));
  for (const [k, rgb] of [[1, '249,115,22'], [0.62, '253,224,71']]) {
    c.fillStyle = `rgba(${rgb},${0.85 * a})`; c.beginPath(); c.moveTo(x - w * k, y);
    c.bezierCurveTo(x - w * k, y - sh * k * 0.5, x + sw * k - w * 0.3 * k, y - sh * k * 0.7, x + sw * k, y - sh * k);
    c.bezierCurveTo(x + sw * k + w * 0.3 * k, y - sh * k * 0.7, x + w * k, y - sh * k * 0.5, x + w * k, y); c.closePath(); c.fill();
  }
}
const bg = (c, W, H, gy, a, b, rim) => { sky(c, W, H, a, b); ground(c, W, H, gy, '#0a0808', rim); };
const add = (c) => { c.globalCompositeOperation = 'lighter'; };
const norm = (c) => { c.globalCompositeOperation = 'source-over'; };

// 35 — thunder shockwave, 10 ft.
const thunder35 = {
  concept: 'The caster squats and compresses, then a thick white pressure ring and two echoes ripple outward, shoving dust along the floor and knocking two neighbours back a step under dark storm cloud.',
  duration: 4.4,
  init(W, H, r) { return Array.from({ length: 30 }, () => ({ s: r() < 0.5 ? -1 : 1, v: 0.4 + r() * 0.8, h: r() * 14, d: r() * 0.4 })); },
  draw(c, W, H, t, S) {
    const { fs, gy, cx, unit } = layout(W, H), cy = gy - 62 * fs;
    bg(c, W, H, gy, '#0a0d18', '#1a2236', 'rgba(199,210,254,0.3)');
    const sq = Math.sin(seg(t, 0.3, 1.0) * Math.PI / 2) * (1 - seg(t, 1.0, 1.1)), push = easeOut(seg(t, 1.3, 2.0)) * (1 - 0.7 * seg(t, 2.6, 3.8));
    [[-0.3, -1], [0.3, 1]].forEach(([o, d]) => figure(c, cx + o * W + d * push * 26 * fs, gy, fs * 0.92, { rim: '#94a3b8' }));
    c.save(); c.translate(cx, gy); c.scale(1 + 0.1 * sq, 1 - 0.14 * sq); figure(c, 0, 0, fs, { rim: '#c7d2fe' }); c.restore();
    add(c);
    for (let i = 0; i < 3; i++) { const q = seg(t, 1.0 + i * 0.22, 2.6 + i * 0.22); if (q > 0 && q < 1) { c.strokeStyle = `rgba(224,231,255,${0.7 * (1 - q) / (1 + i)})`; c.lineWidth = (10 - 3 * i) * (1 - q) + 1; c.beginPath(); c.arc(cx, cy, easeOut(q) * unit * 0.55, 0, TAU); c.stroke(); } }
    glow(c, cx, cy, 90 * fs * Math.sin(seg(t, 0.9, 1.5) * Math.PI), '224,231,255', 0.55);
    norm(c);
    for (const p of S) { const q = seg(t, 1.1 + p.d, 3.2 + p.d); if (q > 0 && q < 1) { c.fillStyle = `rgba(150,160,180,${0.5 * (1 - q)})`; c.fillRect(cx + p.s * easeOut(q) * W * 0.5 * p.v, gy - 3 - p.h * fs * q, 4, 3); } }
  },
};

// 46 — all nonmagical flames within 30 ft go out.
const snuff46 = {
  concept: 'Five torches and a campfire blaze around the caster; a cool grey ring rolls outward and snuffs each flame as it passes, leaving red embers and curling smoke as the room sinks into darkness.',
  duration: 5.0,
  init() { return null; },
  draw(c, W, H, t) {
    const { fs, gy, cx } = layout(W, H), pos = [-0.4, -0.27, -0.14, 0.14, 0.27, 0.4], R = W * 0.5, front = seg(t, 1.0, 2.6) * R;
    bg(c, W, H, gy, '#0a0705', '#1d130b', 'rgba(251,146,60,0.3)');
    const dark = seg(t, 1.2, 3.0) * 0.55;
    pos.forEach((o, i) => {
      const x = cx + o * W, d = Math.abs(o * W), te = 1.0 + (d / R) * 1.6, lit = t < te, since = t - te, ph = i * 1.7;
      c.fillStyle = '#3a2614'; c.fillRect(x - 3 * fs, gy - 78 * fs, 6 * fs, 78 * fs); c.fillStyle = '#5b3a1c'; c.fillRect(x - 8 * fs, gy - 86 * fs, 16 * fs, 10 * fs);
      if (lit) { add(c); glow(c, x, gy - 100 * fs, 120 * fs, '251,146,60', 0.28); norm(c); flame(c, x, gy - 86 * fs, 34 * fs, 9 * fs, t, ph); }
      else { const e = 1 - seg(since, 0, 1.5); add(c); glow(c, x, gy - 88 * fs, 14 * fs, '239,68,68', 0.8 * e); norm(c);
        c.strokeStyle = `rgba(160,160,170,${0.5 * (1 - seg(since, 0, 2.8))})`; c.lineWidth = 3; c.beginPath(); for (let k = 0; k <= 16; k++) { const q = k / 16, yy = gy - 90 * fs - q * 70 * fs * seg(since, 0, 1.4), xx = x + Math.sin(q * 8 + since * 3 + ph) * 10 * fs * q; k ? c.lineTo(xx, yy) : c.moveTo(xx, yy); } c.stroke(); }
    });
    figure(c, cx, gy, fs, { rim: '#fdba74' });
    add(c); if (front > 0 && front < R) { c.strokeStyle = 'rgba(148,163,184,0.7)'; c.lineWidth = 4; c.beginPath(); c.ellipse(cx, gy - 60 * fs, front, front * 0.45, 0, 0, TAU); c.stroke(); } norm(c);
    c.fillStyle = `rgba(2,3,8,${dark})`; c.fillRect(0, 0, W, H);
  },
};

// 49 — frost across the ground in a 10-ft radius.
const frost49 = {
  concept: 'Branching ice fractals race outward from the caster\'s feet across the floor in perspective, spiking into small crystals while a pale frost sheet fills the gaps and the caster\'s breath clouds.',
  duration: 5.0,
  init(W, H, r) { return Array.from({ length: 16 }, (_, i) => ({ a: (i / 16) * TAU + (r() - 0.5) * 0.2, br: [0.28, 0.5, 0.7, 0.88].map((f) => ({ f, s: r() < 0.5 ? -1 : 1, l: 0.14 + r() * 0.1 })) })); },
  draw(c, W, H, t, S) {
    const { fs, gy, cx, unit } = layout(W, H), p = easeOut(seg(t, 0.7, 3.2)), gyc = gy + (H - gy) * 0.5, sq = 0.3, L = unit * 0.8 * p;
    bg(c, W, H, gy, '#06101a', '#0d2234', 'rgba(186,230,253,0.35)');
    c.save(); c.translate(cx, gyc); c.scale(1, sq);
    const g = c.createRadialGradient(0, 0, 0, 0, 0, L); g.addColorStop(0, 'rgba(186,230,253,0.28)'); g.addColorStop(1, 'rgba(186,230,253,0)'); c.fillStyle = g; c.beginPath(); c.arc(0, 0, L, 0, TAU); c.fill();
    c.strokeStyle = 'rgba(224,242,254,0.85)'; c.lineWidth = 2.5; c.lineCap = 'round';
    for (const arm of S) { const ca = Math.cos(arm.a), sa = Math.sin(arm.a); c.beginPath(); c.moveTo(0, 0); c.lineTo(ca * L, sa * L); c.stroke();
      for (const b of arm.br) { if (p < b.f) continue; const bx = ca * L * b.f, by = sa * L * b.f, bl = L * b.l * clamp((p - b.f) * 4), ba = arm.a + b.s * 0.75; c.lineWidth = 1.6; c.beginPath(); c.moveTo(bx, by); c.lineTo(bx + Math.cos(ba) * bl, by + Math.sin(ba) * bl); c.stroke(); c.lineWidth = 2.5; } }
    c.restore();
    c.strokeStyle = 'rgba(224,242,254,0.8)'; c.lineWidth = 2;
    for (const arm of S) for (const b of arm.br) { if (p < b.f + 0.1) continue; const x = cx + Math.cos(arm.a) * L * b.f, y = gyc + Math.sin(arm.a) * L * b.f * sq, h = (6 + b.l * 60) * fs * clamp((p - b.f) * 3); c.beginPath(); c.moveTo(x, y); c.lineTo(x, y - h); c.stroke(); }
    figure(c, cx, gy, fs, { rim: '#bae6fd' });
    const bz = seg(t, 1.2, 4.6); if (bz > 0 && bz < 1) { add(c); glow(c, cx + 14 * fs + bz * 26 * fs, gy - 118 * fs - bz * 18 * fs, 24 * fs * (0.5 + bz), '224,242,254', 0.3 * Math.sin(bz * Math.PI)); norm(c); }
  },
};

// 58 — static charge waiting for a touch (conditional: charge is held, nothing is touched).
const static58 = {
  concept: 'Fine blue-white arcs crawl over the caster\'s silhouette while a charge ring fills around them; it settles into a held, humming glow — a stored charge waiting for a touch that has not happened.',
  duration: 4.8,
  init() { return null; },
  draw(c, W, H, t) {
    const { fs, gy, cx, unit } = layout(W, H), cy = gy - 64 * fs, fill = easeOut(seg(t, 0.2, 2.6));
    bg(c, W, H, gy, '#060a18', '#0d1630', 'rgba(125,211,252,0.3)');
    figure(c, cx, gy, fs, { rim: '#bae6fd', rimWidth: 2 + 2 * fill });
    add(c); const R = unit * 0.2;
    c.strokeStyle = 'rgba(125,211,252,0.2)'; c.lineWidth = 4; c.beginPath(); c.arc(cx, cy, R, 0, TAU); c.stroke(); c.strokeStyle = `rgba(224,242,254,${0.7 + 0.3 * Math.sin(t * 5) * seg(t, 2.6, 3)})`; c.beginPath(); c.arc(cx, cy, R, -Math.PI / 2, -Math.PI / 2 + TAU * fill); c.stroke();
    const r2 = rng(Math.floor(t * 7) + 5); c.strokeStyle = `rgba(186,230,253,${0.5 + 0.4 * fill})`; c.lineWidth = 1.6;
    for (let i = 0; i < 7; i++) { let x = cx + (r2() * 2 - 1) * 24 * fs, y = gy - r2() * 130 * fs; c.beginPath(); c.moveTo(x, y); for (let k = 0; k < 4; k++) { x += (r2() - 0.5) * 22 * fs; y += (r2() - 0.5) * 22 * fs; c.lineTo(x, y); } c.stroke(); }
    glow(c, cx, cy, 100 * fs, '125,211,252', 0.1 + 0.14 * fill * (0.8 + 0.2 * Math.sin(t * 4))); norm(c);
  },
};

// 79 — body becomes living flame for a round.
const flamebody79 = {
  concept: 'Flames climb the silhouette from the feet until the whole body is a column of fire inside a burning outline, with licks of flame above the head, drifting embers and a warm ground glow.',
  duration: 4.8,
  init(W, H, r) { return Array.from({ length: 30 }, () => ({ x: r() * 2 - 1, v: 0.4 + r(), d: r() * 2 })); },
  draw(c, W, H, t, S) {
    const { fs, gy, cx } = layout(W, H), p = easeOut(seg(t, 0.5, 2.4));
    bg(c, W, H, gy, '#100804', '#241106', 'rgba(251,146,60,0.35)');
    add(c); glow(c, cx, gy - 60 * fs, 140 * fs * p, '251,146,60', 0.28 * p); norm(c);
    figure(c, cx, gy, fs, { fill: '#2a0e05', rim: '#fb923c' });
    c.save(); c.translate(cx, gy); c.scale(fs, fs); c.beginPath(); c.moveTo(-27, 0); c.quadraticCurveTo(-24, -66, -9, -97); c.lineTo(9, -97); c.quadraticCurveTo(24, -66, 27, 0); c.closePath(); c.moveTo(16, -108); c.arc(0, -112, 16, 0, TAU); c.restore(); c.save(); c.clip();
    for (let row = 0; row < 8; row++) for (let col = -3; col <= 3; col++) { const y = -row * 17, h = (50 + (row % 3) * 10) , f = clamp(p * 1.3 - row / 9); if (f > 0) flame(c, cx + col * 9 * fs, gy + y * fs, h * fs * f * 0.6, 7 * fs, t, col + row * 2); }
    c.restore();
    figure(c, cx, gy, fs, { fill: 'rgba(0,0,0,0)', rim: '#fde68a', rimWidth: 2.5 });
    if (p > 0.85) { for (const dx of [-8, 0, 8]) flame(c, cx + dx * fs, gy - 130 * fs, 36 * fs * (p - 0.85) * 6, 7 * fs, t, dx); }
    add(c); for (const e of S) { const q = seg(t, 1.0 + e.d * 0.4, 4.0 + e.d * 0.4); if (q > 0 && q < 1) glow(c, cx + e.x * 50 * fs + Math.sin(q * 7) * 12, gy - 30 * fs - q * 150 * fs * e.v, 5, '253,186,116', 0.8 * (1 - q)); } norm(c);
  },
};

// 82 — all metal within 10 ft turns red-hot for a round.
const hotmetal82 = {
  concept: 'A sword, shield, helm and coins heat from dull steel through orange to white with shimmering heat-haze and hissing steam; the creature gripping the sword flinches back and drops it in a shower of sparks.',
  duration: 5.0,
  init(W, H, r) { return { st: Array.from({ length: 14 }, () => ({ x: r(), d: r() })), sp: Array.from({ length: 14 }, () => ({ a: -Math.PI * r(), v: 0.4 + r() })) }; },
  draw(c, W, H, t, S) {
    const { fs, gy, cx } = layout(W, H), h = easeOut(seg(t, 0.7, 2.6)), col = (k) => { const m = clamp(h * 2 - k * 0.2); return m < 1 ? `rgb(${Math.round(lerp(148, 251, m))},${Math.round(lerp(163, 120, m))},${Math.round(lerp(184, 40, m))})` : `rgb(255,${Math.round(lerp(150, 235, m - 1))},${Math.round(lerp(60, 170, m - 1))})`; };
    bg(c, W, H, gy, '#0c0a0c', '#1c1418', 'rgba(251,146,60,0.3)');
    const hx = cx + W * 0.2, drop = seg(t, 2.3, 3.0), flinch = Math.sin(seg(t, 2.2, 2.6) * Math.PI);
    figure(c, cx, gy, fs, { rim: '#a8a29e' });
    figure(c, hx + flinch * 16 * fs, gy, fs, { rim: '#fca5a5' });
    const sx = lerp(hx - 26 * fs, hx - 80 * fs, drop), sy = lerp(gy - 70 * fs, gy - 4 * fs, drop * drop), sa = lerp(-0.5, -1.45, drop);
    c.save(); c.translate(sx, sy); c.rotate(sa); c.strokeStyle = col(0); c.lineWidth = 5 * fs; c.lineCap = 'round'; c.beginPath(); c.moveTo(0, 0); c.lineTo(0, -52 * fs); c.stroke(); c.lineWidth = 4 * fs; c.beginPath(); c.moveTo(-10 * fs, 0); c.lineTo(10 * fs, 0); c.stroke(); c.restore();
    c.strokeStyle = col(1); c.lineWidth = 3; c.beginPath(); c.arc(cx - W * 0.2, gy - 34 * fs, 22 * fs, 0, TAU); c.moveTo(cx - W * 0.2, gy - 56 * fs); c.lineTo(cx - W * 0.2, gy - 12 * fs); c.stroke();
    c.fillStyle = col(2); c.beginPath(); c.arc(cx - W * 0.08, gy - 14 * fs, 14 * fs, Math.PI, 0); c.fill();
    for (let i = 0; i < 4; i++) { c.fillStyle = col(3); c.beginPath(); c.ellipse(cx + W * 0.06 + i * 12 * fs, gy - 4 * fs, 7 * fs, 3 * fs, 0, 0, TAU); c.fill(); }
    add(c); for (const [x, y] of [[sx, sy - 30 * fs], [cx - W * 0.2, gy - 34 * fs], [cx - W * 0.08, gy - 14 * fs], [cx + W * 0.1, gy - 4 * fs]]) glow(c, x, y, 60 * fs, '251,146,60', 0.3 * h);
    c.strokeStyle = `rgba(254,215,170,${0.25 * h})`; c.lineWidth = 2; for (let i = 0; i < 6; i++) { const x = cx - W * 0.25 + i * W * 0.1; c.beginPath(); for (let k = 0; k <= 10; k++) { const yy = gy - 20 * fs - k * 10 * fs; k ? c.lineTo(x + Math.sin(k + t * 4 + i) * 5 * fs, yy) : c.moveTo(x, gy - 20 * fs); } c.stroke(); }
    if (drop > 0) for (const s of S.sp) { const q = seg(t, 2.9, 3.9); if (q > 0 && q < 1) glow(c, sx + Math.cos(s.a) * 60 * fs * q * s.v, gy - 6 * fs + Math.sin(s.a) * 60 * fs * q * s.v + q * q * 30 * fs, 4, '253,224,71', 0.9 * (1 - q)); }
    norm(c);
    for (const s of S.st) { const q = seg(t, 1.2 + s.d, 3.8 + s.d); if (q > 0 && q < 1) { c.fillStyle = `rgba(220,225,235,${0.25 * Math.sin(q * Math.PI)})`; c.beginPath(); c.arc(cx - W * 0.25 + s.x * W * 0.5, gy - 30 * fs - q * 90 * fs, 6 * fs + q * 12 * fs, 0, TAU); c.fill(); } }
  },
};

// 83 — Tidal Wave in a direction of the DM's choice.
const tidal83 = {
  concept: 'A towering wall of water with a foaming crest rolls across the whole scene (direction rolled each play), briefly swallowing the figures, throws spray, then drains away leaving a glistening wet floor.',
  duration: 5.6,
  init(W, H, r) { return { dir: Math.random() < 0.5 ? -1 : 1, spray: Array.from({ length: 40 }, () => ({ o: r(), v: 0.5 + r(), s: 2 + r() * 3 })) }; },
  draw(c, W, H, t, S) {
    const { fs, gy, cx } = layout(W, H), dir = S.dir, u = smooth(seg(t, 0.8, 3.8)), xf = dir > 0 ? lerp(-0.25 * W, 1.3 * W, u) : lerp(1.25 * W, -0.3 * W, u), Hm = H * 0.55, drain = seg(t, 3.4, 5.0);
    bg(c, W, H, gy, '#06101c', '#0c2238', 'rgba(56,189,248,0.3)');
    const hAt = (x) => { const d = (xf - x) * dir; if (d < 0) return 0; return Hm * (1 - Math.exp(-d / (W * 0.05))) * Math.exp(-d / (W * 0.4)) * (1 - 0.85 * drain) + H * 0.02 * (1 - drain) * (d > 0 ? 1 : 0); };
    figure(c, cx, gy, fs, { rim: '#7dd3fc' }); figure(c, cx - W * 0.22, gy, fs * 0.9, { rim: '#9ca3af' }); figure(c, cx + W * 0.24, gy, fs * 1.05, { rim: '#9ca3af' });
    c.beginPath(); c.moveTo(0, H); for (let x = 0; x <= W; x += 6) c.lineTo(x, gy - hAt(x)); c.lineTo(W, H); c.closePath();
    const g = c.createLinearGradient(0, gy - Hm, 0, gy); g.addColorStop(0, 'rgba(125,211,252,0.88)'); g.addColorStop(1, 'rgba(3,105,161,0.92)'); c.fillStyle = g; c.fill();
    c.strokeStyle = 'rgba(240,249,255,0.9)'; c.lineWidth = 4; c.beginPath(); for (let x = 0; x <= W; x += 6) { const y = gy - hAt(x); x ? c.lineTo(x, y) : c.moveTo(x, y); } c.stroke();
    for (const s of S.spray) { const x = xf - dir * s.o * W * 0.12, base = gy - hAt(x), q = seg(t, 0.9, 4.0), y = base - 20 - Math.sin(((t * s.v + s.o) % 1) * Math.PI) * 60 * fs; if (q > 0 && q < 1 && hAt(x) > 6) { c.fillStyle = 'rgba(240,249,255,0.8)'; c.beginPath(); c.arc(x, y, s.s, 0, TAU); c.fill(); } }
    if (drain > 0) { c.strokeStyle = `rgba(186,230,253,${0.4 * drain})`; c.lineWidth = 2; for (let i = 0; i < 6; i++) { c.beginPath(); c.ellipse(W * (0.1 + i * 0.16), gy + 14 + (i % 2) * 14, 40 * fs, 5 * fs, 0, 0, TAU); c.stroke(); } }
  },
};

// 86 — Fireball at 5th level on self: rising column and mushroom cap, ember rain.
const fireball86 = {
  concept: 'A dark ring contracts into a white-hot pinpoint, then a vast ground-hugging blast disc and a rising column topped by a mushroom cap tower over the caster, followed by a rain of falling embers on a scorched floor.',
  duration: 7.0,
  init(W, H, r) { return { puffs: Array.from({ length: 60 }, () => ({ u: r(), a: r() * TAU, s: 0.5 + r() * 0.5, ph: r() * TAU })), em: Array.from({ length: 70 }, () => ({ x: r() * 2 - 1, d: r() * 1.6, v: 0.6 + r(), s: 1.5 + r() * 2 })) }; },
  draw(c, W, H, t, S) {
    const { fs, gy, cx, unit } = layout(W, H), cy = gy - 56 * fs, boom = seg(t, 1.4, 2.2), colr = easeOut(seg(t, 1.7, 4.2)), fade = 1 - seg(t, 4.0, 6.6);
    bg(c, W, H, gy, '#12050a', '#2a0b0a', 'rgba(251,146,60,0.35)');
    const ch = seg(t, 0, 1.4); add(c);
    if (ch < 1) { c.strokeStyle = `rgba(255,200,120,${0.6 * ch})`; c.lineWidth = 3; c.beginPath(); c.arc(cx, cy, (1 - easeIn(ch)) * unit * 0.45 + 6, 0, TAU); c.stroke(); glow(c, cx, cy, 8 + 40 * ch, '255,240,200', 0.9 * ch); }
    // blast disc along the ground
    const dr = easeOut(boom) * W * 0.62; if (boom > 0) { c.fillStyle = 'rgba(251,146,60,0.25)'; c.beginPath(); c.ellipse(cx, gy + 4, dr, dr * 0.12, 0, 0, TAU); c.fill(); c.strokeStyle = `rgba(255,230,190,${0.8 * (1 - boom * 0.7)})`; c.lineWidth = 4; c.stroke(); }
    // column + cap
    const top = gy - colr * H * 0.82, capR = unit * (0.1 + 0.22 * colr);
    for (const p of S.puffs) { const y = lerp(gy - 10 * fs, top, p.u), isCap = p.u > 0.82, w = isCap ? capR : unit * 0.09 * (1 + 0.5 * (1 - p.u)), x = cx + Math.cos(p.a) * w * p.s + Math.sin(t * 2 + p.ph) * 6, yy = y + (isCap ? Math.sin(p.a) * capR * 0.5 : 0), r = (isCap ? capR * 0.85 : unit * 0.13) * p.s * (0.8 + 0.2 * Math.sin(t * 3 + p.ph)), heat = clamp(1 - p.u * 0.9 - seg(t, 2.4, 5) * 0.6);
      if (colr <= 0) continue; const g = c.createRadialGradient(x, yy, 0, x, yy, r); g.addColorStop(0, `rgba(255,${Math.round(90 + 110 * heat)},${Math.round(30 + 60 * heat)},${0.75 * fade})`); g.addColorStop(1, 'rgba(120,20,0,0)'); c.fillStyle = g; c.fillRect(x - r, yy - r, r * 2, r * 2); }
    glow(c, cx, cy, unit * 0.35 * easeOut(boom), '255,190,110', 0.5 * (1 - seg(t, 2.0, 3.2)));
    norm(c);
    const fl = 1 - seg(t, 1.4, 1.75); if (t >= 1.4 && fl > 0) { c.fillStyle = `rgba(255,240,215,${0.5 * fl})`; c.fillRect(0, 0, W, H); }
    for (const e of S.em) { const q = seg(t, 3.0 + e.d, 6.2 + e.d); if (q > 0 && q < 1) { c.fillStyle = `rgba(253,${Math.round(160 + 60 * (1 - q))},60,${0.9 * Math.sin(q * Math.PI)})`; c.fillRect(cx + e.x * W * 0.45, H * 0.1 + q * q * e.v * (gy - H * 0.1), e.s, e.s * 2); } }
    figure(c, cx, gy, fs, { fill: '#050203', rim: '#ffb070' });
  },
};

// 90 — 4d6 force damage, no save: pressure shockwave that cracks the air.
const force90 = {
  concept: 'Radial pull-in lines collapse on the caster, then a violet-white pressure shell expands; glass-like cracks fork across the air, shards scatter, and each figure squashes down as the shell passes and springs back.',
  duration: 4.8,
  init(W, H, r) { return { cr: Array.from({ length: 14 }, (_, i) => { const a = (i / 14) * TAU + r() * 0.3; return Array.from({ length: 7 }, (_, k) => ({ a: a + (r() - 0.5) * 0.25, d: (k + 1) / 7 })); }), sh: Array.from({ length: 30 }, () => ({ a: r() * TAU, v: 0.4 + r(), s: 3 + r() * 5, ro: r() * TAU })) }; },
  draw(c, W, H, t, S) {
    const { fs, gy, cx, unit } = layout(W, H), cy = gy - 62 * fs, R = easeOut(seg(t, 1.0, 2.4)) * W * 0.6, xs = [cx - W * 0.28, cx, cx + W * 0.28];
    bg(c, W, H, gy, '#0a0714', '#170f2e', 'rgba(196,181,253,0.3)');
    xs.forEach((x, i) => { const d = Math.abs(x - cx), hit = seg(R - d, 0, 40) * (1 - seg(R - d, 40, 200)), sq = Math.sin(hit * Math.PI); c.save(); c.translate(x, gy); c.scale(1 + 0.12 * sq, 1 - 0.2 * sq); figure(c, 0, 0, fs * (i === 1 ? 1 : 0.92), { rim: i === 1 ? '#ddd6fe' : '#a1a1aa' }); c.restore(); });
    add(c);
    const ch = seg(t, 0, 1.0); if (ch < 1) { c.strokeStyle = `rgba(196,181,253,${0.5 * Math.sin(ch * Math.PI)})`; c.lineWidth = 1.5; for (let i = 0; i < 18; i++) { const a = (i / 18) * TAU, d0 = (1 - ch) * unit * 0.5 + 20 * fs; c.beginPath(); c.moveTo(cx + Math.cos(a) * d0, cy + Math.sin(a) * d0); c.lineTo(cx + Math.cos(a) * (d0 + 30 * fs), cy + Math.sin(a) * (d0 + 30 * fs)); c.stroke(); } }
    if (R > 0 && t < 3.6) { const a = 1 - seg(t, 2.2, 3.6); c.strokeStyle = `rgba(237,233,254,${0.85 * a})`; c.lineWidth = 7 * (1 - seg(t, 1, 2.6)) + 1.5; c.beginPath(); c.arc(cx, cy, R, 0, TAU); c.stroke(); c.strokeStyle = `rgba(167,139,250,${0.4 * a})`; c.lineWidth = 22; c.beginPath(); c.arc(cx, cy, R * 0.97, 0, TAU); c.stroke(); }
    c.strokeStyle = `rgba(245,243,255,${0.8 * (1 - seg(t, 2.6, 4.2))})`; c.lineWidth = 1.5;
    for (const line of S.cr) { c.beginPath(); c.moveTo(cx, cy); for (const p of line) if (p.d * W * 0.6 <= R) c.lineTo(cx + Math.cos(p.a) * p.d * W * 0.6, cy + Math.sin(p.a) * p.d * W * 0.6); c.stroke(); }
    for (const s of S.sh) { const q = seg(t, 1.1, 3.8); if (q > 0 && q < 1) { const d = easeOut(q) * W * 0.5 * s.v; c.save(); c.translate(cx + Math.cos(s.a) * d, cy + Math.sin(s.a) * d); c.rotate(s.ro + q * 4); c.fillStyle = `rgba(221,214,254,${0.6 * (1 - q)})`; c.beginPath(); c.moveTo(0, -s.s); c.lineTo(s.s * 0.8, s.s * 0.6); c.lineTo(-s.s * 0.8, s.s * 0.6); c.closePath(); c.fill(); c.restore(); } }
    norm(c);
  },
};

// 96 — localized earthquake: slabs of floor heave while figures stagger; no fall is shown.
const quake96 = {
  concept: 'The floor splits into slabs that heave out of phase with widening black fissures; dust jets from the cracks, pebbles drop from above, and three figures stagger and sway without any outcome being assumed.',
  duration: 5.0,
  init(W, H, r) { return { peb: Array.from({ length: 24 }, () => ({ x: r(), d: r() * 2, s: 3 + r() * 5 })), dust: Array.from({ length: 12 }, () => ({ i: Math.floor(r() * 5), v: 0.4 + r() })) }; },
  draw(c, W, H, t, S) {
    const { fs, gy, cx } = layout(W, H), env = seg(t, 0.7, 1.4) * (1 - seg(t, 3.9, 4.8)), n = 5, sw = W / n;
    sky(c, W, H, '#0e0b08', '#1e1710');
    const off = (i) => Math.sin(t * 13 + i * 1.9) * 9 * fs * env;
    for (let i = 0; i < n; i++) { const o = off(i), gap = 7 * fs * env; c.fillStyle = '#17110b'; c.fillRect(i * sw + gap / 2, gy + o, sw - gap, H - gy); c.fillStyle = 'rgba(180,140,90,0.35)'; c.fillRect(i * sw + gap / 2, gy + o, sw - gap, 2); c.fillStyle = '#000'; c.fillRect(i * sw - gap / 2, gy, gap, H - gy); }
    [[-0.26, 0.9], [0, 1], [0.26, 1.05]].forEach(([o, k], j) => { const x = cx + o * W, slab = Math.min(n - 1, Math.max(0, Math.floor(x / sw))), tilt = Math.sin(t * 9 + j * 1.5) * 0.09 * env; c.save(); c.translate(x, gy + off(slab)); c.rotate(tilt); figure(c, 0, 0, fs * k, { rim: '#fcd34d' }); c.restore(); });
    for (const d of S.dust) { const q = seg(t, 0.9, 3.8), x = d.i * sw, y = gy - q * d.v * 110 * fs, r = (20 + q * 40) * fs; if (q > 0 && q < 1) { const g = c.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, `rgba(160,130,95,${0.3 * Math.sin(q * Math.PI) * env + 0.0})`); g.addColorStop(1, 'rgba(160,130,95,0)'); c.fillStyle = g; c.fillRect(x - r, y - r, r * 2, r * 2); } }
    c.fillStyle = '#6b5640'; for (const p of S.peb) { const q = seg(t, 0.9 + p.d, 2.4 + p.d); if (q > 0 && q < 1) c.fillRect(p.x * W, q * q * gy, p.s, p.s); }
  },
};

// 97 — permanent Wall of Fire, 20-ft line in a random direction.
const wall97 = {
  concept: 'A line of flame erupts at the caster\'s side and races 20 ft along the floor (left or right, rolled each play), thickening into a tall, steadily burning wall that lights the room and throws embers — and keeps burning at the end.',
  duration: 5.2,
  init(W, H, r) { return { dir: Math.random() < 0.5 ? -1 : 1, fl: Array.from({ length: 34 }, (_, i) => ({ i, ph: r() * TAU, h: 0.8 + r() * 0.5 })), em: Array.from({ length: 30 }, () => ({ x: r(), d: r() * 2, v: 0.6 + r() })) }; },
  draw(c, W, H, t, S) {
    const { fs, gy, cx } = layout(W, H), L = W * 0.4, x0 = cx + S.dir * 44 * fs;
    bg(c, W, H, gy, '#100705', '#240e08', 'rgba(251,146,60,0.35)');
    const reach = easeOut(seg(t, 0.8, 2.6)), n = S.fl.length;
    add(c); glow(c, x0 + S.dir * L * reach * 0.5, gy - 70 * fs, L * 0.7 * reach, '251,120,40', 0.2 + 0.05 * Math.sin(t * 7)); norm(c);
    figure(c, cx, gy, fs, { fill: '#060302', rim: '#fdba74' });
    for (const f of S.fl) { const frac = f.i / n; if (frac > reach) continue; const age = clamp((reach - frac) * 3), x = x0 + S.dir * frac * L; flame(c, x, gy + 2, (110 + 40 * (1 - frac)) * fs * f.h * age, 15 * fs, t, f.ph); flame(c, x + 7 * fs, gy + 2, 80 * fs * f.h * age, 11 * fs, t + 0.4, f.ph + 1); }
    add(c); for (const e of S.em) { const q = ((t * 0.6 * e.v + e.d) % 1.6) / 1.6, x = x0 + S.dir * e.x * L * reach; if (e.x < reach) glow(c, x + Math.sin(q * 9 + e.d) * 10, gy - q * 220 * fs, 5, '253,186,116', 0.8 * (1 - q)); } norm(c);
  },
};

// 100 — massive arcane detonation, 6d6 radiant in 40 ft; caster at the centre.
const detonation100 = {
  concept: 'A rune-ringed circle blazes on the floor, then a single decaying white-gold flash opens into a starburst of radial light rays and a rolling radiant shock ring, leaving gold motes rising from a glowing sigil.',
  duration: 5.6,
  init(W, H, r) { return { rays: Array.from({ length: 36 }, (_, i) => ({ a: (i / 36) * TAU + r() * 0.05, l: 0.5 + r() * 0.6, w: 0.03 + r() * 0.04 })), mo: Array.from({ length: 40 }, () => ({ x: r() * 2 - 1, d: r() * 1.5, v: 0.5 + r() })) }; },
  draw(c, W, H, t, S) {
    const { fs, gy, cx, unit } = layout(W, H), cy = gy - 62 * fs, boom = seg(t, 1.5, 2.3), ring = seg(t, 0.2, 1.4);
    bg(c, W, H, gy, '#0e0a05', '#201706', 'rgba(253,224,71,0.35)');
    c.save(); c.translate(cx, gy + 8); c.scale(1, 0.22); c.strokeStyle = `rgba(253,224,71,${0.9 * ring})`; c.lineWidth = 4; for (const r of [0.34, 0.24]) { c.beginPath(); c.arc(0, 0, unit * r, 0, TAU); c.stroke(); } for (let i = 0; i < 18; i++) { const a = (i / 18) * TAU + t * 0.5; c.beginPath(); c.moveTo(Math.cos(a) * unit * 0.24, Math.sin(a) * unit * 0.24); c.lineTo(Math.cos(a) * unit * 0.34, Math.sin(a) * unit * 0.34); c.stroke(); } c.restore();
    add(c);
    const gl = (t < 1.5 ? seg(t, 0.4, 1.5) * 0.5 : 0.5 * (1 - seg(t, 2.0, 4.2))); glow(c, cx, cy, unit * 0.4 * (0.4 + boom), '254,240,138', gl);
    if (boom > 0) for (const ry of S.rays) { const len = unit * 1.1 * ry.l * easeOut(boom), a = ry.a + t * 0.04, w = ry.w; c.fillStyle = `rgba(254,240,138,${0.55 * (1 - seg(t, 2.4, 4.6))})`; c.beginPath(); c.moveTo(cx, cy); c.lineTo(cx + Math.cos(a - w) * len, cy + Math.sin(a - w) * len); c.lineTo(cx + Math.cos(a + w) * len, cy + Math.sin(a + w) * len); c.closePath(); c.fill(); }
    const rq = seg(t, 1.5, 3.0); if (rq > 0 && rq < 1) { c.strokeStyle = `rgba(255,251,220,${0.8 * (1 - rq)})`; c.lineWidth = 8 * (1 - rq) + 1; c.beginPath(); c.arc(cx, cy, easeOut(rq) * W * 0.55, 0, TAU); c.stroke(); }
    for (const m of S.mo) { const q = seg(t, 2.2 + m.d, 5.4 + m.d * 0.2); if (q > 0 && q < 1) glow(c, cx + m.x * unit * 0.5, gy - q * m.v * H * 0.55, 6, '254,240,138', 0.9 * Math.sin(q * Math.PI)); }
    norm(c);
    const fl = 1 - seg(t, 1.5, 1.8); if (t >= 1.5 && fl > 0) { c.fillStyle = `rgba(255,252,235,${0.6 * fl})`; c.fillRect(0, 0, W, H); }
    figure(c, cx, gy, fs, { fill: '#1a1204', rim: '#fff7cc', rimWidth: 3 });
  },
};

export const ELEMENTAL_SCENES = { 35: thunder35, 46: snuff46, 49: frost49, 58: static58, 79: flamebody79, 82: hotmetal82, 83: tidal83, 86: fireball86, 90: force90, 96: quake96, 97: wall97, 100: detonation100 };
