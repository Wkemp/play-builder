// Court grid math. Carried over from Rotation Builder's rotation.js -
// the coordinate system is identical, we just dropped everything tied to
// serve-order zones/slots since plays are position-based, not rotation-based.
//
// The court divides into the usual 6 rotational zones (3 across, 2 deep).
// At 15x10, each zone is its own 5x5 sub-grid, giving enough placement
// precision for realistic stacking/spacing without pinning a coach to a
// handful of fixed spots.

export const GRID_COLS = 15
export const GRID_ROWS = 10

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
