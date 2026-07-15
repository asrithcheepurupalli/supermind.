import React from 'react';
import { X, Paperclip, Loader2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { SavedContent } from '../types';
import { hapticSuccess } from '../utils/haptics';

interface UploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddContent: (content: SavedContent) => Promise<void> | void;
}

// Files up to this size are embedded as data URLs so they survive reloads.
const MAX_EMBED_SIZE = 1.5 * 1024 * 1024;

const newId = () =>
  `item_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;

// "A fresh page": writing-first capture. One big serif page — write, paste a
// link, or drop a file anywhere on it. No tiles, no forms.
export default function UploadModal({ isOpen, onClose, onAddContent }: UploadModalProps) {
  const [dragActive, setDragActive] = React.useState(false);
  const [isProcessing, setIsProcessing] = React.useState(false);
  const [textInput, setTextInput] = React.useState('');
  const [linkInput, setLinkInput] = React.useState('');
  const fileInputRef = React.useRef<HTMLInputElement>(null);

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

  const processFiles = async (files: File[]) => {
    setIsProcessing(true);
    try {
      for (const file of files) {
        const contentType = getContentType(file.type);
        let fileUrl: string | undefined;
        let contentText = file.name;

        if (contentType === 'text' && file.size <= MAX_EMBED_SIZE) {
          try {
            contentText = `${file.name}\n\n${await readFileAsText(file)}`;
          } catch {
            contentText = file.name;
          }
        } else if (file.size <= MAX_EMBED_SIZE) {
          fileUrl = await readFileAsDataURL(file);
        } else {
          toast(`"${file.name}" is over 1.5MB — filing its name only (local storage limit).`, { icon: 'ℹ️' });
        }

        await onAddContent({
          id: newId(),
          contentText,
          contentType,
          sourceApp: 'Upload',
          timestamp: new Date(),
          tags: [],
          summary: '',
          fileUrl,
          userId: 'local',
          category: 'articles',
          isFavorite: false,
          metadata: { fileSize: file.size },
        });
      }
      hapticSuccess();
      onClose();
    } catch (error) {
      console.error('Failed to process files:', error);
      toast.error('Failed to file one or more attachments');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleTextSubmit = async () => {
    if (!textInput.trim() || isProcessing) return;
    setIsProcessing(true);
    try {
      await onAddContent({
        id: newId(),
        contentText: textInput.trim(),
        contentType: 'text',
        sourceApp: 'Note',
        timestamp: new Date(),
        tags: [],
        summary: '',
        userId: 'local',
        category: 'personal',
        isFavorite: false,
      });
      hapticSuccess();
      setTextInput('');
      onClose();
    } finally {
      setIsProcessing(false);
    }
  };

  const handleLinkSubmit = async () => {
    const raw = linkInput.trim();
    if (!raw || isProcessing) return;
    const withProtocol = /^https?:\/\//i.test(raw) ? raw : `https://${raw}`;
    let hostname: string;
    try {
      hostname = new URL(withProtocol).hostname;
    } catch {
      toast.error("That doesn't look like a URL");
      return;
    }
    setIsProcessing(true);
    try {
      await onAddContent({
        id: newId(),
        contentText: withProtocol,
        contentType: 'link',
        sourceApp: hostname,
        timestamp: new Date(),
        tags: [],
        summary: '',
        userId: 'local',
        category: 'articles',
        isFavorite: false,
      });
      hapticSuccess();
      setLinkInput('');
      onClose();
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/40 backdrop-blur-[2px] z-50 flex items-center justify-center p-4"
      onClick={onClose}
      onDragEnter={(e) => { e.preventDefault(); setDragActive(true); }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        onDragOver={(e) => { e.preventDefault(); setDragActive(true); }}
        onDragLeave={(e) => { e.preventDefault(); setDragActive(false); }}
        onDrop={async (e) => {
          e.preventDefault();
          setDragActive(false);
          const files = Array.from(e.dataTransfer.files);
          if (files.length > 0) await processFiles(files);
        }}
        className={`card-ink-static w-full max-w-2xl rounded-sm relative transition-all ${
          dragActive ? 'outline outline-2 outline-[var(--accent)] outline-offset-4' : ''
        }`}
      >
        {/* Page header */}
        <div className="flex items-center justify-between px-7 pt-5 pb-4 border-b border-[var(--ink-line)]">
          <span className="font-label text-[10px] text-ink-faint">
            a fresh page · {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} ·{' '}
            {new Date().toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }).toLowerCase()}
          </span>
          <button onClick={onClose} className="text-ink-faint hover:text-ink transition-colors" aria-label="Close">
            <X size={16} />
          </button>
        </div>

        {/* The writing surface */}
        <div className="px-7 py-6 ruled">
          <textarea
            autoFocus
            value={textInput}
            onChange={(e) => setTextInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                handleTextSubmit();
              }
            }}
            placeholder="Write your thoughts, notes, or ideas..."
            rows={6}
            className="bare-input font-display text-2xl leading-[32px] w-full bg-transparent text-ink placeholder:text-[var(--ink-faint)] outline-none resize-none caret-[var(--accent)]"
          />
        </div>

        {/* Or a link */}
        <div className="px-7 pb-2 flex items-center gap-3">
          <span className="font-label text-[9px] text-ink-faint flex-shrink-0">or a link</span>
          <input
            type="url"
            value={linkInput}
            onChange={(e) => setLinkInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleLinkSubmit()}
            placeholder="https://example.com"
            className="bare-input flex-1 bg-transparent text-ink text-sm placeholder:text-[var(--ink-faint)] outline-none border-b border-[var(--ink-line)] focus:border-[var(--accent)] transition-colors pb-1"
          />
          {linkInput.trim() && (
            <button onClick={handleLinkSubmit} className="btn-paper haptic px-3 py-1 rounded-sm font-label text-[9px]">
              Add Link
            </button>
          )}
        </div>

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
              or drop a file on the page
            </span>
            <input
              ref={fileInputRef}
              type="file"
              multiple
              onChange={async (e) => {
                const files = e.target.files ? Array.from(e.target.files) : [];
                e.target.value = '';
                if (files.length > 0) await processFiles(files);
              }}
              className="hidden"
            />
          </div>
          <div className="flex items-center gap-3">
            <kbd className="keycap hidden sm:inline-flex text-[9px] !py-0.5 !px-1.5">⌘↵</kbd>
            <button
              onClick={handleTextSubmit}
              disabled={!textInput.trim() || isProcessing}
              className="btn-ink haptic px-6 py-2.5 rounded-sm font-semibold text-sm disabled:opacity-30 disabled:pointer-events-none inline-flex items-center gap-2"
            >
              {isProcessing ? <Loader2 size={14} className="animate-spin" /> : null}
              Add Note
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
