// Generates docs/ANIMATION_INVENTORY.md from the registry. Visual-inspection status is a hand-kept list here.
import fs from 'node:fs';
import { buildRegistry, auditRegistry } from '../src/animations/registry.js';
const data = JSON.parse(fs.readFileSync(new URL('../src/data/surgeData.json', import.meta.url), 'utf8'));
const reg = buildRegistry(data), a = auditRegistry(reg);
// Ids whose rendered frames were actually looked at (headless canvas contact sheets, not a real browser).
const SEEN = new Set([3, 61, 63, 70, 75, 29, 42, 48, 56, 77, 85, 89, 95, 98, 103, 105]);
const rows = reg.map((r) => `| ${r.id} | ${r.status} | ${r.status === 'dedicated' ? (SEEN.has(r.id) ? 'frames inspected (headless)' : 'draws without error only') : 'none'} | ${r.effect.replace(/\|/g, '/').slice(0, 90)} | ${r.concept ? r.concept.slice(0, 110).replace(/\|/g, '/') + '…' : ''} |`);
fs.writeFileSync(new URL('../docs/ANIMATION_INVENTORY.md', import.meta.url), `# Animation inventory (generated)\n\nDedicated: ${a.dedicated.length}/${a.count}. Legacy-only (not counted as finished): ${a.legacyOnly.length}.\n\n| id | status | verification | table text | concept |\n|---|---|---|---|---|\n${rows.join('\n')}\n`);
console.log(`dedicated ${a.dedicated.length}/${a.count}`);
