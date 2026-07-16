import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import {
  Star,
  ArrowUpDown,
  Printer,
  ExternalLink,
  Search,
  Plus,
} from 'lucide-react';
import { SavedContent, FilterState } from '../types';
import { useSearch } from '../hooks/useSearch';
import { useStore } from '../store/useStore';
import { hapticTap, hapticSuccess } from '../utils/haptics';
import { buildShareUrl, renderNoteImage } from '../utils/shareNote';

interface TimelineProps {
  content: SavedContent[];
  filter: FilterState;
  onToggleFavorite: (id: string) => void;
  onFilterChange: (filter: FilterState) => void;
}

const typeGlyphs: Record<SavedContent['contentType'], string> = {
  text: '✎',
  link: '↗',
  image: '▣',
  pdf: '¶',
  audio: '♪',
  video: '▶',
};

const formatSize = (bytes?: number) => {
  if (!bytes) return null;
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

// The first line of an attachment's contentText is its filename.
const fileName = (item: SavedContent) => item.contentText.split('\n')[0];

const plateCaption = (item: SavedContent) =>
  ['Plate', fileName(item), formatSize(item.metadata?.fileSize)].filter(Boolean).join(' · ');

const timeLabel = (d: Date) =>
  d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }).toLowerCase().replace(' ', '');

const dayHeading = (d: Date) => {
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  if (d.toDateString() === today.toDateString()) return 'Today';
  if (d.toDateString() === yesterday.toDateString()) return 'Yesterday';
  return d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
};

// The Book: a continuous journal, not a card grid. Entries live on ruled
// lines with a margin column; clicking an entry unfolds it in place.
export default function Timeline({ content, filter, onToggleFavorite, onFilterChange }: TimelineProps) {
  const { deleteContent, updateContent, setFilter, setUploadModalOpen, settings } = useStore();
  const showPreviews = settings.display.showPreviews;
  const [sortAsc, setSortAsc] = React.useState(false);
  const [expandedId, setExpandedId] = React.useState<string | null>(null);
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [editText, setEditText] = React.useState('');
  const [confirmingDelete, setConfirmingDelete] = React.useState<string | null>(null);

  const searchResults = useSearch(content, filter.searchQuery);

  const entries = React.useMemo(() => {
    let filtered = (filter.searchQuery ? searchResults.map(r => r.content) : content)
      .filter(c => !c.metadata?.isGuide);

    if (filter.category && filter.category !== 'all') {
      filtered = filtered.filter(item => item.category === filter.category);
    }
    if (filter.contentType) {
      filtered = filtered.filter(item => item.contentType === filter.contentType);
    }
    if (filter.tags.length > 0) {
      filtered = filtered.filter(item => filter.tags.some(tag => item.tags.includes(tag)));
    }
    if (filter.favoritesOnly) {
      filtered = filtered.filter(item => item.isFavorite);
    }

    return [...filtered].sort((a, b) =>
      sortAsc
        ? a.timestamp.getTime() - b.timestamp.getTime()
        : b.timestamp.getTime() - a.timestamp.getTime()
    );
  }, [content, filter, sortAsc, searchResults]);

  const days = React.useMemo(() => {
    const groups: Array<{ heading: string; items: SavedContent[] }> = [];
    for (const item of entries) {
      const heading = dayHeading(item.timestamp);
      const last = groups[groups.length - 1];
      if (last && last.heading === heading) last.items.push(item);
      else groups.push({ heading, items: [item] });
    }
    return groups;
  }, [entries]);

  const filterLabel = filter.searchQuery
    ? `“${filter.searchQuery}”`
    : filter.favoritesOnly
      ? 'Starred'
      : filter.category !== 'all'
        ? filter.category
        : 'Everything';

  const toggleExpand = (id: string) => {
    hapticTap();
    setExpandedId(prev => (prev === id ? null : id));
    setEditingId(null);
    setConfirmingDelete(null);
  };

  const startEdit = (item: SavedContent) => {
    setEditingId(item.id);
    setEditText(item.contentText);
  };

  const saveEdit = (id: string) => {
    if (!editText.trim()) return;
    updateContent(id, { contentText: editText.trim() });
    setEditingId(null);
    toast.success('Entry updated');
  };

  const handleDelete = (id: string) => {
    if (confirmingDelete !== id) {
      setConfirmingDelete(id);
      return;
    }
    deleteContent(id);
    setConfirmingDelete(null);
    setExpandedId(null);
    toast.success('Entry removed');
  };

  const urlInText = (t: string) => t.match(/https?:\/\/\S+/)?.[0];

  const openLink = (item: SavedContent) => {
    const url = item.contentType === 'link'
      ? item.contentText
      : item.fileUrl ?? urlInText(item.contentText);
    if (url) window.open(url, '_blank', 'noopener,noreferrer');
  };

  const shareLink = async (item: SavedContent) => {
    hapticTap();
    try {
      await navigator.clipboard.writeText(buildShareUrl(item));
      toast.success('Link copied. The note travels inside it; no server involved.');
    } catch {
      toast.error('Could not reach the clipboard');
    }
  };

  const shareCard = async (item: SavedContent) => {
    hapticTap();
    const blob = await renderNoteImage(item);
    if (!blob) {
      toast.error('Could not draw the card');
      return;
    }
    const file = new File([blob], 'supermind-note.png', { type: 'image/png' });
    if (navigator.canShare?.({ files: [file] })) {
      await navigator.share({ files: [file], title: 'A note' }).catch(() => {});
      return;
    }
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'supermind-note.png';
    a.click();
    URL.revokeObjectURL(url);
    hapticSuccess();
    toast.success('Note card downloaded');
  };

  return (
    <div className="max-w-3xl mx-auto px-6 py-8 lg:py-12 pb-32 sm:pb-16">
      {/* Chapter head */}
      <div className="flex items-end justify-between border-b-[1.5px] border-ink pb-5 mb-2">
        <div>
          <div className="font-label text-[10px] text-accent mb-2">[ the book ]</div>
          <h1 className="font-display text-4xl lg:text-5xl tracking-tight capitalize text-ink">{filterLabel}</h1>
        </div>
        <div className="flex items-center gap-4 pb-1">
          <span className="font-label text-[9px] text-ink-faint tabular-nums">
            {entries.length} entr{entries.length === 1 ? 'y' : 'ies'}
          </span>
          <button
            onClick={() => { hapticTap(); setSortAsc(v => !v); }}
            className="font-label text-[9px] text-ink-soft hover:text-ink transition-colors flex items-center gap-1"
            title="Flip order"
          >
            <ArrowUpDown size={10} /> {sortAsc ? 'oldest first' : 'newest first'}
          </button>
          <button
            onClick={() => window.print()}
            className="font-label text-[9px] text-ink-soft hover:text-ink transition-colors hidden sm:flex items-center gap-1 print:hidden"
            title="Print this page"
          >
            <Printer size={10} /> print
          </button>
        </div>
      </div>

      {/* Empty state */}
      {entries.length === 0 && (
        <div className="border-[1.5px] border-dashed border-[var(--ink-line)] rounded-sm py-20 text-center mt-8">
          {filter.searchQuery || filter.tags.length > 0 || filter.contentType || filter.favoritesOnly || filter.category !== 'all' ? (
            <>
              <Search size={22} className="text-ink-faint mx-auto mb-4" />
              <p className="font-display italic text-xl text-ink-soft mb-2">nothing on this page</p>
              <p className="font-label text-[10px] text-ink-faint mb-6">try loosening the filters</p>
              <button
                onClick={() => onFilterChange({ ...filter, category: 'all', contentType: '', tags: [], searchQuery: '', favoritesOnly: false, dateRange: undefined })}
                className="btn-paper haptic px-5 py-2.5 rounded-sm font-label text-[10px]"
              >
                Clear Filters
              </button>
            </>
          ) : (
            <>
              <p className="font-display italic text-xl text-ink-soft mb-6">the book is empty. write the first line</p>
              <button
                onClick={() => { hapticTap(); setUploadModalOpen(true); }}
                className="btn-ink haptic px-6 py-3 rounded-sm font-label text-[10px] inline-flex items-center gap-2"
              >
                <Plus size={13} /> first entry
              </button>
            </>
          )}
        </div>
      )}

      {/* Days */}
      {days.map(({ heading, items }) => (
        <section key={heading} className="mt-8">
          <div className="sticky top-0 z-10 bg-paper flex items-baseline gap-3 py-2">
            <h2 className="font-display text-2xl text-ink">{heading}</h2>
            <div className="flex-1 border-b border-[var(--ink-line)] translate-y-[-6px]" />
            <span className="font-label text-[9px] text-ink-faint tabular-nums">{items.length}</span>
          </div>

          <div>
            {items.map((item) => {
              const expanded = expandedId === item.id;
              const editing = editingId === item.id;
              return (
                <motion.article
                  key={item.id}
                  layout="position"
                  className={`group grid grid-cols-[64px_1fr] gap-4 border-b border-[var(--ink-line)] transition-colors ${
                    expanded ? 'bg-paper-raised -mx-4 px-4 border-[var(--ink-line)]' : 'hover:bg-[var(--accent-soft)]/40'
                  }`}
                >
                  {/* Margin column */}
                  <div className="py-3.5 text-right select-none">
                    <div className="font-label text-[9px] text-ink-faint leading-none mb-1.5">{timeLabel(item.timestamp)}</div>
                    <div className="text-ink-faint text-sm leading-none" title={item.contentType}>{typeGlyphs[item.contentType]}</div>
                    <button
                      onClick={(e) => { e.stopPropagation(); hapticTap(); onToggleFavorite(item.id); }}
                      aria-label="Star entry"
                      className={`mt-2 transition-opacity ${item.isFavorite ? 'opacity-100 text-accent' : 'opacity-0 group-hover:opacity-100 text-ink-faint hover:text-accent'}`}
                    >
                      <Star size={12} fill={item.isFavorite ? 'currentColor' : 'none'} />
                    </button>
                  </div>

                  {/* Entry body */}
                  <div className="py-3.5 min-w-0 cursor-pointer" onClick={() => !editing && toggleExpand(item.id)}>
                    {!editing ? (
                      <div className="flex items-start justify-between gap-4">
                        <p className={`font-display text-ink leading-relaxed break-words min-w-0 ${expanded ? 'text-xl' : 'text-lg line-clamp-2'}`}>
                          {item.contentType === 'link' ? (
                            <span className="underline decoration-[var(--ink-line)] underline-offset-4 group-hover:decoration-[var(--accent)]">
                              {item.contentText}
                            </span>
                          ) : item.contentText}
                        </p>
                        {/* Tiny tipped-in thumbnail on collapsed image rows */}
                        {!expanded && showPreviews && item.fileUrl && item.contentType === 'image' && (
                          <img
                            src={item.fileUrl}
                            alt=""
                            className="w-11 h-11 object-cover border-[1.5px] border-ink flex-shrink-0 rotate-2 shadow-[2px_2px_0_var(--ink)] group-hover:rotate-0 transition-transform"
                          />
                        )}
                      </div>
                    ) : (
                      <textarea
                        autoFocus
                        value={editText}
                        onChange={(e) => setEditText(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) saveEdit(item.id);
                          if (e.key === 'Escape') setEditingId(null);
                        }}
                        onClick={(e) => e.stopPropagation()}
                        rows={Math.min(8, Math.max(2, editText.split('\n').length + 1))}
                        className="bare-input font-display text-lg w-full bg-transparent text-ink outline-none resize-none border-b-2 border-[var(--accent)] pb-1 caret-[var(--accent)]"
                      />
                    )}

                    {/* Tag row (always visible, quiet) */}
                    {item.tags.length > 0 && (
                      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1.5">
                        {item.tags.slice(0, expanded ? 12 : 4).map(tag => (
                          <button
                            key={tag}
                            onClick={(e) => {
                              e.stopPropagation();
                              hapticTap();
                              if (!filter.tags.includes(tag)) setFilter({ ...filter, tags: [...filter.tags, tag] });
                            }}
                            className="font-label text-[9px] text-ink-faint hover:text-accent transition-colors"
                          >
                            #{tag}
                          </button>
                        ))}
                        {item.reminderDate && (
                          <span className="font-label text-[9px] text-accent">reminder set</span>
                        )}
                      </div>
                    )}

                    {/* Unfolded */}
                    <AnimatePresence>
                      {expanded && (
                        <motion.div
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                          className="overflow-hidden"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {/* Tipped-in photograph: matte frame, tape, caption */}
                          {showPreviews && item.fileUrl && item.contentType === 'image' && (
                            <figure className="relative inline-block mt-5 mr-6 -rotate-[0.6deg]">
                              <div
                                aria-hidden
                                className="absolute -top-2.5 left-1/2 -translate-x-1/2 w-16 h-4 bg-[var(--accent-soft)] border border-[var(--ink-line)] z-10 rotate-[-3deg]"
                                style={{ clipPath: 'polygon(2% 0, 98% 4%, 100% 96%, 0 100%)' }}
                              />
                              <div className="bg-paper-raised border-[1.5px] border-ink p-2.5 pb-1.5 shadow-[4px_4px_0_var(--ink)]">
                                <img src={item.fileUrl} alt={fileName(item)} className="max-h-72 border border-[var(--ink-line)]" />
                                <figcaption className="font-label text-[8px] text-ink-faint pt-1.5 uppercase">
                                  {plateCaption(item)}
                                </figcaption>
                              </div>
                            </figure>
                          )}

                          {/* Document slip for PDFs */}
                          {item.contentType === 'pdf' && (
                            <div className="inline-flex items-center gap-4 mt-5 bg-paper-raised border-[1.5px] border-ink shadow-[4px_4px_0_var(--ink)] px-4 py-3 rotate-[0.4deg]">
                              <span className="font-display text-3xl text-accent leading-none select-none">¶</span>
                              <div>
                                <p className="font-display text-base text-ink leading-tight">{fileName(item)}</p>
                                <p className="font-label text-[8px] text-ink-faint uppercase mt-0.5">
                                  {['Document', formatSize(item.metadata?.fileSize)].filter(Boolean).join(' · ')}
                                </p>
                              </div>
                            </div>
                          )}

                          {/* Sound slip */}
                          {item.fileUrl && item.contentType === 'audio' && (
                            <figure className="mt-5 bg-paper-raised border-[1.5px] border-ink shadow-[4px_4px_0_var(--ink)] p-3 max-w-md rotate-[-0.3deg]">
                              <audio src={item.fileUrl} controls className="w-full" />
                              <figcaption className="font-label text-[8px] text-ink-faint pt-1.5 uppercase">
                                {['Recording', fileName(item), formatSize(item.metadata?.fileSize)].filter(Boolean).join(' · ')}
                              </figcaption>
                            </figure>
                          )}

                          {/* Moving picture */}
                          {showPreviews && item.fileUrl && item.contentType === 'video' && (
                            <figure className="inline-block mt-5 bg-paper-raised border-[1.5px] border-ink shadow-[4px_4px_0_var(--ink)] p-2.5 pb-1.5 rotate-[0.3deg]">
                              <video src={item.fileUrl} controls className="max-h-72 border border-[var(--ink-line)]" />
                              <figcaption className="font-label text-[8px] text-ink-faint pt-1.5 uppercase">
                                {plateCaption(item)}
                              </figcaption>
                            </figure>
                          )}

                          {item.summary && item.summary.length > 0 && !item.contentText.includes(item.summary) && (
                            <p className="font-display italic text-ink-soft mt-4 pl-4 border-l-2 border-[var(--accent)]">
                              {item.summary}
                            </p>
                          )}

                          {/* Marginalia actions */}
                          <div className="flex items-center gap-1 mt-5 mb-1 font-label text-[9px] text-ink-soft">
                            {(item.contentType === 'link' || item.fileUrl || urlInText(item.contentText)) && (
                              <>
                                <button onClick={() => openLink(item)} className="hover:text-accent transition-colors flex items-center gap-1">
                                  open <ExternalLink size={9} />
                                </button>
                                <span className="text-ink-faint mx-2">·</span>
                              </>
                            )}
                            <button
                              onClick={() => { navigator.clipboard.writeText(item.contentText); toast.success('Copied'); }}
                              className="hover:text-accent transition-colors"
                            >
                              copy
                            </button>
                            {(item.contentType === 'text' || item.contentType === 'link') && (
                              <>
                                <span className="text-ink-faint mx-2">·</span>
                                <button
                                  onClick={() => shareLink(item)}
                                  title="Copy a link that carries this note inside it"
                                  className="hover:text-accent transition-colors"
                                >
                                  pass it on
                                </button>
                                <span className="text-ink-faint mx-2">·</span>
                                <button
                                  onClick={() => shareCard(item)}
                                  title="Download this note as an image card"
                                  className="hover:text-accent transition-colors"
                                >
                                  card
                                </button>
                              </>
                            )}
                            <span className="text-ink-faint mx-2">·</span>
                            <button onClick={() => startEdit(item)} className="hover:text-accent transition-colors">
                              edit
                            </button>
                            <span className="text-ink-faint mx-2">·</span>
                            <button
                              onClick={() => handleDelete(item.id)}
                              className={`transition-colors ${confirmingDelete === item.id ? 'text-accent' : 'hover:text-accent'}`}
                            >
                              {confirmingDelete === item.id ? 'sure? tap again' : 'remove'}
                            </button>
                            <span className="ml-auto text-ink-faint capitalize">{item.category} · {item.sourceApp.toLowerCase()}</span>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>

                    {editing && (
                      <div className="flex items-center gap-3 mt-3">
                        <button onClick={(e) => { e.stopPropagation(); saveEdit(item.id); }} className="btn-ink haptic px-4 py-1.5 rounded-sm font-label text-[9px]">
                          save
                        </button>
                        <button onClick={(e) => { e.stopPropagation(); setEditingId(null); }} className="font-label text-[9px] text-ink-faint hover:text-ink">
                          cancel
                        </button>
                      </div>
                    )}
                  </div>
                </motion.article>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}
