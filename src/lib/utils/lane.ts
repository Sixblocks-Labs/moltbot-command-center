export function laneKey(lane: string) {
  return String(lane || 'global')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}
