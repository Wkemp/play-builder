import { useRef, useState } from 'react';
import { Download, Upload } from 'lucide-react';

function downloadJson(data, filename) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export default function DataTransfer({ appData, onImport }) {
  const fileInputRef = useRef(null);
  const [status, setStatus] = useState(null);

  async function handleFileSelected(e) {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      if (!parsed.roster || !Array.isArray(parsed.customPlays)) {
        throw new Error('not a playbook file');
      }
      onImport(parsed);
      setStatus({ success: true, message: 'Playbook imported.' });
    } catch {
      setStatus({ success: false, message: "That file doesn't look like a Play Builder export." });
    }
  }

  const buttonClass =
    'flex items-center gap-1.5 h-9 px-3 rounded-lg text-xs font-medium border border-ink-line bg-ink-raised text-chalk-dim hover:border-gold/50 hover:text-chalk transition-colors';

  return (
    <div className="flex flex-col items-end gap-1">
      <div className="flex gap-2">
        <button
          onClick={() => {
            downloadJson(appData, 'play-builder-playbook.json');
            setStatus({ success: true, message: 'Playbook downloaded.' });
          }}
          className={buttonClass}
        >
          <Download size={13} /> Export
        </button>
        <button onClick={() => fileInputRef.current?.click()} className={buttonClass}>
          <Upload size={13} /> Import
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="application/json,.json"
          onChange={handleFileSelected}
          className="hidden"
        />
      </div>
      {status && (
        <p className={`text-[11px] ${status.success ? 'text-chalk-dim' : 'text-serve'}`}>{status.message}</p>
      )}
    </div>
  );
}
