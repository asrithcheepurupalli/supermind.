import React from 'react';
import { motion } from 'framer-motion';
import {
  Plus,
  Flame,
  Star,
  Database,
  CalendarDays,
  Sparkles,
  History,
  ArrowRight,
  Send,
  Network,
  Clock,
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useStore, defaultFilter } from '../store/useStore';
import { SavedContent } from '../types';
import { hapticSuccess, hapticTap } from '../utils/haptics';
import HeroGraph from './landing/HeroGraph';

// Smooth 14-day activity sparkline rendered as an SVG area.
function Sparkline({ items }: { items: SavedContent[] }) {
  const points = React.useMemo(() => {
    const counts: number[] = [];
    for (let i = 13; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      counts.push(items.filter(it => dayKey(it.timestamp) === dayKey(d)).length);
    }
    return counts;
  }, [items]);

  const max = Math.max(1, ...points);
  const W = 240;
  const H = 44;
  const stepX = W / (points.length - 1);
  const y = (v: number) => H - 4 - (v / max) * (H - 10);

  let path = `M 0 ${y(points[0])}`;
  for (let i = 1; i < points.length; i++) {
    const x0 = (i - 1) * stepX;
    const x1 = i * stepX;
    const mid = (x0 + x1) / 2;
    path += ` C ${mid} ${y(points[i - 1])}, ${mid} ${y(points[i])}, ${x1} ${y(points[i])}`;
  }

  if (points.every(p => p === 0)) return null;

  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-11" preserveAspectRatio="none" aria-hidden>
      <defs>
        <linearGradient id="sparkFill" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#10b981" stopOpacity="0.35" />
          <stop offset="100%" stopColor="#10b981" stopOpacity="0" />
        </linearGradient>
      </defs>
      <path d={`${path} L ${W} ${H} L 0 ${H} Z`} fill="url(#sparkFill)" />
      <path d={path} fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

// Animated count-up for stat numbers.
const useCountUp = (target: number, duration = 900) => {
  const [value, setValue] = React.useState(0);
  React.useEffect(() => {
    if (target === 0) {
      setValue(0);
      return;
    }
    let frame = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      setValue(Math.round(eased * target));
      if (t < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [target, duration]);
  return value;
};

const dayKey = (d: Date) => `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;

const computeStreak = (items: SavedContent[]): number => {
  const days = new Set(items.map(i => dayKey(i.timestamp)));
  let streak = 0;
  const cursor = new Date();
  // A streak survives until you miss a full day: if nothing today yet, start counting from yesterday.
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
}

const buildMemoryLane = (items: SavedContent[]): MemoryLaneEntry[] => {
  const now = Date.now();
  const day = 24 * 3600 * 1000;
  const entries: MemoryLaneEntry[] = [];
  const used = new Set<string>();

  const pick = (minDays: number, maxDays: number, label: string) => {
    const found = items.find(i => {
      const age = now - i.timestamp.getTime();
      return age >= minDays * day && age <= maxDays * day && !used.has(i.id);
    });
    if (found) {
      used.add(found.id);
      entries.push({ label, item: found });
    }
  };

  pick(0.9, 2.5, 'Yesterday');
  pick(6, 9, 'One week ago');
  pick(27, 35, 'One month ago');

  if (entries.length === 0 && items.length > 0) {
    const oldest = items[items.length - 1];
    if (now - oldest.timestamp.getTime() > 2 * day) {
      entries.push({ label: 'Where it began', item: oldest });
    }
  }

  return entries;
};

function StreakRing({ streak }: { streak: number }) {
  // The ring fills across a 7-day rhythm; a full week glows.
  const progress = Math.min(1, streak / 7);
  const circumference = 2 * Math.PI * 34;

  return (
    <div className="relative w-24 h-24 flex-shrink-0">
      <svg viewBox="0 0 80 80" className="w-full h-full -rotate-90">
        <circle cx="40" cy="40" r="34" fill="none" strokeWidth="6" className="stroke-black/10 dark:stroke-white/10" />
        <motion.circle
          cx="40" cy="40" r="34" fill="none" strokeWidth="6" strokeLinecap="round"
          stroke="url(#streakGradient)"
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset: circumference * (1 - progress) }}
          transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
          strokeDasharray={circumference}
        />
        <defs>
          <linearGradient id="streakGradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#10b981" />
            <stop offset="100%" stopColor="#3b82f6" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <Flame size={16} className={streak > 0 ? 'text-orange-500' : 'text-muted'} />
        <span className="text-xl font-bold text-primary tabular-nums leading-tight">{streak}</span>
        <span className="text-[10px] text-muted uppercase tracking-wide">day{streak !== 1 ? 's' : ''}</span>
      </div>
    </div>
  );
}

export default function Dashboard() {
  const { user, content, addContent, setUploadModalOpen, setActiveView, setFilter, settings } = useStore();
  const isDark = settings.theme === 'dark' ||
    (settings.theme === 'system' && typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches);
  const [quickNote, setQuickNote] = React.useState('');
  const [isCapturing, setIsCapturing] = React.useState(false);

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
  const recent = items.slice(0, 4);

  // Top tags feed the live mini-graph teaser.
  const topTags = React.useMemo(() => {
    const counts = new Map<string, number>();
    for (const item of items) {
      for (const tag of item.tags) counts.set(tag, (counts.get(tag) || 0) + 1);
    }
    const tags = [...counts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 12).map(([t]) => t);
    return tags.length >= 4 ? tags : undefined;
  }, [items]);

  const animatedTotal = useCountUp(items.length);
  const animatedToday = useCountUp(todayCount);
  const animatedFavorites = useCountUp(favorites);

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
    } finally {
      setIsCapturing(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-6 lg:p-10 pb-32 sm:pb-16 space-y-6">
      {/* Greeting + Streak */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="glow-frame glass-card rounded-3xl p-6 lg:p-8"
      >
        <div className="flex items-center justify-between gap-6">
          <div className="min-w-0">
            <div className="flex items-center gap-2 text-muted text-sm mb-1">
              <CalendarDays size={14} />
              {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}
            </div>
            <h1 className="text-3xl lg:text-4xl font-bold text-primary tracking-tight mb-2">
              {greeting}, {firstName}.
            </h1>
            <p className="text-secondary">
              {todayCount === 0
                ? 'Nothing captured yet today — your future self is waiting.'
                : `${todayCount} capture${todayCount !== 1 ? 's' : ''} today. Keep the thread going.`}
            </p>
          </div>
          <StreakRing streak={streak} />
        </div>
        <div className="mt-5 -mb-2">
          <Sparkline items={items} />
        </div>
      </motion.div>

      {/* Quick Capture */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.06 }}
        className="glass-card rounded-3xl p-2 flex items-end gap-2 focus-within:ring-2 focus-within:ring-emerald-500/40 transition-shadow"
      >
        <textarea
          value={quickNote}
          onChange={(e) => setQuickNote(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
              e.preventDefault();
              handleQuickCapture();
            }
          }}
          rows={quickNote.includes('\n') ? 3 : 1}
          placeholder="Capture a thought… it gets tagged and filed automatically  (⌘↵)"
          className="flex-1 bg-transparent text-primary placeholder-muted outline-none resize-none px-4 py-3 text-base"
        />
        <button
          onClick={handleQuickCapture}
          disabled={!quickNote.trim() || isCapturing}
          className="haptic m-1 w-11 h-11 rounded-2xl bg-gradient-to-br from-emerald-500 to-blue-500 text-white flex items-center justify-center disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0 shadow-lg shadow-emerald-500/20"
        >
          <Send size={17} />
        </button>
      </motion.div>

      {/* Stats Row */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.12 }}
        className="grid grid-cols-3 gap-4"
      >
        {[
          { label: 'Total items', value: animatedTotal, icon: Database, action: () => setActiveView('timeline') },
          { label: 'Today', value: animatedToday, icon: Sparkles, action: () => setActiveView('timeline') },
          {
            label: 'Favorites', value: animatedFavorites, icon: Star,
            action: () => {
              setFilter({ ...defaultFilter, favoritesOnly: true });
              setActiveView('timeline');
            },
          },
        ].map((stat) => (
          <button
            key={stat.label}
            onClick={() => { hapticTap(); stat.action(); }}
            className="haptic glass-card rounded-2xl p-5 text-left hover:border-emerald-500/30 transition-colors"
          >
            <stat.icon size={16} className="text-emerald-600 dark:text-emerald-400 mb-3" />
            <div className="text-2xl lg:text-3xl font-bold text-primary tabular-nums">{stat.value}</div>
            <div className="text-secondary text-sm">{stat.label}</div>
          </button>
        ))}
      </motion.div>

      {/* Memory Lane */}
      {memoryLane.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.18 }}
          className="glass-card rounded-3xl p-6"
        >
          <div className="flex items-center gap-2 mb-4">
            <History size={16} className="text-purple-500" />
            <h2 className="text-lg font-semibold text-primary">Memory Lane</h2>
            <span className="text-muted text-sm ml-1">what past-you saved</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {memoryLane.map(({ label, item }) => (
              <button
                key={item.id}
                onClick={() => openItem(item)}
                className="haptic text-left p-4 rounded-2xl bg-black/[0.03] dark:bg-white/[0.04] hover:bg-purple-500/[0.07] dark:hover:bg-purple-500/[0.12] border border-transparent hover:border-purple-500/20 transition-colors group"
              >
                <div className="text-purple-600 dark:text-purple-400 text-xs font-semibold uppercase tracking-wide mb-2">
                  {label}
                </div>
                <p className="text-primary text-sm line-clamp-2 mb-2">{item.contentText}</p>
                <div className="flex items-center gap-2 text-muted text-xs">
                  <Clock size={11} />
                  {formatDistanceToNow(item.timestamp, { addSuffix: true })}
                  <ArrowRight size={11} className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
              </button>
            ))}
          </div>
        </motion.div>
      )}

      {/* Recent + Graph teaser */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.24 }}
          className="glass-card rounded-3xl p-6 lg:col-span-3"
        >
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-primary">Recent</h2>
            <button
              onClick={() => { hapticTap(); setActiveView('timeline'); }}
              className="text-emerald-600 dark:text-emerald-400 text-sm font-medium hover:underline flex items-center gap-1"
            >
              View all <ArrowRight size={13} />
            </button>
          </div>
          {recent.length === 0 ? (
            <div className="text-center py-10">
              <p className="text-secondary mb-4">Nothing here yet — add your first thought.</p>
              <button
                onClick={() => { hapticTap(); setUploadModalOpen(true); }}
                className="haptic inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-blue-500 text-white font-medium shadow-lg shadow-emerald-500/20"
              >
                <Plus size={16} /> Add Content
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              {recent.map((item) => (
                <button
                  key={item.id}
                  onClick={() => openItem(item)}
                  className="haptic w-full text-left p-3 rounded-xl hover:bg-black/[0.03] dark:hover:bg-white/[0.05] transition-colors flex items-center gap-3 group"
                >
                  <div className="w-2 h-2 rounded-full bg-emerald-500 flex-shrink-0" />
                  <span className="text-primary text-sm truncate flex-1">{item.contentText}</span>
                  <span className="text-muted text-xs flex-shrink-0">
                    {formatDistanceToNow(item.timestamp, { addSuffix: true })}
                  </span>
                </button>
              ))}
            </div>
          )}
        </motion.div>

        <motion.button
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          onClick={() => { hapticTap(); setActiveView('graph'); }}
          className="haptic glass-card rounded-3xl lg:col-span-2 text-left relative overflow-hidden group hover:border-emerald-500/30 transition-colors min-h-[260px]"
        >
          <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-white/70 dark:to-black/50 z-[1]" />
          <HeroGraph labels={topTags} surface={isDark ? 'dark' : 'light'} className="absolute inset-0 opacity-80 group-hover:opacity-100 transition-opacity" />
          <div className="absolute bottom-0 inset-x-0 p-6 z-[2]">
            <div className="flex items-center gap-2 mb-1">
              <Network size={15} className="text-emerald-500 dark:text-emerald-400" />
              <h2 className="text-lg font-semibold text-primary">Knowledge Graph</h2>
            </div>
            <span className="text-emerald-600 dark:text-emerald-400 text-sm font-medium inline-flex items-center gap-1">
              Watch your ideas connect <ArrowRight size={13} className="group-hover:translate-x-1 transition-transform" />
            </span>
          </div>
        </motion.button>
      </div>
    </div>
  );
}
