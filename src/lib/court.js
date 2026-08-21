// Court grid math. Carried over from Rotation Builder's rotation.js -
// the coordinate system is identical, we just dropped everything tied to
// serve-order zones/slots since plays are position-based, not rotation-based.
//
// The whole court is a 12x8 grid so a coach can place a player anywhere
// (or right at the sideline/net, for realistic stacking) rather than being
// pinned to a handful of fixed spots.

export const GRID_COLS = 12
export const GRID_ROWS = 8

/** Grid cell {col, row} -> fractional {x, y} (0-1) for rendering, centered in the cell. */
export function gridToFraction({ col, row }) {
  return { x: (col + 0.5) / GRID_COLS, y: (row + 0.5) / GRID_ROWS }
}

/** Fractional {x, y} (0-1), e.g. from a tap position -> the grid cell it falls in. */
export function fractionToGrid(x, y) {
  const col = Math.min(GRID_COLS - 1, Math.max(0, Math.floor(x * GRID_COLS)))
  const row = Math.min(GRID_ROWS - 1, Math.max(0, Math.floor(y * GRID_ROWS)))
  return { col, row }
}
