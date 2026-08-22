import { useId, useMemo, useRef, useState } from 'react';
import { gridToFraction, fractionToGrid, GRID_COLS, GRID_ROWS } from '../lib/court';
import { DEFAULT_POSITIONS } from '../lib/positions';
import BallGlyph from './BallGlyph';

/** Perpendicular distance from point P to segment AB, plus which side of
 * the segment P falls on (+1/-1) - used to bow an option's curve away from
 * any puck sitting close to its direct path. */
function pointToSegment(px, py, ax, ay, bx, by) {
  const dx = bx - ax;
  const dy = by - ay;
  const lenSq = dx * dx + dy * dy || 1;
  const t = Math.max(0, Math.min(1, ((px - ax) * dx + (py - ay) * dy) / lenSq));
  const cx = ax + t * dx;
  const cy = ay + t * dy;
  const dist = Math.hypot(px - cx, py - cy);
  const side = Math.sign(dx * (py - ay) - dy * (px - ax)) || 1;
  return { dist, side };
}

/** Point at parameter t along a quadratic bezier - used to place an
 * option's label on the actual curve rather than the straight line. */
function quadPoint(ax, ay, cx, cy, bx, by, t) {
  const mt = 1 - t;
  return {
    x: mt * mt * ax + 2 * mt * t * cx + t * t * bx,
    y: mt * mt * ay + 2 * mt * t * cy + t * t * by,
  };
}

/**
 * Renders one frame of a play: six position pucks on the court, each
 * showing that role's assigned number/name. In edit mode, tap a puck then
 * tap the court to move it - same pick-up/place interaction as Rotation
 * Builder's formation editor.
 *
 * The ball uses the same pick-up mechanic, but placing it has two modes:
 * tap empty court to drop it at that spot, or tap a player puck to attach
 * it there (rendered as a small badge on top of that puck, riding along
 * with it frame to frame).
 *
 * If `previousPositions` is supplied (the prior frame's coordinates), a
 * faint dashed line is drawn from each position's old spot to its current
 * one, so a frame reads as "here's where things moved from" even before
 * you step through the sequence.
 *
 * `options` (this frame's setter reads, if any) fan out as curved, solid
 * lines from the setter to each listed target, in a distinct bright color
 * so they read as "alternatives available right now" rather than
 * "movement that happened." Each curve bows away from any other puck
 * sitting near its direct path (a lightweight obstacle dodge, not true
 * path-planning), and multiple options additionally fan to alternating
 * sides so they don't overlap each other. Labels render above the pucks
 * (z-20 vs pucks' z-10) so they stay legible even when a curve's midpoint
 * lands near a crowded puck. `showOptionLines`/`showOptionLabels` can be
 * toggled independently - e.g. keep the text but hide the lines once a
 * step is busy enough that the curves themselves add more clutter than
 * clarity.
 */
export default function CourtDiagram({
  frame,
  previousPositions = null,
  roster,
  editing = false,
  onPlacePosition,
  ball = null,
  showBall = true,
  onPlaceBall,
  onRemoveBall,
  options = [],
  showOptionLines = true,
  showOptionLabels = true,
  positions = DEFAULT_POSITIONS,
  isFullscreen = false,
}) {
  const [pickedUp, setPickedUp] = useState(null);
  const courtRef = useRef(null);
  const trailArrowId = useId();
  const optionArrowId = useId();

  const puckSize = isFullscreen
    ? 'w-20 h-20 sm:w-24 sm:h-24 text-2xl sm:text-3xl'
    : 'w-12 h-12 sm:w-14 sm:h-14 text-lg sm:text-xl';
  const ballSize = isFullscreen ? 'w-12 h-12 sm:w-14 sm:h-14' : 'w-7 h-7 sm:w-8 sm:h-8';
  const attachedBallSize = isFullscreen ? 'w-9 h-9 sm:w-11 sm:h-11' : 'w-5 h-5 sm:w-6 sm:h-6';
  const nameLabel = isFullscreen ? 'text-sm sm:text-base mt-1.5' : 'text-[11px] sm:text-xs mt-1';
  const nameLabelWidth = isFullscreen ? 'max-w-[7rem]' : 'max-w-[4.5rem]';
  const hintText = isFullscreen ? 'text-base' : 'text-[11px]';

  function handlePuckClick(positionId) {
    if (!editing) return;
    if (pickedUp === 'BALL') {
      onPlaceBall?.({ attachedTo: positionId });
      setPickedUp(null);
      return;
    }
    setPickedUp((prev) => (prev === positionId ? null : positionId));
  }

  function handleBallClick() {
    if (!editing) return;
    setPickedUp((prev) => (prev === 'BALL' ? null : 'BALL'));
  }

  function handleCourtClick(e) {
    if (!editing || pickedUp === null || !courtRef.current) return;
    const rect = courtRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    const cell = fractionToGrid(x, y);
    if (pickedUp === 'BALL') {
      onPlaceBall?.(cell);
    } else {
      onPlacePosition?.(pickedUp, cell);
    }
    setPickedUp(null);
  }

  // Options fan out from wherever the setter is standing THIS frame - a
  // same-step branch, not a between-step move, so it gets its own color
  // and skips the previous-frame pullback logic used for movement trails.
  const setterCell = frame.positions.S;
  const ballFree = ball && !ball.attachedTo ? ball : null;

  // Precompute each option's curve once, shared by both the drawn path and
  // its label, so the two never drift out of sync.
  const optionGeometry = useMemo(() => {
    if (!setterCell || options.length === 0) return [];
    const a = gridToFraction(setterCell);
    const ax = a.x * 150;
    const ay = a.y * 100;

    return options
      .map((opt, i) => {
        const toCell = frame.positions[opt.targetId];
        if (!toCell) return null;
        const b = gridToFraction(toCell);
        const bx = b.x * 150;
        const by = b.y * 100;

        // Any other puck sitting close to the direct setter->target line
        // pushes the curve to the opposite side, scaled by how close it
        // is. With nothing nearby, options just fan to alternating sides
        // so multiple curves from the same setter stay visually separate.
        const obstacles = positions.filter((p) => p.id !== 'S' && p.id !== opt.targetId)
          .map((p) => frame.positions[p.id])
          .filter(Boolean)
          .map((c) => gridToFraction(c));

        let closestDist = Infinity;
        let pushSide = 1;
        for (const obs of obstacles) {
          const { dist, side } = pointToSegment(obs.x * 150, obs.y * 100, ax, ay, bx, by);
          if (dist < closestDist) {
            closestDist = dist;
            pushSide = side;
          }
        }
        const obstacleThreshold = 16;
        const obstacleBow = closestDist < obstacleThreshold ? (obstacleThreshold - closestDist) * 1.3 : 0;

        const fanSign = i % 2 === 0 ? 1 : -1;
        const fanBow = 8 + i * 6;

        const bowSign = obstacleBow > 0 ? -pushSide : fanSign;
        const bowMag = Math.max(fanBow, obstacleBow);
        const bow = bowMag * bowSign;

        const dx = bx - ax;
        const dy = by - ay;
        const len = Math.hypot(dx, dy) || 1;
        const px = -dy / len;
        const py = dx / len;
        const cx = (ax + bx) / 2 + px * bow;
        const cy = (ay + by) / 2 + py * bow;

        // Pull the endpoint back off the destination puck along the local
        // tangent (control point -> destination) so the arrowhead clears it.
        const dx2 = bx - cx;
        const dy2 = by - cy;
        const dist2 = Math.hypot(dx2, dy2) || 1;
        const pullback = Math.min(6, dist2 * 0.35);
        const ex = bx - (dx2 / dist2) * pullback;
        const ey = by - (dy2 / dist2) * pullback;

        const labelPoint = quadPoint(ax, ay, cx, cy, ex, ey, 0.6);

        return {
          id: opt.id,
          label: opt.label,
          path: `M ${ax},${ay} Q ${cx},${cy} ${ex},${ey}`,
          labelXFrac: labelPoint.x / 150,
          labelYFrac: labelPoint.y / 100,
        };
      })
      .filter(Boolean);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [options, setterCell, frame.positions]);

  return (
    <div className="w-full select-none pt-6">
      <div className="relative w-full aspect-[3/2]">
        {/* net */}
        <div className="absolute -top-4 left-0 right-0 h-4 pointer-events-none">
          <div className="absolute -left-0.5 top-0 w-1 h-5 bg-serve rounded-full shadow-sm" />
          <div className="absolute -right-0.5 top-0 w-1 h-5 bg-serve rounded-full shadow-sm" />
          <div className="absolute top-0.5 left-0 right-0 h-1.5 bg-chalk rounded-full shadow-[0_1px_3px_rgba(0,0,0,0.5)]" />
          <div className="absolute top-2.5 left-0 right-0 h-2 bg-[repeating-linear-gradient(45deg,var(--color-chalk-dim)_0,var(--color-chalk-dim)_1px,transparent_1px,transparent_5px)] opacity-40" />
        </div>

        {/* court outline + center/thirds lines - also the tap target for placement */}
        <div
          ref={courtRef}
          onClick={handleCourtClick}
          className={`absolute inset-0 rounded-lg border-2 border-chalk/40 overflow-hidden bg-ink-raised z-0 ${
            editing && pickedUp !== null ? 'cursor-crosshair' : ''
          }`}
        >
          <div className="absolute left-0 right-0 top-1/2 h-px bg-chalk/20" />
          <div className="absolute top-0 bottom-0 left-1/2 w-px bg-chalk/20" />
          <div className="absolute top-0 bottom-0 left-1/3 w-px bg-chalk/10" />
          <div className="absolute top-0 bottom-0 left-2/3 w-px bg-chalk/10" />

          {editing && (
            <div className="absolute inset-0 pointer-events-none">
              {Array.from({ length: GRID_COLS - 1 }).map((_, i) => (
                <div
                  key={`gc-${i}`}
                  className="absolute top-0 bottom-0 w-px bg-gold/15"
                  style={{ left: `${((i + 1) / GRID_COLS) * 100}%` }}
                />
              ))}
              {Array.from({ length: GRID_ROWS - 1 }).map((_, i) => (
                <div
                  key={`gr-${i}`}
                  className="absolute left-0 right-0 h-px bg-gold/15"
                  style={{ top: `${((i + 1) / GRID_ROWS) * 100}%` }}
                />
              ))}
            </div>
          )}

          {/* movement trails from the previous frame, drawn under the pucks.
              viewBox matches the court's actual 3:2 aspect ratio (instead of
              a square one stretched with preserveAspectRatio="none") so a
              stroke width reads the same in both directions rather than
              being squashed on one axis. Muted court-line blue rather than
              gold keeps it visually secondary to the pucks. */}
          {previousPositions && (
            <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 150 100">
              <defs>
                <marker
                  id={trailArrowId}
                  markerWidth="6"
                  markerHeight="6"
                  refX="5"
                  refY="3"
                  orient="auto-start-reverse"
                  markerUnits="strokeWidth"
                >
                  <path d="M0,0 L6,3 L0,6 Z" fill="var(--color-court-line)" fillOpacity="0.85" />
                </marker>
              </defs>
              {positions.map((pos) => {
                const from = previousPositions[pos.id];
                const to = frame.positions[pos.id];
                if (!from || !to || (from.col === to.col && from.row === to.row)) return null;
                const a = gridToFraction(from);
                const b = gridToFraction(to);
                const ax = a.x * 150;
                const ay = a.y * 100;
                const bx = b.x * 150;
                const by = b.y * 100;
                const dx = bx - ax;
                const dy = by - ay;
                const dist = Math.hypot(dx, dy) || 1;
                const pullback = Math.min(6, dist * 0.35);
                const ex = bx - (dx / dist) * pullback;
                const ey = by - (dy / dist) * pullback;
                return (
                  <line
                    key={pos.id}
                    x1={ax}
                    y1={ay}
                    x2={ex}
                    y2={ey}
                    stroke="var(--color-court-line)"
                    strokeOpacity="0.85"
                    strokeWidth="1"
                    strokeLinecap="round"
                    strokeDasharray="4,3"
                    markerEnd={`url(#${trailArrowId})`}
                  />
                );
              })}
            </svg>
          )}

          {/* setter's alternate reads for this step, fanning out live as
              curves (see optionGeometry above) - a different color/style
              from the movement trails so "this could go here instead"
              never reads as "this moved." */}
          {showOptionLines && optionGeometry.length > 0 && (
            <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 150 100">
              <defs>
                <marker
                  id={optionArrowId}
                  markerWidth="6"
                  markerHeight="6"
                  refX="5"
                  refY="3"
                  orient="auto-start-reverse"
                  markerUnits="strokeWidth"
                >
                  <path d="M0,0 L6,3 L0,6 Z" fill="var(--color-sub-bright)" />
                </marker>
              </defs>
              {optionGeometry.map((g) => (
                <path
                  key={g.id}
                  d={g.path}
                  fill="none"
                  stroke="var(--color-sub-bright)"
                  strokeWidth="1.3"
                  strokeLinecap="round"
                  markerEnd={`url(#${optionArrowId})`}
                />
              ))}
            </svg>
          )}
        </div>

        {/* option labels - HTML rather than SVG text so they inherit the
            app's normal typography instead of needing separate SVG font
            styling. z-20 (above pucks' z-10) so a label never disappears
            under a puck it happens to land near. */}
        {showOptionLabels &&
          optionGeometry.map((g) => (
            <div
              key={g.id}
              className="absolute z-20 -translate-x-1/2 -translate-y-1/2 pointer-events-none text-[9px] sm:text-[10px] font-medium text-sub-bright bg-ink/90 border border-sub-bright/60 rounded px-1 py-0.5 whitespace-nowrap shadow-sm"
              style={{ left: `${g.labelXFrac * 100}%`, top: `${g.labelYFrac * 100}%` }}
            >
              {g.label}
            </div>
          ))}

        {/* position pucks */}
        {positions.map((pos) => {
          const cell = frame.positions[pos.id];
          if (!cell) return null;
          const { x, y } = gridToFraction(cell);
          const player = roster[pos.id] || { number: '', name: '' };
          const isPickedUp = pickedUp === pos.id;
          const attachedBall = showBall && ball?.attachedTo === pos.id;

          return (
            <div
              key={pos.id}
              onClick={() => handlePuckClick(pos.id)}
              className={`absolute flex flex-col items-center transition-all duration-[1400ms] ease-in-out z-10 ${
                editing ? 'cursor-pointer' : ''
              }`}
              style={{ left: `${x * 100}%`, top: `${y * 100}%`, transform: 'translate(-50%, -50%)' }}
            >
              <div
                className={`relative flex items-center justify-center rounded-full font-display font-semibold shadow-lg transition-colors duration-500 bg-gold text-ink ${puckSize} ${
                  isPickedUp ? 'ring-4 ring-chalk animate-pulse' : ''
                }`}
              >
                {player.number || pos.id}

                {/* ball riding on this player - overlaid at top-middle of the puck */}
                {attachedBall && (
                  <div
                    onClick={(e) => {
                      e.stopPropagation();
                      handleBallClick();
                    }}
                    className={`absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2 z-20 ${attachedBallSize} ${
                      editing ? 'cursor-pointer' : ''
                    }`}
                  >
                    <BallGlyph
                      className={`w-full h-full drop-shadow-md ${pickedUp === 'BALL' ? 'animate-pulse' : ''}`}
                    />
                    {editing && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          onRemoveBall?.();
                        }}
                        aria-label="Remove ball from this player"
                        className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-ink border border-chalk-dim/50 text-chalk-dim hover:text-serve hover:border-serve flex items-center justify-center text-[9px] leading-none transition-colors"
                      >
                        &times;
                      </button>
                    )}
                  </div>
                )}
              </div>
              <span className={`font-medium text-chalk-dim truncate text-center ${nameLabel} ${nameLabelWidth}`}>
                {player.name || pos.label}
              </span>
            </div>
          );
        })}

        {/* ball dropped on empty court - same pick-up/place interaction and
            movement transition as the pucks, no trail line of its own. */}
        {showBall && ballFree && (
          <div
            className="absolute z-10 transition-all duration-[1400ms] ease-in-out"
            style={{
              left: `${gridToFraction(ballFree).x * 100}%`,
              top: `${gridToFraction(ballFree).y * 100}%`,
              transform: 'translate(-50%, -50%)',
            }}
          >
            <div
              onClick={handleBallClick}
              className={`relative flex items-center justify-center ${ballSize} ${editing ? 'cursor-pointer' : ''}`}
            >
              <BallGlyph
                className={`w-full h-full drop-shadow-md ${pickedUp === 'BALL' ? 'animate-pulse' : ''}`}
              />
              {editing && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemoveBall?.();
                  }}
                  aria-label="Remove ball from this step"
                  className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-ink border border-chalk-dim/50 text-chalk-dim hover:text-serve hover:border-serve flex items-center justify-center text-[9px] leading-none transition-colors"
                >
                  &times;
                </button>
              )}
            </div>
          </div>
        )}

        {/* no ball placed yet for this step - offer to add one */}
        {showBall && !ball && editing && (
          <button
            onClick={() => setPickedUp('BALL')}
            className="absolute top-2 left-2 z-20 flex items-center gap-1 bg-ink-raised/90 border border-chalk-dim/40 rounded-full pl-1.5 pr-2 py-1 text-[10px] text-chalk-dim hover:text-gold hover:border-gold/50 transition-colors"
          >
            <BallGlyph className="w-3 h-3" /> Add ball
          </button>
        )}
      </div>

      {editing && (
        <p className={`mt-2 text-gold text-center ${hintText}`}>
          {pickedUp === null
            ? 'Tap a player, then tap where they should stand for this step.'
            : pickedUp === 'BALL'
              ? 'Tap a player to give them the ball, or tap empty court to drop it there.'
              : 'Tap anywhere on the court to place them there.'}
        </p>
      )}
    </div>
  );
}
