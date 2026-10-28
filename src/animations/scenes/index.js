import { DEDICATED_SCENES as BASE } from './dedicated.js';
import { HEALING_SCENES } from './healing.js';
import { TELEPORT_SCENES } from './teleports.js';
import { POLYMORPH_SCENES } from './polymorph.js';

// One flat table keyed by stable table id. Add each new effect family's scenes here.
export const DEDICATED_SCENES = { ...BASE, ...HEALING_SCENES, ...TELEPORT_SCENES, ...POLYMORPH_SCENES };

/** Returns the dedicated canvas scene for a table id, or null if the entry only has the legacy fallback. */
export function getScene(id) {
  return DEDICATED_SCENES[id] || null;
}
