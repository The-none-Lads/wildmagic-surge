// Healing family: 29, 42, 48, 56, 77. Each has its own subject, motion and ending.
import { TAU, clamp, lerp, smooth, easeOut, easeIn, seg, layout, sky, ground, glow, figure } from './toolkit.js';

const G = '134,239,172';
function wounds(c, x, y, s, a) {
  if (a <= 0) return;
  c.save(); c.translate(x, y); c.scale(s, s);
  c.strokeStyle = `rgba(248,113,113,${a})`; c.lineWidth = 2 / s; c.lineJoin = 'round';
  c.beginPath(); c.moveTo(-10, -72); c.lineTo(-2, -63); c.lineTo(-9, -51); c.moveTo(9, -42); c.lineTo(1, -33); c.lineTo(7, -22); c.stroke();
  c.restore();
}
function plus(c, x, y, r, rgb, a) {
  c.fillStyle = `rgba(${rgb},${a})`;
  c.fillRect(x - r * 0.28, y - r, r * 0.56, r * 2); c.fillRect(x - r, y - r * 0.28, r * 2, r * 0.56);
}
const bg = (c, W, H, gy) => { sky(c, W, H, '#04120c', '#0a2418'); ground(c, W, H, gy, '#06100b', 'rgba(134,239,172,0.3)'); };

// 29 — regain 1d4 HP: exactly four motes (the d4) rise from the ground, spiral in, and close the wounds.
const heal29 = {
  concept: 'Four small motes (one per die face) spiral up from the floor, sink into the caster\'s chest with tiny flashes, red wound-lines knit closed, and a single plus-sign drifts up.',
  duration: 4.2,
  init(W, H, r) { return Array.from({ length: 4 }, (_, i) => ({ ph: (i / 4) * TAU + r() * 0.4, d: i * 0.16 })); },
  draw(c, W, H, t, S) {
    const { fs, gy, cx, unit } = layout(W, H), cy = gy - 66 * fs;
    bg(c, W, H, gy);
    figure(c, cx, gy, fs, { rim: '#86efac' });
    wounds(c, cx, gy, fs, 0.9 * (1 - smooth(seg(t, 1.9, 3.0))));
    c.globalCompositeOperation = 'lighter';
    for (const m of S) {
      const rise = easeOut(seg(t, 0.1 + m.d, 1.3 + m.d)), absorb = easeIn(seg(t, 1.4 + m.d, 2.1 + m.d));
      const rad = unit * 0.17 * (1 - absorb), ang = m.ph + t * 3.2;
      const x = cx + Math.cos(ang) * rad, y = lerp(gy - 4, cy, rise) + Math.sin(ang) * rad * 0.35;
      if (absorb < 1) glow(c, x, y, 16 + 10 * (1 - absorb), G, 0.85);
      const f = seg(t, 2.1 + m.d, 2.5 + m.d);
      if (f > 0 && f < 1) { c.strokeStyle = `rgba(${G},${0.8 * (1 - f)})`; c.lineWidth = 2; c.beginPath(); c.arc(cx, cy, 10 + f * 40 * fs, 0, TAU); c.stroke(); }
    }
    glow(c, cx, cy, 70 * fs, G, 0.35 * Math.sin(clamp((t - 1.5) / 2) * Math.PI));
    const p = seg(t, 2.4, 4.0);
    if (p > 0) plus(c, cx, gy - 150 * fs - p * 50 * fs, 9 * fs, G, 0.9 * (1 - p));
    c.globalCompositeOperation = 'source-over';
  },
};

// 42 — a random creature within 30 ft is healed: a reticle hunts between two wounded creatures, an orb arcs across.
const heal42 = {
  concept: 'The caster stands beside two wounded creatures; a reticle hesitantly flickers between them, locks on one (rolled fresh each play), a healing orb arcs across and bursts as that creature\'s wounds close.',
  duration: 5.4,
  init(W, H, r) { return { target: Math.random() < 0.5 ? 0 : 1, sp: Array.from({ length: 14 }, () => ({ a: r() * TAU, v: 0.5 + r() })) }; },
  draw(c, W, H, t, S) {
    const { fs, gy, unit } = layout(W, H), xs = [W * 0.2, W * 0.56, W * 0.82], sc = [1, 0.92, 1.06];
    bg(c, W, H, gy);
    const tgt = 1 + S.target, lock = seg(t, 2.0, 2.3), arrive = seg(t, 2.0, 3.0), heal = seg(t, 3.0, 4.3);
    xs.forEach((x, i) => figure(c, x, gy, fs * sc[i], { rim: i === 0 ? '#86efac' : '#9ca3af', alpha: i && i !== tgt && t > 2.2 ? 0.55 : 1 }));
    [1, 2].forEach((i) => wounds(c, xs[i], gy, fs * sc[i], 0.9 * (i === tgt ? 1 - smooth(heal) : 1)));
    c.globalCompositeOperation = 'lighter';
    // reticle: wavers between the two candidates (≤ ~2 hops/sec), then locks
    if (t > 0.5 && t < 3.4) {
      const hop = Math.floor((t - 0.5) * 2.2), idx = t >= 2.0 ? tgt : 1 + (hop % 2), x = xs[idx], y = gy - 66 * fs * sc[idx], rr = (30 + 26 * (1 - lock)) * fs;
      c.strokeStyle = `rgba(${G},${0.8 * (1 - seg(t, 3.0, 3.4))})`; c.lineWidth = 2;
      c.beginPath(); c.arc(x, y, rr, 0, TAU); c.stroke();
      for (let k = 0; k < 4; k++) { const a = k * TAU / 4 + t * 1.5; c.beginPath(); c.moveTo(x + Math.cos(a) * rr * 0.8, y + Math.sin(a) * rr * 0.8); c.lineTo(x + Math.cos(a) * rr * 1.25, y + Math.sin(a) * rr * 1.25); c.stroke(); }
    }
    // orb
    const a0 = { x: xs[0] + 20 * fs, y: gy - 78 * fs }, a1 = { x: xs[tgt], y: gy - 70 * fs * sc[tgt] };
    if (arrive > 0 && arrive < 1) {
      for (let k = 0; k < 10; k++) { const u = clamp(easeOut(arrive) - k * 0.03); const x = lerp(a0.x, a1.x, u), y = lerp(a0.y, a1.y, u) - Math.sin(u * Math.PI) * unit * 0.25; glow(c, x, y, (18 - k) * fs, G, 0.7 * (1 - k / 10)); }
    } else if (t < 2.0) glow(c, a0.x, a0.y, 14 * fs * seg(t, 1.2, 2.0), G, 0.8 * seg(t, 1.2, 2.0));
    const b = seg(t, 3.0, 4.2);
    if (b > 0 && b < 1) {
      glow(c, a1.x, a1.y, 90 * fs * (1 - b * 0.5), G, 0.6 * (1 - b));
      for (const s of S.sp) { const d = easeOut(b) * 70 * fs * s.v; glow(c, a1.x + Math.cos(s.a) * d, a1.y + Math.sin(s.a) * d - b * 20 * fs, 6, '220,252,231', 0.8 * (1 - b)); }
      c.strokeStyle = `rgba(${G},${0.7 * (1 - b)})`; c.lineWidth = 3; c.beginPath(); c.arc(a1.x, a1.y, easeOut(b) * 90 * fs, 0, TAU); c.stroke();
    }
    c.globalCompositeOperation = 'source-over';
  },
};

// 48 — temporary hit points: a hexagonal plate-shell assembles around the caster from the ground upward.
const heal48 = {
  concept: 'Golden-green hexagonal plates snap in from the ground upward until they form a faintly pulsing protective shell, then a glint sweeps across it — a buffer, not a cure.',
  duration: 4.8,
  init(W, H) {
    const { fs } = layout(W, H), size = 15 * fs, tiles = [], rx = 50 * fs, ry = 86 * fs;
    for (let row = -7; row <= 7; row++) for (let col = -5; col <= 5; col++) {
      const x = col * size * 1.75 + (row & 1 ? size * 0.875 : 0), y = row * size * 1.52, n = (x / rx) ** 2 + (y / ry) ** 2;
      if (n <= 1) tiles.push({ x, y, n, delay: (1 - (y / ry + 1) / 2) * 1.4 + n * 0.25 });
    }
    return { tiles, size };
  },
  draw(c, W, H, t, S) {
    const { fs, gy, cx } = layout(W, H), cy = gy - 62 * fs, pulse = 0.85 + 0.15 * Math.sin(t * 3);
    bg(c, W, H, gy);
    // ground ring rising into the shell
    c.save(); c.translate(cx, gy + 4); c.scale(1, 0.2); c.strokeStyle = `rgba(190,242,100,${0.7 * seg(t, 0, 0.6)})`; c.lineWidth = 3; c.beginPath(); c.arc(0, 0, 62 * fs, 0, TAU); c.stroke(); c.restore();
    figure(c, cx, gy, fs, { rim: '#bef264' });
    c.globalCompositeOperation = 'lighter';
    for (const h of S.tiles) {
      const u = easeOut(seg(t, 0.3 + h.delay, 0.8 + h.delay)); if (u <= 0) continue;
      const k = lerp(2.2, 0.9, u), a = u * pulse;
      const sweep = Math.max(0, 1 - Math.abs((h.x + h.y) / (60 * fs) - (seg(t, 3.4, 4.4) * 4 - 2)) * 2.2) * seg(t, 3.4, 3.5);
      c.beginPath();
      for (let i = 0; i < 6; i++) { const ang = TAU / 6 * i + TAU / 12; const px = cx + h.x + Math.cos(ang) * S.size * k, py = cy + h.y + Math.sin(ang) * S.size * k; i ? c.lineTo(px, py) : c.moveTo(px, py); }
      c.closePath(); c.fillStyle = `rgba(190,242,100,${0.1 * a + 0.5 * sweep})`; c.fill(); c.strokeStyle = `rgba(217,249,157,${0.65 * a + 0.3 * sweep})`; c.lineWidth = 1.5; c.stroke();
    }
    glow(c, cx, cy, 100 * fs, '190,242,100', 0.18 * seg(t, 1.5, 3));
    c.globalCompositeOperation = 'source-over';
  },
};

// 56 — burst heals 2d4 but shoves the caster 5 ft in a random direction.
const heal56 = {
  concept: 'Wild green-gold energy churns, bursts outward in a ring, and slams the caster sideways (direction rolled each play) leaving fading after-images and a skid of dust while wounds close and motes rise.',
  duration: 4.4,
  init(W, H, r) { return { dir: Math.random() < 0.5 ? -1 : 1, sp: Array.from({ length: 36 }, () => ({ a: r() * TAU, v: 0.4 + r(), hue: r() < 0.3 ? '244,114,182' : r() < 0.6 ? '253,224,71' : G })), dust: Array.from({ length: 10 }, () => ({ o: r(), s: 0.03 + r() * 0.05 })) }; },
  draw(c, W, H, t, S) {
    const { fs, gy, cx, unit } = layout(W, H), cy = gy - 62 * fs, shove = easeOut(seg(t, 0.75, 1.5)), fx = cx - S.dir * unit * 0.14 + S.dir * unit * 0.34 * shove;
    bg(c, W, H, gy);
    c.globalCompositeOperation = 'lighter';
    const ch = seg(t, 0, 0.75);
    for (let i = 0; i < 12; i++) { const a = i / 12 * TAU + t * (6 + i % 3), d = (1 - ch) * unit * 0.2 + 24 * fs; glow(c, cx - S.dir * unit * 0.14 + Math.cos(a) * d, cy + Math.sin(a) * d * 0.8, 10 + 8 * ch, S.sp[i].hue, 0.55 * Math.sin(Math.min(1, ch * 1.3) * Math.PI / 2) * (1 - seg(t, 0.75, 0.9))); }
    const b = seg(t, 0.75, 1.9);
    if (b > 0 && b < 1) { c.strokeStyle = `rgba(${G},${0.8 * (1 - b)})`; c.lineWidth = 6 * (1 - b) + 1; c.beginPath(); c.arc(cx - S.dir * unit * 0.14, cy, easeOut(b) * unit * 0.4, 0, TAU); c.stroke(); glow(c, cx - S.dir * unit * 0.14, cy, unit * 0.3 * (1 - b), '220,252,231', 0.5 * (1 - b)); }
    c.globalCompositeOperation = 'source-over';
    // skid dust trails behind the slide
    for (const d of S.dust) { const x = lerp(cx - S.dir * unit * 0.14, fx, d.o), q = seg(t, 0.8 + d.o * 0.4, 2.6); if (q > 0) { const rad = d.s * unit * (0.6 + q); const g = c.createRadialGradient(x, gy - 4, 0, x, gy - 4 - q * 18, rad); g.addColorStop(0, `rgba(190,220,200,${0.25 * Math.sin(q * Math.PI)})`); g.addColorStop(1, 'rgba(190,220,200,0)'); c.fillStyle = g; c.fillRect(x - rad, gy - rad - 20, rad * 2, rad * 2); } }
    // after-images then the caster
    for (let i = 4; i >= 1; i--) { const u = clamp(shove - i * 0.12); figure(c, cx - S.dir * unit * 0.14 + S.dir * unit * 0.34 * u, gy, fs, { rim: '#86efac', alpha: 0.18 * (1 - seg(t, 1.2, 2.2)) * (u > 0 && u < shove ? 1 : 0) }); }
    figure(c, fx, gy, fs, { rim: '#bbf7d0' });
    wounds(c, fx, gy, fs, 0.9 * (1 - smooth(seg(t, 1.0, 2.2))));
    c.globalCompositeOperation = 'lighter';
    for (const s of S.sp) { const q = seg(t, 1.0, 3.6); if (q > 0 && q < 1) glow(c, fx + Math.cos(s.a) * 40 * fs * s.v, gy - 20 * fs - q * 120 * fs * s.v, 5, s.hue, 0.8 * Math.sin(q * Math.PI)); }
    c.globalCompositeOperation = 'source-over';
  },
};

// 77 — a healing wave sweeps 30 ft outward over several wounded creatures.
const heal77 = {
  concept: 'Concentric green swells roll outward across the ground; each of five wounded silhouettes lights up and its wounds close at the instant the wave front passes, while petals lift from the swept floor.',
  duration: 5.2,
  init(W, H, r) { return Array.from({ length: 70 }, () => ({ x: (r() * 2 - 1), d: r(), v: 0.5 + r(), s: 3 + r() * 5 })); },
  draw(c, W, H, t, S) {
    const { fs, gy, cx } = layout(W, H), front = easeOut(seg(t, 0.7, 3.4)) * W * 0.58, offs = [-0.38, -0.2, 0, 0.2, 0.38], sc = [0.95, 1.05, 1, 0.9, 1.02];
    bg(c, W, H, gy);
    const health = offs.map((o) => smooth(clamp((front - Math.abs(o * W)) / (W * 0.1))));
    c.globalCompositeOperation = 'lighter';
    for (let k = 0; k < 3; k++) {
      const rr = front - k * W * 0.07; if (rr <= 0) continue;
      c.strokeStyle = `rgba(${G},${(0.7 - k * 0.2) * (1 - seg(t, 3.6, 4.8))})`; c.lineWidth = 5 - k;
      c.beginPath(); c.ellipse(cx, gy + 8, rr, rr * 0.11, 0, 0, TAU); c.stroke();
      c.strokeStyle = `rgba(${G},${(0.18 - k * 0.05) * (1 - seg(t, 3.6, 4.8))})`; c.lineWidth = 14; c.beginPath(); c.ellipse(cx, gy - 6, rr, rr * 0.16, 0, Math.PI, TAU); c.stroke();
    }
    c.globalCompositeOperation = 'source-over';
    offs.forEach((o, i) => { const x = cx + o * W; figure(c, x, gy, fs * sc[i], { rim: health[i] > 0.5 ? '#86efac' : '#9ca3af' }); wounds(c, x, gy, fs * sc[i], 0.9 * (1 - health[i])); });
    c.globalCompositeOperation = 'lighter';
    offs.forEach((o, i) => { if (health[i] > 0 && health[i] < 1) glow(c, cx + o * W, gy - 60 * fs, 80 * fs, G, 0.5 * Math.sin(health[i] * Math.PI)); });
    for (const p of S) { if (Math.abs(p.x) * W * 0.55 > front) continue; const q = seg(t, 1.0 + p.d * 1.5, 4.4 + p.d * 0.6); if (q > 0 && q < 1) { const x = cx + p.x * W * 0.55 + Math.sin(q * 6 + p.d * 9) * 12, y = gy - q * p.v * H * 0.4; c.fillStyle = `rgba(187,247,208,${0.8 * Math.sin(q * Math.PI)})`; c.beginPath(); c.ellipse(x, y, p.s, p.s * 0.5, q * 6, 0, TAU); c.fill(); } }
    c.globalCompositeOperation = 'source-over';
  },
};

export const HEALING_SCENES = { 29: heal29, 42: heal42, 48: heal48, 56: heal56, 77: heal77 };
