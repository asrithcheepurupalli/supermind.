import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { useStore } from '../store/useStore';

// "The legend": the map key for the whole notebook. Opened with "?".
const GROUPS: Array<{ title: string; rows: Array<{ keys: string[]; action: string }> }> = [
  {
    title: 'Anywhere',
    rows: [
      { keys: ['⌘', 'K'], action: 'command palette' },
      { keys: ['⌘', 'N'], action: 'a fresh page' },
      { keys: ['⌘', 'V'], action: 'paste anything, it files itself' },
      { keys: ['⌘', ','], action: 'adjustments' },
      { keys: ['?'], action: 'this legend' },
      { keys: ['esc'], action: 'close whatever is open' },
    ],
  },
  {
    title: 'Turn the page',
    rows: [
      { keys: ['H'], action: "today's page" },
      { keys: ['T'], action: 'the book' },
      { keys: ['G'], action: 'the constellation' },
      { keys: ['A'], action: 'the almanac' },
    ],
  },
  {
    title: 'Filing',
    rows: [
      { keys: ['⌘', '1–5'], action: 'jump between shelves' },
      { keys: ['⌘', '⇧', 'F'], action: 'clear every filter' },
      { keys: ['⌘', '↵'], action: 'file the note you are writing' },
    ],
  },
];

export default function Legend() {
  const { isLegendOpen, setLegendOpen } = useStore();

  return (
    <AnimatePresence>
      {isLegendOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/40 backdrop-blur-[2px]"
            onClick={() => setLegendOpen(false)}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.98, y: 12 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.98, y: 12 }}
            className="card-ink-static relative w-full max-w-lg rounded-sm max-h-[85vh] overflow-y-auto custom-scrollbar"
          >
            <div className="flex items-start justify-between px-7 pt-5 pb-4 border-b border-[var(--ink-line)]">
              <div>
                <p className="font-label text-[9px] text-ink-faint">map key</p>
                <h2 className="font-display text-2xl text-ink leading-tight">
                  The legend<span className="text-accent">.</span>
                </h2>
              </div>
              <button
                onClick={() => setLegendOpen(false)}
                className="text-ink-faint hover:text-ink transition-colors mt-1"
                aria-label="Close legend"
              >
                <X size={18} />
              </button>
            </div>

            <div className="px-7 py-5 space-y-6">
              {GROUPS.map((group) => (
                <section key={group.title}>
                  <h3 className="font-label text-[9px] text-accent mb-2.5">{group.title}</h3>
                  <div className="space-y-1.5">
                    {group.rows.map((row) => (
                      <div key={row.action} className="flex items-baseline gap-2">
                        <span className="flex items-center gap-1 flex-shrink-0">
                          {row.keys.map((k) => (
                            <kbd key={k} className="keycap text-[10px] !py-0.5 !px-1.5">{k}</kbd>
                          ))}
                        </span>
                        <span className="flex-1 border-b border-dotted border-[var(--ink-line)] translate-y-[-3px]" />
                        <span className="text-ink-soft text-sm">{row.action}</span>
                      </div>
                    ))}
                  </div>
                </section>
              ))}
            </div>

            <div className="px-7 py-3 border-t border-[var(--ink-line)]">
              <p className="font-label text-[8px] text-ink-faint">
                single letters work anywhere you aren't typing
              </p>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
