import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Download, Upload, Trash2, Lock, Send } from 'lucide-react';
import { useStore } from '../../store/useStore';
import { hapticTap } from '../../utils/haptics';
import { requestNotificationPermission } from '../../utils/reminders';
import { fileToDataUrl } from '../../utils/fileVault';
import toast from 'react-hot-toast';

const sections = [
  { id: 'profile', label: 'Profile' },
  { id: 'security', label: 'Security' },
  { id: 'ai', label: 'Smart Features' },
  { id: 'display', label: 'Display' },
  { id: 'data', label: 'Data & Storage' },
];

// A printed-form checkbox: ink square, fills vermilion when checked.
function InkCheck({ value, onChange }: { value: boolean; onChange: () => void }) {
  return (
    <button
      onClick={() => { hapticTap(); onChange(); }}
      role="switch"
      aria-checked={value}
      className={`haptic w-5 h-5 border-[1.5px] rounded-sm flex-shrink-0 flex items-center justify-center transition-all active:scale-90 ${
        value
          ? 'bg-[var(--accent)] border-[var(--accent)]'
          : 'bg-transparent border-[var(--ink)] hover:border-[var(--accent)]'
      }`}
    >
      {value && (
        <svg viewBox="0 0 12 12" className="w-3 h-3" fill="none">
          <path d="M2 6.5L4.8 9L10 3" stroke="#fffdf7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
    </button>
  );
}

// A settings line item: text left, control right, dotted rule between rows.
function Row({ title, detail, children }: { title: string; detail: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-6 py-4 border-b border-dotted border-[var(--ink-line)] last:border-b-0">
      <div className="min-w-0">
        <p className="text-ink text-sm font-medium">{title}</p>
        <p className="text-ink-faint text-xs mt-0.5 leading-relaxed">{detail}</p>
      </div>
      {children}
    </div>
  );
}

export default function SettingsModal() {
  const {
    isSettingsModalOpen,
    setSettingsModalOpen,
    settingsSection,
    settings,
    updateSettings,
    exportContent,
    importContent,
    deleteAllContent,
    user,
    content,
    getSecurityScore,
    isEncryptionSetup,
    setEncryptionModalOpen,
    lock,
    logout,
    setUser,
    setLegendOpen,
  } = useStore();

  const [activeSection, setActiveSection] = React.useState('profile');
  const [editingProfile, setEditingProfile] = React.useState(false);
  const [draftName, setDraftName] = React.useState('');
  const [draftEmail, setDraftEmail] = React.useState('');
  const saveProfile = () => {
    if (!draftName.trim() || !user) return;
    setUser({ ...user, name: draftName.trim(), email: draftEmail.trim() });
    setEditingProfile(false);
    toast.success('Profile updated');
  };
  const importInputRef = React.useRef<HTMLInputElement>(null);
  const securityScore = getSecurityScore();

  // How full the notebook is. IndexedDB quotas run to gigabytes; ask the
  // browser for the real numbers instead of assuming a ceiling.
  const [storage, setStorage] = React.useState<{ usedKB: number; capKB: number; pct: number } | null>(null);
  const [durable, setDurable] = React.useState<boolean | null>(null);
  React.useEffect(() => {
    if (!isSettingsModalOpen) return;
    let alive = true;
    navigator.storage?.estimate?.().then(({ usage, quota }) => {
      if (!alive || !quota) return;
      const usedKB = Math.round((usage ?? 0) / 1024);
      const capKB = Math.round(quota / 1024);
      setStorage({ usedKB, capKB, pct: Math.min(100, Math.max(usedKB > 0 ? 1 : 0, Math.round((usedKB / capKB) * 100))) });
    }).catch(() => setStorage(null));
    navigator.storage?.persisted?.().then(p => { if (alive) setDurable(p); }).catch(() => setDurable(null));
    return () => { alive = false; };
  }, [content.length, isSettingsModalOpen]);

  const askForDurable = async () => {
    hapticTap();
    const granted = await navigator.storage?.persist?.().catch(() => false);
    setDurable(!!granted);
    if (granted) toast.success('The browser agreed: this notebook will not be evicted.');
    else toast('The browser declined for now. Using the app more, or installing it, usually earns it.');
  };

  // Open on the section requested by the caller (e.g. Profile → Privacy & Security).
  React.useEffect(() => {
    if (isSettingsModalOpen) {
      setActiveSection(settingsSection || 'profile');
    }
  }, [isSettingsModalOpen, settingsSection]);

  React.useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setSettingsModalOpen(false);
    };
    if (isSettingsModalOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isSettingsModalOpen, setSettingsModalOpen]);

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target?.result as string);
        const count = importContent(data);
        if (count > 0) {
          toast.success(`Imported ${count} item${count !== 1 ? 's' : ''}`);
        } else {
          toast('No new items to import. Duplicates are skipped.');
        }
      } catch {
        toast.error('That file is not a supermind JSON export');
      }
    };
    reader.readAsText(file);
  };

  const handleExportMarkdown = () => {
    const items = [...content].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
    const lines = [`# supermind`, '', `Exported ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })} · ${items.length} entries`, ''];
    for (const item of items) {
      lines.push(`## ${item.timestamp.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })} · ${item.contentType}`);
      lines.push('');
      lines.push(item.contentText);
      if (item.tags.length) {
        lines.push('');
        lines.push(item.tags.map(t => `#${t}`).join(' '));
      }
      lines.push('');
      lines.push('---');
      lines.push('');
    }
    const blob = new Blob([lines.join('\n')], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `supermind-${new Date().toISOString().slice(0, 10)}.md`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Markdown downloaded');
  };

  // The whole notebook as one file, handed straight to AirDrop or the share
  // sheet. Device to device, no server ever in the middle.
  const handlePassNotebook = async () => {
    hapticTap();
    // Drawer files ride along inlined, so the notebook travels whole.
    const items = await Promise.all(content.map(async (item) => {
      if (!item.fileKey) return item;
      const inlined = await fileToDataUrl(item.fileKey).catch(() => null);
      const { fileKey, ...rest } = item;
      void fileKey;
      return inlined ? { ...rest, fileUrl: inlined } : item;
    }));
    const payload = {
      app: 'supermind',
      version: 1,
      exportedAt: new Date().toISOString(),
      owner: user?.name ?? '',
      items,
    };
    const json = JSON.stringify(payload, null, 2);
    useStore.getState().markExported();
    const file = new File([json], `supermind-notebook-${new Date().toISOString().slice(0, 10)}.json`, { type: 'application/json' });
    if (navigator.canShare?.({ files: [file] })) {
      try {
        await navigator.share({ files: [file], title: 'supermind notebook' });
        return;
      } catch {
        // fall through to download when the user closes the sheet
      }
    }
    const url = URL.createObjectURL(file);
    const a = document.createElement('a');
    a.href = url;
    a.download = file.name;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Notebook saved as a file. Move it to the other device and import.');
  };

  const handleEraseNotebook = () => {
    if (!window.confirm('Erase this notebook? Your profile, settings, and all ' + content.length + ' entries will be gone from this device. Export a backup first if anything matters.')) {
      return;
    }
    logout();
  };

  const handleDeleteAll = () => {
    if (!window.confirm(`Permanently delete all ${content.length} items? This cannot be undone. Consider exporting a backup first.`)) {
      return;
    }
    deleteAllContent();
    toast.success('All content deleted');
  };

  const renderProfile = () => (
    <div>
      <p className="font-label text-[9px] text-ink-faint mb-1">this notebook belongs to</p>
      {editingProfile ? (
        <div className="space-y-3 mb-2 max-w-xs">
          <input
            autoFocus
            value={draftName}
            onChange={(e) => setDraftName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && saveProfile()}
            placeholder="Your name"
            className="bare-input font-display text-3xl w-full bg-transparent text-ink outline-none border-b-2 border-[var(--accent)] pb-1 caret-[var(--accent)]"
          />
          <input
            value={draftEmail}
            onChange={(e) => setDraftEmail(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && saveProfile()}
            placeholder="email, optional"
            className="bare-input font-mono text-xs w-full bg-transparent text-ink-soft outline-none border-b border-[var(--ink-line)] focus:border-[var(--accent)] pb-1"
          />
          <div className="flex gap-3 pt-1">
            <button onClick={saveProfile} className="btn-ink haptic px-4 py-1.5 rounded-sm text-xs font-semibold">Save</button>
            <button onClick={() => setEditingProfile(false)} className="font-label text-[9px] text-ink-faint hover:text-ink transition-colors">cancel</button>
          </div>
        </div>
      ) : (
        <>
          <h3 className="font-display text-3xl text-ink mb-1">
            <span className="marker">{user?.name || 'You'}</span>
            <button
              onClick={() => { setDraftName(user?.name ?? ''); setDraftEmail(user?.email ?? ''); setEditingProfile(true); }}
              className="haptic font-label text-[9px] text-ink-faint hover:text-accent transition-colors ml-3 align-middle"
            >
              edit
            </button>
          </h3>
          {user?.email && <p className="font-mono text-xs text-ink-soft">{user.email}</p>}
        </>
      )}
      <p className="font-label text-[9px] text-accent mt-3">local profile · data stays on this device</p>

      <div className="grid grid-cols-3 border-y-2 border-[var(--ink)] divide-x divide-[var(--ink-line)] mt-8">
        {[
          { label: 'entries', value: content.length },
          { label: 'starred', value: content.filter(c => c.isFavorite).length },
          {
            label: 'avg tags',
            value: content.length > 0
              ? Math.round(content.reduce((acc, c) => acc + c.tags.length, 0) / content.length)
              : 0,
          },
        ].map((stat) => (
          <div key={stat.label} className="py-4 px-4 first:pl-0">
            <p className="font-display text-3xl text-ink tabular-nums leading-none">{stat.value}</p>
            <p className="font-label text-[8px] text-ink-faint mt-1.5">{stat.label}</p>
          </div>
        ))}
      </div>
    </div>
  );

  const renderSecurity = () => (
    <div>
      {/* The seal — score as a printed figure */}
      <div className="flex items-end justify-between mb-2">
        <div>
          <p className="font-label text-[9px] text-ink-faint mb-1">security score</p>
          <p className="font-display text-5xl text-ink leading-none tabular-nums">
            {securityScore}
            <span className="text-xl text-ink-faint">/100</span>
          </p>
        </div>
        <span className={`stamp ${securityScore >= 80 ? '!border-[var(--accent)] !text-[var(--accent)]' : ''}`}>
          {settings.security.encryptionEnabled ? 'Sealed' : 'Open'}
        </span>
      </div>
      <div className="h-[3px] bg-[var(--ink-line)] mb-1">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${securityScore}%` }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className="h-full bg-[var(--accent)]"
        />
      </div>
      <p className="font-label text-[8px] text-ink-faint mb-6">
        aes-256-gcm at rest · key from your passphrase (pbkdf2, 250k) · no servers, ever
      </p>

      <Row
        title="Encryption at rest"
        detail={settings.security.encryptionEnabled
          ? 'Your content is encrypted with AES-256-GCM before it touches storage.'
          : 'Encrypt your content with a passphrase only you know.'}
      >
        {settings.security.encryptionEnabled ? (
          <span className="font-label text-[9px] text-accent flex-shrink-0">active</span>
        ) : (
          <button
            onClick={() => {
              setSettingsModalOpen(false);
              setEncryptionModalOpen(true);
            }}
            className="btn-ink haptic px-4 py-1.5 rounded-sm text-xs font-semibold flex-shrink-0"
          >
            Enable
          </button>
        )}
      </Row>

      {settings.security.encryptionEnabled && isEncryptionSetup && (
        <Row title="Lock now" detail="Clears the key from memory. You'll need your passphrase to get back in.">
          <button
            onClick={() => { lock(); setSettingsModalOpen(false); }}
            className="btn-paper haptic px-4 py-1.5 rounded-sm text-xs font-semibold flex items-center gap-1.5 flex-shrink-0"
          >
            <Lock size={12} /> Lock
          </button>
        </Row>
      )}

      <Row
        title="Auto-lock"
        detail={settings.security.encryptionEnabled
          ? 'Automatically lock the workspace after inactivity.'
          : 'Requires encryption to be enabled.'}
      >
        <InkCheck
          value={settings.security.autoLock}
          onChange={() => updateSettings({
            security: { ...settings.security, autoLock: !settings.security.autoLock },
          })}
        />
      </Row>

      {settings.security.autoLock && (
        <Row title="Auto-lock after" detail={`Locks after ${settings.security.autoLockTimeout} minutes of inactivity.`}>
          <select
            value={settings.security.autoLockTimeout}
            onChange={(e) => updateSettings({
              security: { ...settings.security, autoLockTimeout: parseInt(e.target.value) },
            })}
            className="font-mono text-xs bg-transparent text-ink border-[1.5px] border-[var(--ink)] rounded-sm px-2 py-1 flex-shrink-0"
          >
            <option value={5}>5 min</option>
            <option value={15}>15 min</option>
            <option value={30}>30 min</option>
            <option value={60}>1 hour</option>
          </select>
        </Row>
      )}

      {!settings.security.encryptionEnabled && (
        <div className="mt-6 border-l-2 border-[var(--accent)] pl-4">
          <p className="font-label text-[9px] text-accent mb-1">recommendation</p>
          <p className="text-ink-soft text-xs leading-relaxed">
            Enable encryption at rest so your content is unreadable even if someone gains
            access to this device's browser storage.
          </p>
        </div>
      )}
    </div>
  );

  const renderAi = () => (
    <div>
      {([
        { key: 'autoTagging' as const, label: 'Auto-tagging', desc: 'Generate tags from content as you save it.' },
        { key: 'smartSummaries' as const, label: 'Smart summaries', desc: 'Extract a short summary from each longer item.' },
        { key: 'contentSuggestions' as const, label: 'Suggestions', desc: 'Show related items and review suggestions in the Almanac.' },
      ]).map(({ key, label, desc }) => (
        <Row key={key} title={label} detail={desc}>
          <InkCheck
            value={settings.ai[key]}
            onChange={() => updateSettings({ ai: { ...settings.ai, [key]: !settings.ai[key] } })}
          />
        </Row>
      ))}
      <Row
        title="Smart reminders"
        detail="Notice deadlines in your notes, surface them in the bell, and ring a system notification when one comes due while the notebook is open."
      >
        <InkCheck
          value={settings.notifications.reminders}
          onChange={async () => {
            const turningOn = !settings.notifications.reminders;
            updateSettings({
              notifications: { ...settings.notifications, reminders: turningOn },
            });
            if (turningOn) {
              const granted = await requestNotificationPermission();
              if (!granted) toast('Reminders will show in the bell. Allow notifications for a proper ring.');
            }
          }}
        />
      </Row>
      <p className="font-label text-[9px] text-ink-faint mt-5">
        all processing runs on your device. nothing is sent to any server.
      </p>
    </div>
  );

  const renderDisplay = () => (
    <div>
      <p className="font-label text-[9px] text-ink-soft mb-3">paper stock</p>
      <div className="grid grid-cols-3 gap-3 mb-8">
        {[
          { value: 'light', label: 'Daylight', swatch: '#faf6ec' },
          { value: 'dark', label: 'Midnight', swatch: '#14120d' },
          { value: 'system', label: 'System', swatch: 'linear-gradient(135deg, #faf6ec 50%, #14120d 50%)' },
        ].map(({ value, label, swatch }) => {
          const active = settings.theme === value;
          return (
            <button
              key={value}
              onClick={() => {
                hapticTap();
                updateSettings({ theme: value as 'light' | 'dark' | 'system' });
              }}
              className={`haptic rounded-sm border-[1.5px] p-3 flex flex-col items-center gap-2 transition-all active:translate-y-[1px] ${
                active
                  ? 'border-[var(--accent)] shadow-[3px_3px_0_var(--accent)]'
                  : 'border-[var(--ink-line)] hover:border-[var(--ink)]'
              }`}
            >
              <span
                className="w-full h-10 rounded-sm border border-[var(--ink-line)]"
                style={{ background: swatch }}
              />
              <span className={`font-label text-[9px] ${active ? 'text-accent' : 'text-ink-soft'}`}>
                {label}
              </span>
            </button>
          );
        })}
      </div>

      {([
        { key: 'showPreviews' as const, label: 'Show previews', desc: 'Display image and media previews in the book.' },
        { key: 'animationsEnabled' as const, label: 'Animations', desc: 'Enable smooth transitions and motion.' },
      ]).map(({ key, label, desc }) => (
        <Row key={key} title={label} detail={desc}>
          <InkCheck
            value={settings.display[key]}
            onChange={() => updateSettings({ display: { ...settings.display, [key]: !settings.display[key] } })}
          />
        </Row>
      ))}

      <Row title="Dot, the librarian" detail="A small companion who suggests the next move. Blinks. Means well.">
        <InkCheck
          value={settings.display.companion !== false}
          onChange={() => updateSettings({ display: { ...settings.display, companion: settings.display.companion === false } })}
        />
      </Row>

      <Row title="Open the notebook to" detail="The page you land on when supermind starts.">
        <div className="flex flex-shrink-0">
          {([['home', "today's page"], ['timeline', 'the book']] as const).map(([key, label]) => (
            <button
              key={key}
              onClick={() => { hapticTap(); updateSettings({ display: { ...settings.display, startPage: key } }); }}
              className={`haptic font-label text-[9px] px-3 py-1.5 border-[1.5px] border-ink first:rounded-l-sm last:rounded-r-sm last:border-l-0 transition-colors ${
                (settings.display.startPage ?? 'home') === key ? 'bg-ink text-paper' : 'bg-transparent text-ink-soft hover:text-ink'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </Row>

      <Row title="Keyboard shortcuts" detail="Every key the notebook answers to.">
        <button
          onClick={() => { setSettingsModalOpen(false); setLegendOpen(true); }}
          className="btn-paper haptic px-4 py-1.5 rounded-sm text-xs font-semibold flex-shrink-0"
        >
          The legend
        </button>
      </Row>
    </div>
  );

  const renderData = () => (
    <div>
      {storage && (
        <div className="mb-6">
          <div className="flex items-baseline justify-between mb-1.5">
            <p className="font-label text-[9px] text-ink-soft">notebook weight</p>
            <p className="font-label text-[9px] text-ink-faint tabular-nums">
              {storage.usedKB < 1024 ? `${storage.usedKB} KB` : `${(storage.usedKB / 1024).toFixed(1)} MB`} of{' '}
              {storage.capKB < 1024 * 1024 ? `${Math.round(storage.capKB / 1024)} MB` : `${(storage.capKB / (1024 * 1024)).toFixed(0)} GB`} available
            </p>
          </div>
          <div className="h-[5px] border border-ink rounded-full overflow-hidden bg-paper-raised">
            <div className="h-full bg-accent transition-all" style={{ width: `${Math.max(1, storage.pct)}%` }} />
          </div>
          <p className="font-label text-[8px] text-ink-faint mt-1.5">
            everything lives on this device. an occasional export is your fire safe.
          </p>
          {durable !== null && (
            <p className="font-label text-[8px] mt-1 flex items-center gap-2">
              {durable ? (
                <span className="text-ink-faint">the browser has promised not to evict this storage</span>
              ) : (
                <>
                  <span className="text-accent">storage is provisional; the browser may reclaim it</span>
                  <button onClick={askForDurable} className="text-ink underline underline-offset-2 hover:text-accent transition-colors">
                    ask it to keep this safe
                  </button>
                </>
              )}
            </p>
          )}
        </div>
      )}

      <Row title="Pass to another device" detail={`Hands the whole notebook to AirDrop or your share sheet. Open supermind on the other device and import it.${settings.security.encryptionEnabled ? ' The file itself is readable ink, not ciphertext; treat it like the open notebook.' : ''}`}>
        <button
          onClick={handlePassNotebook}
          className="btn-ink haptic px-4 py-1.5 rounded-sm text-xs font-semibold flex items-center gap-1.5 flex-shrink-0"
        >
          <Send size={12} /> Pass it
        </button>
      </Row>

      <Row title="Export everything" detail={`Download all ${content.length} items as a JSON backup.${settings.security.encryptionEnabled ? ' Backups are readable ink, not ciphertext; store them somewhere you trust.' : ''}`}>
        <button
          onClick={() => { exportContent(); toast.success('Backup downloaded'); }}
          className="btn-paper haptic px-4 py-1.5 rounded-sm text-xs font-semibold flex items-center gap-1.5 flex-shrink-0"
        >
          <Download size={12} /> Export
        </button>
      </Row>

      <Row title="Export as Markdown" detail="A plain .md file of every entry, readable anywhere, forever.">
        <button
          onClick={handleExportMarkdown}
          className="btn-paper haptic px-4 py-1.5 rounded-sm text-xs font-semibold flex items-center gap-1.5 flex-shrink-0"
        >
          <Download size={12} /> Markdown
        </button>
      </Row>

      <Row title="Import a backup" detail="Restore a previously exported supermind JSON file. Duplicates are skipped.">
        <input
          ref={importInputRef}
          type="file"
          accept=".json,application/json"
          onChange={handleImport}
          className="hidden"
        />
        <button
          onClick={() => importInputRef.current?.click()}
          className="btn-paper haptic px-4 py-1.5 rounded-sm text-xs font-semibold flex items-center gap-1.5 flex-shrink-0"
        >
          <Upload size={12} /> Import
        </button>
      </Row>

      <div className="mt-8 border-[1.5px] border-red-600/60 rounded-sm p-4 relative">
        <span className="stamp !border-red-600 !text-red-600 absolute -top-3 left-4 bg-[var(--paper-raised)]">
          Danger
        </span>
        <div className="flex items-center justify-between gap-6 pt-1 pb-4 border-b border-dotted border-[var(--ink-line)]">
          <p className="text-ink-faint text-xs leading-relaxed">
            Delete every entry, but keep your profile and settings.
          </p>
          <button
            onClick={handleDeleteAll}
            className="haptic px-4 py-1.5 rounded-sm text-xs font-semibold border-[1.5px] border-red-600 text-red-600 hover:bg-red-600 hover:text-white transition-colors flex items-center gap-1.5 flex-shrink-0 active:translate-y-[1px]"
          >
            <Trash2 size={12} /> Delete entries
          </button>
        </div>
        <div className="flex items-center justify-between gap-6 pt-4">
          <p className="text-ink-faint text-xs leading-relaxed">
            Erase the whole notebook: profile, settings, and every entry. Back to the blank first page.
          </p>
          <button
            onClick={handleEraseNotebook}
            className="haptic px-4 py-1.5 rounded-sm text-xs font-semibold border-[1.5px] border-red-600 text-red-600 hover:bg-red-600 hover:text-white transition-colors flex items-center gap-1.5 flex-shrink-0 active:translate-y-[1px]"
          >
            <Trash2 size={12} /> Erase notebook
          </button>
        </div>
      </div>
    </div>
  );

  const renderSection = () => {
    switch (activeSection) {
      case 'profile': return renderProfile();
      case 'security': return renderSecurity();
      case 'ai': return renderAi();
      case 'display': return renderDisplay();
      default: return renderData();
    }
  };

  return (
    <AnimatePresence>
      {isSettingsModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"
            onClick={() => setSettingsModalOpen(false)}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.98, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: 12 }}
            className="card-ink-static relative w-full max-w-3xl max-h-[88vh] rounded-sm flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-7 pt-5 pb-4 border-b border-[var(--ink-line)] flex-shrink-0">
              <div>
                <p className="font-label text-[9px] text-ink-faint">the fine print</p>
                <h2 className="font-display text-2xl text-ink leading-tight">
                  Adjustments<span className="text-accent">.</span>
                </h2>
              </div>
              <button
                onClick={() => setSettingsModalOpen(false)}
                className="text-ink-faint hover:text-ink transition-colors"
                aria-label="Close settings"
              >
                <X size={18} />
              </button>
            </div>

            <div className="flex flex-col md:flex-row min-h-0 flex-1">
              {/* Index */}
              <div className="md:w-48 flex-shrink-0 border-b md:border-b-0 md:border-r border-[var(--ink-line)] px-4 py-4 flex md:flex-col gap-1 overflow-x-auto">
                {sections.map(({ id, label }) => {
                  const active = activeSection === id;
                  return (
                    <button
                      key={id}
                      onClick={() => { hapticTap(); setActiveSection(id); }}
                      className={`haptic relative text-left px-3 py-2 rounded-sm font-label text-[10px] whitespace-nowrap transition-colors ${
                        active ? 'text-accent bg-[var(--accent-soft)]' : 'text-ink-soft hover:text-ink'
                      }`}
                    >
                      {active && (
                        <motion.span
                          layoutId="settings-rule"
                          className="absolute left-0 top-1 bottom-1 w-[3px] bg-[var(--accent)] rounded-full hidden md:block"
                        />
                      )}
                      {label}
                    </button>
                  );
                })}
              </div>

              {/* Page */}
              <div className="flex-1 overflow-y-auto custom-scrollbar px-7 py-6">
                <motion.div
                  key={activeSection}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.18 }}
                >
                  {renderSection()}
                </motion.div>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
