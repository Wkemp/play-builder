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

// Some systems conventionally call a role something different, even though
// it's the same functional slot. Most notably, beginner-friendly 4-2
// usually calls the OPP role "Right Side" rather than "Opposite" - the
// position is less specialized there, so the more casual name is standard.
// Extend this map if other systems need their own terminology later.
const SYSTEM_LABEL_OVERRIDES = {
  '4-2': { OPP: 'Right Side' },
};

/** The six position roles, with labels localized to a system's conventional
 * terminology. Falls back to the generic labels when systemId is
 * null/unrecognized (e.g. a custom play with no system tag) - ids never
 * change, only display labels. */
export function positionsForSystem(systemId) {
  const overrides = SYSTEM_LABEL_OVERRIDES[systemId];
  if (!overrides) return DEFAULT_POSITIONS;
  return DEFAULT_POSITIONS.map((p) => (overrides[p.id] ? { ...p, label: overrides[p.id] } : p));
}

/** Default roster entry for a position - no number/name assigned yet. */
export function blankRosterEntry() {
  const entry = {};
  for (const pos of DEFAULT_POSITIONS) entry[pos.id] = { number: '', name: '' };
  return entry;
}
