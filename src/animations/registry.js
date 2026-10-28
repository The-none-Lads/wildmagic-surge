import { getScene } from './scenes/index.js';
import { getLegacyConfig } from './legacyConfig.js';

/**
 * Canonical registry: one record per table entry, keyed by the stable table id (NOT array position).
 * status: 'dedicated'     -> has its own composed canvas scene (scenes/dedicated.js)
 *         'legacy-config' -> only the old shared tint/particle overlay (NOT counted as a finished animation)
 */
export const EXPECTED_ENTRY_COUNT = 118;

export function buildRegistry(entries) {
  return entries.map((e) => {
    const scene = getScene(e.id);
    return {
      id: e.id,
      effect: e.effect,
      severity: e.severity,
      source: e.source,
      status: scene ? 'dedicated' : 'legacy-config',
      concept: scene ? scene.concept : null,
      legacy: getLegacyConfig(e.id),
    };
  });
}

export function auditRegistry(registry) {
  const ids = registry.map((r) => r.id);
  const dupes = ids.filter((id, i) => ids.indexOf(id) !== i);
  const missing = [];
  for (let i = 1; i <= EXPECTED_ENTRY_COUNT; i++) if (!ids.includes(i)) missing.push(i);
  return {
    count: registry.length,
    duplicates: [...new Set(dupes)],
    missing,
    dedicated: registry.filter((r) => r.status === 'dedicated').map((r) => r.id),
    legacyOnly: registry.filter((r) => r.status !== 'dedicated').map((r) => r.id),
  };
}
