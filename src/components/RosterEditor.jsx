import { DEFAULT_POSITIONS } from '../lib/positions';

/**
 * Sets the number/name shown on each position's puck. One roster for the
 * whole app - every play draws the same six roles, so updating "who's MB1
 * today" here updates every play's diagram at once.
 */
export default function RosterEditor({ roster, onChange, onClose }) {
  function updateField(positionId, field, value) {
    onChange({ ...roster, [positionId]: { ...roster[positionId], [field]: value } });
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink/80 p-4" onClick={onClose}>
      <div
        className="bg-ink-raised border border-ink-line rounded-lg p-5 w-full max-w-md max-h-[85vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 className="font-display font-semibold text-lg text-chalk mb-1">Roster</h2>
        <p className="text-chalk-dim text-xs mb-4">
          Assign the players currently running these roles. Every play uses these six spots.
        </p>

        <div className="flex flex-col gap-3">
          {DEFAULT_POSITIONS.map((pos) => (
            <div key={pos.id} className="flex items-center gap-3">
              <span className="w-16 shrink-0 font-data text-xs text-gold uppercase tracking-wide">
                {pos.id}
              </span>
              <input
                type="text"
                inputMode="numeric"
                placeholder="#"
                value={roster[pos.id]?.number || ''}
                onChange={(e) => updateField(pos.id, 'number', e.target.value)}
                className="w-14 bg-ink border border-ink-line rounded px-2 py-1.5 text-chalk font-data text-sm text-center"
              />
              <input
                type="text"
                placeholder={pos.label}
                value={roster[pos.id]?.name || ''}
                onChange={(e) => updateField(pos.id, 'name', e.target.value)}
                className="flex-1 min-w-0 bg-ink border border-ink-line rounded px-2 py-1.5 text-chalk text-sm"
              />
            </div>
          ))}
        </div>

        <button
          onClick={onClose}
          className="mt-5 w-full bg-gold text-ink font-display font-semibold rounded py-2 hover:bg-gold-dim transition-colors"
        >
          Done
        </button>
      </div>
    </div>
  );
}
