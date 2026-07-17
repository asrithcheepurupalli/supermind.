import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Paperclip, Loader2, FileText, Film, Music } from 'lucide-react';
import toast from 'react-hot-toast';
import { SavedContent } from '../types';
import { hapticSuccess, hapticTap } from '../utils/haptics';
import { clientSideAI } from '../utils/clientSideAI';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddContent: (content: SavedContent) => Promise<void> | void;
}

// Files up to this size are embedded as data URLs so they survive reloads.
const MAX_EMBED_SIZE = 1.5 * 1024 * 1024;

const newId = () =>
  `item_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;

interface StagedFile {
  key: string;
  file: File;
  kind: SavedContent['contentType'];
  thumb?: string;
  tooBig: boolean;
}

// What the librarian will do with the page, computed as you write.
interface ReadingNotes {
  tags: string[];
  category: string;
  reminder?: Date;
  linkInside?: string;
}

const formatSize = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const reminderLabel = (d: Date) => {
  const now = new Date();
  const tomorrow = new Date(now);
  tomorrow.setDate(now.getDate() + 1);
  const time = d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }).toLowerCase();
  if (d.toDateString() === now.toDateString()) return `today ${time}`;
  if (d.toDateString() === tomorrow.toDateString()) return `tomorrow ${time}`;
  return `${d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} ${time}`;
};

// "A fresh page": writing-first capture. One big serif page — write, paste a
// link, attach or drop files. Everything on the page files together, and a
// pencil line below the ink shows how the librarian is reading it.
export default function UploadModal({ isOpen, onClose, onAddContent }: UploadModalProps) {
  const [dragActive, setDragActive] = React.useState(false);
  const [isProcessing, setIsProcessing] = React.useState(false);
  const [stamped, setStamped] = React.useState(false);
  const [textInput, setTextInput] = React.useState('');
  const [linkInput, setLinkInput] = React.useState('');
  const [staged, setStaged] = React.useState<StagedFile[]>([]);
  const [notes, setNotes] = React.useState<ReadingNotes | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    if (!isOpen) return;
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // The librarian reads over your shoulder, a beat behind the pen.
  React.useEffect(() => {
    const text = textInput.trim();
    const raw = linkInput.trim();
    if (!text && !raw) { setNotes(null); return; }
    const t = setTimeout(() => {
      const combined = [text, raw].filter(Boolean).join('\n\n');
      const allTags = clientSideAI.generateTags(combined, 'text');
      const tags = allTags.filter(tag => !['text', 'link', 'quick-note', 'long-form', 'contains-link'].includes(tag)).slice(0, 4);
      setNotes({
        tags,
        category: clientSideAI.suggestCategory(combined, allTags),
        reminder: clientSideAI.suggestReminderDate(combined),
        linkInside: !raw ? text.match(/https?:\/\/\S+/)?.[0] : undefined,
      });
    }, 220);
    return () => clearTimeout(t);
  }, [textInput, linkInput]);

  const readFileAsDataURL = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(reader.error);
      reader.readAsDataURL(file);
    });

  const readFileAsText = (file: File): Promise<string> =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = () => reject(reader.error);
      reader.readAsText(file);
    });

  const getContentType = (mimeType: string): SavedContent['contentType'] => {
    if (mimeType.startsWith('image/')) return 'image';
    if (mimeType.startsWith('video/')) return 'video';
    if (mimeType.startsWith('audio/')) return 'audio';
    if (mimeType.includes('pdf')) return 'pdf';
    return 'text';
  };

  // Attachments wait on the page as tipped-in slips until you file everything.
  const stageFiles = async (files: File[]) => {
    const additions = await Promise.all(files.map(async (file): Promise<StagedFile> => {
      const kind = getContentType(file.type);
      const tooBig = file.size > MAX_EMBED_SIZE;
      let thumb: string | undefined;
      if (kind === 'image' && !tooBig) {
        try { thumb = await readFileAsDataURL(file); } catch { thumb = undefined; }
      }
      return { key: newId(), file, kind, thumb, tooBig };
    }));
    setStaged(prev => [...prev, ...additions]);
  };

  const fileAttachment = async (s: StagedFile) => {
    let fileUrl: string | undefined;
    let contentText = s.file.name;

    if (s.kind === 'text' && !s.tooBig) {
      try {
        contentText = `${s.file.name}\n\n${await readFileAsText(s.file)}`;
      } catch {
        contentText = s.file.name;
      }
    } else if (!s.tooBig) {
      fileUrl = await readFileAsDataURL(s.file);
    } else {
      toast(`"${s.file.name}" is over 1.5MB, so only its name was filed (local storage keeps things small).`);
    }

    await onAddContent({
      id: newId(),
      contentText,
      contentType: s.kind,
      sourceApp: 'Upload',
      timestamp: new Date(),
      tags: [],
      summary: '',
      fileUrl,
      userId: 'local',
      category: 'articles',
      isFavorite: false,
      metadata: { fileSize: s.file.size },
    });
  };

  // One submission, everything on the page gets filed. Text and a link
  // together become one note carrying the link; nothing typed is ever
  // silently discarded.
  const handleSubmit = async () => {
    const text = textInput.trim();
    const raw = linkInput.trim();
    if ((!text && !raw && staged.length === 0) || isProcessing) return;

    let url: string | null = null;
    let hostname = '';
    if (raw) {
      // Browsers quietly percent-encode spaces instead of rejecting them, so
      // new URL() alone is not enough: no whitespace, and the host needs a dot.
      const withProtocol = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
      try {
        if (/\s/.test(raw)) throw new Error('whitespace');
        const parsed = new URL(withProtocol);
        if (!parsed.hostname.includes('.') && parsed.hostname !== 'localhost') throw new Error('no dot');
        hostname = parsed.hostname;
        url = withProtocol;
      } catch {
        toast.error("That doesn't look like a URL. Fix it or clear the link field.");
        return;
      }
    }

    setIsProcessing(true);
    try {
      if (text && url) {
        await onAddContent({
          id: newId(),
          contentText: `${text}\n\n${url}`,
          contentType: 'text',
          sourceApp: hostname,
          timestamp: new Date(),
          tags: [],
          summary: '',
          userId: 'local',
          category: 'personal',
          isFavorite: false,
        });
      } else if (url) {
        await onAddContent({
          id: newId(),
          contentText: url,
          contentType: 'link',
          sourceApp: hostname,
          timestamp: new Date(),
          tags: [],
          summary: '',
          userId: 'local',
          category: 'articles',
          isFavorite: false,
        });
      } else if (text) {
        await onAddContent({
          id: newId(),
          contentText: text,
          contentType: 'text',
          sourceApp: 'Note',
          timestamp: new Date(),
          tags: [],
          summary: '',
          userId: 'local',
          category: 'personal',
          isFavorite: false,
        });
      }

      for (const s of staged) {
        await fileAttachment(s);
      }

      hapticSuccess();
      setStamped(true);
      window.setTimeout(() => {
        setTextInput('');
        setLinkInput('');
        setStaged([]);
        setStamped(false);
        setIsProcessing(false);
        onClose();
      }, 620);
    } catch (error) {
      console.error('Failed to file the page:', error);
      toast.error('Something went wrong while filing. Nothing was cleared.');
      setIsProcessing(false);
    }
  };

  const wordCount = textInput.trim() ? textInput.trim().split(/\s+/).length : 0;
  const canFile = (textInput.trim().length > 0 || linkInput.trim().length > 0 || staged.length > 0) && !isProcessing;
  // A shorter page on phones keeps the File it button above the keyboard.
  const compact = typeof window !== 'undefined' && window.matchMedia('(max-width: 639px)').matches;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          style={{ paddingTop: 'calc(env(safe-area-inset-top, 0px) + 0.5rem)' }}
          className="fixed inset-0 bg-black/40 backdrop-blur-[2px] z-50 flex items-start sm:items-center justify-center p-2 sm:p-4"
          onClick={onClose}
          onDragEnter={(e) => { e.preventDefault(); setDragActive(true); }}
        >
          <motion.div
            initial={{ y: 26, scale: 0.97, opacity: 0 }}
            animate={{ y: 0, scale: 1, opacity: 1 }}
            exit={{ y: 14, scale: 0.98, opacity: 0 }}
            transition={{ type: 'spring', stiffness: 380, damping: 30 }}
            onClick={(e) => e.stopPropagation()}
            onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
            onDragLeave={(e) => { e.preventDefault(); setDragActive(false); }}
            onDrop={async (e) => {
              e.preventDefault();
              setDragActive(false);
              const files = Array.from(e.dataTransfer.files);
              if (files.length > 0) await stageFiles(files);
            }}
            onPaste={(e) => {
              const files = Array.from(e.clipboardData.files);
              if (files.length > 0) {
                e.preventDefault();
                stageFiles(files);
              }
            }}
            className={`card-ink-static w-full max-w-2xl rounded-sm relative transition-all max-h-[94dvh] overflow-y-auto custom-scrollbar ${
              dragActive ? 'outline outline-2 outline-[var(--accent)] outline-offset-4' : ''
            }`}
          >
            {/* FILED, with a thump */}
            <AnimatePresence>
              {stamped && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute inset-0 z-20 flex items-center justify-center pointer-events-none"
                >
                  <motion.span
                    initial={{ scale: 2.1, rotate: -18, opacity: 0 }}
                    animate={{ scale: 1, rotate: -8, opacity: 1 }}
                    transition={{ type: 'spring', stiffness: 520, damping: 21 }}
                    className="font-label text-2xl tracking-[0.3em] text-accent border-[3px] border-[var(--accent)] rounded-sm px-6 py-2.5 bg-paper/85"
                  >
                    FILED
                  </motion.span>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Page header */}
            <div className="flex items-center justify-between px-7 pt-5 pb-4 border-b border-[var(--ink-line)]">
              <span className="font-label text-[10px] text-ink-faint">
                a fresh page · {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' }).toLowerCase()} ·{' '}
                {new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }).toLowerCase()}
              </span>
              <button onClick={onClose} className="text-ink-faint hover:text-ink transition-colors" aria-label="Close">
                <X size={16} />
              </button>
            </div>

            {/* The writing surface */}
            <div className="px-7 pt-6 pb-2 ruled">
              <textarea
                autoFocus
                value={textInput}
                onChange={(e) => setTextInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                    e.preventDefault();
                    handleSubmit();
                  }
                }}
                placeholder="Write your thoughts, notes, or ideas..."
                rows={compact ? 4 : 6}
                className="bare-input font-display text-2xl leading-[32px] w-full bg-transparent text-ink placeholder:text-[var(--ink-faint)] outline-none resize-none caret-[var(--accent)]"
              />
            </div>

            {/* The librarian's pencil line: how this page will be filed */}
            <div className="px-7 min-h-[26px] pb-1">
              <AnimatePresence mode="wait">
                {notes && (
                  <motion.div
                    key={[notes.category, ...notes.tags, notes.reminder ? 'r' : '', notes.linkInside ?? ''].join('|')}
                    initial={{ opacity: 0, y: 3 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.16 }}
                    className="flex items-center gap-x-3 gap-y-1 flex-wrap font-label text-[8px] text-ink-faint"
                  >
                    <span className="text-ink-soft border border-[var(--ink-line)] rounded-[2px] px-1.5 py-0.5 uppercase">
                      {notes.category}
                    </span>
                    {notes.tags.map(tag => (
                      <span key={tag} className="text-accent">#{tag}</span>
                    ))}
                    {notes.reminder && (
                      <span>reminder · {reminderLabel(notes.reminder)}</span>
                    )}
                    {notes.linkInside && (
                      <span>carries a link</span>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Or a link */}
            <div className="px-7 pb-2 flex items-center gap-3">
              <span className="font-label text-[9px] text-ink-faint flex-shrink-0">or a link</span>
              <input
                type="url"
                value={linkInput}
                onChange={(e) => setLinkInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                placeholder="https://example.com"
                className="bare-input flex-1 bg-transparent text-ink text-sm placeholder:text-[var(--ink-faint)] outline-none border-b border-[var(--ink-line)] focus:border-[var(--accent)] transition-colors pb-1"
              />
            </div>

            {/* Attachments wait as tipped-in slips */}
            <AnimatePresence>
              {staged.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <div className="px-7 pt-2 pb-3 flex flex-wrap gap-3">
                    {staged.map((s, i) => (
                      <motion.div
                        key={s.key}
                        initial={{ opacity: 0, scale: 0.9, rotate: -3 }}
                        animate={{ opacity: 1, scale: 1, rotate: i % 2 === 0 ? -0.8 : 0.7 }}
                        transition={{ type: 'spring', stiffness: 420, damping: 24 }}
                        className="relative bg-paper-raised border-[1.5px] border-ink shadow-[3px_3px_0_var(--offset-shadow)] p-1.5 pr-6 flex items-center gap-2"
                      >
                        {s.thumb ? (
                          <img src={s.thumb} alt="" className="w-9 h-9 object-cover border border-[var(--ink-line)]" />
                        ) : (
                          <span className="w-9 h-9 flex items-center justify-center border border-[var(--ink-line)] text-ink-soft">
                            {s.kind === 'video' ? <Film size={14} /> : s.kind === 'audio' ? <Music size={14} /> : <FileText size={14} />}
                          </span>
                        )}
                        <div className="min-w-0">
                          <p className="font-label text-[8px] text-ink max-w-[130px] truncate">{s.file.name}</p>
                          <p className="font-label text-[7px] text-ink-faint uppercase">
                            {formatSize(s.file.size)}{s.tooBig ? ' · name only' : ''}
                          </p>
                        </div>
                        <button
                          onClick={() => { hapticTap(); setStaged(prev => prev.filter(f => f.key !== s.key)); }}
                          aria-label={`Remove ${s.file.name}`}
                          className="absolute top-1 right-1 text-ink-faint hover:text-accent transition-colors"
                        >
                          <X size={10} />
                        </button>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Footer: attach + file it */}
            <div className="flex items-center justify-between px-7 py-4 border-t border-[var(--ink-line)]">
              <div className="flex items-center gap-4">
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="font-label text-[9px] text-ink-soft hover:text-accent transition-colors flex items-center gap-1.5"
                >
                  <Paperclip size={11} /> attach anything
                </button>
                <span className="font-label text-[8px] text-ink-faint hidden sm:block">
                  {wordCount > 0 ? `${wordCount} word${wordCount === 1 ? '' : 's'} of ink` : 'or drop a file on the page'}
                </span>
                <input
                  ref={fileInputRef}
                  type="file"
                  multiple
                  onChange={async (e) => {
                    const files = e.target.files ? Array.from(e.target.files) : [];
                    e.target.value = '';
                    if (files.length > 0) await stageFiles(files);
                  }}
                  className="hidden"
                />
              </div>
              <div className="flex items-center gap-3">
                <kbd className="keycap hidden sm:inline-flex text-[9px] !py-0.5 !px-1.5">⌘↵</kbd>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={handleSubmit}
                  disabled={!canFile}
                  className="btn-ink haptic px-6 py-2.5 rounded-sm font-semibold text-sm disabled:opacity-30 disabled:pointer-events-none inline-flex items-center gap-2"
                >
                  {isProcessing ? <Loader2 size={14} className="animate-spin" /> : null}
                  File it{staged.length > 0 ? ` (+${staged.length})` : ''}
                </motion.button>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
