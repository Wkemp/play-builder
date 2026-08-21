import { useEffect, useMemo, useState } from 'react';
import { Users, Pencil, Check, Copy } from 'lucide-react';
import { useLocalStorage } from './hooks/useLocalStorage';
import { createInitialAppData } from './lib/appData';
import { PLAY_SYSTEMS, findPrebuiltPlay } from './lib/prebuiltPlays';
import {
  createBlankPlay,
  duplicatePlay,
  addFrame,
  removeFrame,
  renameFrame,
  updatePositionInFrame,
} from './lib/plays';
import CourtDiagram from './components/CourtDiagram';
import FrameBar from './components/FrameBar';
import PlayLibrary from './components/PlayLibrary';
import RosterEditor from './components/RosterEditor';
import DataTransfer from './components/DataTransfer';

const FIRST_PREBUILT = PLAY_SYSTEMS[0].plays[0];

export default function App() {
  const [appData, setAppData] = useLocalStorage('pb.appData', createInitialAppData);
  const [activePlayId, setActivePlayId] = useState(appData.activePlayId || FIRST_PREBUILT.id);
  const [activeIsCustom, setActiveIsCustom] = useState(appData.activePlayIsCustom || false);
  const [frameIndex, setFrameIndex] = useState(0);
  const [editing, setEditing] = useState(false);
  const [showRoster, setShowRoster] = useState(false);
  const [renamingPlay, setRenamingPlay] = useState(false);
  const [nameDraft, setNameDraft] = useState('');

  const activePlay = useMemo(() => {
    if (activeIsCustom) {
      return appData.customPlays.find((p) => p.id === activePlayId) || null;
    }
    return findPrebuiltPlay(activePlayId);
  }, [activeIsCustom, activePlayId, appData.customPlays]);

  // Fall back to the first prebuilt play if the active one ever disappears
  // (e.g. the custom play it pointed to was deleted, or imported data
  // doesn't include it).
  useEffect(() => {
    if (!activePlay) {
      setActiveIsCustom(false);
      setActivePlayId(FIRST_PREBUILT.id);
    }
  }, [activePlay]);

  useEffect(() => {
    setFrameIndex(0);
    setEditing(false);
  }, [activePlayId]);

  // Remember which play was open across reloads.
  useEffect(() => {
    setAppData((prev) => ({ ...prev, activePlayId, activePlayIsCustom: activeIsCustom }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activePlayId, activeIsCustom]);

  if (!activePlay) return null; // one-render gap while the fallback effect above resolves

  const frame = activePlay.frames[Math.min(frameIndex, activePlay.frames.length - 1)];
  const previousFrame = frameIndex > 0 ? activePlay.frames[frameIndex - 1] : null;

  function updateCustomPlay(updated) {
    setAppData((prev) => ({
      ...prev,
      customPlays: prev.customPlays.map((p) => (p.id === updated.id ? updated : p)),
    }));
  }

  function selectPrebuilt(play) {
    setActiveIsCustom(false);
    setActivePlayId(play.id);
  }

  function selectCustom(playId) {
    setActiveIsCustom(true);
    setActivePlayId(playId);
  }

  function handleDuplicate(play) {
    const copy = duplicatePlay(play);
    setAppData((prev) => ({ ...prev, customPlays: [...prev.customPlays, copy] }));
    setActiveIsCustom(true);
    setActivePlayId(copy.id);
    setEditing(true);
  }

  function handleNewBlank() {
    const blank = createBlankPlay({ name: `New Play ${appData.customPlays.length + 1}` });
    setAppData((prev) => ({ ...prev, customPlays: [...prev.customPlays, blank] }));
    setActiveIsCustom(true);
    setActivePlayId(blank.id);
    setEditing(true);
  }

  function handleDeleteCustom(playId) {
    setAppData((prev) => ({ ...prev, customPlays: prev.customPlays.filter((p) => p.id !== playId) }));
    if (activePlayId === playId) {
      setActiveIsCustom(false);
      setActivePlayId(FIRST_PREBUILT.id);
    }
  }

  function handlePlacePosition(positionId, cell) {
    if (!activeIsCustom) return;
    updateCustomPlay(updatePositionInFrame(activePlay, frame.id, positionId, cell));
  }

  function handleAddFrame(afterId) {
    if (!activeIsCustom) return;
    const insertIndex = activePlay.frames.findIndex((f) => f.id === afterId) + 1;
    updateCustomPlay(addFrame(activePlay, afterId));
    setFrameIndex(insertIndex);
  }

  function handleRemoveFrame(frameId) {
    if (!activeIsCustom) return;
    const removingIndex = activePlay.frames.findIndex((f) => f.id === frameId);
    const updated = removeFrame(activePlay, frameId);
    updateCustomPlay(updated);
    setFrameIndex(Math.max(0, Math.min(removingIndex, updated.frames.length - 1)));
  }

  function handleRenameFrame(frameId, label) {
    if (!activeIsCustom) return;
    updateCustomPlay(renameFrame(activePlay, frameId, label));
  }

  function commitPlayRename() {
    if (nameDraft.trim()) updateCustomPlay({ ...activePlay, name: nameDraft.trim() });
    setRenamingPlay(false);
  }

  function handleImport(imported) {
    setAppData((prev) => ({ ...prev, roster: imported.roster, customPlays: imported.customPlays }));
  }

  return (
    <div className="min-h-screen bg-ink p-4 sm:p-6">
      <header className="flex items-center justify-between gap-3 mb-5 flex-wrap">
        <h1 className="font-display font-bold text-2xl text-chalk tracking-wide">Play Builder</h1>
        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowRoster(true)}
            className="flex items-center gap-1.5 h-9 px-3 rounded-lg text-xs font-medium border border-ink-line bg-ink-raised text-chalk-dim hover:border-gold/50 hover:text-chalk transition-colors"
          >
            <Users size={14} /> Roster
          </button>
          <DataTransfer appData={appData} onImport={handleImport} />
        </div>
      </header>

      <div className="flex flex-col [@media(min-width:64rem)]:flex-row gap-5 items-start">
        <aside className="w-full [@media(min-width:64rem)]:w-72 shrink-0 bg-ink-raised/40 border border-ink-line rounded-lg p-3 [@media(min-width:64rem)]:sticky [@media(min-width:64rem)]:top-4 [@media(min-width:64rem)]:max-h-[calc(100vh-2rem)]">
          <PlayLibrary
            customPlays={appData.customPlays}
            activePlayId={activePlayId}
            onSelectPrebuilt={selectPrebuilt}
            onSelectCustom={selectCustom}
            onDuplicate={handleDuplicate}
            onDelete={handleDeleteCustom}
            onNewBlank={handleNewBlank}
          />
        </aside>

        <main className="flex-1 w-full min-w-0 bg-ink-raised/40 border border-ink-line rounded-lg p-4 sm:p-6">
          <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
            <div className="flex items-center gap-2">
              {renamingPlay ? (
                <div className="flex items-center gap-1">
                  <input
                    autoFocus
                    value={nameDraft}
                    onChange={(e) => setNameDraft(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && commitPlayRename()}
                    className="bg-ink border border-gold/50 rounded px-2 py-1 text-chalk font-display font-semibold"
                  />
                  <button onClick={commitPlayRename} className="text-gold" aria-label="Save play name">
                    <Check size={18} />
                  </button>
                </div>
              ) : (
                <h2 className="font-display font-semibold text-xl text-chalk">{activePlay.name}</h2>
              )}
              {activeIsCustom && !renamingPlay && (
                <button
                  onClick={() => {
                    setNameDraft(activePlay.name);
                    setRenamingPlay(true);
                  }}
                  aria-label="Rename play"
                  className="text-chalk-dim hover:text-gold transition-colors"
                >
                  <Pencil size={14} />
                </button>
              )}
              {!activeIsCustom && (
                <span className="text-[10px] uppercase tracking-widest text-chalk-dim/60 bg-ink px-2 py-0.5 rounded-full">
                  Prebuilt
                </span>
              )}
            </div>

            {activeIsCustom ? (
              <button
                onClick={() => setEditing((e) => !e)}
                className={`h-9 px-3 rounded-lg text-xs font-medium border transition-colors ${
                  editing
                    ? 'bg-gold text-ink border-gold'
                    : 'bg-ink-raised text-chalk-dim border-ink-line hover:border-gold/50 hover:text-chalk'
                }`}
              >
                {editing ? 'Done Editing' : 'Edit Positions'}
              </button>
            ) : (
              <button
                onClick={() => handleDuplicate(activePlay)}
                className="flex items-center gap-1.5 h-9 px-3 rounded-lg text-xs font-medium border border-ink-line bg-ink-raised text-chalk-dim hover:border-gold/50 hover:text-chalk transition-colors"
              >
                <Copy size={13} /> Duplicate to Edit
              </button>
            )}
          </div>

          <CourtDiagram
            frame={frame}
            previousPositions={previousFrame?.positions || null}
            roster={appData.roster}
            editing={editing && activeIsCustom}
            onPlacePosition={handlePlacePosition}
          />

          <div className="mt-5">
            <FrameBar
              frames={activePlay.frames}
              activeIndex={Math.min(frameIndex, activePlay.frames.length - 1)}
              onSelectIndex={setFrameIndex}
              editable={activeIsCustom}
              onAddFrame={handleAddFrame}
              onRemoveFrame={handleRemoveFrame}
              onRenameFrame={handleRenameFrame}
            />
          </div>
        </main>
      </div>

      {showRoster && (
        <RosterEditor
          roster={appData.roster}
          onChange={(roster) => setAppData((prev) => ({ ...prev, roster }))}
          onClose={() => setShowRoster(false)}
        />
      )}
    </div>
  );
}
