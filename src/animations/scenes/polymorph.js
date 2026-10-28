// Transformation family: 62, 111, 104, 87, 66, 94, 110, 30, 54. Each shows a different kind of change.
import { TAU, clamp, lerp, smooth, easeOut, seg, layout, sky, ground, glow, figure, figurePoints } from './toolkit.js';

/** Fluffy sheep, facing right. Origin = hooves. ~80 units wide, 60 tall. */
function sheep(c, x, y, s, { alpha = 1, rim = '#f9a8d4', hood = false } = {}) {
  c.save(); c.translate(x, y); c.scale(s, s); c.globalAlpha *= alpha;
  c.strokeStyle = rim; c.lineWidth = 2 / s; c.lineCap = 'round';
  for (const lx of [-18, -7, 8, 19]) { c.beginPath(); c.moveTo(lx, -20); c.lineTo(lx, -1); c.stroke(); }
  c.fillStyle = '#f8fafc';
  for (const [bx, by, r] of [[-18, -38, 13], [-6, -46, 15], [8, -46, 15], [19, -38, 13], [-8, -32, 15], [8, -32, 15], [0, -38, 17]]) { c.beginPath(); c.arc(bx, by, r, 0, TAU); c.fill(); c.stroke(); }
  c.fillStyle = '#1e1b2e'; c.beginPath(); c.ellipse(33, -42, 10, 12, 0.3, 0, TAU); c.fill(); c.stroke();
  c.beginPath(); c.ellipse(27, -50, 3, 6, -0.6, 0, TAU); c.fill(); c.stroke();
  c.fillStyle = '#fff'; c.beginPath(); c.arc(36, -45, 2.4, 0, TAU); c.fill();
  if (hood) { c.fillStyle = '#0a0a16'; c.strokeStyle = '#c8b6ff'; c.beginPath(); c.moveTo(24, -52); c.lineTo(32, -66); c.lineTo(40, -52); c.closePath(); c.fill(); c.stroke(); }
  c.restore();
}
function pot(c, x, y, s, grow, alpha = 1) {
  c.save(); c.translate(x, y); c.scale(s, s); c.globalAlpha *= alpha;
  c.fillStyle = '#b45309'; c.strokeStyle = '#fdba74'; c.lineWidth = 2 / s;
  c.beginPath(); c.moveTo(-22, -34); c.lineTo(22, -34); c.lineTo(15, 0); c.lineTo(-15, 0); c.closePath(); c.fill(); c.stroke();
  c.fillRect(-25, -42, 50, 9); c.strokeRect(-25, -42, 50, 9);
  c.strokeStyle = '#4ade80'; c.fillStyle = '#16a34a'; c.lineWidth = 3 / s;
  c.beginPath(); c.moveTo(0, -42); c.lineTo(0, -42 - 50 * grow); c.stroke();
  for (const [lx, ly, r] of [[-1, 0.4, -0.9], [1, 0.55, 0.9], [-1, 0.8, -0.6], [1, 0.95, 0.6]]) { const g = clamp(grow * 1.4 - ly * 0.4); c.save(); c.translate(0, -42 - 50 * ly * grow); c.rotate(r); c.beginPath(); c.ellipse(lx * 14 * g, 0, 15 * g, 6 * g, 0, 0, TAU); c.fill(); c.restore(); }
  const bl = clamp((grow - 0.85) / 0.15);
  if (bl > 0) { c.fillStyle = '#f472b6'; for (let i = 0; i < 6; i++) { const a = (i / 6) * TAU; c.beginPath(); c.ellipse(Math.cos(a) * 9 * bl, -94 + Math.sin(a) * 9 * bl, 7 * bl, 4 * bl, a, 0, TAU); c.fill(); } c.fillStyle = '#fde047'; c.beginPath(); c.arc(0, -94, 4 * bl, 0, TAU); c.fill(); }
  c.restore();
}
const bg = (c, W, H, gy, a, b, rim) => { sky(c, W, H, a, b); ground(c, W, H, gy, '#09070f', rim); };

// 62 — polymorphed into a sheep for a minute.
const sheep62 = {
  concept: 'Pink glitter spirals tighten round the caster, who squashes into a puff of cloud; a fluffy sheep bounces out wearing a tiny hood, hops three times and bleats a bewildered "Baa?" bubble.',
  duration: 5.2,
  init() { return null; },
  draw(c, W, H, t) {
    const { fs, gy, cx } = layout(W, H);
    bg(c, W, H, gy, '#14061c', '#2c1038', 'rgba(249,168,212,0.3)');
    const sw = Math.sin(seg(t, 0.3, 1.9) * Math.PI);
    c.globalCompositeOperation = 'lighter';
    for (let i = 0; i < 46; i++) { const a = (i / 46) * TAU * 3 + t * 5, q = i / 46, r = (110 - 90 * seg(t, 0.6, 1.6)) * fs * (0.4 + q), y = gy - 62 * fs + (q - 0.5) * 130 * fs; glow(c, cx + Math.cos(a) * r * 0.7, y, 9 * fs + 3, i % 2 ? '249,168,212' : '255,255,255', 0.7 * sw); }
    const puff = Math.sin(seg(t, 1.2, 2.0) * Math.PI); glow(c, cx, gy - 40 * fs, 120 * fs * puff, '255,236,245', 0.75 * puff);
    c.globalCompositeOperation = 'source-over';
    const sq = seg(t, 0.9, 1.6);
    if (t < 1.7) { c.save(); c.translate(cx, gy); c.scale(1 + 0.4 * sq, 1 - 0.55 * sq); figure(c, 0, 0, fs, { rim: '#f9a8d4', alpha: 1 - sq }); c.restore(); }
    const u = seg(t, 1.6, 2.3);
    if (u > 0) { const hop = t > 2.6 ? Math.abs(Math.sin((t - 2.6) * 4.2)) * 20 * fs * (1 - seg(t, 2.6, 4.4)) : 0; sheep(c, cx, gy - hop, fs * 1.45 * smooth(u) * (1 + 0.18 * Math.sin(u * Math.PI)), { hood: true }); }
    const b = seg(t, 3.0, 3.4);
    if (b > 0) { const bx = cx + 52 * fs, by = gy - 120 * fs, w = 62 * fs, h = 30 * fs; c.globalAlpha = b; c.fillStyle = '#fff'; c.beginPath(); c.roundRect(bx - w / 2, by - h / 2, w, h, 12 * fs); c.fill(); c.beginPath(); c.moveTo(bx - 14 * fs, by + h / 2 - 1); c.lineTo(bx - 24 * fs, by + h / 2 + 14 * fs); c.lineTo(bx - 2 * fs, by + h / 2 - 1); c.fill(); c.fillStyle = '#7e22ce'; c.font = `bold ${17 * fs}px sans-serif`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText('Baa?', bx, by); c.globalAlpha = 1; }
  },
};

// 111 — Polymorph cast on self; sheep only if the save fails — so the outcome is left suspended.
const poly111 = {
  concept: 'A polymorph rune circle spins; a wavering vertical seam sweeps across the caster, one side sheep and the other caster, as a shield-ring pushes back. It is left undecided — caster solid, sheep a hovering ghost — because the form depends on a saving throw.',
  duration: 5.4,
  init() { return null; },
  draw(c, W, H, t) {
    const { fs, gy, cx, unit } = layout(W, H);
    bg(c, W, H, gy, '#0f0a1e', '#1d1238', 'rgba(244,114,182,0.3)');
    const ra = seg(t, 0.1, 0.8);
    c.save(); c.translate(cx, gy + 6); c.scale(1, 0.22); c.strokeStyle = `rgba(244,114,182,${0.8 * ra})`; c.lineWidth = 3; c.beginPath(); c.arc(0, 0, unit * 0.2, 0, TAU); c.stroke(); c.beginPath(); c.arc(0, 0, unit * 0.14, 0, TAU); c.stroke(); for (let i = 0; i < 10; i++) { const a = i / 10 * TAU - t; c.beginPath(); c.moveTo(Math.cos(a) * unit * 0.14, Math.sin(a) * unit * 0.14); c.lineTo(Math.cos(a) * unit * 0.2, Math.sin(a) * unit * 0.2); c.stroke(); } c.restore();
    const act = seg(t, 0.9, 1.4), settle = seg(t, 3.6, 4.6), seam = cx + Math.sin(t * 2.4) * 34 * fs * act * (1 - settle) - 90 * fs * settle;
    // sheep ghost under, caster over — split by the seam
    const ghost = act * (0.85 * (1 - settle) + 0.22 * settle);
    sheep(c, cx, gy, fs * 1.4, { alpha: ghost * 0.9 });
    c.save(); c.beginPath(); c.rect(seam, 0, W, H); c.rect(0, 0, 0, 0); c.clip(); c.restore();
    c.save(); c.beginPath(); c.rect(0, 0, seam, H); c.clip(); figure(c, cx, gy, fs, { rim: '#f9a8d4' }); c.restore();
    c.save(); c.beginPath(); c.rect(seam, 0, W, H); c.clip(); figure(c, cx, gy, fs, { rim: '#f9a8d4', alpha: 1 - 0.75 * act * (1 - settle) }); c.restore();
    c.globalCompositeOperation = 'lighter';
    c.strokeStyle = `rgba(255,220,240,${0.8 * act * (1 - settle)})`; c.lineWidth = 2; c.beginPath(); c.moveTo(seam, gy - 150 * fs); c.lineTo(seam, gy); c.stroke();
    const sh = Math.sin(seg(t, 1.6, 4.0) * Math.PI);
    c.strokeStyle = `rgba(125,211,252,${0.7 * sh})`; c.lineWidth = 3; c.beginPath(); c.ellipse(cx, gy - 66 * fs, 62 * fs, 84 * fs, 0, 0, TAU); c.stroke(); glow(c, cx, gy - 66 * fs, 90 * fs, '125,211,252', 0.12 * sh);
    c.globalCompositeOperation = 'source-over';
  },
};

// 104 — turned into a potted plant until the start of the next turn.
const plant104 = {
  concept: 'Vines coil up the caster, who squashes down as roots take the feet; a terracotta pot rises around the stump, leaves unfurl from it and a pink flower opens — a calm, helpless houseplant.',
  duration: 5.6,
  init(W, H, r) { return Array.from({ length: 5 }, (_, i) => ({ ph: r() * TAU, y: i / 5 })); },
  draw(c, W, H, t, S) {
    const { fs, gy, cx } = layout(W, H);
    bg(c, W, H, gy, '#06120a', '#0f2a18', 'rgba(74,222,128,0.3)');
    const sh = smooth(seg(t, 1.2, 2.4)), vn = seg(t, 0.3, 1.4);
    c.save(); c.translate(cx, gy); c.scale(1 + 0.2 * sh, 1 - 0.72 * sh); figure(c, 0, 0, fs, { rim: '#86efac', alpha: 1 - smooth(seg(t, 1.9, 2.5)) }); c.restore();
    c.strokeStyle = `rgba(74,222,128,${0.9 * (1 - seg(t, 2.0, 2.6))})`; c.lineWidth = 3; c.lineCap = 'round';
    for (const v of S) { c.beginPath(); for (let i = 0; i <= 24; i++) { const q = (i / 24) * vn, y = gy - q * 120 * fs * (1 - 0.7 * sh), x = cx + Math.sin(q * 14 + v.ph) * 26 * fs * (1 - 0.3 * sh); i ? c.lineTo(x, y) : c.moveTo(x, y); } c.stroke(); }
    const pu = smooth(seg(t, 1.8, 2.6)); pot(c, cx, gy + (1 - pu) * 30 * fs, fs * 1.5, easeOut(seg(t, 2.5, 4.3)), pu);
    c.globalCompositeOperation = 'lighter'; for (let i = 0; i < 14; i++) { const q = seg(t, 2.4 + i * 0.05, 4.2 + i * 0.05); if (q > 0 && q < 1) glow(c, cx + Math.sin(i * 7) * 40 * fs, gy - q * 90 * fs, 6, '134,239,172', 0.6 * Math.sin(q * Math.PI)); } c.globalCompositeOperation = 'source-over';
  },
};

// 87 — petrified.
const stone87 = {
  concept: 'Grey stone creeps up the caster from the feet along a jagged, glowing edge, spreading grain and hairline cracks until a motionless statue stands on a plinth in settling dust.',
  duration: 5.4,
  init(W, H, r) { return { sp: figurePoints(140, r).map((p) => ({ ...p, g: r() })), jag: Array.from({ length: 24 }, () => r()) }; },
  draw(c, W, H, t, S) {
    const { fs, gy, cx, unit } = layout(W, H);
    bg(c, W, H, gy, '#0a0b10', '#14161e', 'rgba(148,163,184,0.3)');
    const p = easeOut(seg(t, 0.6, 3.6)), thr = gy - p * 140 * fs, edge = (x) => thr + (S.jag[Math.abs(Math.round((x - cx) / 4)) % 24] - 0.5) * 12 * fs;
    figure(c, cx, gy, fs, { rim: '#cbd5e1' });
    c.save(); c.beginPath(); c.moveTo(0, H); c.lineTo(0, thr); for (let x = 0; x <= W; x += 6) c.lineTo(x, edge(x)); c.lineTo(W, H); c.closePath(); c.clip();
    figure(c, cx, gy, fs, { fill: '#5b6270', rim: '#e2e8f0', rimWidth: 3 });
    for (const s of S.sp) { c.fillStyle = s.g < 0.5 ? 'rgba(226,232,240,0.28)' : 'rgba(30,34,44,0.5)'; c.fillRect(cx + s.x * fs, gy + s.y * fs, 2.5 * fs + 1, 2.5 * fs + 1); }
    c.strokeStyle = 'rgba(15,17,24,0.8)'; c.lineWidth = 1.5; for (const [x1, y1, x2, y2] of [[-8, -80, 4, -60], [4, -60, -3, -42], [10, -30, 2, -14], [-4, -112, 3, -100]]) { c.beginPath(); c.moveTo(cx + x1 * fs, gy + y1 * fs); c.lineTo(cx + x2 * fs, gy + y2 * fs); c.stroke(); }
    c.restore();
    if (p < 0.995) { c.globalCompositeOperation = 'lighter'; c.strokeStyle = 'rgba(203,213,225,0.55)'; c.lineWidth = 2; c.beginPath(); c.moveTo(cx - 50 * fs, thr); for (let x = cx - 50 * fs; x <= cx + 50 * fs; x += 6) c.lineTo(x, edge(x)); c.stroke(); glow(c, cx, thr, 70 * fs, '203,213,225', 0.2); c.globalCompositeOperation = 'source-over'; }
    const pl = seg(t, 2.8, 3.8); c.fillStyle = `rgba(90,96,112,${pl})`; c.fillRect(cx - 40 * fs, gy, 80 * fs, 10 * fs * pl);
    for (let i = 0; i < 18; i++) { const q = seg(t, 2.0 + i * 0.1, 4.6 + i * 0.1); if (q > 0 && q < 1) { c.fillStyle = `rgba(160,170,185,${0.5 * Math.sin(q * Math.PI)})`; c.fillRect(cx + Math.sin(i * 5) * 50 * fs, gy - 80 * fs * p + q * 60 * fs, 3, 3); } }
    void unit;
  },
};

// 66 — age 1d10 years.
const age66 = {
  concept: 'A clock-face above the caster spins forward as calendar leaves drift down; the cloak greys, the back bows, a long white beard grows and a cane appears, ending as the clock slows to a stop.',
  duration: 5.6,
  init(W, H, r) { return Array.from({ length: 22 }, () => ({ x: r(), d: r() * 2.5, v: 0.5 + r(), s: 5 + r() * 6, ph: r() * TAU })); },
  draw(c, W, H, t, S) {
    const { fs, gy, cx, unit } = layout(W, H), a = smooth(seg(t, 0.6, 4.0));
    bg(c, W, H, gy, '#140f05', '#2a1d08', 'rgba(251,191,36,0.3)');
    // clock
    const ck = { x: cx, y: H * 0.2, r: unit * 0.1 }, spin = (1 - Math.pow(1 - seg(t, 0.3, 4.8), 3)) * TAU * 6;
    c.strokeStyle = `rgba(253,224,71,${0.8 * seg(t, 0, 0.5)})`; c.lineWidth = 3; c.beginPath(); c.arc(ck.x, ck.y, ck.r, 0, TAU); c.stroke();
    for (let i = 0; i < 12; i++) { const an = i / 12 * TAU; c.beginPath(); c.moveTo(ck.x + Math.cos(an) * ck.r * 0.86, ck.y + Math.sin(an) * ck.r * 0.86); c.lineTo(ck.x + Math.cos(an) * ck.r * 0.96, ck.y + Math.sin(an) * ck.r * 0.96); c.stroke(); }
    c.lineWidth = 3; c.beginPath(); c.moveTo(ck.x, ck.y); c.lineTo(ck.x + Math.cos(spin - Math.PI / 2) * ck.r * 0.8, ck.y + Math.sin(spin - Math.PI / 2) * ck.r * 0.8); c.stroke();
    c.beginPath(); c.moveTo(ck.x, ck.y); c.lineTo(ck.x + Math.cos(spin / 12 - Math.PI / 2) * ck.r * 0.5, ck.y + Math.sin(spin / 12 - Math.PI / 2) * ck.r * 0.5); c.stroke();
    // falling leaves
    for (const l of S) { const q = seg(t, l.d, l.d + 3.2); if (q > 0 && q < 1) { c.save(); c.translate(l.x * W + Math.sin(q * 6 + l.ph) * 20, H * 0.1 + q * l.v * gy * 0.9); c.rotate(q * 7 + l.ph); c.fillStyle = `rgba(${q < 0.5 ? '251,191,36' : '161,98,7'},${0.8 * Math.sin(q * Math.PI)})`; c.beginPath(); c.ellipse(0, 0, l.s, l.s * 0.5, 0, 0, TAU); c.fill(); c.restore(); } }
    // aging figure: bows, greys
    const grey = Math.round(lerp(251, 203, a)), rim = `rgb(${grey},${Math.round(lerp(191, 213, a))},${Math.round(lerp(36, 225, a))})`;
    c.save(); c.translate(cx, gy); c.transform(1, 0, -0.32 * a, 1 - 0.1 * a, 0, 0); figure(c, 0, 0, fs, { rim }); 
    c.fillStyle = `rgba(241,245,249,${0.95 * a})`; c.beginPath(); c.moveTo(-9 * fs, -100 * fs); c.quadraticCurveTo(0, -82 * fs - 40 * fs * a, 9 * fs, -100 * fs); c.quadraticCurveTo(0, -94 * fs, -9 * fs, -100 * fs); c.fill();
    c.strokeStyle = `rgba(180,140,80,${a})`; c.lineWidth = 3 * fs; c.lineCap = 'round'; c.beginPath(); c.moveTo(34 * fs, -52 * fs); c.lineTo(36 * fs, 0); c.stroke(); c.beginPath(); c.arc(31 * fs, -52 * fs, 4 * fs, 0, Math.PI, true); c.stroke();
    c.restore();
  },
};

// 94 — de-aged 2d10 years: the reverse, soft and bright.
const deage94 = {
  concept: 'The clock hand runs backwards and calendar pages float up out of the scene; the caster shrinks, the head grows proportionally large and rounded, and the rim warms from silver-grey to bright gold in a rain of rising sparkles.',
  duration: 5.6,
  init(W, H, r) { return Array.from({ length: 22 }, () => ({ x: r(), d: r() * 2.5, v: 0.5 + r(), s: 5 + r() * 6, ph: r() * TAU })); },
  draw(c, W, H, t, S) {
    const { fs, gy, cx, unit } = layout(W, H), a = smooth(seg(t, 0.6, 4.0));
    bg(c, W, H, gy, '#10122a', '#24244a', 'rgba(253,230,138,0.35)');
    const ck = { x: cx, y: H * 0.2, r: unit * 0.1 }, spin = -(1 - Math.pow(1 - seg(t, 0.3, 4.8), 3)) * TAU * 6;
    c.strokeStyle = `rgba(253,230,138,${0.8 * seg(t, 0, 0.5)})`; c.lineWidth = 3; c.beginPath(); c.arc(ck.x, ck.y, ck.r, 0, TAU); c.stroke();
    c.beginPath(); c.moveTo(ck.x, ck.y); c.lineTo(ck.x + Math.cos(spin - Math.PI / 2) * ck.r * 0.8, ck.y + Math.sin(spin - Math.PI / 2) * ck.r * 0.8); c.stroke();
    for (const l of S) { const q = seg(t, l.d, l.d + 3.2); if (q > 0 && q < 1) { c.save(); c.translate(l.x * W + Math.sin(q * 6 + l.ph) * 20, gy - q * l.v * gy * 0.9); c.rotate(-q * 7 + l.ph); c.fillStyle = `rgba(253,230,138,${0.8 * Math.sin(q * Math.PI)})`; c.beginPath(); c.ellipse(0, 0, l.s, l.s * 0.5, 0, 0, TAU); c.fill(); c.restore(); } }
    const k = lerp(1, 0.56, a);
    figure(c, cx, gy, fs * k, { rim: `rgb(${Math.round(lerp(203, 253, a))},${Math.round(lerp(213, 224, a))},${Math.round(lerp(225, 120, a))})` });
    c.fillStyle = '#0a0a16'; c.strokeStyle = '#fde68a'; c.lineWidth = 2; c.beginPath(); c.arc(cx, gy - 100 * fs * k - 8 * fs * a, 17 * fs * (1 + 0.45 * a) * k + 4 * a, 0, TAU); c.fill(); c.stroke();
    c.globalCompositeOperation = 'lighter'; for (let i = 0; i < 30; i++) { const q = seg(t, 0.8 + i * 0.1, 3.4 + i * 0.1); if (q > 0 && q < 1) glow(c, cx + Math.sin(i * 12.9) * 50 * fs, gy - q * 150 * fs, 6, '253,230,138', 0.8 * Math.sin(q * Math.PI)); } c.globalCompositeOperation = 'source-over';
  },
};

// 110 — one size category larger.
const enlarge110 = {
  concept: 'Golden rings climb the caster, who swells to nearly double height while the ground buckles and dust rolls out; cottages and a barrel stay put to show the new scale against the cracked floor.',
  duration: 5.0,
  init(W, H, r) { return Array.from({ length: 16 }, () => ({ x: (r() * 2 - 1), v: 0.5 + r(), s: 0.05 + r() * 0.06 })); },
  draw(c, W, H, t, S) {
    const { fs, gy, cx, unit } = layout(W, H), g = easeOut(seg(t, 0.8, 2.6)), k = lerp(1, 2.0, g);
    bg(c, W, H, gy, '#140d05', '#2e1c07', 'rgba(251,191,36,0.35)');
    c.fillStyle = '#0c0805'; c.strokeStyle = 'rgba(180,120,40,0.6)'; c.lineWidth = 2;
    for (const x of [W * 0.1, W * 0.9]) { c.beginPath(); c.rect(x - 26 * fs, gy - 40 * fs, 52 * fs, 40 * fs); c.moveTo(x - 32 * fs, gy - 40 * fs); c.lineTo(x, gy - 66 * fs); c.lineTo(x + 32 * fs, gy - 40 * fs); c.fill(); c.stroke(); }
    c.beginPath(); c.rect(W * 0.26 - 9 * fs, gy - 20 * fs, 18 * fs, 20 * fs); c.fill(); c.stroke();
    c.strokeStyle = `rgba(253,224,71,${0.9 * seg(t, 1.2, 2.0) * (1 - seg(t, 2.8, 3.4))})`; c.lineWidth = 2;
    for (let i = 0; i < 3; i++) { const y = gy - (((t * 1.2 + i / 3) % 1) * 140 * k * fs); c.beginPath(); c.ellipse(cx, y, 40 * k * fs, 8 * k * fs, 0, 0, TAU); c.stroke(); }
    c.strokeStyle = `rgba(15,10,5,${0.9 * g})`; c.lineWidth = 2; for (let i = -4; i <= 4; i++) { c.beginPath(); c.moveTo(cx + i * 6 * fs, gy + 2); c.lineTo(cx + i * 22 * fs * g, gy + 4 + Math.abs(i) * 3); c.stroke(); }
    figure(c, cx, gy, fs * k, { rim: '#fde68a', rimWidth: 2 + g });
    c.globalCompositeOperation = 'lighter'; glow(c, cx, gy - 70 * fs * k, 110 * fs * k, '253,224,71', 0.14 * Math.sin(clamp((t - 0.6) / 3) * Math.PI)); c.globalCompositeOperation = 'source-over';
    for (const d of S) { const q = seg(t, 1.0, 4.4); if (q > 0) { const x = cx + d.x * unit * 0.5, y = gy - q * d.v * 30 * fs, r = d.s * unit * (0.5 + q); const gr = c.createRadialGradient(x, y, 0, x, y, r); gr.addColorStop(0, `rgba(170,130,80,${0.22 * Math.sin(q * Math.PI)})`); gr.addColorStop(1, 'rgba(170,130,80,0)'); c.fillStyle = gr; c.fillRect(x - r, y - r, r * 2, r * 2); } }
  },
};

// 30 — grow 1d6 inches: a measured stretch with overshoot, then a return after the duration.
const grow30 = {
  concept: 'A tape-measure strip with six inch marks stands beside the caster; the figure stretches with an anticipatory squat and a small overshoot, a cyan bracket highlights the gained height inside the 1–6 inch band, and a late ripple shows it relaxing back.',
  duration: 5.0,
  init() { return null; },
  draw(c, W, H, t) {
    const { fs, gy, cx, unit } = layout(W, H), base = 127 * fs, gain = 24 * fs;
    bg(c, W, H, gy, '#06121a', '#0b2230', 'rgba(34,211,238,0.3)');
    const sq = Math.sin(seg(t, 0.4, 0.9) * Math.PI) * 0.05, up = seg(t, 0.9, 1.8), over = easeOut(up) + Math.sin(up * Math.PI) * 0.12, back = smooth(seg(t, 3.9, 4.7));
    const h = gain * over * (1 - back), scaleY = (base + h) / base * (1 - sq);
    // ruler
    const rx = cx + 70 * fs;
    c.strokeStyle = 'rgba(165,243,252,0.6)'; c.lineWidth = 2; c.beginPath(); c.moveTo(rx, gy); c.lineTo(rx, gy - base - 36 * fs); c.stroke();
    for (let i = 0; i <= 14; i++) { const y = gy - base + (i - 4) * 5 * fs; if (y > gy) continue; c.beginPath(); c.moveTo(rx, y); c.lineTo(rx - (i % 5 === 0 ? 14 : 8) * fs, y); c.stroke(); }
    c.fillStyle = `rgba(34,211,238,${0.16 * seg(t, 0.8, 1.4)})`; c.fillRect(rx - 24 * fs, gy - base - 6 * 5 * fs, 24 * fs, 6 * 5 * fs);
    c.setLineDash([4, 6]); c.strokeStyle = 'rgba(165,243,252,0.5)'; c.beginPath(); c.moveTo(cx - 60 * fs, gy - base); c.lineTo(rx, gy - base); c.stroke(); c.setLineDash([]);
    c.save(); c.translate(cx, gy); c.scale(1 - (scaleY - 1) * 0.3, scaleY); figure(c, 0, 0, fs, { rim: '#67e8f9' }); c.restore();
    const g = h / gain; if (g > 0.02) { c.strokeStyle = `rgba(103,232,249,${Math.min(1, g)})`; c.lineWidth = 3; c.beginPath(); c.moveTo(rx - 4 * fs, gy - base); c.lineTo(rx - 4 * fs, gy - base - h); c.stroke(); c.beginPath(); c.moveTo(rx - 9 * fs, gy - base - h); c.lineTo(rx + 1 * fs, gy - base - h); c.stroke(); }
    void unit;
  },
};

// 54 — shrink 1d6 inches: the world's size looms; foreground blades of grass and a coin show the scale.
const shrink54 = {
  concept: 'Inward-pointing chevrons press on the caster, who dips smaller beside a dropped coin and tall grass blades that suddenly look huge; a light inward ripple marks the squeeze, and the figure relaxes back near the end.',
  duration: 5.0,
  init(W, H, r) { return Array.from({ length: 26 }, () => ({ x: r(), h: 0.3 + r() * 0.8, sway: r() * TAU })); },
  draw(c, W, H, t, S) {
    const { fs, gy, cx, unit } = layout(W, H), base = 127 * fs, sh = 26 * fs, a = easeOut(seg(t, 0.9, 1.9)) * (1 - smooth(seg(t, 3.9, 4.7)));
    bg(c, W, H, gy, '#071410', '#0e2a20', 'rgba(52,211,153,0.3)');
    c.save(); c.translate(cx, gy); c.scale(1 - 0.06 * a, (base - sh * a) / base); figure(c, 0, 0, fs, { rim: '#6ee7b7' }); c.restore();
    // coin and grass at fixed size
    c.fillStyle = '#fbbf24'; c.strokeStyle = '#fde68a'; c.lineWidth = 2; c.beginPath(); c.ellipse(cx - 70 * fs, gy + 8 * fs, 22 * fs, 6 * fs, 0, 0, TAU); c.fill(); c.stroke();
    c.strokeStyle = 'rgba(110,231,183,0.7)'; c.lineWidth = 3; c.lineCap = 'round';
    for (const b of S) { const x = b.x * W; if (Math.abs(x - cx) < 52 * fs) continue; const hh = b.h * 120 * fs + 20 * fs * a * b.h; c.beginPath(); c.moveTo(x, gy + 4); c.quadraticCurveTo(x + Math.sin(t * 1.5 + b.sway) * 10 * fs, gy - hh / 2, x + 14 * fs * Math.sin(b.sway), gy - hh); c.stroke(); }
    c.globalCompositeOperation = 'lighter'; c.strokeStyle = `rgba(167,243,208,${0.6 * Math.sin(seg(t, 0.7, 2.0) * Math.PI)})`; c.lineWidth = 2;
    for (let i = 0; i < 6; i++) { const q = (seg(t, 0.7, 2.0) * 1 + i / 6) % 1, d = (1 - q) * 80 * fs + 28 * fs, y = gy - 62 * fs; for (const sd of [-1, 1]) { c.beginPath(); c.moveTo(cx + sd * (d + 10 * fs), y - 10 * fs); c.lineTo(cx + sd * d, y); c.lineTo(cx + sd * (d + 10 * fs), y + 10 * fs); c.stroke(); } }
    c.globalCompositeOperation = 'source-over'; void unit;
  },
};

export const POLYMORPH_SCENES = { 62: sheep62, 111: poly111, 104: plant104, 87: stone87, 66: age66, 94: deage94, 110: enlarge110, 30: grow30, 54: shrink54 };
