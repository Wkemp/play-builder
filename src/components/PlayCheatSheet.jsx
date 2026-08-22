import { Printer, X } from 'lucide-react';
import { gridToFraction } from '../lib/court';
import { DEFAULT_POSITIONS } from '../lib/positions';
import BallGlyph from './BallGlyph';

// Fixed visual size for print pucks, independent of GRID_COLS/GRID_ROWS
// (the live placement grid). Placement precision and puck visual size are
// different concerns - a finer placement grid shouldn't shrink the printed
// pucks. Sized as roughly 1/9 of court width x 1/6 of court height, which
// reads as "about a third of a rotational zone" - a size tuned by eye
// rather than derived from grid math.
const PUCK_WIDTH_PCT = 100 / 9;
const PUCK_HEIGHT_PCT = 100 / 6;

/** One small static court diagram for a single step of the play, printer-
 * friendly (black/white), with that step's notes underneath. */
function MiniCourt({ frame, roster, showBall }) {
  return (
    <div className="border-2 border-gray-400 rounded-md p-2 print:p-3 flex flex-col print:break-inside-avoid">
      <div className="mb-1.5 print:mb-2">
        <span className="font-display font-semibold text-sm print:text-lg">{frame.label}</span>
      </div>
      <div className="relative w-full aspect-[3/2] border border-black rounded">
        {/* net: a bold line is enough at this size */}
        <div className="absolute -top-1 left-0 right-0 h-[3px] bg-black rounded-full" />
        {/* thin court guide lines */}
        <div className="absolute left-0 right-0 top-1/2 h-px bg-gray-300" />
        <div className="absolute top-0 bottom-0 left-1/3 w-px bg-gray-200" />
        <div className="absolute top-0 bottom-0 left-2/3 w-px bg-gray-200" />

        {DEFAULT_POSITIONS.map((pos) => {
          const cell = frame.positions[pos.id];
          if (!cell) return null;
          const { x, y } = gridToFraction(cell);
          const player = roster[pos.id] || { number: '', name: '' };

          return (
            <div
              key={pos.id}
              className="absolute flex items-center justify-center rounded-full text-[10px] print:text-base font-data font-bold border-[1.5px] border-black bg-white text-black"
              style={{
                left: `${x * 100}%`,
                top: `${y * 100}%`,
                width: `${PUCK_WIDTH_PCT}%`,
                height: `${PUCK_HEIGHT_PCT}%`,
                transform: 'translate(-50%, -50%)',
              }}
            >
              {player.number || pos.id}
            </div>
          );
        })}
        {showBall && frame.ball && (() => {
          const targetCell = frame.ball.attachedTo ? frame.positions[frame.ball.attachedTo] : frame.ball;
          if (!targetCell) return null;
          const { x, y } = gridToFraction(targetCell);
          // Attached: nudge up half a puck-height so the ball sits at the
          // puck's top edge rather than dead-center on top of the number.
          const yOffset = frame.ball.attachedTo ? PUCK_HEIGHT_PCT / 2 / 100 : 0;
          return (
            <div
              className="absolute"
              style={{
                left: `${x * 100}%`,
                top: `${(y - yOffset) * 100}%`,
                width: `${PUCK_WIDTH_PCT * 0.55}%`,
                height: `${PUCK_HEIGHT_PCT * 0.55}%`,
                transform: 'translate(-50%, -50%)',
              }}
            >
              <BallGlyph className="w-full h-full" />
            </div>
          );
        })()}
      </div>
      {frame.notes && (
        <div className="mt-1.5 print:mt-2 text-[10px] print:text-[12px] text-gray-700 leading-snug whitespace-pre-wrap">
          {frame.notes}
        </div>
      )}
    </div>
  );
}

/**
 * Full cheat sheet for one play: every step laid out as a static mini-court
 * with its notes below, formatted to print. `.printable` (defined in
 * index.css) hides everything else on the page when the browser print
 * dialog opens, so only this content ends up on paper.
 */
export default function PlayCheatSheet({ play, roster, showBall = true, onClose }) {
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-ink/90 print:static print:bg-transparent print:overflow-visible">
      <div className="max-w-5xl mx-auto p-4 print:p-0 print:max-w-none">
        <div className="flex items-center justify-between mb-4 print:hidden">
          <h2 className="font-display font-semibold text-lg text-chalk">Cheat Sheet</h2>
          <div className="flex gap-2">
            <button
              onClick={() => window.print()}
              className="flex items-center gap-1.5 h-9 px-3 rounded-lg text-xs font-medium bg-gold text-ink hover:bg-gold-dim transition-colors"
            >
              <Printer size={14} /> Print
            </button>
            <button
              onClick={onClose}
              aria-label="Close cheat sheet"
              className="flex items-center gap-1.5 h-9 px-3 rounded-lg text-xs font-medium border border-ink-line bg-ink-raised text-chalk-dim hover:text-chalk transition-colors"
            >
              <X size={14} /> Close
            </button>
          </div>
        </div>

        <div className="printable bg-white text-black rounded-lg print:rounded-none p-4 print:p-0">
          <div className="flex items-baseline justify-between mb-4 border-b-2 border-black pb-2 print:mb-3 print:pb-2">
            <h2 className="font-display text-2xl font-semibold print:text-3xl">{play.name}</h2>
            <span className="text-xs text-gray-500 print:text-sm">
              {play.frames.length} step{play.frames.length > 1 ? 's' : ''}
            </span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 print:grid-cols-3 print:gap-3">
            {play.frames.map((frame) => (
              <MiniCourt key={frame.id} frame={frame} roster={roster} showBall={showBall} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
