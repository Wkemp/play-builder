import { useState } from 'react';
import { ChevronLeft, ChevronRight, Plus, Trash2, Pencil, Check } from 'lucide-react';

/**
 * Step-through control for a play's frames: prev/next buttons, a row of
 * tappable step dots (so you can jump straight to a step, not just walk
 * sequentially), and add/rename/delete for editing the sequence itself.
 */
export default function FrameBar({
  frames,
  activeIndex,
  onSelectIndex,
  editable = false,
  onAddFrame,
  onRemoveFrame,
  onRenameFrame,
}) {
  const [renamingId, setRenamingId] = useState(null);
  const [draftLabel, setDraftLabel] = useState('');

  const active = frames[activeIndex];

  function startRename(frame) {
    setRenamingId(frame.id);
    setDraftLabel(frame.label);
  }

  function commitRename() {
    if (renamingId && draftLabel.trim()) {
      onRenameFrame?.(renamingId, draftLabel.trim());
    }
    setRenamingId(null);
  }

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="flex items-center gap-2">
        <button
          onClick={() => onSelectIndex(Math.max(0, activeIndex - 1))}
          disabled={activeIndex === 0}
          aria-label="Previous step"
          className="flex items-center justify-center w-9 h-9 rounded-full bg-ink-raised border border-ink-line text-chalk-dim hover:border-gold/50 hover:text-chalk transition-colors disabled:opacity-30 disabled:hover:border-ink-line disabled:hover:text-chalk-dim"
        >
          <ChevronLeft size={16} />
        </button>

        <div className="flex items-center gap-1.5 px-1">
          {frames.map((f, i) => (
            <button
              key={f.id}
              onClick={() => onSelectIndex(i)}
              aria-label={`Go to ${f.label}`}
              className={`w-2.5 h-2.5 rounded-full transition-colors ${
                i === activeIndex ? 'bg-gold' : 'bg-ink-line hover:bg-chalk-dim'
              }`}
            />
          ))}
        </div>

        <button
          onClick={() => onSelectIndex(Math.min(frames.length - 1, activeIndex + 1))}
          disabled={activeIndex === frames.length - 1}
          aria-label="Next step"
          className="flex items-center justify-center w-9 h-9 rounded-full bg-ink-raised border border-ink-line text-chalk-dim hover:border-gold/50 hover:text-chalk transition-colors disabled:opacity-30 disabled:hover:border-ink-line disabled:hover:text-chalk-dim"
        >
          <ChevronRight size={16} />
        </button>
      </div>

      <div className="flex items-center gap-2">
        {renamingId === active.id ? (
          <div className="flex items-center gap-1">
            <input
              autoFocus
              value={draftLabel}
              onChange={(e) => setDraftLabel(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && commitRename()}
              className="bg-ink-raised border border-gold/50 rounded px-2 py-0.5 text-sm text-chalk font-display w-32"
            />
            <button onClick={commitRename} className="text-gold" aria-label="Save step name">
              <Check size={16} />
            </button>
          </div>
        ) : (
          <span className="font-display font-semibold text-chalk-dim text-sm">{active.label}</span>
        )}

        {editable && renamingId !== active.id && (
          <>
            <button
              onClick={() => startRename(active)}
              aria-label="Rename step"
              className="text-chalk-dim hover:text-gold transition-colors"
            >
              <Pencil size={13} />
            </button>
            <button
              onClick={() => onAddFrame(active.id)}
              aria-label="Add step after this one"
              className="text-chalk-dim hover:text-gold transition-colors"
            >
              <Plus size={15} />
            </button>
            {frames.length > 1 && (
              <button
                onClick={() => onRemoveFrame(active.id)}
                aria-label="Delete this step"
                className="text-chalk-dim hover:text-serve transition-colors"
              >
                <Trash2 size={13} />
              </button>
            )}
          </>
        )}
      </div>
    </div>
  );
}
