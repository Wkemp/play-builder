import { useRef, useState } from 'react';
import { gridToFraction, fractionToGrid } from '../lib/court';
import { DEFAULT_POSITIONS } from '../lib/positions';

/**
 * Renders one frame of a play: six position pucks on the court, each
 * showing that role's assigned number/name. In edit mode, tap a puck then
 * tap the court to move it - same pick-up/place interaction as Rotation
 * Builder's formation editor.
 *
 * If `previousPositions` is supplied (the prior frame's coordinates), a
 * faint dashed line is drawn from each position's old spot to its current
 * one, so a frame reads as "here's where things moved from" even before
 * you step through the sequence.
 */
export default function CourtDiagram({
  frame,
  previousPositions = null,
  roster,
  editing = false,
  onPlacePosition,
  isFullscreen = false,
}) {
  const [pickedUp, setPickedUp] = useState(null);
  const courtRef = useRef(null);

  const puckSize = isFullscreen
    ? 'w-20 h-20 sm:w-24 sm:h-24 text-2xl sm:text-3xl'
    : 'w-12 h-12 sm:w-14 sm:h-14 text-lg sm:text-xl';
  const nameLabel = isFullscreen ? 'text-sm sm:text-base mt-1.5' : 'text-[11px] sm:text-xs mt-1';
  const nameLabelWidth = isFullscreen ? 'max-w-[7rem]' : 'max-w-[4.5rem]';
  const hintText = isFullscreen ? 'text-base' : 'text-[11px]';

  function handlePuckClick(positionId) {
    if (!editing) return;
    setPickedUp((prev) => (prev === positionId ? null : positionId));
  }

  function handleCourtClick(e) {
    if (!editing || pickedUp === null || !courtRef.current) return;
    const rect = courtRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    onPlacePosition?.(pickedUp, fractionToGrid(x, y));
    setPickedUp(null);
  }

  return (
    <div className="w-full select-none">
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

          {/* movement trails from the previous frame, drawn under the pucks */}
          {previousPositions && (
            <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
              {DEFAULT_POSITIONS.map((pos) => {
                const from = previousPositions[pos.id];
                const to = frame.positions[pos.id];
                if (!from || !to || (from.col === to.col && from.row === to.row)) return null;
                const a = gridToFraction(from);
                const b = gridToFraction(to);
                return (
                  <line
                    key={pos.id}
                    x1={a.x * 100}
                    y1={a.y * 100}
                    x2={b.x * 100}
                    y2={b.y * 100}
                    stroke="var(--color-gold)"
                    strokeOpacity="0.5"
                    strokeWidth="0.6"
                    strokeDasharray="2,1.5"
                    vectorEffect="non-scaling-stroke"
                  />
                );
              })}
            </svg>
          )}
        </div>

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
              className={`absolute flex flex-col items-center transition-all duration-700 ease-out z-10 ${
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
      </div>

      {editing && (
        <p className={`mt-2 text-gold text-center ${hintText}`}>
          {pickedUp === null
            ? 'Tap a player, then tap where they should stand for this step.'
            : 'Tap anywhere on the court to place them there.'}
        </p>
      )}
    </div>
  );
}
