import { useId, useRef, useState } from 'react';
import { gridToFraction, fractionToGrid } from '../lib/court';
import { DEFAULT_POSITIONS } from '../lib/positions';
import BallGlyph from './BallGlyph';

/**
 * Renders one frame of a play: six position pucks on the court, each
 * showing that role's assigned number/name. In edit mode, tap a puck then
 * tap the court to move it - same pick-up/place interaction as Rotation
 * Builder's formation editor. The ball uses the exact same pick-up/place
 * mechanic and the same movement transition as the pucks - it's just an
 * optional seventh token, with no movement trail of its own.
 *
 * If `previousPositions` is supplied (the prior frame's coordinates), a
 * faint dashed line is drawn from each position's old spot to its current
 * one, so a frame reads as "here's where things moved from" even before
 * you step through the sequence.
 *
 * `options` (this frame's setter reads, if any) fan out as dashed lines
 * from the setter to each listed target, in a distinct muted color so they
 * read as "alternatives available right now" rather than "movement that
 * happened."
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
  const nameLabel = isFullscreen ? 'text-sm sm:text-base mt-1.5' : 'text-[11px] sm:text-xs mt-1';
  const nameLabelWidth = isFullscreen ? 'max-w-[7rem]' : 'max-w-[4.5rem]';
  const hintText = isFullscreen ? 'text-base' : 'text-[11px]';

  function handlePuckClick(positionId) {
    if (!editing) return;
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
              {Array.from({ length: 11 }).map((_, i) => (
                <div
                  key={`gc-${i}`}
                  className="absolute top-0 bottom-0 w-px bg-gold/15"
                  style={{ left: `${((i + 1) / 12) * 100}%` }}
                />
              ))}
              {Array.from({ length: 7 }).map((_, i) => (
                <div
                  key={`gr-${i}`}
                  className="absolute left-0 right-0 h-px bg-gold/15"
                  style={{ top: `${((i + 1) / 8) * 100}%` }}
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
              {DEFAULT_POSITIONS.map((pos) => {
                const from = previousPositions[pos.id];
                const to = frame.positions[pos.id];
                if (!from || !to || (from.col === to.col && from.row === to.row)) return null;
                const a = gridToFraction(from);
                const b = gridToFraction(to);
                const ax = a.x * 150;
                const ay = a.y * 100;
                const bx = b.x * 150;
                const by = b.y * 100;
                // Pull the endpoint back off the destination puck so the
                // arrowhead is visible rather than buried underneath it.
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

          {/* setter's alternate reads for this step, fanning out live -
              a different color/style from the movement trails above so
              "this could go here instead" never reads as "this moved." */}
          {options.length > 0 && setterCell && (
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
                  <path d="M0,0 L6,3 L0,6 Z" fill="var(--color-sub)" fillOpacity="0.9" />
                </marker>
              </defs>
              {options.map((opt) => {
                const to = frame.positions[opt.targetId];
                if (!to) return null;
                const a = gridToFraction(setterCell);
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
                    key={opt.id}
                    x1={ax}
                    y1={ay}
                    x2={ex}
                    y2={ey}
                    stroke="var(--color-sub)"
                    strokeOpacity="0.9"
                    strokeWidth="1"
                    strokeLinecap="round"
                    strokeDasharray="2,2.5"
                    markerEnd={`url(#${optionArrowId})`}
                  />
                );
              })}
            </svg>
          )}
        </div>

        {/* option labels - HTML rather than SVG text so they inherit the
            app's normal typography instead of needing separate SVG font
            styling. Positioned 62% of the way from setter to target so
            they sit near the target puck without overlapping the setter. */}
        {options.map((opt) => {
          const to = frame.positions[opt.targetId];
          if (!setterCell || !to) return null;
          const a = gridToFraction(setterCell);
          const b = gridToFraction(to);
          const lx = a.x + (b.x - a.x) * 0.62;
          const ly = a.y + (b.y - a.y) * 0.62;
          return (
            <div
              key={opt.id}
              className="absolute z-10 -translate-x-1/2 -translate-y-1/2 pointer-events-none text-[9px] sm:text-[10px] font-medium text-sub bg-ink/85 border border-sub/40 rounded px-1 py-0.5 whitespace-nowrap"
              style={{ left: `${lx * 100}%`, top: `${ly * 100}%` }}
            >
              {opt.label}
            </div>
          );
        })}

        {/* position pucks */}
        {DEFAULT_POSITIONS.map((pos) => {
          const cell = frame.positions[pos.id];
          if (!cell) return null;
          const { x, y } = gridToFraction(cell);
          const player = roster[pos.id] || { number: '', name: '' };
          const isPickedUp = pickedUp === pos.id;

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
              </div>
              <span className={`font-medium text-chalk-dim truncate text-center ${nameLabel} ${nameLabelWidth}`}>
                {player.name || pos.label}
              </span>
            </div>
          );
        })}

        {/* ball - same pick-up/place interaction and movement transition as
            the pucks, but no trail line of its own. */}
        {showBall && ball && (
          <div
            className="absolute z-10 transition-all duration-[1400ms] ease-in-out"
            style={{
              left: `${gridToFraction(ball).x * 100}%`,
              top: `${gridToFraction(ball).y * 100}%`,
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
              ? 'Tap anywhere on the court to place the ball there.'
              : 'Tap anywhere on the court to place them there.'}
        </p>
      )}
    </div>
  );
}
