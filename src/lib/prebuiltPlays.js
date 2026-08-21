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
    frames: frameDefs.map(([label, positions, notes = ''], i) => ({
      id: `pb_${name}_${i}`,
      label,
      notes,
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
          "S sets from base position on serve. OH1 and MB1 hold normal front-row spots, ready to release into the combo.",
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
          "MB1 pushes tight to the setter for a quick 1. OH1 clears deep then curls back in behind MB1's approach to disguise the combo.",
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
          "MB1 attacks the quick set first, occupying the middle blocker. OH1 hits a step behind MB1's original spot where the block couldn't commit.",
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
          'Standard serve-receive shape. OH2 is deep in the back row, out of the front-row attackers the block is keying on.',
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
          "MB2 releases to the net for a decoy quick front, pulling the middle blocker's eyes. OH2 begins the back-row approach from behind the 3m line.",
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
          "OH2 attacks from back-row middle (the 'pipe') - the middle blocker is occupied by MB2's decoy, so the pipe hits a seam.",
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
          "Setter starts back row per 6-2 rotation; all six attackers are eligible since S isn't front row.",
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
          'S releases forward toward net to set. MB2 begins a middle release run to threaten a quick set from the right side.',
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
          "MB2 finishes the quick attack up the middle. OH2 stays wide as a secondary read if the block commits to MB2.",
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
          'Both middles start in normal front-row spots; back-row S is about to release to target.',
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
          'MB1 and MB2 both release toward the setter at the same tempo, forcing the middle blocker to commit to one or split.',
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
          "Setter picks whichever middle the block didn't commit to - shown here as MB1's quick 1, with MB2's release as the decoy.",
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
          'Both setters start front row (S and OPP), so the offense spreads across four remaining attackers.',
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
          'S sets from the front row. OH1, MB1, and OH2 all release toward their approach lines at once to stretch the block.',
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
          'Attack spreads wide - OH1 and MB1 up front, OH2 trailing as a second-tempo option if the first read is covered.',
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
          'Normal 4-2 base shape - S is disguised as a passer/blocker before releasing to set.',
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
          "S releases toward the net as if to set a normal ball, freezing the opposing block's read.",
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
          'Instead of setting, S tips or attacks the second ball directly - effective when the block over-commits to the outside hitters.',
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

// Tag each prebuilt play with its owning system id. Duplicating a play
// spreads its fields (see lib/plays.js duplicatePlay), so a copy inherits
// this automatically and the library can group it under the right tab
// without any extra bookkeeping at duplicate time.
for (const system of PLAY_SYSTEMS) {
  for (const p of system.plays) {
    p.system = system.id;
  }
}
