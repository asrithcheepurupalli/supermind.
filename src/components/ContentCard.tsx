import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Link as LinkIcon,
  Image as ImageIcon,
  FileType,
  Video,
  Headphones,
  Type,
  Clock,
  Star,
  ExternalLink,
  Calendar,
  MoreHorizontal,
  Share,
  Copy,
  Trash2,
  Edit,
  Eye,
  Download,
  X,
  Camera,
} from 'lucide-react';
import toast from 'react-hot-toast';
import { SavedContent } from '../types';
import { formatDistanceToNow } from 'date-fns';
import { useStore } from '../store/useStore';
import InteractiveGuide from './InteractiveGuide';

interface ContentCardProps {
  content: SavedContent;
  onToggleFavorite: (id: string) => void;
  isSelected?: boolean;
  onSelect?: () => void;
  viewMode?: 'grid' | 'list';
}

const contentTypeIcons = {
  link: LinkIcon,
  image: ImageIcon,
  pdf: FileType,
  video: Video,
  audio: Headphones,
  text: Type,
};

const contentTypeGradients = {
  link: 'bg-gradient-to-br from-blue-500/10 to-cyan-500/10 border-blue-500/20 text-blue-500',
  image: 'bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-green-500/20 text-emerald-500',
  pdf: 'bg-gradient-to-br from-red-500/10 to-pink-500/10 border-red-500/20 text-red-500',
  video: 'bg-gradient-to-br from-purple-500/10 to-violet-500/10 border-purple-500/20 text-purple-500',
  audio: 'bg-gradient-to-br from-orange-500/10 to-yellow-500/10 border-orange-500/20 text-orange-500',
  text: 'bg-gradient-to-br from-emerald-500/10 to-teal-500/10 border-emerald-500/20 text-teal-600',
};

// A summary that merely repeats a short note adds noise, not signal.
const isRedundantSummary = (summary: string, contentText: string) => {
  const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
  const a = norm(summary);
  const b = norm(contentText);
  return !a || b.includes(a) || a.includes(b);
};

// Deterministic hue per item — gives every card its own color aura.
const hashHue = (id: string) => {
  let h = 0;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) % 360;
  return h;
};

// Split content into a display title (first sentence/line) and body preview.
const splitContent = (text: string): [string, string] => {
  const trimmed = text.trim();
  const firstLine = trimmed.split('\n')[0];
  const sentence = firstLine.match(/^.{10,90}?[.!?:](\s|$)/);
  if (sentence) {
    const title = sentence[0].replace(/[.!?:]\s*$/, '').trim();
    return [title, trimmed.slice(sentence[0].length).trim()];
  }
  if (firstLine.length <= 90) return [firstLine, trimmed.slice(firstLine.length).trim()];
  return [`${firstLine.slice(0, 80).trimEnd()}…`, trimmed];
};

export default function ContentCard({
  content,
  onToggleFavorite,
  isSelected = false,
  onSelect,
  viewMode = 'grid',
}: ContentCardProps) {
  const { deleteContent, updateContent, filter, setFilter } = useStore();
  const [showActions, setShowActions] = React.useState(false);
  const [isHovered, setIsHovered] = React.useState(false);
  const [showPreview, setShowPreview] = React.useState(false);
  const [showEdit, setShowEdit] = React.useState(false);
  const [editText, setEditText] = React.useState(content.contentText);
  const [editTags, setEditTags] = React.useState(content.tags.join(', '));
  const IconComponent = contentTypeIcons[content.contentType];
  const gradientClasses = contentTypeGradients[content.contentType];
  const hue = hashHue(content.id);
  const [displayTitle, displayBody] = splitContent(content.contentText);

  const formatTimeAgo = (date: Date) => {
    if (!date || !(date instanceof Date) || isNaN(date.getTime())) {
      return 'unknown time';
    }
    return formatDistanceToNow(date, { addSuffix: true });
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(content.contentText);
    toast.success('Content copied to clipboard');
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator.share({
        title: content.contentText.slice(0, 50),
        text: content.summary,
        url: content.contentType === 'link' ? content.contentText : content.fileUrl,
      }).catch(() => {/* user cancelled */});
    } else {
      handleCopy();
    }
  };

  const handleDownload = () => {
    if (content.fileUrl) {
      const link = document.createElement('a');
      link.href = content.fileUrl;
      link.download = `supermind-${content.id}`;
      link.click();
    } else {
      const blob = new Blob(
        [`${content.contentText}\n\n---\nSummary: ${content.summary}\nTags: ${content.tags.join(', ')}\nSaved: ${content.timestamp}`],
        { type: 'text/plain' }
      );
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `supermind-note-${content.id}.txt`;
      link.click();
      URL.revokeObjectURL(url);
    }
    toast.success('Downloaded');
  };

  const handleDelete = () => {
    deleteContent(content.id);
    toast.success('Item deleted');
  };

  const handleEditSave = () => {
    const tags = editTags.split(',').map(t => t.trim()).filter(Boolean);
    updateContent(content.id, { contentText: editText, tags });
    setShowEdit(false);
    toast.success('Item updated');
  };

  const handleOpenLink = () => {
    const url = content.contentType === 'link' ? content.contentText : content.fileUrl;
    if (url) window.open(url, '_blank', 'noopener,noreferrer');
  };

  const handleTagClick = (tag: string) => {
    if (!filter.tags.includes(tag)) {
      setFilter({ ...filter, tags: [...filter.tags, tag] });
      toast.success(`Filtering by tag "${tag}"`);
    }
  };

  const handleDismissGuide = () => {
    if (content.metadata?.isGuide && content.metadata?.canDismiss) {
      deleteContent(content.id);
      toast.success('Guide dismissed');
    }
  };

  // Guides render as interactive onboarding cards.
  if (content.metadata?.isGuide) {
    return (
      <InteractiveGuide
        content={content}
        onComplete={() => {
          toast.success('🎉 Guide completed!');
          deleteContent(content.id);
        }}
        onDismiss={handleDismissGuide}
      />
    );
  }

  const menuActions = [
    { icon: Eye, label: 'Preview', action: () => setShowPreview(true) },
    ...(content.contentType === 'link' || content.fileUrl
      ? [{ icon: ExternalLink, label: 'Open', action: handleOpenLink }]
      : []),
    { icon: Edit, label: 'Edit', action: () => setShowEdit(true) },
    { icon: Copy, label: 'Copy', action: handleCopy },
    { icon: Share, label: 'Share', action: handleShare },
    { icon: Download, label: 'Download', action: handleDownload },
    { icon: Trash2, label: 'Delete', action: handleDelete },
  ];

  const cardContent = (
    <>
      {/* Color aura — unique per item, intensifies on hover */}
      <div aria-hidden className="absolute inset-0 rounded-2xl overflow-hidden pointer-events-none">
        <div
          className="absolute -top-14 -right-14 w-44 h-44 rounded-full blur-3xl opacity-[0.22] dark:opacity-[0.18] group-hover:opacity-40 transition-opacity duration-500"
          style={{ background: `radial-gradient(circle, hsl(${hue} 85% 60%), transparent 70%)` }}
        />
        <div
          className="absolute -bottom-16 -left-16 w-36 h-36 rounded-full blur-3xl opacity-0 group-hover:opacity-20 transition-opacity duration-500"
          style={{ background: `radial-gradient(circle, hsl(${(hue + 60) % 360} 85% 60%), transparent 70%)` }}
        />
      </div>

      {/* Selection Overlay */}
      <AnimatePresence>
        {isSelected && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-emerald-500/10 border-2 border-emerald-500/50 rounded-2xl z-10 pointer-events-none"
          />
        )}
      </AnimatePresence>

      {/* Selection Checkbox */}
      {onSelect && (
        <motion.div
          initial={{ scale: 0, opacity: 0 }}
          animate={{
            scale: isSelected || isHovered ? 1 : 0,
            opacity: isSelected || isHovered ? 1 : 0,
          }}
          className="absolute top-4 left-4 z-20"
        >
          <motion.button
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={(e) => {
              e.stopPropagation();
              onSelect();
            }}
            className={`w-6 h-6 rounded-full flex items-center justify-center transition-all duration-200 ${
              isSelected
                ? 'bg-emerald-500 text-white shadow-lg'
                : 'glass border border-white/20 text-gray-400 hover:text-white'
            }`}
          >
            {isSelected && <span className="text-white">✓</span>}
          </motion.button>
        </motion.div>
      )}

      {/* Header: compact type chip + time; actions reveal on hover */}
      <div className="flex items-center justify-between mb-3.5 relative z-10">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className={`p-2 rounded-lg border ${gradientClasses} backdrop-blur-sm flex-shrink-0`}>
            <IconComponent size={14} />
          </div>
          <span className="text-muted text-[11px] font-semibold uppercase tracking-widest truncate">
            {content.sourceApp}
          </span>
          <span className="text-muted/60 text-[11px] flex-shrink-0">·</span>
          <span className="text-muted text-[11px] flex-shrink-0 flex items-center gap-1">
            <Clock size={10} />
            {formatTimeAgo(content.timestamp)}
          </span>
        </div>

        <div className="flex items-center gap-1">
          {/* Favorite: always visible when starred, hover-revealed otherwise */}
          <motion.button
            whileHover={{ scale: 1.15 }}
            whileTap={{ scale: 0.9 }}
            onClick={(e) => {
              e.stopPropagation();
              onToggleFavorite(content.id);
            }}
            className={`p-1.5 rounded-lg transition-all duration-200 ${
              content.isFavorite
                ? 'text-yellow-500'
                : 'text-secondary opacity-0 group-hover:opacity-100 focus-visible:opacity-100 hover:text-yellow-500'
            }`}
          >
            <Star size={15} fill={content.isFavorite ? 'currentColor' : 'none'} />
          </motion.button>

          {/* Actions Menu */}
          <div className="relative">
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              onClick={(e) => {
                e.stopPropagation();
                setShowActions(!showActions);
              }}
              className="p-1.5 rounded-lg text-secondary opacity-0 group-hover:opacity-100 focus-visible:opacity-100 hover:text-primary hover:bg-black/5 dark:hover:bg-white/5 transition-all duration-200"
            >
              <MoreHorizontal size={15} />
            </motion.button>

            <AnimatePresence>
              {showActions && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: -10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -10 }}
                  className="absolute right-0 top-full mt-2 glass-card rounded-xl p-2 min-w-[180px] z-30 shadow-premium"
                >
                  {menuActions.map((action) => (
                    <motion.button
                      key={action.label}
                      whileHover={{ scale: 1.02, x: 4 }}
                      onClick={(e) => {
                        e.stopPropagation();
                        action.action();
                        setShowActions(false);
                      }}
                      className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 text-sm ${
                        action.label === 'Delete'
                          ? 'text-red-500 hover:text-red-400 hover:bg-red-500/10'
                          : 'text-secondary hover:text-primary hover:bg-black/5 dark:hover:bg-white/5'
                      }`}
                    >
                      <action.icon size={14} />
                      {action.label}
                    </motion.button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Media Preview */}
      {content.fileUrl && (content.contentType === 'image' || content.contentType === 'video') && (
        <motion.div
          whileHover={{ scale: 1.02 }}
          className="mb-4 rounded-xl overflow-hidden relative group cursor-pointer"
          onClick={(e) => {
            e.stopPropagation();
            setShowPreview(true);
          }}
        >
          {content.contentType === 'image' ? (
            <img
              src={content.fileUrl}
              alt={content.contentText}
              className={`w-full object-cover transition-all duration-300 ${
                viewMode === 'list' ? 'h-24 lg:h-32' : 'h-40 lg:h-48'
              }`}
            />
          ) : (
            <video
              src={content.fileUrl}
              className={`w-full object-cover ${viewMode === 'list' ? 'h-24 lg:h-32' : 'h-40 lg:h-48'}`}
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end p-4 opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="flex items-center gap-2 text-white text-sm">
              {content.contentType === 'video' ? <Video size={14} /> : <Camera size={14} />}
              <span className="font-medium">View Full Size</span>
            </div>
          </div>
        </motion.div>
      )}

      {/* Audio Preview */}
      {content.fileUrl && content.contentType === 'audio' && (
        <div className="mb-4" onClick={(e) => e.stopPropagation()}>
          <audio src={content.fileUrl} controls className="w-full" />
        </div>
      )}

      {/* Title + body: real typographic hierarchy instead of a text dump */}
      <div className="mb-4 relative z-10">
        <h3 className={`text-primary font-semibold text-[15px] lg:text-[17px] leading-snug tracking-tight break-words mb-1.5 ${
          viewMode === 'list' ? 'line-clamp-1' : 'line-clamp-2'
        }`}>
          {displayTitle}
        </h3>
        {displayBody && (
          <p className={`text-secondary/90 text-[13px] leading-relaxed break-words ${
            viewMode === 'list' ? 'line-clamp-1' : 'line-clamp-2'
          }`}>
            {displayBody}
          </p>
        )}
        {!displayBody && content.summary && !isRedundantSummary(content.summary, content.contentText) && (
          <p className="text-secondary/90 text-[13px] leading-relaxed line-clamp-2">
            {content.summary}
          </p>
        )}
      </div>

      {/* Tags: quiet hash-chips, capped at three */}
      {content.tags.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5 mb-4 relative z-10">
          {content.tags.slice(0, 3).map((tag) => (
            <button
              key={tag}
              onClick={(e) => {
                e.stopPropagation();
                handleTagClick(tag);
              }}
              className="text-[11px] font-medium px-2 py-0.5 rounded-md bg-black/[0.04] dark:bg-white/[0.06] text-secondary hover:text-emerald-600 dark:hover:text-emerald-400 hover:bg-emerald-500/10 transition-colors"
              title={`Filter by "${tag}"`}
            >
              #{tag}
            </button>
          ))}
          {content.tags.length > 3 && (
            <span className="text-muted text-[11px]">+{content.tags.length - 3}</span>
          )}
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between relative z-10">
        <div className="flex items-center gap-3">
          <div className="text-muted text-[11px] capitalize flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full" style={{ background: `hsl(${hue} 70% 55%)` }} />
            {content.category}
          </div>
          {content.reminderDate && (
            <div
              className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 text-[11px] font-medium"
              title={content.reminderDate.toLocaleString?.() ?? ''}
            >
              <Calendar size={11} />
              <span>Reminder</span>
            </div>
          )}
        </div>

        {content.contentType === 'link' && (
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={(e) => {
              e.stopPropagation();
              handleOpenLink();
            }}
            className="flex items-center gap-1 text-secondary hover:text-primary text-xs lg:text-sm transition-colors px-2 py-1 glass-button rounded-full hover:bg-black/5 dark:hover:bg-white/5"
          >
            <ExternalLink size={12} />
            Open
          </motion.button>
        )}
      </div>

      {/* Preview Modal */}
      <AnimatePresence>
        {showPreview && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={(e) => {
              e.stopPropagation();
              setShowPreview(false);
            }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="glass-card rounded-2xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-primary">Preview</h3>
                <button
                  onClick={() => setShowPreview(false)}
                  className="p-2 rounded-lg text-secondary hover:text-primary hover:bg-black/5 dark:hover:bg-white/5 transition-all duration-200"
                >
                  <X size={20} />
                </button>
              </div>
              {content.fileUrl && content.contentType === 'image' && (
                <img src={content.fileUrl} alt={content.contentText} className="w-full rounded-xl mb-4" />
              )}
              {content.fileUrl && content.contentType === 'video' && (
                <video src={content.fileUrl} controls className="w-full rounded-xl mb-4" />
              )}
              <div className="text-secondary leading-relaxed whitespace-pre-wrap break-words">
                {content.contentText}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Edit Modal */}
      <AnimatePresence>
        {showEdit && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={(e) => {
              e.stopPropagation();
              setShowEdit(false);
            }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="glass-card rounded-2xl p-6 max-w-2xl w-full max-h-[80vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-primary">Edit Item</h3>
                <button
                  onClick={() => setShowEdit(false)}
                  className="p-2 rounded-lg text-secondary hover:text-primary hover:bg-black/5 dark:hover:bg-white/5 transition-all duration-200"
                >
                  <X size={20} />
                </button>
              </div>
              <label className="block text-primary font-medium mb-2 text-sm">Content</label>
              <textarea
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                className="w-full h-40 px-4 py-3 glass-input rounded-xl text-primary resize-none focus:outline-none focus:ring-2 focus:ring-emerald-500/50 text-sm mb-4"
              />
              <label className="block text-primary font-medium mb-2 text-sm">Tags (comma-separated)</label>
              <input
                type="text"
                value={editTags}
                onChange={(e) => setEditTags(e.target.value)}
                className="w-full px-4 py-3 glass-input rounded-xl text-primary focus:outline-none focus:ring-2 focus:ring-emerald-500/50 text-sm mb-6"
              />
              <div className="flex justify-end gap-3">
                <button
                  onClick={() => setShowEdit(false)}
                  className="px-4 py-2 glass-button rounded-xl text-secondary hover:text-primary transition-all duration-200 text-sm"
                >
                  Cancel
                </button>
                <button
                  onClick={handleEditSave}
                  disabled={!editText.trim()}
                  className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 disabled:bg-gray-600 text-white rounded-xl transition-all duration-200 text-sm"
                >
                  Save Changes
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );

  return (
    <motion.div
      layout
      whileHover={{ y: -8, scale: 1.02 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      onClick={() => onSelect?.()}
      className={`
        group relative content-card rounded-2xl p-6 cursor-pointer
        ${isSelected ? 'ring-2 ring-emerald-500/50' : ''}
        ${viewMode === 'list' ? 'flex gap-6 items-start' : ''}
      `}
    >
      {viewMode === 'list' ? (
        <>
          {content.fileUrl && content.contentType === 'image' && (
            <div className="w-32 h-24 rounded-xl overflow-hidden flex-shrink-0">
              <img
                src={content.fileUrl}
                alt={content.contentText}
                className="w-full h-full object-cover"
              />
            </div>
          )}
          <div className="flex-1 min-w-0 relative">
            {cardContent}
          </div>
        </>
      ) : (
        <div className="relative">
          {cardContent}
        </div>
      )}
    </motion.div>
  );
}
