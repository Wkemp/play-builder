import { makeId } from './id';
import { POSITION_IDS } from './positions';

// A Play is an ordered sequence of Frames (Pre-serve -> Set -> Attack, or
// however many steps a coach wants). Each Frame is a snapshot of every
// position's grid cell at that step. Stepping between frames is what shows
// the play "running" - CourtDiagram already animates puck movement between
// two sets of coordinates, so cycling frames reuses that for free.

/** A reasonable starting formation for a brand-new blank play - a generic
 * serve-receive shape. Every coordinate is meant to be dragged elsewhere. */
export function defaultFrame(label = 'Pre-Serve') {
  return {
    id: makeId('frame'),
    label,
    notes: '',
    positions: {
      OH1: { col: 2, row: 2 },
      MB1: { col: 5, row: 1 },
      OPP: { col: 9, row: 2 },
      S: { col: 10, row: 5 },
      OH2: { col: 1, row: 6 },
      MB2: { col: 5, row: 6 },
    },
  };
}

export function createBlankPlay({ system = 'custom', name = 'New Play' } = {}) {
  return {
    id: makeId('play'),
    name,
    system,
    isCustom: true,
    frames: [defaultFrame('Pre-Serve'), cloneFrameAs(defaultFrame('Pre-Serve'), 'Attack')],
  };
}

function cloneFrameAs(frame, label) {
  return { ...frame, id: makeId('frame'), label };
}

/** Duplicate any play (prebuilt or custom) into a new editable custom play. */
export function duplicatePlay(play, { name } = {}) {
  return {
    ...play,
    id: makeId('play'),
    name: name || `${play.name} (Copy)`,
    isCustom: true,
    frames: play.frames.map((f) => ({
      ...f,
      id: makeId('frame'),
      positions: { ...f.positions },
    })),
  };
}

export function addFrame(play, afterFrameId) {
  const idx = play.frames.findIndex((f) => f.id === afterFrameId);
  const base = idx >= 0 ? play.frames[idx] : play.frames[play.frames.length - 1];
  const newFrame = { ...cloneFrameAs(base, `Step ${play.frames.length + 1}`), notes: '' };
  const frames = [...play.frames];
  frames.splice(idx >= 0 ? idx + 1 : frames.length, 0, newFrame);
  return { ...play, frames };
}

export function removeFrame(play, frameId) {
  if (play.frames.length <= 1) return play; // never leave a play with zero frames
  return { ...play, frames: play.frames.filter((f) => f.id !== frameId) };
}

export function renameFrame(play, frameId, label) {
  return {
    ...play,
    frames: play.frames.map((f) => (f.id === frameId ? { ...f, label } : f)),
  };
}

export function updateFrameNotes(play, frameId, notes) {
  return {
    ...play,
    frames: play.frames.map((f) => (f.id === frameId ? { ...f, notes } : f)),
  };
}

export function updatePositionInFrame(play, frameId, positionId, cell) {
  return {
    ...play,
    frames: play.frames.map((f) =>
      f.id === frameId ? { ...f, positions: { ...f.positions, [positionId]: cell } } : f
    ),
  };
}

/** Sanity-fill: if a play's frame is missing a position (e.g. imported from
 * an older version), fall back to the default frame's spot for it so
 * CourtDiagram never has to guard against undefined coordinates. */
export function positionCell(frame, positionId) {
  return frame.positions[positionId] || defaultFrame().positions[positionId];
}

export { POSITION_IDS };
