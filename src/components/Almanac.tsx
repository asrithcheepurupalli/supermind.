import { motion } from 'framer-motion';
import { useStore, defaultFilter } from '../store/useStore';
import { useAnalytics } from '../hooks/useAnalytics';
import { useInsights } from '../hooks/useInsights';

// "The Almanac": Analytics + Insights folded into one printed spread — a
// broadsheet stat strip, an ink bar chart, dot-leader tables, and the
// patterns written out as margin notes rather than dashboard tiles.
export default function Almanac() {
  const { content, setActiveView, setFilter } = useStore();
  const analytics = useAnalytics(content);
  const insights = useInsights(content);

  const days = analytics.activityData; // last 30 days
  const maxDay = Math.max(1, ...days.map(d => d.count));
  const monthTotal = days.reduce((sum, d) => sum + d.count, 0);
  const busiest = days.reduce((a, b) => (b.count > a.count ? b : a), days[0]);

  const ledger = [
    { label: 'entries filed', value: analytics.totalItems },
    { label: 'this week', value: analytics.itemsThisWeek },
    { label: 'starred', value: analytics.favoriteItems },
    { label: 'tags in use', value: analytics.topTags.length },
  ];

  const maxTag = Math.max(1, ...analytics.topTags.map(t => t.count));
  const maxCategory = Math.max(1, ...analytics.topCategories.map(c => c.count));

  const growthText =
    insights.weeklyGrowth === null
      ? null
      : insights.weeklyGrowth >= 0
        ? `up ${insights.weeklyGrowth}% on last week`
        : `down ${Math.abs(insights.weeklyGrowth)}% on last week`;

  const openTag = (tag: string) => {
    setFilter({ ...defaultFilter, searchQuery: tag });
    setActiveView('timeline');
  };

  return (
    <div className="max-w-4xl mx-auto px-6 pt-8 pb-28 sm:pb-12">
      {/* Masthead */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-end justify-between gap-4 mb-2">
          <p className="font-label text-[10px] text-accent">
            Plate III · compiled{' '}
            {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </p>
          <div className="hidden sm:flex items-center gap-4">
            <p className="font-label text-[9px] text-ink-faint">all figures computed on this device</p>
            <button
              onClick={() => window.print()}
              className="btn-paper haptic px-3 py-1.5 rounded-sm font-label text-[9px] print:hidden"
            >
              print this page
            </button>
          </div>
        </div>
        <h2 className="font-display text-4xl sm:text-5xl text-ink leading-none mb-8">
          The almanac<span className="text-accent">.</span>
        </h2>
      </motion.div>

      {/* Broadsheet ledger strip */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.05 }}
        className="grid grid-cols-2 sm:grid-cols-4 border-y-2 border-[var(--ink)] divide-x divide-[var(--ink-line)] mb-12"
      >
        {ledger.map((stat) => (
          <div key={stat.label} className="py-5 px-4 first:pl-0">
            <p className="font-display text-4xl sm:text-5xl text-ink tabular-nums leading-none">
              {stat.value}
            </p>
            <p className="font-label text-[9px] text-ink-faint mt-2">{stat.label}</p>
          </div>
        ))}
      </motion.div>

      {/* Fig. 1 — thirty days of capture */}
      <motion.section
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-12"
      >
        <div className="flex items-baseline justify-between mb-4">
          <h3 className="font-label text-[10px] text-ink-soft">Fig. 1. Thirty days of capture</h3>
          <p className="font-label text-[9px] text-ink-faint tabular-nums">{monthTotal} total</p>
        </div>
        <div className="flex items-end h-28 gap-[3px] border-b-[1.5px] border-[var(--ink)]">
          {days.map((day, i) => {
            const date = new Date(day.date);
            const label = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
            const isToday = i === days.length - 1;
            return (
              <div key={day.date} className="group relative flex-1 flex flex-col justify-end h-full">
                <div className="pointer-events-none absolute bottom-full left-1/2 -translate-x-1/2 mb-1.5 px-2 py-1 rounded-sm bg-[var(--ink)] text-[var(--paper)] font-label text-[8px] whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity z-10">
                  {label} · {day.count}
                </div>
                <motion.div
                  initial={{ height: 0 }}
                  animate={{ height: `${Math.max(3, (day.count / maxDay) * 100)}%` }}
                  transition={{ duration: 0.6, delay: 0.15 + i * 0.012, ease: [0.16, 1, 0.3, 1] }}
                  className="w-full"
                  style={{
                    background: isToday ? 'var(--accent)' : 'var(--ink)',
                    opacity: day.count === 0 ? 0.14 : isToday ? 1 : 0.85,
                  }}
                />
              </div>
            );
          })}
        </div>
        <div className="flex justify-between mt-2 font-label text-[8px] text-ink-faint">
          <span>{new Date(days[0]?.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
          {busiest && busiest.count > 0 && (
            <span>
              busiest:{' '}
              {new Date(busiest.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} (
              {busiest.count})
            </span>
          )}
          <span className="text-accent">today</span>
        </div>
      </motion.section>

      {/* Two printed tables */}
      <div className="grid sm:grid-cols-2 gap-x-12 gap-y-10 mb-12">
        {/* Shelves (categories) */}
        <motion.section initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <h3 className="font-label text-[10px] text-ink-soft border-b-[1.5px] border-[var(--ink)] pb-2 mb-3">
            Table A. The shelves
          </h3>
          {analytics.topCategories.length === 0 ? (
            <p className="text-ink-faint text-sm italic py-4">Nothing filed yet.</p>
          ) : (
            <div className="space-y-2.5">
              {analytics.topCategories.map((cat) => (
                <div key={cat.name} className="relative">
                  <div className="flex items-baseline justify-between gap-3 relative z-10 py-0.5">
                    <span className="font-display text-lg text-ink capitalize">{cat.name}</span>
                    <span className="font-label text-[10px] text-ink-soft tabular-nums">{cat.count}</span>
                  </div>
                  {/* marker bar behind the row */}
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(cat.count / maxCategory) * 100}%` }}
                    transition={{ duration: 0.7, delay: 0.25, ease: 'easeOut' }}
                    className="absolute inset-y-0 left-0 bg-[var(--highlight)] -mx-1 px-1"
                    style={{ transform: 'skewX(-6deg)' }}
                  />
                </div>
              ))}
            </div>
          )}
        </motion.section>

        {/* Tag specimen list with dot leaders */}
        <motion.section initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <h3 className="font-label text-[10px] text-ink-soft border-b-[1.5px] border-[var(--ink)] pb-2 mb-3">
            Table B. Most-used tags
          </h3>
          {analytics.topTags.length === 0 ? (
            <p className="text-ink-faint text-sm italic py-4">Tags appear as you write.</p>
          ) : (
            <div className="space-y-1.5">
              {analytics.topTags.slice(0, 8).map((tag) => (
                <button
                  key={tag.name}
                  onClick={() => openTag(tag.name)}
                  className="haptic w-full flex items-baseline gap-2 group text-left"
                  title={`Open everything tagged #${tag.name}`}
                >
                  <span className="font-mono text-xs text-ink group-hover:text-accent transition-colors">
                    #{tag.name}
                  </span>
                  <span className="flex-1 border-b border-dotted border-[var(--ink-line)] translate-y-[-3px]" />
                  <span className="font-label text-[10px] text-ink-soft tabular-nums">
                    {tag.count}
                    <span className="text-ink-faint"> · {'▪'.repeat(Math.max(1, Math.round((tag.count / maxTag) * 5)))}</span>
                  </span>
                </button>
              ))}
            </div>
          )}
        </motion.section>
      </div>

      {/* Margin notes — the old Insights, written as prose */}
      <motion.section
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="mb-12"
      >
        <h3 className="font-label text-[10px] text-ink-soft border-b-[1.5px] border-[var(--ink)] pb-2 mb-5">
          Margin notes: what the page noticed
        </h3>
        <div className="space-y-4 font-display text-xl sm:text-2xl text-ink leading-relaxed max-w-2xl">
          {analytics.totalItems === 0 ? (
            <p className="text-ink-faint italic">
              This page fills itself in as you capture. Come back after a few notes.
            </p>
          ) : (
            <>
              {insights.peakTime && (
                <p>
                  Your mind is loudest in the{' '}
                  <span className="marker-accent">{insights.peakTime.split(' ')[0].toLowerCase()}</span>
                  <span className="font-label text-[10px] text-ink-faint align-middle ml-2">
                    {insights.peakTime.match(/\((.*)\)/)?.[1] ?? ''}
                  </span>
                </p>
              )}
              {insights.favoriteType && (
                <p>
                  You reach for <span className="marker">{insights.favoriteType === 'text' ? 'notes' : `${insights.favoriteType}s`}</span>{' '}
                  more than anything else.
                </p>
              )}
              {growthText && (
                <p>
                  Capture is{' '}
                  <span className={insights.weeklyGrowth !== null && insights.weeklyGrowth >= 0 ? 'marker' : 'marker-accent'}>
                    {growthText}
                  </span>
                  .
                </p>
              )}
              {insights.tagConnections.slice(0, 2).map((conn) => (
                <p key={`${conn.tagA}-${conn.tagB}`}>
                  <span className="font-mono text-base text-accent">#{conn.tagA}</span> and{' '}
                  <span className="font-mono text-base text-accent">#{conn.tagB}</span> keep showing up
                  together, <span className="italic">{conn.count} times so far</span>.
                </p>
              ))}
            </>
          )}
        </div>
      </motion.section>

      <div className="grid sm:grid-cols-2 gap-x-12 gap-y-10">
        {/* Rediscover — taped clippings */}
        <motion.section initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <h3 className="font-label text-[10px] text-ink-soft border-b-[1.5px] border-[var(--ink)] pb-2 mb-4">
            Worth rereading
          </h3>
          {insights.recommendations.length === 0 ? (
            <p className="text-ink-faint text-sm italic py-2">
              As the library grows, older entries related to your recent ones surface here.
            </p>
          ) : (
            <div className="space-y-3">
              {insights.recommendations.map((rec, i) => (
                <button
                  key={rec.id}
                  onClick={() => openTag(rec.title.split(' ').slice(0, 3).join(' '))}
                  className="haptic card-ink w-full text-left rounded-sm p-4 relative block"
                  style={{ transform: `rotate(${i % 2 === 0 ? '-0.4' : '0.5'}deg)` }}
                >
                  <span className="absolute -top-2 left-6 w-10 h-4 bg-[var(--highlight)] opacity-70 rotate-[-4deg]" />
                  <p className="font-display text-lg text-ink leading-snug mb-1">{rec.title}</p>
                  <p className="font-label text-[9px] text-ink-faint">{rec.reason}</p>
                </button>
              ))}
            </div>
          )}
        </motion.section>

        {/* Errata — actionable suggestions as a checklist */}
        <motion.section initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
          <h3 className="font-label text-[10px] text-ink-soft border-b-[1.5px] border-[var(--ink)] pb-2 mb-4">
            Errata & to-dos
          </h3>
          <div className="space-y-4">
            {insights.suggestions.map((s) => (
              <div key={s.title} className="flex gap-3">
                <span className="mt-1 w-3.5 h-3.5 border-[1.5px] border-[var(--ink)] rounded-sm flex-shrink-0" />
                <div>
                  <p className="text-ink text-sm font-medium leading-snug">{s.title}</p>
                  <p className="text-ink-faint text-xs mt-0.5 leading-relaxed">{s.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.section>
      </div>

      {/* Colophon rule */}
      <div className="mt-14 pt-4 border-t border-[var(--ink-line)] flex items-center justify-between">
        <p className="font-label text-[8px] text-ink-faint">
          compiled locally · nothing left this device
        </p>
        <p className="font-label text-[8px] text-ink-faint">supermind almanac</p>
      </div>
    </div>
  );
}
