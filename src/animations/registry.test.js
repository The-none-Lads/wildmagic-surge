import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import process from 'node:process';
import { createCanvas } from '@napi-rs/canvas';
import { buildRegistry, auditRegistry, EXPECTED_ENTRY_COUNT } from './registry.js';
import { DEDICATED_SCENES } from './scenes/index.js';
import { rng } from './scenes/toolkit.js';

const data = JSON.parse(fs.readFileSync(new URL('../data/surgeData.json', import.meta.url), 'utf8'));
const registry = buildRegistry(data);
const audit = auditRegistry(registry);

test('table has exactly 118 unique, contiguous entries with text', () => {
  assert.equal(data.length, EXPECTED_ENTRY_COUNT);
  assert.deepEqual(audit.duplicates, []);
  assert.deepEqual(audit.missing, []);
  for (const e of data) assert.ok(typeof e.effect === 'string' && e.effect.trim().length > 10, `entry ${e.id} has text`);
});

test('every entry resolves to a registry record carrying the canonical text', () => {
  assert.equal(registry.length, EXPECTED_ENTRY_COUNT);
  for (const e of data) assert.equal(registry.find((r) => r.id === e.id).effect, e.effect);
});

test('every dedicated scene targets a real entry and is fully specified', () => {
  for (const [id, s] of Object.entries(DEDICATED_SCENES)) {
    assert.ok(data.some((e) => e.id === Number(id)), `scene ${id} has a table entry`);
    assert.ok(s.concept && s.concept.length > 40, `scene ${id} documents its concept`);
    assert.ok(s.duration > 1 && typeof s.init === 'function' && typeof s.draw === 'function', `scene ${id} is complete`);
  }
});

test('dedicated scenes render without throwing at desktop and phone sizes, start to finish', () => {
  for (const [id, s] of Object.entries(DEDICATED_SCENES)) {
    for (const [W, H] of [[1280, 720], [390, 844]]) {
      const c = createCanvas(W, H).getContext('2d');
      const state = s.init(W, H, rng(Number(id)));
      for (let i = 0; i <= 20; i++) s.draw(c, W, H, (s.duration * i) / 20, state);
    }
  }
});

test('coverage report (STRICT_COVERAGE=1 makes missing dedicated scenes fail)', (t) => {
  t.diagnostic(`dedicated: ${audit.dedicated.length}/${EXPECTED_ENTRY_COUNT}; legacy-only: ${audit.legacyOnly.length}`);
  if (process.env.STRICT_COVERAGE) assert.deepEqual(audit.legacyOnly, [], 'entries still lacking a dedicated animation');
});
