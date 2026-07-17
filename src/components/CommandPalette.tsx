import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Plus,
  Clock,
  BarChart3,
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
  Command,
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
    setLegendOpen,
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
        id: 'view-almanac', label: 'Go to the Almanac', icon: BarChart3,
        keywords: 'almanac analytics stats charts activity insights patterns go',
        run: () => setActiveView('almanac'),
      },
      {
        id: 'view-profile', label: 'Go to Profile', icon: User,
        keywords: 'profile account me go',
        run: () => setActiveView('profile'),
      },
      {
        id: 'legend', label: 'Keyboard Shortcuts', icon: Command,
        keywords: 'keyboard shortcuts legend help keys cheat sheet',
        run: () => setLegendOpen(true),
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
          toast('Workspace locked');
        },
      });
    }

    return cmds;
  }, [settings.theme, filter, user?.encryptionEnabled, isEncryptionSetup, setUploadModalOpen, setActiveView, updateSettings, setFilter, exportContent, setSettingsModalOpen, setLegendOpen, lock]);

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
          style={{ paddingTop: 'calc(env(safe-area-inset-top, 0px) + 7vh)' }}
          className="fixed inset-0 bg-black/30 backdrop-blur-[2px] z-[70] flex items-start justify-center sm:!pt-[15vh] px-3 sm:px-4"
          onClick={close}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.97, y: -8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.97, y: -8 }}
            transition={{ duration: 0.16, ease: [0.16, 1, 0.3, 1] }}
            onClick={(e) => e.stopPropagation()}
            className="card-ink-static w-full max-w-xl rounded-sm overflow-hidden"
          >
            {/* Input */}
            <div className="flex items-center gap-3 px-5 py-4 border-b-[1.5px] border-ink">
              <Search size={16} className="text-ink-faint flex-shrink-0" />
              <input
                ref={inputRef}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Search or type a command…  ( # for tags )"
                className="bare-input font-display italic flex-1 bg-transparent text-ink text-xl placeholder:text-[var(--ink-faint)] placeholder:not-italic outline-none caret-[var(--accent)]"
              />
              <kbd className="keycap hidden sm:inline-flex text-[9px] !py-0.5 !px-1.5">esc</kbd>
            </div>

            {/* Results */}
            <div ref={listRef} className="max-h-[46vh] overflow-y-auto custom-scrollbar py-2">
              {results.length === 0 ? (
                <div className="px-5 py-10 text-center font-display italic text-ink-faint">
                  nothing found for “{query}”
                </div>
              ) : (
                results.map((row, index) => (
                  <button
                    key={`${row.kind}-${row.id}`}
                    onClick={() => execute(row)}
                    onMouseMove={() => setSelected(index)}
                    className={`w-full flex items-center gap-3 px-4 py-2.5 mx-1 rounded-sm text-left border-l-[3px] transition-colors duration-75 ${
                      index === selected
                        ? 'border-[var(--accent)] bg-[var(--accent-soft)]'
                        : 'border-transparent'
                    }`}
                    style={{ width: 'calc(100% - 8px)' }}
                  >
                    <div className={`w-7 h-7 border-[1.5px] rounded-sm flex items-center justify-center flex-shrink-0 ${
                      index === selected ? 'border-ink bg-paper text-accent' : 'border-[var(--ink-line)] text-ink-faint'
                    }`}>
                      <row.icon size={13} />
                    </div>
                    <span className="flex-1 text-ink text-sm truncate">{row.label}</span>
                    {row.hint && (
                      <span className="font-label text-[9px] text-ink-faint flex-shrink-0 hidden sm:inline">{row.hint}</span>
                    )}
                    {index === selected && (
                      <CornerDownLeft size={13} className="text-accent flex-shrink-0" />
                    )}
                  </button>
                ))
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center gap-4 px-5 py-2.5 border-t-[1.5px] border-ink font-label text-[9px] text-ink-faint">
              <span className="hidden sm:flex items-center gap-1.5"><kbd className="keycap text-[8px] !py-0 !px-1">↑↓</kbd> navigate</span>
              <span className="hidden sm:flex items-center gap-1.5"><kbd className="keycap text-[8px] !py-0 !px-1">↵</kbd> select</span>
              <span className="sm:hidden">tap a result to open it</span>
              <span className="ml-auto flex items-baseline gap-0.5">supermind<span className="w-1 h-1 rounded-full bg-accent inline-block" /></span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
