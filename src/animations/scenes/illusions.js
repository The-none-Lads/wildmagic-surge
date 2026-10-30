// Illusion / apparition / perception family: 10, 13, 37, 52, 57, 64, 65, 24, 101, 112, 32, 114.
import { TAU, clamp, lerp, smooth, easeOut, seg, layout, sky, ground, glow, figure } from './toolkit.js';

const bg = (c, W, H, gy, a = '#070a1c', b = '#10163a', rim = 'rgba(125,211,252,0.3)') => { sky(c, W, H, a, b); ground(c, W, H, gy, '#080b1a', rim); };
/** Vertical stripes used as a "background pattern" that refraction scenes can distort. */
function bars(c, x0, x1, y0, y1, shift, a = 0.22) {
  c.fillStyle = `rgba(165,200,255,${a})`;
  for (let x = Math.floor(x0 / 18) * 18; x < x1; x += 18) c.fillRect(x + shift, y0, 6, y1 - y0);
}
const spectral = (c, a) => { c.fillStyle = `rgba(186,230,253,${0.22 * a})`; c.strokeStyle = `rgba(224,242,254,${0.9 * a})`; c.lineWidth = 2; c.lineJoin = 'round'; c.lineCap = 'round'; };

function kitten(c, x, y, s, a) {
  c.save(); c.translate(x, y); c.scale(s, s); spectral(c, a); c.lineWidth = 2 / s;
  c.beginPath(); c.ellipse(0, -9, 11, 8, 0, 0, TAU); c.fill(); c.stroke();
  c.beginPath(); c.arc(9, -21, 7, 0, TAU); c.fill(); c.stroke();
  for (const e of [3, 13]) { c.beginPath(); c.moveTo(e, -26); c.lineTo(e + 1, -35); c.lineTo(e + 5, -27); c.fill(); c.stroke(); }
  c.beginPath(); c.moveTo(-10, -8); c.quadraticCurveTo(-24, -10, -20, -24); c.stroke();
  c.restore();
}
function wolf(c, x, y, s, a, jaw = 0) {
  c.save(); c.translate(x, y); c.scale(s, s); spectral(c, a); c.lineWidth = 2 / s;
  for (const lx of [-18, -8, 14, 24]) { c.beginPath(); c.moveTo(lx, -24); c.lineTo(lx - 2, 0); c.stroke(); }
  c.beginPath(); c.ellipse(0, -34, 30, 14, 0, 0, TAU); c.fill(); c.stroke();
  c.beginPath(); c.moveTo(-26, -44); c.lineTo(-48, -40); c.lineTo(-62, -30); c.lineTo(-48, -29 + jaw * 0.2); c.lineTo(-30, -26); c.closePath(); c.fill(); c.stroke();
  c.beginPath(); c.moveTo(-50, -29 + jaw * 0.2); c.lineTo(-58, -24 + jaw); c.lineTo(-38, -22 + jaw * 0.5); c.stroke();
  c.beginPath(); c.moveTo(-32, -50); c.lineTo(-30, -62); c.lineTo(-24, -50); c.fill(); c.stroke();
  c.beginPath(); c.moveTo(29, -40); c.quadraticCurveTo(46, -42, 48, -56); c.stroke();
  c.restore();
}
function hand(c, x, y, s, a) {
  c.save(); c.translate(x, y); c.scale(s, s); spectral(c, a); c.lineWidth = 2 / s;
  c.beginPath(); c.ellipse(0, 0, 14, 16, 0, 0, TAU); c.fill(); c.stroke();
  for (let i = 0; i < 4; i++) { c.save(); c.rotate(-0.35 + i * 0.24 + 0.0); c.beginPath(); c.roundRect(-4 + (i - 1.5) * 6, 8, 7, 24, 3.5); c.fill(); c.stroke(); c.restore(); }
  c.beginPath(); c.ellipse(-16, 2, 6, 11, 0.7, 0, TAU); c.fill(); c.stroke();
  c.restore();
}

// 10 — spectral kitten on the shoulder, purring.
const kitten10 = {
  concept: 'A translucent kitten shimmers into being on the caster\'s shoulder with a sparkle, its tail swishing while soft purr-ripples pulse outward, then it dissolves into drifting motes.',
  duration: 4.6,
  init(W, H, r) { return Array.from({ length: 16 }, () => ({ a: r() * TAU, v: 0.4 + r() })); },
  draw(c, W, H, t, S) {
    const { fs, gy, cx } = layout(W, H), kx = cx + 26 * fs, ky = gy - 90 * fs, a = smooth(seg(t, 0.5, 1.3)) * (1 - smooth(seg(t, 3.4, 4.3)));
    bg(c, W, H, gy); figure(c, cx, gy, fs, { rim: '#7dd3fc' });
    c.globalCompositeOperation = 'lighter'; glow(c, kx, ky - 10 * fs, 40 * fs, '186,230,253', 0.35 * Math.sin(seg(t, 0.3, 1.5) * Math.PI));
    for (let i = 0; i < 3; i++) { const q = ((t * 1.6 + i / 3) % 1); if (a > 0.3) { c.strokeStyle = `rgba(186,230,253,${0.4 * (1 - q) * a})`; c.lineWidth = 2; c.beginPath(); c.arc(kx + 8 * fs, ky - 20 * fs, (10 + q * 34) * fs, 0, TAU); c.stroke(); } }
    c.globalCompositeOperation = 'source-over';
    c.save(); c.translate(0, Math.sin(t * 22) * 0.6 * a); kitten(c, kx, ky, fs * 2.1, a); c.restore();
    c.globalCompositeOperation = 'lighter';
    for (const m of S) { const q = seg(t, 3.4, 4.5); if (q > 0 && q < 1) glow(c, kx + Math.cos(m.a) * 30 * fs * q * m.v, ky - 12 * fs - q * 50 * fs * m.v, 7, '224,242,254', 0.8 * (1 - q)); }
    c.globalCompositeOperation = 'source-over';
  },
};

// 13 — shadow acts independently, replaying gestures from an hour ago.
const shadow13 = {
  concept: 'Low light throws a long shadow across the ground; while the caster stands rigid the shadow detaches its timing, waves, bows and shrugs on its own, trailed by faint rewinding after-images of the old gestures.',
  duration: 5.4,
  init() { return null; },
  draw(c, W, H, t) {
    const { fs, gy, cx, unit } = layout(W, H);
    bg(c, W, H, gy, '#0b0a14', '#181428', 'rgba(167,139,250,0.3)');
    c.globalCompositeOperation = 'lighter'; glow(c, cx - unit * 0.5, gy - unit * 0.3, unit * 0.5, '253,224,71', 0.18); c.save(); c.translate(cx + 40 * fs, gy + 20 * fs); c.scale(1, 0.22); glow(c, 0, 0, unit * 0.7, '253,224,71', 0.16); c.restore(); c.globalCompositeOperation = 'source-over';
    figure(c, cx, gy, fs, { rim: '#fde68a' });
    const free = smooth(seg(t, 0.9, 1.5)), arm = (t > 1.4 && t < 2.6 ? Math.sin((t - 1.4) * 9) * 0.6 : 0) + (t > 3.2 && t < 4.2 ? 1.1 : 0.0);
    const bow = t > 2.7 && t < 3.6 ? Math.sin(seg(t, 2.7, 3.6) * Math.PI) * 0.5 : 0, shrug = t > 4.2 ? Math.sin(seg(t, 4.2, 5.0) * Math.PI) * 8 * fs : 0;
    const drawShadow = (alpha, off, lag) => {
      c.save(); c.translate(cx + off, gy + 2); c.transform(1, 0, -0.6, -0.5, 0, 0);
      c.fillStyle = `rgba(0,0,0,${alpha})`; c.strokeStyle = `rgba(167,139,250,${0.6 * alpha})`; c.lineWidth = 1.5;
      c.save(); c.rotate(bow); c.scale(fs, fs);
      c.beginPath(); c.moveTo(-27, 0); c.quadraticCurveTo(-24, -66, -9, -97); c.lineTo(9, -97); c.quadraticCurveTo(24, -66, 27, 0); c.closePath(); c.fill(); c.stroke();
      c.beginPath(); c.arc(0, -112, 16, 0, TAU); c.fill(); c.stroke();
      c.lineWidth = 7; c.strokeStyle = `rgba(0,0,0,${alpha})`; c.lineCap = 'round'; c.beginPath(); c.moveTo(22, -80); c.lineTo(22 + 30 * Math.cos(arm - lag), -80 - 34 * Math.abs(Math.sin(arm - lag + 1.0)) + shrug / fs); c.stroke();
      c.restore(); c.restore();
    };
    for (let i = 3; i >= 1; i--) if (free > 0.3) drawShadow(0.07 * free, -i * 6 * fs, i * 0.3);
    drawShadow(0.85 * (0.4 + 0.6 * free), free * 14 * fs, 0);
  },
};

// 37 — illusory double that mimics the caster but cannot touch anything.
const double37 = {
  concept: 'A scan-lined blue double steps out of the caster, sways in lock-step, then reaches straight through a solid crate with rippling interference lines to show it cannot touch anything.',
  duration: 5.4,
  init() { return null; },
  draw(c, W, H, t) {
    const { fs, gy, cx } = layout(W, H), out = smooth(seg(t, 0.7, 1.7)), sway = Math.sin(t * 1.8) * 10 * fs * seg(t, 1.5, 2.2), dx = cx + 110 * fs * out;
    bg(c, W, H, gy);
    const bx = cx + 118 * fs;
    c.fillStyle = '#4a3320'; c.strokeStyle = '#a16207'; c.lineWidth = 2; c.fillRect(bx - 18 * fs, gy - 32 * fs, 36 * fs, 32 * fs); c.strokeRect(bx - 18 * fs, gy - 32 * fs, 36 * fs, 32 * fs); c.beginPath(); c.moveTo(bx - 18 * fs, gy - 32 * fs); c.lineTo(bx + 18 * fs, gy); c.stroke();
    figure(c, cx + sway, gy, fs, { rim: '#7dd3fc' });
    if (t > 0.6) {
      const a = (0.55 + 0.1 * Math.sin(t * 9)) * seg(t, 0.6, 1.2), px = dx - sway * 0.0 + sway; // double mirrors the sway
      c.save(); c.beginPath(); c.rect(0, 0, W, H); c.clip(); figure(c, px, gy, fs, { fill: 'rgba(56,189,248,0.25)', rim: '#67e8f9', alpha: a }); 
      c.globalCompositeOperation = 'lighter'; c.fillStyle = 'rgba(165,243,252,0.12)'; for (let y = gy - 140 * fs; y < gy; y += 5) c.fillRect(px - 30 * fs, y + ((t * 30) % 5), 60 * fs, 1.5); c.restore();
      const reach = Math.sin(seg(t, 2.6, 4.4) * Math.PI);
      if (reach > 0.02) { const hx = lerp(px + 14 * fs, bx, reach * 0.95), hy = gy - 60 * fs; c.strokeStyle = `rgba(103,232,249,${0.8})`; c.lineWidth = 5 * fs; c.lineCap = 'round'; c.beginPath(); c.moveTo(px + 14 * fs, hy); c.lineTo(hx, hy); c.stroke(); if (hx > bx - 20 * fs) for (let k = 0; k < 4; k++) { c.strokeStyle = `rgba(165,243,252,${0.5 * (1 - k / 4)})`; c.lineWidth = 2; c.beginPath(); c.arc(bx - 18 * fs + 6 * fs, hy, 8 * fs + k * 6 * fs * reach, -1, 1); c.stroke(); } }
      c.globalCompositeOperation = 'source-over';
    }
  },
};

// 57 — translucent for a round, still visible.
const ghost57 = {
  concept: 'The caster\'s colour drains until the striped wall behind shows through, with the background refracting slightly inside the outline — fainter and stealthier, but plainly still there.',
  duration: 4.6,
  init() { return null; },
  draw(c, W, H, t) {
    const { fs, gy, cx } = layout(W, H), a = smooth(seg(t, 0.7, 2.0)), wall = gy - 190 * fs;
    bg(c, W, H, gy); bars(c, 0, W, wall, gy, 0, 0.2);
    // refracted bars inside the silhouette
    c.save(); c.translate(cx, gy); c.scale(fs, fs); c.beginPath(); c.moveTo(-27, 0); c.quadraticCurveTo(-24, -66, -9, -97); c.lineTo(9, -97); c.quadraticCurveTo(24, -66, 27, 0); c.closePath(); c.moveTo(16, -108); c.arc(0, -112, 16, 0, TAU); c.restore();
    c.save(); c.clip(); c.fillStyle = `rgba(8,11,26,${1 - 0.75 * a})`; c.fillRect(0, 0, W, H); bars(c, 0, W, wall, gy, 5 + Math.sin(t * 2) * 2, 0.35 * a); c.restore();
    figure(c, cx, gy, fs, { fill: 'rgba(0,0,0,0)', rim: '#a5f3fc', alpha: 1 - 0.45 * a });
    c.globalCompositeOperation = 'lighter'; glow(c, cx, gy - 66 * fs, 90 * fs, '165,243,252', 0.12 * a); c.globalCompositeOperation = 'source-over';
  },
};

// 65 — invisibility wave across the group.
const invis65 = {
  concept: 'An expanding ring sweeps over three figures; each flickers to an outline and then vanishes completely, leaving only a heat-haze ripple in the striped wall behind them.',
  duration: 5.2,
  init() { return null; },
  draw(c, W, H, t) {
    const { fs, gy, cx, unit } = layout(W, H), xs = [cx - W * 0.2, cx, cx + W * 0.2], wall = gy - 190 * fs, ring = easeOut(seg(t, 0.8, 2.4)) * W * 0.5;
    bg(c, W, H, gy, '#080a18', '#101530');
    xs.forEach((x, i) => {
      const gone = smooth(clamp((ring - Math.abs(x - cx)) / (W * 0.08))), haze = gone * (0.6 + 0.4 * Math.sin(t * 2 + i));
      bars(c, x - 40 * fs, x + 40 * fs, wall, gy, Math.sin(t * 5 + i + (gy - wall) * 0.01) * 4 * haze, 0.2);
      if (gone < 1) figure(c, x, gy, fs, { rim: '#a5f3fc', alpha: 1 - gone });
      if (gone > 0.2 && gone < 0.95) figure(c, x, gy, fs, { fill: 'rgba(0,0,0,0)', rim: '#e0f2fe', alpha: 0.5 * (1 - Math.abs(gone - 0.55) * 2) });
    });
    bars(c, 0, W, wall, gy, 0, 0.08);
    c.globalCompositeOperation = 'lighter'; const ra = Math.sin(seg(t, 0.8, 2.6) * Math.PI);
    c.strokeStyle = `rgba(186,230,253,${0.6 * ra})`; c.lineWidth = 3; c.beginPath(); c.ellipse(cx, gy + 4, ring, ring * 0.14, 0, 0, TAU); c.stroke(); c.globalCompositeOperation = 'source-over'; void unit;
  },
};

// 24 — phantom drumroll: exactly 3 seconds, heard by everyone within 30 ft.
const drum24 = {
  concept: 'A faint spectral snare drum appears in mid-air from nowhere; blurred sticks alternate for exactly three seconds under a draining three-second arc, ripple rings spread to the onlookers, and a final accent ring ends it.',
  duration: 5.2,
  init() { return null; },
  draw(c, W, H, t) {
    const { fs, gy, cx, unit } = layout(W, H), dx = cx + 20 * fs, dy = gy - 190 * fs, roll = t > 0.9 && t < 3.9, rt = t - 0.9;
    bg(c, W, H, gy, '#0c0a1c', '#1a1236', 'rgba(244,114,182,0.3)');
    [cx - W * 0.22, cx + W * 0.24].forEach((x, i) => figure(c, x, gy, fs * (0.95 + i * 0.07), { rim: '#9ca3af', alpha: 0.9 }));
    figure(c, cx, gy, fs, { rim: '#f9a8d4' });
    const da = smooth(seg(t, 0.2, 0.9)) * (1 - smooth(seg(t, 4.2, 4.9)));
    c.save(); c.translate(dx, dy); spectral(c, da); c.lineWidth = 2; c.beginPath(); c.ellipse(0, 0, 34 * fs, 10 * fs, 0, 0, TAU); c.fill(); c.stroke(); c.beginPath(); c.moveTo(-34 * fs, 0); c.lineTo(-34 * fs, 26 * fs); c.ellipse(0, 26 * fs, 34 * fs, 10 * fs, 0, Math.PI, 0, true); c.lineTo(34 * fs, 0); c.fill(); c.stroke();
    for (const s of [-1, 1]) { const up = roll ? Math.sin(rt * 26 + (s > 0 ? Math.PI : 0)) : 0.2; c.strokeStyle = `rgba(253,224,71,${da})`; c.lineWidth = 4; c.beginPath(); c.moveTo(s * 40 * fs, -48 * fs); c.lineTo(s * 14 * fs, -4 * fs - up * 16 * fs); c.stroke(); }
    c.restore();
    c.globalCompositeOperation = 'lighter';
    if (roll) for (let i = 0; i < 3; i++) { const q = (rt * 1.3 + i / 3) % 1; c.strokeStyle = `rgba(249,168,212,${0.35 * (1 - q) * (0.5 + 0.5 * seg(t, 0.9, 3.9))})`; c.lineWidth = 2; c.beginPath(); c.arc(dx, dy, 20 * fs + q * unit * 0.5, 0, TAU); c.stroke(); }
    const fin = seg(t, 3.9, 4.7); if (fin > 0 && fin < 1) { c.strokeStyle = `rgba(255,255,255,${0.7 * (1 - fin)})`; c.lineWidth = 4; c.beginPath(); c.arc(dx, dy, easeOut(fin) * unit * 0.7, 0, TAU); c.stroke(); }
    const tm = clamp(rt / 3), ax = W * 0.08, ay = H * 0.14; if (t > 0.3) { c.strokeStyle = 'rgba(249,168,212,0.25)'; c.lineWidth = 4; c.beginPath(); c.arc(ax, ay, 16, 0, TAU); c.stroke(); c.strokeStyle = 'rgba(253,224,71,0.9)'; c.beginPath(); c.arc(ax, ay, 16, -Math.PI / 2, -Math.PI / 2 + TAU * (1 - tm)); c.stroke(); }
    c.globalCompositeOperation = 'source-over';
  },
};

// 64 — hostile spectral wolf.
const wolf64 = {
  concept: 'Two red eyes ignite in a patch of mist, a pale spectral wolf coalesces out of wisps ten feet from the caster, then stalks forward with lowered head and snarls with a gaping jaw — clearly hostile.',
  duration: 5.6,
  init(W, H, r) { return Array.from({ length: 22 }, () => ({ x: r(), y: r(), a: r() * TAU })); },
  draw(c, W, H, t, S) {
    const { fs, gy, cx } = layout(W, H), wx = cx + 150 * fs - smooth(seg(t, 2.4, 3.8)) * 34 * fs, form = smooth(seg(t, 0.9, 2.2)), snarl = smooth(seg(t, 3.6, 4.2)) * 14;
    bg(c, W, H, gy, '#050a12', '#0b1722', 'rgba(125,211,252,0.28)');
    figure(c, cx, gy, fs, { rim: '#fca5a5', alpha: 1 });
    c.globalCompositeOperation = 'lighter';
    for (const m of S) { const q = seg(t, 0.2, 1.6), x = lerp(wx - 120 * fs + m.x * 240 * fs, wx - 20 * fs * (m.x - 0.5), q), y = lerp(gy - 90 * fs * m.y, gy - 30 * fs, q); glow(c, x, y, 30 * fs * (1 - 0.5 * q), '165,200,230', 0.2 * (1 - form * 0.6)); }
    c.globalCompositeOperation = 'source-over';
    const hunch = Math.sin(t * 5) * 1.2 * fs * form;
    if (form > 0) wolf(c, wx, gy + hunch, fs * 1.5, form, snarl);
    const eyes = smooth(seg(t, 0.4, 0.9)); c.globalCompositeOperation = 'lighter';
    for (const e of [0, 1]) glow(c, wx - (56 - e * 5) * fs * 1.5 * 1, gy - 38 * fs * 1.5 + hunch, 10 * fs, '248,113,113', 0.9 * eyes); c.globalCompositeOperation = 'source-over';
  },
};

// 52 — spectral hand drops a random mundane object.
const hand52 = {
  concept: 'A translucent hand trailing sleeve-wisps lowers from above clutching a mundane object (rope coil, torch or ration pack, chosen at random), releases it at the caster\'s feet with a small dust ring, waggles its fingers and fades.',
  duration: 4.6,
  init() { return { item: Math.floor(Math.random() * 3) }; },
  draw(c, W, H, t, S) {
    const { fs, gy, cx } = layout(W, H), down = smooth(seg(t, 0.4, 1.6)), drop = seg(t, 1.6, 2.2), hx = cx + 62 * fs, hy = lerp(-30 * fs, gy - 120 * fs, down), a = 1 - smooth(seg(t, 3.3, 4.2));
    bg(c, W, H, gy, '#09091a', '#141838');
    figure(c, cx, gy, fs, { rim: '#a5b4fc' });
    c.strokeStyle = `rgba(186,230,253,${0.4 * a})`; c.lineWidth = 8 * fs; c.lineCap = 'round'; c.beginPath(); for (let i = 0; i <= 20; i++) { const q = i / 20, y = lerp(-20, hy, q), x = hx + Math.sin(q * 8 - t * 3) * 12 * fs * (1 - q); i ? c.lineTo(x, y) : c.moveTo(x, y); } c.stroke();
    const itemY = drop > 0 ? lerp(hy + 36 * fs, gy - 12 * fs, drop * drop) : hy + 36 * fs, ix = hx - 4 * fs;
    c.save(); c.translate(ix, itemY); c.scale(fs, fs); c.fillStyle = '#d6c7a1'; c.strokeStyle = '#78604a'; c.lineWidth = 2 / fs;
    if (S.item === 0) { c.beginPath(); c.ellipse(0, 0, 14, 9, 0, 0, TAU); c.moveTo(7, 0); c.ellipse(0, 0, 7, 4, 0, 0, TAU); c.fill(); c.stroke(); }
    else if (S.item === 1) { c.fillStyle = '#92400e'; c.fillRect(-3, -4, 6, 30); c.strokeRect(-3, -4, 6, 30); c.fillStyle = '#fb923c'; c.beginPath(); c.ellipse(0, -10, 6, 10, 0, 0, TAU); c.fill(); }
    else { c.fillRect(-12, -8, 24, 16); c.strokeRect(-12, -8, 24, 16); c.beginPath(); c.moveTo(0, -8); c.lineTo(0, 8); c.stroke(); }
    c.restore();
    const wag = t > 2.2 ? Math.sin((t - 2.2) * 12) * 0.25 : 0; c.save(); c.translate(hx, hy); c.rotate(wag); hand(c, 0, 0, fs * 1.3, a * 0.95); c.restore();
    const dr = seg(t, 2.1, 3.1); if (dr > 0 && dr < 1) { c.strokeStyle = `rgba(214,199,161,${0.6 * (1 - dr)})`; c.lineWidth = 2; c.beginPath(); c.ellipse(ix, gy + 2, 10 * fs + dr * 44 * fs, 3 * fs + dr * 8 * fs, 0, 0, TAU); c.stroke(); }
  },
};

// 112 — spectral shield, +2 AC, immune to magic missile.
const shield112 = {
  concept: 'A kite-shaped spectral shield with a rune crest hovers beside the caster; three glowing magic-missile darts home in and each dissolves harmlessly against it in a ripple, showing the immunity.',
  duration: 5.4,
  init() { return null; },
  draw(c, W, H, t) {
    const { fs, gy, cx } = layout(W, H), sx = cx + 58 * fs, sy = gy - 66 * fs + Math.sin(t * 1.6) * 5 * fs, a = smooth(seg(t, 0.4, 1.2));
    bg(c, W, H, gy, '#080a1e', '#10163c');
    figure(c, cx, gy, fs, { rim: '#93c5fd' });
    // darts from the right edge
    c.globalCompositeOperation = 'lighter';
    for (let i = 0; i < 3; i++) {
      const t0 = 2.0 + i * 0.45, q = seg(t, t0, t0 + 0.7), x = lerp(W * 1.02, sx + 24 * fs, easeOut(q)), y = lerp(sy - 130 * fs + i * 30 * fs, sy + (i - 1) * 16 * fs, easeOut(q));
      if (q > 0 && q < 1) { for (let k = 0; k < 8; k++) glow(c, x + k * 9 * fs, y + (k * 9 * fs) * -0.25, (9 - k) * fs, '244,114,182', 0.7 * (1 - k / 8)); }
      const rp = seg(t, t0 + 0.7, t0 + 1.3); if (rp > 0 && rp < 1) { c.strokeStyle = `rgba(147,197,253,${0.8 * (1 - rp)})`; c.lineWidth = 2; c.beginPath(); c.ellipse(sx + 20 * fs, sy + (i - 1) * 16 * fs, rp * 30 * fs, rp * 40 * fs, 0, 0, TAU); c.stroke(); }
    }
    c.globalCompositeOperation = 'source-over';
    c.save(); c.translate(sx, sy); c.scale(fs, fs); spectral(c, a); c.lineWidth = 2.5 / fs;
    c.beginPath(); c.moveTo(0, -48); c.lineTo(26, -30); c.lineTo(22, 14); c.lineTo(0, 44); c.lineTo(-22, 14); c.lineTo(-26, -30); c.closePath(); c.fill(); c.stroke();
    c.beginPath(); c.moveTo(0, -30); c.lineTo(10, 0); c.lineTo(0, 24); c.lineTo(-10, 0); c.closePath(); c.stroke(); c.restore();
  },
};

// 101 — third eye on the forehead: advantage on Perception, so it reveals hidden things.
const eye101 = {
  concept: 'A vertical slit splits open on the caster\'s forehead into a golden eye that blinks once, then sweeps a lantern-like cone of sight across the room revealing a hidden glyph, footprints and a skulking figure behind a crate.',
  duration: 5.6,
  init() { return null; },
  draw(c, W, H, t) {
    const { fs, gy, cx, unit } = layout(W, H), ex = cx, ey = gy - 120 * fs, open = smooth(seg(t, 0.6, 1.5)), blink = t > 2.0 && t < 2.3 ? Math.abs(Math.sin((t - 2.0) / 0.3 * Math.PI)) : 0, o = open * (1 - blink);
    bg(c, W, H, gy, '#0b0814', '#160f26', 'rgba(250,204,21,0.25)');
    const ang = -0.35 + Math.sin(seg(t, 2.3, 5.2) * Math.PI * 1.2 - 0.4) * 0.55 * seg(t, 2.3, 2.8), lit = seg(t, 2.3, 2.9);
    const hidden = (x, y, vis, draw) => { c.save(); c.globalAlpha = 0.1 + 0.9 * vis; draw(x, y); c.restore(); };
    const seen = (x) => { const dx = x - ex, an = Math.atan2(gy - 20 * fs - ey, dx); return lit * clamp(1 - Math.abs(an - (ang * 1.2 + 0.35)) * 3.2); };
    const gx = cx - W * 0.28, kx = cx + W * 0.28, fx = cx + W * 0.4;
    hidden(gx, gy, Math.max(seen(gx), 0), (x, y) => { c.strokeStyle = '#fde047'; c.lineWidth = 2; c.beginPath(); c.ellipse(x, y + 4, 36 * fs, 8 * fs, 0, 0, TAU); c.stroke(); c.beginPath(); c.moveTo(x - 20 * fs, y + 4); c.lineTo(x, y - 4 * fs); c.lineTo(x + 20 * fs, y + 4); c.stroke(); });
    hidden(kx, gy, 1, (x, y) => { c.fillStyle = '#3a2a1a'; c.fillRect(x - 22 * fs, y - 36 * fs, 44 * fs, 36 * fs); });
    hidden(fx, gy, Math.max(seen(fx), seen(kx)) , (x, y) => figure(c, x - 14 * fs, y, fs * 0.9, { rim: '#fca5a5' }));
    figure(c, cx, gy, fs, { rim: '#fde68a' });
    c.globalCompositeOperation = 'lighter';
    if (lit > 0) { const g = c.createRadialGradient(ex, ey, 0, ex, ey, unit * 0.9); g.addColorStop(0, `rgba(253,224,71,${0.22 * lit})`); g.addColorStop(1, 'rgba(253,224,71,0)'); c.fillStyle = g; c.beginPath(); c.moveTo(ex, ey); for (const s of [-1, 1]) c.lineTo(ex + Math.cos(ang * 1.2 + 0.35 + s * 0.25) * unit * 1.2 * (cx < W ? 1 : 1) * 1, ey + Math.abs(Math.sin(ang * 1.2 + 0.35 + s * 0.25)) * unit * 0.9); c.closePath(); c.fill(); }
    glow(c, ex, ey, 40 * fs, '253,224,71', 0.5 * o); c.globalCompositeOperation = 'source-over';
    if (o > 0.02) { c.fillStyle = '#fef3c7'; c.strokeStyle = '#fde047'; c.lineWidth = 2; c.beginPath(); c.moveTo(ex - 14 * fs, ey); c.quadraticCurveTo(ex, ey - 12 * fs * o, ex + 14 * fs, ey); c.quadraticCurveTo(ex, ey + 12 * fs * o, ex - 14 * fs, ey); c.fill(); c.stroke(); c.fillStyle = '#ca8a04'; c.beginPath(); c.ellipse(ex, ey, 6 * fs, 6 * fs * o, 0, 0, TAU); c.fill(); c.fillStyle = '#0a0a16'; c.beginPath(); c.ellipse(ex, ey, 2 * fs, 5 * fs * o, 0, 0, TAU); c.fill(); }
    else { c.strokeStyle = '#fde047'; c.lineWidth = 2; c.beginPath(); c.moveTo(ex - 14 * fs, ey); c.lineTo(ex + 14 * fs, ey); c.stroke(); }
  },
};

// 32 — see invisible creatures for one round: a brief reveal that fades back.
const seeinv32 = {
  concept: 'A creature that is only a heat-haze ripple in the striped wall is suddenly outlined by a sweeping lens-ring from the caster\'s eyes, held clear for a moment with sparkles, then slips back into haze as the single round ends.',
  duration: 5.0,
  init() { return null; },
  draw(c, W, H, t) {
    const { fs, gy, cx, unit } = layout(W, H), cxr = cx + W * 0.24, wall = gy - 190 * fs, rev = smooth(seg(t, 1.5, 2.1)) * (1 - smooth(seg(t, 3.7, 4.5)));
    bg(c, W, H, gy, '#0a0a1c', '#121536'); bars(c, 0, W, wall, gy, 0, 0.18);
    bars(c, cxr - 36 * fs, cxr + 36 * fs, wall, gy, Math.sin(t * 4 + (gy - wall) * 0.02) * 4 * (1 - rev * 0.6), 0.3 * (1 - rev * 0.4));
    figure(c, cx, gy, fs, { rim: '#c4b5fd' });
    const lens = seg(t, 1.0, 2.2); c.globalCompositeOperation = 'lighter';
    if (lens > 0 && lens < 1) { c.strokeStyle = `rgba(196,181,253,${0.8 * (1 - lens)})`; c.lineWidth = 4; c.beginPath(); c.arc(cx, gy - 120 * fs, lens * unit * 0.8, -0.5, 0.5); c.stroke(); }
    glow(c, cx, gy - 120 * fs, 30 * fs, '196,181,253', 0.7 * Math.sin(seg(t, 0.8, 1.8) * Math.PI)); c.globalCompositeOperation = 'source-over';
    if (rev > 0) { figure(c, cxr, gy, fs * 1.05, { fill: 'rgba(196,181,253,0.18)', rim: '#e9d5ff', alpha: rev }); c.globalCompositeOperation = 'lighter'; for (let i = 0; i < 12; i++) glow(c, cxr + Math.sin(i * 9 + t) * 28 * fs, gy - ((i * 31 + t * 40) % 130) * fs, 4, '233,213,255', 0.7 * rev); c.globalCompositeOperation = 'source-over'; }
  },
};

// 114 — see invisible creatures with line of sight for a minute: sight-lines, one blocked by a wall.
const seeinv114 = {
  concept: 'Two sight-lines fan from the caster\'s eyes toward two invisible creatures; the one in the open is outlined and stays outlined while the one behind a stone wall remains only a haze, showing that line of sight is what matters.',
  duration: 5.4,
  init() { return null; },
  draw(c, W, H, t) {
    const { fs, gy, cx } = layout(W, H), ax = cx + W * 0.2, bx = cx + W * 0.4, wx = cx + W * 0.31, wall = gy - 190 * fs, ey = gy - 120 * fs, ray = easeOut(seg(t, 0.9, 1.9)), rev = smooth(seg(t, 1.8, 2.4));
    bg(c, W, H, gy, '#0a0a1c', '#141238'); bars(c, 0, W, wall, gy, 0, 0.14);
    bars(c, bx - 30 * fs, bx + 30 * fs, wall, gy, Math.sin(t * 4) * 4, 0.3);
    bars(c, ax - 30 * fs, ax + 30 * fs, wall, gy, Math.sin(t * 4 + 1) * 4 * (1 - rev), 0.3 * (1 - rev * 0.5));
    c.fillStyle = '#2a2638'; c.strokeStyle = '#6b6490'; c.lineWidth = 2; c.fillRect(wx - 14 * fs, gy - 110 * fs, 28 * fs, 110 * fs); c.strokeRect(wx - 14 * fs, gy - 110 * fs, 28 * fs, 110 * fs);
    figure(c, cx, gy, fs, { rim: '#c4b5fd' });
    figure(c, ax, gy, fs, { fill: 'rgba(196,181,253,0.18)', rim: '#e9d5ff', alpha: rev });
    c.globalCompositeOperation = 'lighter'; c.lineWidth = 2;
    c.strokeStyle = 'rgba(233,213,255,0.5)'; c.setLineDash([6, 6]); c.beginPath(); c.moveTo(cx + 8 * fs, ey); c.lineTo(lerp(cx, ax, ray), lerp(ey, gy - 70 * fs, ray)); c.stroke();
    const tx = lerp(cx, bx, ray), ty = lerp(ey, gy - 70 * fs, ray), stop = tx > wx - 14 * fs; c.strokeStyle = 'rgba(248,113,113,0.5)'; c.beginPath(); c.moveTo(cx + 8 * fs, ey); c.lineTo(stop ? wx - 14 * fs : tx, stop ? lerp(ey, gy - 70 * fs, (wx - 14 * fs - cx) / (bx - cx)) : ty); c.stroke(); c.setLineDash([]);
    if (stop) { const st = seg(t, 1.5, 2.2); glow(c, wx - 14 * fs, lerp(ey, gy - 70 * fs, (wx - 14 * fs - cx) / (bx - cx)), 18 * fs, '248,113,113', 0.7 * st); }
    c.globalCompositeOperation = 'source-over';
  },
};

export const ILLUSION_SCENES = { 10: kitten10, 13: shadow13, 37: double37, 57: ghost57, 65: invis65, 24: drum24, 64: wolf64, 52: hand52, 112: shield112, 101: eye101, 32: seeinv32, 114: seeinv114 };
