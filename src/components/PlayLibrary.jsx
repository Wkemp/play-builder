import { useState } from 'react';
import { Copy, Trash2, Plus, Lock } from 'lucide-react';
import { PLAY_SYSTEMS } from '../lib/prebuiltPlays';

const CUSTOM_TAB = 'custom';

function systemLabel(systemId) {
  return PLAY_SYSTEMS.find((s) => s.id === systemId)?.label || null;
}

/**
 * Left-hand library: tabs for each prebuilt system plus "My Plays" for
 * everything custom, regardless of what system (if any) it's tagged for.
 * The system tag is just a badge here for reference/sorting-by-eye - it's
 * set from the play editor itself, not by which tab you created it in.
 */
export default function PlayLibrary({
  customPlays,
  activePlayId,
  onSelectPrebuilt,
  onSelectCustom,
  onDuplicate,
  onDelete,
  onNewBlank,
}) {
  const [tab, setTab] = useState(PLAY_SYSTEMS[0].id);
  const activeSystem = PLAY_SYSTEMS.find((s) => s.id === tab);

  return (
    <div className="flex flex-col h-full min-h-0">
      <div className="flex gap-1 mb-3 overflow-x-auto pb-1">
        {PLAY_SYSTEMS.map((s) => (
          <button
            key={s.id}
            onClick={() => setTab(s.id)}
            className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-display font-semibold tracking-wide transition-colors ${
              tab === s.id ? 'bg-gold text-ink' : 'bg-ink-raised text-chalk-dim hover:text-chalk'
            }`}
          >
            {s.label}
          </button>
        ))}
        <button
          onClick={() => setTab(CUSTOM_TAB)}
          className={`shrink-0 px-3 py-1.5 rounded-full text-xs font-display font-semibold tracking-wide transition-colors ${
            tab === CUSTOM_TAB ? 'bg-gold text-ink' : 'bg-ink-raised text-chalk-dim hover:text-chalk'
          }`}
        >
          My Plays
        </button>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto">
        {tab === CUSTOM_TAB ? (
          <div className="flex flex-col gap-1.5">
            <button
              onClick={onNewBlank}
              className="flex items-center gap-2 px-3 py-2 rounded-md border border-dashed border-ink-line text-chalk-dim hover:border-gold/50 hover:text-gold transition-colors text-sm"
            >
              <Plus size={14} /> New blank play
            </button>
            {customPlays.length === 0 && (
              <p className="text-chalk-dim/60 text-xs px-1 py-2">
                Nothing here yet - start blank, or duplicate a play from one of the system tabs.
              </p>
            )}
            {customPlays.map((p) => (
              <div
                key={p.id}
                className={`flex items-center gap-1 rounded-md ${
                  p.id === activePlayId ? 'bg-ink-raised ring-1 ring-gold/40' : 'hover:bg-ink-raised'
                }`}
              >
                <button
                  onClick={() => onSelectCustom(p.id)}
                  className="flex-1 min-w-0 flex items-center gap-1.5 text-left px-3 py-2 text-sm text-chalk"
                >
                  <span className="truncate">{p.name}</span>
                  {systemLabel(p.system) && (
                    <span className="shrink-0 text-[9px] font-display font-semibold uppercase tracking-wide text-gold/80 bg-gold/10 rounded-full px-1.5 py-0.5">
                      {systemLabel(p.system)}
                    </span>
                  )}
                </button>
                <button
                  onClick={() => onDuplicate(p)}
                  aria-label={`Duplicate ${p.name}`}
                  className="p-1.5 text-chalk-dim hover:text-gold transition-colors"
                >
                  <Copy size={13} />
                </button>
                <button
                  onClick={() => onDelete(p.id)}
                  aria-label={`Delete ${p.name}`}
                  className="p-1.5 mr-1 text-chalk-dim hover:text-serve transition-colors"
                >
                  <Trash2 size={13} />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div>
            <p className="text-chalk-dim/70 text-xs px-1 mb-2">{activeSystem.description}</p>
            <div className="flex flex-col gap-1.5">
              {activeSystem.plays.map((p) => (
                <div
                  key={p.id}
                  className={`flex items-center gap-1 rounded-md ${
                    p.id === activePlayId ? 'bg-ink-raised ring-1 ring-gold/40' : 'hover:bg-ink-raised'
                  }`}
                >
                  <button
                    onClick={() => onSelectPrebuilt(p)}
                    className="flex-1 min-w-0 flex items-center gap-1.5 text-left px-3 py-2 text-sm text-chalk truncate"
                  >
                    <Lock size={10} className="text-chalk-dim/50 shrink-0" />
                    {p.name}
                  </button>
                  <button
                    onClick={() => onDuplicate(p)}
                    aria-label={`Duplicate ${p.name}`}
                    className="p-1.5 mr-1 text-chalk-dim hover:text-gold transition-colors"
                  >
                    <Copy size={13} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
