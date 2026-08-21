import { blankRosterEntry } from './positions';

/**
 * App-wide state persisted to localStorage:
 * - roster: { [positionId]: { number, name } } - who's currently playing
 *   each role. One roster for the whole app (not per-play) since the same
 *   six people play every play in a given match.
 * - customPlays: array of user-created/duplicated plays (prebuilt plays
 *   themselves are never stored - they come from prebuiltPlays.js so
 *   updates to the starter packs always reach existing users).
 * - activePlayId: id of whichever play is open in the editor. Prefixed
 *   with "pb_" for prebuilt plays (read-only, "Duplicate" to edit) or a
 *   generated id for custom ones.
 */
export function createInitialAppData() {
  return {
    roster: blankRosterEntry(),
    customPlays: [],
    activePlayId: null,
  };
}
