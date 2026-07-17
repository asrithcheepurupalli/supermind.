import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  ArrowRight,
  Send,
  Check,
  History,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useStore, defaultFilter } from '../store/useStore';
import { SavedContent } from '../types';
import { hapticSuccess, hapticTap } from '../utils/haptics';

// Phones get thumb-first wording; keyboards get shortcuts.
const isTouch = typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches;

// iPhone Safari sweeps website storage after a week of neglect, but a
// home-screen app is exempt. Worth one gentle card.
const isIosBrowserTab = typeof window !== 'undefined'
  && (/iPhone|iPad|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1))
  && !window.matchMedia('(display-mode: standalone)').matches
  && (navigator as unknown as { standalone?: boolean }).standalone !== true;

const dayKey = (d: Date) => `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;

const computeStreak = (items: SavedContent[]): number => {
  const days = new Set(items.map(i => dayKey(i.timestamp)));
  let streak = 0;
  const cursor = new Date();
  if (!days.has(dayKey(cursor))) cursor.setDate(cursor.getDate() - 1);
  while (days.has(dayKey(cursor))) {
    streak++;
    cursor.setDate(cursor.getDate() - 1);
  }
  return streak;
};

interface MemoryLaneEntry {
  label: string;
  item: SavedContent;
  rotate: string;
}

const buildMemoryLane = (items: SavedContent[]): MemoryLaneEntry[] => {
  const now = Date.now();
  const day = 24 * 3600 * 1000;
  const entries: MemoryLaneEntry[] = [];
  const used = new Set<string>();
  const rotations = ['-rotate-1', 'rotate-1', '-rotate-[0.5deg]'];

  const pick = (minDays: number, maxDays: number, label: string) => {
    const found = items.find(i => {
      const age = now - i.timestamp.getTime();
      return age >= minDays * day && age <= maxDays * day && !used.has(i.id);
    });
    if (found) {
      used.add(found.id);
      entries.push({ label, item: found, rotate: rotations[entries.length % rotations.length] });
    }
  };

  pick(0.9, 2.5, 'yesterday');
  pick(6, 9, 'one week ago');
  pick(27, 35, 'one month ago');

  if (entries.length === 0 && items.length > 0) {
    const oldest = items[items.length - 1];
    if (now - oldest.timestamp.getTime() > 2 * day) {
      entries.push({ label: 'where it began', item: oldest, rotate: '-rotate-1' });
    }
  }

  return entries;
};

// Streak drawn as ink tally marks — groups of five, the fifth struck through.
function TallyMarks({ count }: { count: number }) {
  const groups = Math.floor(count / 5);
  const rest = count % 5;
  const shown = Math.min(groups, 5);
  const overflow = groups > 5;

  const Group = ({ n, struck, gi }: { n: number; struck: boolean; gi: number }) => (
    <svg width={n * 7 + (struck ? 6 : 2)} height="30" className="inline-block">
      {[...Array(n)].map((_, i) => (
        <motion.line
          key={i}
          x1={4 + i * 7} y1="4" x2={3 + i * 7} y2="26"
          stroke="var(--ink)" strokeWidth="2.2" strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ delay: 0.15 + gi * 0.18 + i * 0.06, duration: 0.18 }}
        />
      ))}
      {struck && (
        <motion.line
          x1="0" y1="22" x2={n * 7 + 4} y2="7"
          stroke="var(--accent)" strokeWidth="2.4" strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ delay: 0.15 + gi * 0.18 + 0.3, duration: 0.22 }}
        />
      )}
    </svg>
  );

  if (count === 0) {
    return <span className="font-display italic text-ink-faint text-lg">no marks yet. today's the day</span>;
  }

  return (
    <span className="flex items-end gap-2 flex-wrap">
      {[...Array(shown)].map((_, gi) => <Group key={gi} n={5} struck gi={gi} />)}
      {overflow && <span className="font-display text-ink text-xl">…</span>}
      {rest > 0 && !overflow && <Group n={rest} struck={false} gi={shown} />}
    </span>
  );
}

export default function Dashboard() {
  const {
    user, content, addContent, setUploadModalOpen, setActiveView, setFilter,
    firstRun, markFirstRun, setCommandPaletteOpen, setSettingsModalOpen,
  } = useStore();
  const captureRef = React.useRef<HTMLTextAreaElement>(null);
  const [quickNote, setQuickNote] = React.useState('');
  const [isCapturing, setIsCapturing] = React.useState(false);
  const [justFiled, setJustFiled] = React.useState(false);

  const items = React.useMemo(
    () => content
      .filter(c => !c.metadata?.isGuide)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime()),
    [content]
  );

  const todayCount = React.useMemo(
    () => items.filter(i => dayKey(i.timestamp) === dayKey(new Date())).length,
    [items]
  );
  const streak = React.useMemo(() => computeStreak(items), [items]);
  const favorites = React.useMemo(() => items.filter(i => i.isFavorite).length, [items]);
  const memoryLane = React.useMemo(() => buildMemoryLane(items), [items]);
  const recent = items.slice(0, 5);

  const hour = new Date().getHours();
  const greeting = hour < 5 ? 'Up late' : hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const firstName = user?.name?.split(' ')[0] || 'friend';

  const openItem = (item: SavedContent) => {
    hapticTap();
    setFilter({ ...defaultFilter, searchQuery: item.contentText.slice(0, 50) });
    setActiveView('timeline');
  };

  const handleQuickCapture = async () => {
    const text = quickNote.trim();
    if (!text || isCapturing) return;
    setIsCapturing(true);
    try {
      await addContent({
        id: `item_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`,
        contentText: text,
        contentType: 'text',
        sourceApp: 'Quick Capture',
        timestamp: new Date(),
        tags: [],
        summary: '',
        userId: 'local',
        category: 'personal',
        isFavorite: false,
      });
      hapticSuccess();
      setQuickNote('');
      setJustFiled(true);
      window.setTimeout(() => setJustFiled(false), 1100);
    } finally {
      setIsCapturing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-8 lg:py-12 pb-32 sm:pb-16">
      {/* Today's page header */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        className="flex items-end justify-between border-b-[1.5px] border-ink pb-6 mb-8"
      >
        <div>
          <div className="font-label text-[10px] text-accent mb-3">
            [ today's page · {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })} ]
          </div>
          <h1 className="font-display text-5xl lg:text-6xl tracking-tight leading-[1.02] text-ink">
            {greeting}, <em className="marker">{firstName}.</em>
          </h1>
          <p className="font-display italic text-ink-soft text-lg mt-3">
            {todayCount === 0
              ? 'the page is blank. write something down.'
              : `${todayCount} thought${todayCount !== 1 ? 's' : ''} captured today. keep going.`}
          </p>
        </div>
        <div className="hidden md:block text-right">
          <div className="font-label text-[9px] text-ink-faint mb-2">capture streak</div>
          <TallyMarks count={streak} />
          <div className="font-label text-[9px] text-ink-faint mt-1.5">
            {streak} day{streak !== 1 ? 's' : ''}
          </div>
        </div>
      </motion.div>

      {/* First run: three moves, each one a live button, each one
          checking itself off as it actually happens. */}
      {!firstRun.dismissed && !(items.length > 0 && firstRun.palette && firstRun.theme) && (
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.04 }}
          className="card-ink-static rounded-sm p-6 mb-10 relative -rotate-[0.3deg]"
        >
          <span
            aria-hidden
            className="absolute -top-2.5 left-8 w-16 h-4 bg-[var(--accent-soft)] border border-[var(--ink-line)] rotate-[-3deg]"
            style={{ clipPath: 'polygon(2% 0, 98% 4%, 100% 96%, 0 100%)' }}
          />
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="font-label text-[9px] text-accent mb-1">start here</p>
              <h2 className="font-display text-2xl text-ink">
                Three moves and you have the hang of it.
              </h2>
            </div>
            <div className="flex items-center gap-3 flex-shrink-0">
              <span className="font-label text-[9px] text-ink-faint tabular-nums">
                {[items.length > 0, firstRun.palette, firstRun.theme].filter(Boolean).length}/3
              </span>
              <button
                onClick={() => markFirstRun('dismissed')}
                className="font-label text-[9px] text-ink-faint hover:text-accent transition-colors"
              >
                skip
              </button>
            </div>
          </div>
          <div className="space-y-1">
            {[
              {
                done: items.length > 0,
                title: 'Write a thought',
                detail: 'anything at all, on the line below',
                act: () => captureRef.current?.focus(),
              },
              {
                done: firstRun.palette,
                title: isTouch ? 'Find anything with search' : 'Find anything with ⌘K',
                detail: isTouch
                  ? 'the magnifier up top searches everything you write'
                  : 'the palette searches everything you write',
                act: () => setCommandPaletteOpen(true),
              },
              {
                done: firstRun.theme,
                title: 'Pick your paper',
                detail: 'daylight or midnight, in settings',
                act: () => setSettingsModalOpen(true, 'display'),
              },
            ].map((move, i) => (
              <button
                key={move.title}
                onClick={() => { hapticTap(); move.act(); }}
                disabled={move.done}
                className="haptic w-full flex items-center gap-3 py-2.5 border-b border-dotted border-[var(--ink-line)] last:border-0 text-left group disabled:pointer-events-none"
              >
                <span
                  className={`w-4.5 h-4.5 w-[18px] h-[18px] border-[1.5px] rounded-sm flex items-center justify-center flex-shrink-0 transition-colors ${
                    move.done ? 'bg-[var(--accent)] border-[var(--accent)]' : 'border-[var(--ink)]'
                  }`}
                >
                  {move.done && (
                    <svg viewBox="0 0 12 12" className="w-2.5 h-2.5" fill="none">
                      <path d="M2 6.5L4.8 9L10 3" stroke="#fffdf7" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </span>
                <span className={`font-display text-lg ${move.done ? 'text-ink-faint line-through decoration-[var(--ink-line)]' : 'text-ink'}`}>
                  {i + 1}. {move.title}
                </span>
                <span className="font-label text-[9px] text-ink-faint ml-auto hidden sm:block group-hover:text-accent transition-colors">
                  {move.done ? 'done' : move.detail + ' →'}
                </span>
              </button>
            ))}
          </div>
        </motion.div>
      )}

      {/* iPhone in a browser tab: one card, once, about keeping the notebook safe */}
      {isIosBrowserTab && !firstRun.iosHint && (
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          className="card-ink-static rounded-sm p-5 mb-8 relative rotate-[0.3deg]"
        >
          <p className="font-label text-[9px] text-accent mb-2">worth thirty seconds</p>
          <p className="font-display text-lg text-ink leading-snug mb-1.5">
            Put this notebook on your home screen.
          </p>
          <p className="text-ink-soft text-sm leading-relaxed">
            Safari quietly sweeps website storage it has not seen for a week. A home
            screen app is exempt, forever. Tap the share button, then "Add to Home Screen",
            and your notebook is out of the broom's reach.
          </p>
          <button
            onClick={() => { hapticTap(); markFirstRun('iosHint'); }}
            className="font-label text-[9px] text-ink-faint hover:text-accent transition-colors mt-3"
          >
            done, or not on an iPhone
          </button>
        </motion.div>
      )}

      {/* Quick capture: a ruled writing line */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.06 }}
        className="mb-10"
      >
        <div className="flex items-end gap-3">
          <div className="flex-1 relative">
            <textarea
              ref={captureRef}
              value={quickNote}
              onChange={(e) => setQuickNote(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                  e.preventDefault();
                  handleQuickCapture();
                }
              }}
              rows={quickNote.includes('\n') ? 3 : 1}
              placeholder="Capture a thought. It files itself."
              className="bare-input font-display italic text-2xl w-full bg-transparent text-ink placeholder:text-[var(--ink-faint)] placeholder:not-italic outline-none resize-none border-b-2 border-ink focus:border-[var(--accent)] transition-colors pb-2 caret-[var(--accent)]"
            />
            <span className="absolute right-0 -bottom-5 font-label text-[8px] text-ink-faint hidden sm:block">⌘↵ to file it</span>
          </div>
          <button
            onClick={handleQuickCapture}
            disabled={(!quickNote.trim() && !justFiled) || isCapturing}
            className="btn-ink haptic w-11 h-11 rounded-sm flex items-center justify-center disabled:opacity-30 disabled:pointer-events-none flex-shrink-0"
            aria-label="Capture"
          >
            <AnimatePresence mode="wait" initial={false}>
              {justFiled ? (
                <motion.span
                  key="filed"
                  initial={{ scale: 0.4, rotate: -30, opacity: 0 }}
                  animate={{ scale: 1, rotate: 0, opacity: 1 }}
                  exit={{ scale: 0.6, opacity: 0 }}
                  transition={{ type: 'spring', stiffness: 520, damping: 20 }}
                  className="flex"
                >
                  <Check size={16} strokeWidth={3} />
                </motion.span>
              ) : (
                <motion.span key="send" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="flex">
                  <Send size={16} />
                </motion.span>
              )}
            </AnimatePresence>
          </button>
        </div>
      </motion.div>

      {/* Ledger stats */}
      <motion.div
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.12 }}
        className="grid grid-cols-3 gap-4 mb-10"
      >
        {[
          { label: 'in the book', value: items.length, action: () => setActiveView('timeline') },
          { label: 'today', value: todayCount, action: () => setActiveView('timeline') },
          {
            label: 'starred', value: favorites,
            action: () => {
              setFilter({ ...defaultFilter, favoritesOnly: true });
              setActiveView('timeline');
            },
          },
        ].map((stat, i) => (
          <button
            key={stat.label}
            onClick={() => { hapticTap(); stat.action(); }}
            className={`card-ink haptic rounded-sm p-4 text-left ${i === 1 ? 'rotate-[0.4deg]' : i === 2 ? '-rotate-[0.4deg]' : ''}`}
          >
            <div className="font-display text-4xl lg:text-5xl text-ink tabular-nums leading-none mb-1.5">{stat.value}</div>
            <div className="font-label text-[9px] text-ink-faint">{stat.label}</div>
          </button>
        ))}
      </motion.div>

      {/* Memory lane: pinned cards */}
      {memoryLane.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.18 }}
          className="mb-10"
        >
          <div className="flex items-center gap-2 mb-4">
            <History size={13} className="text-accent" />
            <span className="font-label text-[10px] text-ink-soft">memory lane</span>
            <span className="font-display italic text-ink-faint text-sm">what past-you wrote</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {memoryLane.map(({ label, item, rotate }) => (
              <button
                key={item.id}
                onClick={() => openItem(item)}
                className={`card-ink haptic rounded-sm p-4 text-left relative ${rotate}`}
              >
                <div
                  aria-hidden
                  className="absolute -top-2.5 left-1/2 -translate-x-1/2 w-14 h-4 bg-[var(--accent-soft)] border border-[var(--ink-line)]"
                  style={{ clipPath: 'polygon(2% 0, 98% 4%, 100% 96%, 0 100%)' }}
                />
                <div className="font-label text-[8px] text-accent mb-2">{label}</div>
                <p className="font-display text-lg leading-snug text-ink line-clamp-3">
                  {item.contentText}
                </p>
              </button>
            ))}
          </div>
        </motion.div>
      )}

      {/* Recent lines + graph corner */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        <motion.div
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.24 }}
          className="lg:col-span-3"
        >
          <div className="flex items-baseline justify-between mb-3">
            <span className="font-label text-[10px] text-ink-soft">recent entries</span>
            <button
              onClick={() => { hapticTap(); setActiveView('timeline'); }}
              className="font-label text-[9px] text-accent hover:underline flex items-center gap-1"
            >
              open the book <ArrowRight size={10} />
            </button>
          </div>
          {recent.length === 0 ? (
            <div className="border-[1.5px] border-dashed border-[var(--ink-line)] rounded-sm py-10 text-center">
              <p className="font-display italic text-ink-faint mb-4">nothing written yet</p>
              <button
                onClick={() => { hapticTap(); setUploadModalOpen(true); }}
                className="btn-ink haptic px-5 py-2.5 rounded-sm font-label text-[10px] inline-flex items-center gap-2"
              >
                <Plus size={13} /> first entry
              </button>
            </div>
          ) : (
            <div>
              {recent.map((item) => (
                <button
                  key={item.id}
                  onClick={() => openItem(item)}
                  className="haptic w-full text-left flex items-baseline gap-3 py-2.5 border-b border-[var(--ink-line)] group hover:border-ink transition-colors"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-accent flex-shrink-0 translate-y-[-2px]" />
                  <span className="font-display text-lg text-ink truncate flex-1 group-hover:italic">
                    {item.contentText}
                  </span>
                  <span className="font-label text-[8px] text-ink-faint flex-shrink-0">
                    {formatDistanceToNow(item.timestamp, { addSuffix: true })}
                  </span>
                </button>
              ))}
            </div>
          )}
        </motion.div>

        <motion.button
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          onClick={() => { hapticTap(); setActiveView('graph'); }}
          className="card-ink haptic rounded-sm p-5 lg:col-span-2 text-left rotate-[0.5deg] self-start"
        >
          <div className="font-label text-[9px] text-ink-faint mb-3">the map of your mind</div>
          <svg viewBox="0 0 220 110" className="w-full mb-3">
            {['M35 60 Q 75 25 115 45', 'M115 45 Q 155 65 185 35', 'M35 60 Q 90 90 150 80', 'M115 45 Q 130 65 150 80'].map((d, pi) => (
              <motion.path
                key={d} d={d} fill="none" stroke="var(--ink-line)" strokeWidth="1.1"
                initial={{ pathLength: 0 }}
                animate={{ pathLength: 1 }}
                transition={{ delay: 0.5 + pi * 0.15, duration: 0.6 }}
              />
            ))}
            {[
              { x: 35, y: 60, r: 10 }, { x: 115, y: 45, r: 13 },
              { x: 185, y: 35, r: 8 }, { x: 150, y: 80, r: 9 },
            ].map((n, ni) => (
              <motion.g
                key={ni}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.55 + ni * 0.15, type: 'spring', stiffness: 260, damping: 13 }}
                style={{ transformOrigin: `${n.x}px ${n.y}px` }}
              >
                <circle cx={n.x} cy={n.y} r={n.r} fill="var(--accent)" opacity="0.9" />
                <circle cx={n.x} cy={n.y} r={n.r} fill="none" stroke="var(--ink)" strokeWidth="1.4" />
              </motion.g>
            ))}
          </svg>
          <div className="font-display text-xl text-ink mb-1">Knowledge Graph</div>
          <span className="font-label text-[9px] text-accent flex items-center gap-1">
            watch your ideas connect <ArrowRight size={10} />
          </span>
        </motion.button>
      </div>
    </div>
  );
}
