// Dedicated, individually composed canvas scenes. Each scene is
//   { concept, duration, init(W,H,rand) -> state, draw(ctx,W,H,t,state) }
// `t` is seconds since the scene started (clamped to `duration`). Scenes never touch the DOM.
import { TAU, clamp, lerp, smooth, easeOut, easeIn, seg, layout, sky, ground, glow, figure, figurePoints, bezier2 } from './toolkit.js';

// ---------------------------------------------------------------- 3: butterflies from the hands
const butterflies = {
  concept: 'Glowing butterflies burst from both hands, flutter outward on looping paths, then dissolve into sparkles at the 6-second mark.',
  duration: 6.6,
  init(W, H, r) {
    const colors = ['163,230,53', '52,211,153', '34,211,238', '250,204,21'];
    return Array.from({ length: 58 }, () => ({
      delay: r() * 1.5, ang: -Math.PI / 2 + (r() - 0.5) * 3.0, speed: 90 + r() * 240,
      ph: r() * TAU, size: 7 + r() * 9, wob: 18 + r() * 40, rgb: colors[Math.floor(r() * colors.length)], hand: r() < 0.5 ? -1 : 1,
    }));
  },
  draw(c, W, H, t, S) {
    const { fs, gy, cx, unit } = layout(W, H);
    sky(c, W, H, '#04140f', '#0b2a1f');
    ground(c, W, H, gy, '#06120d', 'rgba(163,230,53,0.3)');
    const hy = gy - 74 * fs;
    c.globalCompositeOperation = 'lighter';
    const burst = 1 - seg(t, 0, 1.4);
    glow(c, cx - 20 * fs, hy, 80 * fs * (0.5 + burst), '163,230,53', 0.5 * (1 - seg(t, 0, 5)));
    glow(c, cx + 20 * fs, hy, 80 * fs * (0.5 + burst), '52,211,153', 0.5 * (1 - seg(t, 0, 5)));
    c.globalCompositeOperation = 'source-over';
    figure(c, cx, gy, fs, { rim: '#a3e635' });
    const k = unit / 800;
    for (const b of S) {
      const bt = t - b.delay;
      if (bt < 0) continue;
      const d = (b.speed * k * (1 - Math.exp(-bt * 0.7))) / 0.7;
      const x = cx + b.hand * 20 * fs + Math.cos(b.ang) * d + Math.sin(bt * 2.1 + b.ph) * b.wob * k;
      const y = hy + Math.sin(b.ang) * d * 0.85 + Math.cos(bt * 3 + b.ph) * b.wob * 0.5 * k - bt * 8 * k;
      const fade = 1 - seg(t, 5.4, 6.5);
      const flap = Math.abs(Math.sin(bt * 13 + b.ph));
      const sz = b.size * k * (0.5 + 0.5 * Math.min(1, bt * 3));
      c.globalCompositeOperation = 'lighter';
      glow(c, x, y, sz * 3.2, b.rgb, 0.22 * fade);
      if (fade < 1) { // dispersal: wings collapse into a sparkle
        c.fillStyle = `rgba(${b.rgb},${0.9 * fade})`;
        c.fillRect(x - 1, y - 1, 2 + sz * 0.2, 2 + sz * 0.2);
      }
      const heading = Math.atan2(Math.sin(bt * 3 + b.ph) * -0.5 + Math.sin(b.ang), Math.cos(b.ang)) + Math.PI / 2;
      c.save();
      c.translate(x, y);
      c.rotate(heading);
      c.fillStyle = `rgba(${b.rgb},${0.85 * fade})`;
      for (const side of [-1, 1]) {
        c.beginPath();
        c.ellipse(side * sz * 0.55 * (0.25 + flap), -sz * 0.2, sz * 0.7 * (0.2 + flap), sz, side * 0.5, 0, TAU);
        c.fill();
      }
      c.restore();
      c.globalCompositeOperation = 'source-over';
    }
  },
};

// ---------------------------------------------------------------- 14: illusory firework 20 ft overhead
const firework = {
  concept: 'A rocket streaks up from the caster\'s hand and bursts into three layered shells with chromatic "hologram" ghosting and a loud expanding sound ring; nothing below is harmed.',
  duration: 5.2,
  init(W, H, r) {
    const shell = (n, speed, rgb, t0, ring) => Array.from({ length: n }, (_, i) => ({
      a: ring ? (i / n) * TAU : r() * TAU, v: speed * (ring ? 1 : 0.35 + r() * 0.65), rgb, t0, life: 1.6 + r() * 1.0, tw: r() * TAU,
    }));
    return [...shell(110, 330, '251,191,36', 1.15, false), ...shell(64, 230, '244,114,182', 1.4, true), ...shell(46, 150, '34,211,238', 1.7, false)];
  },
  draw(c, W, H, t, S) {
    const { fs, gy, cx, unit } = layout(W, H);
    sky(c, W, H, '#05050f', '#16102e');
    ground(c, W, H, gy);
    const bx = cx, by = H * 0.24, k = unit / 800;
    // rocket
    const ru = easeOut(seg(t, 0.15, 1.15));
    const hand = { x: cx + 14 * fs, y: gy - 78 * fs };
    c.globalCompositeOperation = 'lighter';
    if (t < 1.15) {
      for (let i = 0; i < 14; i++) {
        const u = clamp(ru - i * 0.025);
        const x = lerp(hand.x, bx, u) + Math.sin(u * 9) * 8 * k, y = lerp(hand.y, by, u);
        glow(c, x, y, (10 - i * 0.6) * k, '254,240,138', 0.5 * (1 - i / 14));
      }
    }
    // sound ring (loud, bright — visualised only)
    const sr = seg(t, 1.15, 2.6);
    if (sr > 0 && sr < 1) {
      c.strokeStyle = `rgba(255,255,255,${0.35 * (1 - sr)})`;
      c.lineWidth = 3 * k;
      c.beginPath(); c.arc(bx, by, easeOut(sr) * unit * 0.8, 0, TAU); c.stroke();
    }
    glow(c, bx, by, unit * 0.28 * (1 - seg(t, 1.15, 2.0)), '255,230,150', 0.55 * (1 - seg(t, 1.15, 2.0)));
    // sparks: drawn three times at tiny offsets = chromatic ghosting of an illusion
    const ghosts = [[-2.5, '255,80,80', 0.45], [2.5, '80,200,255', 0.45], [0, null, 1]];
    for (const s of S) {
      const dt = t - s.t0;
      if (dt <= 0 || dt > s.life) continue;
      const pos = (q) => {
        const f = (1 - Math.exp(-1.7 * q)) / 1.7;
        return { x: bx + Math.cos(s.a) * s.v * k * f, y: by + Math.sin(s.a) * s.v * k * f + 0.5 * 160 * k * q * q };
      };
      const p = pos(dt), q = pos(Math.max(0, dt - 0.08));
      const a = (1 - seg(dt, s.life * 0.45, s.life)) * (0.75 + 0.25 * Math.sin(t * 20 + s.tw));
      for (const [off, rgb, m] of ghosts) {
        c.strokeStyle = `rgba(${rgb || s.rgb},${a * m})`;
        c.lineWidth = 2 * k + 0.5;
        c.beginPath(); c.moveTo(q.x + off * k, q.y); c.lineTo(p.x + off * k, p.y); c.stroke();
      }
    }
    c.globalCompositeOperation = 'source-over';
    figure(c, cx, gy, fs, { rim: '#fde68a' });
  },
};

// ---------------------------------------------------------------- 28: fog cloud centred on caster
const fog = {
  concept: 'Billowing fog rolls outward in swirling layers until the caster is a faint silhouette inside a heavily obscured sphere.',
  duration: 5.6,
  init(W, H, r) {
    return Array.from({ length: 96 }, () => ({ a: r() * TAU, d: Math.sqrt(r()), s: 0.16 + r() * 0.22, ph: r() * TAU, spin: (r() - 0.5) * 0.5, lay: r() }));
  },
  draw(c, W, H, t, S) {
    const { fs, gy, cx, unit } = layout(W, H);
    sky(c, W, H, '#0b1220', '#1b2638');
    ground(c, W, H, gy, '#0d1420', 'rgba(203,213,225,0.25)');
    figure(c, cx, gy, fs, { rim: '#cbd5e1' });
    const R = unit * 0.5, cy = gy - 50 * fs, grow = smooth(seg(t, 0.2, 3.4));
    for (const b of S) {
      const ang = b.a + t * b.spin;
      const rr = R * b.d * grow;
      const x = cx + Math.cos(ang) * rr * 1.25 + Math.sin(t * 0.8 + b.ph) * 14;
      const y = cy + Math.sin(ang) * rr * 0.62 + Math.cos(t * 0.6 + b.ph) * 8;
      const rad = b.s * R * (0.4 + 0.6 * grow);
      const g = c.createRadialGradient(x, y, 0, x, y, rad);
      const a = 0.2 * grow * (0.6 + 0.4 * b.lay);
      g.addColorStop(0, `rgba(226,232,240,${a})`);
      g.addColorStop(1, 'rgba(226,232,240,0)');
      c.fillStyle = g;
      c.fillRect(x - rad, y - rad, rad * 2, rad * 2);
    }
    glow(c, cx, cy, R * 0.7, '226,232,240', 0.35 * grow);
  },
};

// ---------------------------------------------------------------- 44: gravity reverses (fall up 10 ft, then back down)
const gravityFlip = {
  concept: 'A rune ring inverts gravity: the caster and loose objects float up and flip toward the ceiling, chevrons stream upward, then everything drops back with a dust-ring landing.',
  duration: 5.4,
  init(W, H, r) {
    return Array.from({ length: 16 }, (_, i) => ({ x: (r() * 2 - 1) * 0.42, kind: i % 4, rise: 0.35 + r() * 0.5, d0: 0.9 + r() * 0.6, d1: 3.0 + r() * 0.5, spin: (r() - 0.5) * 6 }));
  },
  draw(c, W, H, t, S) {
    const { fs, gy, cx, unit } = layout(W, H);
    const up = smooth(seg(t, 0.9, 2.4)), down = easeIn(seg(t, 3.1, 3.95));
    const inv = up * (1 - down);
    sky(c, W, H, `rgb(${Math.round(lerp(6, 28, inv))},${Math.round(lerp(8, 10, inv))},${Math.round(lerp(18, 44, inv))})`, `rgb(${Math.round(lerp(18, 8, inv))},12,${Math.round(lerp(34, 20, inv))})`);
    ground(c, W, H, gy, '#0b0b16', 'rgba(192,132,252,0.35)');
    // ceiling rim when gravity is inverted
    c.fillStyle = `rgba(192,132,252,${0.28 * inv})`; c.fillRect(0, H * 0.08, W, 2);
    // rune ring under the caster
    const ringA = seg(t, 0.1, 0.8) * (1 - seg(t, 3.9, 4.8));
    c.save(); c.translate(cx, gy + 6); c.scale(1, 0.22); c.strokeStyle = `rgba(192,132,252,${0.8 * ringA})`; c.lineWidth = 3;
    c.beginPath(); c.arc(0, 0, unit * 0.22, 0, TAU); c.stroke();
    for (let i = 0; i < 12; i++) { const a = (i / 12) * TAU + t * 0.8; c.beginPath(); c.moveTo(Math.cos(a) * unit * 0.2, Math.sin(a) * unit * 0.2); c.lineTo(Math.cos(a) * unit * 0.25, Math.sin(a) * unit * 0.25); c.stroke(); }
    c.restore();
    // chevrons
    const dir = t < 3.1 ? -1 : 1, chevA = t > 0.8 && t < 4.0 ? 0.22 : 0;
    c.strokeStyle = `rgba(216,180,254,${chevA})`; c.lineWidth = 2;
    for (let i = 0; i < 14; i++) {
      const x = ((i * 0.6180339) % 1) * W, y = ((((i * 0.37) + t * 0.35 * -dir) % 1) + 1) % 1 * H, s = 10 + (i % 3) * 5;
      c.beginPath(); c.moveTo(x - s, y - dir * s * 0.6); c.lineTo(x, y); c.lineTo(x + s, y - dir * s * 0.6); c.stroke();
    }
    // objects
    for (const o of S) {
      const ou = smooth(seg(t, o.d0, o.d0 + 1.5)) * (1 - easeIn(seg(t, o.d1, o.d1 + 0.8)));
      const x = cx + o.x * W, y = gy - o.rise * H * 0.66 * ou - 6, rot = o.spin * ou;
      c.save(); c.translate(x, y); c.rotate(rot); c.fillStyle = ['#fbbf24', '#94a3b8', '#e7d9b0', '#7c5a3a'][o.kind]; c.strokeStyle = 'rgba(255,255,255,0.3)';
      if (o.kind === 0) { c.beginPath(); c.ellipse(0, 0, 7 * fs * 1.4, 3 * fs * 1.4, 0, 0, TAU); c.fill(); }
      else if (o.kind === 1) c.fillRect(-4 * fs, -9 * fs, 8 * fs, 12 * fs);
      else if (o.kind === 2) c.fillRect(-10 * fs, -4 * fs, 20 * fs, 8 * fs);
      else { c.beginPath(); c.moveTo(-3 * fs, 6 * fs); c.lineTo(0, -12 * fs); c.lineTo(3 * fs, 6 * fs); c.closePath(); c.fill(); }
      c.restore();
    }
    // caster: rises, rolls to hang toward the ceiling, falls back
    const lift = H * 0.4 * inv;
    c.save(); c.translate(cx, gy - 64 * fs - lift); c.rotate(Math.PI * inv * (1 - 0.0)); figure(c, 0, 64 * fs, fs, { rim: '#d8b4fe' }); c.restore();
    // landing dust ring
    const dr = seg(t, 3.95, 4.9);
    if (dr > 0 && dr < 1) { c.strokeStyle = `rgba(216,180,254,${0.5 * (1 - dr)})`; c.lineWidth = 3; c.beginPath(); c.ellipse(cx, gy + 2, unit * 0.34 * easeOut(dr), unit * 0.05 * easeOut(dr), 0, 0, TAU); c.stroke(); }
  },
};

// ---------------------------------------------------------------- 61: fireball centred on self (3rd level)
const fireball3 = {
  concept: 'Embers are drawn into the caster, a single white-hot detonation blooms into a 20-ft billowing fireball engulfing the dark silhouette, then collapses into rising smoke over a scorched ring.',
  duration: 6.4,
  init(W, H, r) {
    return {
      motes: Array.from({ length: 56 }, () => ({ a: r() * TAU, d: 0.45 + r() * 0.55, ph: r() })),
      puffs: Array.from({ length: 54 }, () => ({ a: r() * TAU, d: Math.sqrt(r()) * 0.82, s: 0.16 + r() * 0.3, ph: r() * TAU })),
      smoke: Array.from({ length: 22 }, () => ({ x: (r() * 2 - 1) * 0.6, s: 0.1 + r() * 0.16, v: 0.5 + r() })),
    };
  },
  draw(c, W, H, t, S) {
    const { fs, gy, cx, unit } = layout(W, H);
    const cy = gy - 56 * fs, R = unit * 0.58;
    sky(c, W, H, '#10060a', '#2a0f0a');
    ground(c, W, H, gy, '#120806', 'rgba(251,146,60,0.35)');
    const boom = seg(t, 1.25, 2.1), fireA = 1 - seg(t, 2.8, 5.2);
    // scorch ring
    if (boom > 0) { c.save(); c.translate(cx, gy + 4); c.scale(1, 0.18); const g = c.createRadialGradient(0, 0, 0, 0, 0, R * 1.1); g.addColorStop(0.5, `rgba(0,0,0,${0.7 * boom})`); g.addColorStop(1, 'rgba(0,0,0,0)'); c.fillStyle = g; c.beginPath(); c.arc(0, 0, R * 1.1, 0, TAU); c.fill(); c.restore(); }
    // charging
    const ch = seg(t, 0, 1.25);
    c.globalCompositeOperation = 'lighter';
    for (const m of S.motes) {
      const u = clamp(ch * 1.2 - m.ph * 0.2), d = m.d * (1 - easeIn(u)) * unit * 0.55;
      if (ch >= 1) continue;
      glow(c, cx + Math.cos(m.a + u * 2) * d, cy + Math.sin(m.a + u * 2) * d * 0.7, 7 + 6 * u, '251,146,60', 0.75 * Math.sin(u * Math.PI));
    }
    glow(c, cx, cy, (24 + 150 * ch * ch) * (unit / 800), '255,180,90', 0.5 * ch * (1 - boom));
    // fireball billows
    const rr = R * easeOut(boom);
    for (const p of S.puffs) {
      const x = cx + Math.cos(p.a) * p.d * rr * 1.15, y = cy + Math.sin(p.a) * p.d * rr * 0.85 - seg(t, 2.1, 5) * 40 * p.s * (unit / 800) * 6;
      const rad = p.s * rr * (1 + 0.12 * Math.sin(t * 5 + p.ph)), heat = clamp(1 - p.d - seg(t, 1.8, 4.5) * 0.6);
      const g = c.createRadialGradient(x, y, 0, x, y, rad);
      g.addColorStop(0, `rgba(255,${Math.round(110 + 80 * heat)},${Math.round(30 + 90 * heat * heat)},${0.5 * fireA})`);
      g.addColorStop(0.6, `rgba(220,${Math.round(60 + 40 * heat)},20,${0.28 * fireA})`);
      g.addColorStop(1, 'rgba(120,20,0,0)');
      c.fillStyle = g; c.fillRect(x - rad, y - rad, rad * 2, rad * 2);
    }
    // the one flash (single decaying pulse — no strobing)
    const fl = 1 - seg(t, 1.25, 1.6);
    if (t >= 1.25 && fl > 0) { c.fillStyle = `rgba(255,236,200,${0.55 * fl})`; c.fillRect(0, 0, W, H); }
    // shockwave
    if (boom > 0 && boom < 1) { c.strokeStyle = `rgba(255,220,170,${0.7 * (1 - boom)})`; c.lineWidth = 5 * (unit / 800); c.beginPath(); c.arc(cx, cy, R * 1.25 * easeOut(boom), 0, TAU); c.stroke(); }
    c.globalCompositeOperation = 'source-over';
    // smoke
    const sm = seg(t, 2.4, 6.0);
    for (const s of S.smoke) { const x = cx + s.x * R, y = cy - sm * s.v * unit * 0.5 + 20, rad = s.s * R * (0.6 + sm); const g = c.createRadialGradient(x, y, 0, x, y, rad); g.addColorStop(0, `rgba(40,30,30,${0.4 * Math.sin(sm * Math.PI)})`); g.addColorStop(1, 'rgba(40,30,30,0)'); c.fillStyle = g; c.fillRect(x - rad, y - rad, rad * 2, rad * 2); }
    figure(c, cx, gy, fs, { fill: '#050304', rim: t > 1.25 ? '#ffb070' : '#fb923c' });
  },
};

// ---------------------------------------------------------------- 63: teleport up to 60 ft
const teleport60 = {
  concept: 'Rune circle flares, the caster dissolves into ~260 particles that arc across a stretched, streaked gap and re-assemble at a second circle 60 ft away.',
  duration: 5.0,
  init(W, H, r) {
    return figurePoints(260, r).map((p) => ({ ...p, d: r(), lift: 40 + r() * 140, tw: r() * TAU }));
  },
  draw(c, W, H, t, S) {
    const { fs, gy, unit } = layout(W, H);
    const x0 = W * 0.22, x1 = W * 0.78;
    sky(c, W, H, '#07061a', '#14103a');
    ground(c, W, H, gy, '#0a0a1c', 'rgba(129,140,248,0.35)');
    const ring = (x, a) => {
      if (a <= 0) return;
      c.save(); c.translate(x, gy + 6); c.scale(1, 0.2); c.strokeStyle = `rgba(165,180,252,${a})`; c.lineWidth = 3; c.beginPath(); c.arc(0, 0, unit * 0.12, 0, TAU); c.stroke();
      c.beginPath(); c.arc(0, 0, unit * 0.085, 0, TAU); c.stroke();
      for (let i = 0; i < 8; i++) { const an = (i / 8) * TAU + t; c.beginPath(); c.moveTo(Math.cos(an) * unit * 0.085, Math.sin(an) * unit * 0.085); c.lineTo(Math.cos(an) * unit * 0.12, Math.sin(an) * unit * 0.12); c.stroke(); }
      c.restore();
    };
    ring(x0, seg(t, 0.1, 0.7) * (1 - seg(t, 3.0, 4.2)));
    ring(x1, seg(t, 1.5, 2.2) * (1 - seg(t, 3.6, 4.8)));
    // dotted 60 ft path
    c.setLineDash([4, 10]); c.strokeStyle = `rgba(165,180,252,${0.35 * seg(t, 0.8, 1.4) * (1 - seg(t, 3.2, 4.4))})`; c.lineWidth = 2;
    c.beginPath(); c.moveTo(x0, gy - 140 * fs); c.quadraticCurveTo((x0 + x1) / 2, gy - unit * 0.62, x1, gy - 140 * fs); c.stroke(); c.setLineDash([]);
    // source figure fades, target figure appears
    figure(c, x0, gy, fs, { rim: '#a5b4fc', alpha: 1 - smooth(seg(t, 0.9, 1.5)) });
    figure(c, x1, gy, fs, { rim: '#a5b4fc', alpha: smooth(seg(t, 2.4, 3.1)) });
    c.globalCompositeOperation = 'lighter';
    // spatial streaks
    const sa = Math.sin(clamp((t - 1.0) / 1.8) * Math.PI);
    for (let i = 0; i < 12; i++) { const y = gy - (10 + i * 10) * fs, len = (x1 - x0) * (0.3 + 0.7 * ((i * 7) % 11) / 11); const g = c.createLinearGradient(x0, y, x0 + len, y); g.addColorStop(0, 'rgba(129,140,248,0)'); g.addColorStop(0.5, `rgba(199,210,254,${0.3 * sa})`); g.addColorStop(1, 'rgba(129,140,248,0)'); c.fillStyle = g; c.fillRect(x0 + (x1 - x0 - len) * ease01(t, i), y, len, 1.5); }
    // particles
    for (const p of S) {
      const u = easeOut(seg(t, 1.0 + p.d * 0.45, 2.4 + p.d * 0.45));
      if (t < 0.95) continue;
      const a = bezier2({ x: x0 + p.x * fs, y: gy + p.y * fs }, { x: (x0 + x1) / 2, y: gy - unit * 0.55 - p.lift }, { x: x1 + p.x * fs, y: gy + p.y * fs }, u);
      const alpha = (u < 1 ? 0.9 : 0.9 * (1 - seg(t, 2.6, 3.4))) * (0.7 + 0.3 * Math.sin(t * 18 + p.tw));
      c.fillStyle = `rgba(199,210,254,${alpha})`; c.fillRect(a.x - 1.5, a.y - 1.5, 3, 3);
    }
    glow(c, x1, gy - 60 * fs, unit * 0.2, '165,180,252', 0.6 * Math.sin(seg(t, 2.2, 3.2) * Math.PI));
    c.globalCompositeOperation = 'source-over';
  },
};
const ease01 = (t, i) => 0.5 + 0.5 * Math.sin(t * 2 + i);

// ---------------------------------------------------------------- 70: 10-ft pit opens underfoot
const pit = {
  concept: 'Cracks race through the floor, a pit yawns open beneath the caster who drops into it amid dust and falling pebbles, and the camera settles looking up at the bright rim.',
  duration: 5.2,
  init(W, H, r) {
    return { pebbles: Array.from({ length: 26 }, () => ({ x: (r() * 2 - 1), v: 0.4 + r() * 0.9, d: r() * 0.5, s: 2 + r() * 4 })), dust: Array.from({ length: 24 }, () => ({ x: (r() * 2 - 1), v: 0.3 + r(), s: 0.05 + r() * 0.08 })) };
  },
  draw(c, W, H, t, S) {
    const { fs, gy, cx, unit } = layout(W, H);
    const depth = 230 * fs, camera = smooth(seg(t, 1.8, 3.4)) * depth * 0.95; // camera pans down with the fall
    sky(c, W, H, '#0d0a08', '#1c1410');
    c.save(); c.translate(0, -camera);
    const open = smooth(seg(t, 0.8, 1.7)), half = open * unit * 0.3;
    // soil strata
    c.fillStyle = '#17110c'; c.fillRect(0, gy, W, depth + H);
    for (let i = 1; i < 6; i++) { c.fillStyle = i % 2 ? 'rgba(120,80,40,0.10)' : 'rgba(0,0,0,0.12)'; c.fillRect(0, gy + i * depth / 6, W, depth / 12); }
    // pit interior
    const g = c.createLinearGradient(0, gy, 0, gy + depth); g.addColorStop(0, '#000'); g.addColorStop(1, '#050303');
    c.fillStyle = g; c.fillRect(cx - half, gy, half * 2, depth);
    c.fillStyle = 'rgba(0,0,0,0.5)'; c.fillRect(cx - half - 6, gy, 6, depth); c.fillRect(cx + half, gy, 6, depth);
    c.fillStyle = 'rgba(251,191,36,0.35)'; c.fillRect(0, gy, cx - half, 2); c.fillRect(cx + half, gy, W - cx - half, 2);
    // pre-collapse cracks
    const cr = seg(t, 0.1, 0.8);
    c.strokeStyle = `rgba(251,191,36,${0.8 * cr * (1 - open)})`; c.lineWidth = 2;
    for (let i = -3; i <= 3; i++) { c.beginPath(); c.moveTo(cx, gy + 3); c.lineTo(cx + i * unit * 0.07 * cr, gy + 3 + Math.abs(i % 2) * 5); c.lineTo(cx + i * unit * 0.11 * cr, gy + 2); c.stroke(); }
    // caster: stands, then falls (ease-in) and lands with a squash
    const fall = easeIn(seg(t, 1.45, 2.4)), land = seg(t, 2.4, 2.8), fy = gy + (depth - 8) * fall;
    c.save(); c.translate(cx, fy); c.scale(1 + 0.12 * Math.sin(land * Math.PI), 1 - 0.1 * Math.sin(land * Math.PI)); figure(c, 0, 0, fs, { rim: '#fbbf24' }); c.restore();
    // pebbles and dust
    c.fillStyle = '#6b5640';
    for (const p of S.pebbles) { const q = t - 1.2 - p.d; if (q < 0) continue; const y = gy + 0.5 * 700 * q * q * p.v * (unit / 800); if (y > gy + depth) continue; c.fillRect(cx + p.x * half, y, p.s, p.s); }
    for (const d of S.dust) { const q = seg(t, 1.0, 4.4); if (q <= 0) continue; const x = cx + d.x * (half + 40), y = gy - q * d.v * unit * 0.3, rad = d.s * unit * (0.5 + q); const gg = c.createRadialGradient(x, y, 0, x, y, rad); gg.addColorStop(0, `rgba(160,130,100,${0.22 * Math.sin(q * Math.PI)})`); gg.addColorStop(1, 'rgba(160,130,100,0)'); c.fillStyle = gg; c.fillRect(x - rad, y - rad, rad * 2, rad * 2); }
    c.restore();
    // soft shaft of light falling into the pit from the rim once the camera has dropped
    const up = seg(t, 2.6, 3.6), rimY = gy - camera, hw = unit * 0.3;
    if (up > 0) {
      c.globalCompositeOperation = 'lighter';
      const lg = c.createLinearGradient(0, rimY, 0, H); lg.addColorStop(0, `rgba(251,191,36,${0.3 * up})`); lg.addColorStop(1, 'rgba(251,191,36,0)');
      c.fillStyle = lg; c.beginPath(); c.moveTo(cx - hw, rimY); c.lineTo(cx + hw, rimY); c.lineTo(cx + hw * 0.6, H); c.lineTo(cx - hw * 0.6, H); c.closePath(); c.fill();
      c.globalCompositeOperation = 'source-over';
    }
  },
};

// ---------------------------------------------------------------- 75: lightning bolt in a random direction
function makeBolt(x0, y0, x1, y1, rand, depth = 0) {
  const pts = [{ x: x0, y: y0 }, { x: x1, y: y1 }];
  const out = { main: [], branches: [] };
  let disp = Math.hypot(x1 - x0, y1 - y0) * 0.16, cur = pts;
  for (let i = 0; i < 6; i++) {
    const nxt = [];
    for (let j = 0; j < cur.length - 1; j++) {
      const a = cur[j], b = cur[j + 1], mx = (a.x + b.x) / 2, my = (a.y + b.y) / 2, nx = -(b.y - a.y), ny = b.x - a.x, nl = Math.hypot(nx, ny) || 1, o = (rand() - 0.5) * disp;
      nxt.push(a, { x: mx + (nx / nl) * o, y: my + (ny / nl) * o });
    }
    nxt.push(cur[cur.length - 1]); cur = nxt; disp *= 0.55;
  }
  out.main = cur;
  if (depth < 1) for (let i = 8; i < cur.length - 8; i += 9 + Math.floor(rand() * 8)) {
    const p = cur[i], ang = Math.atan2(y1 - y0, x1 - x0) + (rand() < 0.5 ? -1 : 1) * (0.4 + rand() * 0.5), len = Math.hypot(x1 - x0, y1 - y0) * (0.1 + rand() * 0.14);
    out.branches.push(makeBolt(p.x, p.y, p.x + Math.cos(ang) * len, p.y + Math.sin(ang) * len, rand, depth + 1).main);
  }
  return out;
}
const lightning = {
  concept: 'Static crackles around the caster, then a branching bolt lances out along a random line (rolled fresh each play), with a single decaying flash, two re-strikes, and a lingering ionised channel.',
  duration: 4.6,
  init(W, H, r) {
    const { fs, gy, cx } = layout(W, H);
    const ox = cx + 22 * fs, oy = gy - 78 * fs, ang = -(0.06 + Math.random() * 0.88) * Math.PI, L = Math.hypot(W, H) * 1.1;
    const ex = ox + Math.cos(ang) * L, ey = oy + Math.sin(ang) * L;
    return { ox, oy, ex, ey, bolts: [0, 1, 2].map(() => makeBolt(ox, oy, ex, ey, r)), arcs: Array.from({ length: 5 }, () => ({ a: r() * TAU, l: 30 + r() * 50, ph: r() })) };
  },
  draw(c, W, H, t, S) {
    const { fs, gy, cx, unit } = layout(W, H), k = unit / 800;
    sky(c, W, H, '#050a14', '#0b1a2e');
    ground(c, W, H, gy, '#070c16', 'rgba(125,211,252,0.3)');
    const charge = seg(t, 0, 0.9);
    c.globalCompositeOperation = 'lighter';
    glow(c, S.ox, S.oy, (20 + 70 * charge) * k * 1.4, '125,211,252', 0.6 * charge * (1 - seg(t, 0.9, 1.3)));
    c.strokeStyle = `rgba(186,230,253,${0.6 * charge * (1 - seg(t, 0.9, 1.2))})`; c.lineWidth = 1.5;
    const step = Math.floor(t * 6);
    for (const a of S.arcs) { const aa = a.a + step * 1.7 * (a.ph + 0.3), x1 = cx + Math.cos(aa) * a.l * fs * 1.2, y1 = gy - 60 * fs + Math.sin(aa) * a.l * fs; c.beginPath(); c.moveTo(cx, gy - 60 * fs); c.lineTo((cx + x1) / 2 + Math.sin(aa * 5) * 6, (gy - 60 * fs + y1) / 2 + 6); c.lineTo(x1, y1); c.stroke(); }
    const strike = (i, t0, life, w) => {
      const q = (t - t0) / life;
      if (q < 0 || q > 1) return;
      const a = (1 - q) * (1 - q), draw = (pts, m) => { c.beginPath(); pts.forEach((p, j) => (j ? c.lineTo(p.x, p.y) : c.moveTo(p.x, p.y))); c.stroke(); void m; };
      const b = S.bolts[i];
      for (const [lw, col] of [[34 * w * k, `rgba(56,189,248,${0.22 * a})`], [12 * w * k, `rgba(125,211,252,${0.5 * a})`], [4.5 * w * k + 0.5, `rgba(255,255,255,${a})`]]) {
        c.strokeStyle = col; c.lineWidth = lw; c.lineJoin = 'round'; c.lineCap = 'round';
        draw(b.main); for (const br of b.branches) { c.lineWidth = lw * 0.5; draw(br); c.lineWidth = lw; }
      }
    };
    strike(0, 0.9, 1.0, 1); strike(1, 1.35, 0.8, 0.7); strike(2, 1.8, 0.7, 0.5);
    // lingering ionised channel
    const ch = seg(t, 1.0, 1.6) * (1 - seg(t, 2.4, 4.4));
    if (ch > 0) { c.strokeStyle = `rgba(125,211,252,${0.22 * ch})`; c.lineWidth = 16 * k; c.lineCap = 'round'; c.beginPath(); c.moveTo(S.ox, S.oy); c.lineTo(S.ex, S.ey); c.stroke(); }
    // shock rings
    const sr = seg(t, 0.9, 1.9);
    if (sr > 0 && sr < 1) { c.strokeStyle = `rgba(186,230,253,${0.45 * (1 - sr)})`; c.lineWidth = 3; c.beginPath(); c.arc(S.ox, S.oy, easeOut(sr) * unit * 0.5, 0, TAU); c.stroke(); }
    c.globalCompositeOperation = 'source-over';
    const fl = 1 - seg(t, 0.9, 1.1); // a single brief flash
    if (t >= 0.9 && fl > 0) { c.fillStyle = `rgba(220,240,255,${0.3 * fl})`; c.fillRect(0, 0, W, H); }
    figure(c, cx, gy, fs, { rim: '#7dd3fc' });
  },
};

export const DEDICATED_SCENES = { 3: butterflies, 14: firework, 28: fog, 44: gravityFlip, 61: fireball3, 63: teleport60, 70: pit, 75: lightning };
