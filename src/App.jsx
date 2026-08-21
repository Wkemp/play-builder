import { useEffect, useMemo, useState } from 'react';
import { Users, Pencil, Check, Copy, Printer, PanelLeftClose, PanelLeftOpen, GitBranch, Tag } from 'lucide-react';
import { useLocalStorage } from './hooks/useLocalStorage';
import { createInitialAppData } from './lib/appData';
import { PLAY_SYSTEMS, findPrebuiltPlay } from './lib/prebuiltPlays';
import {
  createBlankPlay,
  duplicatePlay,
  addFrame,
  removeFrame,
  renameFrame,
  updateFrameNotes,
  updatePlaySystem,
  updatePositionInFrame,
  updateBallInFrame,
  clearBallInFrame,
  addOption,
  removeOption,
} from './lib/plays';
import CourtDiagram from './components/CourtDiagram';
import FrameBar from './components/FrameBar';
import PlayLibrary from './components/PlayLibrary';
import RosterEditor from './components/RosterEditor';
import DataTransfer from './components/DataTransfer';
import PlayCheatSheet from './components/PlayCheatSheet';
import BallGlyph from './components/BallGlyph';
import SetterOptions from './components/SetterOptions';

const FIRST_PREBUILT = PLAY_SYSTEMS[0].plays[0];

export default function App() {
  const [appData, setAppData] = useLocalStorage('pb.appData', createInitialAppData);
  const [activePlayId, setActivePlayId] = useState(appData.activePlayId || FIRST_PREBUILT.id);
  const [activeIsCustom, setActiveIsCustom] = useState(appData.activePlayIsCustom || false);
  const [frameIndex, setFrameIndex] = useState(0);
  const [editing, setEditing] = useState(false);
  const [showRoster, setShowRoster] = useState(false);
  const [showCheatSheet, setShowCheatSheet] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useLocalStorage('pb.sidebarCollapsed', () => false);
  const [showBall, setShowBall] = useLocalStorage('pb.showBall', () => true);
  const [showOptionLines, setShowOptionLines] = useLocalStorage('pb.showOptionLines', () => true);
  const [showOptionLabels, setShowOptionLabels] = useLocalStorage('pb.showOptionLabels', () => true);
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

  function handleNotesChange(notes) {
    if (!activeIsCustom) return;
    updateCustomPlay(updateFrameNotes(activePlay, frame.id, notes));
  }

  function handlePlaceBall(cell) {
    if (!activeIsCustom) return;
    updateCustomPlay(updateBallInFrame(activePlay, frame.id, cell));
  }

  function handleRemoveBall() {
    if (!activeIsCustom) return;
    updateCustomPlay(clearBallInFrame(activePlay, frame.id));
  }

  function handleAddOption(opt) {
    if (!activeIsCustom) return;
    updateCustomPlay(addOption(activePlay, frame.id, opt));
  }

  function handleRemoveOption(optionId) {
    if (!activeIsCustom) return;
    updateCustomPlay(removeOption(activePlay, frame.id, optionId));
  }

  function commitPlayRename() {
    if (nameDraft.trim()) updateCustomPlay({ ...activePlay, name: nameDraft.trim() });
    setRenamingPlay(false);
  }

  function handleSystemChange(systemId) {
    if (!activeIsCustom) return;
    updateCustomPlay(updatePlaySystem(activePlay, systemId));
  }

  function handleImport(imported) {
    setAppData((prev) => ({ ...prev, roster: imported.roster, customPlays: imported.customPlays }));
  }

  return (
    <div className="min-h-screen bg-ink p-4 sm:p-6">
      <header className="flex items-center justify-between gap-3 mb-5 flex-wrap">
        <h1 className="font-display font-bold text-2xl text-chalk tracking-wide">Play Builder</h1>
        <div className="flex items-center gap-2 flex-wrap justify-end">
          <button
            onClick={() => setShowBall((v) => !v)}
            aria-pressed={showBall}
            className={`flex items-center gap-1.5 h-9 px-3 rounded-lg text-xs font-medium border transition-colors ${
              showBall
                ? 'bg-gold text-ink border-gold'
                : 'bg-ink-raised text-chalk-dim border-ink-line hover:border-gold/50 hover:text-chalk'
            }`}
          >
            <BallGlyph className="w-3.5 h-3.5" /> Ball
          </button>
          <button
            onClick={() => setShowOptionLines((v) => !v)}
            aria-pressed={showOptionLines}
            title="Show or hide setter option lines on the court diagram"
            className={`flex items-center gap-1.5 h-9 px-3 rounded-lg text-xs font-medium border transition-colors ${
              showOptionLines
                ? 'bg-sub-bright text-ink border-sub-bright'
                : 'bg-ink-raised text-chalk-dim border-ink-line hover:border-sub-bright/50 hover:text-chalk'
            }`}
          >
            <GitBranch size={14} /> Lines
          </button>
          <button
            onClick={() => setShowOptionLabels((v) => !v)}
            aria-pressed={showOptionLabels}
            title="Show or hide setter option text on the court diagram"
            className={`flex items-center gap-1.5 h-9 px-3 rounded-lg text-xs font-medium border transition-colors ${
              showOptionLabels
                ? 'bg-sub-bright text-ink border-sub-bright'
                : 'bg-ink-raised text-chalk-dim border-ink-line hover:border-sub-bright/50 hover:text-chalk'
            }`}
          >
            <Tag size={14} /> Text
          </button>
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
        <aside
          className={`shrink-0 bg-ink-raised/40 border border-ink-line rounded-lg [@media(min-width:64rem)]:sticky [@media(min-width:64rem)]:top-4 [@media(min-width:64rem)]:max-h-[calc(100vh-2rem)] transition-[width] duration-200 ${
            sidebarCollapsed
              ? 'w-full [@media(min-width:64rem)]:w-12 p-2'
              : 'w-full [@media(min-width:64rem)]:w-72 p-3'
          }`}
        >
          <button
            onClick={() => setSidebarCollapsed((c) => !c)}
            aria-label={sidebarCollapsed ? 'Expand play library' : 'Collapse play library'}
            className={`flex items-center gap-1.5 text-chalk-dim hover:text-gold transition-colors ${
              sidebarCollapsed ? 'w-full justify-center py-1' : 'mb-2 text-xs'
            }`}
          >
            {sidebarCollapsed ? (
              <PanelLeftOpen size={16} />
            ) : (
              <>
                <PanelLeftClose size={14} /> Collapse
              </>
            )}
          </button>

          {!sidebarCollapsed && (
            <PlayLibrary
              customPlays={appData.customPlays}
              activePlayId={activePlayId}
              onSelectPrebuilt={selectPrebuilt}
              onSelectCustom={selectCustom}
              onDuplicate={handleDuplicate}
              onDelete={handleDeleteCustom}
              onNewBlank={handleNewBlank}
            />
          )}
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
              {activeIsCustom && (
                <select
                  value={activePlay.system || ''}
                  onChange={(e) => handleSystemChange(e.target.value)}
                  aria-label="Designed for system"
                  className="text-[11px] bg-ink border border-ink-line rounded-full px-2 py-1 text-chalk-dim focus:outline-none focus:border-gold/50"
                >
                  <option value="">No system</option>
                  {PLAY_SYSTEMS.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.label}
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setShowCheatSheet(true)}
                className="flex items-center gap-1.5 h-9 px-3 rounded-lg text-xs font-medium border border-ink-line bg-ink-raised text-chalk-dim hover:border-gold/50 hover:text-chalk transition-colors"
              >
                <Printer size={13} /> Cheat Sheet
              </button>
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
          </div>

          <CourtDiagram
            frame={frame}
            previousPositions={previousFrame?.positions || null}
            roster={appData.roster}
            editing={editing && activeIsCustom}
            onPlacePosition={handlePlacePosition}
            ball={frame.ball || null}
            showBall={showBall}
            onPlaceBall={handlePlaceBall}
            onRemoveBall={handleRemoveBall}
            options={frame.options || []}
            showOptionLines={showOptionLines}
            showOptionLabels={showOptionLabels}
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

          <div className="mt-4">
            <label className="block text-[10px] uppercase tracking-widest text-chalk-dim/70 font-display mb-1.5">
              Notes for &ldquo;{frame.label}&rdquo;
            </label>
            {activeIsCustom ? (
              <textarea
                value={frame.notes || ''}
                onChange={(e) => handleNotesChange(e.target.value)}
                placeholder="What is each position doing during this step?"
                rows={3}
                className="w-full bg-ink border border-ink-line rounded-md px-3 py-2 text-sm text-chalk placeholder:text-chalk-dim/50 focus:outline-none focus:border-gold/50 resize-y"
              />
            ) : frame.notes ? (
              <p className="text-sm text-chalk-dim leading-relaxed bg-ink border border-ink-line rounded-md px-3 py-2">
                {frame.notes}
              </p>
            ) : (
              <p className="text-xs text-chalk-dim/50 italic">No notes for this step.</p>
            )}
          </div>

          <div className="mt-4">
            <label className="block text-[10px] uppercase tracking-widest text-chalk-dim/70 font-display mb-1.5">
              Setter Options for &ldquo;{frame.label}&rdquo;
            </label>
            <SetterOptions
              options={frame.options || []}
              editable={activeIsCustom}
              onAdd={handleAddOption}
              onRemove={handleRemoveOption}
            />
          </div>
        </main>
      </div>

      {showCheatSheet && (
        <PlayCheatSheet
          play={activePlay}
          roster={appData.roster}
          showBall={showBall}
          onClose={() => setShowCheatSheet(false)}
        />
      )}

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
