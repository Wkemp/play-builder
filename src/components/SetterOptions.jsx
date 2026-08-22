import { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { DEFAULT_POSITIONS } from '../lib/positions';

/**
 * A step can have more than one live look for the setter - "quick to MB1
 * or combo to OH1," say. Each option is just a target role plus a short
 * label; CourtDiagram fans a dashed line out to each target from wherever
 * the setter is standing that step.
 */
export default function SetterOptions({ options, editable, onAdd, onRemove, positions = DEFAULT_POSITIONS }) {
  const targetPositions = positions.filter((p) => p.id !== 'S');
  const [targetId, setTargetId] = useState(targetPositions[0].id);
  const [label, setLabel] = useState('');

  function handleAdd() {
    if (!label.trim()) return;
    onAdd({ targetId, label: label.trim() });
    setLabel('');
  }

  return (
    <div>
      {options.length === 0 && !editable && (
        <p className="text-xs text-chalk-dim/50 italic">No alternate options for this step.</p>
      )}

      {options.length > 0 && (
        <ul className="flex flex-wrap gap-1.5 mb-2">
          {options.map((opt) => (
            <li
              key={opt.id}
              className="flex items-center gap-1.5 text-xs bg-ink border border-sub/40 text-sub rounded-full pl-2.5 pr-1.5 py-1"
            >
              <span className="text-chalk-dim">
                {targetPositions.find((p) => p.id === opt.targetId)?.label || opt.targetId}:
              </span>
              {opt.label}
              {editable && (
                <button
                  onClick={() => onRemove(opt.id)}
                  aria-label={`Remove option ${opt.label}`}
                  className="text-chalk-dim hover:text-serve transition-colors"
                >
                  <Trash2 size={11} />
                </button>
              )}
            </li>
          ))}
        </ul>
      )}

      {editable && (
        <div className="flex items-center gap-2">
          <select
            value={targetId}
            onChange={(e) => setTargetId(e.target.value)}
            className="bg-ink border border-ink-line rounded px-2 py-1.5 text-sm text-chalk shrink-0"
          >
            {targetPositions.map((p) => (
              <option key={p.id} value={p.id}>
                {p.label}
              </option>
            ))}
          </select>
          <input
            type="text"
            placeholder="e.g. Quick 1"
            value={label}
            onChange={(e) => setLabel(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
            className="flex-1 min-w-0 bg-ink border border-ink-line rounded px-2 py-1.5 text-sm text-chalk"
          />
          <button
            onClick={handleAdd}
            aria-label="Add option"
            className="flex items-center justify-center w-9 h-9 rounded-md bg-ink-raised border border-ink-line text-chalk-dim hover:border-sub/50 hover:text-sub transition-colors shrink-0"
          >
            <Plus size={15} />
          </button>
        </div>
      )}
    </div>
  );
}
