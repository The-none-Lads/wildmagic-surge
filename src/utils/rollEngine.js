export function rollSurge(entries, manualOverrideId = null) {
  if (!entries || entries.length === 0) return null;
  if (manualOverrideId) {
    return entries.find(e => e.id === manualOverrideId) || null;
  }
  const randomIndex = Math.floor(Math.random() * entries.length);
  return entries[randomIndex];
}
