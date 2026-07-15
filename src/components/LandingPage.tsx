import React from 'react';
import { motion, useScroll, useTransform, useInView, AnimatePresence } from 'framer-motion';
import MadeBadge from './MadeBadge';
import {
  ArrowRight,
  ArrowDown,
  Command,
  Lock,
  Search,
  PenLine,
  Link as LinkIcon,
  Network,
  History,
  HardDrive,
} from 'lucide-react';

interface LandingPageProps {
  onGetStarted: () => void;
  onAbout: () => void;
}

/* ---------- pieces ---------- */

// Strip of washi tape holding a card down.
function Tape({ className = '' }: { className?: string }) {
  return (
    <div
      aria-hidden
      className={`absolute w-20 h-6 bg-[var(--accent-soft)] border border-[var(--ink-line)] backdrop-blur-[1px] ${className}`}
      style={{ clipPath: 'polygon(2% 0, 98% 4%, 100% 96%, 0 100%)' }}
    />
  );
}

// A pinned index card for the hero collage.
function IndexCard({
  rotate,
  className,
  children,
  delay = 0,
}: {
  rotate: number;
  className?: string;
  children: React.ReactNode;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 40, rotate: rotate * 2 }}
      animate={{ opacity: 1, y: 0, rotate }}
      whileHover={{ rotate: 0, scale: 1.04, zIndex: 30 }}
      transition={{ delay, type: 'spring', stiffness: 120, damping: 15 }}
      className={`card-ink rounded-sm p-5 absolute cursor-default ${className}`}
    >
      {children}
    </motion.div>
  );
}

const MARQUEE_WORDS = ['capture', 'tag', 'connect', 'recall', 'encrypt', 'rediscover'];

// Live type-out loop for the ⌘K strip — makes the palette feel real before you've touched it.
const DEMO_QUERIES = [
  'that pasta recipe…',
  'notes on design systems',
  'what did I save last week?',
  'lock my vault',
];

function TypedQuery() {
  const [text, setText] = React.useState('');
  React.useEffect(() => {
    let qi = 0;
    let ci = 0;
    let deleting = false;
    let timer: number;
    const tick = () => {
      const q = DEMO_QUERIES[qi];
      if (!deleting) {
        ci++;
        setText(q.slice(0, ci));
        if (ci === q.length) {
          deleting = true;
          timer = window.setTimeout(tick, 1500);
          return;
        }
        timer = window.setTimeout(tick, 46 + Math.random() * 50);
      } else {
        ci--;
        setText(q.slice(0, ci));
        if (ci === 0) {
          deleting = false;
          qi = (qi + 1) % DEMO_QUERIES.length;
        }
        timer = window.setTimeout(tick, 24);
      }
    };
    timer = window.setTimeout(tick, 700);
    return () => window.clearTimeout(timer);
  }, []);
  return (
    <span className="font-display text-xl italic text-ink-soft">
      {text}
      <span className="inline-block w-[2px] h-[1.1em] bg-accent align-middle ml-0.5 animate-pulse" />
    </span>
  );
}

/* ---------- the vision, revealed word by word as you scroll ---------- */

// Styles: plain, m = marker, a = accent serif, s = struck through.
const VISION: Array<{ w: string; s?: 'm' | 'a' | 's' }> = [
  ...'Your thoughts are the'.split(' ').map(w => ({ w })),
  ...'most personal data'.split(' ').map(w => ({ w, s: 'm' as const })),
  ...'you will ever produce.'.split(' ').map(w => ({ w })),
  ...'Somehow, we all ended up'.split(' ').map(w => ({ w })),
  ...'renting them back'.split(' ').map(w => ({ w, s: 's' as const })),
  ...'from companies, one subscription at a time.'.split(' ').map(w => ({ w })),
  ...'supermind is our'.split(' ').map(w => ({ w })),
  { w: 'refusal.', s: 'a' },
  ...'A second brain built like a paper notebook:'.split(' ').map(w => ({ w })),
  ...'private by default,'.split(' ').map(w => ({ w, s: 'm' as const })),
  ...'yours forever,'.split(' ').map(w => ({ w, s: 'm' as const })),
  ...'calm on purpose.'.split(' ').map(w => ({ w, s: 'm' as const })),
  ...'It never phones home.'.split(' ').map(w => ({ w })),
  ...'There is no home to phone.'.split(' ').map(w => ({ w, s: 'a' as const })),
];

function VisionWord({ progress, index, total, word, style }: {
  progress: ReturnType<typeof useScroll>['scrollYProgress'];
  index: number; total: number; word: string; style?: 'm' | 'a' | 's';
}) {
  const start = index / total;
  const opacity = useTransform(progress, [start, start + 0.02], [0.08, 1]);
  const cls =
    style === 'm' ? 'marker' :
    style === 'a' ? 'text-accent italic' :
    style === 's' ? 'line-through decoration-[var(--accent)] decoration-[0.06em] text-ink-soft' : '';
  return (
    <motion.span style={{ opacity }} className={`inline ${cls}`}>
      {word}{' '}
    </motion.span>
  );
}

function VisionManifesto() {
  const ref = React.useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start 0.72', 'end 0.55'] });
  return (
    <section className="border-b-[1.5px] border-ink">
      <div ref={ref} className="max-w-4xl mx-auto px-6 py-36">
        <p className="font-label text-[11px] text-accent mb-10">[ why this exists ]</p>
        <p className="font-display text-3xl md:text-5xl leading-[1.28] tracking-tight text-ink">
          {VISION.map((v, i) => (
            <VisionWord
              key={`${v.w}-${i}`}
              progress={scrollYProgress}
              index={i}
              total={VISION.length}
              word={v.w}
              style={v.s}
            />
          ))}
        </p>
      </div>
    </section>
  );
}

/* ---------- three beliefs, one pinned visual ---------- */

function Belief({ index, kicker, title, children, onActive }: {
  index: number; kicker: string; title: string; children: React.ReactNode;
  onActive: (i: number) => void;
}) {
  const ref = React.useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { margin: '-45% 0px -45% 0px' });
  React.useEffect(() => { if (inView) onActive(index); }, [inView, index, onActive]);
  return (
    <div ref={ref} className="min-h-[58vh] flex flex-col justify-center">
      <p className="font-label text-[10px] text-accent mb-3">{kicker}</p>
      <h3 className="font-display text-4xl md:text-5xl text-ink mb-5 leading-tight">{title}</h3>
      <div className="text-ink-soft text-lg leading-relaxed max-w-md">{children}</div>
    </div>
  );
}

function BeliefDemo({ belief }: { belief: number }) {
  return (
    <div className="card-ink-static rounded-sm p-6 min-h-[360px] relative overflow-hidden">
      <div className="font-label text-[9px] text-ink-faint mb-5">
        {['exhibit a · the seal', 'exhibit b · the archive', 'exhibit c · the quiet'][belief]}
      </div>
      <AnimatePresence mode="wait">
        {belief === 0 && (
          <motion.div key="seal" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
            <div className="ruled pb-4 mb-5">
              <p className="font-display text-xl text-ink leading-[30px]">
                Therapy notes, salary numbers, the half-written resignation letter.
              </p>
            </div>
            <motion.span
              initial={{ opacity: 0, scale: 2.2, rotate: 8 }} animate={{ opacity: 1, scale: 1, rotate: -3 }}
              transition={{ delay: 0.5, type: 'spring', stiffness: 300, damping: 15 }}
              className="stamp !border-[var(--accent)] !text-[var(--accent)] inline-block mb-6"
            >
              Sealed
            </motion.span>
            {[['network requests', '0'], ['analytics events', '0'], ['people who can read this', '1']].map(([k, v], i) => (
              <motion.div
                key={k} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.8 + i * 0.25 }}
                className="flex justify-between py-1.5 border-b border-dotted border-[var(--ink-line)] last:border-0"
              >
                <span className="font-label text-[9px] text-ink-soft">{k}</span>
                <span className="font-mono text-xs text-ink tabular-nums">{v}</span>
              </motion.div>
            ))}
          </motion.div>
        )}
        {belief === 1 && (
          <motion.div key="archive" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
            <div className="space-y-2 mb-6">
              {[
                ['a beloved notes app', '2008 · 2021'],
                ['a bookmarks startup', '2012 · 2017'],
                ['that wiki you invested in', '2016 · 2023'],
              ].map(([name, years], i) => (
                <motion.div
                  key={name} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 0.55, x: 0 }} transition={{ delay: 0.2 + i * 0.25 }}
                  className="flex items-baseline justify-between border border-[var(--ink-line)] rounded-t-xl rounded-b-sm px-4 py-2.5"
                >
                  <span className="font-display italic text-ink-soft">{name}</span>
                  <span className="font-label text-[8px] text-ink-faint">{years} · took the notes with it</span>
                </motion.div>
              ))}
            </div>
            <motion.div
              initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 1.1 }}
              className="card-ink-static rounded-sm px-4 py-3 rotate-[-0.5deg]"
            >
              <p className="font-mono text-sm text-ink">supermind-backup.json</p>
              <p className="font-label text-[8px] text-ink-faint mt-1">
                one click · plain text · readable in any editor, in any decade
              </p>
            </motion.div>
          </motion.div>
        )}
        {belief === 2 && (
          <motion.div key="quiet" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
            <div className="space-y-2 mb-8">
              {['🔔 14 unread notifications', 'Your streak is about to expire!', 'Someone mentioned you'].map((t, i) => (
                <motion.div
                  key={t}
                  initial={{ opacity: 0.7 }}
                  animate={{ opacity: 0.16, x: i % 2 ? 6 : -4 }}
                  transition={{ delay: 0.5 + i * 0.3, duration: 0.8 }}
                  className="border border-[var(--ink-line)] rounded-sm px-4 py-2 text-sm text-ink-soft line-through decoration-[var(--ink-line)]"
                >
                  {t}
                </motion.div>
              ))}
            </div>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.6 }} className="ruled">
              <p className="font-display italic text-xl text-ink leading-[30px]">
                Today you wrote one good thought. That was the whole event.
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function Beliefs() {
  const [belief, setBelief] = React.useState(0);
  const onActive = React.useCallback((i: number) => setBelief(i), []);
  return (
    <section className="border-y-[1.5px] border-ink bg-paper-raised">
      <div className="max-w-6xl mx-auto px-6 py-24">
        <div className="text-center mb-2">
          <p className="font-label text-[10px] text-accent mb-3">[ what we believe ]</p>
          <h2 className="font-display text-4xl md:text-6xl tracking-tight text-ink">
            Three beliefs, <em className="marker-accent">set in ink</em>.
          </h2>
        </div>
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20">
          <div>
            <Belief index={0} kicker="belief one" title="Private by default." onActive={onActive}>
              <p>
                Thinking needs a door that closes. Every note is processed on this
                device, and encryption seals the archive with a key only you hold.
                Privacy here is not a settings toggle or a policy page. It is the
                architecture.
              </p>
            </Belief>
            <Belief index={1} kicker="belief two" title="Yours forever." onActive={onActive}>
              <p>
                Apps die and take their exports with them. Your entire supermind is
                one readable JSON file, one click away, openable in any text editor
                in any decade. A notebook should outlive the company that printed it.
              </p>
            </Belief>
            <Belief index={2} kicker="belief three" title="Calm on purpose." onActive={onActive}>
              <p>
                No feed, no streak guilt, no red dots begging to be tapped. Paper
                never interrupted anyone. The most advanced feature here is how
                quiet it is.
              </p>
            </Belief>
          </div>
          <div className="hidden lg:block">
            <div className="sticky top-24 pt-16">
              <BeliefDemo belief={belief} />
            </div>
          </div>
        </div>
        <div className="lg:hidden mt-6">
          <BeliefDemo belief={belief} />
        </div>
      </div>
    </section>
  );
}

/* ---------- page ---------- */

export default function LandingPage({ onGetStarted, onAbout }: LandingPageProps) {
  const { scrollY, scrollYProgress } = useScroll();
  const collageY = useTransform(scrollY, [0, 700], [0, -60]);

  // ⌘K works right here on the landing page — it takes you into the notebook.
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        onGetStarted();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onGetStarted]);

  const chapters = [
    {
      num: '01',
      title: 'Capture without friction',
      body: 'Notes, links, images, files. One keystroke to save, zero forms to fill. Your thought lands on paper before it evaporates.',
      icon: PenLine,
      demo: (
        <div className="card-ink-static rounded-sm p-5 rotate-[-1deg]">
          <div className="font-label text-[10px] text-ink-faint mb-3">quick capture</div>
          <p className="font-display text-2xl text-ink leading-snug mb-4">
            "The best interface is the one you forget is there."
          </p>
          <div className="flex items-center justify-between">
            <div className="flex gap-2">
              {['#design', '#quotes'].map(t => (
                <span key={t} className="font-label text-[10px] text-accent">{t}</span>
              ))}
            </div>
            <span className="font-label text-[10px] text-ink-faint">auto-filed · 0.2s</span>
          </div>
        </div>
      ),
    },
    {
      num: '02',
      title: 'It files itself',
      body: 'Tags, summaries, categories, reminders. All of it extracted on your device the instant you save, by a librarian that lives inside the notebook.',
      icon: Search,
      demo: (
        <div className="card-ink-static rounded-sm p-5 rotate-[1deg]">
          <div className="font-label text-[10px] text-ink-faint mb-3">on-device organizer</div>
          {[
            ['reads your note', 'done'],
            ['writes 4 tags', 'done'],
            ['files under health', 'done'],
            ['sets friday reminder', 'done'],
          ].map(([label, state], ri) => (
            <div key={label} className="flex items-center justify-between py-1.5 border-b border-[var(--ink-line)] last:border-0">
              <span className="text-ink text-sm">{label}</span>
              <motion.span
                initial={{ opacity: 0, scale: 1.9, rotate: -10 }}
                whileInView={{ opacity: 1, scale: 1, rotate: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.5 + ri * 0.35, type: 'spring', stiffness: 300, damping: 14 }}
                className="font-label text-[9px] text-accent"
              >
                {state}
              </motion.span>
            </div>
          ))}
        </div>
      ),
    },
    {
      num: '03',
      title: 'Watch ideas find each other',
      body: 'A living graph of your tags, drawn from what you actually save. Hover a node and its connections light up. Click and dive in.',
      icon: Network,
      demo: (
        <div className="card-ink-static rounded-sm p-5 rotate-[-1deg] relative overflow-hidden">
          <div className="font-label text-[10px] text-ink-faint mb-3">knowledge graph</div>
          <svg viewBox="0 0 280 130" className="w-full">
            {[
              'M50 70 Q 100 30 150 55',
              'M150 55 Q 200 80 235 45',
              'M50 70 Q 110 105 190 95',
              'M150 55 Q 165 80 190 95',
            ].map((d, pi) => (
              <motion.path
                key={d}
                d={d}
                fill="none"
                stroke="var(--ink-line)"
                strokeWidth="1.2"
                initial={{ pathLength: 0 }}
                whileInView={{ pathLength: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.3 + pi * 0.2, duration: 0.7, ease: 'easeOut' }}
              />
            ))}
            {[
              { x: 50, y: 70, r: 13, label: 'design' },
              { x: 150, y: 55, r: 17, label: 'ideas' },
              { x: 235, y: 45, r: 10, label: 'reading' },
              { x: 190, y: 95, r: 11, label: 'work' },
            ].map((n, ni) => (
              <motion.g
                key={n.label}
                initial={{ opacity: 0, scale: 0 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: 0.35 + ni * 0.2, type: 'spring', stiffness: 260, damping: 13 }}
                style={{ transformOrigin: `${n.x}px ${n.y}px` }}
              >
                <circle cx={n.x} cy={n.y} r={n.r} fill="var(--accent)" opacity="0.9" />
                <circle cx={n.x} cy={n.y} r={n.r} fill="none" stroke="var(--ink)" strokeWidth="1.5" />
                <text x={n.x} y={n.y - n.r - 6} textAnchor="middle" fontSize="10" fontFamily="JetBrains Mono" fill="var(--ink-soft)">
                  {n.label}
                </text>
              </motion.g>
            ))}
          </svg>
        </div>
      ),
    },
    {
      num: '04',
      title: 'Sealed, if you want it sealed',
      body: 'AES-256 encryption at rest with a passphrase only you know. It locks itself when you step away. No server ever sees a byte, because there is no server.',
      icon: Lock,
      demo: (
        <div className="card-ink-static rounded-sm p-5 rotate-[1deg]">
          <div className="flex items-start justify-between mb-4">
            <div className="font-label text-[10px] text-ink-faint">vault status</div>
            <motion.span
              initial={{ opacity: 0, scale: 2.4, rotate: 8 }}
              whileInView={{ opacity: 1, scale: 1, rotate: -2 }}
              viewport={{ once: true }}
              transition={{ delay: 0.55, type: 'spring', stiffness: 320, damping: 15 }}
              className="stamp text-[10px] text-accent"
            >
              sealed
            </motion.span>
          </div>
          <div className="font-label text-xs text-ink-soft space-y-2">
            <div>cipher ......... AES-256-GCM</div>
            <div>key ............ passphrase-derived</div>
            <div>server ......... none. ever.</div>
            <div>auto-lock ...... 15 min idle</div>
          </div>
        </div>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-paper text-ink relative overflow-x-hidden noise">
      {/* Reading progress: an ink rule drawing itself across the top */}
      <motion.div
        aria-hidden
        style={{ scaleX: scrollYProgress }}
        className="fixed top-0 left-0 right-0 h-[3px] bg-accent origin-left z-50"
      />

      {/* Nav */}
      <motion.header
        initial={{ opacity: 0, y: -12 }}
        animate={{ opacity: 1, y: 0 }}
        className="sticky top-0 z-50 bg-paper/90 backdrop-blur-md border-b-[1.5px] border-ink"
      >
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-baseline gap-1 group cursor-default">
            <span className="font-display text-3xl tracking-tight">supermind</span>
            <span className="w-2 h-2 rounded-full bg-accent inline-block transition-transform duration-300 group-hover:scale-[1.6]" />
          </div>
          <div className="flex items-center gap-6">
            <button onClick={onAbout} className="font-label text-xs text-ink-soft hover:text-ink transition-colors">
              About
            </button>
            <button
              onClick={onGetStarted}
              className="btn-ink haptic font-label text-xs px-5 py-2.5 rounded-sm"
            >
              Get Started →
            </button>
          </div>
        </div>
      </motion.header>

      {/* Hero */}
      <section className="relative dot-grid">
        <div className="max-w-6xl mx-auto px-6 pt-20 pb-28 grid lg:grid-cols-[1.1fr_1fr] gap-16 items-center">
          <div>
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              className="font-label text-[11px] text-accent mb-8"
            >
              [ a local-first second brain ]
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.08 }}
              className="font-display text-6xl md:text-[5.5rem] leading-[0.98] tracking-tight mb-8"
            >
              A mind that
              <br />
              <em className="marker marker-sweep">never forgets<span className="text-accent">.</span></em>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.16 }}
              className="text-lg text-ink-soft max-w-md leading-relaxed mb-10"
            >
              Every note, link, and stray thought lands in one keystroke, gets filed by
              an organizer that lives on your device, and turns up the moment you need it.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.24 }}
              className="flex items-center gap-5"
            >
              <button
                onClick={onGetStarted}
                className="btn-ink haptic px-8 py-4 rounded-sm font-semibold text-base inline-flex items-center gap-3"
              >
                Open your notebook
                <ArrowRight size={18} />
              </button>
              <div className="font-label text-[10px] text-ink-faint leading-relaxed">
                no account<br />no server<br />no catch
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="mt-12"
            >
              <MadeBadge />
            </motion.div>
          </div>

          {/* Card collage */}
          <motion.div style={{ y: collageY }} className="relative h-[460px] hidden lg:block">
            <IndexCard rotate={-4} delay={0.3} className="top-2 left-2 w-64 z-10">
              <Tape className="-top-3 left-16 rotate-[-4deg]" />
              <div className="font-label text-[10px] text-ink-faint mb-2">note · 09:41</div>
              <p className="font-display text-xl leading-snug">
                Call nonna about the pasta recipe, the one with the burnt butter.
              </p>
              <div className="flex gap-2 mt-3">
                <span className="font-label text-[10px] text-accent">#family</span>
                <span className="font-label text-[10px] text-accent">#recipes</span>
              </div>
            </IndexCard>

            <IndexCard rotate={3} delay={0.45} className="top-24 right-0 w-60 z-20">
              <div className="font-label text-[10px] text-ink-faint mb-2 flex items-center gap-1">
                <LinkIcon size={10} /> link · saved
              </div>
              <p className="text-sm text-ink leading-relaxed">
                "How spaced repetition rewires long-term memory" · 12 min read
              </p>
              <div className="mt-3 pt-3 border-t border-[var(--ink-line)] flex justify-between items-center">
                <span className="font-label text-[10px] text-accent">#learning</span>
                <span className="font-label text-[9px] text-ink-faint">reminder: sun</span>
              </div>
            </IndexCard>

            <IndexCard rotate={-2} delay={0.6} className="bottom-16 left-10 w-72 z-30">
              <Tape className="-top-3 right-10 rotate-[3deg]" />
              <div className="flex items-center justify-between mb-3">
                <div className="font-label text-[10px] text-ink-faint">memory lane</div>
                <History size={12} className="text-accent" />
              </div>
              <p className="font-display text-lg leading-snug mb-2">
                One month ago you wrote:
              </p>
              <p className="text-sm text-ink-soft italic">
                "Start the studio. Stop waiting for permission."
              </p>
            </IndexCard>

            <IndexCard rotate={5} delay={0.75} className="bottom-2 right-8 w-44 z-10">
              <div className="stamp text-[10px] text-accent inline-block mb-3">encrypted</div>
              <div className="font-label text-[10px] text-ink-soft leading-relaxed">
                aes-256-gcm<br />
                key: yours only<br />
                server: none
              </div>
            </IndexCard>
          </motion.div>
        </div>

        <div className="max-w-6xl mx-auto px-6 pb-10 flex justify-center lg:justify-start">
          <motion.div
            animate={{ y: [0, 6, 0] }}
            transition={{ duration: 1.8, repeat: Infinity }}
            className="font-label text-[10px] text-ink-faint flex items-center gap-2"
          >
            <ArrowDown size={12} /> scroll
          </motion.div>
        </div>
      </section>

      {/* Marquee */}
      <div className="marquee-hover border-y-[1.5px] border-ink bg-accent overflow-hidden py-3 select-none" aria-hidden>
        <div className="animate-marquee flex whitespace-nowrap w-max">
          {[0, 1].map(half => (
            <div key={half} className="flex">
              {[...MARQUEE_WORDS, ...MARQUEE_WORDS].map((word, i) => (
                <span key={`${half}-${i}`} className="font-label text-sm text-paper mx-6 flex items-center gap-6">
                  {word} <span className="w-1.5 h-1.5 rounded-full bg-paper inline-block" />
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* The vision, revealed as you read */}
      <VisionManifesto />

      {/* Chapters */}
      <section className="max-w-6xl mx-auto px-6 py-28 space-y-28">
        {chapters.map((chapter, i) => (
          <motion.div
            key={chapter.num}
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
            className={`grid lg:grid-cols-2 gap-14 items-center ${i % 2 ? 'lg:[&>*:first-child]:order-2' : ''}`}
          >
            <div>
              <div className="flex items-baseline gap-4 mb-6">
                <span className="font-display text-7xl text-accent leading-none">{chapter.num}</span>
                <chapter.icon size={20} className="text-ink-faint" />
              </div>
              <h2 className="font-display text-4xl md:text-5xl leading-tight tracking-tight mb-5">
                {chapter.title}
              </h2>
              <p className="text-ink-soft text-lg leading-relaxed max-w-md">{chapter.body}</p>
            </div>
            <div className="max-w-sm mx-auto w-full">{chapter.demo}</div>
          </motion.div>
        ))}
      </section>

      {/* Three beliefs */}
      <Beliefs />

      {/* Command strip */}
      <section className="border-y-[1.5px] border-ink bg-paper-raised">
        <div className="max-w-6xl mx-auto px-6 py-16 flex flex-col md:flex-row items-center justify-between gap-8">
          <div>
            <h3 className="font-display text-3xl md:text-4xl tracking-tight mb-2">
              The whole notebook, <em className="marker-accent">one keystroke away</em>
            </h3>
            <p className="text-ink-soft">Search every thought. Jump anywhere. Run any action.</p>
          </div>
          <button
            onClick={onGetStarted}
            title="Try it, or just press ⌘K"
            className="cmd-strip card-ink haptic rounded-sm px-6 py-4 flex items-center gap-4 rotate-[-1deg] cursor-pointer text-left min-w-[320px] group"
          >
            <span className="keycap text-xs">
              <Command size={12} /> K
            </span>
            <span className="w-px h-6 bg-[var(--ink-line)]" />
            <TypedQuery />
            <ArrowRight size={14} className="ml-auto text-ink-faint opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-200" />
          </button>
        </div>
      </section>

      {/* Manifesto */}
      <section className="max-w-4xl mx-auto px-6 py-32 text-center ruled">
        <motion.p
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="font-label text-[11px] text-accent mb-10"
        >
          [ the principle ]
        </motion.p>
        <motion.blockquote
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="font-display text-4xl md:text-6xl leading-[1.12] tracking-tight"
        >
          Your thoughts belong <em className="marker">on your device</em>,
          <br />
          not on someone's{' '}
          <span className="relative inline-block">
            server
            <motion.span
              aria-hidden
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5, duration: 0.45, ease: [0.4, 0, 0.2, 1] }}
              className="absolute left-[-2%] right-[-2%] top-[52%] h-[0.09em] bg-accent origin-left rounded-full"
            />
          </span>.
        </motion.blockquote>
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: 0.3 }}
          className="mt-12 flex items-center justify-center gap-8 font-label text-[10px] text-ink-faint"
        >
          <span className="flex items-center gap-1.5"><HardDrive size={11} /> local-first</span>
          <span className="flex items-center gap-1.5"><Lock size={11} /> aes-256 optional</span>
          <span>0 bytes uploaded</span>
        </motion.div>
      </section>

      {/* Final CTA */}
      <section className="max-w-6xl mx-auto px-6 pb-32">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="card-ink-static rounded-sm px-8 py-16 md:px-16 text-center relative overflow-hidden"
        >
          <div className="absolute inset-0 dot-grid opacity-60" aria-hidden />
          <div className="relative">
            <h2 className="font-display text-5xl md:text-7xl tracking-tight leading-[1.02] mb-6">
              Begin your
              <br />
              <em className="marker">second brain.</em>
            </h2>
            <p className="text-ink-soft text-lg mb-10">
              Thirty seconds. A name. That's the whole sign-up.
            </p>
            <button
              onClick={onGetStarted}
              className="btn-ink haptic px-10 py-4 rounded-sm font-semibold text-lg inline-flex items-center gap-3"
            >
              Open your notebook <ArrowRight size={19} />
            </button>
          </div>
        </motion.div>
      </section>

      {/* Colophon footer */}
      <footer className="border-t-[1.5px] border-ink">
        <div className="max-w-6xl mx-auto px-6 py-10 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex flex-col items-center md:items-start gap-3">
            <div className="flex items-baseline gap-1">
              <span className="font-display text-xl">supermind</span>
              <span className="w-1.5 h-1.5 rounded-full bg-accent inline-block" />
            </div>
            <MadeBadge />
          </div>
          <div className="font-label text-[10px] text-ink-faint text-center md:text-right leading-relaxed">
            set in instrument serif & jetbrains mono · runs entirely on your device
            <br />
            © {new Date().getFullYear()} · no accounts were created in the making of this app.{' '}
            <button onClick={onAbout} className="underline hover:text-ink transition-colors">about</button>
          </div>
        </div>
      </footer>
    </div>
  );
}
