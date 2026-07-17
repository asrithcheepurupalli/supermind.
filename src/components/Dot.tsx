import React from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import { useStore, defaultFilter } from '../store/useStore';
import { hapticTap } from '../utils/haptics';

// Dot reads the room: no keyboard talk on touch screens, no paste advice
// where paste is not a gesture, share-sheet talk only where it exists.
const isTouch = typeof window !== 'undefined' && window.matchMedia('(pointer: coarse)').matches;
const isStandalone = typeof window !== 'undefined'
  && (window.matchMedia('(display-mode: standalone)').matches
    || (navigator as unknown as { standalone?: boolean }).standalone === true);

// Dot: the full stop, alive. The librarian who files everything finally
// gets a body: a vermilion period with blinking eyes that suggests the
// next move. One line at a time, never twice in a row, easy to dismiss.

interface Suggestion {
  id: string;
  text: string;
  action?: { label: string; run: () => void };
}

function useBlink() {
  const [blink, setBlink] = React.useState(false);
  React.useEffect(() => {
    let alive = true;
    let t: number;
    const loop = () => {
      t = window.setTimeout(() => {
        if (!alive) return;
        setBlink(true);
        window.setTimeout(() => { if (alive) setBlink(false); }, 130);
        loop();
      }, 2400 + Math.random() * 3200);
    };
    loop();
    return () => { alive = false; window.clearTimeout(t); };
  }, []);
  return blink;
}

// Pupils drift a little toward the cursor.
function useGaze(max = 2.5) {
  const [gaze, setGaze] = React.useState({ x: 0, y: 0 });
  React.useEffect(() => {
    let raf = 0;
    const onMove = (e: MouseEvent) => {
      cancelAnimationFrame(raf);
      raf = requestAnimationFrame(() => {
        const nx = (e.clientX / window.innerWidth - 0.85) * 2;
        const ny = (e.clientY / window.innerHeight - 0.85) * 2;
        setGaze({
          x: Math.max(-1, Math.min(1, nx)) * max,
          y: Math.max(-1, Math.min(1, ny)) * max,
        });
      });
    };
    window.addEventListener('mousemove', onMove);
    return () => { window.removeEventListener('mousemove', onMove); cancelAnimationFrame(raf); };
  }, [max]);
  return gaze;
}

function TypeOut({ text }: { text: string }) {
  const [n, setN] = React.useState(0);
  React.useEffect(() => { setN(0); }, [text]);
  React.useEffect(() => {
    if (n >= text.length) return;
    const t = setTimeout(() => setN(v => v + 2), 22);
    return () => clearTimeout(t);
  }, [n, text]);
  return <>{text.slice(0, n)}</>;
}

export default function Dot() {
  const {
    activeView, content, settings, setUploadModalOpen, setCommandPaletteOpen,
    setActiveView, setFilter, setSettingsModalOpen, lastExportAt,
  } = useStore();

  const enabled = settings.display.companion !== false;
  const [hidden, setHidden] = React.useState(false); // session dismiss
  const [bubbleOpen, setBubbleOpen] = React.useState(false);
  const [suggestion, setSuggestion] = React.useState<Suggestion | null>(null);
  const lastIdRef = React.useRef<string>('');
  const cycleRef = React.useRef(0);
  const blink = useBlink();
  const gaze = useGaze();

  const items = React.useMemo(() => content.filter(c => !c.metadata?.isGuide), [content]);

  const suggestions = React.useMemo((): Suggestion[] => {
    const now = new Date();
    const hour = now.getHours();
    const todayKey = now.toDateString();
    const todayCount = items.filter(i => i.timestamp.toDateString() === todayKey).length;
    const overdue = items.filter(i => i.reminderDate && i.reminderDate.getTime() < Date.now()).length;

    // streak, cheaply
    const days = new Set(items.map(i => i.timestamp.toDateString()));
    let streak = 0;
    const cursor = new Date();
    if (!days.has(cursor.toDateString())) cursor.setDate(cursor.getDate() - 1);
    while (days.has(cursor.toDateString())) { streak++; cursor.setDate(cursor.getDate() - 1); }

    const list: Suggestion[] = [];

    if (overdue > 0) {
      list.push({
        id: 'overdue',
        text: `You have ${overdue} overdue reminder${overdue > 1 ? 's' : ''} in the book. Want a look?`,
        action: { label: 'show me', run: () => { setFilter(defaultFilter); setActiveView('timeline'); } },
      });
    }
    if (hour >= 18 && streak > 1 && todayCount === 0) {
      list.push({
        id: 'streak',
        text: `Your streak is at ${streak} days and today is still blank. One line keeps it alive.`,
        action: { label: 'write it', run: () => setUploadModalOpen(true) },
      });
    }
    if (activeView === 'home' && todayCount === 0) {
      list.push({
        id: 'blank',
        text: hour < 12
          ? 'Morning. Shall we write the first thought down before it evaporates?'
          : 'The page is blank so far. Got a thought for me to file?',
        action: { label: 'a fresh page', run: () => setUploadModalOpen(true) },
      });
    }
    if (activeView === 'home' && todayCount > 0) {
      list.push({
        id: 'going',
        text: `${todayCount} filed today. Anything else rattling around up there?`,
        action: { label: 'one more', run: () => setUploadModalOpen(true) },
      });
    }
    if (activeView === 'timeline' && items.length > 8) {
      list.push({
        id: 'palette',
        text: 'Looking for something? I am faster than scrolling.',
        action: { label: isTouch ? 'open search' : 'open ⌘K', run: () => setCommandPaletteOpen(true) },
      });
    }
    if (activeView === 'timeline') {
      list.push({
        id: 'passiton',
        text: 'Open any note and try "pass it on". The link carries the note inside it.',
      });
      list.push({
        id: 'checkbox',
        text: 'Start a line with "- [ ]" and it becomes a checkbox you can tick right here in the book.',
      });
    }
    if (activeView === 'graph') {
      list.push({
        id: 'graph',
        text: 'Every dot up there is a tag. The big vermilion ones are your obsessions.',
      });
    }
    if (activeView === 'almanac') {
      list.push({
        id: 'almanac',
        text: 'I compiled all of this from your own ink. Nothing left the device.',
      });
    }
    if (activeView === 'profile') {
      list.push({
        id: 'flyleaf',
        text: 'Your flyleaf. I work for you only; I never phone home.',
      });
    }
    // The only copy of this notebook lives on this device. Past a certain
    // weight, that deserves a word.
    const backupOverdue = !lastExportAt
      || Date.now() - new Date(lastExportAt).getTime() > 30 * 24 * 60 * 60 * 1000;
    if (items.length >= 15 && backupOverdue) {
      list.push({
        id: 'backup',
        text: lastExportAt
          ? 'It has been a month since this notebook last left the device. A fresh backup takes one tap.'
          : 'The only copy of this notebook lives on this device. Pass it to another one, or keep a backup file somewhere safe.',
        action: { label: 'open the drawer', run: () => setSettingsModalOpen(true, 'data') },
      });
    }
    if (activeView === 'timeline' && items.some(i => i.reminderDate && i.reminderDate.getTime() > Date.now())) {
      list.push({
        id: 'icsnudge',
        text: 'I can only ring while the book is open. The calendar action on a dated entry makes your phone do the ringing.',
      });
    }
    if (!isTouch) {
      list.push({
        id: 'paste',
        text: 'Read something good? Paste the link anywhere and I will file it.',
      });
    } else if (isStandalone) {
      list.push({
        id: 'sharesheet',
        text: 'I live in your share sheet now. Send me anything from any app and I will file it.',
      });
    }
    return list;
  }, [activeView, items, lastExportAt, setUploadModalOpen, setCommandPaletteOpen, setActiveView, setFilter, setSettingsModalOpen]);

  // Speak when the view changes: pick the top suggestion not said last time.
  React.useEffect(() => {
    if (!enabled || hidden) return;
    const pick = suggestions.find(s => s.id !== lastIdRef.current) ?? suggestions[0];
    if (!pick) return;
    const appear = setTimeout(() => {
      lastIdRef.current = pick.id;
      setSuggestion(pick);
      setBubbleOpen(true);
    }, 1400);
    const vanish = setTimeout(() => setBubbleOpen(false), 15000);
    return () => { clearTimeout(appear); clearTimeout(vanish); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeView, enabled, hidden]);

  // If the spoken suggestion's condition disappears (the user wrote the
  // thought Dot asked for, cleared the reminders, and so on), swap the
  // bubble for a fresh line instead of leaving a stale one hanging.
  React.useEffect(() => {
    if (!bubbleOpen || !suggestion) return;
    if (suggestions.some(s => s.id === suggestion.id)) return;
    const next = suggestions[0];
    if (next) {
      lastIdRef.current = next.id;
      setSuggestion(next);
    } else {
      setBubbleOpen(false);
    }
  }, [suggestions, bubbleOpen, suggestion]);

  if (!enabled || hidden) return null;

  const cycle = () => {
    hapticTap();
    if (bubbleOpen) {
      // next tip
      cycleRef.current += 1;
      const next = suggestions[(suggestions.findIndex(s => s.id === lastIdRef.current) + 1) % suggestions.length];
      lastIdRef.current = next.id;
      setSuggestion(next);
    } else {
      setBubbleOpen(true);
    }
  };

  return (
    <div className="fixed bottom-24 right-5 sm:right-6 z-40 print:!hidden flex flex-col items-end gap-3">
      {/* No AnimatePresence: the typewriter keeps re-rendering during an
          exit, which strands ghost bubbles. Enter animation only. */}
      {bubbleOpen && suggestion && (
          <motion.div
            key={suggestion.id}
            initial={{ opacity: 0, y: 10, scale: 0.92 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ type: 'spring', stiffness: 320, damping: 22 }}
            className="card-ink-static rounded-sm p-4 max-w-[240px] relative -rotate-[0.5deg]"
          >
            <button
              onClick={() => setBubbleOpen(false)}
              aria-label="Dismiss"
              className="absolute top-2 right-2 text-ink-faint hover:text-ink transition-colors"
            >
              <X size={11} />
            </button>
            <p className="font-label text-[8px] text-accent mb-1.5">dot · your librarian</p>
            <p className="font-display text-base leading-snug text-ink pr-3 min-h-[20px]">
              <TypeOut text={suggestion.text} />
            </p>
            {suggestion.action && (
              <button
                onClick={() => { hapticTap(); suggestion.action?.run(); setBubbleOpen(false); }}
                className="btn-ink haptic px-3 py-1.5 rounded-sm font-label text-[9px] mt-3"
              >
                {suggestion.action.label}
              </button>
            )}
            <button
              onClick={() => { setHidden(true); }}
              className="block font-label text-[8px] text-ink-faint hover:text-ink transition-colors mt-2.5"
            >
              not today, dot
            </button>
            {/* tail */}
            <span aria-hidden className="absolute -bottom-[7px] right-7 w-3 h-3 bg-paper-raised border-b-[1.5px] border-r-[1.5px] border-ink rotate-45" />
          </motion.div>
      )}

      <motion.button
        initial={{ y: 80, opacity: 0, scale: 0.6 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        transition={{ type: 'spring', stiffness: 260, damping: 14, delay: 0.8 }}
        whileHover={{ scale: 1.12, rotate: -6 }}
        whileTap={{ scale: 0.88 }}
        onClick={cycle}
        aria-label="Dot, your librarian"
        title="Dot"
        className="haptic w-11 h-11 rounded-full bg-accent border-[1.5px] border-ink shadow-[3px_3px_0_var(--offset-shadow)] flex items-center justify-center relative"
      >
        {/* eyes */}
        <motion.span
          animate={{ scaleY: blink ? 0.12 : 1, x: gaze.x, y: gaze.y }}
          transition={{ scaleY: { duration: 0.08 }, x: { duration: 0.25 }, y: { duration: 0.25 } }}
          className="flex gap-[7px]"
        >
          <span className="w-[5px] h-[7px] rounded-full bg-[#17150f]" />
          <span className="w-[5px] h-[7px] rounded-full bg-[#17150f]" />
        </motion.span>
      </motion.button>
    </div>
  );
}
