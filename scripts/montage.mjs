// One-image review sheet: each requested scene gets a row of 5 frames. Usage: node scripts/montage.mjs out.png id id ...
import { createCanvas } from '@napi-rs/canvas';
import fs from 'node:fs';
import { DEDICATED_SCENES } from '../src/animations/scenes/index.js';
import { rng } from '../src/animations/scenes/toolkit.js';
const [out, ...ids] = process.argv.slice(2), W = 300, H = 169, fr = [0.15, 0.32, 0.5, 0.72, 1];
const sheet = createCanvas(W * fr.length, H * ids.length), sc = sheet.getContext('2d');
ids.forEach((id, row) => fr.forEach((f, i) => {
  const s = DEDICATED_SCENES[id], cv = createCanvas(W, H), c = cv.getContext('2d');
  s.draw(c, W, H, s.duration * f, s.init(W, H, rng(Number(id))));
  sc.drawImage(cv, i * W, row * H);
  sc.fillStyle = '#fff'; sc.font = '12px sans-serif'; sc.fillText(`#${id}`, i * W + 4, row * H + 14);
}));
fs.writeFileSync(out, sheet.toBuffer('image/png'));
