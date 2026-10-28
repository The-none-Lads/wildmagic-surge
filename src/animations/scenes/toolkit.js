// Shared drawing helpers for canvas scenes. Pure functions — no DOM access — so scenes
// can be rendered headlessly (see scripts/render-frames.mjs) and unit-tested.
export const TAU = Math.PI * 2;
export const clamp = (x, a = 0, b = 1) => Math.min(b, Math.max(a, x));
export const lerp = (a, b, t) => a + (b - a) * t;
export const smooth = (x) => { x = clamp(x); return x * x * (3 - 2 * x); };
export const easeOut = (x) => 1 - Math.pow(1 - clamp(x), 3);
export const easeIn = (x) => Math.pow(clamp(x), 2);
export const seg = (t, a, b) => clamp((t - a) / (b - a));

/** Small deterministic PRNG so scenes look identical between runs/screenshots. */
export function rng(seed) {
  let s = (Math.imul(seed + 1, 2654435761) >>> 0) || 1;
  return () => ((s = (Math.imul(s, 1664525) + 1013904223) >>> 0) / 4294967296);
}

export function layout(W, H) {
  const fs = Math.min((H * 0.3) / 127, (W * 0.26) / 52);
  return { fs, gy: H * 0.78, cx: W / 2, unit: Math.min(W, H) };
}

export function sky(c, W, H, top, bottom) {
  const g = c.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, top);
  g.addColorStop(1, bottom);
  c.fillStyle = g;
  c.fillRect(0, 0, W, H);
}

export function ground(c, W, H, gy, color = '#0b0b16', rim = 'rgba(200,182,255,0.25)') {
  c.fillStyle = color;
  c.fillRect(0, gy, W, H - gy);
  c.fillStyle = rim;
  c.fillRect(0, gy, W, 2);
}

export function glow(c, x, y, r, rgb, a = 1) {
  if (r <= 0 || a <= 0) return;
  const g = c.createRadialGradient(x, y, 0, x, y, r);
  g.addColorStop(0, `rgba(${rgb},${a})`);
  g.addColorStop(1, `rgba(${rgb},0)`);
  c.fillStyle = g;
  c.fillRect(x - r, y - r, r * 2, r * 2);
}

/** Hooded caster silhouette. Origin = feet (x, y). Height ≈ 127 * s. */
export function figure(c, x, y, s, { fill = '#0a0a16', rim = '#c8b6ff', alpha = 1, rimWidth = 2 } = {}) {
  c.save();
  c.translate(x, y);
  c.scale(s, s);
  c.globalAlpha *= alpha;
  c.fillStyle = fill;
  c.strokeStyle = rim;
  c.lineWidth = rimWidth / s;
  c.lineJoin = 'round';
  c.beginPath();
  c.moveTo(-27, 0);
  c.quadraticCurveTo(-24, -66, -9, -97);
  c.lineTo(9, -97);
  c.quadraticCurveTo(24, -66, 27, 0);
  c.closePath();
  c.fill();
  c.stroke();
  c.beginPath();
  c.moveTo(-16, -108);
  c.quadraticCurveTo(-15, -131, 0, -134);
  c.quadraticCurveTo(15, -131, 16, -108);
  c.quadraticCurveTo(0, -92, -16, -108);
  c.fill();
  c.stroke();
  c.restore();
}

/** Points inside the figure silhouette (figure-local, feet at 0,0) for particle assembly/dissolve. */
export function figurePoints(n, rand) {
  const pts = [];
  while (pts.length < n) {
    const y = -rand() * 132;
    const half = y > -97 ? lerp(27, 9, -y / 97) : 15;
    pts.push({ x: (rand() * 2 - 1) * half, y });
  }
  return pts;
}

export function bezier2(p0, p1, p2, u) {
  const a = (1 - u) * (1 - u), b = 2 * (1 - u) * u, d = u * u;
  return { x: a * p0.x + b * p1.x + d * p2.x, y: a * p0.y + b * p1.y + d * p2.y };
}
