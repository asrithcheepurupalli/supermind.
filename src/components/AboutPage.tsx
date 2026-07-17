import React from 'react';
import { motion, useScroll, useTransform, useInView, AnimatePresence, type MotionValue } from 'framer-motion';
import { ArrowLeft, ArrowRight, Search } from 'lucide-react';
import MadeBadge from './MadeBadge';
import { useLenis } from '../hooks/useLenis';
import ThemeToggle from './ThemeToggle';

interface AboutPageProps {
  onBack: () => void;
}

/* ---------------------------------------------------------------- helpers */

// Types out `text` while active, then rests. Resets when inactive.
function TypeLine({ text, active, speed = 34, className = '' }: {
  text: string; active: boolean; speed?: number; className?: string;
}) {
  const [n, setN] = React.useState(0);
  React.useEffect(() => {
    if (!active) { setN(0); return; }
    if (n >= text.length) return;
    const t = setTimeout(() => setN(v => v + 1), speed);
    return () => clearTimeout(t);
  }, [active, n, text.length, speed]);
  return (
    <span className={className}>
      {text.slice(0, n)}
      <span className={`inline-block w-[2px] h-[1em] align-[-0.15em] bg-[var(--accent)] ${active && n < text.length ? 'animate-pulse' : 'opacity-0'}`} />
    </span>
  );
}

// A scrap of paper that fades as the reader scrolls past it.
function Scrap({ progress, from, text, rotate, className }: {
  progress: MotionValue<number>; from: number; text: string; rotate: number; className?: string;
}) {
  const opacity = useTransform(progress, [from, from + 0.22], [1, 0.07]);
  const filter = useTransform(progress, [from, from + 0.22], ['blur(0px)', 'blur(2.5px)']);
  const y = useTransform(progress, [from, from + 0.3], [0, -18]);
  return (
    <motion.div
      style={{ opacity, filter, y, rotate }}
      className={`card-ink-static rounded-sm px-4 py-3 font-display text-lg leading-snug ${className || ''}`}
    >
      {text}
    </motion.div>
  );
}

// Counts up to `value` when scrolled into view.
function CountUp({ value, format }: { value: number; format?: (n: number) => string }) {
  const ref = React.useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, margin: '-15% 0px' });
  const [n, setN] = React.useState(0);
  React.useEffect(() => {
    if (!inView) return;
    if (value === 0) { setN(0); return; }
    const start = performance.now();
    const dur = 1100;
    let raf: number;
    const tick = (t: number) => {
      const p = Math.min(1, (t - start) / dur);
      setN(Math.round(value * (1 - Math.pow(1 - p, 3))));
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [inView, value]);
  return <span ref={ref} className="tabular-nums">{format ? format(n) : n}</span>;
}

// One step of the follow-a-thought story. Reports when it owns the viewport.
function Step({ index, kicker, title, children, onActive }: {
  index: number; kicker: string; title: string; children: React.ReactNode;
  onActive: (i: number) => void;
}) {
  const ref = React.useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { margin: '-45% 0px -45% 0px' });
  React.useEffect(() => { if (inView) onActive(index); }, [inView, index, onActive]);
  return (
    <div ref={ref} className="min-h-[62vh] flex flex-col justify-center">
      <p className="font-label text-[10px] text-accent mb-3">{kicker}</p>
      <h3 className="font-display text-3xl md:text-4xl text-ink mb-4">{title}</h3>
      <div className="text-ink-soft leading-relaxed max-w-md">{children}</div>
    </div>
  );
}

/* ----------------------------------------------------- the pinned machine */

const NOTE = 'Call nonna about the pasta recipe, the one with the burnt butter. Sunday?';

function MachineDemo({ step }: { step: number }) {
  return (
    <div className="card-ink-static rounded-sm p-6 min-h-[380px] relative overflow-hidden">
      <div className="flex items-center justify-between mb-5">
        <span className="font-label text-[9px] text-ink-faint">
          {['a fresh page', 'the librarian', 'the book', 'the constellation', 'recall'][step]}
        </span>
        <span className="font-label text-[9px] text-ink-faint tabular-nums">{step + 1} / 5</span>
      </div>

      <AnimatePresence mode="wait">
        {/* 1 · write */}
        {step === 0 && (
          <motion.div key="write" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="ruled pt-1">
            <TypeLine text={NOTE} active className="font-display text-2xl leading-[32px] text-ink" />
            <div className="mt-8 flex items-center gap-2">
              <kbd className="keycap text-[10px] !py-0.5 !px-1.5">⌘</kbd>
              <kbd className="keycap text-[10px] !py-0.5 !px-1.5">N</kbd>
              <span className="font-label text-[9px] text-ink-faint ml-1">from anywhere</span>
            </div>
          </motion.div>
        )}

        {/* 2 · organize */}
        {step === 1 && (
          <motion.div key="organize" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
            <p className="font-display text-lg text-ink-soft leading-snug mb-5 line-clamp-2">{NOTE}</p>
            {[
              ['reads the note', ''],
              ['writes tags', '#family #recipes'],
              ['picks a shelf', 'personal'],
              ['"Sunday" spotted', 'reminder set'],
            ].map(([label, out], i) => (
              <motion.div
                key={label}
                initial={{ opacity: 0, x: -8 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.25 + i * 0.4 }}
                className="flex items-center justify-between py-2 border-b border-[var(--ink-line)] last:border-0"
              >
                <span className="text-ink text-sm">{label}</span>
                <span className="font-label text-[9px] text-accent">{out || 'done'}</span>
              </motion.div>
            ))}
            <motion.p
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 2 }}
              className="font-label text-[9px] text-ink-faint mt-4"
            >
              0.2s · on this device · nothing sent anywhere
            </motion.p>
          </motion.div>
        )}

        {/* 3 · file */}
        {step === 2 && (
          <motion.div key="file" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
            <p className="font-display text-2xl text-ink mb-4">Today <span className="text-ink-faint text-base">1</span></p>
            <motion.div
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
              className="grid grid-cols-[56px_1fr] gap-3 border-y border-[var(--ink-line)] py-3"
            >
              <div className="text-right">
                <div className="font-label text-[9px] text-ink-faint">6:12pm</div>
                <div className="text-ink-faint text-sm">✎</div>
              </div>
              <div>
                <p className="font-display text-lg text-ink leading-snug">{NOTE}</p>
                <div className="flex gap-3 mt-1.5 font-label text-[9px] text-ink-faint">
                  <span>#family</span><span>#recipes</span>
                  <span className="text-accent">reminder set</span>
                </div>
              </div>
            </motion.div>
            <motion.span
              initial={{ opacity: 0, scale: 2, rotate: 6 }} animate={{ opacity: 1, scale: 1, rotate: -2 }}
              transition={{ delay: 0.8, type: 'spring', stiffness: 300, damping: 16 }}
              className="stamp absolute bottom-6 right-6"
            >
              Filed
            </motion.span>
          </motion.div>
        )}

        {/* 4 · connect */}
        {step === 3 && (
          <motion.div key="connect" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
            <svg viewBox="0 0 340 240" className="w-full">
              {[
                ['M85 170 Q 150 120 215 78', 0.3],
                ['M85 170 Q 160 190 248 160', 0.7],
                ['M215 78 Q 235 120 248 160', 1.1],
              ].map(([d, delay]) => (
                <motion.path
                  key={d as string} d={d as string} fill="none" stroke="var(--ink)" strokeWidth="1.2" opacity="0.4"
                  initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: delay as number, duration: 0.7 }}
                />
              ))}
              {[
                [85, 170, 26, '#family', true, 0.1],
                [215, 78, 18, '#recipes', true, 0.5],
                [248, 160, 13, '#food', false, 0.9],
              ].map(([cx, cy, r, label, filled, delay]) => (
                <motion.g key={label as string} initial={{ opacity: 0, scale: 0.6 }} animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: delay as number, type: 'spring', stiffness: 260, damping: 18 }}>
                  <circle cx={cx as number} cy={cy as number} r={r as number}
                    fill={filled ? 'var(--accent)' : 'var(--paper-raised)'} stroke="var(--ink)" strokeWidth="1.6" />
                  <text x={cx as number} y={(cy as number) - (r as number) - 8} textAnchor="middle"
                    style={{ font: '500 10px JetBrains Mono, monospace', fill: 'var(--ink)' }}>
                    {(label as string).toUpperCase()}
                  </text>
                </motion.g>
              ))}
            </svg>
            <p className="font-label text-[9px] text-ink-faint text-center">
              tags that appear together are drawn together
            </p>
          </motion.div>
        )}

        {/* 5 · find */}
        {step === 4 && (
          <motion.div key="find" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
            <div className="flex items-center gap-3 border-[1.5px] border-ink rounded-sm px-4 py-3 mb-5">
              <Search size={14} className="text-ink-faint" />
              <TypeLine text="nonaa" active speed={110} className="font-display text-xl text-ink" />
            </div>
            <motion.div
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.4 }}
              className="card-ink-static rounded-sm p-4 border-l-[3px] !border-l-[var(--accent)]"
            >
              <p className="font-display text-lg text-ink leading-snug">
                Call <span className="marker">nonna</span> about the pasta recipe...
              </p>
              <p className="font-label text-[9px] text-ink-faint mt-2">the book · 3 months ago · #family</p>
            </motion.div>
            <motion.p
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.9 }}
              className="font-label text-[9px] text-ink-faint mt-4"
            >
              found in 0.02s · typo forgiven
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* --------------------------------------------------- architecture flipper */

function ArchitectureFlip() {
  const [side, setSide] = React.useState<'them' | 'us'>('them');
  return (
    <div>
      <div className="flex justify-center gap-0 mb-10">
        {([['them', 'everyone else'], ['us', 'supermind']] as const).map(([key, label]) => (
          <button
            key={key}
            onClick={() => setSide(key)}
            className={`haptic font-label text-[10px] px-5 py-2.5 border-[1.5px] border-ink first:rounded-l-sm last:rounded-r-sm last:border-l-0 transition-colors ${
              side === key ? 'bg-ink text-paper' : 'bg-transparent text-ink-soft hover:text-ink'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {side === 'them' ? (
          <motion.div key="them" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
            className="grid md:grid-cols-[1fr_auto_1.2fr] gap-6 items-center max-w-3xl mx-auto">
            <div className="border-[1.5px] border-[var(--ink-line)] rounded-sm p-5 text-center">
              <p className="font-label text-[9px] text-ink-faint mb-3">your device</p>
              <p className="font-display text-xl text-ink-faint italic">a login screen</p>
            </div>
            <div className="font-label text-[9px] text-ink-faint text-center rotate-90 md:rotate-0">
              every keystroke →
            </div>
            <div className="card-ink-static rounded-sm p-5">
              <p className="font-label text-[9px] text-ink-faint mb-3">their server</p>
              <div className="flex flex-wrap gap-2">
                {['your notes', 'your habits', 'your searches', 'ad signals', 'training data', 'the breach, eventually'].map(t => (
                  <span key={t} className="font-label text-[9px] text-ink px-2 py-1 border border-[var(--ink-line)] rounded-sm">{t}</span>
                ))}
              </div>
              <p className="font-label text-[9px] text-accent mt-4">cancel your card and the door locks behind you</p>
            </div>
          </motion.div>
        ) : (
          <motion.div key="us" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}
            className="grid md:grid-cols-[1.2fr_auto_1fr] gap-6 items-center max-w-3xl mx-auto">
            <div className="card-ink-static rounded-sm p-5">
              <p className="font-label text-[9px] text-ink-faint mb-3">your device</p>
              <div className="flex flex-wrap gap-2">
                {['your notes', 'the organizer', 'the search index', 'the graph', 'the encryption key', 'everything, actually'].map(t => (
                  <span key={t} className="font-label text-[9px] text-ink px-2 py-1 border border-[var(--ink-line)] rounded-sm">{t}</span>
                ))}
              </div>
              <p className="font-label text-[9px] text-accent mt-4">works offline, because there is nothing to be online for</p>
            </div>
            <div className="font-label text-[9px] text-ink-faint text-center">
              0 bytes →
            </div>
            <div className="border-[1.5px] border-dashed border-[var(--ink-line)] rounded-sm p-5 text-center relative">
              <p className="font-label text-[9px] text-ink-faint mb-3">the server</p>
              <p className="font-display text-xl text-ink-faint italic line-through decoration-[var(--accent)]">does not exist</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ------------------------------------------------------------------ page */

const SCRAPS: Array<[string, number, number, string]> = [
  ['that article about sleep you meant to finish', 0.05, -3, ''],
  ['the gift idea for maya', 0.12, 2, 'ml-10'],
  ['the startup idea from the shower', 0.18, -1.5, ''],
  ['what nonna said about burnt butter', 0.26, 2.5, 'ml-6'],
  ['a better name for the project', 0.33, -2, ''],
  ['that quote about attention', 0.4, 1.5, 'ml-12'],
];

export default function AboutPage({ onBack }: AboutPageProps) {
  useLenis();
  const [step, setStep] = React.useState(0);
  const onActive = React.useCallback((i: number) => setStep(i), []);
  const fadeRef = React.useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: fadeRef, offset: ['start 0.7', 'end 0.4'] });

  return (
    <div className="min-h-screen bg-paper text-ink noise">
      {/* Header */}
      <header className="border-b-[1.5px] border-ink bg-paper sticky top-0 z-40 safe-area-top">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-baseline gap-1">
            <span className="font-display text-xl tracking-tight">supermind</span>
            <span className="w-1.5 h-1.5 rounded-full bg-accent inline-block" />
          </div>
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <button
              onClick={onBack}
              className="btn-paper haptic px-4 py-2 rounded-sm font-label text-[10px] inline-flex items-center gap-2"
            >
              <ArrowLeft size={12} /> Back
            </button>
          </div>
        </div>
      </header>

      {/* Opening line */}
      <section className="max-w-5xl mx-auto px-6 pt-28 pb-10 text-center">
        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="font-label text-[10px] text-accent mb-6">
          [ about supermind ]
        </motion.p>
        <motion.h1
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
          className="font-display text-5xl md:text-7xl tracking-tight leading-[1.02]"
        >
          This is the story
          <br />
          of <em className="marker">a thought</em>.
        </motion.h1>
      </section>

      {/* Chapter: the fade */}
      <section ref={fadeRef} className="max-w-5xl mx-auto px-6 py-20 grid md:grid-cols-2 gap-16 items-start">
        <div className="md:sticky md:top-32">
          <p className="font-label text-[10px] text-accent mb-3">chapter one</p>
          <h2 className="font-display text-4xl text-ink mb-5">You have six thousand a day.</h2>
          <p className="text-ink-soft leading-relaxed max-w-md">
            The good ones arrive in the shower, on a walk, halfway through someone
            else's sentence. And because a thought weighs nothing, nothing holds it
            down. By evening most of them are gone, and all you keep is the feeling
            that one of them was important.
          </p>
          <p className="text-ink leading-relaxed max-w-md mt-4 font-medium">
            Watch the margin. That is what forgetting looks like.
          </p>
        </div>
        <div className="space-y-4 pt-4 pb-24">
          {SCRAPS.map(([text, from, rotate, cls]) => (
            <Scrap key={text} progress={scrollYProgress} from={from} text={text} rotate={rotate} className={cls} />
          ))}
          <motion.p
            initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true, margin: '-20%' }}
            className="font-display italic text-ink-faint text-lg pt-2 ml-4"
          >
            ...gone.
          </motion.p>
        </div>
      </section>

      {/* Chapter: why we made it */}
      <section className="border-y-[1.5px] border-ink bg-paper-raised dot-grid">
        <div className="max-w-3xl mx-auto px-6 py-24">
          <p className="font-label text-[10px] text-accent mb-3 text-center">chapter two · why we built it</p>
          <motion.div
            initial={{ opacity: 0, y: 14, rotate: 0 }} whileInView={{ opacity: 1, y: 0, rotate: -0.6 }}
            viewport={{ once: true, margin: '-15%' }}
            className="card-ink-static rounded-sm p-8 md:p-12 relative mt-6"
          >
            <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 w-20 h-5 bg-[var(--accent-soft)] border border-[var(--ink-line)] rotate-[-2deg]" />
            <div className="font-display text-xl md:text-2xl leading-relaxed text-ink space-y-5">
              <p>
                We kept losing things we cared about to apps we didn't trust. Every
                tool wanted an account, then a subscription, then our attention, then
                our data. One of them shut down and took four years of notes with it.
              </p>
              <p>
                The paper notebook never asked for any of that. It had exactly one
                flaw: it couldn't find anything.
              </p>
              <p>
                So we built the notebook back, and gave it the one thing paper never
                had: <em className="marker">recall</em>. A place to think that belongs
                to the person doing the thinking.
              </p>
            </div>
            <p className="font-label text-[10px] text-ink-faint mt-8">signed, asrith · made.</p>
          </motion.div>
        </div>
      </section>

      {/* Chapter: follow a thought */}
      <section className="max-w-5xl mx-auto px-6 py-24">
        <div className="text-center mb-4">
          <p className="font-label text-[10px] text-accent mb-3">chapter three · how it works</p>
          <h2 className="font-display text-4xl md:text-5xl text-ink">
            Follow one thought <em className="marker-accent">through the machine</em>.
          </h2>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20">
          <div>
            <Step index={0} kicker="i · write" title="It starts with a keystroke." onActive={onActive}>
              <p>
                ⌘N opens a fresh page from anywhere in the app. You write the way you
                talk. There are no fields to fill, no folder to choose, no save button
                to find. The friction is the enemy; the keystroke is the whole ritual. And when the thought arrives somewhere else, paste it anywhere in the app or share it from your phone, and it files itself the same way.
              </p>
            </Step>
            <Step index={1} kicker="ii · organize" title="A librarian reads it." onActive={onActive}>
              <p>
                The moment you file it, a small organizer goes to work on your device
                and finishes in about a fifth of a second. It writes the tags, picks a
                shelf, and notices that the word Sunday probably means a reminder. No
                model, no API, no note ever leaves the room.
              </p>
            </Step>
            <Step index={2} kicker="iii · file" title="It lands in the book." onActive={onActive}>
              <p>
                One continuous journal, newest ink first, each day under its own
                heading. No folders to maintain, no filing debt to feel guilty about.
                The book keeps itself.
              </p>
            </Step>
            <Step index={3} kicker="iv · connect" title="The constellation grows." onActive={onActive}>
              <p>
                Tags that appear together get drawn together. Save enough and a map of
                your actual interests forms on its own: not the person you plan to be,
                the person the notes say you are.
              </p>
            </Step>
            <Step index={4} kicker="v · find" title="Months later, it surfaces." onActive={onActive}>
              <p>
                You half-remember and mistype it, and it is already on screen. Search
                covers every word, tag, and summary you have, and forgives the typo.
                Finding the thought takes less time than losing it did.
              </p>
            </Step>
          </div>

          <div className="hidden lg:block">
            <div className="sticky top-28">
              <MachineDemo step={step} />
            </div>
          </div>
        </div>

        {/* Mobile: single demo after the steps */}
        <div className="lg:hidden mt-8">
          <MachineDemo step={step} />
        </div>
      </section>

      {/* Chapter: why it's yours */}
      <section className="border-y-[1.5px] border-ink bg-paper-raised">
        <div className="max-w-5xl mx-auto px-6 py-24">
          <div className="text-center mb-12">
            <p className="font-label text-[10px] text-accent mb-3">chapter four · why use it</p>
            <h2 className="font-display text-4xl md:text-5xl text-ink mb-4">
              Two architectures. Pick where <em className="marker">your mind lives</em>.
            </h2>
            <p className="text-ink-soft max-w-xl mx-auto">
              Most tools are a database you rent. This one is a notebook you own.
              Flip between the two and count the arrows.
            </p>
          </div>
          <ArchitectureFlip />
        </div>
      </section>

      {/* Numbers */}
      <section className="max-w-5xl mx-auto px-6 py-24">
        <p className="font-label text-[10px] text-ink-soft text-center mb-12">numbers we are proud of</p>
        <div className="grid grid-cols-2 md:grid-cols-5 border-y-2 border-[var(--ink)] divide-x divide-[var(--ink-line)]">
          {[
            { v: 0, label: 'accounts required' },
            { v: 0, label: 'servers involved' },
            { v: 0, label: 'bytes uploaded' },
            { v: 250000, label: 'key-stretching rounds', fmt: (n: number) => n.toLocaleString() },
            { v: 1, label: 'vermilion' },
          ].map(({ v, label, fmt }) => (
            <div key={label} className="py-6 px-4 text-center">
              <p className="font-display text-4xl text-ink leading-none">
                <CountUp value={v} format={fmt} />
              </p>
              <p className="font-label text-[8px] text-ink-faint mt-2">{label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* The honest part */}
      <section className="max-w-5xl mx-auto px-6 pb-24">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-baseline gap-3 mb-8">
            <span className="stamp">No fine print</span>
            <h2 className="font-display text-3xl text-ink">What it is not</h2>
          </div>
          <div className="space-y-5">
            {[
              ['It does not sync.', 'Local first means exactly that. Export and import moves your data between machines.'],
              ['It is not an AI.', 'The organizer is keyword heuristics, fast and private. Useful, not clever.'],
              ['It is not a media library.', 'Browser storage holds about 5MB, so files over 1.5MB are recorded by name only.'],
              ['It cannot reset your passphrase.', 'Real encryption has no back door. Keep a backup.'],
            ].map(([title, detail]) => (
              <div key={title} className="flex gap-3">
                <span className="mt-2 w-1.5 h-1.5 rounded-full bg-accent flex-shrink-0" />
                <p className="text-sm leading-relaxed">
                  <strong className="text-ink font-semibold">{title}</strong>{' '}
                  <span className="text-ink-soft">{detail}</span>
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="max-w-5xl mx-auto px-6 pb-24">
        <div className="card-ink-static rounded-sm px-8 py-14 text-center dot-grid">
          <h2 className="font-display text-4xl md:text-5xl text-ink mb-3">
            The next good thought is <em className="marker">already on its way</em>.
          </h2>
          <p className="text-ink-soft mb-8">Thirty seconds. A name. That is the whole signup.</p>
          <button
            onClick={onBack}
            className="btn-ink haptic px-8 py-3.5 rounded-sm font-semibold inline-flex items-center gap-2"
          >
            Get Started <ArrowRight size={16} />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t-[1.5px] border-ink">
        <div className="max-w-5xl mx-auto px-6 py-8 flex flex-col items-center gap-3">
          <MadeBadge />
          <p className="font-label text-[9px] text-ink-faint">
            © {new Date().getFullYear()} supermind · runs entirely on your device
          </p>
        </div>
      </footer>
    </div>
  );
}
