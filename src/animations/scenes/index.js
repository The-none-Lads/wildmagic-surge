import { DEDICATED_SCENES } from './dedicated.js';

/** Returns the dedicated canvas scene for a table id, or null if the entry only has the legacy fallback. */
export function getScene(id) {
  return DEDICATED_SCENES[id] || null;
}
export { DEDICATED_SCENES };
