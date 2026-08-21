// A play is drawn for ROLES, not people - "MB1 runs a 1, MB2 covers the
// slide" holds true no matter who's actually playing middle that match.
// Number/name are attached to a role so the diagram can show real players,
// but they're a display layer, not part of the play data itself - swapping
// out a starter never changes what any play draws.

export const DEFAULT_POSITIONS = [
  { id: 'S', label: 'Setter' },
  { id: 'OH1', label: 'Outside 1' },
  { id: 'OH2', label: 'Outside 2' },
  { id: 'MB1', label: 'Middle 1' },
  { id: 'MB2', label: 'Middle 2' },
  { id: 'OPP', label: 'Opposite' },
];

export const POSITION_IDS = DEFAULT_POSITIONS.map((p) => p.id);

/** Default roster entry for a position - no number/name assigned yet. */
export function blankRosterEntry() {
  const entry = {};
  for (const pos of DEFAULT_POSITIONS) entry[pos.id] = { number: '', name: '' };
  return entry;
}
