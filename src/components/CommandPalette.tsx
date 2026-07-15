import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Plus,
  Clock,
  BarChart3,
  Brain,
  Network,
  User,
  Moon,
  Sun,
  Download,
  Settings,
  Lock,
  Star,
  Tag,
  CornerDownLeft,
  Grid,
  type LucideIcon,
} from 'lucide-react';
import Fuse from 'fuse.js';
import toast from 'react-hot-toast';
import { useStore, defaultFilter } from '../store/useStore';
import { SavedContent } from '../types';
import { hapticTap } from '../utils/haptics';

interface Command {
  id: string;
  label: string;
  hint?: string;
  icon: LucideIcon;
  keywords: string;
  run: () => void;
}

interface ResultRow {
  kind: 'command' | 'content' | 'tag';
  id: string;
  label: string;
  hint?: string;
  icon: LucideIcon;
  run: () => void;
}

const typeIcons: Record<string, LucideIcon> = {
  link: Network,
  text: Tag,
};

export default function CommandPalette() {
  const {
    isCommandPaletteOpen,
    setCommandPaletteOpen,
    setActiveView,
    setUploadModalOpen,
    setSettingsModalOpen,
    settings,
    updateSettings,
    exportContent,
    content,
    filter,
    setFilter,
    lock,
    user,
    isEncryptionSetup,
  } = useStore();

  const [query, setQuery] = React.useState('');
  const [selected, setSelected] = React.useState(0);
  const inputRef = React.useRef<HTMLInputElement>(null);
  const listRef = React.useRef<HTMLDivElement>(null);

  const close = React.useCallback(() => {
    setCommandPaletteOpen(false);
    setQuery('');
    setSelected(0);
  }, [setCommandPaletteOpen]);

  const commands = React.useMemo<Command[]>(() => {
    const cmds: Command[] = [
      {
        id: 'add', label: 'Add Content', hint: '⌘N', icon: Plus,
        keywords: 'add new note link file capture create write',
        run: () => setUploadModalOpen(true),
      },
      {
        id: 'view-home', label: 'Go to Dashboard', icon: Grid,
        keywords: 'home dashboard overview go',
        run: () => setActiveView('home'),
      },
      {
        id: 'view-timeline', label: 'Go to Timeline', icon: Clock,
        keywords: 'timeline browse items library go',
        run: () => setActiveView('timeline'),
      },
      {
        id: 'view-graph', label: 'Go to Knowledge Graph', icon: Network,
        keywords: 'graph network connections visualization go',
        run: () => setActiveView('graph'),
      },
      {
        id: 'view-analytics', label: 'Go to Analytics', icon: BarChart3,
        keywords: 'analytics stats charts activity go',
        run: () => setActiveView('analytics'),
      },
      {
        id: 'view-insights', label: 'Go to Insights', icon: Brain,
        keywords: 'insights patterns suggestions recommendations go',
        run: () => setActiveView('insights'),
      },
      {
        id: 'view-profile', label: 'Go to Profile', icon: User,
        keywords: 'profile account me go',
        run: () => setActiveView('profile'),
      },
      {
        id: 'theme', label: settings.theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode',
        icon: settings.theme === 'dark' ? Sun : Moon,
        keywords: 'theme dark light mode appearance toggle switch',
        run: () => updateSettings({ theme: settings.theme === 'dark' ? 'light' : 'dark' }),
      },
      {
        id: 'favorites', label: filter.favoritesOnly ? 'Show All Items' : 'Show Favorites Only',
        icon: Star,
        keywords: 'favorites starred filter show',
        run: () => {
          setFilter({ ...filter, favoritesOnly: !filter.favoritesOnly });
          setActiveView('timeline');
        },
      },
      {
        id: 'clear-filters', label: 'Clear All Filters', icon: Search,
        keywords: 'clear reset filters search',
        run: () => setFilter(defaultFilter),
      },
      {
        id: 'export', label: 'Export All Data', icon: Download,
        keywords: 'export backup download save json',
        run: () => {
          exportContent();
          toast.success('Export downloaded');
        },
      },
      {
        id: 'settings', label: 'Open Settings', hint: '⌘,', icon: Settings,
        keywords: 'settings preferences options configure',
        run: () => setSettingsModalOpen(true),
      },
    ];

    if (user?.encryptionEnabled && isEncryptionSetup) {
      cmds.push({
        id: 'lock', label: 'Lock Workspace', icon: Lock,
        keywords: 'lock secure encrypt protect',
        run: () => {
          lock();
          toast('Workspace locked', { icon: '🔒' });
        },
      });
    }

    return cmds;
  }, [settings.theme, filter, user?.encryptionEnabled, isEncryptionSetup, setUploadModalOpen, setActiveView, updateSettings, setFilter, exportContent, setSettingsModalOpen, lock]);

  const commandFuse = React.useMemo(
    () => new Fuse(commands, { keys: ['label', 'keywords'], threshold: 0.4 }),
    [commands]
  );

  const contentFuse = React.useMemo(
    () => new Fuse(content.filter(c => !c.metadata?.isGuide), {
      keys: [
        { name: 'contentText', weight: 0.5 },
        { name: 'tags', weight: 0.3 },
        { name: 'summary', weight: 0.2 },
      ],
      threshold: 0.4,
      minMatchCharLength: 2,
    }),
    [content]
  );

  const allTags = React.useMemo(() => {
    const counts = new Map<string, number>();
    for (const item of content) {
      for (const tag of item.tags) counts.set(tag, (counts.get(tag) || 0) + 1);
    }
    return [...counts.keys()];
  }, [content]);

  const results = React.useMemo<ResultRow[]>(() => {
    const rows: ResultRow[] = [];
    const openItem = (item: SavedContent) => {
      setFilter({ ...defaultFilter, searchQuery: item.contentText.slice(0, 50) });
      setActiveView('timeline');
    };

    if (!query.trim()) {
      rows.push(...commands.map(c => ({
        kind: 'command' as const, id: c.id, label: c.label, hint: c.hint, icon: c.icon, run: c.run,
      })));
      return rows;
    }

    // "#tag" narrows to tag filtering
    if (query.startsWith('#')) {
      const tagQuery = query.slice(1).toLowerCase();
      for (const tag of allTags.filter(t => t.toLowerCase().includes(tagQuery)).slice(0, 8)) {
        rows.push({
          kind: 'tag', id: `tag-${tag}`, label: `Filter by #${tag}`, icon: Tag,
          run: () => {
            setFilter({ ...defaultFilter, tags: [tag] });
            setActiveView('timeline');
          },
        });
      }
      return rows;
    }

    rows.push(...commandFuse.search(query).slice(0, 4).map(r => ({
      kind: 'command' as const, id: r.item.id, label: r.item.label, hint: r.item.hint, icon: r.item.icon, run: r.item.run,
    })));

    rows.push(...contentFuse.search(query).slice(0, 6).map(r => ({
      kind: 'content' as const,
      id: r.item.id,
      label: r.item.contentText.length > 70 ? `${r.item.contentText.slice(0, 70).trimEnd()}…` : r.item.contentText,
      hint: r.item.contentType,
      icon: typeIcons[r.item.contentType] ?? Tag,
      run: () => openItem(r.item),
    })));

    return rows;
  }, [query, commands, commandFuse, contentFuse, allTags, setFilter, setActiveView]);

  // Reset selection when results change
  React.useEffect(() => setSelected(0), [query, isCommandPaletteOpen]);

  // Focus input when opened
  React.useEffect(() => {
    if (isCommandPaletteOpen) {
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [isCommandPaletteOpen]);

  // Keep selected row in view
  React.useEffect(() => {
    listRef.current?.children[selected]?.scrollIntoView({ block: 'nearest' });
  }, [selected]);

  const execute = (row: ResultRow) => {
    hapticTap();
    row.run();
    close();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelected(s => Math.min(s + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelected(s => Math.max(s - 1, 0));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (results[selected]) execute(results[selected]);
    } else if (e.key === 'Escape') {
      e.preventDefault();
      close();
    }
  };

  return (
    <AnimatePresence>
      {isCommandPaletteOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.12 }}
          className="fixed inset-0 bg-black/40 dark:bg-black/60 backdrop-blur-sm z-[70] flex items-start justify-center pt-[16vh] px-4"
          onClick={close}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.97, y: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: -8 }}
            transition={{ duration: 0.16, ease: [0.16, 1, 0.3, 1] }}
            onClick={(e) => e.stopPropagation()}
            className="w-full max-w-xl glass-card rounded-2xl shadow-premium overflow-hidden"
          >
            {/* Input */}
            <div className="flex items-center gap-3 px-5 py-4 border-b border-black/5 dark:border-white/10">
              <Search size={18} className="text-muted flex-shrink-0" />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Search or type a command…  ( # for tags )"
                className="flex-1 bg-transparent text-primary placeholder-muted outline-none text-base"
              />
              <kbd className="hidden sm:block text-xs text-muted px-2 py-1 rounded-md bg-black/5 dark:bg-white/10">esc</kbd>
            </div>

            {/* Results */}
            <div ref={listRef} className="max-h-[46vh] overflow-y-auto custom-scrollbar py-2">
              {results.length === 0 ? (
                <div className="px-5 py-10 text-center text-secondary text-sm">
                  Nothing found for “{query}”
                </div>
              ) : (
                results.map((row, index) => (
                  <button
                    key={`${row.kind}-${row.id}`}
                    onClick={() => execute(row)}
                    onMouseMove={() => setSelected(index)}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 mx-1 rounded-xl text-left transition-colors duration-75 ${
                      index === selected
                        ? 'bg-emerald-500/12 dark:bg-emerald-500/15'
                        : ''
                    }`}
                    style={{ width: 'calc(100% - 8px)' }}
                  >
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                      row.kind === 'content'
                        ? 'bg-blue-500/10 text-blue-500'
                        : row.kind === 'tag'
                        ? 'bg-purple-500/10 text-purple-500'
                        : 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                    }`}>
                      <row.icon size={15} />
                    </div>
                    <span className="flex-1 text-primary text-sm truncate">{row.label}</span>
                    {row.hint && (
                      <span className="text-xs text-muted capitalize flex-shrink-0">{row.hint}</span>
                    )}
                    {index === selected && (
                      <CornerDownLeft size={14} className="text-muted flex-shrink-0" />
                    )}
                  </button>
                ))
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center gap-4 px-5 py-2.5 border-t border-black/5 dark:border-white/10 text-xs text-muted">
              <span className="flex items-center gap-1.5"><kbd className="px-1.5 py-0.5 rounded bg-black/5 dark:bg-white/10">↑↓</kbd> navigate</span>
              <span className="flex items-center gap-1.5"><kbd className="px-1.5 py-0.5 rounded bg-black/5 dark:bg-white/10">↵</kbd> select</span>
              <span className="ml-auto">supermind.</span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
