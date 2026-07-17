import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, BookmarkPlus } from 'lucide-react';
import MadeBadge from './MadeBadge';
import type { SharedNote as SharedNotePayload } from '../utils/shareNote';

interface SharedNoteProps {
  note: SharedNotePayload;
  isAuthenticated: boolean;
  onSave: () => void; // files it (or carries it into signup)
  onOpenApp: () => void;
}

// A note passed to you. The contents live in the link itself; no server
// ever saw them. Rendered read-only with a way to keep it.
export default function SharedNote({ note, isAuthenticated, onSave, onOpenApp }: SharedNoteProps) {
  React.useEffect(() => {
    document.title = 'A note passed to you · supermind';
    return () => { document.title = 'supermind. A second brain that stays on your device'; };
  }, []);

  const date = note.d
    ? new Date(note.d).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })
    : null;

  return (
    <div className="min-h-screen bg-paper text-ink noise dot-grid flex flex-col">
      <header className="border-b-[1.5px] border-ink bg-paper safe-area-top">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-baseline gap-1">
            <span className="font-display text-xl tracking-tight">supermind</span>
            <span className="w-1.5 h-1.5 rounded-full bg-accent inline-block" />
          </div>
          <span className="font-label text-[9px] text-ink-faint">a passed note</span>
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center px-6 py-16">
        <div className="w-full max-w-xl">
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="font-label text-[10px] text-accent text-center mb-6"
          >
            [ someone passed you a note ]
          </motion.p>

          <motion.article
            initial={{ opacity: 0, y: 16, rotate: 0 }}
            animate={{ opacity: 1, y: 0, rotate: -0.7 }}
            transition={{ type: 'spring', stiffness: 120, damping: 16 }}
            className="card-ink-static rounded-sm p-8 relative"
          >
            <span
              aria-hidden
              className="absolute -top-3 left-1/2 -translate-x-1/2 w-24 h-6 bg-[var(--accent-soft)] border border-[var(--ink-line)] rotate-[-2deg]"
              style={{ clipPath: 'polygon(2% 0, 98% 4%, 100% 96%, 0 100%)' }}
            />
            {date && <p className="font-label text-[9px] text-ink-faint mb-4">{date}</p>}
            <p className="font-display text-2xl leading-relaxed text-ink whitespace-pre-wrap break-words">
              {note.t}
            </p>
            {!!note.g?.length && (
              <div className="flex flex-wrap gap-3 mt-5">
                {note.g.map(tag => (
                  <span key={tag} className="font-label text-[9px] text-accent">#{tag}</span>
                ))}
              </div>
            )}
          </motion.article>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.35 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-10"
          >
            <button
              onClick={onSave}
              className="btn-ink haptic px-6 py-3 rounded-sm font-semibold text-sm inline-flex items-center gap-2"
            >
              <BookmarkPlus size={15} />
              {isAuthenticated ? 'Save to my notes' : 'Keep it, start a notebook'}
            </button>
            <button
              onClick={onOpenApp}
              className="font-label text-[10px] text-ink-soft hover:text-ink transition-colors inline-flex items-center gap-1.5"
            >
              {isAuthenticated ? 'open my notebook' : 'what is supermind?'} <ArrowRight size={11} />
            </button>
          </motion.div>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="font-label text-[8px] text-ink-faint text-center mt-10 leading-relaxed"
          >
            this note traveled inside the link itself. no server stored it, and none ever will.
          </motion.p>

          <div className="flex justify-center mt-6">
            <MadeBadge />
          </div>
        </div>
      </main>
    </div>
  );
}
