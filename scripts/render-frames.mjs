// Headless visual check: renders contact sheets (6 timepoints) of each dedicated scene to PNG.
// Usage: node scripts/render-frames.mjs [outDir] [id ...]
import { createCanvas } from '@napi-rs/canvas';
import fs from 'node:fs';
import { DEDICATED_SCENES } from '../src/animations/scenes/dedicated.js';
import { rng } from '../src/animations/scenes/toolkit.js';

const [out = '/tmp/frames', ...only] = process.argv.slice(2);
fs.mkdirSync(out, { recursive: true });
const W = 480, H = 270, cols = 3, rows = 2;
const fractions = [0.12, 0.28, 0.42, 0.58, 0.78, 1];
for (const [id, scene] of Object.entries(DEDICATED_SCENES)) {
  if (only.length && !only.includes(id)) continue;
  const sheet = createCanvas(W * cols, H * rows), sc = sheet.getContext('2d');
  fractions.forEach((f, i) => {
    const cv = createCanvas(W, H), c = cv.getContext('2d');
    const state = scene.init(W, H, rng(Number(id)));
    scene.draw(c, W, H, scene.duration * f, state);
    sc.drawImage(cv, (i % cols) * W, Math.floor(i / cols) * H);
  });
  fs.writeFileSync(`${out}/scene-${id}.png`, sheet.toBuffer('image/png'));
  console.log('rendered', id, `${scene.duration}s`);
}
