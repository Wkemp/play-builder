// Starter play packs, one per common offensive system. These are templates,
// not gospel - every coordinate is just a reasonable starting point a coach
// will drag to match their own terminology and personnel. Ship with a
// handful of recognizable plays per system so there's something worth
// duplicating on day one, not a blank screen.
//
// Coordinates are {col, row} on the 12x8 grid (see lib/court.js). Row 0-1
// sits at the net, row 6-7 sits at the endline.

function play(name, frameDefs) {
  return {
    id: `pb_${name.toLowerCase().replace(/[^a-z0-9]+/g, '_')}`,
    name,
    isCustom: false,
    frames: frameDefs.map(([label, positions], i) => ({
      id: `pb_${name}_${i}`,
      label,
      positions,
    })),
  };
}

export const PLAY_SYSTEMS = [
  {
    id: '5-1',
    label: '5-1',
    description: 'One setter plays every rotation; five hitters split across the front and back row depending on rotation.',
    plays: [
      play('31 Combo', [
        [
          'Pre-Serve',
          {
            S: { col: 10, row: 6 },
            OH1: { col: 1, row: 1 },
            MB1: { col: 5, row: 1 },
            OPP: { col: 10, row: 1 },
            OH2: { col: 1, row: 6 },
            MB2: { col: 5, row: 6 },
          },
        ],
        [
          'Transition',
          {
            S: { col: 6, row: 2 },
            OH1: { col: 3, row: 2 },
            MB1: { col: 5, row: 2 },
            OPP: { col: 10, row: 1 },
            OH2: { col: 1, row: 5 },
            MB2: { col: 5, row: 5 },
          },
        ],
        [
          'Attack',
          {
            S: { col: 6, row: 2 },
            OH1: { col: 7, row: 1 },
            MB1: { col: 5, row: 1 },
            OPP: { col: 10, row: 1 },
            OH2: { col: 1, row: 4 },
            MB2: { col: 5, row: 5 },
          },
        ],
      ]),
      play('Pipe', [
        [
          'Pre-Serve',
          {
            S: { col: 10, row: 6 },
            OH1: { col: 1, row: 1 },
            MB1: { col: 5, row: 1 },
            OPP: { col: 10, row: 1 },
            OH2: { col: 1, row: 6 },
            MB2: { col: 5, row: 6 },
          },
        ],
        [
          'Approach',
          {
            S: { col: 6, row: 2 },
            OH1: { col: 1, row: 1 },
            MB1: { col: 4, row: 1 },
            OPP: { col: 10, row: 1 },
            OH2: { col: 5, row: 5 },
            MB2: { col: 7, row: 2 },
          },
        ],
        [
          'Attack',
          {
            S: { col: 6, row: 2 },
            OH1: { col: 1, row: 1 },
            MB1: { col: 4, row: 1 },
            OPP: { col: 10, row: 1 },
            OH2: { col: 5, row: 3 },
            MB2: { col: 7, row: 1 },
          },
        ],
      ]),
    ],
  },
  {
    id: '6-2',
    label: '6-2',
    description: 'Two setters, always opposite each other - whichever is in the back row sets, so six attackers are available when the setter is back row.',
    plays: [
      play('Quick Release', [
        [
          'Pre-Serve',
          {
            S: { col: 6, row: 6 },
            OH1: { col: 1, row: 1 },
            MB1: { col: 5, row: 1 },
            OPP: { col: 9, row: 1 },
            OH2: { col: 1, row: 6 },
            MB2: { col: 9, row: 6 },
          },
        ],
        [
          'Release',
          {
            S: { col: 6, row: 3 },
            OH1: { col: 1, row: 1 },
            MB1: { col: 5, row: 1 },
            OPP: { col: 9, row: 1 },
            OH2: { col: 2, row: 5 },
            MB2: { col: 9, row: 3 },
          },
        ],
        [
          'Attack',
          {
            S: { col: 6, row: 2 },
            OH1: { col: 1, row: 1 },
            MB1: { col: 5, row: 1 },
            OPP: { col: 9, row: 1 },
            OH2: { col: 2, row: 4 },
            MB2: { col: 9, row: 1 },
          },
        ],
      ]),
      play('Double Quick', [
        [
          'Pre-Serve',
          {
            S: { col: 6, row: 6 },
            OH1: { col: 1, row: 1 },
            MB1: { col: 5, row: 1 },
            OPP: { col: 9, row: 1 },
            OH2: { col: 1, row: 6 },
            MB2: { col: 9, row: 6 },
          },
        ],
        [
          'Both Middles Release',
          {
            S: { col: 6, row: 3 },
            OH1: { col: 2, row: 2 },
            MB1: { col: 5, row: 2 },
            OPP: { col: 9, row: 2 },
            OH2: { col: 1, row: 5 },
            MB2: { col: 7, row: 2 },
          },
        ],
        [
          'Attack',
          {
            S: { col: 6, row: 2 },
            OH1: { col: 2, row: 1 },
            MB1: { col: 5, row: 1 },
            OPP: { col: 9, row: 2 },
            OH2: { col: 1, row: 4 },
            MB2: { col: 7, row: 1 },
          },
        ],
      ]),
    ],
  },
  {
    id: '4-2',
    label: '4-2',
    description: 'Two setters, both front row together - the simplest system, common for beginner teams; setter is also a front-row attack option.',
    plays: [
      play('4-2 Spread', [
        [
          'Pre-Serve',
          {
            S: { col: 9, row: 1 },
            OH1: { col: 1, row: 1 },
            MB1: { col: 5, row: 1 },
            OPP: { col: 9, row: 6 },
            OH2: { col: 1, row: 6 },
            MB2: { col: 5, row: 6 },
          },
        ],
        [
          'Set',
          {
            S: { col: 7, row: 1 },
            OH1: { col: 2, row: 2 },
            MB1: { col: 5, row: 2 },
            OPP: { col: 9, row: 5 },
            OH2: { col: 1, row: 5 },
            MB2: { col: 5, row: 5 },
          },
        ],
        [
          'Attack',
          {
            S: { col: 7, row: 1 },
            OH1: { col: 2, row: 1 },
            MB1: { col: 5, row: 1 },
            OPP: { col: 9, row: 4 },
            OH2: { col: 1, row: 4 },
            MB2: { col: 5, row: 4 },
          },
        ],
      ]),
      play('Setter Attack', [
        [
          'Pre-Serve',
          {
            S: { col: 9, row: 1 },
            OH1: { col: 1, row: 1 },
            MB1: { col: 5, row: 1 },
            OPP: { col: 9, row: 6 },
            OH2: { col: 1, row: 6 },
            MB2: { col: 5, row: 6 },
          },
        ],
        [
          'Freeze the Block',
          {
            S: { col: 8, row: 2 },
            OH1: { col: 2, row: 1 },
            MB1: { col: 5, row: 1 },
            OPP: { col: 9, row: 5 },
            OH2: { col: 1, row: 5 },
            MB2: { col: 5, row: 5 },
          },
        ],
        [
          'Setter Tip/Attack',
          {
            S: { col: 9, row: 1 },
            OH1: { col: 2, row: 1 },
            MB1: { col: 5, row: 1 },
            OPP: { col: 9, row: 4 },
            OH2: { col: 1, row: 4 },
            MB2: { col: 5, row: 4 },
          },
        ],
      ]),
    ],
  },
];

/** Flat lookup of every prebuilt play by id, regardless of system. */
export function findPrebuiltPlay(playId) {
  for (const system of PLAY_SYSTEMS) {
    const found = system.plays.find((p) => p.id === playId);
    if (found) return found;
  }
  return null;
}
